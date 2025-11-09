import api from './api'; // Import the shared api instance

const signup = async (username, password, email) => {
    const response = await api.post('/signup', { username, password, email });
    return response.data;
};

const login = async (username, password) => {
    const response = await api.post('/login', { username, password });
    if (response.data.message === 'success') {
        // Store user data AND the token
        const userData = { ...response.data.data, token: response.data.token };
        localStorage.setItem('user', JSON.stringify(userData));
    }
    return response.data;
};

const refreshToken = async () => {
    const response = await api.post('/refresh-token');
    if (response.data.message === 'success') {
        const user = JSON.parse(localStorage.getItem('user'));
        const newUser = { ...user, token: response.data.token };
        localStorage.setItem('user', JSON.stringify(newUser));
        return newUser;
    }
    return response.data;
};

const logout = () => {
    localStorage.removeItem('user');
};

const authService = {
    signup,
    login,
    logout,
    refreshToken,
};

export default authService;
