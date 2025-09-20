## QA Final E2E (Core + No-Core)

Fecha: (pendiente de corrida)

Este reporte se actualizará automáticamente tras la corrida con Playwright + Axe.

### Core

| Módulo | Screenshot Light | Screenshot Dark | Helpers `.ui-*` | Accesibilidad AA | Estado |
|--------|------------------|-----------------|-----------------|------------------|--------|
| login |  |  |  |  |  |
| dashboard |  |  |  |  |  |
| clientes |  |  |  |  |  |
| cotizador |  |  |  |  |  |
| perfil |  |  |  |  |  |
| oportunidad |  |  |  |  |  |
| edomex-colectivo |  |  |  |  |  |
| proteccion |  |  |  |  |  |
| avi-go |  |  |  |  |  |
| avi-review |  |  |  |  |  |
| avi-nogo |  |  |  |  |  |
| documentos-pendiente |  |  |  |  |  |
| documentos-validado |  |  |  |  |  |
| entregas |  |  |  |  |  |
| config-cotizador |  |  |  |  |  |
| config-simulador |  |  |  |  |  |
| usage |  |  |  |  |  |

### No-Core

| Módulo | Screenshot Light | Screenshot Dark | Helpers `.ui-*` | Accesibilidad AA | Estado |
|--------|------------------|-----------------|-----------------|------------------|--------|
| postventa-fotos |  |  |  |  |  |
| postventa-ocr |  |  |  |  |  |
| gnv-salud |  |  |  |  |  |
| gnv-csv |  |  |  |  |  |
| odoo |  |  |  |  |  |
| neon |  |  |  |  |  |
| callbacks |  |  |  |  |  |
| usuarios |  |  |  |  |  |
| responsive |  |  |  |  |  |
| offline |  |  |  |  |  |

—

Nota: Este archivo será regenerado por `scripts/generate-qa-report.js` cuando finalice la corrida.

# QA Visual + Accesibilidad — PR #258

Fecha: 2025-09-19

## Resumen

- Se limitó Playwright a tests visuales en `tests/visual`.
- Se restauró `<app-update-banner>` en `shell`.
- Se aplicó dark mode + `.ui-*` helpers en módulos: Login, Dashboard, Clientes, Cotizador.
- Se ejecutaron pruebas visuales en Chromium con `webServer` auto-start.

## Resultados de pruebas

- Playwright (Chromium): ejecutado. Reporte HTML disponible en `playwright-report/index.html`.
- Artifacts encontrados: `playwright-report/`, `test-results/`.
- No se detectaron errores críticos en la corrida actual.

## Cambios clave

- `playwright.config.ts`:
  - `testDir: ./tests/visual`
  - `reporter: [['list'], ['html']]`
  - `use.video: 'off'`
  - `webServer` para levantar Angular dev server
- `src/app/layout/shell/shell.component.html`:
  - Banner de actualización presente: `<app-update-banner>`
- Plantillas actualizadas con dark mode + helpers:
  - `LoginComponent` (inline template)
  - `DashboardComponent` (inline template)
  - `ClientesListComponent` (inline template)
  - `CotizadorMainComponent` (inline template)

## Cómo abrir el reporte

```bash
npm run test:visual:report
```

o abrir `playwright-report/index.html` en el navegador.

## Seguimiento

- Si se requiere cross-browser, instalar `firefox` y `webkit` via Playwright.
- Ajustar umbrales de `expect.toHaveScreenshot` si hay diffs visuales por tipografías.

