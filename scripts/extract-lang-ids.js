import fs from 'fs-extra';
import { r } from './utils.js';

function extract() {
    const file = r('./extension/template-pairs.html');
    const content = fs.readFileSync(file);

    const re = /<option value="(?<id>\d+)">(?<lang>.+)<\/option>/;

    let skip = true;
    const result = {};
    for (const line of content.toString().split('\n')) {
        if (skip && line.startsWith(`<template id="all-languages">`)) {
            skip = false;
            continue;
        }
        if (skip) {
            continue;
        }
        const groups = line.match(re)?.groups;
        if (!groups) {
            break;
        }
        const { lang, id } = groups;
        result[lang] = id;
    }
    console.log(result);
    fs.writeJsonSync(r('_pairs.json'), result, { spaces: 2 });
}

extract();
