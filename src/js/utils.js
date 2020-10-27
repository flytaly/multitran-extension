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
