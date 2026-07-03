<template>
  <div
    class="vx-input-wrapper"
    :class="[`vx-input-wrapper--${resolvedSizeClass}`, { 'vx-input-wrapper--block': block }]"
    :style="sizeVars"
  >
    <label v-if="label" :for="fieldId" class="vx-input-label">
      {{ label }}
    </label>

    <div
      class="vx-input"
      :class="[
        `vx-input--${variant}`,
        `vx-input--${resolvedSizeClass}`,
        `vx-input--focus-${focusEffect}`,
        {
          'vx-input--pill': pill,
          'vx-input--disabled': disabled,
          'vx-input--loading': loading,
          'vx-input--focused': isFocused,
          'vx-input--error': error,
          'vx-input--multiline': multiline,
        },
      ]"
      :style="cssVars"
    >
      <span
        v-if="$slots['icon-left'] || (icon && iconPosition === 'left')"
        class="vx-input__icon vx-input__icon--left"
      >
        <slot name="icon-left">
          <component :is="icon" :size="resolvedIconSize" />
        </slot>
      </span>

      <!--
        Slot di default: qui il componente chiamante (VxInput,
        VxDatePicker, ...) renderizza il proprio elemento interattivo
        (input, textarea, bottone-trigger di un popup, ecc).
        Vengono esposti fieldId/isFocused/onFocus/onBlur perché il
        wrapper non sa nulla del tipo di controllo che riceve.
      -->
      <slot
        :field-id="fieldId"
        :is-focused="isFocused"
        :resolved-icon-size="resolvedIconSize"
        :disabled="disabled"
        :loading="loading"
        :on-focus="onFocus"
        :on-blur="onBlur"
      />

      <span v-if="loading" class="vx-input__spinner">
        <Loader2 :size="resolvedIconSize" class="spin" />
      </span>
      <slot
        v-else
        name="trailing"
        :resolved-icon-size="resolvedIconSize"
        :is-focused="isFocused"
        :disabled="disabled"
      />

      <span
        v-if="!loading && ($slots['icon-right'] || (icon && iconPosition === 'right'))"
        class="vx-input__icon vx-input__icon--right"
      >
        <slot name="icon-right">
          <component :is="icon" :size="resolvedIconSize" />
        </slot>
      </span>
    </div>

    <p v-if="hint || (error && errorMessage)" class="vx-input__hint" :class="{ 'vx-input__hint--error': error }">
      {{ error ? errorMessage : hint }}
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Loader2 } from 'lucide-vue-next'
import { useFieldChrome } from '@/Library/core/composables/Input/useFieldChrome'

