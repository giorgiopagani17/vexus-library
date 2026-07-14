<template>
  <VxFieldWrapper v-bind="wrapperProps">
    <template #default="{ fieldId, disabled: fieldDisabled, onFocus: chromeFocus, onBlur: chromeBlur }">
      <div class="vx-colorpicker__control" :class="`vx-colorpicker__control--${size}`">
        <span
          class="vx-colorpicker__swatch"
          :style="{ background: modelValue || '#ffffff' }"
        >
          <input
            :id="fieldId"
            ref="inputRef"
            type="color"
            class="vx-colorpicker__native"
            :value="modelValue || '#000000'"
            :disabled="fieldDisabled || loading"
            @input="onInput"
            @change="onChange"
            @focus="chromeFocus"
            @blur="chromeBlur"
          />
        </span>

        <span v-if="showHex" class="vx-colorpicker__hex" :class="{ 'vx-colorpicker__hex--placeholder': !modelValue }">
          {{ (modelValue || placeholder).toUpperCase() }}
        </span>
      </div>
    </template>

    <template v-if="clearable && modelValue && !disabled" #trailing="{ resolvedIconSize }">
      <button
        type="button"
        class="vx-colorpicker__clear"
        tabindex="-1"
        aria-label="Cancella"
        @mousedown.prevent
        @click="onClear"
      >
        <X :size="resolvedIconSize" />
      </button>
    </template>
  </VxFieldWrapper>
</template>

<script setup>
import { computed, ref } from 'vue'
import { X } from 'lucide-vue-next'
import VxFieldWrapper from '@/Library/core/components/Input/FieldWrapper.vue'

const props = defineProps({
  /** Colore selezionato, formato hex '#rrggbb' (v-model) */
  modelValue: {
    type: String,
    default: '',
  },
  /** Mostra il valore hex accanto allo swatch */
  showHex: {
    type: Boolean,
    default: true,
  },
  variant: {
    type: String,
    default: 'outline',
  },
  /** Colore del bordo/focus ring del campo (non del valore selezionato) */
  color: {
    type: String,
    default: null,
  },
  colors: {
    type: Object,
    default: null,
  },
  size: {
    type: [String, Object],
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
  block: {
    type: Boolean,
    default: false,
  },
  pill: {
    type: Boolean,
    default: false,
  },
  radius: {
    type: [Number, String],
    default: null,
  },
  icon: {
    type: [Object, Function],
    default: null,
  },
  iconPosition: {
    type: String,
    default: 'left',
  },
  iconSize: {
    type: [Number, String],
    default: null,
  },
  clearable: {
    type: Boolean,
    default: false,
  },
  placeholder: {
    type: String,
    default: '#000000',
  },
  label: {
    type: String,
    default: '',
  },
  hint: {
    type: String,
    default: '',
  },
  error: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: String,
    default: '',
  },
  focusEffect: {
    type: String,
    default: 'ring',
  },
})

const emit = defineEmits(['update:modelValue', 'input', 'change', 'focus', 'blur', 'clear'])

const inputRef = ref(null)

const wrapperProps = computed(() => ({
  size: props.size,
  block: props.block,
  variant: props.variant,
  pill: props.pill,
  radius: props.radius,
  color: props.color,
  colors: props.colors,
  focusEffect: props.focusEffect,
  disabled: props.disabled,
  loading: props.loading,
  error: props.error,
  errorMessage: props.errorMessage,
  hint: props.hint,
  label: props.label,
  icon: props.icon,
  iconPosition: props.iconPosition,
  iconSize: props.iconSize,
}))

function onInput(event) {
  emit('update:modelValue', event.target.value)
  emit('input', event)
}

function onChange(event) {
  emit('change', event.target.value)
}

function onClear(event) {
  event?.stopPropagation?.()
  emit('update:modelValue', '')
  emit('clear')
}
</script>

<style lang="scss" scoped>
.vx-colorpicker__control {
  flex: 1 1 auto;
  min-width: 0;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  height: 100%;

  &--sm {
    --vx-colorpicker-swatch-size: 18px;
  }

  &--md {
    --vx-colorpicker-swatch-size: 22px;
  }

  &--lg {
    --vx-colorpicker-swatch-size: 26px;
  }
}

.vx-colorpicker__swatch {
  position: relative;
  flex-shrink: 0;
  width: var(--vx-colorpicker-swatch-size, 22px);
  height: var(--vx-colorpicker-swatch-size, 22px);
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  overflow: hidden;
  cursor: pointer;
}

.vx-colorpicker__native {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  border: none;
  padding: 0;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
  }
}

.vx-colorpicker__hex {
  font: inherit;
  font-family: inherit;
  letter-spacing: 0.02em;

  &--placeholder {
    opacity: 0.5;
  }
}

.vx-colorpicker__clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: none;
  background: transparent;
  padding: 0;
  margin: 0;
  cursor: pointer;
  color: inherit;
  opacity: 0.55;
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 1;
  }
}
</style>c