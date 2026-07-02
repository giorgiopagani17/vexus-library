<template>
  <component
    :is="tag"
    class="vx-btn"
    :class="[
      `vx-btn--${variant}`,
      colorModifierClass,
      `vx-btn--${size}`,
      `vx-btn--hover-${hoverEffect}`,
      {
        'vx-btn--block': block,
        'vx-btn--pill': pill,
        'vx-btn--loading': loading,
        'vx-btn--disabled': disabled || loading,
        'vx-btn--icon-only': iconOnly,
      },
    ]"
    :style="cssVars"
    :disabled="isNativeButton ? (disabled || loading) : undefined"
    :aria-disabled="disabled || loading ? 'true' : undefined"
    :aria-busy="loading ? 'true' : undefined"
    @click="handleClick"
  >
    <!--
      Spinner: si sovrappone al contenuto durante il loading (position: absolute),
      il contenuto resta renderizzato ma invisibile per mantenere invariata
      la larghezza/altezza del bottone.
    -->
    <span v-if="loading" class="vx-btn__spinner">
      <Loader2 :size="resolvedIconSize" class="spin" />
    </span>

    <span class="vx-btn__content" :class="{ 'vx-btn__content--hidden': loading }">
      <span
        v-if="$slots['icon-left'] || (icon && iconPosition === 'left')"
        class="vx-btn__icon vx-btn__icon--left"
      >
        <slot name="icon-left">
          <component :is="icon" :size="resolvedIconSize" />
        </slot>
      </span>

      <span v-if="$slots.default" class="vx-btn__label">
        <slot />
      </span>

      <span
        v-if="$slots['icon-right'] || (icon && iconPosition === 'right')"
        class="vx-btn__icon vx-btn__icon--right"
      >
        <slot name="icon-right">
          <component :is="icon" :size="resolvedIconSize" />
        </slot>
      </span>
    </span>
  </component>
</template>

<script setup>
import { computed, useSlots } from 'vue'
import { Loader2 } from 'lucide-vue-next'

