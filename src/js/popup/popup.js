import '../l10n.js';
import { multitranData } from '../translate-engine/multitran.js';
import { otherLangsPopupMarkup, popupMarkup } from '../content/content-popup.js';
import { setLangSelectorListeners } from '../lang-selector.js';
import { storage } from '../storage.js';

import { throttle } from '../utils.js';
import { addAudioElements } from '../audio.js';
import { getAudioUrls } from '../translate-engine/wiktionary-voice.js';

async function renderTranslation(text) {
    const prevTranslation = document.querySelector('#translate-popup');
    const loadingElem = document.querySelector('.loading');
    const errorElem = document.querySelector('.error');
    errorElem.hidden = true;
    loadingElem.hidden = false;

    if (prevTranslation) document.body.removeChild(prevTranslation);
    const { l1, l2, multitranLang, fetchAudio } = await storage.getOptions();
    const { data, error, otherLang, l1: l1_, l2: l2_ } = await multitranData(text, l1, l2, multitranLang);

    loadingElem.hidden = true;

    if (error) {
        errorElem.hidden = false;
        errorElem.textContent = error.message;
    }
    if (data && data.length) {
        const translationElem = popupMarkup(data, text, l1_, l2_);
        if (fetchAudio) {
            const container = translationElem.querySelector('#pronunciation');
            container.textContent = 'fetching audio...';

            getAudioUrls(text, l1_).then((audioFiles) => {
                container.textContent = '';
                addAudioElements(container, audioFiles);
            });
        }
        document.body.appendChild(translationElem);
        return translationElem;
    }

    if (otherLang && otherLang.length) {
        const translationElem = otherLangsPopupMarkup(otherLang);
        document.body.appendChild(translationElem);
        return translationElem;
    }

    return null;
}

function setListeners() {
    setLangSelectorListeners();
    const form = document.querySelector('.text-input');
    const input = document.querySelector('.text-input input');
    const optionButton = document.querySelector('button.header-icon');

    optionButton.addEventListener('click', async () => {
        await browser.runtime.openOptionsPage();
        window.close();
    });

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
