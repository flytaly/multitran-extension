import browser from 'webextension-polyfill';
import '../l10n.js';
import { storage } from '../storage.js';
import { throttle } from '../utils.js';
import { addLinkToBrowserStore } from '../store-link.js';
import { addKeyboardListener } from './keys.js';
import { langIds } from '../constants.js';
import { updateLangSelector, setLangSelectorListeners } from './lang-selector.js';
import { onAddingTab, updateTabs } from './tabs.js';
import { renderTranslation, setContainerWidth } from './render-translation.js';

/** @type {import('../storage').Options} */
let options = {};

function addPair() {
    if (options.pairs.length > 2) return;
    options.pairs.push([langIds.German, langIds.English]);
    options.currentPair = options.pairs.length - 1;
    storage.saveOptions(options);
}

const onTabChange = (tabIndex) => {
    /** @type {HTMLInputElement} */
    const input = document.querySelector('#input-form input');
    input.focus();
    options.currentPair = tabIndex;
    storage.saveOptions(options);
    /* updateLangSelector(options.pairs, options.currentPair); */
};

async function setListeners() {
    options = await storage.getOptions();
    browser.storage.local.onChanged.addListener((change) => {
        if (change.options.newValue) {
            options = { ...options, ...change.options.newValue };
            updateTabs(options.pairs, options.currentPair, onTabChange);
            updateLangSelector(options.pairs, options.currentPair);
        }
    });

    setLangSelectorListeners(options.pairs, options.currentPair, (l1, l2, idx) => {
        options.pairs[idx] = [l1, l2];
        storage.saveOptions({ pairs: options.pairs });
    });
    onAddingTab(addPair);
    updateTabs(options.pairs, options.currentPair, onTabChange);
    addLinkToBrowserStore();
    addKeyboardListener();

    const form = document.getElementById('input-form');
    const input = form.querySelector('input');
    const optionButton = document.getElementById('optionsButton');

    optionButton.addEventListener('click', async () => {
        await browser.runtime.openOptionsPage();
        window.close();
    });

    setContainerWidth(options.width);

    // prevent spamming requests by holding Enter
    const throttledRender = throttle(() => {
        const value = input.value.trim();
        renderTranslation(value, options, options.currentPair);
    }, 800);

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        throttledRender();
    });
}

document.addEventListener('DOMContentLoaded', setListeners, { once: true });
