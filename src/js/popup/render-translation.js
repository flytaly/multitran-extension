import { addAudioElements } from '../audio.js';
import { otherLangsPopupMarkup, popupMarkup } from '../content/content-popup.js';
import '../l10n.js';
import { multitranData } from '../engine/multitran.js';
import { getAudioUrls } from '../engine/wiktionary-voice.js';
import { applySizeVariables, clamp } from '../utils.js';

export const getContainer = () => document.querySelector('#translation-container');

/** @returns {HTMLElement} translation element */
function removePrevTranslation() {
    const prevRenderElem = document.querySelector('#translate-popup-content');
    if (!prevRenderElem?.parentNode) return;
    prevRenderElem.parentNode.removeChild(prevRenderElem);
}

export function setContainerWidth(width) {
    const { width: bodyWidth } = document.body.getBoundingClientRect();
    getContainer().style.width = `${clamp(Math.max(width, bodyWidth), 400, 800)}px`;
}

/**
 * @param {string} text
 * @param {import('../storage.js').Options} options
 * @param {number} pairIndex */
export async function renderTranslation(text, options, pairIndex = 0) {
    removePrevTranslation();
    const loadingText = document.getElementById('loading');
    const loadingBar = document.getElementById('top-bar');
    const errorElem = document.getElementById('error');
    const notFoundElem = document.getElementById('not-found');
    errorElem.hidden = true;
    notFoundElem.hidden = true;

    loadingText.hidden = false;
    loadingBar.classList.add('animate-pulse');

    const { pairs, multitranLang, fetchAudio, fontSize } = options;
    const [l1, l2] = pairs[pairIndex];
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
            width: 800, // clamp(options.width, 400, 800),
        });

        setContainerWidth(options.width)

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
