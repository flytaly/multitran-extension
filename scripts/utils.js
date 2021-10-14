import { resolve } from 'path';
import { bgCyan, black } from 'kolorist';

export const IS_DEV = process.env.NODE_ENV === 'development';
export const TARGET = process.env.TARGET === 'firefox' ? 'firefox' : 'chrome';
export const PORT = parseInt(process.env.PORT || '', 10) || 3303;

/**
 * @param {string} name
 * @param {string} message
 */
export function log(name, message) {
    // eslint-disable-next-line no-console
    console.log(black(bgCyan(` ${name} `)), message);
}

/**
 *  @param  {...string} args
 */
export const r = (...args) => resolve(__dirname, '..', ...args);

export const replaceConstants = () => ({ TARGET });
