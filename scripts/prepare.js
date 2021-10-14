import fs from 'fs-extra';
import chokidar from 'chokidar';
import { getManifest } from '../src/manifest.js';
import { IS_DEV, log, r } from './utils.js';

export async function writeManifest() {
    await fs.writeJSON(r('extension/manifest.json'), await getManifest(), { spaces: 2 });
    log('PRE', 'write manifest.json');
}

writeManifest();

if (IS_DEV) {
    chokidar.watch([r('src/manifest.js'), r('package.json')]).on('change', () => {
        writeManifest();
    });
}
