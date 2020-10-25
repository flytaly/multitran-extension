/* eslint-disable no-param-reassign */
import '../l10n.js';
import { setLangSelectorListeners } from '../lang-selector.js';
import { storage } from '../storage.js';

function addLinkToBrowserStore() {
    const storeLink = document.getElementById('storeLink');
    if (!storeLink) return;
    if (TARGET === 'firefox') {
        storeLink.href = 'https://addons.mozilla.org/firefox/addon/multitran/';
    } else {
        storeLink.href = 'https://chrome.google.com/webstore/detail/multitran-popup/fbncpmcdhgdolipfkpeckjajpgjdpehj';
    }
}

async function init() {
    setLangSelectorListeners();
    addLinkToBrowserStore();
    const { multitranLang, doubleClick, select, keys, fetchAudio } = await storage.getOptions();

    // multitran interface language
    const mtLang = document.getElementById('mtLang');
    mtLang.value = multitranLang;
    mtLang.addEventListener('change', () => storage.saveOptions({ multitranLang: mtLang.value }));

    const doubleClickInput = document.getElementById('doubleClick');
    doubleClickInput.checked = doubleClick;
    doubleClickInput.addEventListener('change', () => {
        storage.saveOptions({ doubleClick: doubleClickInput.checked });
    });

    const keysInputs = document.querySelectorAll('#keys input');
    keysInputs.forEach((keyInput) => {
        const { name } = keyInput;
        keyInput.checked = keys[name];
        keyInput.addEventListener('change', () => {
            storage.saveKeys({ [name]: keyInput.checked });
        });
    });

    // set keys input disabled if 'selecting text' option isn't selected
    const setDisableAttribute = (isDisabled) => {
        keysInputs.forEach((keyInput) => {
            keyInput.disabled = isDisabled;
        });
    };

    const selectingInput = document.getElementById('selecting');
    selectingInput.checked = select;
    setDisableAttribute(!selectingInput.checked);
    selectingInput.addEventListener('change', () => {
        storage.saveOptions({ select: selectingInput.checked });
        setDisableAttribute(!selectingInput.checked);
    });

    // audio
    const audioCheckbox = document.getElementById('audio');
    audioCheckbox.checked = fetchAudio;
    audioCheckbox.addEventListener('change', () => {
        storage.saveOptions({ fetchAudio: audioCheckbox.checked });
    });
}

init();
