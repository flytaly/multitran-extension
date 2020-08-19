import { baseURL } from '../configs.js';
import { parser } from './multitran-parser.js';

let lastFetchTS = 0;
const throttleDuration = 600;

export async function fetchPage(text, langFrom, langTo, interfaceLang) {
    const url = `${baseURL}/m.exe?l1=${langFrom}&l2=${langTo}&SHL=${interfaceLang}&s=${text}`;
    try {
        const response = await fetch(url);
        if (response.status === 200) {
            const data = await response.text();
            return { data };
        }
        throw new Error(`Couldn't connect to server: ${response.status} ${response.statusText}`);
    } catch (error) {
        return { error };
    }
}

export async function multitranData(text, langFrom, langTo, interfaceLang = 1) {
    const emptyData = { data: [] };

    const timestamp = Date.now();
    if (timestamp - lastFetchTS < throttleDuration) {
        return emptyData;
    }
    lastFetchTS = timestamp;

    const page = await fetchPage(text, langFrom, langTo, interfaceLang);
    if (!page || !page.data) return emptyData;
    if (page.error) return { error: page.error };

    return parser(page.data);
}
