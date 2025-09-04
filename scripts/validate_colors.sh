#!/bin/bash
# COLOR PALETTE SURGICAL VALIDATION - CONDUCTORES PWA
# Verificar implementación COMPLETA del sistema de colores enterprise

echo "🎨 VALIDACIÓN QUIRÚRGICA DE PALETA DE COLORES"
echo "============================================="
echo ""

echo "🔍 1/6 - VALIDANDO COLORES PRIMARIOS EN ARCHIVOS CRÍTICOS..."
echo "─────────────────────────────────────────────────────────────"

# Primary Brand Colors Validation
echo "🌟 PRIMARY BRAND COLORS:"
grep -r "#06d6a0\|#667eea\|#764ba2" src/ --include="*.css" --include="*.scss" --include="*.ts" | head -10 && echo "✅ Primary colors found" || echo "❌ Primary colors missing"

# Blue Action Palette
echo ""
echo "🔵 BLUE ACTION PALETTE:"
grep -r "#4299e1\|#3182ce\|#2563eb\|#2c5282" src/ --include="*.css" --include="*.scss" --include="*.ts" | head -10 && echo "✅ Blue palette found" || echo "❌ Blue palette missing"

echo ""
echo "🔍 2/6 - VALIDANDO COLORES DE FONDO Y SUPERFICIE..."
echo "──────────────────────────────────────────────────"

# Background & Surface Colors
echo "🏗️ BACKGROUND & SURFACE COLORS:"
grep -r "#1f2937\|#f7fafc\|rgba(255, 255, 255, 0.95)" src/ --include="*.css" --include="*.scss" --include="*.ts" | head -10 && echo "✅ Background colors found" || echo "❌ Background colors missing"

echo ""
echo "🔍 3/6 - VALIDANDO ESCALA DE GRISES NEUTRAL..."
echo "──────────────────────────────────────────────"

# Neutral Gray Scale
echo "⚫ NEUTRAL GRAY SCALE:"
grep -r "#2d3748\|#4a5568\|#718096\|#e2e8f0\|#cbd5e0\|#edf2f7" src/ --include="*.css" --include="*.scss" --include="*.ts" | head -15 && echo "✅ Gray scale found" || echo "❌ Gray scale missing"

echo ""
echo "🔍 4/6 - VALIDANDO COLORES SEMÁNTICOS..."
echo "────────────────────────────────────────"

# Status & Semantic Colors  
echo "🚦 STATUS & SEMANTIC COLORS:"
grep -r "#e53e3e\|#48bb78\|#38a169\|#dd6b20" src/ --include="*.css" --include="*.scss" --include="*.ts" | head -10 && echo "✅ Semantic colors found" || echo "❌ Semantic colors missing"

echo ""
echo "🔍 5/6 - VALIDANDO EFECTOS ESPECIALES Y GRADIENTES..."
echo "────────────────────────────────────────────────────"

# Special Effects
echo "✨ SPECIAL EFFECTS:"
grep -r "backdrop-filter.*blur\|linear-gradient.*135deg" src/ --include="*.css" --include="*.scss" --include="*.ts" | head -10 && echo "✅ Special effects found" || echo "❌ Special effects missing"

# Gradient Validation
echo ""
echo "🌈 GRADIENT VALIDATION:"
grep -r "667eea.*764ba2\|4299e1.*3182ce\|3182ce.*2c5282" src/ --include="*.css" --include="*.scss" --include="*.ts" | head -5 && echo "✅ Brand gradients found" || echo "❌ Brand gradients missing"

echo ""
echo "🔍 6/6 - VALIDANDO IMPLEMENTACIÓN EN COMPONENTES CRÍTICOS..."
echo "───────────────────────────────────────────────────────────"

# Login Component Colors
echo "🔐 LOGIN COMPONENT COLORS:"
if [ -f "src/app/components/auth/login/login.component.scss" ]; then
    echo "   📄 Checking login component styles..."
    grep -n "background.*gradient\|#667eea\|#764ba2" src/app/components/auth/login/login.component.scss | head -5 || echo "   ⚠️ Login gradient not found in SCSS"
