import { defaultSizes, langIds } from './constants.js';

/**
 * @param {Function} func
 * @param {number} ms
 * @returns {Function}
 */
export function throttle(func, ms) {
    let timeoutId;
    let lastCallTs = 0;
    return (...args) => {
        const delta = Date.now() - lastCallTs;
        const wait = delta >= ms ? 0 : ms - delta;
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            lastCallTs = Date.now();
            func(...args);
        }, wait);
    };
}

/**
 * @param {Function} func
 * @param {number} ms
 * @returns {Function}
 */
export function debounce(func, ms) {
    let waiting = false;
    let tmId;
    return (...args) => {
        if (waiting) clearTimeout(tmId);
        waiting = true;
        tmId = setTimeout(() => {
            func(...args);
            waiting = false;
        }, ms);
    };
}

/** @type {Record<string,string>} */
export const idToLangMap = Object.entries(langIds).reduce(
    (prev, curr) => ({
        ...prev,
        [curr[1]]: curr[0],
    }),
    {},
);

export const clamp = (v, min, max) => Math.max(Math.min(v, max), min);

/**
 * @param {HTMLElement} container
 * @param {Object} sizes
 * @param {number} [sizes.fontSize]
 * @param {number} [sizes.width]
 * @param {number} [sizes.height]
 */
export function applySizeVariables(container, { fontSize, width, height }) {
    container.style.setProperty('--font-size', `${fontSize || defaultSizes.fontSize}px`);
    container.style.setProperty('--popup-max-width', `${width || defaultSizes.width}px`);
    container.style.setProperty('--popup-max-height', `${height || defaultSizes.height}px`);
}
