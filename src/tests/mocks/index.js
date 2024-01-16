/* eslint-disable no-underscore-dangle */
import { readFileSync } from 'node:fs';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const r = (p) => path.resolve(__dirname, p);

export const testFiles = {
    notFound: readFileSync(r('./not-found.html')),
    otherLangs: readFileSync(r('./other-lang.html')),
    prescriptionRU: readFileSync(r('./prescription.ru.html')),
    prescriptionEN: readFileSync(r('./prescription.en.html')),
};
