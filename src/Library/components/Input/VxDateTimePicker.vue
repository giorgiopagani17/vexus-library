<template>
  <div
    ref="rootRef"
    class="vx-datetimepicker"
    :class="{ 'vx-datetimepicker--block': block }"
    :style="{ '--vx-datetimepicker-accent': color }"
  >
    <VxFieldWrapper v-bind="wrapperProps">
      <template #[iconSlotName]>
        <button
          type="button"
          class="vx-datetimepicker__icon-btn"
          :disabled="disabled || loading"
          tabindex="-1"
          aria-haspopup="dialog"
          :aria-expanded="isOpen"
          :aria-label="resolvedLabels.openLabel"
          @mousedown.prevent
          @click="toggleOpen"
        >
          <slot name="icon">
            <CalendarClock :size="16" />
          </slot>
        </button>
      </template>

      <template
        #default="{ fieldId, disabled: fieldDisabled, onFocus: chromeFocus, onBlur: chromeBlur }"
      >
        <input
          :id="fieldId"
          type="text"
          class="vx-datetimepicker__input"
          :value="inputValue"
          :disabled="fieldDisabled || loading"
          :placeholder="effectivePlaceholder"
          :maxlength="combinedMaxLength"
          inputmode="numeric"
          autocomplete="off"
          @input="onInput"
          @keydown.enter="onEnter"
          @focus="chromeFocus"
          @blur="onInputBlur($event, chromeBlur)"
        />
      </template>

      <template v-if="clearable && modelValue && !disabled" #trailing="{ resolvedIconSize }">
        <button
          type="button"
          class="vx-datetimepicker__clear"
          tabindex="-1"
          :aria-label="resolvedLabels.clear"
          @mousedown.prevent
          @click="onClear"
        >
          <X :size="resolvedIconSize" />
        </button>
      </template>
    </VxFieldWrapper>

    <Transition name="vx-datetimepicker-fade">
      <div v-if="isOpen" class="vx-datetimepicker__panel" role="dialog" :aria-label="resolvedLabels.dialogLabel">
        <div class="vx-datetimepicker__nav">
          <button type="button" class="vx-datetimepicker__nav-btn" :aria-label="resolvedLabels.prev" @click="calendar.navPrev">
            <ChevronLeft :size="16" />
          </button>
          <button type="button" class="vx-datetimepicker__month" @click="calendar.onHeaderClick">
            {{ calendar.headerLabel.value }}
          </button>
          <button type="button" class="vx-datetimepicker__nav-btn" :aria-label="resolvedLabels.next" @click="calendar.navNext">
            <ChevronRight :size="16" />
          </button>
        </div>

        <template v-if="calendar.viewMode.value === 'days'">
          <div class="vx-datetimepicker__weekdays">
            <span v-for="(day, index) in calendar.weekDays.value" :key="`${day}-${index}`">{{ day }}</span>
          </div>
          <div class="vx-datetimepicker__grid">
            <button
              v-for="(date, index) in calendar.calendarDays.value"
              :key="index"
              type="button"
              class="vx-datetimepicker__day"
              :class="{
                'vx-datetimepicker__day--empty': !date,
                'vx-datetimepicker__day--today': date && calendar.isToday(date),
                'vx-datetimepicker__day--selected': date && isSelectedDay(date),
              }"
              :disabled="!date || isDayDisabled(date)"
              @click="selectDay(date)"
            >
              {{ date ? date.getDate() : '' }}
            </button>
          </div>
        </template>

        <div v-else-if="calendar.viewMode.value === 'months'" class="vx-datetimepicker__grid vx-datetimepicker__grid--months">
          <button
            v-for="(m, index) in calendar.monthsShort.value"
            :key="m"
            type="button"
            class="vx-datetimepicker__cell"
            :class="{ 'vx-datetimepicker__cell--today': calendar.isCurrentMonth(index) }"
            @click="calendar.pickMonth(index)"
          >
            {{ m }}
          </button>
        </div>

        <div v-else class="vx-datetimepicker__grid vx-datetimepicker__grid--years">
          <button
            v-for="y in calendar.yearsList.value"
            :key="y"
            type="button"
            class="vx-datetimepicker__cell"
            :class="{ 'vx-datetimepicker__cell--today': calendar.isCurrentYear(y) }"
            @click="calendar.pickYear(y)"
          >
            {{ y }}
          </button>
        </div>

        <!-- Selettore orario più ampio e leggibile -->
        <div class="vx-datetimepicker__time">
          <div class="vx-datetimepicker__time-section">
            <div class="vx-datetimepicker__time-label">
              <Clock :size="13" />
              <span>Ore</span>
            </div>
            <div class="vx-datetimepicker__time-grid">
              <button
                v-for="h in hours"
                :key="`h-${h}`"
                type="button"
                class="vx-datetimepicker__time-cell"
                :class="{ 'vx-datetimepicker__time-cell--selected': h === pendingHour }"
                @click="pendingHour = h"
              >
                {{ pad(h) }}
              </button>
            </div>
          </div>

          <div class="vx-datetimepicker__time-section">
            <div class="vx-datetimepicker__time-label">
              <Clock :size="13" />
              <span>Minuti</span>
            </div>
            <div class="vx-datetimepicker__time-grid">
              <button
                v-for="m in minutes"
                :key="`m-${m}`"
                type="button"
                class="vx-datetimepicker__time-cell"
                :class="{ 'vx-datetimepicker__time-cell--selected': m === pendingMinute }"
                @click="pendingMinute = m"
              >
                {{ pad(m) }}
              </button>
            </div>
          </div>
        </div>

        <div class="vx-datetimepicker__footer">
          <button type="button" class="vx-datetimepicker__footer-btn" @click="selectNow">
            {{ resolvedLabels.now }}
          </button>
          <button
            v-if="clearable && modelValue"
            type="button"
            class="vx-datetimepicker__footer-btn vx-datetimepicker__footer-btn--ghost"
            @click="onClear"
          >
            {{ resolvedLabels.clearFooter }}
          </button>
          <button
            type="button"
            class="vx-datetimepicker__footer-btn vx-datetimepicker__footer-btn--primary"
            :disabled="!pendingDate"
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
import { CalendarClock, ChevronLeft, ChevronRight, Clock, X } from 'lucide-vue-next'
import VxFieldWrapper from '@/Library/core/utils/Input/fieldWrapper.vue'
import { useDateFormat } from '@/Library/core/composables/Date/useDateFormat'
import { useTimeFormat } from '@/Library/core/composables/Date/useTimeFormat'
import { useCalendarGrid } from '@/Library/core/composables/Date/useCalendarGrid'
import { useClickOutside } from '@/Library/core/composables/useClickOutside'

