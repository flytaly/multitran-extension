/**
 * @param {'light' | 'dark' | 'auto'} theme
 * @param {HTMLElement} root
 * */
export function applyTheme(theme, root = document.documentElement) {
    let className = theme;
    if (className != 'light' && className != 'dark') {
        const preferDarkQuery = '(prefers-color-scheme: dark)';
        const mql = window.matchMedia(preferDarkQuery);
        className = mql.matches ? 'dark' : 'light';
    }

    root.classList.remove('light', 'dark');
    root.classList.add(className);
}
