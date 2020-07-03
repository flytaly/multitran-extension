import '../l10n.js';
import { setLangSelectorListeners } from '../lang-selector.js';
import { storage } from '../storage.js';

async function init() {
    setLangSelectorListeners();
    const { multitranLang, doubleClick, select, keys } = await storage.getOptions();

    // multitran interface language
    const mtLang = document.getElementById('mtLang');
    mtLang.value = multitranLang;
    mtLang.addEventListener('change', () => storage.saveOptions({ multitranLang: mtLang.value }));

    const doubleClickInput = document.getElementById('doubleClick');
    doubleClickInput.checked = doubleClick;
    doubleClickInput.addEventListener('change', () => {
        storage.saveOptions({ doubleClick: doubleClickInput.checked });
    });

    const selectingInput = document.getElementById('selecting');
    selectingInput.checked = select;
    selectingInput.addEventListener('change', () => {
        storage.saveOptions({ select: selectingInput.checked });
    });

    const altKeyInput = document.getElementById('altKey');
    altKeyInput.checked = keys.altKey;
    altKeyInput.addEventListener('change', () => {
        storage.saveKeys({ altKey: altKeyInput.checked });
    });

    const ctrlKeyInput = document.getElementById('ctrlKey');
    ctrlKeyInput.checked = keys.ctrlKey;
    ctrlKeyInput.addEventListener('change', () => {
        storage.saveKeys({ ctrlKey: ctrlKeyInput.checked });
    });

    const metaKeyInput = document.getElementById('metaKey');
    metaKeyInput.checked = keys.metaKey;
    metaKeyInput.addEventListener('change', () => {
        storage.saveKeys({ metaKey: metaKeyInput.checked });
    });
}

init();
