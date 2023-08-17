import browser from 'webextension-polyfill';
import { getTemplate } from './templates.js';

/**
 * @param {HTMLElement} container
 * @param {(import('./engine/wiktionary-voice').AudioFile)[]} audioFiles
 */
export const addAudioElements = async (container, audioFiles) => {
    const flags = [];
    if (!container || !audioFiles) return;
    for (const file of audioFiles) {
        if (!file.flag) return;
        const flagUrl = browser.runtime.getURL(file.flag);
        if (flagUrl) {
            /** @type {HTMLButtonElement} */
            const flagButton = await getTemplate('flag-button');
            const img = flagButton.querySelector('img');
            const spinner = flagButton.querySelector('svg');
            flagButton.title = file.title;
            img.src = flagUrl;
            flagButton.appendChild(img);
            flagButton.onclick = () => {
                // new Audio(url) is blocked in FF by Content Security Policy
                const audio = document.createElement('audio');
                audio.onloadstart = () => {
                    img.style.opacity = '0.4' 
                    spinner?.classList.remove('hidden');
                };
                audio.onloadeddata = () => {
                    img.style.opacity = '1' 
                    spinner?.classList.add('hidden');
                }
                audio.onplay = () => {
                    flagButton.disabled = true
                }
                audio.onended = () => {
                    flagButton.disabled = false
                }
                audio.src = file.url;
                audio.play();
            };
            flags.push(flagButton);
        }
    }
    container.append(...flags);
};
