/**
 * 🎨 Premium Icons System - Conductores PWA
 * Quirúrgico end-to-end UX/UI con microinteracciones
 */

export interface IconState {
  style: 'outline' | 'filled' | 'duotone';
  stroke: string;
  animation?: string;
  duration?: string;
  details?: string;
}

export interface PremiumIcon {
  name: string;
  concept: string;
  phosphorName: string;
  states: {
    default: IconState;
    hover?: IconState;
    active?: IconState;
    error?: IconState;
  };
}

// 🎯 ICONOGRAFÍA PREMIUM CONDUCTORES
export const PREMIUM_ICONS_SYSTEM: PremiumIcon[] = [
  {
    name: 'cotizador',
    concept: 'calculadora con engrane',
    phosphorName: 'ph-calculator',
    states: {
      default: { style: 'outline', stroke: 'var(--muted)' },
      hover: {
        style: 'outline',
        stroke: 'var(--acc)',
        animation: 'rotate-gear',
        duration: '150ms'
      }
    }
  },
  {
    name: 'simulador',
    concept: 'reloj + gráfico de progreso',
    phosphorName: 'ph-clock',
    states: {
      default: { style: 'outline', stroke: 'var(--muted)' },
      hover: {
        style: 'outline',
        stroke: 'var(--acc)',
        animation: 'progress-radial',
        duration: '1s'
      },
      active: {
        style: 'duotone',
        stroke: 'var(--acc)',
        animation: 'radial-fill',
        duration: '1s'
      }
    }
  },
  {
    name: 'tanda',
    concept: 'círculo de manos unidas',
    phosphorName: 'ph-users-four',
    states: {
      default: { style: 'outline', stroke: 'var(--muted)' },
      hover: {
        style: 'outline',
        stroke: 'var(--acc)',
        animation: 'sequential-illuminate',
        duration: '1.2s',
        details: 'cada mano se ilumina secuencialmente - te toca en mes X'
      }
    }
  },
  {
    name: 'proteccion',
    concept: 'escudo con check dinámico',
    phosphorName: 'ph-shield-check',
    states: {
      default: { style: 'outline', stroke: 'var(--muted)' },
      hover: {
        style: 'outline',
        stroke: 'var(--acc)',
        animation: 'shield-ring-fill',
        duration: '1s',
        details: 'anillo se rellena según elegibilidad'
      },
      active: {
        style: 'duotone',
        stroke: 'var(--ok)',
        animation: 'shield-glow'
      },
      error: {
        style: 'outline',
        stroke: 'var(--bad)',
        animation: 'pulse-red',
        duration: '0.5s'
      }
    }
  },
  {
    name: 'postventa',
    concept: 'caja de herramientas + chat bubble',
    phosphorName: 'ph-toolbox',
    states: {
      default: { style: 'outline', stroke: 'var(--muted)' },
      hover: {
        style: 'outline',
        stroke: 'var(--acc)',
        animation: 'toolbox-open',
        duration: '800ms',
        details: 'caja se abre mostrando mini refacciones (tuerca, aceite, filtro)'
      }
    }
  },
  {
    name: 'entregas',
    concept: 'camión en movimiento + timeline',
    phosphorName: 'ph-truck',
    states: {
      default: { style: 'outline', stroke: 'var(--muted)' },
      hover: {
        style: 'outline',
        stroke: 'var(--acc)',
        animation: 'truck-move-forward',
        duration: '800ms'
      },
      error: {
        style: 'outline',
        stroke: 'var(--bad)',
        animation: 'truck-delay-shake',
        details: 'delay - nuevo compromiso en rojo'
      }
    }
  },
  {
    name: 'gnv',
    concept: 'bomba de gas con símbolo de hoja',
    phosphorName: 'ph-gas-pump',
    states: {
      default: { style: 'outline', stroke: 'var(--muted)' },
      hover: {
        style: 'outline',
        stroke: 'var(--ok)',
        animation: 'leaf-glow',
        duration: '1s'
      }
    }
  },
  {
    name: 'avi',
    concept: 'micrófono con ondas',
    phosphorName: 'ph-microphone',
    states: {
      default: { style: 'outline', stroke: 'var(--muted)' },
      hover: {
        style: 'outline',
        stroke: 'var(--acc)',
        animation: 'wave-pulse',
        duration: '1.5s'
      },
      active: {
        style: 'duotone',
        stroke: 'var(--acc)',
        animation: 'wave-pulse-infinite'
      }
    }
  }
];

// 🎨 CSS ANIMATIONS PARA MICROINTERACCIONES
export const PREMIUM_ICON_ANIMATIONS = ``;

// 🧪 QA CHECKLIST VISUAL
export const ICON_QA_CHECKLIST = [
  'Todos los iconos usan grosor de línea 2.5px (var(--icon-stroke))',
  'Animaciones hover/active ≤200ms, ease-in-out',
  'Colores siempre desde tokens (--acc, --ok, --bad, --muted)',
  'Protección/Tanda/Postventa tienen microinteracciones activas',
  'En demo cada icono cuenta historia visual (escudo se llena, manos se iluminan)',
  'Accesibilidad: prefers-reduced-motion respetado',
  'Estados error visibles (pulse-red, truck-delay-shake)',
  'Consistencia: todos outline por defecto, duotone en activo'
];