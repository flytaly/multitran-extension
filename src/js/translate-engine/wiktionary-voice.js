import { langIds } from '../constants.js';

/**
 * @typedef {Object} AudioFile
 * @property {string} flag
 * @property {string} title
 * @property {string} url
 * @property
 */

/**
 * @typedef {"en"|"ru"} SubDomain
 * @type {Record<string, SubDomain>} */
const subDomains = {
    [langIds.English]: 'en',
    [langIds.Russian]: 'ru',
};

const filterLanguages = (langId) => (fileTitle) => {
    if (langId === langIds.English) return /en-us|en-uk|en-au/i.test(fileTitle);
    if (langId === langIds.Russian) return /file:ru/i.test(fileTitle);
};

/**
 * @param {string} fileTitle
 * @param {string} langId
 */
const getIcon = (fileTitle, langId) => {
    if (langId === langIds.English) {
        const match = fileTitle.match(/(en-us)|(en-uk)|(en-au)/i);
        if (!match) return;
        if (match[1]) return '/images/flags/us.svg';
        if (match[2]) return '/images/flags/uk.svg';
        if (match[3]) return '/images/flags/au.svg';
    }
    if (langId === langIds.Russian) {
        const match = fileTitle.match(/file:ru/i);
        if (match) return '/images/flags/ru.svg';
    }
};

/**
 * @param {SubDomain} subDomain
 * @param {string} word
 * @returns {Promise<{ title: string, type: string}[]}} files
 */
const getAudioFilesOnPage = async (subDomain, word) => {
    const url = `https://${subDomain}.wiktionary.org/api/rest_v1/page/media-list/${word}`;
    const resp = await fetch(url);

    /** @type {{items: Array<{title:string, type: string}>} */
    const data = await resp.json();
    if (data && data.items && data.items.length) {
        return data.items.filter((i) => i.type === 'audio');
    }
    return [];
};

/**
 *
 * @param {{title:string}[]} files
 * @param {string} langId
 * @returns {Promise<AudioFile[]>}
 */
const getFileUrls = async (files, langId) => {
    const titles = files.map((f) => f.title).filter(filterLanguages(langId));
    const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url&titles=${titles.join(
        '|',
    )}`;
    const resp = await fetch(url);
    const data = await resp.json();
    if (data && data.query && data.query.pages) {
        const urls = [];
        Object.keys(data.query.pages).forEach((p) => {
            const page = data.query.pages[p];
            if (page.title && page.imageinfo && page.imageinfo[0] && page.imageinfo[0].url) {
                urls.push({
                    title: page.title,
                    url: page.imageinfo[0].url,
                    flag: getIcon(page.title, langId),
                });
            }
        });
        return urls;
    }
    return [];
};
/**
 *
 * @param {string} word
 * @param {string} lang
 * @returns {Promise<Array<AudioFile>|undefined>} [files]
 */
export const getAudioUrls = async (word, lang) => {
    const subDomain = subDomains[lang];
    if (subDomain) {
        const files = await getAudioFilesOnPage(subDomain, word.toLowerCase());
        const urls = await getFileUrls(files, lang);
        return urls;
    }
    return [];
};
