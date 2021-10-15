/**
 * For some reason in Firefox inside iframes shadow elements don't work
 * if you add them right away. Even if there is "run_at": "document_end" in manifest.
 * One way to fix it is to create shadow element inside requestIdleCallback.
 */
import { browser } from 'webextension-polyfill-ts';

export const shadow = {};

window.requestIdleCallback(() => {
    const shadowHost = document.createElement('span');
    shadowHost.style = 'all:unset;';
    const shadowElem = shadowHost.attachShadow({ mode: 'open' });
    document.body.appendChild(shadowHost);

    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', browser.runtime.getURL('dist/styles.css'));
    shadowElem.appendChild(link);

    shadow.shadowHost = shadowHost;
    shadow.shadowElem = shadowElem;
});
