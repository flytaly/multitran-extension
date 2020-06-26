import { state } from './state.js';
import { showPopup } from './content-popup.js';
import { shadowElem } from './shadow.js';
import { getSelection } from './selection.js';

function processSelection(target) {
    if (state.isPopupOpened) return;
    const { selection, coords } = getSelection(target);
    if (selection.length) {
        showPopup({
            text: selection,
            parent: shadowElem,
            ...coords,
        });
    }
}

document.body.addEventListener('mouseup', (e) => {
    if ((state.withKey && state.isKeyPressed) || (!state.withKey && e.detail <= 2)) {
        setTimeout(() => {
            processSelection(e.target);
        }, 50);
    }
});

function keydownHandler(e) {
    if (e.key === state.key) {
        state.isKeyPressed = true;
        processSelection(e.target);
    }
}

function keyUpHandler(e) {
    if (e.key === state.key) {
        state.isKeyPressed = false;
    }
}
function addKeysHandler() {
    document.body.addEventListener('keydown', keydownHandler);
    document.body.addEventListener('keyup', keyUpHandler);
}

/* function removeKeysHandler() {
    document.body.removeEventListener('keydown', keydownHandler);
    document.body.removeEventListener('keyup', keyUpHandler);
} */

if (state.withKey) {
    addKeysHandler();
}
