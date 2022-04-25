import { readFileSync } from 'fs';
import path from 'path';

const r = (p) => path.resolve(__dirname, p);

export const testFiles = {
    notFound: readFileSync(r('./not-found.html')),
    otherLangs: readFileSync(r('./other-lang.html')),
    prescriptionRU: readFileSync(r('./prescription.html')),
    prescriptionEN: readFileSync(r('./prescription.en.html')),
};
