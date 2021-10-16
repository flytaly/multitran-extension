import { browser } from 'webextension-polyfill-ts';
import { composeURL, fetchPage } from '../translate-engine/multitran.js';
import { storage } from '../storage.js';
import { getAudioUrls } from '../translate-engine/wiktionary-voice.js';
import { CONTEXT_ID, addToContextMenu } from '../context-menu.js';
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
            const { l1, l2, multitranLang } = await storage.getOptions();
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
    browser.runtime.onMessage.addListener(handleMessage);

    if (process.env.NODE_ENV === 'development') {
        setTimeout(() => {
            browser.runtime.openOptionsPage();
        }, 300);
    }

    const { contextMenuItem } = await storage.getOptions();
    if (contextMenuItem) addToContextMenu();

    const contextMenuClickHandler = (info, tab) => {
        if (info.menuItemId === CONTEXT_ID) {
            const { selectionText } = info;
            if (selectionText) {
                browser.tabs.sendMessage(tab.id, { type: 'TRANSLATE_SELECTION' });
            }
        }
    };

    browser.contextMenus.onClicked.addListener(contextMenuClickHandler);
}

run();
