<template>
  <div
    ref="rootRef"
    class="vx-datepicker"
    :class="{ 'vx-datepicker--block': block }"
    :style="{ '--vx-datepicker-accent': color }"
  >
    <VxFieldWrapper v-bind="wrapperProps">
      <template #[iconSlotName]>
        <button
          type="button"
          class="vx-datepicker__icon-btn"
          :disabled="disabled || loading"
          tabindex="-1"
          aria-haspopup="dialog"
          :aria-expanded="isOpen"
          aria-label="Open date picker"
          @mousedown.prevent
          @click="toggleOpen"
        >
          <slot name="icon">
            <CalendarDays :size="16" />
          </slot>
        </button>
      </template>

      <template
        #default="{ fieldId, disabled: fieldDisabled, onFocus: chromeFocus, onBlur: chromeBlur }"
      >
        <input
          :id="fieldId"
          type="text"
          class="vx-datepicker__input"
          :value="inputValue"
          :disabled="fieldDisabled || loading"
          :placeholder="placeholder"
          :maxlength="dateFormat.inputMaxLength.value"
          inputmode="numeric"
          autocomplete="off"
          @input="onInput"
          @keydown.enter="onEnter"
          @focus="onFieldFocus($event, chromeFocus)"
          @blur="onInputBlur($event, chromeBlur)"
        />
      </template>

      <template v-if="clearable && modelValue && !disabled" #trailing="{ resolvedIconSize }">
        <button
          type="button"
          class="vx-datepicker__clear"
          tabindex="-1"
          aria-label="Clear date"
          @mousedown.prevent
          @click="onClear"
        >
          <X :size="resolvedIconSize" />
        </button>
      </template>
    </VxFieldWrapper>

    <!--
      Stessa logica del DateTimePicker: apertura/anchoring/positioning/
      responsive sono delegati ad AnchoredOverlay, qui resta solo il markup
      e lo stato di dominio del calendario.
    -->
    <AnchoredOverlay
      v-model="isOpen"
      :reference="rootRef"
      aria-label="Date picker"
      :gap="6"
      :viewport-padding="8"
      modal-on-mobile
      lock-scroll-on-mobile
    >
      <template #default="{ isMobile }">
        <div
          class="vx-datepicker__panel"
          :class="{ 'vx-datepicker__panel--mobile-modal': isMobile }"
        >
          <div class="vx-datepicker__nav">
            <button
              type="button"
              class="vx-datepicker__nav-btn"
              aria-label="Previous month"
              @click="calendar.navPrev"
            >
              <ChevronLeft :size="16" />
            </button>

            <button type="button" class="vx-datepicker__month" @click="calendar.onHeaderClick">
              {{ calendar.headerLabel.value }}
            </button>

            <button
              type="button"
              class="vx-datepicker__nav-btn"
              aria-label="Next month"
              @click="calendar.navNext"
            >
              <ChevronRight :size="16" />
            </button>
          </div>

          <template v-if="calendar.viewMode.value === 'days'">
            <div class="vx-datepicker__weekdays">
              <span v-for="(day, index) in calendar.weekDays.value" :key="`${day}-${index}`">
                {{ day }}
              </span>
            </div>

            <div class="vx-datepicker__grid">
              <button
                v-for="(date, index) in calendar.calendarDays.value"
                :key="index"
                type="button"
                class="vx-datepicker__day"
                :class="{
                  'vx-datepicker__day--empty': !date,
                  'vx-datepicker__day--today': date && calendar.isToday(date),
                  'vx-datepicker__day--selected': date && isSelected(date),
                }"
                :disabled="!date || isDayDisabled(date)"
                @click="selectDay(date)"
              >
                {{ date ? date.getDate() : '' }}
              </button>
            </div>
          </template>

          <div
            v-else-if="calendar.viewMode.value === 'months'"
            class="vx-datepicker__grid vx-datepicker__grid--months"
          >
            <button
              v-for="(m, index) in calendar.monthsShort.value"
              :key="m"
              type="button"
              class="vx-datepicker__cell"
              :class="{
                'vx-datepicker__cell--today': calendar.isCurrentMonth(index),
                'vx-datepicker__cell--selected': isMonthSelected(index),
              }"
              @click="calendar.pickMonth(index)"
            >
              {{ m }}
            </button>
          </div>

          <div v-else class="vx-datepicker__grid vx-datepicker__grid--years">
            <button
              v-for="y in calendar.yearsList.value"
              :key="y"
              type="button"
              class="vx-datepicker__cell"
              :class="{
                'vx-datepicker__cell--today': calendar.isCurrentYear(y),
                'vx-datepicker__cell--selected': isYearSelected(y),
              }"
              @click="calendar.pickYear(y)"
            >
              {{ y }}
            </button>
          </div>

          <div class="vx-datepicker__footer">
            <button type="button" class="vx-datepicker__footer-btn" @click="selectToday">
              {{ todayLabel }}
            </button>

            <button
              v-if="clearable && modelValue"
              type="button"
              class="vx-datepicker__footer-btn vx-datepicker__footer-btn--ghost"
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
import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-vue-next'
import VxFieldWrapper from '@/Library/core/components/Input/FieldWrapper.vue'
import { useDateFormat } from '@/Library/core/composables/Date/useDateFormat'
import { useCalendarGrid } from '@/Library/core/composables/Date/useCalendarGrid'
import AnchoredOverlay from '@/Library/core/components/Picker/AnchoredOverlay.vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  min: {
    type: String,
    default: '',
  },
  max: {
    type: String,
    default: '',
  },
  locale: {
    type: String,
    default: 'en-US',
  },
  format: {
    type: String,
    default: '',
  },
  firstDayOfWeek: {
    type: Number,
    default: null,
  },
  variant: {
    type: String,
    default: 'outline',
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
    default: 'Select a date',
  },
  clearFooterLabel: {
    type: String,
    default: 'Clear',
  },
  todayLabel: {
    type: String,
    default: 'Today',
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

const resolvedFirstDayOfWeek = computed(() => {
  if (props.firstDayOfWeek !== null && props.firstDayOfWeek !== undefined) {
    return props.firstDayOfWeek
  }
  return props.locale.toLowerCase() === 'en-us' ? 0 : 1
})

const dateFormat = useDateFormat(
  computed(() => props.format),
  computed(() => props.locale)
)

function parseISO(value) {
  return dateFormat.parseISO(value)
}

const selectedDate = computed(() => parseISO(props.modelValue))

const calendar = useCalendarGrid({
  locale: computed(() => props.locale),
  firstDayOfWeek: resolvedFirstDayOfWeek,
  initialDate: selectedDate.value,
})

const displayValue = computed(() => dateFormat.formatDateWithTemplate(selectedDate.value))

function isSameDay(a, b) {
  return calendar.isSameDay(a, b)
}

function isSelected(date) {
  return isSameDay(date, selectedDate.value)
}

function isDayDisabled(date) {
  if (!date) return true
  const iso = dateFormat.toISO(date)
  if (props.min && iso < props.min) return true
  if (props.max && iso > props.max) return true
  return false
}

function isMonthSelected(m) {
  return !!(
    selectedDate.value &&
    selectedDate.value.getFullYear() === calendar.viewDate.value.getFullYear() &&
    selectedDate.value.getMonth() === m
  )
}

function isYearSelected(y) {
  return !!(selectedDate.value && selectedDate.value.getFullYear() === y)
}

function selectDay(date) {
  if (!date || isDayDisabled(date)) return
  const iso = dateFormat.toISO(date)
  emit('update:modelValue', iso)
  emit('change', iso)
  isOpen.value = false
}

function selectToday() {
  const today = new Date()
  if (isDayDisabled(today)) return
  const iso = dateFormat.toISO(today)
  emit('update:modelValue', iso)
  emit('change', iso)
  isOpen.value = false
}

function onClear(event) {
  event?.stopPropagation?.()
  emit('update:modelValue', '')
  emit('clear')
}

function openPicker() {
  if (props.disabled || props.loading) return
  isOpen.value = true
  calendar.resetToDate(selectedDate.value)
}

function toggleOpen() {
  if (props.disabled || props.loading) return
  if (isOpen.value) {
    isOpen.value = false
    return
  }
  openPicker()
}

function onFieldFocus(event, chromeFocus) {
  openPicker()
  chromeFocus?.(event)
  emit('focus', event)
}

// Click outside, ESC e chiusura da backdrop mobile sono ora gestiti
// centralmente da AnchoredOverlay: non serve più useClickOutside qui.
// Lo stesso vale per lo scroll: AnchoredOverlay non chiude mai il pannello
// quando l'input esce temporaneamente dalla viewport, si limita a
// ricalcolare la posizione (vedi useFloatingPanel + useCloseWhenReferenceHidden
// non è più necessario ed è stato rimosso).

const inputValue = ref(displayValue.value)

watch(
  () => props.modelValue,
  () => {
    inputValue.value = displayValue.value
  }
)

function onInput(event) {
  const digits = event.target.value.replace(/\D/g, '')
  inputValue.value = dateFormat.maskDigitsForInput(digits)
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
  const { day, month, year } = dateFormat.parseTemplateDigits(digits)

  if (!day?.complete || !month?.complete || !year?.complete || String(year.value).length < 4) {
    inputValue.value = displayValue.value
    return
  }

  const date = new Date(year.value, month.value - 1, day.value)

  if (
    date.getFullYear() !== year.value ||
    date.getMonth() !== month.value - 1 ||
    date.getDate() !== day.value
  ) {
    inputValue.value = displayValue.value
    return
  }

  if (isDayDisabled(date)) {
    inputValue.value = displayValue.value
    return
  }

  const iso = dateFormat.toISO(date)
  if (iso !== props.modelValue) {
    emit('update:modelValue', iso)
    emit('change', iso)
  } else {
    inputValue.value = displayValue.value
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
.vx-datepicker {
  position: relative;
  display: inline-flex;
  flex-direction: column;

  &--block {
    display: flex;
    width: 100%;
  }
}

.vx-datepicker__input {
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

.vx-datepicker__icon-btn {
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

.vx-datepicker__clear {
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
 * Positioning (position/top/left/transform/z-index/transition) è gestito
 * da <AnchoredOverlay>: qui restano solo le proprietà visive del pannello.
 * Nessun overflow/max-height: il pannello si dimensiona sul contenuto,
 * niente scroll interno (coerente con VxDateTime).
 */
.vx-datepicker__panel {
  width: 260px;
  max-width: calc(100vw - 16px);
  padding: 10px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: var(--vx-datepicker-panel-bg, #fff);
  color: var(--vx-datepicker-panel-text, #000);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.14);
  box-sizing: border-box;
}

.vx-datepicker__nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.vx-datepicker__nav-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  flex-shrink: 0;
  border: none;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  color: inherit;
  opacity: 0.7;

  &:hover {
    opacity: 1;
    background: color-mix(in srgb, currentColor 8%, transparent);
  }
}

.vx-datepicker__month {
  border: none;
  background: transparent;
  color: inherit;
  font: inherit;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  text-transform: capitalize;
  cursor: pointer;
  border-radius: 6px;
  padding: 2px 8px;

  &:hover {
    background: color-mix(in srgb, currentColor 8%, transparent);
  }
}

.vx-datepicker__weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 4px;

  span {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    opacity: 0.5;
    height: 26px;
  }
}

.vx-datepicker__grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;

  &--months,
  &--years {
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
  }
}

.vx-datepicker__day {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 30px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: inherit;
  font-size: 12.5px;
  cursor: pointer;
  transition: background 0.12s ease, color 0.12s ease;

  &:not(&--selected):not(:disabled):hover {
    background: color-mix(in srgb, currentColor 8%, transparent);
  }

  &:disabled {
    cursor: default;
    opacity: 0.3;
  }

  &--empty {
    visibility: hidden;
  }

  &--today:not(&--selected) {
    box-shadow: inset 0 0 0 1px var(--vx-datepicker-accent, $primary);
  }

  &--selected {
    background: var(--vx-datepicker-accent, $primary);
    color: #fff;

    &:hover {
      background: color-mix(in srgb, var(--vx-datepicker-accent, $primary) 85%, black);
    }
  }
}

.vx-datepicker__cell {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: inherit;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.12s ease, color 0.12s ease;

  &:not(&--selected):hover {
    background: color-mix(in srgb, currentColor 8%, transparent);
  }

  &--today:not(&--selected) {
    box-shadow: inset 0 0 0 1px var(--vx-datepicker-accent, $primary);
  }

  &--selected {
    background: var(--vx-datepicker-accent, $primary);
    color: #fff;

    &:hover {
      background: color-mix(in srgb, var(--vx-datepicker-accent, $primary) 85%, black);
    }
  }
}

.vx-datepicker__footer {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.vx-datepicker__footer-btn {
  flex: 1 1 auto;
  border: none;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  background: color-mix(in srgb, var(--vx-datepicker-accent, $primary) 12%, transparent);
  color: var(--vx-datepicker-accent, $primary);

  &:hover {
    background: color-mix(in srgb, var(--vx-datepicker-accent, $primary) 20%, transparent);
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

@media (max-width: 640px) {
  .vx-datepicker__panel {
    width: calc(100vw - 16px);
    max-width: calc(100vw - 16px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .vx-datepicker__icon-btn,
  .vx-datepicker__clear,
  .vx-datepicker__nav-btn,
  .vx-datepicker__month,
  .vx-datepicker__day,
  .vx-datepicker__cell,
  .vx-datepicker__footer-btn {
    transition-duration: 0.01ms !important;
  }
}
</style>