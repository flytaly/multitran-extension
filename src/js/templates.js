import browser from 'webextension-polyfill';
import { translateElement } from './l10n.js';

/**  @type Document */
let parsed;

/**
 * @param {'translate-popup'|'flag-button'|'translation-list-header'|'translation-list'} templateId
 */
export async function getTemplate(templateId) {
    if (!parsed) {
        const res = await fetch(browser.runtime.getURL('templates.html'));
        const txt = await res.text();
        parsed = new DOMParser().parseFromString(txt, 'text/html');
    }
    const tmp = parsed.getElementById(templateId);
    /** @type DocumentFragment */
    const fragment = tmp?.content.cloneNode(true);
    translateElement(fragment);
    switch (templateId) {
        case 'translate-popup':
            return fragment.querySelector('article');
        case 'translation-list':
            return fragment.querySelector('ol');
        case 'flag-button':
            return fragment.querySelector('button');
        default:
            return fragment.querySelector('div');
    }
}
