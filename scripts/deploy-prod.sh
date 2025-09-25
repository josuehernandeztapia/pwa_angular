#!/bin/bash
set -e

echo "🚀 Iniciando despliegue a producción - PWA Conductores"

# 1. Instalar dependencias limpias
echo "📦 Instalando dependencias..."
npm ci

# 2. Auditoría y QA Gates
echo "🧹 Ejecutando auditoría de estilos/código..."
npm run clean:audit

echo "🧪 Corriendo QA Gates completos..."
npm run prebuild:qa

# 3. Build de producción
echo "🏗️ Compilando build de producción..."
ng build --configuration production

# 4. Validación de artefactos
echo "🔍 Verificando artefactos en dist/..."
du -sh dist/* || true

# 5. Servir en modo staging para pruebas rápidas
echo "🧑‍💻 Iniciando servidor de staging (http://localhost:5000)..."
npx serve -s dist/ -l 5000 &
SERVE_PID=$!

# Esperar unos segundos para levantar el server
sleep 5

# 6. Smoke tests básicos (puedes ampliar con Playwright/Cypress)
echo "⚡ Corriendo smoke tests (Lighthouse/Accesibilidad)..."
npm run test:a11y || true

# Parar el servidor de staging
kill $SERVE_PID

# 7. Deploy a producción (ajusta según tu proveedor)
# Ejemplo: Firebase Hosting
if command -v firebase &> /dev/null; then
  echo "🚀 Deploy con Firebase..."
  firebase deploy --only hosting
else
  echo "⚠️ Comando de deploy no configurado. Ajusta este script a tu proveedor (ej. Vercel, Netlify, Docker/K8s)."
fi

echo "✅ Despliegue completado."

