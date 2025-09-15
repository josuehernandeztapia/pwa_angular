## Calendario de ejecución de QA en Staging

Periodo sugerido: 3 semanas, con cortes diarios y reporte semanal.

### Semana 1 — Postventa, Cotizador, AVI

- Lunes: Smoke de entorno y datos base (usuarios, seeds, webhooks).
- Martes: Postventa — carga de 4 fotos, banner OCR <0.7, RAG diagnóstico.
- Miércoles: Cotizador — header sticky, PMT tolerancias, tabla amortización.
- Jueves: AVI — pills por pregunta, decision HIGH para evasivo con admisión, resumen.
- Viernes: Regressions, cierre de hallazgos críticos, re-ejecución E2E.

Salidas: checklist actualizado, evidencias, issues creados, reporte semanal.

### Semana 2 — Tanda, Protección

- Lunes: Tanda — "Te toca en mes X", doble barra deuda/ahorro, alerta inflow≤PMT.
- Martes: Protección — cards PMT′/n′/TIR post, motivos de rechazo.
- Miércoles: Flujo Protección end-to-end: simulate → approve → sign (Mifiel) → apply (Odoo/NEON).
- Jueves: Integraciones (webhooks Conekta/Mifiel, NEON), pruebas negativas.
- Viernes: Regressions y reporte.

Salidas: evidencias por caso, KPIs de tasa de paso, issues priorizados.

### Semana 3 — Entregas, GNV

- Lunes: Entregas — timeline PO→Entregado, ETA visible/recalculada.
- Martes: Entregas — simulación de delay, timeline en rojo y nuevo compromiso.
- Miércoles: GNV — panel semáforo, descarga CSV y guía PDF.
- Jueves: GNV — ingesta real T+1 de estación piloto, validación de errores.
- Viernes: Regressions finales, sign-off de staging.

Salidas: reporte final de cumplimiento, matriz de riesgos y plan de hardening.

### Entradas requeridas

- Accesos staging y llaves: ver `bff/.env.staging.example`.
- Datos de prueba: 2-3 clientes por flujo, 30 audios para AVI.
- Webhooks habilitados en BFF: Mifiel, GNV, Conekta.

### Criterios de salida por módulo (resumen)

- Postventa: 4/4 fotos válidas; banner OCR bajo; RAG con diagnóstico y citas.
- Cotizador: PMT dentro de ±0.5% o ±$25; amortización correcta.
- AVI: decision HIGH para evasivo con admisión; confusion matrix en staging.
- Tanda: mes asignado visible; alerta inflow≤PMT; barras coherentes.
- Protección: TIR post visible; motivos de rechazo correctos; flujo E2E ok.
- Entregas: timeline y ETA; manejo de delay con nuevo compromiso.
- GNV: panel semáforo; descarga CSV/PDF; ingesta T+1 operativa.

### Ejecución E2E

- Ubicación tests: `e2e/tests/*` y config `e2e/playwright.config.ts`.
- Comando base:

```
cd e2e && npm i -D @playwright/test && npx playwright install --with-deps && E2E_BASE_URL=https://staging.conductores.lat npx playwright test
```

### Reporte y gobernanza

- Daily: estado, bugs críticos, bloqueadores.
- Weekly: tasa de paso, severidades, ETA a fix.
- Cierre: acta de conformidad de staging y checklist firmado.

