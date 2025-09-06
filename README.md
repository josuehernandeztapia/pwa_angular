# Business Flow Specs

Ubicación clave: `spec/`

- `state_machine.yml`: máquina de estados por plaza (Nacional/Importación), roles, guards y transiciones.
- `documents.yml`: taxonomía y matriz de documentos por plaza/producto, con validaciones.
- `cpq_sim.yml`: reglas CPQ y simuladores, fórmulas, umbrales y aprobaciones.
- `avi.yml`: proceso AVI (solo Importación), entradas, validaciones, workflow y SLAs.
- `contracts.yml`: plantillas, variables de contrato, firmas y aprobaciones.
- `logistics.yml`: hitos logísticos de importación, documentos por hito y SLAs.
- `slas.yml`: SLAs, alertas y escalaciones.
- `uat_scenarios.md`: guías de prueba E2E/UAT.

## Cómo integrar
1. Cargar YAML/MD al repositorio de configuración de tu plataforma.
2. Mapear `guards` y `supported_events` de `state_machine.yml` con tus acciones/API.
3. Implementar validadores de documentos según `documents.yml`.
4. Conectar CPQ con `cpq_sim.yml` (listas de precios, fórmulas, aprobaciones).
5. Activar proceso AVI y logística solo si `plaza == importacion`.
6. Configurar proveedor de firma y aprobaciones según `contracts.yml`.
7. Implementar alertas/SLAs de `slas.yml` y monitoreo de hitos.
8. Ejecutar pruebas con `uat_scenarios.md`.

## Parametrización por producto
Usa `requirements.productos` de `documents.yml` y `rules.margen.minimo_por_producto` en `cpq_sim.yml` para personalizar por familia.

## Versionado
Todos los archivos incluyen `version` y `last_updated`. Usa PRs para cambios.
