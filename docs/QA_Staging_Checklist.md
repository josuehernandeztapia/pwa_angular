## Checklist de QA de Staging (por módulo)

### Postventa

- [ ] Subir 4 fotos (Placa, VIN, Odómetro, Evidencia).
- [ ] Si `ocr.confidence < 0.7` → banner "Falta VIN/ODO/Evidencia".
- [ ] Caso con 3 fotos válidas → RAG devuelve diagnóstico + pasos + citas.
- [ ] Chips de refacciones muestran equivalencias y botón Agregar a cotización.

### Cotizador

- [ ] Header sticky siempre visible (Precio, Enganche, Financiar, PMT, Plazo).
- [ ] PMT calculado con fórmula financiera: tolerancia ±0.5% o ±$25.
- [ ] Amortización: primera fila expandida con interés/capital/saldo.

### AVI

- [ ] Tras cada pregunta → pill Claro / Revisar / Evasivo.
- [ ] Resumen final = GO/REVIEW/NO-GO + ≤3 flags + acción.
- [ ] Caso “evasivo nervioso con admisión” → HIGH (no CRITICAL).
- [ ] Confusion matrix reportado en staging (30 audios).

### Tanda

- [ ] Mostrar “Te toca en mes X”.
- [ ] Doble barra deuda vs ahorro.
- [ ] Si inflow ≤ PMT → alerta “Recaudo recomendado $Y”.

### Protección

- [ ] Cards con PMT′/n′/TIR post.
- [ ] Si rechazo → mostrar motivo (IRR post < IRRmin o PMT′ < min).
- [ ] Flujo completo: simulate → approve → sign (Mifiel) → apply (Odoo/NEON).

### Entregas

- [ ] Timeline con hitos PO → Entregado.
- [ ] ETA visible y recalculada.
- [ ] Si delay → timeline rojo + nuevo compromiso.

### GNV

- [ ] Panel de estaciones con semáforo verde/amarillo/rojo.
- [ ] Descarga plantilla CSV y guía PDF.
- [ ] Ingesta archivo real T+1 de estación piloto.

