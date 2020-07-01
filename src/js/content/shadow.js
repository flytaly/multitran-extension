const shadowHost = document.createElement('span');
const shadowElem = shadowHost.attachShadow({ mode: 'open' });
document.body.appendChild(shadowHost);
const link = document.createElement('link');
link.setAttribute('rel', 'stylesheet');
link.setAttribute('href', browser.runtime.getURL('styles/content-popup.css'));
shadowElem.appendChild(link);

export { shadowElem, shadowHost };
