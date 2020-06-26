import { baseURL } from '../configs.js';
import { parser } from './multitran-parser.js';

export async function fetchPage(text, langFrom, langTo, interfaceLang) {
    const url = `${baseURL}/m.exe?l1=${langFrom}&l2=${langTo}&SHL=${interfaceLang}&s=${text}`;
    const response = await fetch(url);
    try {
        if (response.status === 200) {
            const data = await response.text();
            return data;
        }
        console.log("Couldn't connect to server:", response.status, response.statusText);
    } catch (error) {
        console.error(error);
    }
    return null;
}

export async function multitranData(text, langFrom, langTo, interfaceLang = 1) {
    const page = await fetchPage(text, langFrom, langTo, interfaceLang);

    if (!page) return { data: [] };

    return parser(page);
}
