/**
 * scripts/generate-icons.js
 *
 * Gera os ícones PNG necessários para o PWA a partir do favicon.svg.
 * Execute com: node scripts/generate-icons.js
 *
 * Requer: npm install -D sharp
 */

import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

async function generateIcons() {
  let sharp;
  try {
    sharp = require('sharp');
  } catch {
    console.error('❌ sharp não encontrado. Instale com: npm install -D sharp');
    process.exit(1);
  }

  const svgPath = path.join(rootDir, 'public', 'favicon.svg');
  const iconsDir = path.join(rootDir, 'public', 'icons');

  if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

  const sizes = [
    { size: 180, name: 'icon-180.png' },  // Apple Touch Icon
    { size: 192, name: 'icon-192.png' },  // Android / PWA padrão
    { size: 512, name: 'icon-512.png' },  // Splash / instalação
  ];

  console.log('🎨 Gerando ícones PWA a partir de favicon.svg...\n');

  for (const { size, name } of sizes) {
    const outPath = path.join(iconsDir, name);
    await sharp(svgPath)
      .resize(size, size, { fit: 'contain', background: { r: 15, g: 23, b: 42, alpha: 1 } }) // bg = #0f172a
      .png()
      .toFile(outPath);
    console.log(`  ✅ public/icons/${name} (${size}×${size})`);
  }

  console.log('\n✨ Pronto! Ícones gerados em public/icons/');
}

generateIcons().catch(console.error);

