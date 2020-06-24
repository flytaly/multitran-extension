/* eslint-disable no-param-reassign */
const baseURL = 'https://www.multitran.com';

function fixURL(relativeURL) {
    if (relativeURL.startsWith('/m.exe')) return baseURL + relativeURL;
    return '#';
}
function getParsedHTML(text) {
    const htmlParser = new DOMParser();
    return htmlParser.parseFromString(text, 'text/html');
}

function getGroupHeader(td) {
    const content = [];
    td.querySelectorAll('a, span, em').forEach((elem) => {
        content.push({
            tag: elem.tagName,
            ...(elem.tagName === 'A' ? { href: fixURL(elem.getAttribute('href')) } : {}),
            text: elem.textContent,
        });
    });
    return {
        type: 'header',
        content,
    };
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
    if (!tranTable) return null;
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

    // console.log(data);
    return data;
}
