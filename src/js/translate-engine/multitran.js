import { baseURL } from '../configs.js';
import { parser } from './multitran-parser.js';

export async function fetchPage(text, langFrom, langTo, interfaceLang) {
    const url = `${baseURL}/m.exe?l1=${langFrom}&l2=${langTo}&SHL=${interfaceLang}&s=${text}`;
    try {
        const response = await fetch(url);
        if (response.status === 200) {
            const textData = await response.text();
            return { textData };
        }
        throw new Error(`Couldn't connect to server: ${response.status} ${response.statusText}`);
    } catch (error) {
        return { error };
    }
}

async function getParsedData(text, langFrom, langTo, interfaceLang = 1) {
    const page = await fetchPage(text, langFrom, langTo, interfaceLang);
    if (page.error) return { error: page.error };
    if (!page || !page.textData) return { data: [] };

    const parsed = parser(page.textData);
    return parsed;
}

/**
 * Get translation data. If there is translation in reverse order
 * (e.g. English-Spanish -> Spanish-English) make another request.
 */
export async function multitranData(text, langFrom, langTo, interfaceLang = 1) {
    const parsed = await getParsedData(text, langFrom, langTo, interfaceLang);
    const { otherLang } = parsed;
    const hasReverseTranslation =
        otherLang &&
        otherLang.length &&
        otherLang.some(({ href }) => {
            const params = new URL(href).searchParams;
            return params.get('l1') === langTo && params.get('l2') === langFrom;
        });

    if (hasReverseTranslation) {
        return getParsedData(text, langTo, langFrom, interfaceLang);
    }
    return parsed;
}
