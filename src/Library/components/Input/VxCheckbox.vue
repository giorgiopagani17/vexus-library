<template>
  <div
    class="vx-checkbox-field"
    :class="{ 'vx-checkbox-field--block': block, 'vx-checkbox-field--error': error }"
  >
    <label
      class="vx-checkbox"
      :class="[
        `vx-checkbox--${resolvedSize}`,
        {
          'vx-checkbox--disabled': disabled || loading,
          'vx-checkbox--checked': isChecked,
          'vx-checkbox--indeterminate': indeterminate,
          [`vx-checkbox--focus-${focusEffect}`]: focusEffect,
        },
      ]"
      :style="checkboxStyle"
    >
      <input
        :id="inputId"
        ref="inputRef"
        type="checkbox"
        class="vx-checkbox__input"
        :name="name"
        :checked="isChecked"
        :disabled="disabled || loading"
        :aria-describedby="hint || errorMessage ? `${inputId}-desc` : undefined"
        @change="onChange"
        @focus="onFocus"
        @blur="onBlur"
      />

      <span class="vx-checkbox__box" aria-hidden="true">
        <Loader2 v-if="loading" class="vx-checkbox__spinner" :size="iconPixelSize" />
        <Minus v-else-if="indeterminate" :size="iconPixelSize" />
        <Check v-else :size="iconPixelSize" />
      </span>

      <span v-if="label || $slots.default" class="vx-checkbox__label">
        <slot>{{ label }}</slot>
      </span>
    </label>

    <div v-if="hint || errorMessage" :id="`${inputId}-desc`" class="vx-checkbox-field__desc">
      <span v-if="error && errorMessage" class="vx-checkbox-field__error">{{ errorMessage }}</span>
      <span v-else-if="hint" class="vx-checkbox-field__hint">{{ hint }}</span>
    </div>
  </div>
</template>

<script setup>
/**
 * VxCheckbox
 * ----------
 * Uso singolo (boolean):
 *   <VxCheckbox v-model="accepted" label="Accetto i termini" />
 *
 * Uso in gruppo (array): tutti i checkbox condividono lo stesso v-model
 * array e ognuno dichiara il proprio `value`, esattamente come i checkbox
 * nativi con lo stesso `name`.
 *   <VxCheckbox v-model="selected" value="a" label="A" />
 *   <VxCheckbox v-model="selected" value="b" label="B" />
 */
import { computed, onMounted, ref, watch } from 'vue'
import { Check, Loader2, Minus } from 'lucide-vue-next'

let vxCheckboxIdCounter = 0
function useVxCheckboxId() {
  vxCheckboxIdCounter += 1
  return `vx-checkbox-${vxCheckboxIdCounter}`
}

