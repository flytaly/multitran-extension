import { debounce } from '../utils.js';
import { storage } from '../storage.js';

/**
 * @typedef {Object} ShortcutKeys
 * @property {boolean} [altKey]
 * @property {boolean} [ctrlKey]
 * @property {boolean} [metaKey]
 * @property {boolean} [shiftKey]
 * @property {string|null} [additionalKey]
 */

/** @type {ShortcutKeys} */
const defaultValues = {
    altKey: false,
    ctrlKey: false,
    metaKey: false,
    shiftKey: false, //
    additionalKey: null,
};

/**
 * @param {ShortcutKeys} keys
 */
function mapKeysToString(keys) {
    const result = [];
    if (keys.altKey) result.push('Alt');
    if (keys.ctrlKey) result.push('Control');
    if (keys.shiftKey) result.push('Shift');
    if (keys.metaKey) result.push('Meta');
    if (keys.additionalKey)
        result.push(
            keys.additionalKey
                .replace(/^Key([A-Z])$/i, (match, letter) => letter)
                .replace(/^Digit([0-9])$/i, (match, digit) => digit),
        );
    return result.join('+');
}
/** @param {ShortcutKeys} key  */
const isModifierKey = (key) => key === 'Shift' || key === 'Control' || key === 'Alt' || key === 'Meta';

/** @param {string} */
const isAllowedCode = (code) => /Key[A-Z]|Digit[0-9]|F[1-12]/.test(code);

/**
 * @param {ShortcutKeys} prevShortcut
 */
export function setShortcut(prevShortcut = {}) {
    const shortcutInput = document.getElementById('shortcutInput');

    const keys = { ...defaultValues, ...prevShortcut };
    let inputValue = mapKeysToString(keys);
    shortcutInput.value = inputValue;

    const saveKeys = debounce(() => storage.saveKeys(keys), 200);
    const clearKeys = () => {
        inputValue = '';
        Object.assign(keys, defaultValues);
        saveKeys();
        shortcutInput.value = inputValue;
    };

    document.getElementById('shortcutClear').addEventListener('click', () => clearKeys());

    shortcutInput.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace') {
            clearKeys();
        } else {
            const isModifier = isModifierKey(e.key);
            if (isModifier || isAllowedCode(e.code)) {
                keys.altKey = e.altKey;
                keys.shiftKey = e.shiftKey;
                keys.ctrlKey = e.ctrlKey;
                keys.metaKey = e.metaKey;
                keys.additionalKey = isModifier ? null : e.code;
                inputValue = mapKeysToString(keys);
                shortcutInput.value = inputValue;
            }
        }
    });
    shortcutInput.addEventListener('keyup', () => saveKeys());
    shortcutInput.addEventListener('input', (e) => {
        e.preventDefault();
        shortcutInput.value = inputValue;
    });
}
