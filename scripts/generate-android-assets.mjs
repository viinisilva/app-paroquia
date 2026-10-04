import { access, mkdir, readdir, rename } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const source = path.resolve('public/icons/maskable-512x512.png');
const splashSource = path.resolve('public/images/logo.png');
const resourceRoot = path.resolve('android/app/src/main/res');
const densities = {
  mdpi: 48,
  hdpi: 72,
  xhdpi: 96,
  xxhdpi: 144,
  xxxhdpi: 192,
};

await access(source);
await access(splashSource);
await access(resourceRoot);

for (const [density, size] of Object.entries(densities)) {
  const directory = path.join(resourceRoot, `mipmap-${density}`);
  await mkdir(directory, { recursive: true });

  for (const file of ['ic_launcher.png', 'ic_launcher_round.png']) {
    await sharp(source).resize(size, size).png().toFile(path.join(directory, file));
  }

  await sharp(source)
    .resize(size * 2.25, size * 2.25)
    .png()
    .toFile(path.join(directory, 'ic_launcher_foreground.png'));
}

const resourceEntries = await readdir(resourceRoot, { recursive: true, withFileTypes: true });
const splashTargets = resourceEntries
  .filter((entry) => entry.isFile() && entry.name === 'splash.png')
  .map((entry) => path.join(entry.parentPath, entry.name));

for (const target of splashTargets) {
  const { width, height } = await sharp(target).metadata();
  if (!width || !height) continue;

  const logoSize = Math.round(Math.min(width, height) * 0.52);
  const logo = await sharp(splashSource)
    .resize(logoSize, logoSize, { fit: 'contain' })
    .png()
    .toBuffer();
  const temporaryTarget = `${target}.tmp.png`;

  await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: '#faf8f4',
    },
  })
    .composite([{ input: logo, gravity: 'center' }])
    .png()
    .toFile(temporaryTarget);
  await rename(temporaryTarget, target);
}

console.log('Ícones e splash Android provisórios gerados a partir do brasão existente.');
