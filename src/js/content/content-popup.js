/* eslint-disable no-use-before-define */
import { state } from './state.js';
import { parser } from '../translate-engine/multitran-parser.js';
import { idToLangMap } from '../configs.js';
import { addAudioElements } from '../audio.js';

function popupHeader(text, l1Code, l2Code) {
    const header = document.createElement('div');
    header.className = 'popup-header';

    const translationText = document.createElement('span');
    translationText.textContent = text;
    translationText.className = 'translation-text';

    const langPair = document.createElement('span');
    langPair.className = 'translation-pair';
    if (l1Code && l2Code) {
        langPair.textContent = `${idToLangMap[l1Code]}-${idToLangMap[l2Code]}`;
    }

    const pronunciationBlock = document.createElement('div');
    pronunciationBlock.className = 'pronunciation';
    pronunciationBlock.id = 'pronunciation';

    header.append(translationText, pronunciationBlock, langPair);
    return header;
}

export function popupMarkup(data, text, l1Code, l2Code) {
    const rootElement = document.createElement('div');
    rootElement.id = 'translate-popup';
    const elementsList = [];
    let prevRowType = null;

    elementsList.push(popupHeader(text, l1Code, l2Code));

    data.forEach((row) => {
        const rowContainer = document.createElement('div');
        if (row.type === 'header') {
            rowContainer.classList.add('header');
            rowContainer.append(...row.content);
            elementsList.push(rowContainer);
        }
        if (row.type === 'translation') {
            let ol;
            if (prevRowType === 'translation') {
                ol = elementsList[elementsList.length - 1];
            } else {
                ol = document.createElement('ol');
                elementsList.push(ol);
            }
            const li = document.createElement('li');
            const colon = document.createTextNode(': ');
            if (row.subjLink) {
                row.subjLink.classList.add('subj');
                li.append(row.subjLink, colon);
            }
            ol.appendChild(li);
            li.append(...row.trans);
        }
        prevRowType = row.type;
    });
    rootElement.append(...elementsList);
    return rootElement;
}

export function otherLangsPopupMarkup(otherLangs = []) {
    const rootElement = document.createElement('div');
    rootElement.id = 'translate-popup';
    const header = document.createElement('div');
    header.textContent = browser.i18n.getMessage('otherLanguagesHeader');
    rootElement.appendChild(header);
    const linksContainer = document.createElement('div');
    linksContainer.classList.add('other-langs');
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
    async function handleResponse(message) {
        container.textContent = '';
        if (message.type === 'PRONUNCIATION_LIST') {
            addAudioElements(container, message.audio);
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
    const popupElement = popupMarkup(parsed.data, text, l1, l2);
    addPronunciation(text, parsed.l1 || l1, popupElement);
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

    function removePopup() {
        parent.removeChild(popupElement);
        document.removeEventListener('mousedown', hidePopupMouse);
        document.removeEventListener('keydown', hidePopupKeyDown);
        state.isPopupOpened = false;
    }

    setTimeout(() => {
        document.addEventListener('mousedown', hidePopupMouse);
        document.addEventListener('keydown', hidePopupKeyDown);
    }, 10);

    return popupElement;
}
