const path = require('node:path');
const fs = require('node:fs/promises');

const r = (p) => path.resolve(__dirname, p);

const pages = [
    { filePath: r('prescription.ru.html'), url: 'https://www.multitran.com/m.exe?l1=1&l2=1&SHL=2&s=prescription' },
    { filePath: r('prescription.en.html'), url: 'https://www.multitran.com/m.exe?l1=1&l2=2&SHL=1&s=prescription' },
    { filePath: r('not-found.html'), url: 'https://www.multitran.com/m.exe?l1=1&l2=2&s=asdfadsfdsf' },
    { filePath: r('other-lang.html'), url: 'https://www.multitran.com/m.exe?l1=1&l2=2&s=%E6%97%A5' },
];

async function downloadTestPages() {
    for (const { filePath, url } of pages) {
        const response = await fetch(url);
        if (response.status !== 200) {
            throw new Error(response);
        }

        console.log(`Downloading ${url} -> ${filePath}...`);
        let body = await response.text();
        body = body.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ''); // remove scripts

        await fs.writeFile(filePath, body);

        await new Promise((res) => {
            setTimeout(res, 50);
        });
    }
}

downloadTestPages();
