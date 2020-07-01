import { getCaretCoordinates } from './caret-pos.js';

export function getSelection(target) {
    let selection;
    const coords = { top: 0, left: 0 };
    if (['TEXTAREA', 'INPUT'].includes(target.nodeName)) {
        selection = target.value.substring(target.selectionStart, target.selectionEnd);
        const caret = getCaretCoordinates(target, target.selectionEnd);
        const { top, left, height } = target.getBoundingClientRect();

        coords.top = top - target.scrollTop + caret.top + height;
        coords.left = left - target.scrollLeft + caret.left;
        coords.height = height;
    } else {
        const sel = window.getSelection();
        selection = sel.toString();
        const { bottom, left, height } = sel.getRangeAt(0).getBoundingClientRect();
        coords.top = bottom;
        coords.left = left;
        coords.height = height;
    }
    selection = selection.trim();

    return { selection, coords };
}