const props = defineProps({
  /** 'solid' | 'outline' | 'ghost' | 'text' */
  variant: {
    type: String,
    default: 'solid',
  },
  /**
   * Colore del bottone.
   * Accetta:
   * - un token della palette interna: 'primary' | 'secondary' | 'positive' |
   *   'negative' | 'warning' | 'info' (usa le classi SCSS predefinite,
   *   comportamento invariato rispetto a prima)
   * - un valore custom qualsiasi: '#ff6600', 'rgb(...)',
   *   'var(--mio-brand-color)' — in questo caso viene impostato
   *   direttamente come CSS custom property (nessuna variabile SCSS
   *   richiesta, funziona anche con var() dinamiche)
   *
   * Nota: `colors.background` (vedi sotto) ha sempre precedenza su `color`.
   */
  color: {
    type: String,
    default: 'primary',
  },
  /** 'sm' | 'md' | 'lg' */
  size: {
    type: String,
    default: 'md',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  /** Occupa tutta la larghezza disponibile */
  block: {
    type: Boolean,
    default: false,
  },
  /** Bordi completamente arrotondati (pillola) */
  pill: {
    type: Boolean,
    default: false,
  },
  /** Override del border-radius, number → px, string → usata così com'è */
  radius: {
    type: [Number, String],
    default: null,
  },
  /** Componente icona (es. da lucide-vue-next), usato se non passi gli slot */
  icon: {
    type: [Object, Function],
    default: null,
  },
  /** 'left' | 'right' — posizione della prop `icon` quando non usi gli slot */
  iconPosition: {
    type: String,
    default: 'left',
  },
  /** Override dimensione icona, number → px, string → usata così com'è */
  iconSize: {
    type: [Number, String],
    default: null,
  },
  /**
   * Override colori custom, scavalca la palette del `color` scelto.
   * { background, text, border, hoverBackground, hoverText, hoverBorder, shadow }
   *
   * Ogni valore accetta:
   * - un colore CSS qualsiasi: '#fff', 'rgba(0,0,0,.5)', 'red', ecc.
   * - una CSS custom property: 'var(--mio-colore)'
   * - un nome breve della palette interna (risolto in var(--vx-<nome>)):
   *   'primary' | 'secondary' | 'positive' | 'negative' | 'warning' | 'info' | 'white'
   *
   * Le variabili SCSS ($primary, $secondary, ...) NON sono utilizzabili
   * direttamente come prop perché vengono compilate ed eliminate a build-time:
   * usa invece il nome token ('primary') oppure var(--vx-primary), entrambi
   * derivati dalla stessa palette SCSS ed esposti come CSS custom property.
   */
  colors: {
    type: Object,
    default: null,
  },
  /**
   * Modalità dell'effetto hover.
   * 'brightness' (default) | 'scale' | 'lift' | 'glow' | 'underline' | 'none' | 'custom'
   * Con 'custom' nessun effetto viene applicato dal componente: gestiscilo tu
   * via CSS scoped nel parent, slot, o tramite la prop `colors`.
   */
  hoverEffect: {
    type: String,
    default: 'brightness',
  },
  /** Tag/componente da renderizzare: 'button', 'a', RouterLink, ecc. */
  tag: {
    type: [String, Object, Function],
    default: 'button',
  },
})

const emit = defineEmits(['click'])

const slots = useSlots()

const isNativeButton = computed(() => props.tag === 'button')

const iconOnly = computed(() => !slots.default && !!(props.icon || slots['icon-left'] || slots['icon-right']))

// Nomi brevi della palette, risolti nelle CSS custom property globali
// esposte in stile (derivate dalle variabili SCSS $primary, $secondary, ecc.)
const paletteTokens = ['primary', 'secondary', 'positive', 'negative', 'warning', 'info', 'white']

const isPaletteColor = computed(() => paletteTokens.includes(props.color))

/**
 * Classe modifier per il colore: se `color` è un token noto della palette,
 * usa la classe SCSS predefinita ('vx-btn--primary', ecc.); altrimenti
 * (valore custom: hex, rgb, var()) usa una classe neutra e il colore
 * viene impostato via inline style in `cssVars`.
 */
const colorModifierClass = computed(() =>
  isPaletteColor.value ? `vx-btn--${props.color}` : 'vx-btn--custom-color'
)

const sizeToIcon = { sm: 14, md: 16, lg: 18 }
const resolvedIconSize = computed(() => props.iconSize ?? sizeToIcon[props.size] ?? 16)

function handleClick(event) {
  if (props.disabled || props.loading) {
    event.preventDefault()
    event.stopPropagation()
    return
  }
  emit('click', event)
}

const toCssSize = (value) => {
  if (value === undefined || value === null) return null
  return typeof value === 'number' ? `${value}px` : value
}

const colorMap = {
  background: '--btn-bg',
  text: '--btn-text',
  border: '--btn-border',
  hoverBackground: '--btn-bg-hover',
  hoverText: '--btn-text-hover',
  hoverBorder: '--btn-border-hover',
  shadow: '--btn-shadow',
}

/**
 * Risolve il valore di un colore passato in `color` o `colors`:
 * - se è un nome token della palette ('primary', ecc.) -> var(--vx-<token>)
 * - altrimenti lo restituisce così com'è (accetta già hex, rgb/rgba,
 *   var(--qualcosa), o qualunque valore CSS valido)
 */
function resolveColorValue(value) {
  if (!value || typeof value !== 'string') return value
  const trimmed = value.trim()
  return paletteTokens.includes(trimmed) ? `var(--vx-${trimmed})` : trimmed
}

const cssVars = computed(() => {
  const vars = {}

  // `color` custom (non un token della palette): imposta il colore base
  // direttamente via CSS custom property, senza passare dalla classe SCSS.
  // Viene sempre sovrascritto da `colors.background` se presente (v. sotto).
  if (!isPaletteColor.value) {
    const resolvedBase = resolveColorValue(props.color)
    if (resolvedBase) {
      vars['--btn-bg'] = resolvedBase
      vars['--btn-text'] = 'var(--vx-white)'
      vars['--btn-border'] = 'transparent'
    }
  }

  const c = props.colors || {}
  for (const key in colorMap) {
    const resolved = resolveColorValue(c[key])
    if (resolved) vars[colorMap[key]] = resolved
  }

  const radius = toCssSize(props.radius)
  if (radius) vars['--btn-radius'] = radius

  return vars
})
</script>

<style lang="scss" scoped>
/*
 * Espone la palette SCSS come CSS custom property globali.
 * Le variabili SCSS ($primary, ecc.) esistono solo a build-time e non sono
 * utilizzabili a runtime (es. nel prop `colors`, o in var() da altri
 * componenti). Qui vengono "trasferite" in custom property CSS, che invece
 * sopravvivono a runtime e sono globali (:global disattiva lo scoping di
 * Vue per questo blocco).
 */
:global(:root) {
  --vx-primary: #{$primary};
  --vx-secondary: #{$secondary};
  --vx-positive: #{$positive};
  --vx-negative: #{$negative};
  --vx-warning: #{$warning};
  --vx-info: #{$info};
  --vx-white: #{$white};
}

.vx-btn {
  --btn-radius: 10px;

  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid transparent;
  border-radius: var(--btn-radius);
  font-family: inherit;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  background: var(--btn-bg);
  color: var(--btn-text);
  border-color: var(--btn-border, transparent);
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease,
    filter 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease,
    transform 0.15s ease;

  &:hover:not(.vx-btn--disabled) {
    background: var(--btn-bg-hover, var(--btn-bg));
    color: var(--btn-text-hover, var(--btn-text));
    border-color: var(--btn-border-hover, var(--btn-border, transparent));
  }

  &:active:not(.vx-btn--disabled) {
    filter: brightness(0.95);
  }

  &:focus-visible {
    outline: 2px solid var(--btn-border-hover, var(--btn-bg));
    outline-offset: 2px;
  }

  /* ===== stati: cursore gestito via classi, non via style inline =====
     l'ordine conta: --loading dopo --disabled così, se entrambi attivi,
     vince "wait" (coerente con aria-busy) */
  &--disabled {
    cursor: not-allowed;
    opacity: 0.5;
    filter: none;
    transform: none;
  }

  &--loading {
    cursor: wait;
    opacity: 0.5;
    filter: none;
    transform: none;
  }

  &--block {
    display: flex;
    width: 100%;
  }

  &--pill {
    --btn-radius: 999px;
  }

  /* ===== dimensioni ===== */
  &--sm {
    height: 32px;
    padding: 0 12px;
    font-size: 13px;
  }

  &--md {
    height: 40px;
    padding: 0 18px;
    font-size: 14px;
  }

  &--lg {
    height: 48px;
    padding: 0 24px;
    font-size: 15px;
  }

  &.vx-btn--icon-only {
    &.vx-btn--sm { width: 32px; padding: 0; }
    &.vx-btn--md { width: 40px; padding: 0; }
    &.vx-btn--lg { width: 48px; padding: 0; }
  }

  /* ===== palette colori — solid (default) ===== */
  &--primary   { --btn-bg: #{$primary};   --btn-text: #{$white}; --btn-border: transparent; --btn-shadow: #{rgba($primary, 0.3)}; }
  &--secondary { --btn-bg: #{$secondary}; --btn-text: #{$white}; --btn-border: transparent; --btn-shadow: #{rgba($secondary, 0.3)}; }
  &--positive  { --btn-bg: #{$positive};  --btn-text: #{$white}; --btn-border: transparent; --btn-shadow: #{rgba($positive, 0.3)}; }
  &--negative  { --btn-bg: #{$negative};  --btn-text: #{$white}; --btn-border: transparent; --btn-shadow: #{rgba($negative, 0.3)}; }
  &--warning   { --btn-bg: #{$warning};   --btn-text: #{$white}; --btn-border: transparent; --btn-shadow: #{rgba($warning, 0.3)}; }
  &--info      { --btn-bg: #{$info};      --btn-text: #{$white}; --btn-border: transparent; --btn-shadow: #{rgba($info, 0.3)}; }

  /*
   * custom-color: usata quando `color` non è un token della palette
   * (hex, rgb, var(--...)). --btn-bg/--btn-text/--btn-border sono già
   * impostate via inline style (cssVars); qui serve solo per coerenza
   * con le altre modifier class, nessuna regola aggiuntiva necessaria.
   */
  &--custom-color {
  }

  &--solid {
    box-shadow: 0 6px 16px var(--btn-shadow, color-mix(in srgb, var(--btn-bg) 30%, transparent));
  }

  /* ===== outline: bordo colorato, sfondo trasparente ===== */
  &--outline {
    background: transparent;
    border-color: var(--btn-bg);
    color: var(--btn-bg);

    &:hover:not(.vx-btn--disabled) {
      background: color-mix(in srgb, var(--btn-bg) 12%, transparent);
    }
  }

  /* ===== ghost: sfondo tenue, nessun bordo ===== */
  &--ghost {
    background: color-mix(in srgb, var(--btn-bg) 12%, transparent);
    border-color: transparent;
    color: var(--btn-bg);
    box-shadow: none;

    &:hover:not(.vx-btn--disabled) {
      background: color-mix(in srgb, var(--btn-bg) 20%, transparent);
    }
  }

  /* ===== text: nessuno sfondo, nessun bordo ===== */
  &--text {
    background: transparent;
    border-color: transparent;
    color: var(--btn-bg);
    box-shadow: none;
    padding-left: 4px;
    padding-right: 4px;

    &:hover:not(.vx-btn--disabled) {
      background: transparent;
    }
  }

  /* ===== modalità hover ===== */

  /* brightness (default): schiarisce leggermente il colore al hover */
  &--hover-brightness {
    &:hover:not(.vx-btn--disabled) {
      filter: brightness(1.08);
    }
  }

  /* scale: leggero zoom-in al hover */
  &--hover-scale {
    &:hover:not(.vx-btn--disabled) {
      transform: scale(1.04);
    }
  }

  /* lift: il bottone si "alza" con un'ombra più marcata */
  &--hover-lift {
    &:hover:not(.vx-btn--disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px var(--btn-shadow, rgba(0, 0, 0, 0.15));
    }
  }

  /* glow: bagliore diffuso attorno al bottone */
  &--hover-glow {
    &:hover:not(.vx-btn--disabled) {
      box-shadow: 0 0 0 4px var(--btn-shadow, rgba(0, 0, 0, 0.15));
    }
  }

  /* underline: utile soprattutto per variant="text" */
  &--hover-underline {
    &:hover:not(.vx-btn--disabled) {
      text-decoration: underline;
      text-decoration-thickness: 2px;
    }
  }

  /* none: nessun effetto visivo al hover, resta solo il cambio colore base */
  &--hover-none {
    &:hover:not(.vx-btn--disabled) {
      filter: none;
      transform: none;
      box-shadow: none;
    }
  }

  /*
   * custom: il componente non applica alcun effetto predefinito.
   * Gestisci tu l'hover dal parent con CSS scoped, ad es.:
   * :deep(.vx-btn--hover-custom:hover) { ... }
   * oppure tramite la prop `colors` (hoverBackground, hoverText, hoverBorder).
   */
  &--hover-custom {
    &:hover:not(.vx-btn--disabled) {
      filter: none;
      transform: none;
    }
  }
}

.vx-btn__content {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: inherit;
}

/*
 * Il contenuto resta nel flusso (visibility: hidden, non display: none)
 * cosi il bottone mantiene le dimensioni originali durante il loading.
 */
.vx-btn__content--hidden {
  visibility: hidden;
}

.vx-btn__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.vx-btn__label {
  display: inline-flex;
  align-items: center;
}

.vx-btn__spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.spin {
  animation: vx-btn-spin 0.8s linear infinite;
}

@keyframes vx-btn-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>