<template>
  <div
    class="vx-radio-field"
    :class="{ 'vx-radio-field--block': block, 'vx-radio-field--error': error }"
  >
    <label
      class="vx-radio"
      :class="[
        `vx-radio--${resolvedSize}`,
        {
          'vx-radio--disabled': disabled || loading,
          'vx-radio--checked': isChecked,
          [`vx-radio--focus-${focusEffect}`]: focusEffect,
        },
      ]"
      :style="radioStyle"
    >
      <input
        :id="inputId"
        type="radio"
        class="vx-radio__input"
        :name="name"
        :value="value"
        :checked="isChecked"
        :disabled="disabled || loading"
        :aria-describedby="hint || errorMessage ? `${inputId}-desc` : undefined"
        @change="onChange"
        @focus="onFocus"
        @blur="onBlur"
      />

      <span class="vx-radio__dot" aria-hidden="true">
        <Loader2 v-if="loading" class="vx-radio__spinner" :size="iconPixelSize" />
      </span>

      <span v-if="label || $slots.default" class="vx-radio__label">
        <slot>{{ label }}</slot>
      </span>
    </label>

    <div v-if="hint || errorMessage" :id="`${inputId}-desc`" class="vx-radio-field__desc">
      <span v-if="error && errorMessage" class="vx-radio-field__error">{{ errorMessage }}</span>
      <span v-else-if="hint" class="vx-radio-field__hint">{{ hint }}</span>
    </div>
  </div>
</template>

<script setup>
/**
 * VxRadio
 * -------
 * Come un radio nativo: più VxRadio con lo stesso `name` (e idealmente lo
 * stesso v-model) formano un gruppo, dove solo uno può essere selezionato.
 *
 *   <VxRadio v-model="plan" name="plan" value="monthly" label="Mensile" />
 *   <VxRadio v-model="plan" name="plan" value="yearly" label="Annuale" />
 */
import { computed } from 'vue'
import { Loader2 } from 'lucide-vue-next'

let vxRadioIdCounter = 0
function useVxRadioId() {
  vxRadioIdCounter += 1
  return `vx-radio-${vxRadioIdCounter}`
}

const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean, Object],
    default: null,
  },
  value: {
    type: [String, Number, Boolean, Object],
    required: true,
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
  focusEffect: {
    type: String,
    default: 'ring',
  },
})

const emit = defineEmits(['update:modelValue', 'change', 'focus', 'blur'])

const inputId = useVxRadioId()

const isChecked = computed(() => props.modelValue === props.value)

const resolvedSize = computed(() => (typeof props.size === 'string' ? props.size : props.size?.name || 'md'))

const iconPixelSize = computed(() => {
  const map = { sm: 8, md: 9, lg: 10 }
  return map[resolvedSize.value] ?? 9
})

const radioStyle = computed(() => ({
  '--vx-radio-accent': props.color,
}))

function onChange(event) {
  if (!event.target.checked) return
  emit('update:modelValue', props.value)
  emit('change', props.value)
}

function onFocus(event) {
  emit('focus', event)
}

function onBlur(event) {
  emit('blur', event)
}
</script>

<style lang="scss" scoped>
.vx-radio-field {
  display: inline-flex;
  flex-direction: column;
  gap: 4px;

  &--block {
    display: flex;
    width: 100%;
  }
}

.vx-radio {
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

.vx-radio__input {
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

.vx-radio__dot {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  margin-top: 1px;
  border-radius: 50%;
  border: 1.5px solid rgba(0, 0, 0, 0.28);
  background: #fff;
  color: #fff;
  transition: background 0.15s ease, border-color 0.15s ease;

  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #fff;
    transform: scale(0);
    transition: transform 0.12s ease;
  }
}

.vx-radio--sm .vx-radio__dot {
  width: 15px;
  height: 15px;

  &::before {
    width: 6px;
    height: 6px;
  }
}

.vx-radio--lg .vx-radio__dot {
  width: 21px;
  height: 21px;

  &::before {
    width: 10px;
    height: 10px;
  }
}

.vx-radio:not(.vx-radio--disabled):hover .vx-radio__dot {
  border-color: var(--vx-radio-accent, $primary);
}

.vx-radio--checked .vx-radio__dot {
  background: var(--vx-radio-accent, $primary);
  border-color: var(--vx-radio-accent, $primary);

  &::before {
    transform: scale(1);
  }
}

.vx-radio__spinner {
  position: absolute;
  opacity: 1;
  animation: vx-radio-spin 0.7s linear infinite;
}

.vx-radio--focus-ring:has(.vx-radio__input:focus-visible) .vx-radio__dot {
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--vx-radio-accent, $primary) 30%, transparent);
}

.vx-radio__label {
  font-size: 13.5px;
  line-height: 1.4;
  padding-top: 1px;
}

.vx-radio--sm .vx-radio__label {
  font-size: 12.5px;
}

.vx-radio--lg .vx-radio__label {
  font-size: 14.5px;
}

.vx-radio-field__desc {
  padding-left: 26px;
  font-size: 11.5px;
}

.vx-radio-field__hint {
  opacity: 0.6;
}

.vx-radio-field__error {
  color: $negative;
}

@keyframes vx-radio-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .vx-radio__dot,
  .vx-radio__dot::before {
    transition-duration: 0.01ms !important;
  }

  .vx-radio__spinner {
    animation: none;
  }
}
</style>