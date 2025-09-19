## QA No-Core (PR#14–PR#18)

Checklist por módulo. Columnas: Light, Dark, Accesibilidad (AA con axe).

| Módulo | Light | Dark | Accesibilidad |
|---|---|---|---|
| Postventa (/postventa/wizard) | ☐ | ☐ | ☐ |
| GNV (/ops/gnv-health) | ☐ | ☐ | ☐ |
| Integración Odoo (/integraciones/odoo) | ☐ | ☐ | ☐ |
| Integración Neon (/integraciones/neon) | ☐ | ☐ | ☐ |
| Integración Callbacks (/integraciones/callbacks) | ☐ | ☐ | ☐ |
| Administración/Usuarios (/usuarios) | ☐ | ☐ | ☐ |
| Responsive Desktop/Tablet/Mobile | ☐ | ☐ | ☐ |
| Offline (/offline) | ☐ | ☐ | ☐ |

Evidencia: capturas en `tests/screenshots/no-core/`.

Notas:
- UI components: `.ui-card`, `.ui-btn`, `.ui-input` presentes en todos los módulos.
- Sin gradientes/shimmer/glassmorphism (consistencia OpenAI-style).
- Validado con `@axe-core/playwright` (impactos critical/serious = 0).

