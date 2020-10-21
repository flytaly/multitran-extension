import { fetchPage } from '../translate-engine/multitran.js';
import { storage } from '../storage.js';

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
}

browser.runtime.onMessage.addListener(handleMessage);
