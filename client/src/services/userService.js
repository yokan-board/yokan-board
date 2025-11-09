import api from './api';

const getUserProfile = async () => {
    const response = await api.get('/user/profile');
    return response.data;
};

const updateUserProfile = async (profileData) => {
    const response = await api.put('/user/profile', profileData);
    return response.data;
};

const updatePassword = async (passwordData) => {
    const response = await api.put('/user/password', passwordData);
    return response.data;
};

const getPreferences = async () => {
    const response = await api.get('/user/preferences');
    return response.data;
};

const updatePreferences = async (preferencesData) => {
    const response = await api.put('/user/preferences', preferencesData);
    return response.data;
};

const userService = {
    getUserProfile,
    updateUserProfile,
    updatePassword,
    getPreferences,
    updatePreferences,
};

export default userService;
