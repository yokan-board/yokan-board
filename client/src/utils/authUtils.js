let logoutCallback = null;

export const setLogoutCallback = (callback) => {
    logoutCallback = callback;
};

export const triggerLogout = () => {
    if (logoutCallback) {
        logoutCallback();
    }
};
