#!/usr/bin/env node
/*
  Genera app icons PNG (72,96,128,144,152,192,384,512) a partir de un logo.
  - No altera el diseño del logo: se renderiza tal cual con object-fit: contain.
  - Fondo por defecto: #06b6d4 (puedes cambiar con --bg).
  - Fuente: URL o ruta local (parámetro --src). Si no se pasa, usa el URL de Cloudinary proporcionado.

  Salidas (coinciden con manifest existente):
    src/assets/icons/icon-72x72.png
    src/assets/icons/icon-96x96.png
    src/assets/icons/icon-128x128.png
    src/assets/icons/icon-144x144.png
    src/assets/icons/icon-152x152.png
    src/assets/icons/icon-192x192.png
    src/assets/icons/icon-384x384.png
    src/assets/icons/icon-512x512.png
*/
const fs = require('fs');
const path = require('path');

function getArg(name, def) {
  const idx = process.argv.findIndex(a => a.startsWith(`--${name}`));
  if (idx === -1) return def;
  const arg = process.argv[idx];
  const eq = arg.indexOf('=');
  if (eq !== -1) return arg.slice(eq + 1);
  return process.argv[idx + 1] || def;
}

const DEFAULT_SRC = 'https://res.cloudinary.com/dytmjjb9l/image/upload/v1755053362/Add_the_text_Conductores_del_Mundo_below_the_logo_The_text_should_be_small_centered_and_in_the_same_monochromatic_style_as_the_logo_The_logo_features_the_text_Mu_in_white_centered_within_a_teal_i_rbsaxg.png';
const srcInput = getArg('src', DEFAULT_SRC);
const bgColor = getArg('bg', '#06b6d4');
const paddingPct = parseFloat(getArg('pad', '12')); // 0..20 recomendado (12% por defecto)

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function ensureDir(dir) {
  await fs.promises.mkdir(dir, { recursive: true });
}

async function renderIcon(puppeteer, { size, src, outPath, bg = '#06b6d4', padPct = 0 }) {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox','--disable-setuid-sandbox'],
    defaultViewport: { width: size, height: size, deviceScaleFactor: 1 }
  });
  try {
    const page = await browser.newPage();
    const pad = Math.max(0, Math.min(30, padPct));
    const inner = 100 - pad * 2;
    const html = `<!doctype html><html><head><meta charset=\"utf-8\"/></head>
      <body style=\"margin:0; background:${bg}; width:100%; height:100%; display:flex; align-items:center; justify-content:center;\">
        <div style=\"width:${inner}%; height:${inner}%;\">
          <img src=\"${src}\" style=\"width:100%; height:100%; object-fit:contain; display:block; image-rendering:-webkit-optimize-contrast;\"/>
        </div>
      </body></html>`;
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const body = await page.$('body');
    const buffer = await body.screenshot({ type: 'png' });
    await ensureDir(path.dirname(outPath));
    await fs.promises.writeFile(outPath, buffer);
    console.log(`✔ ${path.basename(outPath)} from: ${src}`);
  } finally {
    await browser.close();
  }
}

async function main() {
  const puppeteer = require('puppeteer');
  const projectRoot = path.resolve(__dirname, '..');
  const outDir = path.join(projectRoot, 'src', 'assets', 'icons');
  await ensureDir(outDir);
  for (const s of sizes) {
    const out = path.join(outDir, `icon-${s}x${s}.png`);
    await renderIcon(puppeteer, { size: s, src: srcInput, outPath: out, bg: bgColor, padPct: paddingPct });
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
