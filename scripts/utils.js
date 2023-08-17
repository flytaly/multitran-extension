import { bgCyan, black } from 'kolorist';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

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

// eslint-disable-next-line no-underscore-dangle
const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 *  @param  {...string} args
 */
export const r = (...args) => resolve(__dirname, '..', ...args);

export function replaceConstants() {
    return {
        TARGET: `"${TARGET}"`,
        'process.env.NODE_ENV': IS_DEV ? "'development'" : "'production'",
    };
}
