# <img src="extension/images/icon_light.svg" width="24px"> Multitran Popup

![Chrome Web Store](https://img.shields.io/chrome-web-store/v/fbncpmcdhgdolipfkpeckjajpgjdpehj) ![Chrome Web Store](https://img.shields.io/chrome-web-store/stars/fbncpmcdhgdolipfkpeckjajpgjdpehj)
![Chrome Web Store](https://img.shields.io/chrome-web-store/users/fbncpmcdhgdolipfkpeckjajpgjdpehj)

![Mozilla Add-on](https://img.shields.io/amo/v/multitran) ![Mozilla Add-on](https://img.shields.io/amo/stars/multitran) ![Mozilla Add-on](https://img.shields.io/amo/users/multitran)

[ ![chrome.google.com/](https://i.imgur.com/unvdmLG.png)](https://chrome.google.com/webstore/detail/multitran-popup/fbncpmcdhgdolipfkpeckjajpgjdpehj)
[ ![addons.mozilla.org/](https://ffp4g1ylyit3jdyti1hqcvtb-wpengine.netdna-ssl.com/addons/files/2015/11/get-the-addon.png)](https://addons.mozilla.org/en-US/firefox/addon/multitran/)

Browser extension for translating words on webpages and in the toolbar popup using [multitran.com](https://www.multitran.com/) dictionary.

## Usage

Build and watch for changes in js and style files, then run corresponding browser with `web-ext`.

    npm run dev:chrome
    npm run dev:ff

Create production build in the **extension** folder.

    npm run build:chrome
    npm run build:ff

The extension uses **TailwindCSS** for styles and **esbuild** for bundling.

## License

The code of the extension is licensed under the [MPL-2.0](LICENSE).
