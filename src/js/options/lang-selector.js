import browser from 'webextension-polyfill';
import { langIds } from '../constants.js';
import { translateElement } from '../l10n.js';
import { storage } from '../storage.js';
import { getPairsElements } from '../pairs.js';

/**
 * @typedef {import('../storage.js').Options} Options
 */

/**
 * @typedef {Object} SelectorListeners
 * @property {(l1:string, l2:string)=>Promise<void>} onChange
 * @property {(id: string)=>Promise<void>} onDelete
 * @property {(id: string)=>Promise<void>} onSetMain
 */

/**
 * @arg {string} l1
 * @arg {string} l2
 * @arg {number} id
 * @arg {Options} options
 * @arg {SelectorListeners} listeners
 */
async function mountLangSelector(l1, l2, id, options, { onChange, onDelete, onSetMain } = {}) {
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

    const renderOptions = async (allPairs = false) => {
        const langOpts = await getPairsElements(allPairs ? 'all-languages' : 'main-languages');
        l1Elem.innerHTML = '';
        l1Elem.append(...langOpts.map((elem) => elem.cloneNode(true)));
        l2Elem.innerHTML = '';
        l2Elem.append(...langOpts.map((elem) => elem.cloneNode(true)));
    };

    /** @arg {Options} options_ */
    const updateValues = async (l1_, l2_, id_, options_) => {
        await renderOptions(options_.allPairs);
        langBlock.dataset.id = id_;
        l1Elem.value = l1_;
        l2Elem.value = l2_;
    };

    await updateValues(l1, l2, id, options);

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

/** @arg {import('../storage.js').Options} options */
export async function setLangSelectorListeners(options) {
    const refs = {
        /** @type {Array<Awaited<ReturnType<typeof mountLangSelector>>>} refs to language pairs selectors */
        pairs: [],
    };

    const commitChanges = () => storage.saveOptions(options);

    const addButton = document.getElementById('add-pair');
    addButton.addEventListener('click', () => {
        if (options.pairs.length > 3) return;
        options.pairs.push([langIds.German, langIds.English]);
        commitChanges();
    });

    async function render() {
        const onChange = async (l1, l2, idx) => {
            options.pairs[idx] = [l1, l2];
            return commitChanges();
        };
        const onDelete = async (idx) => {
            if (options.pairs.length <= 1) return;
            options.pairs.splice(idx, 1);
            options.currentPair = options.currentPair < options.pairs.length ? options.currentPair : 0;
            return commitChanges();
        };
        const onSetMain = async (idx) => {
            const { pairs } = options;
            [pairs[0], pairs[idx]] = [pairs[idx], pairs[0]];
            return commitChanges();
        };

        // mount or update
        await Promise.allSettled(
            options.pairs.map(async ([l1, l2], idx) => {
                if (!refs.pairs[idx]) {
                    const selector = await mountLangSelector(l1, l2, idx, options, {
                        onChange,
                        onDelete: idx !== 0 && onDelete,
                        onSetMain: idx !== 0 && onSetMain,
                    });
                    refs.pairs.push(selector);
                    return;
                }
                await refs.pairs[idx].update(l1, l2, idx, options);
            }),
        );

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

    render();
}
