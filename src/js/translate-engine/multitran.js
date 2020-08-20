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

export async function multitranData(text, langFrom, langTo, interfaceLang = 1) {
    const page = await fetchPage(text, langFrom, langTo, interfaceLang);
    if (page.error) return { error: page.error };
    if (!page || !page.textData) return { data: [] };

    return parser(page.textData);
}
