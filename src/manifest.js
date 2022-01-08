import pkg from '../package.json';
import { TARGET } from '../scripts/utils.js';

function browserSpecific() {
    const manifest = {};
    if (TARGET === 'chrome') {
        manifest.minimum_chrome_version = '80';
    }
    if (TARGET === 'firefox') {
        manifest.applications = {
            gecko: {
                strict_min_version: '75.0',
                id: 'multitran@flytaly',
            },
        };
    }
    return manifest;
}

const info = {
    default_locale: 'en',
    description: '__MSG_description__',
    name: '__MSG_name__',
    short_name: 'Multitran-popup',
    version: pkg.version,
    homepage_url: 'https://github.com/flytaly/multitran-extension',
};

/* Firefox only */
const themeIcons =
    TARGET === 'firefox'
        ? {
              theme_icons: [
                  {
                      dark: 'images/icon-16.png',
                      light: 'images/icon_light-16.png',
                      size: 16,
                  },
                  {
                      dark: 'images/icon-32.png',
                      light: 'images/icon_light-32.png',
                      size: 32,
                  },
                  {
                      dark: 'images/icon-64.png',
                      light: 'images/icon_light-64.png',
                      size: 64,
                  },
              ],
          }
        : {};

export async function getManifest() {
    // update this file to update this manifest.json
    // can also be conditional based on your need
    return {
        manifest_version: 2,
        ...info,
        ...browserSpecific(),
        content_scripts: [
            {
                matches: ['<all_urls>'],
                js: ['dist/content/content.js'],
                run_at: 'document_end',
                all_frames: true,
            },
        ],
        background: {
            scripts: ['dist/background/background.js'],
        },
        web_accessible_resources: ['templates.html', 'dist/styles.css', 'images/flags/*.svg'],
        icons: {
            48: 'images/icon_light-48.png',
            64: 'images/icon_light-64.png',
            96: 'images/icon_light-96.png',
            128: 'images/icon_light-128.png',
        },
        permissions: [
            'storage',
            'contextMenus',
            'https://www.multitran.com/*',
            'https://*.wiktionary.org/api/*',
            'https://*.wikimedia.org/*',
        ],
        browser_action: {
            default_title: '__MSG_extension_title__',
            default_icon: {
                16: 'images/icon_light-16.png',
                32: 'images/icon_light-32.png',
                64: 'images/icon_light-64.png',
            },
            ...themeIcons,
            default_popup: 'popup.html',
        },
        options_ui: {
            page: 'options.html',
            open_in_tab: true,
        },
        commands: {
            // @ts-ignore
            _execute_browser_action: {
                suggested_key: {
                    default: 'Alt+M',
                },
            },
        },
    };
}
