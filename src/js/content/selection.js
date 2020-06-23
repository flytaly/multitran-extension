import { getCaretCoordinates } from './caret-pos.js';

export function getSelection(target) {
    let selection;
    const coords = { top: 0, left: 0 };
    if (['TEXTAREA', 'INPUT'].includes(target.nodeName)) {
        selection = target.value.substring(target.selectionStart, target.selectionEnd);
        const caret = getCaretCoordinates(target, target.selectionEnd);
        coords.top = target.offsetTop - target.scrollTop + caret.top;
        coords.left = target.offsetLeft - target.scrollLeft + caret.left;
    } else {
        const sel = window.getSelection();
        selection = sel.toString();
        const { top, right } = sel.getRangeAt(0).getBoundingClientRect();
        coords.top = window.pageYOffset + top;
        coords.left = window.pageXOffset + right;
    }
    selection = selection.trim();

    return { selection, coords };
}
