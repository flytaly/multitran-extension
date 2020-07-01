/* eslint-disable no-param-reassign */
import { storage } from './storage.js';

export async function restoreValues(l1Elem, l2Elem) {
    const { l1, l2 } = await storage.getOptions();
    l1Elem.value = l1;
    l2Elem.value = l2;
}

export async function setLangSelectorListeners() {
    const l1Elem = document.getElementById('l1');
    const l2Elem = document.getElementById('l2');
    const langSwap = document.getElementById('lang-swap');

    await restoreValues(l1Elem, l2Elem);

    langSwap.addEventListener('click', () => {
        [l1Elem.value, l2Elem.value] = [l2Elem.value, l1Elem.value];
        storage.saveOptions({
            l1: l1Elem.value,
            l2: l2Elem.value,
        });
    });

    l1Elem.addEventListener('change', () => storage.saveOptions({ l1: l1Elem.value }));

    l2Elem.addEventListener('change', () => storage.saveOptions({ l2: l2Elem.value }));
}
