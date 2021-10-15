/* eslint-disable no-param-reassign */
import { baseURL } from '../configs.js';

function fixURL(relativeURL) {
    if (relativeURL.startsWith('/m.exe')) return baseURL + relativeURL;
    return relativeURL;
}
function getParsedHTML(text) {
    const htmlParser = new DOMParser();
    return htmlParser.parseFromString(text, 'text/html');
}
/**
 * @typedef {Object} MtGroupHeader
 * @property {"header"} type
 * @property {Array<HTMLElement>} content
 */
/**
 * @param {Element} td
 * @returns {MtGroupHeader}
 */
function getGroupHeader(td) {
    const content = [];
    td.querySelectorAll('a, span, em').forEach((elem) => {
        const resultElem = document.createElement(elem.tagName);
        if (elem.tagName === 'A') {
            resultElem.setAttribute('href', fixURL(elem.getAttribute('href')));
            resultElem.setAttribute('target', '_blank');
        }
        resultElem.textContent = elem.textContent;
        content.push(resultElem);
    });
    return {
        type: 'header',
        content,
    };
}
/**
 *
 * @param {Element} html
 * @returns {Array<HTMLAnchorElement>}
 */
function checkOtherLang(html) {
    const result = Array.from(html.querySelectorAll('td.morelangs a'));
    return result.map((a) => {
        a.setAttribute('href', fixURL(a.getAttribute('href')));
        a.setAttribute('target', '_blank');
        return a;
    });
}
/**
 * @typedef {Object} MtGroupTrans
 * @property {"translation"} type
 * @property {(HTMLAnchorElement|null)} subjLink
 * @property {Array<HTMLElement>} trans
 */
/**
 * @param {Element} tr
 */
function getTranslationsFromRow(tr) {
    /** @type MtGroupTrans */
    const result = {
        type: 'translation',
        subjLink: null,
        trans: [],
    };
    result.subjLink = tr.querySelector('td.subj a');
    if (result.subjLink) {
        result.subjLink.setAttribute('href', fixURL(result.subjLink.getAttribute('href')));
        result.subjLink.setAttribute('target', '_blank');
    }

    const translations = tr.querySelector('td.trans, td.trans1');
    if (!translations) return result;
    for (let node = translations.firstChild; node; node = node.nextSibling) {
        if (node.nodeType === Node.TEXT_NODE) {
            result.trans.push(node);
        }
        if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.tagName === 'SPAN') {
                const span = document.createElement('span');
                span.textContent = node.textContent;
                span.classList.add('description');
                result.trans.push(span);
            }
            if (node.tagName === 'A') {
                node.setAttribute('href', fixURL(node.getAttribute('href')));
                node.setAttribute('target', '_blank');
                result.trans.push(node);
            }
        }
    }
    return result;
}

/**
 * @typedef {(MtGroupTrans|MtGroupHeader)} MtGroup
 *
 * @typedef {Object} ParsedPage
 * @property {Array<MtGroup>} data - translations
 * @property {string} [l1] - "from" language
 * @property {string} [l2] - "to" language
 * @property {Array<HTMLAnchorElement>} [otherLang] - translation in other language pairs
 */

/**
 * @param {string} text
 * @returns {ParsedPage} parsedPage
 */
export function parser(text) {
    const html = getParsedHTML(text);
    const tranTable = html.querySelector('table td.subj ~ td.trans, table td.subj ~ td.trans1')?.closest('table');
    if (!tranTable) return { data: [], otherLang: checkOtherLang(html) };
    const rows = Array.from(tranTable.querySelectorAll('tbody > tr'));

    const data = [];
    rows.forEach((row) => {
        const tds = Array.from(row.querySelectorAll(':scope > td'));
        if (!tds.length) return;
        if (tds.length === 1 && tds[0].getAttribute('colspan') === '2') {
            const gH = getGroupHeader(tds[0]);
            if (gH.content.length) data.push(gH);
        }
        if (tds.length === 2) {
            const translations = getTranslationsFromRow(row);
            if (translations.trans && translations.trans.length) {
                data.push(translations);
            }
        }
    });

    const l1Input = html.getElementById('l1');
    const l2Input = html.getElementById('l2');
    const l1 = l1Input && l1Input.value;
    const l2 = l2Input && l2Input.value;
    return { data, l1, l2 };
}
