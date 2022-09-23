const selector = {
    container: () => document.querySelector('[data-type="lang-selector"]'),
    /** @type {() => HTMLSelectElement} */
    l1Elem: () => document.getElementById('l1'),
    /** @type {() => HTMLSelectElement} */
    l2Elem: () => document.getElementById('l2'),
    swapBtn: () => document.getElementById('lang-swap'),
};

/**
 * @arg {[string, string][]} pairs
 * @arg {number} pairIndex
 * @arg {(l1: string, l2: string, index: number) => void} onChange
 * */
export function setLangSelectorListeners(pairs, pairIndex, onChange) {
    pairIndex = pairIndex < pairs.length ? pairIndex : 0;
    const container = selector.container();
    const l1Elem = selector.l1Elem();
    const l2Elem = selector.l2Elem();
    [selector.l1Elem().value, selector.l2Elem().value] = pairs[pairIndex];
    container.dataset.id = pairIndex;

    const changeHandler = () => {
        const index = parseInt(container.dataset.id, 10) || 0;
        onChange(l1Elem.value, l2Elem.value, index);
    };

    l1Elem.addEventListener('change', changeHandler);
    l2Elem.addEventListener('change', changeHandler);

    selector.swapBtn().addEventListener('click', () => {
        [l1Elem.value, l2Elem.value] = [l2Elem.value, l1Elem.value];
        changeHandler();
    });
}

/**
 * @arg {[string, string][]} pairs
 * @arg {number} pairIndex
 * */
export function updateLangSelector(pairs, pairIndex) {
    pairIndex = pairIndex < pairs.length ? pairIndex : 0;
    if (pairIndex >= pairs.length) [selector.l1Elem().value, selector.l2Elem().value] = pairs[pairIndex];
    selector.container().dataset.id = pairIndex;
}
