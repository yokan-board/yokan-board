import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import authService from '../services/authService';
import userService from '../services/userService';
import { useNavigate } from 'react-router-dom';
import { setLogoutCallback } from '../utils/authUtils'; // Import setLogoutCallback
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const lastActivity = useRef(Date.now());
    const events = useMemo(() => ['mousemove', 'keydown', 'click', 'scroll'], []);

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
        navigate('/login');
    }, [navigate]);

    useEffect(() => {
        const updateLastActivity = () => {
            lastActivity.current = Date.now();
        };
        events.forEach((event) => window.addEventListener(event, updateLastActivity));

        const interval = setInterval(() => {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user || !user.token) return;

            const isInactive = Date.now() - lastActivity.current > 10 * 60 * 1000; // 10 minutes
            if (isInactive) {
                return;
            }

            const tokenExpiration = jwtDecode(user.token).exp * 1000;
            const timeToExpiry = tokenExpiration - Date.now();
            const refreshThreshold = 5 * 60 * 1000; // 5 minutes

            if (timeToExpiry < refreshThreshold) {
                authService
                    .refreshToken()
                    .then((newUserData) => {
                        setUser(newUserData);
                    })
                    .catch((err) => {
                        logout();
                    });
            }
        }, 60 * 1000); // Check every minute

        return () => {
            events.forEach((event) => window.removeEventListener(event, updateLastActivity));
            clearInterval(interval);
        };
    }, [events, logout]);

    const login = async (username, password) => {
        try {
            // Step 1: Initial login to get the token. This also sets an incomplete user object
            // in localStorage, which is necessary for the subsequent API call to be authenticated.
            const loginResponse = await authService.login(username, password);
            if (loginResponse.message !== 'success') {
                return { success: false, error: loginResponse.error };
            }

            // Step 2: Immediately fetch the full user profile to get all fields.
            const profile = await userService.getUserProfile();

            // Step 3: Combine the full profile with the token from the initial login.
            const userToSet = { ...profile, token: loginResponse.token };

            // Step 4: Set state and overwrite localStorage with the complete user object.
            setUser(userToSet);
            localStorage.setItem('user', JSON.stringify(userToSet));

            navigate('/dashboard');
            return { success: true };
        } catch (error) {
            // Clean up localStorage if any part of the process fails after the initial login
            authService.logout();
            return { success: false, error: error.response?.data?.error || 'Login failed' };
        }
    };

    const signup = async (username, password, email) => {
        try {
            const response = await authService.signup(username, password, email);
            if (response.message === 'success') {
                // Optionally log in the user immediately after signup
                // await login(username, password);
                navigate('/login'); // Redirect to login page after successful signup
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
