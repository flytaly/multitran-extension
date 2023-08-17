import * as esbuild from 'esbuild';
import { IS_DEV, log, replaceConstants, TARGET } from './utils.js';

const outdir = './extension/dist';
const entryPoints = [
    './src/js/background/background.js', //
    './src/js/content/content.js',
    './src/js/popup/popup.js',
    './src/js/options/options.js',
    './src/js/options/donate-page.js',
];

async function startEsbuild() {
    const ctx = await esbuild.context({
        entryPoints,
        bundle: true,
        outdir,
        define: replaceConstants(),
        format: 'iife',
    });

    log(`esbuild`, `Built background and content scripts for ${TARGET}`);
    if (IS_DEV) {
        log('esbuild', `watch for changes`);
        await ctx.watch();
    }
    /* await ctx.dispose(); */
}

startEsbuild();
