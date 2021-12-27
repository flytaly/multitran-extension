import { baseURL } from '../constants.js';
import { parser } from './multitran-parser.js';

export function composeURL(text, langFrom, langTo, interfaceLang) {
    return `${baseURL}/m.exe?l1=${langFrom}&l2=${langTo}&SHL=${interfaceLang}&s=${text}`;
}

/**
 * @param {string} url
 */
export async function fetchPage(url) {
    /** @type {{textData:string, error: Error|null }} */
    const result = { textData: '', error: null };
    try {
        const response = await fetch(url);
        if (response.status === 200) {
            const textData = await response.text();
            result.textData = textData;
            return result;
        }
        throw new Error(`Couldn't connect to server: ${response.status} ${response.statusText}`);
    } catch (error) {
        result.error = error;
        return result;
    }
}

async function getParsedData(url) {
    const page = await fetchPage(url);
    if (page.error) return { error: page.error };
    if (!page || !page.textData) return { data: [] };

    const parsed = parser(page.textData);
    return parsed;
}

/**
 * Get translation data. If there is translation in reverse order
 * (e.g. English-Spanish -> Spanish-English) make another request.
 * @param {string} text
 * @param {string} langFrom
 * @param {string} langTo
 * @param {string} interfaceLang
 */
export async function multitranData(text, langFrom, langTo, interfaceLang = 1) {
    const parsed = await getParsedData(composeURL(text, langFrom, langTo, interfaceLang));
    const { otherLang } = parsed;
    const hasReverseTranslation =
        otherLang &&
        otherLang.length &&
        otherLang.some(({ href }) => {
            const params = new URL(href).searchParams;
            return params.get('l1') === langTo && params.get('l2') === langFrom;
        });

    if (hasReverseTranslation) {
        return getParsedData(composeURL(text, langTo, langFrom, interfaceLang));
    }
    return parsed;
}
