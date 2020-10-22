import { langIds } from '../configs.js';

const subDomains = {
    [langIds.English]: 'en',
};

const filterLanguages = (langId) => (fileTitle) => {
    if (langId === langIds.English) return /en-us|en-uk|en-au/i.test(fileTitle);
};

const getAudioFilesOnPage = async (subDomain, word) => {
    const url = `https://${subDomain}.wiktionary.org/api/rest_v1/page/media-list/${word}`;
    const resp = await fetch(url);
    const data = await resp.json();
    if (data && data.items && data.items.length) {
        return data.items.filter((i) => i.type === 'audio');
    }
    return [];
};

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
                urls.push({ title: page.title, url: page.imageinfo[0].url });
            }
        });
        return urls;
    }
    return [];
};

export const getAudioUrls = async (word, lang) => {
    const subDomain = subDomains[lang];
    if (subDomain) {
        const files = await getAudioFilesOnPage(subDomain, word.toLowerCase());
        const urls = await getFileUrls(files, lang);
        return urls;
    }
};
