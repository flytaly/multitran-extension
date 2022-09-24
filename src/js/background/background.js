import browser from 'webextension-polyfill';
import { composeURL, fetchPage } from '../translate-engine/multitran.js';
import { storage } from '../storage.js';
import { getAudioUrls } from '../translate-engine/wiktionary-voice.js';
import { addToContextMenu, contextMenuClickHandler } from '../context-menu.js';
import { IS_DEV } from '../constants.js';

/** @arg {import('webextension-polyfill').Runtime.OnInstalledDetailsType} details */
const onInstalled = (details) => {
    if (details.reason === 'update' && parseInt(details.previousVersion || '1', 10) < 2) {
        storage.migrateToV2();
    }

    storage.getOptions().then(({ contextMenuItem }) => {
        if (contextMenuItem) addToContextMenu();
    });
};

/**
 * @typedef {Object} MT_DATA_RESPONSE
 * @property {'MULTITRAN_DATA'} type
 * @property {string} translationPage
 * @property {string} text
 * @property {string} l1,
 * @property {string} l2,
 *
 *
 * @typedef {Object} PRONUNCIATION_RESPONSE
 * @property {'PRONUNCIATION_LIST'} type
 * @property {object} audio
 */

async function handleMessage(request) {
    if (request?.type === 'GET_MULTITRAN_DATA') {
        const { selection } = request;
        if (selection) {
            const { pairs, multitranLang } = await storage.getOptions();
            const [l1, l2] = pairs[0];
            const { error, textData } = await fetchPage(composeURL(selection, l1, l2, multitranLang));
            if (error) console.error(error);
            if (!textData) return;

            /** @type {MT_DATA_RESPONSE} */
            const response = { type: 'MULTITRAN_DATA', translationPage: textData, text: selection, l1, l2 };
            return response;
        }
    }

    if (request.type === 'GET_PRONUNCIATION') {
        const audio = await getAudioUrls(request.word, request.lang);

        /** @type {PRONUNCIATION_RESPONSE} */
        const response = { type: 'PRONUNCIATION_LIST', audio };
        return response;
    }
}

async function run() {
    if (IS_DEV) browser.runtime.openOptionsPage();
    browser.runtime.onInstalled.addListener(onInstalled);
    browser.runtime.onMessage.addListener(handleMessage);
    browser.contextMenus.onClicked.addListener(contextMenuClickHandler);
}

run();
