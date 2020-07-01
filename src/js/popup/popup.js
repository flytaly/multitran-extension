import { multitranData } from '../translate-engine/multitran.js';
import { popupMarkup } from '../content/content-popup.js';
import { setLangSelectorListeners } from '../lang-selector.js';
import { storage } from '../storage.js';

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
    if (!data || !data.length) return;

    const translationElem = popupMarkup(data);
    document.body.appendChild(translationElem);
}

function setListeners() {
    setLangSelectorListeners();
    const form = document.querySelector('.text-input');
    const input = document.querySelector('.text-input input');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const value = input.value.trim();
        if (value) {
            renderTranslation(value);
        }
    });
}

document.addEventListener('DOMContentLoaded', setListeners, {
    once: true,
});
