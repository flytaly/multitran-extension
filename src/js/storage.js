import { langIds } from './configs.js';

export const storage = {
    async saveLanguages({ l1, l2 }) {
        if (l1) {
            await browser.storage.local.set({ l1 });
        }
        if (l2) {
            await browser.storage.local.set({ l2 });
        }
    },
    async getLanguages() {
        const { l1, l2 } = await browser.storage.local.get(['l1', 'l2']);
        return {
            l1: l1 || langIds.English,
            l2: l2 || langIds.Russian,
        };
    },
};
