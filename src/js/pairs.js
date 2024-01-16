import browser from 'webextension-polyfill';
import { translateElement } from './l10n.js';

/**  @type Document */
let parsed;

/**
 * @arg {'main-languages'|'all-languages'} pairs
 */
export async function getPairsElements(pairs = 'main-languages') {
    if (!parsed) {
        const res = await fetch(browser.runtime.getURL('template-pairs.html'));
        const txt = await res.text();
        parsed = new DOMParser().parseFromString(txt, 'text/html');
    }
    const tmp = parsed.getElementById(pairs);
    /** @type DocumentFragment */
    const fragment = tmp?.content.cloneNode(true);
    translateElement(fragment);
    return Array.from(fragment.children);
}
