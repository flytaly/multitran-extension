import { state, setStateFromStorage } from './state.js';
import { showPopup } from './content-popup.js';
import { shadowElem, shadowHost } from './shadow.js';
import { getSelection } from './selection.js';

async function processSelection(target) {
    if (state.isPopupOpened) return;
    const { selection, coords } = getSelection(target);
    if (selection.length) {
        /* Render popup with coords (0,0) so it has right width/height
        and then adjust its position */
        const popupElement = await showPopup({
            text: selection,
            parent: shadowElem,
            shadowHost,
            // ...coords,
        });

        if (popupElement) {
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
    }
}

state.onOptionsChange = async () => {
    function mouseupHandler(e) {
        const launch = () => setTimeout(() => processSelection(e.target), 10);
        if (state.doubleClick && e.detail === 2) {
            launch();
        } else {
            if (!state.select || (state.withKey && !state.areKeysPressed)) return;
            launch();
        }
    }

    function keydownHandler(e) {
        let areKeysPressed = true;
        if (
            (state.keys.altKey && !e.altKey) ||
            (state.keys.ctrlKey && !e.ctrlKey) ||
            (state.keys.metaKey && !e.metaKey)
        ) {
            areKeysPressed = false;
        }
        if (areKeysPressed) {
            state.areKeysPressed = areKeysPressed;
            processSelection(e.target);
        }
    }

    function keyupHandler(e) {
        if (e.key === 'Meta' || e.key === 'Control' || e.key === 'Alt') {
            state.areKeysPressed = false;
        }
    }

    function removeHandlers() {
        document.body.removeEventListener('mouseup', mouseupHandler);
        document.body.removeEventListener('keydown', keydownHandler);
        document.body.removeEventListener('keyup', keyupHandler);
    }

    removeHandlers();

    document.body.addEventListener('mouseup', mouseupHandler);
    if (state.withKey) {
        document.body.addEventListener('keydown', keydownHandler);
        document.body.addEventListener('keyup', keyupHandler);
    }
};

setStateFromStorage().then(() => state.onOptionsChange());
