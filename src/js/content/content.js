const shadowHost = document.createElement('span');
document.body.appendChild(shadowHost);
const shadow = shadowHost.attachShadow({ mode: 'open' });
const link = document.createElement('link');
link.setAttribute('rel', 'stylesheet');
link.setAttribute('href', browser.runtime.getURL('styles/content.css'));
shadow.appendChild(link);
