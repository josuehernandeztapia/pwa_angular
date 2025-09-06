# UAT / E2E Scenarios

## Nacional E2E
1. Inicio → Mercado (segmento/plaza) → Producto → Cotizador (margen OK) → Simulador (escenario aprobado) → Onboarding (KYC/AML OK) → Oportunidad → Documentos (checklist 100%) → Contratos (firmado) → Entrega/Activación → Postventa → Cerrada.
   - Validar bloqueos: sin documentos mínimos, sin contrato firmado, entrega no aceptada.

## Importación E2E
1. Inicio → Mercado → Producto → Cotizador (incoterm/moneda) → Simulador → Onboarding → Oportunidad → Documentos → AVI (vigente) → Contratos → Seguimiento de importación (todos los hitos) → Postventa → Cerrada.
   - Validar bloqueos: AVI vencido, hito retrasado, documentos faltantes.

## Reglas CPQ/Simulación
- Descuento sobre umbral requiere aprobación (Finanzas/Admin)
- Margen bajo umbral requiere aprobación (Finanzas)
- Fórmulas y outputs coinciden con `cpq_sim.yml`

## Documentos
- Vencimientos, formatos permitidos y cruces de datos (RFC/razón social)

## Contratos
- Firmas completas, orden de firmas, coincidencia con oferta aprobada

## Logística (Importación)
- Hitos completos en orden, alertas por SLA, documentación por hito

## SLAs y Alertas
- Alertas de vencimiento AVI, escalaciones a 24h y 48h
