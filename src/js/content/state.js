import { storage } from '../storage.js';

export const state = {
    withKey: false, // show popup only if key is pressed
    keys: { altKey: false },

    isPopupOpened: false,
    areKeysPressed: false,
    onOptionsChange: () => {},
};

async function setStateFromStorage() {
    const { keys, withKey } = await storage.getOptions();
    state.keys = keys;
    state.withKey = withKey;
}

setStateFromStorage();

browser.storage.onChanged.addListener(async (/* changes,  areaName */) => {
    state.onOptionsChange();
    await setStateFromStorage();
});
