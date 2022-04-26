/* eslint-disable no-param-reassign */
import browser from 'webextension-polyfill';
import { defaultSizes, langIds } from './constants.js';
/**
 * @typedef {import("./options/shortcuts.js").ShortcutKeys} ShortcutKeys
 *
 * @typedef {Object} Options
 * @property {string} [l1] - "from" language
 * @property {string} [l2] - "to" language
 * @property {string} [multitranLang] - multitran interface language
 * @property {number} [fontSize] - base font size
 * @property {number} [width] - popup max width
 * @property {number} [height] - popup max height
 * @property {boolean} [doubleClick] - double click to show translation
 * @property {boolean} [select] - select text to translate
 * @property {boolean} [withKey] - translate selected text only if key is pressed
 * @property {boolean} [contextMenuItem] - add item to the context menu
 * @property {boolean} [fetchAudio]
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
        if (!options.l1) options.l1 = langIds.English;
        if (!options.l2) options.l2 = langIds.Russian;
        if (!options.multitranLang) options.multitranLang = langIds.English;
        if (options.doubleClick === undefined) options.doubleClick = true;
        if (options.select === undefined) options.select = true;
        if (options.withKey === undefined) options.withKey = true;
        if (options.fetchAudio === undefined) options.fetchAudio = true;
        if (options.contextMenuItem === undefined) options.contextMenuItem = true;
        if (!options.fontSize) options.fontSize = defaultSizes.fontSize;
        if (!options.width) options.width = defaultSizes.width;
        if (!options.height) options.height = defaultSizes.height;
        if (!options.keys)
            options.keys = {
                altKey: false,
                ctrlKey: true,
                metaKey: false,
                shiftKey: false,
                additionalKey: null,
            };
        return options;
    },
};
