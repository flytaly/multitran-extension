import browser from 'webextension-polyfill';
import { defaultSizes, langIds } from './constants.js';
/**
 * @typedef {import("./options/shortcuts.js").ShortcutKeys} ShortcutKeys
 *
 * @typedef {Object} Options
 * @property {[string, string][]} [pairs] - additional translation pairs
 * @property {number} [currentPair] - selected language pair index
 * @property {string} [multitranLang] - multitran interface language
 * @property {number} [fontSize] - base font size
 * @property {number} [width] - popup max width
 * @property {number} [height] - popup max height
 * @property {boolean} [doubleClick] - double click to show translation
 * @property {boolean} [select] - select text to translate
 * @property {boolean} [withKey] - translate selected text only if key is pressed
 * @property {boolean} [contextMenuItem] - add item to the context menu
 * @property {boolean} [fetchAudio]
 * @property {boolean} [allPairs] - enable all languages
 * @property {'auto'|'light'|'dark'} [theme]
 * @property {ShortcutKeys} [keys] - keys that should be pressed to show selected text translation
 */

export const storage = {
    /** @param {Options} options */
    async saveOptions(options = {}) {
        const prevOptions = await this.getOptions();
        await browser.storage.local.set({
            options: {
                ...prevOptions,
                ...options,
            },
        });
    },

    /** @param {ShortcutKeys} keys */
    async saveKeys(keys = {}) {
        const prevOptions = await this.getOptions();
        const newKeys = {
            ...prevOptions.keys,
            ...keys,
        };

        let withKey = true;
        if (Object.keys(newKeys).every((key) => !newKeys[key])) {
            withKey = false;
        }

        await browser.storage.local.set({
            options: {
                ...prevOptions,
                withKey,
                keys: newKeys,
            },
        });
    },

    /** @returns {Promise<Options>} options */
    async getOptions() {
        /** @type {{options: Options}} */
        const { options = {} } = await browser.storage.local.get('options');
        if (!options.pairs?.length) options.pairs = [[langIds.English, langIds.Russian]];
        options.currentPair ??= 0;
        options.multitranLang ??= langIds.English;
        options.doubleClick ??= false;
        options.select ??= true;
        options.withKey ??= true;
        options.fetchAudio ??= true;
        options.contextMenuItem ??= true;
        options.theme ||= 'auto';
        options.fontSize ||= defaultSizes.fontSize;
        options.width ||= defaultSizes.width;
        options.height ||= defaultSizes.height;
        options.keys ||= {
            altKey: false,
            ctrlKey: false,
            metaKey: false,
            shiftKey: false,
            additionalKey: 'F2',
        };
        options.allPairs ??= false;
        return options;
    },

    async migrateToV2() {
        const { options = {} } = await browser.storage.local.get('options');
        const l1 = options.l1 || langIds.English;
        const l2 = options.l2 || langIds.Russian;
        options.pairs = [[l1, l2]];
        await browser.storage.local.set({ options });
    },
};
