/* eslint-disable no-use-before-define */
import { state } from './state.js';
import { multitranData } from '../translate-engine/multitran.js';
import { storage } from '../storage.js';

export function popupMarkup(data) {
    const rootElement = document.createElement('div');
    rootElement.id = 'translate-popup';
    const elementsList = [];
    let prevRowType = null;
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

export async function showPopup({ parent = document.body, shadowHost, text, top = 0, left = 0 }) {
    state.isPopupOpened = true;
    const { l1, l2 } = await storage.getOptions();
    const { data, error } = await multitranData(text, l1, l2, 2);
    if (error) console.error(error);
    if (!data || !data.length) return null;

    const popupElement = popupMarkup(data);
    parent.appendChild(popupElement);

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
        if (e.key === 'Escape' || e.key === state.key || e.key === 'Shift') {
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
