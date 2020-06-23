/* eslint-disable no-use-before-define */
import { state } from './state.js';

export function showPopup({ parent = document.body, top = 0, left = 0, content }) {
    state.isPopupOpened = true;
    const popupElement = document.createElement('div');
    popupElement.id = 'translate-popup';
    parent.appendChild(popupElement);
    const style = {
        top: `${top}px`,
        left: `${left}px`,
    };
    Object.assign(popupElement.style, style);
    popupElement.innerHTML = `<b>${content}</b>`;

    function hidePopupMouse(e) {
        if (!e.target.closest('#translate-popup')) {
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
}
