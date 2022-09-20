/* eslint-disable no-param-reassign */
import browser from 'webextension-polyfill';
import { langIds } from './constants.js';
import { storage } from './storage.js';


/**
 * @arg {string} l1
 * @arg {string} l2
 * @arg {number} id
 * @arg {(l1:string, l2:string)=>Promise<void>} changeHandler
 * @arg {()=>Promise<void>} deleteHandler
 */
function mountLanguageSelector(l1, l2, id, changeHandler, deleteHandler) {
    /** @type DocumentFragment */
    const fragment = document.getElementById('lang-selector-tmp')?.content.cloneNode(true);

    const langBlock = fragment.querySelector('[data-type="pair"]');
    /** @type {HTMLSelectElement} */
    const l1Elem = langBlock.querySelector('[name="l1"]');
    /** @type {HTMLSelectElement} */
    const l2Elem = langBlock.querySelector('[name="l2"]');
    const delBtn = langBlock.querySelector('button[name="remove"]');
    const langSwap = langBlock.querySelector('[name="lang-swap"]');

    const updateValues = (l1_, l2_, id_) => {
        langBlock.dataset.id = id_;
        l1Elem.value = l1_;
        l2Elem.value = l2_;
    };

    updateValues(l1, l2, id);

    langSwap.addEventListener('click', () => {
        [l1Elem.value, l2Elem.value] = [l2Elem.value, l1Elem.value];
        storage.saveOptions({ l1: l1Elem.value, l2: l2Elem.value });
    });

    if (deleteHandler) {
        delBtn.addEventListener('click', () => deleteHandler(langBlock.dataset.id));
        delBtn.classList.remove('hidden');
    } else {
        delBtn.classList.add('hidden');
    }

    const handler = () => changeHandler(l1Elem.value, l2Elem.value, langBlock.dataset.id);
    l1Elem.addEventListener('change', handler);
    l2Elem.addEventListener('change', handler);

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
        /** @type {ReturnType<mountLanguageSelector>|null} reference to the main pair selector */
        main: null,
        /** @type {Array<ReturnType<mountLanguageSelector>>} refs to additional pairs selectors */
        extra: [],
    };

    let options = await storage.getOptions();
    const commitChanges = () => storage.saveOptions(options);

    const addButton = document.getElementById('add-pair');
    addButton.addEventListener('click', () => {
        if (options.additionalPairs.length >= 3) return;
        options.additionalPairs.push([langIds.German, langIds.English]);
        commitChanges();
    });

    function render() {
        if (!refs.main) {
            refs.main = mountLanguageSelector(options.l1, options.l2, -1, (l1, l2) => {
                [options.l1, options.l2] = [l1, l2];
                commitChanges();
            });
        } else {
            refs.main.update(options.l1, options.l2);
        }

        options.additionalPairs.forEach((p, index) => {
            if (!refs.extra[index]) {
                const onUpdate = async (l1_, l2_, idx) => {
                    options.additionalPairs[idx][0] = l1_;
                    options.additionalPairs[idx][1] = l2_;
                    commitChanges();
                };
                const onRemove = async (idx) => {
                    options.additionalPairs.splice(idx, 1);
                    commitChanges();
                };
                const controls = mountLanguageSelector(p[0], p[1], index, onUpdate, onRemove);
                refs.extra.push(controls);
            } else {
                refs.extra[index].update(p[0], p[1], index);
            }
        });

        const len = options.additionalPairs.length;
        if (len < refs.extra.length) {
            refs.extra.filter((_, i) => i >= len).forEach((c) => c.unmount());
            refs.extra = refs.extra.filter((_, i) => i < len);
        }

        if (options.additionalPairs.length >= 2) {
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
