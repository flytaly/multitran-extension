/* eslint-disable no-use-before-define */
import browser from 'webextension-polyfill';
import { state } from './state.js';
import { parser } from '../engine/multitran-parser.js';
import { applySizeVariables, idToLangMap } from '../utils.js';
import { addAudioElements } from '../audio.js';
import { getTemplate } from '../templates.js';
import { composeURL } from '../engine/multitran.js';
import { addKeyboardListener } from '../popup/keys.js';

/**
 * @typedef { import("../engine/multitran-parser").MtGroup } MtGroup
 * @param {Array<MtGroup>} data
 * @param {string} text
 * @param {string} l1Code
 * @param {string} l2Code
 * @returns
 */
export async function popupMarkup(data, text, l1Code, l2Code) {
    const rootElement = await getTemplate('translate-popup');
    const elementsList = [];
    let prevRowType = null;

    // Header
    const spans = rootElement.querySelectorAll('article > header > span');
    const link = spans[0].querySelector('a');
    link.innerText = text;
    link.href = composeURL(text, l1Code, l2Code, '1');

    if (l1Code && l2Code) {
        spans[2].textContent = `${idToLangMap[l1Code]}-${idToLangMap[l2Code]}`;
    }
    for (const row of data) {
        // const rowContainer = document.createElement('div');
        if (row.type === 'header') {
            const header = await getTemplate('translation-list-header');
            header.querySelector('div').append(...row.content);
            elementsList.push(header);
        }
        if (row.type === 'translation') {
            let ol;
            if (prevRowType === 'translation') {
                ol = elementsList[elementsList.length - 1];
            } else {
                ol = await getTemplate('translation-list');
                elementsList.push(ol);
            }
            const li = document.createElement('li');
            const colon = document.createTextNode(': ');
            if (row.subjLink) {
                row.subjLink.classList.add('translation-subject');
                li.append(row.subjLink, colon);
            }
            ol.appendChild(li);
            li.append(...row.trans);
        }
        prevRowType = row.type;
    }
    rootElement.append(...elementsList);

    const scrollTagSelector = '[data-type="scroll-next"]';

    rootElement.onclick = (ev) => {
        // Arrow buttons for scrolling to the next group
        const parentHeader = ev.target?.closest(scrollTagSelector);
        if (parentHeader) {
            const list = Array.from(rootElement.querySelectorAll(scrollTagSelector));
            const idx = list.findIndex((el) => el === parentHeader);
            const nextEl = list[(idx + 1) % list.length];
            rootElement.scroll({
                behavior: 'smooth',
                top: nextEl.offsetTop,
            });
            return;
        }
        // Links to other translation groups (nouns, verbs, etc)
        const { target } = ev;
        if (target?.tagName !== 'A') return;
        const href = target.getAttribute('href') || '';
        if (href.startsWith('#')) {
            const id = href.slice(1);
            const nextEl = rootElement.querySelector(`a[name=${id}]`);
            if (nextEl) {
                rootElement.scroll({
                    behavior: 'smooth',
                    top: nextEl.offsetTop,
                });
            }
        }
    };

    // Don't show scroll buttons in the groups that close to the bottom
    const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
            if (entry.target === rootElement) {
                const rect = rootElement.getBoundingClientRect();
                const bottomOffset = rootElement.scrollHeight - rect.height + rect.top;
                const elems = rootElement.querySelectorAll(scrollTagSelector);
                elems.forEach((el) => {
                    const { top } = el.getBoundingClientRect();
                    if (top < bottomOffset) {
                        el.classList.remove('invisible');
                    }
                });
            }
        }
    });

    resizeObserver.observe(rootElement);

    return rootElement;
}

export async function otherLangsPopupMarkup(otherLangs = []) {
    const rootElement = await getTemplate('translate-popup');
    const header = document.createElement('div');
    header.textContent = browser.i18n.getMessage('otherLanguagesHeader');
    rootElement.appendChild(header);
    const linksContainer = document.createElement('div');
    otherLangs.forEach((link, idx) => {
        linksContainer.appendChild(link);
        if (idx !== otherLangs.length - 1) {
            linksContainer.appendChild(document.createTextNode(', '));
        }
    });
    rootElement.appendChild(linksContainer);
    return rootElement;
}

/**
 * Request pronunciation and show in the popup
 * @param {string} word
 * @param {string} lang
 * @param {HTMLElement} popupElement
 */
function addPronunciation(word, lang, popupElement) {
    const container = popupElement.querySelector('#pronunciation');
    container.textContent = 'fetching audio...';

    /** @param {import('../background/background').PRONUNCIATION_RESPONSE} message */
    async function handleResponse(message) {
        container.textContent = '';
        if (message.type === 'PRONUNCIATION_LIST') {
            await addAudioElements(container, message.audio);
        }
    }

    function handleError(error) {
        console.error(error);
    }

    const sending = browser.runtime.sendMessage({
        type: 'GET_PRONUNCIATION',
        word,
        lang,
    });

    sending.then(handleResponse, handleError);
}

export async function showPopup({
    parent = document.body,
    shadowHost,
    text,
    l1,
    l2,
    translationPage,
    top = 0,
    left = 0,
}) {
    const parsed = parser(translationPage);
    if (!parsed.data || !parsed.data.length) return null;
    const popupElement = await popupMarkup(parsed.data, text, l1, l2);
    const { height, width, fontSize } = state;
    applySizeVariables(popupElement, { height, width, fontSize });
    if (state.fetchAudio) addPronunciation(text, parsed.l1 || l1, popupElement);
    parent.appendChild(popupElement);
    state.isPopupOpened = true;

    const style = {
        top: `${top}px`,
        left: `${left}px`,
    };
    Object.assign(popupElement.style, style);

    function hidePopupMouse(e) {
        if (e.target !== shadowHost) {
            removePopup();
        }
    }

    function hidePopupKeyDown(e) {
        if (e.key === 'Escape' || e.key === 'Shift') {
            removePopup();
            // e.stopPropagation()
        }
    }

    const removeKeyListener = addKeyboardListener(popupElement);

    function removePopup() {
        parent.removeChild(popupElement);
        document.removeEventListener('mousedown', hidePopupMouse);
        document.removeEventListener('keydown', hidePopupKeyDown);
        removeKeyListener();
        state.isPopupOpened = false;
    }

    setTimeout(() => {
        document.addEventListener('mousedown', hidePopupMouse);
        document.addEventListener('keydown', hidePopupKeyDown);
    }, 10);

    return popupElement;
}
