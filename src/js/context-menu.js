import browser from 'webextension-polyfill';

export const CONTEXT_ID = 'multitran-translate-selected';

export const contextMenuClickHandler = (info, tab) => {
    if (info.menuItemId === CONTEXT_ID) {
        const { selectionText } = info;
        if (selectionText) {
            browser.tabs.sendMessage(tab.id, { type: 'TRANSLATE_SELECTION' });
        }
    }
};

export const addToContextMenu = () => {
    browser.contextMenus.create({
        id: CONTEXT_ID,
        title: browser.i18n.getMessage('contextMenuTranslateSelection'),
        contexts: ['selection'],
    });
};

export const removeFromContextMenu = () => {
    browser.contextMenus.remove(CONTEXT_ID);
};
