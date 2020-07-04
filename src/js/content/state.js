import { storage } from '../storage.js';

export const state = {
    isPopupOpened: false,
    areKeysPressed: false,
    onOptionsChange: () => {},
};

export async function setStateFromStorage() {
    const { keys, withKey, doubleClick, select } = await storage.getOptions();
    state.keys = keys;
    state.withKey = withKey;
    state.doubleClick = doubleClick;
    state.select = select;
}

browser.storage.onChanged.addListener(async (/* changes,  areaName */) => {
    await setStateFromStorage();
    state.onOptionsChange();
});
