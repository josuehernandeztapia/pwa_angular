#!/bin/bash
set -e

echo "🔍 Verificando UX/UI Minimal Dark..."

# Seleccionar buscador: ripgrep (rg) o grep como fallback
search() {
  local pattern="$1"
  if command -v rg >/dev/null 2>&1; then
    rg -n --hidden \
      --glob '!dist' \
      --glob '!node_modules' \
      --glob '!.git' \
      --glob '!lighthouse-current.html' \
      --glob '!scripts/verify-ux.sh' \
      "$pattern"
  else
    grep -RIn -E "$pattern" . \
      --exclude-dir=dist \
      --exclude-dir=node_modules \
      --exclude-dir=.git \
      --exclude=lighthouse-current.html \
      --exclude=scripts/verify-ux.sh
  fi
}

# 1. Detectar residuos prohibidos (placeholders, TODOs, clean-audit)
if search "(PLACEHOLDER|FIXME|TODO|HACK|DEPRECATED|removed by clean-audit)"; then
  echo "❌ Se encontraron placeholders o residuos prohibidos."
  exit 1
else
  echo "✅ No hay placeholders ni residuos."
fi

# 2. Detectar estilos no permitidos (glassmorphism, gradientes, grises legacy)
if search "(glass|gradient|bg-gray-|text-gray-)"; then
  echo "❌ Se encontraron estilos prohibidos (glass, gradientes, grises)."
  exit 1
else
  echo "✅ Estilos limpios: solo Minimal Dark tokens."
fi

# 3. Correr auditoría de clean-audit
npm run clean:audit

echo "🎯 Validación de UX Minimal Dark completada."

