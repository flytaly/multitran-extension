import browser from 'webextension-polyfill';
import '../l10n.js';
import { storage } from '../storage.js';
import { throttle, clamp } from '../utils.js';
import { addLinkToBrowserStore } from '../store-link.js';
import { addKeyboardListener } from './keys.js';
import { langIds } from '../constants.js';
import { updateLangSelector, setLangSelectorListeners } from './lang-selector.js';
import { onAddingTab, updateTabs } from './tabs.js';
import { renderTranslation, getContainer } from './render-translation.js';

/** @type {import('../storage').Options} */
let options = {};
let pairIndex = 0;

function addPair() {
    if (options.pairs.length > 2) return;
    options.pairs.push([langIds.German, langIds.English]);
    pairIndex += 1;
    storage.saveOptions(options);
}

const onTabChange = (tabIndex) => {
    pairIndex = tabIndex;
    updateLangSelector(options.pairs, pairIndex);
};

async function setListeners() {
    options = await storage.getOptions();
    browser.storage.local.onChanged.addListener((change) => {
        if (change.options.newValue) {
            options = { ...options, ...change.options.newValue };
            updateTabs(options.pairs, onTabChange);
            updateLangSelector(options.pairs, pairIndex);
        }
    });

    setLangSelectorListeners(options.pairs, pairIndex, (l1, l2, idx) => {
        options.pairs[idx] = [l1, l2];
        storage.saveOptions({ pairs: options.pairs });
    });
    onAddingTab(addPair);
    updateTabs(options.pairs, onTabChange);
    addLinkToBrowserStore();
    addKeyboardListener();

    const form = document.getElementById('input-form');
    const input = form.querySelector('input');
    const optionButton = document.getElementById('optionsButton');

    getContainer().style.minWidth = `${clamp(options.width, 400, 800)}px`;

    optionButton.addEventListener('click', async () => {
        await browser.runtime.openOptionsPage();
        window.close();
    });

    // prevent spamming requests by holding Enter
    const throttledRender = throttle(() => {
        const value = input.value.trim();
        renderTranslation(value, options, pairIndex);
    }, 800);

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        throttledRender();
    });
}

document.addEventListener('DOMContentLoaded', setListeners, { once: true });