const props = defineProps({
  /** 'sm' | 'md' | 'lg' */
  size: {
    type: [String, Object],
    default: 'md',
  },
  /** Occupa tutta la larghezza disponibile */
  block: {
    type: Boolean,
    default: false,
  },
  /** 'outline' | 'ghost' | 'text' */
  variant: {
    type: String,
    default: 'outline',
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
  /**
   * Colore del bordo/focus ring.
   * Accetta qualunque valore CSS valido: '#7c3aed', 'rgb(...)',
   * 'rgba(...)', 'red', 'var(--mio-brand)', ecc.
   */
  color: {
    type: String,
    default: '#7c3aed',
  },
  /**
   * Override colori custom, scavalca il colore impostato tramite `color`.
   * { background, text, icon, border, focusBorder, focusShadow, placeholder }
   */
  colors: {
    type: Object,
    default: null,
  },
  /** 'ring' (default) | 'lift' | 'glow' | 'none' | 'custom' */
  focusEffect: {
    type: String,
    default: 'ring',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  /** Mostra spinner al posto dello slot "trailing" */
  loading: {
    type: Boolean,
    default: false,
  },
  /** Stato di errore: bordo/focus ring rosso */
  error: {
    type: Boolean,
    default: false,
  },
  /** Messaggio mostrato sotto il campo quando error è true */
  errorMessage: {
    type: String,
    default: '',
  },
  /** Testo di aiuto sotto il campo (nascosto se error è true e c'è errorMessage) */
  hint: {
    type: String,
    default: '',
  },
  /** Etichetta sopra il campo */
  label: {
    type: String,
    default: '',
  },
  /**
   * Applica lo stile "multiline" (altezza auto, padding verticale).
   * Va passato dal componente chiamante (es. VxInput con tag="textarea"),
   * il wrapper non sa cosa rende al suo interno.
   */
  multiline: {
    type: Boolean,
    default: false,
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
})

const { fieldId, isFocused, resolvedIconSize, cssVars, onFocus, onBlur } =
  useFieldChrome(props, 'vx-field')

const resolvedSizeClass = computed(() => {
  if (typeof props.size === 'string') return props.size
  return props.size?.preset || 'custom'
})

const toCssSize = (value) => {
  if (value === undefined || value === null) return null
  return typeof value === 'number' ? `${value}px` : value
}

const sizeVars = computed(() => {
  if (!props.size || typeof props.size !== 'object') return {}

  const size = props.size
  const vars = {}

  const set = (name, value) => {
    const cssValue = toCssSize(value)
    if (cssValue !== null) vars[name] = cssValue
  }

  set('--vx-input-wrapper-gap', size.wrapperGap ?? size.gap)
  set('--vx-input-label-font-size', size.labelFontSize)
  set('--vx-input-label-font-weight', size.labelFontWeight)
  set('--vx-input-gap', size.gap)
  set('--vx-input-height', size.height)
  set('--vx-input-min-height', size.minHeight)
  set('--vx-input-padding-x', size.paddingX)
  set('--vx-input-padding-y', size.paddingY)
  set('--vx-input-font-size', size.fontSize)
  set('--vx-input-icon-size', size.iconSize)
  set('--input-radius', size.radius)
  set('--vx-input-multiline-min-height', size.multilineMinHeight)

  return vars
})

// Utile se un componente padre vuole leggere/forzare lo stato di focus
// dall'esterno (es. un date picker che tiene il box "focused" mentre
// il pannello calendario è aperto anche se l'input ha perso il focus).
defineExpose({ fieldId, isFocused })
</script>

<style lang="scss" scoped>
.vx-input-wrapper {
  display: inline-flex;
  flex-direction: column;
  gap: var(--vx-input-wrapper-gap, 6px);
  min-width: 0;

  &--block {
    display: flex;
    width: 100%;
  }
}

.vx-input-label {
  font-size: var(--vx-input-label-font-size, 13px);
  font-weight: var(--vx-input-label-font-weight, 600);
  opacity: 0.8;
}

.vx-input {
  --input-radius: 10px;
  box-sizing: border-box;
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--vx-input-gap, 8px);
  width: 100%;
  min-width: 0;
  border: 1px solid var(--input-border, rgba(0, 0, 0, 0.15));
  border-radius: var(--input-radius);
  background: var(--input-bg, transparent);
  color: var(--input-text, inherit);
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    background 0.15s ease,
    opacity 0.15s ease,
    transform 0.15s ease;

  &--disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  &--loading {
    opacity: 0.85;
  }

  /* ===== dimensioni ===== */
  &--sm:not(.vx-input--multiline) {
    height: 32px;
    padding: 0 10px;
    font-size: 13px;
  }

  &--md:not(.vx-input--multiline) {
    height: 40px;
    padding: 0 14px;
    font-size: 14px;
  }

  &--lg:not(.vx-input--multiline) {
    height: 48px;
    padding: 0 18px;
    font-size: 15px;
  }

  &--custom:not(.vx-input--multiline) {
    height: var(--vx-input-height, auto);
    min-height: var(--vx-input-min-height, 40px);
    padding: var(--vx-input-padding-y, 0) var(--vx-input-padding-x, 14px);
    font-size: var(--vx-input-font-size, 14px);
  }

  &--multiline {
    height: auto;
    min-height: var(--vx-input-multiline-min-height, 96px);
    align-items: stretch;
    padding: 10px 14px;
    font-size: var(--vx-input-font-size, 14px);
  }

  &--pill {
    --input-radius: 999px;
  }

  &--ghost {
    border-color: transparent;
    background: var(--input-bg, color-mix(in srgb, currentColor 6%, transparent));
  }

  /* text: nessun bordo laterale, solo underline */
  &--text {
    border: none;
    border-bottom: 1px solid var(--input-border, rgba(0, 0, 0, 0.15));
    border-radius: 0;
    padding-left: 2px;
    padding-right: 2px;
    background: transparent;
  }

  &--text.vx-input--multiline {
    padding-top: 10px;
    padding-bottom: 10px;
  }

  &--error {
    --input-border-focus: #{$negative};
    border-color: #{$negative};
  }

  /* ===== stato focus (bordo sempre, effetto extra secondo focusEffect) ===== */
  &--focused:not(.vx-input--disabled):not(.vx-input--error) {
    border-color: var(--input-border-focus, currentColor);
  }

  &--focus-lift.vx-input--focused:not(.vx-input--disabled) {
    transform: translateY(-1px);
  }

  &--focus-glow.vx-input--focused:not(.vx-input--disabled) {
    box-shadow:
      0 0 0 3px var(--input-shadow-focus, color-mix(in srgb, currentColor 25%, transparent)),
      0 8px 20px var(--input-shadow-focus, color-mix(in srgb, currentColor 12%, transparent));
    transform: translateY(-1px);
  }

  &--focus-none.vx-input--focused:not(.vx-input--disabled) {
    box-shadow: none;
    transform: none;
  }

  /*
   * custom: il componente non applica alcun effetto predefinito.
   * Gestisci tu il focus dal parent con CSS scoped, ad es.:
   * :deep(.vx-input--focus-custom.vx-input--focused) { ... }
   */
  &--focus-custom {
    &.vx-input--focused {
      box-shadow: none;
      transform: none;
    }
  }
}

.vx-input__icon,
.vx-input__spinner {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--input-icon, --input-placeholder, rgba(0, 0, 0, 0.5));
}

.vx-input__icon {
  opacity: 0.7;
}

.vx-input--multiline .vx-input__icon,
.vx-input--multiline .vx-input__spinner {
  align-self: flex-start;
  margin-top: 2px;
}

.vx-input__hint {
  font-size: 12px;
  line-height: 1.4;
  opacity: 0.65;
  margin: 0;

  &--error {
    opacity: 1;
    color: #{$negative};
  }
}

.spin {
  animation: vx-input-spin 0.8s linear infinite;
}

@keyframes vx-input-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>