import pkg from '../package.json';
import { TARGET } from '../scripts/utils.js';

const info = {
    default_locale: 'en',
    description: '__MSG_description__',
    name: '__MSG_name__',
    short_name: 'Multitran-popup',
    version: pkg.version,
    homepage_url: 'https://github.com/flytaly/multitran-extension',
};

const action = {
    default_title: '__MSG_extension_title__',
    default_icon: {
        16: 'images/icon_light-16.png',
        32: 'images/icon_light-32.png',
        64: 'images/icon_light-64.png',
    },
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
    default_popup: 'popup.html',
};

function browserSpecific() {
    const bgScript = './dist/background/background.js';
    let manifest = {};
    if (TARGET === 'chrome') {
        manifest = {
            minimum_chrome_version: '94',
            background: {
                service_worker: bgScript,
            },
            permissions: ['storage', 'contextMenus'],
            host_permissions: [
                'https://www.multitran.com/*',
                'https://*.wiktionary.org/api/*',
                'https://*.wikimedia.org/*',
            ],
            web_accessible_resources: [
                {
                    resources: ['templates.html', 'dist/styles.css', 'images/flags/*.svg'],
                    matches: ['<all_urls>'],
                },
            ],
            action,
            commands: {
                _execute_action: {
                    suggested_key: {
                        default: 'Alt+M',
                    },
                },
            },
        };
    }
    if (TARGET === 'firefox') {
        manifest = {
            manifest_version: 2,
            applications: {
                gecko: {
                    strict_min_version: '101',
                    id: 'multitran@flytaly',
                },
            },
            background: {
                scripts: [bgScript],
            },
            permissions: [
                'storage',
                'contextMenus',
                'https://www.multitran.com/*',
                'https://*.wiktionary.org/api/*',
                'https://*.wikimedia.org/*',
            ],
            browser_action: action,
            web_accessible_resources: ['templates.html', 'dist/styles.css', 'images/flags/*.svg'],
            commands: {
                _execute_browser_action: {
                    suggested_key: {
                        default: 'Alt+M',
                    },
                },
            },
        };
    }
    return manifest;
}

export async function getManifest() {
    return {
        manifest_version: 3,
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
        icons: {
            48: 'images/icon_light-48.png',
            64: 'images/icon_light-64.png',
            96: 'images/icon_light-96.png',
            128: 'images/icon_light-128.png',
        },
        options_ui: {
            page: 'options.html',
            open_in_tab: true,
        },
    };
}
