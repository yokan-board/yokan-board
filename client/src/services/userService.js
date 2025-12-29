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

const getUsers = async () => {
    const response = await api.get('/users');
    return response.data;
};

const updateUserEnabledStatus = async (userId, enabled) => {
    const response = await api.put(`/users/${userId}/enabled`, { enabled });
    return response.data;
};

const updateUserByAdmin = async (userId, userData) => {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
};

const resetUserPasswordByAdmin = async (userId, password) => {
    const response = await api.put(`/users/${userId}/password`, { password });
    return response.data;
};

const userService = {
    getUserProfile,
    updateUserProfile,
    updatePassword,
    getPreferences,
    updatePreferences,
    getUsers,
    updateUserEnabledStatus,
    updateUserByAdmin,
    resetUserPasswordByAdmin,
};

export default userService;
