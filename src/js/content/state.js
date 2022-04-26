import browser from 'webextension-polyfill';
import { storage } from '../storage.js';

/**
 * @typedef {import("../storage").Options} Options
 *
 * @typedef {Object} BaseState
 * @property {boolean} isPopupOpened
 * @property {boolean} areKeysPressed
 * @property {Function} onOptionsChange
 */

/** @type {BaseState & Options} State */
export const state = {
    isPopupOpened: false,
    areKeysPressed: false,
    onOptionsChange: () => {},
    keys: {},
};

export async function setStateFromStorage() {
    const { keys, withKey, doubleClick, select, fetchAudio, fontSize } = await storage.getOptions();
    // Object.assign(state, await storage.getOptions());
    state.keys = keys;
    state.withKey = withKey;
    state.doubleClick = doubleClick;
    state.select = select;
    state.fetchAudio = fetchAudio;
    state.fontSize = fontSize;
}

browser.storage.onChanged.addListener(async (/* changes,  areaName */) => {
    await setStateFromStorage();
    state.onOptionsChange();
});
