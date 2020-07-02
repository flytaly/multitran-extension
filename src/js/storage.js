import { langIds } from './configs.js';

/**
 * @typedef {Object} Options
 * @property {string} l1 - "from" language
 * @property {string} l2 - "to" language
 * @property {string} multitranLang - multitran interface language
 */

export const storage = {
    /**
     * @param {Options} options
     */
    async saveOptions(options) {
        const prevOptions = await this.getOptions();
        await browser.storage.local.set({
            options: {
                ...prevOptions,
                ...options,
            },
        });
    },

    /**
     * @returns {Promise<Options>} options
     */
    async getOptions() {
        const { options = {} } = await browser.storage.local.get('options');
        if (!options.l1) options.l1 = langIds.English;
        if (!options.l2) options.l2 = langIds.Russian;
        if (!options.multitranLang) options.multitranLang = langIds.English;
        return options;
    },
};
