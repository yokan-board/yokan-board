import md5 from 'md5';

/**
 * Generates a Gravatar URL for a given email address.
 * @param {string} email - The email address to generate the Gravatar for.
 * @param {number} size - The size of the Gravatar image (default: 40).
 * @param {string} defaultImage - The default image to use if no Gravatar is found (default: 'retro').
 * @returns {string} The Gravatar URL.
 */
export const getGravatarUrl = (email, size = 40, defaultImage = 'retro') => {
    if (!email) {
        return `https://www.gravatar.com/avatar/?s=${size}&d=${defaultImage}`;
    }
    const hash = md5(email.trim().toLowerCase());
    return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=${defaultImage}`;
};