import { build } from 'esbuild';
import { IS_DEV, log, replaceConstants, TARGET } from './utils.js';

const outdir = './extension/dist';

build({
    entryPoints: [
        './src/js/background/background.js', //
        './src/js/content/content.js',
        './src/js/popup/popup.js',
        './src/js/options/options.js',
    ],
    bundle: true,
    outdir,
    define: replaceConstants(),
    watch: IS_DEV,
    format: 'iife',
})
    .then(() => {
        log(`esbuild`, `Built background and content scripts for ${TARGET}`);
        if (IS_DEV) {
            log('esbuild', `watch for changes`);
        }
    })
    .catch(() => process.exit(1));
