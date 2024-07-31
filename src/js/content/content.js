import browser from 'webextension-polyfill';
import { state, setStateFromStorage } from './state.js';
import { showPopup } from './content-popup.js';
import { shadow } from './shadow.js';
import { getSelection } from './selection.js';
import { applyTheme } from '../apply-theme.js';

let lastFetchTS = 0;
const throttleDuration = 600;

function positionPopup(popupElement, coords) {
    const { innerWidth, innerHeight } = window;
    const { width, height } = popupElement.getBoundingClientRect();

    if (coords.left + width > innerWidth) {
        coords.left = innerWidth - width;
    }
    if (coords.top + height > innerHeight) {
        // if popup's top coordinate is above viewport don't change it
        const popupTop = coords.top - height - coords.height;
        coords.top = popupTop > 0 ? popupTop : coords.top;
    }

    popupElement.style.left = `${window.pageXOffset + coords.left}px`;
    popupElement.style.top = `${window.pageYOffset + coords.top}px`;
}

async function processSelection(target) {
    if (state.isPopupOpened) return;
    const { selection, coords } = getSelection(target);
    if (!selection.length || selection.length > 150) return;

    const timestamp = Date.now();
    if (timestamp - lastFetchTS < throttleDuration) return;
    lastFetchTS = timestamp;

    /** @param {import('../background/background').MT_DATA_RESPONSE} message */
    async function handleResponse(message) {
        if (!message) return;
        if (message.type === 'MULTITRAN_DATA') {
            const { shadowElem, shadowHost } = shadow;
            const { translationPage, text, l1, l2 } = message;
            /* Render popup with coords (0,0) so it has right width/height and then adjust its position */
            const popupElement = await showPopup({
                translationPage,
                parent: shadowElem,
                shadowHost,
                text,
                l1,
                l2,
            });
            if (popupElement) {
                positionPopup(popupElement, coords);
            }
        }
    }

    function handleError(error) {
        console.error(error);
    }

    const sending = browser.runtime.sendMessage({
        type: 'GET_MULTITRAN_DATA',
        selection,
    });

    sending.then(handleResponse, handleError);
}

/**
 * Checks state of modifier keys that supposed to be pressed.
 * @arg {KeyboardEvent|MouseEvent} e */
function modifierState(e) {
    if (state.keys.altKey && !e.altKey) return false;
    if (state.keys.ctrlKey && !e.ctrlKey) return false;
    if (state.keys.metaKey && !e.metaKey) return false;
    if (state.keys.shiftKey && !e.shiftKey) return false;
    return true;
}

/** @arg {MouseEvent} e */
function mouseupHandler(e) {
    const launch = () => setTimeout(() => processSelection(e.target), 10);
    if (state.doubleClick && e.detail === 2) {
        return launch();
    }

    if (!state.select) return;

    if (!state.withKey) {
        return launch();
    }

    if (!modifierState(e)) {
        // Check modifier keys to prevent some bugs when keyup events didn't trigger.
        // It's imposible to check additional key though.
        state.areKeysPressed = false;
    }
    if (state.areKeysPressed) launch();
}

/** @arg {KeyboardEvent} e */
function keydownHandler(e) {
    if (!modifierState(e) || (state.keys.additionalKey && e.code !== state.keys.additionalKey)) {
        state.areKeysPressed = false;
        return;
    }
    state.areKeysPressed = true;
    processSelection(e.target);
}

function keyupHandler() {
    state.areKeysPressed = false;
}

state.onOptionsChange = async () => {
    function removeHandlers() {
        document.body.removeEventListener('mouseup', mouseupHandler);
        document.body.removeEventListener('keydown', keydownHandler);
        document.body.removeEventListener('keyup', keyupHandler);
    }

    removeHandlers();

    document.body.addEventListener('mouseup', mouseupHandler);
    if (state.select && state.withKey) {
        document.body.addEventListener('keydown', keydownHandler);
        document.body.addEventListener('keyup', keyupHandler);
    }
};

setStateFromStorage().then(() => state.onOptionsChange());

browser.runtime.onMessage.addListener((message) => {
    if (message.type === 'TRANSLATE_SELECTION') {
        processSelection(document.activeElement || document.body);
    }
});
