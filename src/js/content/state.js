import { browser } from 'webextension-polyfill-ts';
import { storage } from '../storage.js';

export const state = {
    isPopupOpened: false,
    areKeysPressed: false,
    onOptionsChange: () => {},
};

export async function setStateFromStorage() {
    const { keys, withKey, doubleClick, select, fetchAudio } = await storage.getOptions();
    state.keys = keys;
    state.withKey = withKey;
    state.doubleClick = doubleClick;
    state.select = select;
    state.fetchAudio = fetchAudio;
}

browser.storage.onChanged.addListener(async (/* changes,  areaName */) => {
    await setStateFromStorage();
    state.onOptionsChange();
});
