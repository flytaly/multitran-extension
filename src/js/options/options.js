import '../l10n.js';
import { setLangSelectorListeners } from '../lang-selector.js';
import { storage } from '../storage.js';

async function init() {
    setLangSelectorListeners();
    const { multitranLang } = await storage.getOptions();

    const mtLang = document.getElementById('mtLang');

    mtLang.value = multitranLang;
    mtLang.addEventListener('change', () => storage.saveOptions({ multitranLang: mtLang.value }));
}

init();
