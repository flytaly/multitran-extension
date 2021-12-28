/** @param {Element} parent */
export function addKeyboardListener(parent) {
    /** @param {KeyboardEvent} e */
    function listenKeys(e) {
        const getRoot = () => parent || document.querySelector('#translate-popup-content');
        const getScrollTags = () => Array.from((parent || document).querySelectorAll('[data-type="scroll-next"]'));

        if (!e.ctrlKey) return;
        switch (e.code) {
            case 'ArrowDown': {
                const root = getRoot();
                if (!root) break;
                const scrollTagsList = getScrollTags();
                const nextTag = scrollTagsList.find((el) => el.offsetTop > root.scrollTop);
                if (nextTag) root.scroll({ behavior: 'smooth', top: nextTag.offsetTop });
                else root.scroll({ behavior: 'smooth', top: root.scrollHeight });
                e.preventDefault();
                break;
            }
            case 'ArrowUp': {
                const root = getRoot();
                if (!root) break;
                const scrollTagsList = getScrollTags().reverse();
                const nextTag = scrollTagsList.find((el) => el.offsetTop < root.scrollTop);
                if (nextTag) root.scroll({ behavior: 'smooth', top: nextTag.offsetTop });
                else root.scroll({ behavior: 'smooth', top: 0 });
                e.preventDefault();
                break;
            }
            case 'Home': {
                getRoot()?.scroll({ top: 0 });
                if (e.target?.tagName !== 'INPUT') e.preventDefault();
                break;
            }
            case 'End': {
                const root = getRoot();
                root?.scroll({ top: root.scrollHeight });
                if (e.target?.tagName !== 'INPUT') e.preventDefault();
                break;
            }
            default:
        }
    }
    document.addEventListener('keydown', listenKeys);

    return () => {
        document.removeEventListener('keydown', listenKeys);
    };
}
