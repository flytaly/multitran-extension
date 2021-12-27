/* eslint-disable no-param-reassign */
import { addToContextMenu, removeFromContextMenu } from '../context-menu.js';
import '../l10n.js';
import { setLangSelectorListeners } from '../lang-selector.js';
import { storage } from '../storage.js';
import { setShortcut } from './shortcuts.js';
import { addLinkToBrowserStore } from '../store-link.js';

async function init() {
    setLangSelectorListeners();
    addLinkToBrowserStore();
    const { multitranLang, doubleClick, select, keys, fetchAudio, contextMenuItem } = await storage.getOptions();
    // multitran interface language
    const mtLang = document.getElementById('mtLang');
    mtLang.value = multitranLang;
    mtLang.addEventListener('change', () => storage.saveOptions({ multitranLang: mtLang.value }));

    const doubleClickInput = document.getElementById('doubleClick');
    doubleClickInput.checked = doubleClick;
    doubleClickInput.addEventListener('change', () => {
        storage.saveOptions({ doubleClick: doubleClickInput.checked });
    });

    setShortcut(keys);

    const shortcutInput = document.getElementById('shortcutInput');
    const selectingInput = document.getElementById('selecting');
    selectingInput.checked = select;
    // set keys input disabled if 'selecting text' option isn't selected
    shortcutInput.disabled = !selectingInput.checked;
    selectingInput.addEventListener('change', () => {
        storage.saveOptions({ select: selectingInput.checked });
        shortcutInput.disabled = !selectingInput.checked;
    });

    // audio
    const audioCheckbox = document.getElementById('audio');
    audioCheckbox.checked = fetchAudio;
    audioCheckbox.addEventListener('change', () => {
        storage.saveOptions({ fetchAudio: audioCheckbox.checked });
    });

    // context menu
    const contextMenuCheckbox = document.getElementById('contextMenu');
    contextMenuCheckbox.checked = contextMenuItem;
    contextMenuCheckbox.addEventListener('change', () => {
        storage.saveOptions({ contextMenuItem: contextMenuCheckbox.checked });
        if (contextMenuCheckbox.checked) {
            addToContextMenu();
        } else {
            removeFromContextMenu();
        }
    });
}

init();
