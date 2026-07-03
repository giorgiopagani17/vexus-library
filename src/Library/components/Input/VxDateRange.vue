<template>
  <div
    ref="rootRef"
    class="vx-daterange"
    :class="{ 'vx-daterange--block': block }"
    :style="{ '--vx-daterange-accent': color }"
  >
    <VxFieldWrapper v-bind="wrapperProps" class="vx-daterange__field">
      <template #[iconSlotName]>
        <button
          type="button"
          class="vx-daterange__icon-btn"
          :disabled="disabled || loading"
          tabindex="-1"
          aria-haspopup="dialog"
          :aria-expanded="isOpen"
          :aria-label="resolvedLabels.openLabel"
          @mousedown.prevent
          @click="openPicker"
        >
          <slot name="icon">
            <CalendarRange :size="16" />
          </slot>
        </button>
      </template>
      <template #default="{ fieldId, disabled: fieldDisabled, onFocus: chromeFocus, onBlur: chromeBlur }">
        <input
          :id="fieldId"
          type="text"
          class="vx-daterange__input"
          :value="inputValue"
          :disabled="fieldDisabled || loading"
          :placeholder="resolvedLabels.placeholder"
          autocomplete="off"
          @focus="() => { openPicker(); chromeFocus?.() }"
          @input="onInput"
          @keydown.enter="onEnter"
          @blur="onFieldBlur($event, chromeBlur)"
        />
      </template>

      <template v-if="clearable && (modelValue?.start || modelValue?.end) && !disabled" #trailing>
        <button
          type="button"
          class="vx-daterange__clear"
          tabindex="-1"
          :aria-label="resolvedLabels.clear"
          @mousedown.prevent
          @click="onClear"
        >
          <X :size="14" />
        </button>
      </template>
    </VxFieldWrapper>

    <Transition name="vx-daterange-fade">
      <div v-if="isOpen" class="vx-daterange__panel" role="dialog" :aria-label="resolvedLabels.dialogLabel">
        <div class="vx-daterange__nav">
          <button type="button" class="vx-daterange__nav-btn" :aria-label="resolvedLabels.prev" @click="calendar.navPrev">
            <ChevronLeft :size="16" />
          </button>
          <button type="button" class="vx-daterange__month" @click="calendar.onHeaderClick">
            {{ calendar.headerLabel.value }}
          </button>
          <button type="button" class="vx-daterange__nav-btn" :aria-label="resolvedLabels.next" @click="calendar.navNext">
            <ChevronRight :size="16" />
          </button>
        </div>

        <template v-if="calendar.viewMode.value === 'days'">
          <div class="vx-daterange__weekdays">
            <span v-for="(day, index) in calendar.weekDays.value" :key="`${day}-${index}`">{{ day }}</span>
          </div>
          <div class="vx-daterange__grid" @mouseleave="hoverDate = null">
            <button
              v-for="(date, index) in calendar.calendarDays.value"
              :key="index"
              type="button"
              class="vx-daterange__day"
              :class="dayClasses(date)"
              :disabled="!date || isDayDisabled(date)"
              @mouseenter="date && (hoverDate = date)"
              @click="selectDay(date)"
            >
              {{ date ? date.getDate() : '' }}
            </button>
          </div>
        </template>

        <div v-else-if="calendar.viewMode.value === 'months'" class="vx-daterange__grid vx-daterange__grid--months">
          <button
            v-for="(m, index) in calendar.monthsShort.value"
            :key="m"
            type="button"
            class="vx-daterange__cell"
            :class="{ 'vx-daterange__cell--today': calendar.isCurrentMonth(index) }"
            @click="calendar.pickMonth(index)"
          >
            {{ m }}
          </button>
        </div>

        <div v-else class="vx-daterange__grid vx-daterange__grid--years">
          <button
            v-for="y in calendar.yearsList.value"
            :key="y"
            type="button"
            class="vx-daterange__cell"
            :class="{ 'vx-daterange__cell--today': calendar.isCurrentYear(y) }"
            @click="calendar.pickYear(y)"
          >
            {{ y }}
          </button>
        </div>

        <div v-if="clearable && (modelValue?.start || modelValue?.end)" class="vx-daterange__footer">
          <button
            v-if="clearable && (modelValue?.start || modelValue?.end)"
            type="button"
            class="vx-daterange__footer-btn vx-daterange__footer-btn--ghost"
            @click="onClear"
          >
            {{ resolvedLabels.clearFooter }}
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { CalendarRange, ChevronLeft, ChevronRight, X } from 'lucide-vue-next'
import VxFieldWrapper from '@/Library/core/utils/Input/fieldWrapper.vue'
import { useDateFormat } from '@/Library/core/composables/Date/useDateFormat'
import { useCalendarGrid } from '@/Library/core/composables/Date/useCalendarGrid'
import { useClickOutside } from '@/Library/core/composables/useClickOutside'