const BASE_LABELS = {
  it: {
    placeholder: 'Seleziona data e ora',
    clear: 'Cancella',
    now: 'Adesso',
    confirm: 'Conferma',
    clearFooter: 'Pulisci',
    prev: 'Precedente',
    next: 'Successivo',
    dialogLabel: 'Seleziona data e ora',
    openLabel: 'Apri selezione data e ora',
  },
  en: {
    placeholder: 'Select date and time',
    clear: 'Clear',
    now: 'Now',
    confirm: 'Confirm',
    clearFooter: 'Clear',
    prev: 'Previous',
    next: 'Next',
    dialogLabel: 'Select date and time',
    openLabel: 'Open date and time picker',
  },
}

const props = defineProps({
  /** Data/ora selezionata, formato canonico 'YYYY-MM-DD HH:MM' (v-model) */
  modelValue: { type: String, default: '' },
  min: { type: String, default: '' },
  max: { type: String, default: '' },
  locale: { type: String, default: 'it-IT' },
  /** Maschera della sola parte data (token DD/MM/YYYY). Se omessa, dedotta dal locale. */
  format: { type: String, default: '' },
  /** Maschera della sola parte ora (token HH/mm). Default 'HH:mm'. */
  timeFormat: { type: String, default: 'HH:mm' },
  /** Separatore visivo tra parte data e parte ora nel campo di testo. */
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
  /** Posizione dell'icona nel campo: 'left' | 'right' */
  iconPosition: { type: String, default: 'right' },
  iconSize: { type: [Number, String], default: null },
  clearable: { type: Boolean, default: false },
  placeholder: { type: String, default: '' },
  label: { type: String, default: '' },
  hint: { type: String, default: '' },
  error: { type: Boolean, default: false },
  errorMessage: { type: String, default: '' },
  focusEffect: { type: String, default: 'ring' },
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

const lang = computed(() => (props.locale || 'it').split('-')[0].toLowerCase())
const resolvedLabels = computed(() => ({
  ...(BASE_LABELS[lang.value] || BASE_LABELS.it),
  ...(props.labels || {}),
}))
const effectivePlaceholder = computed(() => props.placeholder || resolvedLabels.value.placeholder)

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

// ===== Parsing/serializzazione del v-model canonico 'YYYY-MM-DD HH:MM' =====

function parseModel(value) {
  if (!value) return null
  const [datePart, timePart] = value.split(' ')
  const date = dateFormat.parseISO(datePart)
  if (!date) return null
  const hm = timeFormat.parseHM(timePart || '00:00')
  return { date, hour: hm ? hm.hour : 0, minute: hm ? hm.minute : 0 }
}

function serializeModel(date, hour, minute) {
  return `${dateFormat.toISO(date)} ${timeFormat.toHM(hour, minute)}`
}

const selected = computed(() => parseModel(props.modelValue))

const calendar = useCalendarGrid({
  locale: computed(() => props.locale),
  firstDayOfWeek: resolvedFirstDayOfWeek,
  initialDate: selected.value?.date ?? null,
})

// Stato "in sospeso" mentre il pannello è aperto: si aggiorna cliccando
// giorno/ora/minuti, ma viene emesso solo al click su "Conferma" (o subito
// se si clicca "Adesso").
const pendingDate = ref(selected.value?.date ?? null)
const pendingHour = ref(selected.value?.hour ?? new Date().getHours())
const pendingMinute = ref(selected.value?.minute ?? 0)

function isSameDay(a, b) {
  return calendar.isSameDay(a, b)
}

function isSelectedDay(date) {
  return isSameDay(date, pendingDate.value)
}

function isDayDisabled(date) {
  if (!date) return true
  const iso = dateFormat.toISO(date)
  if (props.min && iso < props.min.slice(0, 10)) return true
  if (props.max && iso > props.max.slice(0, 10)) return true
  return false
}

function selectDay(date) {
  if (!date || isDayDisabled(date)) return
  pendingDate.value = date
}

function confirmSelection() {
  if (!pendingDate.value) return
  const value = serializeModel(pendingDate.value, pendingHour.value, pendingMinute.value)
  emit('update:modelValue', value)
  emit('change', value)
  isOpen.value = false
}

function selectNow() {
  const now = new Date()
  if (isDayDisabled(now)) return
  pendingDate.value = now
  pendingHour.value = now.getHours()
  pendingMinute.value = now.getMinutes() - (now.getMinutes() % (props.minuteStep || 5))
  const value = serializeModel(pendingDate.value, pendingHour.value, pendingMinute.value)
  emit('update:modelValue', value)
  emit('change', value)
  isOpen.value = false
}

function onClear(event) {
  event?.stopPropagation?.()
  emit('update:modelValue', '')
  emit('clear')
}

function toggleOpen() {
  if (props.disabled || props.loading) return
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    const current = selected.value
    calendar.resetToDate(current?.date ?? null)
    pendingDate.value = current?.date ?? null
    pendingHour.value = current?.hour ?? new Date().getHours()
    pendingMinute.value = current?.minute ?? 0
  }
}

useClickOutside(rootRef, () => {
  isOpen.value = false
})

// ===== Digitazione manuale combinata data + ora =====

const dateDigitsLen = computed(() =>
  dateFormat.formatTemplate.value.reduce((t, s) => t + (s.type !== 'literal' ? s.length : 0), 0)
)
const timeDigitsLen = computed(() =>
  timeFormat.formatTemplate.value.reduce((t, s) => t + (s.type !== 'literal' ? s.length : 0), 0)
)
const combinedMaxLength = computed(
  () => dateFormat.inputMaxLength.value + props.separator.length + timeFormat.inputMaxLength.value
)

const displayValue = computed(() => {
  const s = selected.value
  if (!s) return ''
  return `${dateFormat.formatDateWithTemplate(s.date)}${props.separator}${timeFormat.formatTimeWithTemplate(s.hour, s.minute)}`
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
  const dateDigits = digits.slice(0, dateDigitsLen.value)
  const timeDigits = digits.slice(dateDigitsLen.value, dateDigitsLen.value + timeDigitsLen.value)
  const datePart = dateFormat.maskDigitsForInput(dateDigits)
  const timePart = timeFormat.maskDigitsForInput(timeDigits)
  inputValue.value = timeDigits.length > 0 ? `${datePart}${props.separator}${timePart}` : datePart
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
  const dateDigits = digits.slice(0, dateDigitsLen.value)
  const timeDigits = digits.slice(dateDigitsLen.value, dateDigitsLen.value + timeDigitsLen.value)

  const { day, month, year } = dateFormat.parseTemplateDigits(dateDigits)
  if (!day?.complete || !month?.complete || !year?.complete || String(year.value).length < 4) {
    inputValue.value = displayValue.value
    return
  }

  const date = new Date(year.value, month.value - 1, day.value)
  if (date.getFullYear() !== year.value || date.getMonth() !== month.value - 1 || date.getDate() !== day.value) {
    inputValue.value = displayValue.value
    return
  }
  if (isDayDisabled(date)) {
    inputValue.value = displayValue.value
    return
  }

  const { hour, minute } = timeFormat.parseTemplateDigits(timeDigits)
  const h = hour?.complete ? Math.min(hour.value, 23) : 0
  const m = minute?.complete ? Math.min(minute.value, 59) : 0

  const value = serializeModel(date, h, m)
  if (value !== props.modelValue) {
    emit('update:modelValue', value)
    emit('change', value)
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
}
</script>

<style lang="scss" scoped>
.vx-datetimepicker {
  position: relative;
  display: inline-flex;
  flex-direction: column;

  &--block {
    display: flex;
    width: 100%;
  }
}

.vx-datetimepicker__input {
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

.vx-datetimepicker__icon-btn,
.vx-datetimepicker__clear {
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

.vx-datetimepicker__panel {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 50;
  width: 360px;
  padding: 16px;
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: var(--vx-datetimepicker-panel-bg, #fff);
  color: var(--vx-datetimepicker-panel-text, #1e1e1e);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.14);
}

.vx-datetimepicker__nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.vx-datetimepicker__nav-btn {
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

.vx-datetimepicker__month {
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

.vx-datetimepicker__weekdays {
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

.vx-datetimepicker__grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;

  &--months,
  &--years {
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
  }
}

.vx-datetimepicker__day {
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
    box-shadow: inset 0 0 0 1px var(--vx-datetimepicker-accent, #7c3aed);
  }

  &--selected {
    background: var(--vx-datetimepicker-accent, #7c3aed);
    color: #fff;

    &:hover {
      background: color-mix(in srgb, var(--vx-datetimepicker-accent, #7c3aed) 85%, black);
    }
  }
}

.vx-datetimepicker__cell {
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

  &--today {
    box-shadow: inset 0 0 0 1px var(--vx-datetimepicker-accent, #7c3aed);
  }
}

.vx-datetimepicker__time {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.vx-datetimepicker__time-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.vx-datetimepicker__time-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  opacity: 0.65;
}

.vx-datetimepicker__time-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 4px;
  max-height: 100px;
  overflow: auto;
  padding-right: 2px;
  scrollbar-width: thin;
}

.vx-datetimepicker__time-cell {
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
    background: var(--vx-datetimepicker-accent, #7c3aed);
    color: #fff;

    &:hover {
        background: color-mix(in srgb, var(--vx-dtrange-accent, #7c3aed) 85%, black);
    }
  }
}

.vx-datetimepicker__footer {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.vx-datetimepicker__footer-btn {
  flex: 1 1 auto;
  border: none;
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  background: color-mix(in srgb, var(--vx-datetimepicker-accent, #7c3aed) 12%, transparent);
  color: var(--vx-datetimepicker-accent, #7c3aed);

  &:hover {
    background: color-mix(in srgb, var(--vx-datetimepicker-accent, #7c3aed) 20%, transparent);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
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

  &--primary {
    background: var(--vx-datetimepicker-accent, #7c3aed);
    color: #fff;

    &:hover {
      background: color-mix(in srgb, var(--vx-datetimepicker-accent, #7c3aed) 85%, black);
    }
  }
}

.vx-datetimepicker-fade-enter-active,
.vx-datetimepicker-fade-leave-active {
  transition: opacity 0.12s ease, transform 0.12s ease;
}

.vx-datetimepicker-fade-enter-from,
.vx-datetimepicker-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>