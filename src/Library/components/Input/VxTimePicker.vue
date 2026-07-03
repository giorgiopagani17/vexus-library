<template>
  <div
    ref="rootRef"
    class="vx-timepicker"
    :class="{ 'vx-timepicker--block': block }"
    :style="{ '--vx-timepicker-accent': color }"
  >
    <VxFieldWrapper v-bind="wrapperProps">
      <template #[iconSlotName]>
        <button
          type="button"
          class="vx-timepicker__icon-btn"
          :disabled="disabled || loading"
          tabindex="-1"
          aria-haspopup="dialog"
          :aria-expanded="isOpen"
          aria-label="Apri selezione orario"
          @mousedown.prevent
          @click="toggleOpen"
        >
          <slot name="icon">
            <Clock :size="16" />
          </slot>
        </button>
      </template>

      <template
        #default="{ fieldId, disabled: fieldDisabled, onFocus: chromeFocus, onBlur: chromeBlur }"
      >
        <input
          :id="fieldId"
          type="text"
          class="vx-timepicker__input"
          :value="inputValue"
          :disabled="fieldDisabled || loading"
          :placeholder="placeholder"
          inputmode="numeric"
          autocomplete="off"
          :maxlength="timeFormat.inputMaxLength.value"
          @input="onInput"
          @keydown.enter="onEnter"
          @focus="chromeFocus"
          @blur="onInputBlur($event, chromeBlur)"
        />
      </template>

      <template v-if="clearable && modelValue && !disabled" #trailing="{ resolvedIconSize }">
        <button
          type="button"
          class="vx-timepicker__clear"
          tabindex="-1"
          aria-label="Cancella"
          @mousedown.prevent
          @click="onClear"
        >
          <X :size="resolvedIconSize" />
        </button>
      </template>
    </VxFieldWrapper>

    <Transition name="vx-timepicker-fade">
      <div v-if="isOpen" class="vx-timepicker__panel" role="dialog" aria-label="Seleziona un orario">
        <div class="vx-timepicker__cols">
          <div class="vx-timepicker__col">
            <button
              v-for="h in hours"
              :key="`h-${h}`"
              type="button"
              class="vx-timepicker__cell"
              :class="{ 'vx-timepicker__cell--selected': h === selectedHour }"
              @click="pickHour(h)"
            >
              {{ pad(h) }}
            </button>
          </div>
          <div class="vx-timepicker__col">
            <button
              v-for="m in minutes"
              :key="`m-${m}`"
              type="button"
              class="vx-timepicker__cell"
              :class="{ 'vx-timepicker__cell--selected': m === selectedMinute }"
              @click="pickMinute(m)"
            >
              {{ pad(m) }}
            </button>
          </div>
        </div>

        <div v-if="clearable && modelValue" class="vx-timepicker__footer">
          <button
            type="button"
            class="vx-timepicker__footer-btn vx-timepicker__footer-btn--ghost"
            @click="onClear"
          >
            Pulisci
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { Clock, X } from 'lucide-vue-next'
import VxFieldWrapper from '@/Library/core/utils/Input/fieldWrapper.vue'
import { useTimeFormat } from '@/Library/core/composables/Date/useTimeFormat'
import { useClickOutside } from '@/Library/core/composables/useClickOutside'

