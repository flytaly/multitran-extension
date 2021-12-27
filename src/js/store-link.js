export function addLinkToBrowserStore() {
    const storeLink = document.getElementById('storeLink');
    if (!storeLink) return;
    if (TARGET === 'firefox') {
        storeLink.href = 'https://addons.mozilla.org/firefox/addon/multitran/';
    } else {
        storeLink.href = 'https://chrome.google.com/webstore/detail/multitran-popup/fbncpmcdhgdolipfkpeckjajpgjdpehj';
    }
}