const BASE_LABELS = {
  it: {
    placeholder: 'Seziona un intervallo di date',
    rangeSeparator: '-',
    clear: 'Cancella',
    clearFooter: 'Pulisci',
    prev: 'Precedente',
    next: 'Successivo',
    dialogLabel: 'Seleziona un intervallo di date',
    openLabel: 'Apri selezione intervallo',
    pickStart: 'Seleziona la data di inizio',
    pickEnd: 'Seleziona la data di fine',
  },
  en: {
    placeholder: 'Select a date range',
    rangeSeparator: '-',
    clear: 'Clear',
    clearFooter: 'Clear',
    prev: 'Previous',
    next: 'Next',
    dialogLabel: 'Select a date range',
    openLabel: 'Open range picker',
    pickStart: 'Select the start date',
    pickEnd: 'Select the end date',
  },
}

const props = defineProps({
  /** Intervallo selezionato: { start: 'YYYY-MM-DD', end: 'YYYY-MM-DD' } (v-model) */
  modelValue: { type: Object, default: () => ({ start: '', end: '' }) },
  min: { type: String, default: '' },
  max: { type: String, default: '' },
  locale: { type: String, default: 'it-IT' },
  /** Maschera data (token DD/MM/YYYY). Se omessa, dedotta dal locale. */
  format: { type: String, default: '' },
  firstDayOfWeek: { type: Number, default: null },
  labels: { type: Object, default: null },
  variant: { type: String, default: 'outline' },
  color: { type: String, default: '#7c3aed' },
  colors: { type: Object, default: null },
  size: { type: [String, Object], default: 'md' },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  block: { type: Boolean, default: false },
  pill: { type: Boolean, default: false },
  radius: { type: [Number, String], default: null },
  icon: { type: [Object, Function], default: null },
  /** Posizione dell'icona in entrambi i campi: 'left' | 'right' */
  iconPosition: { type: String, default: 'right' },
  iconSize: { type: [Number, String], default: null },
  clearable: { type: Boolean, default: false },
  label: { type: String, default: '' },
  hint: { type: String, default: '' },
  error: { type: Boolean, default: false },
  errorMessage: { type: String, default: '' },
  focusEffect: { type: String, default: 'ring' },
})

const emit = defineEmits(['update:modelValue', 'change', 'clear'])

const rootRef = ref(null)
const isOpen = ref(false)
const hoverDate = ref(null)

const wrapperProps = computed(() => ({
  size: props.size,
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
  icon: props.icon,
  iconPosition: props.iconPosition,
  iconSize: props.iconSize,
}))

const iconSlotName = computed(() => `icon-${props.iconPosition === 'left' ? 'left' : 'right'}`)

const lang = computed(() => (props.locale || 'it').split('-')[0].toLowerCase())
const resolvedLabels = computed(() => ({
  ...(BASE_LABELS[lang.value] || BASE_LABELS.it),
  ...(props.labels || {}),
}))

const resolvedFirstDayOfWeek = computed(() => {
  if (props.firstDayOfWeek !== null && props.firstDayOfWeek !== undefined) return props.firstDayOfWeek
  return props.locale.toLowerCase() === 'en-us' ? 0 : 1
})

