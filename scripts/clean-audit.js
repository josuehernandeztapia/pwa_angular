// scripts/clean-audit.js
const fs = require("fs");
const path = require("path");

const ROOT = "src";
const PATTERNS = [
  {
    name: "TODO/FIXME/HACK/DEPRECATED",
    regex: /(.*(TODO|FIXME|HACK|DEPRECATED).*[\r\n]*)/gi,
  },
  {
    name: "console.log",
    regex: /(.*console\\.log.*[\r\n]*)/gi,
  },
  {
    name: "mocks/demos",
    regex: /(mock|demo)/i, // Solo audita, no elimina
  },
];

const FIX_MODE = process.argv.includes("--fix");

function walk(dir, callback) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, callback);
    } else {
      callback(fullPath);
    }
  });
}

function audit() {
  console.log("🧹 Audit de Limpieza del Repo – Conductores PWA");
  console.log("==============================================");

  let issues = 0;

  walk(ROOT, (file) => {
    let content = fs.readFileSync(file, "utf8");
    let originalContent = content;

    PATTERNS.forEach(({ name, regex }) => {
      if (regex.test(content)) {
        if (FIX_MODE && (name.includes("TODO") || name.includes("console.log"))) {
          content = content.replace(regex, (match) => {
            return `// removed by clean-audit: ${match.trim()}\n`;
          });
          console.log(`✂️ Eliminado ${name} en: ${file}`);
        } else {
          console.log(`❌ ${name} encontrado en: ${file}`);
          issues++;
        }
      }
    });

    if (FIX_MODE && content !== originalContent) {
      fs.writeFileSync(file, content, "utf8");
    }
  });

  // Archivos grandes sospechosos
  walk(ROOT, (file) => {
    const stats = fs.statSync(file);
    if (stats.size > 500 * 1024) {
      console.log(`⚠️ Archivo grande (>500KB): ${file}`);
    }
  });

  if (!FIX_MODE) {
    if (issues === 0) {
      console.log("✅ No se encontraron problemas de limpieza.");
    } else {
      console.log(`⚠️ Se detectaron ${issues} incidencias.`);
      process.exitCode = 1;
    }
  } else {
    console.log("✅ Limpieza automática completada (modo --fix).");
  }
}

audit();

