## ✅ QA Manual – Minimal Dark (PR #280)

### 1. Login

- [ ] Fondo sólido oscuro (`#0b0f14`), sin gradientes.
- [ ] Inputs con borde gris (`#374151`), texto claro.
- [ ] Botón primario cyan sólido, secundario gris oscuro.
- [ ] Contraste de labels/placeholder legible (nuevo `--text-secondary`).

### 2. Dashboard

- [ ] Sidebar oscuro plano, íconos monocromo.
- [ ] Cards (`.ui-card`) con fondo sólido (`#1f2937`), sin glass ni sombras fuertes.
- [ ] Texto secundario (`--text-secondary`) legible en todos los bloques.

### 3. Pipeline / Clientes

- [ ] Cards de oportunidades sin gradientes, solo bordes grises.
- [ ] Etiquetas de estado: verde (#10b981), amarillo (#f59e0b), rojo (#ef4444).
- [ ] Forms con inputs oscuros y validaciones visibles.

### 4. Simulador / Cotizador

- [ ] Botones sólidos, sin gradientes.
- [ ] Resultados en texto claro, sin “colores premium” (azul brillante).
- [ ] Placeholders y tooltips con contraste correcto.

### 5. Post-venta / Entregas

- [ ] Checklists sin glass, fondo sólido.
- [ ] Estados claros con colores semánticos.
- [ ] Sin `linear-gradient` ni `backdrop-filter`.

### 6. Responsive

- [ ] Revisar en 1440px, 820px, 390px.
- [ ] Layout estable, sin recortes ni overflow.
- [ ] Botones grandes “tappeables” en mobile.

### 7. Accesibilidad

- [ ] Navegación por teclado en login y forms.
- [ ] Labels correctamente asociados a inputs.
- [ ] Contraste mínimo AA en todos los textos.