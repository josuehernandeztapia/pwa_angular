#!/bin/bash
set -euo pipefail

echo "🧹 Audit de Limpieza del Repo – Conductores PWA"
echo "----------------------------------------------"

# 1. Buscar TODO, FIXME, HACK, DEPRECATED
echo "🔍 Buscando TODO/FIXME/HACK/DEPRECATED..."
grep -RInE "TODO|FIXME|HACK|DEPRECATED" src/ || echo "✅ No se encontraron TODO/FIXME/HACK/DEPRECATED"

# 2. Buscar console.log (no permitido en producción)
echo
echo "🔍 Buscando console.log..."
grep -RIn "console\\.log" src/ || echo "✅ No se encontraron console.log"

# 3. Buscar mocks y demos no usados
echo
echo "🔍 Buscando mocks y demos..."
grep -RInE "mock|demo" src/app/components/ || echo "✅ No se encontraron mocks/demos"

# 4. Buscar archivos de integración/demos heredados
echo
echo "🔍 Archivos de integración/demo que pueden ser removidos:"
find src/app/components -iname "*integration-demo*.ts" -o -iname "*demo*.ts" || true

# 5. Verificar archivos grandes >500KB (potenciales residuos)
echo
echo "🔍 Archivos sospechosamente grandes (>500KB):"
find src -type f -size +500k

echo
echo "✅ Auditoría de limpieza finalizada"

