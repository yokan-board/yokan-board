import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import authService from '../services/authService';
import userService from '../services/userService';
import { setLogoutCallback, triggerLogout } from '../utils/authUtils'; // Import setLogoutCallback and triggerLogout
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const lastActivity = useRef(Date.now());
    const events = useMemo(() => ['mousemove', 'keydown', 'click', 'scroll', 'mousedown', 'touchstart', 'wheel'], []);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
        }
        setLoading(false);
    }, []);

    const logout = useCallback(() => {
        authService.logout();
        setUser(null);
    }, []);

    useEffect(() => {
        const updateLastActivity = () => {
            const now = Date.now();
            lastActivity.current = now;
            localStorage.setItem('lastActivity', now.toString());
        };
        // Attach event listeners to window in the capturing phase
        events.forEach((event) => window.addEventListener(event, updateLastActivity, true));

        const interval = setInterval(() => {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user || !user.token) {
                return;
            }

            const now = Date.now();
            const storedLastActivity = parseInt(localStorage.getItem('lastActivity') || '0');
            const effectiveLastActivity = Math.max(lastActivity.current, storedLastActivity);
            
            const timeSinceLastActivity = now - effectiveLastActivity;
            const isInactive = timeSinceLastActivity > 30 * 60 * 1000; // 30 minutes

            if (isInactive) {
                triggerLogout(); // Use triggerLogout for proper navigation and message
                return;
            }

            const tokenExpiration = jwtDecode(user.token).exp * 1000;
            const timeToExpiry = tokenExpiration - now;
            const refreshThreshold = 5 * 60 * 1000; // 5 minutes

            if (timeToExpiry < refreshThreshold) {
                authService
                    .refreshToken()
                    .then((newUserData) => {
                        setUser(newUserData);
                    })
                    .catch((err) => {
                        logout(); // Logout if refresh token fails
                    });
            }
        }, 60 * 1000); // Check every minute

        return () => {
            // Clean up event listeners from window, also in the capturing phase
            events.forEach((event) => window.removeEventListener(event, updateLastActivity, true));
            clearInterval(interval);
        };
    }, [events, logout]);

    const login = async (username, password) => {
        try {
            const loginResponse = await authService.login(username, password);
            if (loginResponse.message !== 'success') {
                return { success: false, error: loginResponse.error };
            }

            const profile = await userService.getUserProfile();
            const userToSet = { ...profile, token: loginResponse.token };
            setUser(userToSet);
            localStorage.setItem('user', JSON.stringify(userToSet));
            
            // Reset inactivity timer on login
            const now = Date.now();
            lastActivity.current = now;
            localStorage.setItem('lastActivity', now.toString());

            return { success: true };
        } catch (error) {
            authService.logout();
            return { success: false, error: error.response?.data?.error || 'Login failed' };
        }
    };

    const signup = async (username, password, email) => {
        try {
            const response = await authService.signup(username, password, email);
            if (response.message === 'success') {
                return { success: true };
            } else {
                return { success: false, error: response.error };
            }
        } catch (error) {
            return { success: false, error: error.response?.data?.error || 'Signup failed' };
        }
    };

    const updateUser = useCallback((newUserData) => {
        setUser((currentUser) => {
            const updatedUser = { ...currentUser, ...newUserData };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            return updatedUser;
        });
    }, []);

    useEffect(() => {
        // Set the logout callback for the axios interceptor
        setLogoutCallback(logout);
    }, [logout]);

    const value = {
        user,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        loading,
        updateUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
