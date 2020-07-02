import { multitranData } from '../translate-engine/multitran.js';
import { popupMarkup } from '../content/content-popup.js';
import { setLangSelectorListeners } from '../lang-selector.js';
import { storage } from '../storage.js';

import { throttle } from '../utils.js';

async function renderTranslation(text) {
    const prevTranslation = document.querySelector('#translate-popup');
    const loadingElem = document.querySelector('.loading');
    const errorElem = document.querySelector('.error');
    errorElem.hidden = true;
    loadingElem.hidden = false;

    if (prevTranslation) document.body.removeChild(prevTranslation);
    const { l1, l2 } = await storage.getOptions();
    const { data, error } = await multitranData(text, l1, l2, 2);
    loadingElem.hidden = true;
    if (error) {
        errorElem.hidden = false;
        errorElem.textContent = error.message;
    }
    if (!data || !data.length) return null;

    const translationElem = popupMarkup(data);
    document.body.appendChild(translationElem);
    return translationElem;
}

function setListeners() {
    setLangSelectorListeners();
    const form = document.querySelector('.text-input');
    const input = document.querySelector('.text-input input');

    // prevent spamming requests by holding Enter
    const throttledRender = throttle(() => {
        const value = input.value.trim();
        renderTranslation(value);
    }, 800);

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        throttledRender();
    });
}

document.addEventListener('DOMContentLoaded', setListeners, {
    once: true,
});
