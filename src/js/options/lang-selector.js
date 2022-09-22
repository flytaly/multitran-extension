/* eslint-disable no-param-reassign */
import browser from 'webextension-polyfill';
import { langIds } from '../constants.js';
import { translateElement } from '../l10n.js';
import { storage } from '../storage.js';

/**
 * @arg {string} l1
 * @arg {string} l2
 * @arg {number} id
 * @arg {(l1:string, l2:string)=>Promise<void>} onChange
 * @arg {(id: string)=>Promise<void>} onDelete
 * @arg {(id: string)=>Promise<void>} onSetMain
 */
function mountLangSelector(l1, l2, id, onChange, onDelete, onSetMain) {
    /** @type DocumentFragment */
    const fragment = document.getElementById('lang-selector-tmp')?.content.cloneNode(true);
    translateElement(fragment);

    const langBlock = fragment.querySelector('[data-type="pair"]');
    /** @type {HTMLSelectElement} */
    const l1Elem = langBlock.querySelector('[name="l1"]');
    /** @type {HTMLSelectElement} */
    const l2Elem = langBlock.querySelector('[name="l2"]');
    const delBtn = langBlock.querySelector('button[name="remove"]');
    const setMainBtn = langBlock.querySelector('button[name="make-main"]');
    const langSwapBtn = langBlock.querySelector('[name="lang-swap"]');

    const updateValues = (l1_, l2_, id_) => {
        langBlock.dataset.id = id_;
        l1Elem.value = l1_;
        l2Elem.value = l2_;
    };

    updateValues(l1, l2, id);

    if (onDelete) {
        delBtn.addEventListener('click', () => onDelete(langBlock.dataset.id));
        delBtn.classList.remove('hidden');
    } else {
        delBtn.classList.add('hidden');
    }

    if (onSetMain) {
        setMainBtn.addEventListener('click', () => onSetMain(langBlock.dataset.id));
        setMainBtn.classList.remove('hidden');
    } else {
        setMainBtn.classList.add('hidden');
    }

    const handler = () => onChange(l1Elem.value, l2Elem.value, langBlock.dataset.id);
    l1Elem.addEventListener('change', handler);
    l2Elem.addEventListener('change', handler);
    langSwapBtn.addEventListener('click', () => {
        [l1Elem.value, l2Elem.value] = [l2Elem.value, l1Elem.value];
        handler();
    });

    const container = document.querySelector('[data-type="lang-pairs"]');
    container.appendChild(langBlock);
    return {
        update: updateValues,
        unmount: () => {
            l1Elem.removeEventListener('change', handler);
            l2Elem.removeEventListener('change', handler);
            container.removeChild(langBlock);
        },
    };
}

export async function setLangSelectorListeners() {
    const refs = {
        /** @type {Array<ReturnType<mountLanguageSelector>>} refs to language pairs selectors */
        pairs: [],
    };

    let options = await storage.getOptions();
    const commitChanges = () => storage.saveOptions(options);

    const addButton = document.getElementById('add-pair');
    addButton.addEventListener('click', () => {
        if (options.pairs.length > 3) return;
        options.pairs.push([langIds.German, langIds.English]);
        commitChanges();
    });

    function render() {
        const onUpdate = async (l1, l2, idx) => {
            options.pairs[idx] = [l1, l2];
            return commitChanges();
        };
        const onRemove = async (idx) => {
            if (options.pairs.length <= 1) return;
            options.pairs.splice(idx, 1);
            return commitChanges();
        };
        const onSetMain = async (idx) => {
            const { pairs } = options;
            [pairs[0], pairs[idx]] = [pairs[idx], pairs[0]];
            return commitChanges();
        };

        // mount or update
        options.pairs.forEach(([l1, l2], idx) => {
            if (!refs.pairs[idx]) {
                refs.pairs.push(mountLangSelector(l1, l2, idx, onUpdate, idx && onRemove, idx && onSetMain));
                return;
            }
            refs.pairs[idx].update(l1, l2, idx);
        });

        // unmount on delete
        const len = options.pairs.length;
        if (len < refs.pairs.length) {
            refs.pairs.filter((_, i) => i >= len).forEach((c) => c.unmount());
            refs.pairs = refs.pairs.filter((_, i) => i < len);
        }

        if (options.pairs.length > 2) {
            addButton.classList.add('hidden');
        } else {
            addButton.classList.remove('hidden');
        }
    }

    browser.storage.local.onChanged.addListener((change) => {
        if (change.options.newValue) {
            options = { ...options, ...change.options.newValue };
        }
        render();
    });

    render(options);
}
