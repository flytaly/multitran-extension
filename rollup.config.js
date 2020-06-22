import replace from '@rollup/plugin-replace';
// import copy from 'rollup-plugin-copy';
import copy from 'rollup-plugin-copy-watch';
import del from 'rollup-plugin-delete';

const target = process.env.TARGET ? process.env.TARGET : 'firefox';
const outputPath = target === 'firefox' ? './dist/firefox/' : './dist/chrome/';
const isWatchMode = process.env.ROLLUP_WATCH;

const plugins = [
    replace({
        TARGET: `'${target}'`,
    }),
];

const polyfillPath =
    target !== 'firefox'
        ? 'node_modules/webextension-polyfill/dist/browser-polyfill.js'
        : 'src/firefox/browser-polyfill.js';

const copyPlugin = copy({
    ...(isWatchMode ? { watch: ['src/files/**/*', 'src/styles/**/*', `src/${target}/*`] } : {}),
    targets: [
        // { src: 'src/index.html', dest: 'dist/public' },
        { src: 'src/files/*', dest: outputPath },
        { src: 'src/styles/', dest: outputPath },
        { src: `src/${target}/*`, dest: outputPath },
        { src: polyfillPath, dest: outputPath },
    ],
    copyOnce: true,
});

const delPlugin = del({ targets: outputPath, runOnce: true });

export default [
    {
        input: './src/js/content/content.js',
        output: {
            file: `${outputPath}js/content/content.js`,
            format: 'iife',
        },
        plugins: [copyPlugin, ...plugins, ...(isWatchMode ? [] : [delPlugin])],
    },
    {
        input: './src/js/options/options.js',
        output: [
            {
                file: `${outputPath}js/options/options.js`,
                format: 'iife',
            },
        ],
        plugins,
    },
    {
        input: './src/js/popup/popup.js',
        output: [
            {
                file: `${outputPath}js/popup/popup.js`,
                format: 'iife',
            },
        ],
        plugins,
    },
];
