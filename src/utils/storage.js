import { Preferences } from '@capacitor/preferences';

export const StorageService = {
    /**
     * Get a value from storage
     * @param {string} key 
     * @returns {Promise<any>} Parsed JSON or raw string/null
     */
    async get(key) {
        const { value } = await Preferences.get({ key });
        if (value === null) return null;
        try {
            return JSON.parse(value);
        } catch (e) {
            return value;
        }
    },

    /**
     * Set a value in storage
     * @param {string} key 
     * @param {any} value 
     */
    async set(key, value) {
        const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
        await Preferences.set({ key, value: stringValue });
    },

    /**
     * Remove a value from storage
     * @param {string} key 
     */
    async remove(key) {
        await Preferences.remove({ key });
    },

    /**
     * Clear all keys
     */
    async clear() {
        await Preferences.clear();
    }
};
