/**
 * Formats a phone number string to '+1 (XXX) XXX-XXXX'
 * Defaults to '+1' if international code is missing.
 * @param {string} phone
 * @returns {string}
 */
export function formatPhoneNumber(phone) {
    if (!phone) return '';

    // Remove all non-digit characters except +
    let cleaned = phone.replace(/[^\d+]/g, '');

    if (!cleaned) return '';

    // If it doesn't start with +, assume it needs +1
    if (!cleaned.startsWith('+')) {
        if (cleaned.length === 11 && cleaned.startsWith('1')) {
            cleaned = '+' + cleaned;
        } else if (cleaned.length === 10) {
            cleaned = '+1' + cleaned;
        } else {
            // Prepend +1 if it looks like just local digits
            cleaned = '+1' + cleaned;
        }
    }

    // Format if it matches the US/Canada pattern
    const match = cleaned.match(/^\+1(\d{3})(\d{3})(\d{4})$/);
    if (match) {
        return `+1 (${match[1]}) ${match[2]}-${match[3]}`;
    }

    // Return cleaned with + if it's some other international format
    return cleaned;
}
