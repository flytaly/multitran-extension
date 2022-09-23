import browser from 'webextension-polyfill';
import pkg from '../../../package.json';
import { translateElement } from '../l10n.js';

export async function renderParts() {
    const parts = Array.from(document.querySelectorAll('[data-path]'));

    await Promise.all(
        parts.map(async (elem) => {
            if (!elem.dataset.path) return;
            try {
                const resp = await fetch(browser.runtime.getURL(elem.dataset.path));
                const data = await resp.text();
                elem.innerHTML = data;
                translateElement(elem);
            } catch (error) {
                console.error(error);
            }
        }),
    );

    const v = document.querySelector('[data-type="version"]');
    if (v) v.textContent = `v${pkg.version}`;
}