const props = defineProps({
  /** Orario selezionato, sempre in formato canonico 'HH:MM' 24h (v-model) */
  modelValue: {
    type: String,
    default: '',
  },
  /** Intervallo tra un'opzione e l'altra nella colonna minuti */
  minuteStep: {
    type: Number,
    default: 5,
  },
  /**
   * Maschera di visualizzazione/digitazione, con token 'HH' e 'mm' e
   * separatore a piacere (es. 'HH:mm', 'HH.mm', 'HHmm'). Default 'HH:mm'.
   * Nota: il v-model resta sempre 'HH:MM' indipendentemente dal separatore
   * scelto qui, che riguarda solo la resa nel campo di testo.
   */
  format: {
    type: String,
    default: 'HH:mm',
  },
  variant: {
    type: String,
    default: 'outline',
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
  /** Posizione dell'icona del picker nel campo: 'left' | 'right' */
  iconPosition: {
    type: String,
    default: 'right',
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
    default: 'Seleziona un orario',
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

const emit = defineEmits(['update:modelValue', 'change', 'focus', 'blur', 'clear'])

const rootRef = ref(null)
const isOpen = ref(false)

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

// Nome dello slot dell'icona da valorizzare nel VxFieldWrapper,
// in base a `iconPosition` ('left' | 'right').
const iconSlotName = computed(() => `icon-${props.iconPosition === 'left' ? 'left' : 'right'}`)

const pad = (n) => String(n).padStart(2, '0')

const hours = Array.from({ length: 24 }, (_, i) => i)
const minutes = computed(() => {
  const step = props.minuteStep > 0 ? props.minuteStep : 5
  const list = []
  for (let m = 0; m < 60; m += step) list.push(m)
  return list
})

const selectedHour = computed(() => {
  if (!props.modelValue) return null
  return Number(props.modelValue.split(':')[0])
})

const selectedMinute = computed(() => {
  if (!props.modelValue) return null
  return Number(props.modelValue.split(':')[1])
})

function commit(hour, minute) {
  const h = hour ?? selectedHour.value ?? 0
  const m = minute ?? selectedMinute.value ?? 0
  const value = `${pad(h)}:${pad(m)}`
  emit('update:modelValue', value)
  emit('change', value)
}

function pickHour(h) {
  commit(h, selectedMinute.value)
}

function pickMinute(m) {
  commit(selectedHour.value, m)
  isOpen.value = false
}

function toggleOpen() {
  if (props.disabled || props.loading) return
  isOpen.value = !isOpen.value
}

function onClear(event) {
  event?.stopPropagation?.()
  emit('update:modelValue', '')
  emit('clear')
}

useClickOutside(rootRef, () => {
  isOpen.value = false
})

// ===== Maschera / digitazione manuale dell'orario, via composable =====

const timeFormat = useTimeFormat(computed(() => props.format))

const displayValue = computed(() => {
  if (selectedHour.value === null || selectedMinute.value === null) return ''
  return timeFormat.formatTimeWithTemplate(selectedHour.value, selectedMinute.value)
})

const inputValue = ref(displayValue.value)

watch(
  () => props.modelValue,
  () => {
    inputValue.value = displayValue.value
  }
)

function onInput(event) {
  const digits = event.target.value.replace(/\D/g, '')
  inputValue.value = timeFormat.maskDigitsForInput(digits)
}

function commitInput() {
  const raw = inputValue.value.trim()

  if (!raw) {
    inputValue.value = ''
    if (props.modelValue !== '') {
      emit('update:modelValue', '')
      emit('change', '')
    }
    return
  }

  const digits = raw.replace(/\D/g, '')
  const { hour, minute } = timeFormat.parseTemplateDigits(digits)

  // Digitazione parziale: se manca l'ora o i minuti, completa con "00"
  // invece di scartare quanto scritto (comportamento storico del componente).
  const h = Math.min(hour?.complete ? hour.value : hour?.value ?? 0, 23)
  const m = Math.min(minute?.complete ? minute.value : 0, 59)

  const value = timeFormat.toHM(h, m)
  inputValue.value = timeFormat.formatTimeWithTemplate(h, m)

  if (value !== props.modelValue) {
    emit('update:modelValue', value)
    emit('change', value)
  }
}

function onEnter(event) {
  commitInput()
  event.target.blur()
}

function onInputBlur(event, chromeBlur) {
  commitInput()
  chromeBlur?.(event)
}
</script>

<style lang="scss" scoped>
.vx-timepicker {
  position: relative;
  display: inline-flex;
  flex-direction: column;

  &--block {
    display: flex;
    width: 100%;
  }
}

.vx-timepicker__input {
  flex: 1 1 auto;
  min-width: 0;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: inherit;
  font: inherit;
  font-family: inherit;
  text-align: left;
  cursor: text;

  &::placeholder {
    color: inherit;
    opacity: 0.5;
  }

  &:disabled {
    cursor: not-allowed;
  }
}

.vx-timepicker__icon-btn {
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
  opacity: 0.7;
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 1;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }
}

.vx-timepicker__clear {
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

.vx-timepicker__panel {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 50;
  display: flex;
  flex-direction: column;
  width: 160px;
  padding: 8px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: var(--vx-timepicker-panel-bg, #fff);
  color: var(--vx-timepicker-panel-text, #1e1e1e);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.14);
}

.vx-timepicker__cols {
  display: flex;
  gap: 4px;
  max-height: 220px;
}

.vx-timepicker__col {
  flex: 1 1 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 200px;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.15);
    border-radius: 4px;
  }
}

.vx-timepicker__cell {
  flex-shrink: 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: inherit;
  font-size: 12.5px;
  padding: 6px 0;
  cursor: pointer;
  transition: background 0.12s ease, color 0.12s ease;

  &:not(&--selected):hover {
    background: color-mix(in srgb, currentColor 8%, transparent);
  }

  &--selected {
    background: var(--vx-timepicker-accent, #7c3aed);
    color: #fff;

    &:hover {
      background: color-mix(in srgb, var(--vx-timepicker-accent, #7c3aed) 85%, black);
    }
  }
}

.vx-timepicker__footer {
  display: flex;
  padding-top: 8px;
  margin-top: 8px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.vx-timepicker__footer-btn {
  flex: 1 1 auto;
  border: none;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  background: color-mix(in srgb, var(--vx-timepicker-accent, #7c3aed) 12%, transparent);
  color: var(--vx-timepicker-accent, #7c3aed);

  &:hover {
    background: color-mix(in srgb, var(--vx-timepicker-accent, #7c3aed) 20%, transparent);
  }

  &--ghost {
    background: transparent;
    color: inherit;
    opacity: 0.6;

    &:hover {
      opacity: 1;
      background: color-mix(in srgb, currentColor 8%, transparent);
    }
  }
}

.vx-timepicker-fade-enter-active,
.vx-timepicker-fade-leave-active {
  transition: opacity 0.12s ease, transform 0.12s ease;
}

.vx-timepicker-fade-enter-from,
.vx-timepicker-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>