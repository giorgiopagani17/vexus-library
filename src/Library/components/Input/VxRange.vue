<template>
  <VxFieldWrapper v-bind="wrapperProps">
    <template #default="{ fieldId, disabled: fieldDisabled, onFocus: chromeFocus, onBlur: chromeBlur }">
      <input
        :id="fieldId"
        ref="inputRef"
        type="range"
        class="vx-range__field"
        :min="min"
        :max="max"
        :step="step"
        :value="modelValue"
        :disabled="fieldDisabled || loading"
        :style="rangeStyle"
        @input="onInput"
        @change="onChange"
        @focus="chromeFocus"
        @blur="chromeBlur"
      />
    </template>

    <template v-if="showValue" #trailing>
      <span class="vx-range__value">{{ modelValue }}</span>
    </template>
  </VxFieldWrapper>
</template>

<script setup>
import { computed, ref } from 'vue'
import VxFieldWrapper from '@/Library/core/utils/Input/fieldWrapper.vue'

const props = defineProps({
  /** Valore corrente (v-model), number o string numerica */
  modelValue: {
    type: [Number, String],
    default: 50,
  },
  min: {
    type: [Number, String],
    default: 0,
  },
  max: {
    type: [Number, String],
    default: 100,
  },
  step: {
    type: [Number, String],
    default: 1,
  },
  /** Mostra il valore numerico corrente a destra del campo */
  showValue: {
    type: Boolean,
    default: true,
  },
  variant: {
    type: String,
    default: 'outline',
  },
  /** Colore della porzione riempita e del thumb */
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

const emit = defineEmits(['update:modelValue', 'input', 'change', 'focus', 'blur'])

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

const percent = computed(() => {
  const val = Number(props.modelValue) || 0
  const min = Number(props.min)
  const max = Number(props.max)
  if (max <= min) return 0
  return Math.min(100, Math.max(0, ((val - min) / (max - min)) * 100))
})

const rangeStyle = computed(() => ({
  '--vx-range-percent': `${percent.value}%`,
  '--vx-range-color': props.color,
}))

function onInput(event) {
  emit('update:modelValue', event.target.value)
  emit('input', event)
}

function onChange(event) {
  emit('change', event.target.value)
}
</script>

<style lang="scss" scoped>
.vx-range__field {
  flex: 1 1 auto;
  min-width: 0;
  appearance: none;
  -webkit-appearance: none;
  height: 4px;
  border-radius: 999px;
  background: linear-gradient(
    to right,
    var(--vx-range-color, #7c3aed) 0%,
    var(--vx-range-color, #7c3aed) var(--vx-range-percent, 50%),
    rgba(0, 0, 0, 0.12) var(--vx-range-percent, 50%),
    rgba(0, 0, 0, 0.12) 100%
  );
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--vx-range-color, #7c3aed);
    border: 2px solid #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--vx-range-color, #7c3aed);
    border: 2px solid #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    cursor: pointer;
  }

  &::-moz-range-track {
    height: 4px;
    border-radius: 999px;
    background: transparent;
  }
}

.vx-range__value {
  flex-shrink: 0;
  min-width: 2ch;
  text-align: right;
  font-size: 12.5px;
  font-variant-numeric: tabular-nums;
  opacity: 0.7;
}
</style>