else
    echo "   ⚠️ Login component SCSS not found"
fi

# Dashboard Component Colors
echo ""
echo "🏠 DASHBOARD COMPONENT COLORS:"
if [ -f "src/app/components/pages/dashboard/dashboard.component.scss" ]; then
    echo "   📄 Checking dashboard component styles..."
    grep -n "#4299e1\|#1f2937\|backdrop-filter" src/app/components/pages/dashboard/dashboard.component.scss | head -5 || echo "   ⚠️ Dashboard colors not found in SCSS"
else
    echo "   ⚠️ Dashboard component SCSS not found"
fi

# Global Styles
echo ""
echo "🌐 GLOBAL STYLES VALIDATION:"
if [ -f "src/styles.scss" ]; then
    echo "   📄 Checking global styles..."
    grep -n "primary.*#06d6a0\|--primary\|--secondary" src/styles.scss | head -10 || echo "   ⚠️ CSS custom properties not found"
else
    echo "   ⚠️ Global styles file not found"
fi

# Tailwind Config (if exists)
echo ""
echo "🎨 TAILWIND CONFIG VALIDATION:"
if [ -f "tailwind.config.js" ]; then
    echo "   📄 Checking Tailwind config..."
    grep -n "06d6a0\|667eea\|4299e1" tailwind.config.js | head -5 && echo "   ✅ Custom colors in Tailwind config" || echo "   ⚠️ Custom colors not found in Tailwind config"
else
    echo "   ⚠️ Tailwind config not found"
fi

echo ""
echo "📊 ANÁLISIS DETALLADO DE ARCHIVOS DE ESTILO..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Count color usage across files
echo "📈 USAGE STATISTICS:"
echo "   Primary colors (#06d6a0): $(grep -r \"#06d6a0\" src/ --include=\"*.css\" --include=\"*.scss\" --include=\"*.ts\" 2>/dev/null | wc -l) occurrences"
echo "   Blue palette (#4299e1): $(grep -r \"#4299e1\" src/ --include=\"*.css\" --include=\"*.scss\" --include=\"*.ts\" 2>/dev/null | wc -l) occurrences"
echo "   Background (#1f2937): $(grep -r \"#1f2937\" src/ --include=\"*.css\" --include=\"*.scss\" --include=\"*.ts\" 2>/dev/null | wc -l) occurrences"
echo "   Gradients (135deg): $(grep -r \"135deg\" src/ --include=\"*.css\" --include=\"*.scss\" --include=\"*.ts\" 2>/dev/null | wc -l) occurrences"

echo ""
echo "🔧 COMPONENTES CON ESTILOS IMPLEMENTADOS:"
echo "────────────────────────────────────────"
find src/app/components -name "*.scss" -exec echo "   📄 {}" \; 2>/dev/null | head -10

echo ""
echo "🏆 RESUMEN FINAL DE VALIDACIÓN"
echo "═══════════════════════════════════════════════════════════════════════"

# Final validation summary
PRIMARY_COUNT=$(grep -r "#06d6a0\|#667eea\|#764ba2" src/ --include="*.css" --include="*.scss" --include="*.ts" 2>/dev/null | wc -l)
BLUE_COUNT=$(grep -r "#4299e1\|#3182ce\|#2563eb" src/ --include="*.css" --include="*.scss" --include="*.ts" 2>/dev/null | wc -l)
BACKGROUND_COUNT=$(grep -r "#1f2937\|#f7fafc" src/ --include="*.css" --include="*.scss" --include="*.ts" 2>/dev/null | wc -l)
GRADIENT_COUNT=$(grep -r "135deg\|linear-gradient" src/ --include="*.css" --include="*.scss" --include="*.ts" 2>/dev/null | wc -l)

