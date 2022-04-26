import browser from 'webextension-polyfill';
import '../l10n.js';
import { multitranData } from '../translate-engine/multitran.js';
import { otherLangsPopupMarkup, popupMarkup } from '../content/content-popup.js';
import { setLangSelectorListeners } from '../lang-selector.js';
import { storage } from '../storage.js';
import { applySizeVariables, throttle, clamp } from '../utils.js';
import { addAudioElements } from '../audio.js';
import { getAudioUrls } from '../translate-engine/wiktionary-voice.js';
import { addLinkToBrowserStore } from '../store-link.js';
import { addKeyboardListener } from './keys.js';

const getContainer = () => document.querySelector('#translation-container');

/** @returns {HTMLElement} translation element */
function removePrevTranslation() {
    const prevRenderElem = document.querySelector('#translate-popup-content');
    if (!prevRenderElem?.parentNode) return;
    prevRenderElem.parentNode.removeChild(prevRenderElem);
}

/** @param {string} text */
async function renderTranslation(text) {
    removePrevTranslation();
    const loadingText = document.getElementById('loading');
    const loadingBar = document.getElementById('top-bar');
    const errorElem = document.getElementById('error');
    const notFoundElem = document.getElementById('not-found');
    errorElem.hidden = true;
    notFoundElem.hidden = true;

    loadingText.hidden = false;
    loadingBar.classList.add('animate-pulse');

    const { l1, l2, multitranLang, fetchAudio, fontSize, width } = await storage.getOptions();
    const { data, error, otherLang, l1: l1_, l2: l2_ } = await multitranData(text, l1, l2, multitranLang);
    loadingText.hidden = true;
    loadingBar.classList.remove('animate-pulse');

    if (error) {
        errorElem.hidden = false;
        errorElem.textContent = error.message;
        return;
    }

    if (data && data.length) {
        const translationElem = await popupMarkup(data, text, l1_, l2_);
        translationElem.style.border = 0;
        translationElem.style.position = 'relative';
        applySizeVariables(translationElem, {
            fontSize,
            width: clamp(width, 400, 800),
        });
        if (fetchAudio) {
            const container = translationElem.querySelector('#pronunciation');
            container.textContent = 'fetching audio...';

            getAudioUrls(text, l1_).then((audioFiles) => {
                container.textContent = '';
                addAudioElements(container, audioFiles);
            });
        }
        getContainer().appendChild(translationElem);
        return translationElem;
    }

    if (otherLang && otherLang.length) {
        const translationElem = await otherLangsPopupMarkup(otherLang);
        translationElem.style = 'border:0;position:relative;';
        getContainer().appendChild(translationElem);
        return translationElem;
    }

    if (data?.length === 0) {
        notFoundElem.hidden = false;
    }

    return null;
}

function setListeners() {
    setLangSelectorListeners();
    addLinkToBrowserStore();
    addKeyboardListener();

    const form = document.getElementById('input-form');
    const input = form.querySelector('input');
    const optionButton = document.getElementById('optionsButton');

    storage.getOptions().then(({ width }) => {
        getContainer().style.width = `${clamp(width, 400, 800)}px`;
    });

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
