PR#313 – Clean Responsive + Offline (Minimal Dark) – Audit Note

Objetivo

- Asegurar que la PWA sea completamente responsive (mobile/tablet/desktop) en estilo Minimal Dark.
- Unificar el manejo de estado offline con componentes sobrios, sin estilos Premium.

Alcance verificado

- Layout
  - `app.component.html` encapsula `app-shell` como contenedor raíz.
  - `layout/shell/shell.component.html`:
    - Sidebar colapsable en mobile usando `.ui-card`, overlay y transiciones.
    - Topbar compacto con botón hamburguesa (`md:hidden`), búsqueda responsiva (`ui-input` con widths `sm/md`).
    - Uso de utilidades Tailwind (`hidden md:block`, `flex`, `p-*`, `gap-*`).
  - `shell.component.ts`: control de `mobileOpen` y toggle de modo oscuro persistente.

- Tablas
  - `components/pages/usuarios/usuarios.component.html`: tabla envuelta en `div.overflow-x-auto`.
  - `components/pages/documentos/documentos.component.html`: tabla con `overflow-x-auto`.
  - `components/pages/ops/gnv-health.component.ts`: tabla con `overflow-x-auto` y tokens en estados.

- Offline
  - `components/shared/offline/offline.component.html|ts`:
    - Banner sobrio con `.ui-card` y botones `ui-btn ui-btn-secondary`.
    - Tokens de color: `--yellow`, `--red`, `--surface-dark`, `--text-light`, `--text-2`.
    - Sin gradientes, sin clases `.premium-*`.

- SCSS/Tokens
  - `app.component.scss` usa `var(--bg-dark)`, `var(--surface-dark)`, `var(--border-dark)`, `var(--text-light)`.
  - Estilos globales minimalistas; sin decorativos innecesarios.

QA Interno (grep)

Comandos ejecutados:

```bash
grep -RIn "premium\|white\|#fff\|gradient" src/app/layout/
grep -RIn "premium\|white\|#fff\|gradient" src/app/components/shared/offline/
```

Resultado: 0 ocurrencias en ambos directorios.

Criterios de aceptación

- Layouts responsive sobrios sin gradientes ni clases Premium: Cumplido.
- Estado offline consistente con Minimal Dark: Cumplido.
- Sidebar/Topbar adaptados a móvil con utilidades Tailwind: Cumplido.
- Tokens aplicados correctamente: Cumplido.

Notas

- Las mejoras validadas ya existen en `main`. Este PR documenta la auditoría y el resultado del QA.

