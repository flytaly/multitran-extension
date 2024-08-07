import { applyTheme } from '../apply-theme.js';
import { defaultSizes } from '../constants.js';
import { addToContextMenu, removeFromContextMenu } from '../context-menu.js';
import '../l10n.js';
import { storage } from '../storage.js';
import { clamp } from '../utils.js';
import { setLangSelectorListeners } from './lang-selector.js';
import { renderParts } from './render-parts.js';
import { setShortcut } from './shortcuts.js';

async function init() {
    const options = await storage.getOptions();
    applyTheme(options.theme);
    await renderParts();
    await setLangSelectorListeners(options);

    // multitran interface language
    const { multitranLang, doubleClick, select, keys, fetchAudio, contextMenuItem, fontSize, width, height, allPairs } =
        options;
    const mtLang = document.getElementById('mtLang');
    mtLang.value = multitranLang;
    mtLang.addEventListener('change', () => storage.saveOptions({ multitranLang: mtLang.value }));

    const allPairsInput = document.getElementById('allPairs');
    allPairsInput.checked = allPairs;
    allPairsInput.addEventListener('change', () => {
        storage.saveOptions({ allPairs: allPairsInput.checked });
    });

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

    // theme
    /** @type {HTMLFormElement} */
    const themeForm = document.querySelector('form#theme');
    new FormData(themeForm).set('theme', options.theme);
    themeForm.addEventListener('change', (e) => {
        const theme = new FormData(e.currentTarget).get('theme');
        storage.saveOptions({ theme });
        applyTheme(theme);
    });

    // Font Size
    const fontSizeInput = document.getElementById('fsize');
    fontSizeInput.value = fontSize;
    const showFSize = (s) => {
        document.getElementById('fontSizeDemo').style.fontSize = `${s}px`;
    };
    showFSize(fontSize);
    fontSizeInput.addEventListener('input', (e) => {
        const value = clamp(e.currentTarget.value, 10, 25);
        showFSize(value);
        storage.saveOptions({ fontSize: value });
    });

    // Width
    const wInput = document.getElementById('popupWidth');
    wInput.value = width;
    wInput.addEventListener('input', (e) => storage.saveOptions({ width: clamp(e.currentTarget.value, 300, 1000) }));

    // Height
    const hInput = document.getElementById('popupHeight');
    hInput.value = height;
    hInput.addEventListener('input', (e) => storage.saveOptions({ height: clamp(e.currentTarget.value, 300, 1000) }));

    // Reset
    const resetBtn = document.getElementById('resetSizes');
    resetBtn.addEventListener('click', () => {
        storage.saveOptions({ height: defaultSizes.height, width: defaultSizes.width });
        wInput.value = defaultSizes.width;
        hInput.value = defaultSizes.height;
    });
}

init();
