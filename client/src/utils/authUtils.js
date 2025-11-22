let logoutCallback = null;
let navigateRef = null;

export const setLogoutCallback = (callback) => {
    logoutCallback = callback;
};

export const setNavigateFunction = (navigateFunc) => {
    navigateRef = navigateFunc;
};

export const triggerLogout = () => {
    if (logoutCallback) {
        logoutCallback(); // Clear local user state
    }
    if (navigateRef) {
        navigateRef('/login', { state: { fromInactivity: true } }); // Redirect to login
    }
};
