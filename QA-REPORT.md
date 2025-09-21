## QA Final E2E (Core + No-Core)

Fecha: 2025-09-21T15:28:27.797Z

Criterios: sin gradientes/shimmer, helpers .ui-* presentes, dark mode consistente, AA cumplido.

### Core

| Módulo | Screenshot Light | Screenshot Dark | Helpers `.ui-*` | Accesibilidad AA | Estado |
|--------|------------------|-----------------|-----------------|------------------|--------|
| avi-go | [avi-go.png](tests/screenshots/avi-go.png) |  | Sí | Violaciones: 1 | FALLA |
| avi-nogo | [avi-nogo.png](tests/screenshots/avi-nogo.png) |  | Sí | Violaciones: 1 | FALLA |
| avi-review | [avi-review.png](tests/screenshots/avi-review.png) |  | Sí | Violaciones: 1 | FALLA |
| clientes | [clientes-light.png](tests/screenshots/clientes-light.png) | [clientes-dark.png](tests/screenshots/clientes-dark.png) | Sí | Violaciones: 1 | FALLA |
| config-cotizador | [config-cotizador.png](tests/screenshots/config-cotizador.png) |  | Sí | Violaciones: 1 | FALLA |
| config-simulador | [config-simulador.png](tests/screenshots/config-simulador.png) |  | Sí | Violaciones: 1 | FALLA |
| cotizador | [cotizador-light.png](tests/screenshots/cotizador-light.png) | [cotizador-dark.png](tests/screenshots/cotizador-dark.png) | Sí | Violaciones: 1 | FALLA |
| dashboard | [dashboard-light.png](tests/screenshots/dashboard-light.png) | [dashboard-dark.png](tests/screenshots/dashboard-dark.png) | Sí | Violaciones: 1 | FALLA |
| documentos-pendiente | [documentos-pendiente.png](tests/screenshots/documentos-pendiente.png) |  | Sí | Violaciones: 1 | FALLA |
| documentos-validado | [documentos-validado.png](tests/screenshots/documentos-validado.png) |  | Sí | Violaciones: 1 | FALLA |
| edomex-colectivo | [edomex-col-light.png](tests/screenshots/edomex-col-light.png) | [edomex-col-dark.png](tests/screenshots/edomex-col-dark.png) | Sí | OK | FALLA |
| entregas | [entregas.png](tests/screenshots/entregas.png) |  | Sí | Violaciones: 1 | FALLA |
| login | [login-light.png](tests/screenshots/login-light.png) | [login-dark.png](tests/screenshots/login-dark.png) | Sí | Violaciones: 1 | FALLA |
| oportunidad | [oportunidad-light.png](tests/screenshots/oportunidad-light.png) | [oportunidad-dark.png](tests/screenshots/oportunidad-dark.png) | Sí | OK | FALLA |
| perfil | [perfil-light.png](tests/screenshots/perfil-light.png) | [perfil-dark.png](tests/screenshots/perfil-dark.png) | Sí | Violaciones: 1 | FALLA |
| proteccion | [proteccion-light.png](tests/screenshots/proteccion-light.png) | [proteccion-dark.png](tests/screenshots/proteccion-dark.png) | Sí | Violaciones: 1 | FALLA |
| usage | [usage.png](tests/screenshots/usage.png) |  | Sí | Violaciones: 1 | FALLA |


### No-Core

| Módulo | Screenshot Light | Screenshot Dark | Helpers `.ui-*` | Accesibilidad AA | Estado |
|--------|------------------|-----------------|-----------------|------------------|--------|
| callbacks | [callbacks.png](tests/screenshots/callbacks.png) |  | Sí | OK | FALLA |
| gnv-csv | [gnv-csv.png](tests/screenshots/gnv-csv.png) |  | Sí | OK | FALLA |
| gnv-salud | [gnv-salud.png](tests/screenshots/gnv-salud.png) |  | Sí | OK | FALLA |
| neon | [neon.png](tests/screenshots/neon.png) |  | Sí | OK | FALLA |
| odoo | [odoo.png](tests/screenshots/odoo.png) |  | Sí | OK | FALLA |
| offline | [offline.png](tests/screenshots/offline.png) |  | Sí | OK | PASA |
| postventa-fotos | [postventa-fotos.png](tests/screenshots/postventa-fotos.png) |  | Sí | OK | FALLA |
| postventa-ocr | [postventa-ocr.png](tests/screenshots/postventa-ocr.png) |  | Sí | OK | FALLA |
| responsive | [responsive-desktop.png](tests/screenshots/responsive-desktop.png) |  | Sí | Violaciones: 1 | FALLA |
| usuarios | [usuarios.png](tests/screenshots/usuarios.png) |  | Sí | Violaciones: 1 | FALLA |


**Resumen**: 1/27 PASA, 26 FALLA.
