import browser from 'webextension-polyfill';

export const CONTEXT_ID = 'multitran-translate-selected';

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
