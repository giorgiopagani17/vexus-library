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
          :aria-label="openLabel"
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
          @focus="onInputFocus($event, chromeFocus)"
          @blur="onInputBlur($event, chromeBlur)"
        />
      </template>

      <template v-if="clearable && modelValue && !disabled" #trailing="{ resolvedIconSize }">
        <button
          type="button"
          class="vx-timepicker__clear"
          tabindex="-1"
          :aria-label="clearLabel"
          @mousedown.prevent
          @click="onClear"
        >
          <X :size="resolvedIconSize" />
        </button>
      </template>
    </VxFieldWrapper>

    <!--
      Stesso schema degli altri picker: apertura, anchoring, positioning e
      responsive sono delegati ad AnchoredOverlay.
    -->
    <AnchoredOverlay
      v-model="isOpen"
      :reference="rootRef"
      :aria-label="dialogLabel"
      :gap="6"
      :viewport-padding="8"
      modal-on-mobile
      lock-scroll-on-mobile
    >
      <template #default="{ isMobile }">
        <div
          class="vx-timepicker__panel"
          :class="{ 'vx-timepicker__panel--mobile-modal': isMobile }"
        >
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
              {{ clearFooterLabel }}
            </button>
          </div>
        </div>
      </template>
    </AnchoredOverlay>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { Clock, X } from 'lucide-vue-next'
import VxFieldWrapper from '@/Library/core/components/Input/FieldWrapper.vue'
import { useTimeFormat } from '@/Library/core/composables/Date/useTimeFormat'
import AnchoredOverlay from '@/Library/core/components/Picker/AnchoredOverlay.vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  minuteStep: {
    type: Number,
    default: 5,
  },
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
    default: 'Select a time',
  },
  openLabel: {
    type: String,
    default: 'Open time picker',
  },
  clearLabel: {
    type: String,
    default: 'Clear',
  },
  dialogLabel: {
    type: String,
    default: 'Select a time',
  },
  clearFooterLabel: {
    type: String,
    default: 'Clear',
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

const iconSlotName = computed(() => `icon-${props.iconPosition === 'left' ? 'left' : 'right'}`)

const timeFormat = useTimeFormat(computed(() => props.format))

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

function openPicker() {
  if (props.disabled || props.loading) return
  isOpen.value = true
}

function toggleOpen() {
  if (props.disabled || props.loading) return
  if (isOpen.value) {
    isOpen.value = false
    return
  }
  openPicker()
}

function onInputFocus(event, chromeFocus) {
  openPicker()
  chromeFocus?.(event)
  emit('focus', event)
}

function onClear(event) {
  event?.stopPropagation?.()
  emit('update:modelValue', '')
  emit('clear')
}

// Click outside, ESC, backdrop mobile e anchoring persistente sono ora
// gestiti centralmente da AnchoredOverlay: non serve più useClickOutside
// né useCloseWhenReferenceHidden qui.

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
  emit('blur', event)
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

/*
 * Positioning demandato ad <AnchoredOverlay>. Il pannello in sé non ha
 * overflow/max-height (si dimensiona sul contenuto), ma le colonne
 * ore/minuti (.vx-timepicker__col qui sotto) hanno di nuovo uno scroll
 * interno per restare compatte anche con 24 ore visibili.
 */
.vx-timepicker__panel {
  display: flex;
  flex-direction: column;
  width: 160px;
  padding: 8px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: var(--vx-timepicker-panel-bg, #fff);
  color: var(--vx-timepicker-panel-text, #1e1e1e);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.14);
  box-sizing: border-box;
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
  scrollbar-width: thin;

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

@media (prefers-reduced-motion: reduce) {
  .vx-timepicker__icon-btn,
  .vx-timepicker__clear,
  .vx-timepicker__cell,
  .vx-timepicker__footer-btn {
    transition-duration: 0.01ms !important;
  }
}
</style>