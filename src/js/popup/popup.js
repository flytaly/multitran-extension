import { browser } from 'webextension-polyfill-ts';
import '../l10n.js';
import { multitranData } from '../translate-engine/multitran.js';
import { otherLangsPopupMarkup, popupMarkup } from '../content/content-popup.js';
import { setLangSelectorListeners } from '../lang-selector.js';
import { storage } from '../storage.js';

import { throttle } from '../utils.js';
import { addAudioElements } from '../audio.js';
import { getAudioUrls } from '../translate-engine/wiktionary-voice.js';

async function renderTranslation(text) {
    const prevTranslation = document.querySelector('#translate-popup-container');
    const loadingText = document.getElementById('loading');
    const loadingBar = document.getElementById('top-bar');
    const errorElem = document.getElementById('error');
    errorElem.hidden = true;

    loadingText.hidden = false;
    loadingBar.classList.add('animate-pulse');

    if (prevTranslation) document.body.removeChild(prevTranslation);
    const { l1, l2, multitranLang, fetchAudio } = await storage.getOptions();
    const { data, error, otherLang, l1: l1_, l2: l2_ } = await multitranData(text, l1, l2, multitranLang);

    loadingText.hidden = true;
    loadingBar.classList.remove('animate-pulse');

    if (error) {
        errorElem.hidden = false;
        errorElem.textContent = error.message;
    }
    if (data && data.length) {
        const translationElem = await popupMarkup(data, text, l1_, l2_);
        translationElem.style = 'border:0;position:relative;';
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
        const translationElem = await otherLangsPopupMarkup(otherLang);
        translationElem.style = 'border:0;position:relative;';
        document.body.appendChild(translationElem);
        return translationElem;
    }

    return null;
}

function setListeners() {
    setLangSelectorListeners();
    const form = document.getElementById('input-form');
    const input = form.querySelector('input');
    const optionButton = document.getElementById('optionsButton');

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
