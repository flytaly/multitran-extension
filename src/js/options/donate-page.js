import { applyTheme } from '../apply-theme.js';
import { addresses } from '../donate.js';
import '../l10n.js';
import { storage } from '../storage.js';
import { renderParts } from './render-parts.js';

function addAddresses() {
    const ul = document.getElementById('crypto-list');
    const tmp = document.getElementById('crypto-address');
    for (const info of addresses) {
        /** @type DocumentFragment */
        const fragment = tmp.content.cloneNode(true);
        const li = fragment.querySelector('li');
        const name = li.querySelector('b');
        const container = li.querySelector('[data-type="address"]');
        const copyBtn = li.querySelector('[data-type="copy-btn"]');
        const toggleQRCodeBtn = li.querySelector('[data-type="qrcode-show"]');
        name.textContent = info.name;
        container.textContent = info.address;

        copyBtn?.addEventListener('click', () => {
            navigator.clipboard
                .writeText(info.address)
                .then(() => {
                    const icon = copyBtn.querySelector('[data-type="copy-icon"]');
                    const check = copyBtn.querySelector('[data-type="was-copied"]');
                    icon.classList.add('hidden');
                    check.classList.remove('hidden');
                    setTimeout(() => {
                        icon.classList.remove('hidden');
                        check.classList.add('hidden');
                    }, 2000);
                })
                .catch(console.error);
        });

        toggleQRCodeBtn?.addEventListener('click', () => {
            const img = li.querySelector('[data-type="qrcode"]');
            img.src = info.QRCode;
            img.classList.toggle('hidden');
        });

        ul.appendChild(li);
    }
}

async function init() {
    const options = await storage.getOptions();
    applyTheme(options.theme);
    await renderParts();
    addAddresses();
}

init();
