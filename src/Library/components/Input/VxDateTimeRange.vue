<template>
  <div
    ref="rootRef"
    class="vx-dtrange"
    :class="{ 'vx-dtrange--block': block }"
    :style="{ '--vx-dtrange-accent': color }"
  >
    <VxFieldWrapper v-bind="wrapperProps" class="vx-dtrange__field">
      <template #[iconSlotName]>
        <button
          type="button"
          class="vx-dtrange__icon-btn"
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
          class="vx-dtrange__input"
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
          class="vx-dtrange__clear"
          tabindex="-1"
          :aria-label="resolvedLabels.clear"
          @mousedown.prevent
          @click="onClear"
        >
          <X :size="14" />
        </button>
      </template>
    </VxFieldWrapper>

    <Transition name="vx-dtrange-fade">
      <div v-if="isOpen" class="vx-dtrange__panel" role="dialog" :aria-label="resolvedLabels.dialogLabel">
        <div class="vx-dtrange__nav">
          <button type="button" class="vx-dtrange__nav-btn" :aria-label="resolvedLabels.prev" @click="calendar.navPrev">
            <ChevronLeft :size="16" />
          </button>
          <button type="button" class="vx-dtrange__month" @click="calendar.onHeaderClick">
            {{ calendar.headerLabel.value }}
          </button>
          <button type="button" class="vx-dtrange__nav-btn" :aria-label="resolvedLabels.next" @click="calendar.navNext">
            <ChevronRight :size="16" />
          </button>
        </div>

        <template v-if="calendar.viewMode.value === 'days'">
          <div class="vx-dtrange__weekdays">
            <span v-for="(day, index) in calendar.weekDays.value" :key="`${day}-${index}`">{{ day }}</span>
          </div>
          <div class="vx-dtrange__grid" @mouseleave="hoverDate = null">
            <button
              v-for="(date, index) in calendar.calendarDays.value"
              :key="index"
              type="button"
              class="vx-dtrange__day"
              :class="dayClasses(date)"
              :disabled="!date || isDayDisabled(date)"
              @mouseenter="date && (hoverDate = date)"
              @click="selectDay(date)"
            >
              {{ date ? date.getDate() : '' }}
            </button>
          </div>
        </template>

        <div v-else-if="calendar.viewMode.value === 'months'" class="vx-dtrange__grid vx-dtrange__grid--months">
          <button
            v-for="(m, index) in calendar.monthsShort.value"
            :key="m"
            type="button"
            class="vx-dtrange__cell"
            @click="calendar.pickMonth(index)"
          >
            {{ m }}
          </button>
        </div>

        <div v-else class="vx-dtrange__grid vx-dtrange__grid--years">
          <button
            v-for="y in calendar.yearsList.value"
            :key="y"
            type="button"
            class="vx-dtrange__cell"
            @click="calendar.pickYear(y)"
          >
            {{ y }}
          </button>
        </div>

        <!-- Orario inizio/fine: visibili appena la relativa data è stata scelta -->
        <div v-if="pendingStart" class="vx-dtrange__time">
          <div v-if="pendingStart" class="vx-dtrange__time-section">
            <div class="vx-dtrange__time-row">
              <div class="vx-dtrange__time-col">
                <div class="vx-dtrange__time-subtitle">
                  <Clock :size="13" />
                  <span>{{ resolvedLabels.startHour }}</span>
                </div>
                <div class="vx-dtrange__time-grid">
                  <button
                    v-for="h in hours"
                    :key="`sh-${h}`"
                    type="button"
                    class="vx-dtrange__time-cell"
                    :class="{ 'vx-dtrange__time-cell--selected': h === pendingStartHour }"
                    @click="pendingStartHour = h"
                  >
                    {{ pad(h) }}
                  </button>
                </div>
              </div>

              <div class="vx-dtrange__time-col">
                <div class="vx-dtrange__time-subtitle">
                  <Clock :size="13" />
                  <span>{{ resolvedLabels.startMinute }}</span>
                </div>
                <div class="vx-dtrange__time-grid">
                  <button
                    v-for="m in minutes"
                    :key="`sm-${m}`"
                    type="button"
                    class="vx-dtrange__time-cell"
                    :class="{ 'vx-dtrange__time-cell--selected': m === pendingStartMinute }"
                    @click="pendingStartMinute = m"
                  >
                    {{ pad(m) }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="pendingStart && pendingEnd" class="vx-dtrange__time-divider" aria-hidden="true"></div>

          <div v-if="pendingEnd" class="vx-dtrange__time-section">
            <div class="vx-dtrange__time-row">
              <div class="vx-dtrange__time-col">
                <div class="vx-dtrange__time-subtitle">
                  <Clock :size="13" />
                  <span>{{ resolvedLabels.endHour }}</span>
                </div>
                <div class="vx-dtrange__time-grid">
                  <button
                    v-for="h in hours"
                    :key="`eh-${h}`"
                    type="button"
                    class="vx-dtrange__time-cell"
                    :class="{ 'vx-dtrange__time-cell--selected': h === pendingEndHour }"
                    @click="pendingEndHour = h"
                  >
                    {{ pad(h) }}
                  </button>
                </div>
              </div>

              <div class="vx-dtrange__time-col">
                <div class="vx-dtrange__time-subtitle">
                  <Clock :size="13" />
                  <span>{{ resolvedLabels.endMinute }}</span>
                </div>
                <div class="vx-dtrange__time-grid">
                  <button
                    v-for="m in minutes"
                    :key="`em-${m}`"
                    type="button"
                    class="vx-dtrange__time-cell"
                    :class="{ 'vx-dtrange__time-cell--selected': m === pendingEndMinute }"
                    @click="pendingEndMinute = m"
                  >
                    {{ pad(m) }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          class="vx-dtrange__footer"
          :class="{ 'vx-dtrange__footer--two-buttons': clearable && (modelValue?.start || modelValue?.end) }"
        >
          <button
            v-if="clearable && (modelValue?.start || modelValue?.end)"
            type="button"
            class="vx-dtrange__footer-btn vx-dtrange__footer-btn--ghost"
            @click="onClear"
          >
            {{ resolvedLabels.clearFooter }}
          </button>
          <button
            type="button"
            class="vx-dtrange__footer-btn vx-dtrange__footer-btn--primary"
            :disabled="!pendingStart || !pendingEnd"
            @click="confirmSelection"
          >
            {{ resolvedLabels.confirm }}
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { CalendarRange, ChevronLeft, ChevronRight, Clock, X } from 'lucide-vue-next'
import VxFieldWrapper from '@/Library/core/utils/Input/fieldWrapper.vue'
import { useDateFormat } from '@/Library/core/composables/Date/useDateFormat'
import { useTimeFormat } from '@/Library/core/composables/Date/useTimeFormat'
import { useCalendarGrid } from '@/Library/core/composables/Date/useCalendarGrid'
import { useClickOutside } from '@/Library/core/composables/useClickOutside'

const BASE_LABELS = {
  it: {
    placeholder: 'Seleziona un intervallo di data e ora',
    rangeSeparator: '-',
    clear: 'Cancella',
    clearFooter: 'Pulisci',
    confirm: 'Conferma',
    prev: 'Precedente',
    next: 'Successivo',
    dialogLabel: 'Seleziona un intervallo di data e ora',
    openLabel: 'Apri selezione intervallo',
    pickStart: 'Seleziona la data di inizio',
    pickEnd: 'Seleziona la data di fine',
    startTime: 'Ora inizio',
    endTime: 'Ora fine',
    startHour: 'Ore inizio',
    startMinute: 'Minuti inizio',
    endHour: 'Ore fine',
    endMinute: 'Minuti fine',
  },
  en: {
    placeholder: 'Select a date and time range',
    rangeSeparator: '-',
    clear: 'Clear',
    clearFooter: 'Clear',
    confirm: 'Confirm',
    prev: 'Previous',
    next: 'Next',
    dialogLabel: 'Select a date and time range',
    openLabel: 'Open range picker',
    pickStart: 'Select the start date',
    pickEnd: 'Select the end date',
    startTime: 'Start time',
    endTime: 'End time',
    startHour: 'Start hour',
    startMinute: 'Start minute',
    endHour: 'End hour',
    endMinute: 'End minute',
  },
}

const props = defineProps({
  /** Intervallo selezionato: { start: 'YYYY-MM-DD HH:MM', end: 'YYYY-MM-DD HH:MM' } (v-model) */
  modelValue: { type: Object, default: () => ({ start: '', end: '' }) },
  min: { type: String, default: '' },
  max: { type: String, default: '' },
  locale: { type: String, default: 'it-IT' },
  /** Maschera della sola parte data (token DD/MM/YYYY). Se omessa, dedotta dal locale. */
  format: { type: String, default: '' },
  /** Maschera della sola parte ora (token HH/mm). Default 'HH:mm'. */
  timeFormat: { type: String, default: 'HH:mm' },
  /** Separatore visivo tra parte data e parte ora nei campi di testo. */
  separator: { type: String, default: ' ' },
  minuteStep: { type: Number, default: 5 },
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
const timeFormat = useTimeFormat(computed(() => props.timeFormat))

const pad = (n) => String(n).padStart(2, '0')
const hours = Array.from({ length: 24 }, (_, i) => i)
const minutes = computed(() => {
  const step = props.minuteStep > 0 ? props.minuteStep : 5
  const list = []
  for (let m = 0; m < 60; m += step) list.push(m)
  return list
})

function parseModelField(value) {
  if (!value) return null
  const [datePart, timePart] = value.split(' ')
  const date = dateFormat.parseISO(datePart)
  if (!date) return null
  const hm = timeFormat.parseHM(timePart || '00:00')
  return { date, hour: hm ? hm.hour : 0, minute: hm ? hm.minute : 0 }
}

function serializeField(date, hour, minute) {
  if (!date) return ''
  return `${dateFormat.toISO(date)} ${timeFormat.toHM(hour, minute)}`
}

const startParsed = computed(() => parseModelField(props.modelValue?.start))
const endParsed = computed(() => parseModelField(props.modelValue?.end))

const calendar = useCalendarGrid({
  locale: computed(() => props.locale),
  firstDayOfWeek: resolvedFirstDayOfWeek,
  initialDate: startParsed.value?.date ?? null,
})

const pendingStart = ref(startParsed.value?.date ?? null)
const pendingEnd = ref(endParsed.value?.date ?? null)
const pendingStartHour = ref(startParsed.value?.hour ?? 9)
const pendingStartMinute = ref(startParsed.value?.minute ?? 0)
const pendingEndHour = ref(endParsed.value?.hour ?? 18)
const pendingEndMinute = ref(endParsed.value?.minute ?? 0)

function isSameDay(a, b) {
  return calendar.isSameDay(a, b)
}

function isDayDisabled(date) {
  if (!date) return true
  const iso = dateFormat.toISO(date)
  if (props.min && iso < props.min.slice(0, 10)) return true
  if (props.max && iso > props.max.slice(0, 10)) return true
  return false
}

function dayClasses(date) {
  if (!date) return { 'vx-dtrange__day--empty': true }
  const rangeEnd = pendingEnd.value || (pendingStart.value && !pendingEnd.value ? hoverDate.value : null)
  const inRange =
    pendingStart.value &&
    rangeEnd &&
    date > (pendingStart.value < rangeEnd ? pendingStart.value : rangeEnd) &&
    date < (pendingStart.value < rangeEnd ? rangeEnd : pendingStart.value)

  return {
    'vx-dtrange__day--today': calendar.isToday(date),
    'vx-dtrange__day--start': isSameDay(date, pendingStart.value),
    'vx-dtrange__day--end': isSameDay(date, pendingEnd.value),
    'vx-dtrange__day--in-range': !!inRange,
  }
}

function selectDay(date) {
  if (!date || isDayDisabled(date)) return
  if (!pendingStart.value || pendingEnd.value) {
    pendingStart.value = date
    pendingEnd.value = null
    return
  }
  if (date < pendingStart.value) {
    pendingEnd.value = pendingStart.value
    pendingStart.value = date
  } else {
    pendingEnd.value = date
  }
  // Non chiude subito: resta aperto per permettere la scelta dell'orario.
}

function confirmSelection() {
  if (!pendingStart.value || !pendingEnd.value) return
  const value = {
    start: serializeField(pendingStart.value, pendingStartHour.value, pendingStartMinute.value),
    end: serializeField(pendingEnd.value, pendingEndHour.value, pendingEndMinute.value),
  }
  emit('update:modelValue', value)
  emit('change', value)
  isOpen.value = false
}

function onClear(event) {
  event?.stopPropagation?.()
  pendingStart.value = null
  pendingEnd.value = null
  emit('update:modelValue', { start: '', end: '' })
  emit('clear')
}

function openPicker() {
  if (props.disabled || props.loading) return
  isOpen.value = true
  calendar.resetToDate(startParsed.value?.date ?? endParsed.value?.date ?? new Date())
}

useClickOutside(rootRef, () => {
  isOpen.value = false
})

// ===== Digitazione manuale combinata data + ora =====

function displayFieldValue(parsed) {
  if (!parsed) return ''
  return `${dateFormat.formatDateWithTemplate(parsed.date)}${props.separator}${timeFormat.formatTimeWithTemplate(parsed.hour, parsed.minute)}`
}

const displayValue = computed(() => {
  const start = displayFieldValue(startParsed.value)
  const end = displayFieldValue(endParsed.value)
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

function parseFieldRaw(raw) {
  const digits = raw.replace(/\D/g, '')
  const dateDigits = digits.slice(0, dateFormat.inputMaxLength.value)
  const timeDigits = digits.slice(dateFormat.inputMaxLength.value, dateFormat.inputMaxLength.value + timeFormat.inputMaxLength.value)

  const { day, month, year } = dateFormat.parseTemplateDigits(dateDigits)
  if (!day?.complete || !month?.complete || !year?.complete || String(year.value).length < 4) return null

  const date = new Date(year.value, month.value - 1, day.value)
  if (date.getFullYear() !== year.value || date.getMonth() !== month.value - 1 || date.getDate() !== day.value) {
    return null
  }
  if (isDayDisabled(date)) return null

  const { hour, minute } = timeFormat.parseTemplateDigits(timeDigits)
  const h = hour?.complete ? Math.min(hour.value, 23) : 0
  const m = minute?.complete ? Math.min(minute.value, 59) : 0

  return { date, hour: h, minute: m }
}

function parseRangeText(raw) {
  const parts = raw.split(rangeSeparatorPattern).map((part) => part.trim()).filter(Boolean)
  if (!parts.length) return null

  const start = parseFieldRaw(parts[0])
  if (parts.length === 1) return start ? { start, end: null } : null

  const end = parseFieldRaw(parts.slice(1).join(' '))
  if (!start || !end) return null

  return start.date <= end.date ? { start, end } : { start: end, end: start }
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

  pendingStart.value = parsed.start.date
  pendingEnd.value = parsed.end?.date ?? null
  pendingStartHour.value = parsed.start.hour
  pendingStartMinute.value = parsed.start.minute
  if (parsed.end) {
    pendingEndHour.value = parsed.end.hour
    pendingEndMinute.value = parsed.end.minute
  }

  const value = {
    start: serializeField(parsed.start.date, parsed.start.hour, parsed.start.minute),
    end: parsed.end ? serializeField(parsed.end.date, parsed.end.hour, parsed.end.minute) : '',
  }
  emit('update:modelValue', value)
  emit('change', value)
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
.vx-dtrange {
  position: relative;
  display: inline-flex;
  flex-direction: column;

  &--block {
    display: flex;
    width: 100%;

    .vx-dtrange__fields {
      width: 100%;
    }
  }
}

.vx-dtrange__field {
  width: 100%;
}

.vx-dtrange__input {
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

.vx-dtrange__icon-btn,
.vx-dtrange__clear {
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

.vx-dtrange__panel {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 50;
  width: 360px;
  padding: 10px;
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: var(--vx-dtrange-panel-bg, #fff);
  color: var(--vx-dtrange-panel-text, #1e1e1e);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.14);
}

.vx-dtrange__nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.vx-dtrange__nav-btn {
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

.vx-dtrange__month {
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

.vx-dtrange__weekdays {
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

.vx-dtrange__grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;

  &--months,
  &--years {
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
  }
}

.vx-dtrange__day {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 28px;
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
    box-shadow: inset 0 0 0 1px var(--vx-dtrange-accent, #7c3aed);
  }

  &--in-range {
    background: color-mix(in srgb, var(--vx-dtrange-accent, #7c3aed) 14%, transparent);
    border-radius: 0;
  }

  &--start,
  &--end {
    background: var(--vx-dtrange-accent, #7c3aed);
    color: #fff;

    &:hover {
      background: color-mix(in srgb, var(--vx-dtrange-accent, #7c3aed) 85%, black);
    }
  }
}

.vx-dtrange__cell {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: inherit;
  font-size: 13px;
  cursor: pointer;

  &:hover {
    background: color-mix(in srgb, currentColor 8%, transparent);
  }
}

.vx-dtrange__time {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.vx-dtrange__time-divider {
  height: 1px;
  background: rgba(0, 0, 0, 0.08);
}

.vx-dtrange__time-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.vx-dtrange__time-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  opacity: 0.65;
}

.vx-dtrange__time-row {
  display: flex;
  gap: 8px;
}

.vx-dtrange__time-col {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.vx-dtrange__time-subtitle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  opacity: 0.65;
}

.vx-dtrange__time-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 4px;
  max-height: 100px;
  overflow: auto;
  padding-right: 2px;
  scrollbar-width: thin;
}

.vx-dtrange__time-cell {
  min-height: 30px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  background: transparent;
  color: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.12s ease, color 0.12s ease;

  &:not(&--selected):hover {
    background: color-mix(in srgb, currentColor 8%, transparent);
  }

  &--selected {
    background: var(--vx-dtrange-accent, #7c3aed);
    color: #fff;

    &:hover {
        background: color-mix(in srgb, var(--vx-dtrange-accent, #7c3aed) 85%, black);
    }
  }
}

.vx-dtrange__footer {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.vx-dtrange__footer--two-buttons {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.vx-dtrange__footer-btn {
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

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  &--primary {
    opacity: 1;
    background: var(--vx-dtrange-accent, #7c3aed);
    color: #fff;

    &:hover {
      background: color-mix(in srgb, var(--vx-dtrange-accent, #7c3aed) 85%, black);
    }

    &:disabled {
      opacity: 0.4;
    }
  }
}

.vx-dtrange-fade-enter-active,
.vx-dtrange-fade-leave-active {
  transition: opacity 0.12s ease, transform 0.12s ease;
}

.vx-dtrange-fade-enter-from,
.vx-dtrange-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>