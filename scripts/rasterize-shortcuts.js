#!/usr/bin/env node
/*
  Rasteriza los SVG de shortcuts a PNG 96x96 usando Puppeteer.
  Entradas SVG:
    - src/assets/brand/shortcuts/shortcut-new.svg
    - src/assets/brand/shortcuts/shortcut-quote.svg
    - src/assets/brand/shortcuts/shortcut-clients.svg
  Salidas PNG:
    - src/assets/icons/shortcuts/shortcut-new.png
    - src/assets/icons/shortcuts/shortcut-quote.png
    - src/assets/icons/shortcuts/shortcut-clients.png
*/
const fs = require('fs');
const path = require('path');

async function ensureDir(dir) {
  await fs.promises.mkdir(dir, { recursive: true });
}

function fileToDataUrl(filePath) {
  const svg = fs.readFileSync(filePath);
  const base64 = svg.toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

async function rasterize({ inputSvg, outputPng, size = 96 }) {
  const puppeteer = require('puppeteer');
  const dataUrl = fileToDataUrl(inputSvg);
  const browser = await puppeteer.launch({
    args: ['--no-sandbox','--disable-setuid-sandbox'],
    defaultViewport: { width: size, height: size, deviceScaleFactor: 1 }
  });
  try {
    const page = await browser.newPage();
    const html = `<!doctype html><html><head><meta charset="utf-8"/></head>
      <body style="margin:0; background:transparent;">
        <img src="${dataUrl}" width="${size}" height="${size}" style="display:block"/>
      </body></html>`;
    await page.setContent(html, { waitUntil: 'load' });
    const body = await page.$('body');
    const clip = { x: 0, y: 0, width: size, height: size };
    const buffer = await body.screenshot({ clip, omitBackground: false, type: 'png' });
    await ensureDir(path.dirname(outputPng));
    await fs.promises.writeFile(outputPng, buffer);
    console.log(`✔ Generated ${outputPng}`);
  } finally {
    await browser.close();
  }
}

async function main() {
  const projectRoot = path.resolve(__dirname, '..');
  const srcDir = path.join(projectRoot, 'src', 'assets', 'brand', 'shortcuts');
  const outDir = path.join(projectRoot, 'src', 'assets', 'icons', 'shortcuts');
  const tasks = [
    { in: path.join(srcDir, 'shortcut-new.svg'), out: path.join(outDir, 'shortcut-new.png') },
    { in: path.join(srcDir, 'shortcut-quote.svg'), out: path.join(outDir, 'shortcut-quote.png') },
    { in: path.join(srcDir, 'shortcut-clients.svg'), out: path.join(outDir, 'shortcut-clients.png') },
  ];

  for (const t of tasks) {
    if (!fs.existsSync(t.in)) {
      console.error(`✖ Missing input SVG: ${t.in}`);
      process.exitCode = 1;
      return;
    }
  }

  for (const t of tasks) {
    await rasterize({ inputSvg: t.in, outputPng: t.out, size: 96 });
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

