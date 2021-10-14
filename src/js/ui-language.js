import { browser } from 'webextension-polyfill-ts';

const UILang = browser.i18n.getUILanguage();

export default UILang;
