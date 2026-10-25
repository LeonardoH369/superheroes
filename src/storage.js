const path = require('node:path');
const fs = require('node:fs/promises');
const { randomUUID } = require('node:crypto');
const sharp = require('sharp');
const root = path.resolve(process.env.STORAGE_ROOT || path.join(__dirname, '../storage'));
async function savePhoto(buffer) {
  let image;
  try {
    const source = sharp(buffer, { limitInputPixels: 16000000 });
    const meta = await source.metadata();
    if (!['jpeg', 'png', 'webp'].includes(meta.format) || (meta.pages || 1) > 1) throw new Error();
    image = await source.rotate().resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 88 }).toBuffer();
  } catch {
    const error = new Error('La fotografía debe ser una imagen JPEG, PNG o WebP válida de hasta 16 megapíxeles.');
    error.status = 422; throw error;
  }
  await fs.mkdir(path.join(root, 'photos'), { recursive: true });
  const name = randomUUID() + '.jpg';
  await fs.writeFile(path.join(root, 'photos', name), image, { flag: 'wx' });
  return '/storage/photos/' + name;
}
async function seedPhotos() {
  await fs.mkdir(path.join(root, 'photos'), { recursive: true });
  for (const name of ['aurora', 'centinela', 'marea']) {
    const dest = path.join(root, 'photos', 'demo-' + name + '.jpg');
    try { await fs.access(dest); } catch {
      await sharp(path.join(__dirname, '../public/images', name + '.svg')).jpeg({ quality: 90 }).toFile(dest);
    }
  }
}
module.exports = { root, savePhoto, seedPhotos };
