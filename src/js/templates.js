import { browser } from 'webextension-polyfill-ts';

/**  @type Document */
let parsed;

/**
 * @param {'translate-popup'|'flag-button'|'row-header'|'row-translations'} templateId
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
    switch (templateId) {
        case 'translate-popup':
            return fragment.querySelector('article');
        case 'row-translations':
            return fragment.querySelector('ol');
        case 'flag-button':
            return fragment.querySelector('button');
        default:
            return fragment.querySelector('div');
    }
}
