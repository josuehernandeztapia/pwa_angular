## Checklist por pantalla (funcional + visual)

> Usa [ ] para pendientes y [x] para completados.

### 1. Dashboard
- **Funcional**
  - [ ] NBA coherente con KPIs
  - [ ] Radar emite eventos correctos
- **Visual**
  - [ ] Jerarquía de título/subtítulo
  - [ ] Sin CLS al cargar

### 2. Nueva Oportunidad
- **Funcional**
  - [ ] Validadores email/phone/RFC
  - [ ] Draft recovery
  - [ ] Gating por selección
- **Visual**
  - [ ] CTA visibles
  - [ ] Errores bajo inputs

### 3. Clientes (lista)
- **Funcional**
  - [ ] Filtros combinados
  - [ ] Persistencia de filtros
  - [ ] Paginación/virtual scroll
- **Visual**
  - [ ] Badges/estados claros
  - [ ] Skeletons en carga

### 4. Cliente nuevo
- **Funcional**
  - [ ] Validadores + mensajes
  - [ ] Manejo de 400/409
- **Visual**
  - [ ] Orden en inputs
  - [ ] Feedback de guardado/errores

### 5. Cotizador (main)
- **Funcional**
  - [ ] Cambio de paquete resetea opcionales
  - [ ] Cálculo estable
- **Visual**
  - [ ] Breakdown claro
  - [ ] Sin saltos al recalcular

### 6. AGS Individual
- **Funcional**
  - [ ] Enganche ≥ 60%
  - [ ] Seguro anual multiplicado por años
  - [ ] Límites de enganche
- **Visual**
  - [ ] Inputs con rangos
  - [ ] Mensajes de límites

### 7. EdoMex Colectivo
- **Funcional**
  - [ ] Enganche 15–20%
  - [ ] Miembros 5–20
  - [ ] Reparto por miembro
- **Visual**
  - [ ] Grid de miembros
  - [ ] Estados de validación

### 8. Simulador (hub)
- **Funcional**
  - [ ] Guardado de borradores
  - [ ] Comparación 2–3 escenarios
- **Visual**
  - [ ] Tarjetas estables
  - [ ] Iconografía consistente

### 9. AGS Ahorro
- **Funcional**
  - [ ] Tiempo a meta
  - [ ] 0 aporte y extremos
- **Visual**
  - [ ] Timeline/métricas legibles

### 10. EdoMex Individual
- **Funcional**
  - [ ] Límites de enganche/término
  - [ ] Coherencia con cotizador
- **Visual**
  - [ ] Consistencia de etiquetas y rangos

### 11. Tanda Colectiva
- **Funcional**
  - [ ] Criterios mínimos (miembros/duración/umbral)
  - [ ] Confianza
- **Visual**
  - [ ] Badges por criterio
  - [ ] Explicaciones

### 12. Onboarding
- **Funcional**
  - **selection**
    - [ ] EdoMex requiere ecosistema
    - [ ] saleType/colectivo exige clientType/grupo ≥ 5
  - **documents**
    - [ ] Requeridos aprobados
  - **kyc**
    - [ ] Requiere INE+Comprobante aprobados
    - [ ] Status + tooltip
    - [ ] Reintentos
  - **contracts**
    - [ ] Generar/firmar con Mifiel
    - [ ] Callback y errores
- **Visual**
  - [ ] Steps con progreso
  - [ ] Modales accesibles (focus‑trap)
  - [ ] Empty states (sin ecosistemas)

### 13. Document Upload (común)
- **Funcional**
  - [ ] Tipo/tamaño
  - [ ] Reemplazo
  - [ ] Gating
  - [ ] Drag&drop y reintentos
- **Visual**
  - [ ] Card/preview consistente
  - [ ] Estado reemplazo/deleción

### 14. Oportunidades (pipeline)
- **Funcional**
  - [ ] Movimientos/estados persistentes
  - [ ] Conteos correctos
- **Visual**
  - [ ] Columnas con scroll fluido
  - [ ] Feedback al mover

### 15. Expedientes
- **Funcional**
  - [ ] Lectura de expediente/servicios/recordatorios
  - [ ] Errores 404/500 manejados
- **Visual**
  - [ ] “No Data” claro
  - [ ] Skeletons en carga

### 16. Operaciones: Entregas
- **Funcional**
  - [ ] Milestones
  - [ ] Filtros
  - [ ] Estados
  - [ ] Paginación
- **Visual**
  - [ ] Líneas de progreso
  - [ ] Cards consistentes

### 17. Operaciones: Triggers
- **Funcional**
  - [ ] Reglas
  - [ ] Generación de orden
  - [ ] Filtros
  - [ ] Tabs
  - [ ] Auto‑refresh/manual
- **Visual**
  - [ ] Premium‑container
  - [ ] Modal de error con role=dialog y focus‑trap

### 18. Reportes
- **Funcional**
  - [ ] Coherencia con KPIs de dashboard
  - [ ] Carga con latencia
- **Visual**
  - [ ] Charts accesibles
  - [ ] Colores/leyendas

### 19. Productos
- **Funcional**
  - [ ] Carga de catálogo
  - [ ] Detalle
  - [ ] CTA
- **Visual**
  - [ ] Imagen fallback
  - [ ] Placeholders

### 20. Protección
- **Funcional**
  - [ ] Impacto de escenarios en mensualidad
  - [ ] Firmado Mifiel con errores/reintentos
- **Visual**
  - [ ] Cards/selección de plan
  - [ ] Consistencia

### 21. Perfil
- **Funcional**
  - [ ] Preferencias A11y persistentes
  - [ ] Datos sensibles no en localStorage
- **Visual**
  - [ ] Estructura limpia
  - [ ] Toggles accesibles