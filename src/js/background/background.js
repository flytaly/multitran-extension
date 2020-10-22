import { fetchPage } from '../translate-engine/multitran.js';
import { storage } from '../storage.js';
import { getAudioUrls } from '../translate-engine/wiktionary-voice.js';

async function handleMessage(request) {
    if (request.type === 'GET_MULTITRAN_DATA') {
        const { selection } = request;
        if (selection) {
            const { l1, l2, multitranLang } = await storage.getOptions();
            const { error, textData } = await fetchPage(selection, l1, l2, multitranLang);
            if (error) console.error(error);
            if (!textData) return;

            return {
                type: 'MULTITRAN_DATA',
                translationPage: textData,
                text: selection,
                l1,
                l2,
            };
        }
    }

    if (request.type === 'GET_PRONUNCIATION') {
        const audio = await getAudioUrls(request.word, request.lang);
        return { type: 'PRONUNCIATION_LIST', audio };
    }
}

browser.runtime.onMessage.addListener(handleMessage);
