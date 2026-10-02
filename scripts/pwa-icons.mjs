import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';
// Conversão técnica dos assets originais: mantém os pixels e a proporção do brasão.
const original = await readFile('public/images/logo.png');
await writeFile('public/images/logo.png', await sharp(original).png().toBuffer());
for (const size of [192, 512]) {
  await sharp(original)
    .resize(size, size, { fit: 'contain', background: '#faf8f4' })
    .png()
    .toFile('public/icons/icon-' + size + 'x' + size + '.png');
}
await sharp(original)
  .resize(360, 360, { fit: 'contain', background: '#faf8f4' })
  .extend({ top: 76, bottom: 76, left: 76, right: 76, background: '#faf8f4' })
  .png()
  .toFile('public/icons/maskable-512x512.png');
console.log('Logo convertido para PNG; ícones 192, 512 e maskable validados.');
