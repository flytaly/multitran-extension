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

function getGroupHeader(td) {
    const content = [];
    td.querySelectorAll('a, span, em').forEach((elem) => {
        const resultElem = document.createElement(elem.tagName);
        if (elem.tagName === 'A') resultElem.setAttribute('href', fixURL(elem.getAttribute('href')));
        resultElem.textContent = elem.textContent;
        content.push(resultElem);
    });
    return {
        type: 'header',
        content,
    };
}

function checkOtherLang(html) {
    const result = Array.from(html.querySelectorAll('td.morelangs a'));
    return result.map((a) => {
        a.setAttribute('href', fixURL(a.getAttribute('href')));
        return a;
    });
}

function getTranslationsFromRow(tr) {
    const subjLink = tr.querySelector('td.subj a');
    subjLink.setAttribute('href', fixURL(subjLink.getAttribute('href')));

    const trans = Array.from(tr.querySelectorAll('td.trans > a, td.trans > span')).map((t) => {
        if (t.tagName === 'SPAN') {
            const span = document.createElement('span');
            span.textContent = t.textContent;
            span.classList.add('description');
            return span;
        }
        if (t.tagName === 'A') {
            t.setAttribute('href', fixURL(t.getAttribute('href')));
        }
        return t;
    });

    return {
        type: 'translation',
        subjLink,
        trans,
    };
}

export function parser(text) {
    const html = getParsedHTML(text);
    const tranTable = html.querySelector('table td.subj ~ td.trans')?.closest('table');
    if (!tranTable) return { data: [], otherLang: checkOtherLang(html) };
    const rows = Array.from(tranTable.querySelectorAll('tbody > tr'));

    const data = [];
    rows.forEach((row) => {
        const tds = Array.from(row.querySelectorAll(':scope > td'));
        if (!tds.length) return;
        if (tds.length === 1 && tds[0].getAttribute('colspan') === '2') {
            data.push(getGroupHeader(tds[0]));
        }
        if (tds.length === 2) {
            data.push(getTranslationsFromRow(row));
        }
    });

    return { data };
}
