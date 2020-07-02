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
