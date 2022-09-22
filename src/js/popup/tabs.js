import { idToLangMap } from '../utils.js';

let currentTab = 0;

/** @arg {() => void} callback */
export function onAddingTab(callback) {
    document.getElementById('add-pair').addEventListener('click', callback);
}

/**
 * @arg {[string, string][]} pairs
 * @arg {(tabIdx: number) => void} onChange
 * */
export function updateTabs(pairs, onChange) {
    const tabsBlock = document.querySelector('#tabs');
    const tabList = tabsBlock.querySelectorAll('button');
    const addPairBtn = document.getElementById('add-pair');

    function updateClass() {
        tabsBlock.querySelectorAll('button').forEach((t) => {
            if (parseInt(t.dataset.id) !== currentTab) {
                t.classList.remove('tab-active');
                return;
            }
            t.classList.add('tab-active');
        });
    }

    pairs.forEach(([l1, l2], idx) => {
        let tab = tabList[idx];
        if (!tab) {
            tab = document.createElement('button');
            tab.classList.add('tab');
            tabsBlock.appendChild(tab);
            tab.addEventListener('click', (e) => {
                currentTab = parseInt(e.currentTarget.dataset.id) || 0;
                updateClass();
                onChange(currentTab);
            });
        }
        tab.dataset.id = idx;
        tab.innerText = `${idToLangMap[l1]}-${idToLangMap[l2]}`;
    });

    updateClass();

    if (pairs.length > 2) {
        addPairBtn.classList.add('hidden');
    } else {
        addPairBtn.classList.remove('hidden');
    }
}