echo "📊 COLOR IMPLEMENTATION STATUS:"
if [ "$PRIMARY_COUNT" -gt 0 ]; then PRIMARY_STATUS="✅ IMPLEMENTED (${PRIMARY_COUNT} usages)"; else PRIMARY_STATUS="❌ NOT IMPLEMENTED"; fi
if [ "$BLUE_COUNT" -gt 0 ]; then BLUE_STATUS="✅ IMPLEMENTED (${BLUE_COUNT} usages)"; else BLUE_STATUS="❌ NOT IMPLEMENTED"; fi
if [ "$BACKGROUND_COUNT" -gt 0 ]; then BACKGROUND_STATUS="✅ IMPLEMENTED (${BACKGROUND_COUNT} usages)"; else BACKGROUND_STATUS="❌ NOT IMPLEMENTED"; fi
if [ "$GRADIENT_COUNT" -gt 0 ]; then GRADIENT_STATUS="✅ IMPLEMENTED (${GRADIENT_COUNT} usages)"; else GRADIENT_STATUS="❌ NOT IMPLEMENTED"; fi
echo "   🌟 Primary Brand Colors: $PRIMARY_STATUS"
echo "   🔵 Blue Action Palette: $BLUE_STATUS"
echo "   🏗️ Background Colors: $BACKGROUND_STATUS"
echo "   🌈 Gradient Effects: $GRADIENT_STATUS"

# Overall assessment
TOTAL_IMPLEMENTATIONS=$((PRIMARY_COUNT + BLUE_COUNT + BACKGROUND_COUNT + GRADIENT_COUNT))

echo ""
if [ $TOTAL_IMPLEMENTATIONS -gt 20 ]; then
    echo "🎉 ASSESSMENT: ✅ EXCELLENT COLOR SYSTEM IMPLEMENTATION"
    echo "   Color palette is COMPREHENSIVELY implemented across the application"
elif [ $TOTAL_IMPLEMENTATIONS -gt 10 ]; then
    echo "⚠️ ASSESSMENT: 🟡 GOOD COLOR SYSTEM IMPLEMENTATION"
    echo "   Color palette is PARTIALLY implemented, some gaps exist"
elif [ $TOTAL_IMPLEMENTATIONS -gt 5 ]; then
    echo "⚠️ ASSESSMENT: 🟠 MINIMAL COLOR SYSTEM IMPLEMENTATION"
    echo "   Color palette has BASIC implementation, significant improvements needed"
else
    echo "❌ ASSESSMENT: 🔴 POOR COLOR SYSTEM IMPLEMENTATION"
    echo "   Color palette is NOT properly implemented, major overhaul required"
fi

echo ""
echo "🎨 NEXT STEPS RECOMMENDATIONS:"
echo "────────────────────────────────"
if [ $TOTAL_IMPLEMENTATIONS -le 10 ]; then
    echo "   1. 🔧 Create comprehensive SCSS/CSS custom properties"
    echo "   2. 🎨 Implement brand colors in all major components"
    echo "   3. 🌈 Add gradient effects to auth and dashboard components"
    echo "   4. 📱 Ensure responsive color usage across devices"
fi
echo "   5. 🧪 Test color accessibility (WCAG 2.1 AA compliance)"
echo "   6. 📊 Create color usage documentation"
echo "   7. 🎯 Implement dark mode variants if needed"

echo ""
echo "✅ SURGICAL COLOR VALIDATION COMPLETE"

echo ""
echo "Este prompt quirúrgico hará una validación completa y detallada de:"
echo ""
echo "1. ✅ Todos los colores primarios (#06d6a0, #667eea, #764ba2)"
echo "2. ✅ Paleta azul de acciones (#4299e1, #3182ce, etc.)"
echo "3. ✅ Colores de fondo y superficie"
echo "4. ✅ Escala de grises neutral"
echo "5. ✅ Colores semánticos (success, error, warning)"
echo "6. ✅ Efectos especiales (backdrop-filter, gradients)"
echo "7. ✅ Implementación en componentes críticos"
echo "8. ✅ Estadísticas de uso y assessment final"

