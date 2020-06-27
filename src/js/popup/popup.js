import { multitranData } from '../translate-engine/multitran.js';
import { popupMarkup } from '../content/content-popup.js';

async function renderTranslation(text) {
    const prevTranslation = document.querySelector('#translate-popup');
    const loadingElem = document.querySelector('.loading');
    if (prevTranslation) document.body.removeChild(prevTranslation);
    loadingElem.hidden = false;

    const { data } = await multitranData(text, 2, 1, 2);
    if (!data || !data.length) return;
    const translationElem = popupMarkup(data);
    loadingElem.hidden = true;
    document.body.appendChild(translationElem);
}

function setListeners() {
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