const dateFormat = useDateFormat(
  computed(() => props.format),
  computed(() => props.locale)
)

const startDate = computed(() => dateFormat.parseISO(props.modelValue?.start))
const endDate = computed(() => dateFormat.parseISO(props.modelValue?.end))

const calendar = useCalendarGrid({
  locale: computed(() => props.locale),
  firstDayOfWeek: resolvedFirstDayOfWeek,
  initialDate: startDate.value,
})

// Stato "in sospeso" durante la selezione nel pannello.
const pendingStart = ref(startDate.value)
const pendingEnd = ref(endDate.value)

function isSameDay(a, b) {
  return calendar.isSameDay(a, b)
}

function isDayDisabled(date) {
  if (!date) return true
  const iso = dateFormat.toISO(date)
  if (props.min && iso < props.min) return true
  if (props.max && iso > props.max) return true
  return false
}

function dayClasses(date) {
  if (!date) return { 'vx-daterange__day--empty': true }
  const rangeEnd = pendingEnd.value || (pendingStart.value && !pendingEnd.value ? hoverDate.value : null)
  const inRange =
    pendingStart.value &&
    rangeEnd &&
    date > (pendingStart.value < rangeEnd ? pendingStart.value : rangeEnd) &&
    date < (pendingStart.value < rangeEnd ? rangeEnd : pendingStart.value)

  return {
    'vx-daterange__day--today': calendar.isToday(date),
    'vx-daterange__day--start': isSameDay(date, pendingStart.value),
    'vx-daterange__day--end': isSameDay(date, pendingEnd.value),
    'vx-daterange__day--in-range': !!inRange,
  }
}

function commitRange(start, end) {
  const value = { start: start ? dateFormat.toISO(start) : '', end: end ? dateFormat.toISO(end) : '' }
  emit('update:modelValue', value)
  emit('change', value)
}

function selectDay(date) {
  if (!date || isDayDisabled(date)) return

  if (!pendingStart.value || pendingEnd.value) {
    // Nuovo inizio selezione
    pendingStart.value = date
    pendingEnd.value = null
    return
  }

  // Secondo click: chiude il range, riordinando se necessario
  if (date < pendingStart.value) {
    pendingEnd.value = pendingStart.value
    pendingStart.value = date
  } else {
    pendingEnd.value = date
  }
  commitRange(pendingStart.value, pendingEnd.value)
  isOpen.value = false
}

function onClear(event) {
  event?.stopPropagation?.()
  pendingStart.value = null
  pendingEnd.value = null
  emit('update:modelValue', { start: '', end: '' })
  emit('clear')
}

function openFor(field) {
  if (props.disabled || props.loading) return
  isOpen.value = true
  calendar.resetToDate((field === 'end' ? endDate.value : startDate.value) ?? new Date())
}

useClickOutside(rootRef, () => {
  isOpen.value = false
})

// ===== Digitazione manuale del range =====

const displayValue = computed(() => {
  const start = dateFormat.formatDateWithTemplate(startDate.value)
  const end = dateFormat.formatDateWithTemplate(endDate.value)
  if (start && end) return `${start} ${resolvedLabels.value.rangeSeparator} ${end}`
  return start || end || ''
})

const inputValue = ref(displayValue.value)

watch(
  () => [props.modelValue?.start, props.modelValue?.end],
  () => {
    inputValue.value = displayValue.value
  }
)

const rangeSeparatorPattern = /\s*(?:→|—|–|to)\s*/i

function tryParseComplete(raw) {
  const digits = raw.replace(/\D/g, '')
  const { day, month, year } = dateFormat.parseTemplateDigits(digits)
  if (!day?.complete || !month?.complete || !year?.complete || String(year.value).length < 4) return null
  const date = new Date(year.value, month.value - 1, day.value)
  if (date.getFullYear() !== year.value || date.getMonth() !== month.value - 1 || date.getDate() !== day.value) {
    return null
  }
  if (isDayDisabled(date)) return null
  return date
}

