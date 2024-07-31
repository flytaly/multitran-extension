/** @param {'light' | 'dark' | 'auto'} theme */
export function applyTheme(theme) {
    let className = theme;
    if (className != 'light' && className != 'dark') {
        const preferDarkQuery = '(prefers-color-scheme: dark)';
        const mql = window.matchMedia(preferDarkQuery);
        className = mql.matches ? 'dark' : 'light';
    }

    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(className);
}