const props = defineProps({
  // boolean in modalità singola, array in modalità gruppo
  modelValue: {
    type: [Boolean, Array],
    default: false,
  },
  // usato solo in modalità gruppo (modelValue è un array)
  value: {
    type: [String, Number, Object],
    default: null,
  },
  trueValue: {
    type: [Boolean, String, Number],
    default: true,
  },
  falseValue: {
    type: [Boolean, String, Number],
    default: false,
  },
  indeterminate: {
    type: Boolean,
    default: false,
  },
  name: {
    type: String,
    default: undefined,
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
  color: {
    type: String,
    default: '#7c3aed',
  },
  colors: {
    type: Object,
    default: null,
  },
  size: {
    type: [String, Object],
    default: 'md',
  },
  radius: {
    type: [Number, String],
    default: null,
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
  focusEffect: {
    type: String,
    default: 'ring',
  },
})

const emit = defineEmits(['update:modelValue', 'change', 'focus', 'blur'])

const inputRef = ref(null)
const inputId = useVxCheckboxId()

const isGroup = computed(() => Array.isArray(props.modelValue))

const isChecked = computed(() => {
  if (isGroup.value) return props.modelValue.some((v) => v === props.value)
  return props.modelValue === props.trueValue
})

const resolvedSize = computed(() => (typeof props.size === 'string' ? props.size : props.size?.name || 'md'))

const iconPixelSize = computed(() => {
  const map = { sm: 10, md: 12, lg: 14 }
  return map[resolvedSize.value] ?? 12
})

const checkboxStyle = computed(() => ({
  '--vx-checkbox-accent': props.color,
  ...(props.radius !== null ? { '--vx-checkbox-radius': `${props.radius}px` } : {}),
}))

watch(
  () => props.indeterminate,
  (val) => {
    if (inputRef.value) inputRef.value.indeterminate = val
  }
)

onMounted(() => {
  if (inputRef.value) inputRef.value.indeterminate = props.indeterminate
})

function onChange(event) {
  const checked = event.target.checked

  if (isGroup.value) {
    const next = checked
      ? [...props.modelValue, props.value]
      : props.modelValue.filter((v) => v !== props.value)
    emit('update:modelValue', next)
    emit('change', next)
    return
  }

  const next = checked ? props.trueValue : props.falseValue
  emit('update:modelValue', next)
  emit('change', next)
}

function onFocus(event) {
  emit('focus', event)
}

function onBlur(event) {
  emit('blur', event)
}
</script>

<style lang="scss" scoped>
.vx-checkbox-field {
  display: inline-flex;
  flex-direction: column;
  gap: 4px;

  &--block {
    display: flex;
    width: 100%;
  }
}

.vx-checkbox {
  display: inline-flex;
  align-items: flex-start;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  color: inherit;

  &--disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
}

.vx-checkbox__input {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.vx-checkbox__box {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  margin-top: 1px;
  border-radius: var(--vx-checkbox-radius, 5px);
  border: 1.5px solid rgba(0, 0, 0, 0.28);
  background: #fff;
  color: #fff;
  transition: background 0.15s ease, border-color 0.15s ease, transform 0.1s ease;

  svg {
    opacity: 0;
    transform: scale(0.6);
    transition: opacity 0.12s ease, transform 0.12s ease;
  }
}

.vx-checkbox--sm .vx-checkbox__box {
  width: 15px;
  height: 15px;
}

.vx-checkbox--lg .vx-checkbox__box {
  width: 21px;
  height: 21px;
}

.vx-checkbox:not(.vx-checkbox--disabled):hover .vx-checkbox__box {
  border-color: var(--vx-checkbox-accent, #7c3aed);
}

.vx-checkbox--checked .vx-checkbox__box,
.vx-checkbox--indeterminate .vx-checkbox__box {
  background: var(--vx-checkbox-accent, #7c3aed);
  border-color: var(--vx-checkbox-accent, #7c3aed);

  svg {
    opacity: 1;
    transform: scale(1);
  }
}

.vx-checkbox__spinner {
  opacity: 1 !important;
  animation: vx-checkbox-spin 0.7s linear infinite;
}

.vx-checkbox__input:focus-visible + .vx-checkbox__box {
  outline: none;
}

.vx-checkbox--focus-ring:has(.vx-checkbox__input:focus-visible) .vx-checkbox__box {
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--vx-checkbox-accent, #7c3aed) 30%, transparent);
}

.vx-checkbox__label {
  font-size: 13.5px;
  line-height: 1.4;
  padding-top: 1px;
}

.vx-checkbox--sm .vx-checkbox__label {
  font-size: 12.5px;
}

.vx-checkbox--lg .vx-checkbox__label {
  font-size: 14.5px;
}

.vx-checkbox-field__desc {
  padding-left: 26px;
  font-size: 11.5px;
}

.vx-checkbox-field__hint {
  opacity: 0.6;
}

.vx-checkbox-field__error {
  color: #dc2626;
}

@keyframes vx-checkbox-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .vx-checkbox__box,
  .vx-checkbox__box svg {
    transition-duration: 0.01ms !important;
  }

  .vx-checkbox__spinner {
    animation: none;
  }
}
</style>