function parseRangeText(raw) {
  const parts = raw.split(rangeSeparatorPattern).map((part) => part.trim()).filter(Boolean)
  if (!parts.length) return null

  const start = tryParseComplete(parts[0])
  if (parts.length === 1) {
    return start ? { start, end: null } : null
  }

  const end = tryParseComplete(parts.slice(1).join(' '))
  if (!start || !end) return null

  return start <= end ? { start, end } : { start: end, end: start }
}

function onInput(event) {
  inputValue.value = event.target.value
}

function commitInput() {
  const raw = inputValue.value.trim()

  if (!raw) {
    pendingStart.value = null
    pendingEnd.value = null
    emit('update:modelValue', { start: '', end: '' })
    emit('change', { start: '', end: '' })
    return
  }

  const parsed = parseRangeText(raw)
  if (!parsed) {
    inputValue.value = displayValue.value
    return
  }

  pendingStart.value = parsed.start
  pendingEnd.value = parsed.end
  commitRange(parsed.start, parsed.end)
}

function openPicker() {
  if (props.disabled || props.loading) return
  isOpen.value = true
  calendar.resetToDate(startDate.value ?? endDate.value ?? new Date())
}

function onEnter(event) {
  commitInput()
  event.target.blur()
}

function onFieldBlur(event, chromeBlur) {
  commitInput()
  chromeBlur?.(event)
}
</script>

<style lang="scss" scoped>
.vx-daterange {
  position: relative;
  display: inline-flex;
  flex-direction: column;

  &--block {
    display: flex;
    width: 100%;

    .vx-daterange__fields {
      width: 100%;
    }
  }
}

.vx-daterange__field {
  width: 100%;
}

.vx-daterange__input {
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

.vx-daterange__icon-btn,
.vx-daterange__clear {
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

.vx-daterange__panel {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 50;
  width: 260px;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: var(--vx-daterange-panel-bg, #fff);
  color: var(--vx-daterange-panel-text, #1e1e1e);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.14);
}

.vx-daterange__nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.vx-daterange__nav-btn {
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

.vx-daterange__month {
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

.vx-daterange__weekdays {
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

.vx-daterange__grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;

  &--months,
  &--years {
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
  }
}

.vx-daterange__day {
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

  &:not(&--start):not(&--end):not(:disabled):hover {
    background: color-mix(in srgb, currentColor 8%, transparent);
  }

  &:disabled {
    cursor: default;
    opacity: 0.3;
  }

  &--empty {
    visibility: hidden;
  }

  &--today:not(&--start):not(&--end) {
    box-shadow: inset 0 0 0 1px var(--vx-daterange-accent, #7c3aed);
  }

  &--in-range {
    background: color-mix(in srgb, var(--vx-daterange-accent, #7c3aed) 14%, transparent);
    border-radius: 0;
  }

  &--start,
  &--end {
    background: var(--vx-daterange-accent, #7c3aed);
    color: #fff;

    &:hover {
      background: color-mix(in srgb, var(--vx-daterange-accent, #7c3aed) 85%, black);
    }
  }
}

.vx-daterange__cell {
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

  &:hover {
    background: color-mix(in srgb, currentColor 8%, transparent);
  }

  &--today {
    box-shadow: inset 0 0 0 1px var(--vx-daterange-accent, #7c3aed);
  }
}

.vx-daterange__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.vx-daterange__footer-btn {
  flex: 1 1 auto;
  width: 100%;
  border: none;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  background: transparent;
  color: inherit;
  opacity: 0.6;

  &:hover {
    opacity: 1;
    background: color-mix(in srgb, currentColor 8%, transparent);
  }
}

.vx-daterange-fade-enter-active,
.vx-daterange-fade-leave-active {
  transition: opacity 0.12s ease, transform 0.12s ease;
}

.vx-daterange-fade-enter-from,
.vx-daterange-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>