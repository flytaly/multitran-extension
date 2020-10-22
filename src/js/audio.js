const getFlagUrl = (title) => {
    if (/en-uk/i.test(title)) {
        return browser.runtime.getURL('/images/flags/uk.svg');
    }
    if (/en-us/i.test(title)) {
        return browser.runtime.getURL('/images/flags/us.svg');
    }
    if (/en-au/i.test(title)) {
        return browser.runtime.getURL('/images/flags/au.svg');
    }
};

/**
 * @param {HTMLElement} container
 * @param {Object} audioFiles
 */
export const addAudioElements = (container, audioFiles) => {
    const flags = [];
    if (!container) return;
    audioFiles.forEach((file) => {
        if (!file.flag) return;
        const flagUrl = browser.runtime.getURL(file.flag);
        if (flagUrl) {
            const flagButton = document.createElement('button');
            const img = document.createElement('img');
            const audio = new Audio(file.url);
            flagButton.title = file.title;
            img.src = flagUrl;
            flagButton.appendChild(img);
            flagButton.onclick = () => {
                audio.play();
            };
            flags.push(flagButton);
        }
    });
    container.append(...flags);
};
