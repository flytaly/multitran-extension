import QRCode from 'qrcode';
import fs from 'fs-extra';
import { r } from './utils.js';
import { addresses } from '../src/js/donate.js';

addresses.forEach(async (info) => {
    const imgPath = r('extension/', info.QRCode);
    const data = await QRCode.toString(info.address, { type: 'svg' });
    await fs.writeFile(imgPath, data)
    console.log(`generated QR code for ${info.name}: ${imgPath}`);
});
