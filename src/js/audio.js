import { browser } from 'webextension-polyfill-ts';
import { getTemplate } from './templates.js';

/**
 * @param {HTMLElement} container
 * @param {(import('./translate-engine/wiktionary-voice').AudioFile)[]} audioFiles
 */
export const addAudioElements = async (container, audioFiles) => {
    const flags = [];
    if (!container || !audioFiles) return;
    for (const file of audioFiles) {
        if (!file.flag) return;
        const flagUrl = browser.runtime.getURL(file.flag);
        if (flagUrl) {
            const flagButton = await getTemplate('flag-button');
            const img = flagButton.querySelector('img');
            flagButton.title = file.title;
            img.src = flagUrl;
            flagButton.appendChild(img);
            flagButton.onclick = () => {
                // new Audio(url) is blocked in FF by Content Security Policy
                const audio = document.createElement('audio');
                audio.src = file.url;
                audio.play();
            };
            flags.push(flagButton);
        }
    }
    container.append(...flags);
};
