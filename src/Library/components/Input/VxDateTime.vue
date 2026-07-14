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
          aria-label="Open date and time picker"
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
          :placeholder="placeholder"
          :maxlength="combinedMaxLength"
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
          class="vx-datetimepicker__clear"
          tabindex="-1"
          aria-label="Clear date and time"
          @mousedown.prevent
          @click="onClear"
        >
          <X :size="resolvedIconSize" />
        </button>
      </template>
    </VxFieldWrapper>

    <!--
      Tutta la logica di apertura/anchoring/positioning/responsive è ora
      delegata ad AnchoredOverlay: qui restano solo il markup e lo stato
      "di dominio" del datetime picker (tab attiva, giorno/ora pendenti...).
      Lo stesso AnchoredOverlay puo' essere riusato tal quale da DatePicker,
      TimePicker, Select, Autocomplete, ecc.
    -->
    <AnchoredOverlay
      v-model="isOpen"
      :reference="rootRef"
      aria-label="Date and time picker dialog"
      :gap="8"
      :viewport-padding="8"
      modal-on-mobile
      lock-scroll-on-mobile
    >
      <template #default="{ isMobile }">
        <div
          class="vx-datetimepicker__panel"
          :class="{ 'vx-datetimepicker__panel--mobile-modal': isMobile }"
        >
          <div class="vx-datetimepicker__summary">
            <div class="vx-datetimepicker__summary-label">
              {{ summaryLabel }}
            </div>

            <div class="vx-datetimepicker__summary-main">
              {{ pendingDate ? dateFormat.formatDateWithTemplate(pendingDate) : placeholder }}
            </div>

            <div v-if="pendingDate" class="vx-datetimepicker__summary-sub">
              {{ timeFormat.formatTimeWithTemplate(pendingHour, pendingMinute) }}
            </div>
          </div>

          <div class="vx-datetimepicker__tabs" role="tablist" aria-label="Date and time sections">
            <button
              id="vx-datetimepicker-tab-date"
              type="button"
              role="tab"
              class="vx-datetimepicker__tab"
              :class="{ 'vx-datetimepicker__tab--active': activeTab === 'date' }"
              :aria-selected="activeTab === 'date'"
              aria-controls="vx-datetimepicker-panel-date"
              @click="activeTab = 'date'"
            >
              {{ dateTabLabel }}
            </button>

            <button
              id="vx-datetimepicker-tab-time"
              type="button"
              role="tab"
              class="vx-datetimepicker__tab"
              :class="{ 'vx-datetimepicker__tab--active': activeTab === 'time' }"
              :aria-selected="activeTab === 'time'"
              aria-controls="vx-datetimepicker-panel-time"
              @click="activeTab = 'time'"
            >
              {{ timeTabLabel }}
            </button>
          </div>

          <div
            v-show="activeTab === 'date'"
            id="vx-datetimepicker-panel-date"
            role="tabpanel"
            aria-labelledby="vx-datetimepicker-tab-date"
            class="vx-datetimepicker__tabpanel"
          >
            <div class="vx-datetimepicker__nav">
              <button
                type="button"
                class="vx-datetimepicker__nav-btn"
                aria-label="Previous month"
                @click="calendar.navPrev"
              >
                <ChevronLeft :size="16" />
              </button>

              <button type="button" class="vx-datetimepicker__month" @click="calendar.onHeaderClick">
                {{ calendar.headerLabel.value }}
              </button>

              <button
                type="button"
                class="vx-datetimepicker__nav-btn"
                aria-label="Next month"
                @click="calendar.navNext"
              >
                <ChevronRight :size="16" />
              </button>
            </div>

            <template v-if="calendar.viewMode.value === 'days'">
              <div class="vx-datetimepicker__weekdays">
                <span v-for="(day, index) in calendar.weekDays.value" :key="`${day}-${index}`">
                  {{ day }}
                </span>
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

            <div
              v-else-if="calendar.viewMode.value === 'months'"
              class="vx-datetimepicker__grid vx-datetimepicker__grid--months"
            >
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
          </div>

          <div
            v-show="activeTab === 'time'"
            id="vx-datetimepicker-panel-time"
            role="tabpanel"
            aria-labelledby="vx-datetimepicker-tab-time"
            class="vx-datetimepicker__tabpanel"
          >
            <div class="vx-datetimepicker__time-cols">
              <div class="vx-datetimepicker__time-col">
                <div class="vx-datetimepicker__time-label">
                  <Clock :size="13" />
                  <span>{{ hoursLabel }}</span>
                </div>

                <div class="vx-datetimepicker__time-list">
                  <button
                    v-for="h in hours"
                    :key="`h-${h}`"
                    type="button"
                    class="vx-datetimepicker__time-cell"
                    :class="{ 'vx-datetimepicker__time-cell--selected': h === pendingHour }"
                    @click="pickHour(h)"
                  >
                    {{ pad(h) }}
                  </button>
                </div>
              </div>

              <div class="vx-datetimepicker__time-col">
                <div class="vx-datetimepicker__time-label">
                  <Clock :size="13" />
                  <span>{{ minutesLabel }}</span>
                </div>

                <div class="vx-datetimepicker__time-list">
                  <button
                    v-for="m in minutes"
                    :key="`m-${m}`"
                    type="button"
                    class="vx-datetimepicker__time-cell"
                    :class="{ 'vx-datetimepicker__time-cell--selected': m === pendingMinute }"
                    @click="pickMinute(m)"
                  >
                    {{ pad(m) }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="vx-datetimepicker__footer">
            <button type="button" class="vx-datetimepicker__footer-btn" @click="selectNow">
              {{ nowLabel }}
            </button>

            <button
              v-if="clearable && modelValue"
              type="button"
              class="vx-datetimepicker__footer-btn vx-datetimepicker__footer-btn--ghost"
              @click="onClear"
            >
              {{ clearFooterLabel }}
            </button>

            <button
              type="button"
              class="vx-datetimepicker__footer-btn vx-datetimepicker__footer-btn--primary"
              :disabled="!pendingDate"
              @click="confirmSelection"
            >
              {{ confirmLabel }}
            </button>
          </div>
        </div>
      </template>
    </AnchoredOverlay>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { CalendarClock, ChevronLeft, ChevronRight, Clock, X } from 'lucide-vue-next'
import VxFieldWrapper from '@/Library/core/components/Input/FieldWrapper.vue'
import { useDateFormat } from '@/Library/core/composables/Date/useDateFormat'
import { useTimeFormat } from '@/Library/core/composables/Date/useTimeFormat'
import { useCalendarGrid } from '@/Library/core/composables/Date/useCalendarGrid'
import AnchoredOverlay from '@/Library/core/components/Picker/AnchoredOverlay.vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  min: { type: String, default: '' },
  max: { type: String, default: '' },
  locale: { type: String, default: 'en-US' },
  format: { type: String, default: '' },
  timeFormat: { type: String, default: 'HH:mm' },
  separator: { type: String, default: ' ' },
  minuteStep: { type: Number, default: 5 },
  firstDayOfWeek: { type: Number, default: null },
  variant: { type: String, default: 'outline' },
  color: { type: String, default: null },
  colors: { type: Object, default: null },
  size: { type: [String, Object], default: 'md' },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  block: { type: Boolean, default: false },
  pill: { type: Boolean, default: false },
  radius: { type: [Number, String], default: null },
  icon: { type: [Object, Function], default: null },
  iconPosition: { type: String, default: 'right' },
  iconSize: { type: [Number, String], default: null },
  clearable: { type: Boolean, default: false },
  placeholder: { type: String, default: 'Select date and time' },
  nowLabel: { type: String, default: 'Now' },
  confirmLabel: { type: String, default: 'Confirm' },
  clearFooterLabel: { type: String, default: 'Clear' },
  hoursLabel: { type: String, default: 'Hours' },
  minutesLabel: { type: String, default: 'Minutes' },
  dateTabLabel: { type: String, default: 'Date' },
  timeTabLabel: { type: String, default: 'Time' },
  summaryLabel: { type: String, default: 'Selected' },
  label: { type: String, default: '' },
  hint: { type: String, default: '' },
  error: { type: Boolean, default: false },
  errorMessage: { type: String, default: '' },
  focusEffect: { type: String, default: 'ring' },
})

const emit = defineEmits(['update:modelValue', 'change', 'focus', 'blur', 'clear'])

const rootRef = ref(null)
const isOpen = ref(false)
const activeTab = ref('date')

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

function pickHour(h) {
  pendingHour.value = h
}

function pickMinute(m) {
  pendingMinute.value = m
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

  const step = props.minuteStep > 0 ? props.minuteStep : 5
  pendingDate.value = now
  pendingHour.value = now.getHours()
  pendingMinute.value = now.getMinutes() - (now.getMinutes() % step)

  const value = serializeModel(pendingDate.value, pendingHour.value, pendingMinute.value)
  emit('update:modelValue', value)
  emit('change', value)
  isOpen.value = false
}

function onClear(event) {
  event?.stopPropagation?.()
  emit('update:modelValue', '')
  emit('change', '')
  emit('clear')
  inputValue.value = ''
  if (isOpen.value) isOpen.value = false
}

function openPicker() {
  if (props.disabled || props.loading) return
  isOpen.value = true

  const current = selected.value
  calendar.resetToDate(current?.date ?? null)
  pendingDate.value = current?.date ?? null
  pendingHour.value = current?.hour ?? new Date().getHours()
  pendingMinute.value = current?.minute ?? 0
  activeTab.value = 'date'
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
    pendingDate.value = selected.value?.date ?? null
    pendingHour.value = selected.value?.hour ?? new Date().getHours()
    pendingMinute.value = selected.value?.minute ?? 0
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

  const { hour, minute } = timeFormat.parseTemplateDigits(timeDigits)
  const h = hour?.complete ? Math.min(hour.value, 23) : 0
  const m = minute?.complete ? Math.min(minute.value, 59) : 0

  const value = serializeModel(date, h, m)

  pendingDate.value = date
  pendingHour.value = h
  pendingMinute.value = m

  if (value !== props.modelValue) {
    emit('update:modelValue', value)
    emit('change', value)
  }

  inputValue.value = `${dateFormat.formatDateWithTemplate(date)}${props.separator}${timeFormat.formatTimeWithTemplate(h, m)}`
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
  transition: opacity 0.15s ease, transform 0.18s ease;

  &:hover {
    opacity: 1;
  }

  &:active {
    transform: scale(0.96);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }
}

/*
 * Il posizionamento (position/top/left/transform/z-index/transition) vive
 * ora dentro <AnchoredOverlay>: qui restano solo le proprietà "visive" del
 * pannello (dimensioni, sfondo, bordo, ombra).
 *
 * Nessun overflow/max-height qui: il pannello non deve mai generare uno
 * scroll interno, si dimensiona sul proprio contenuto. È `flip` (dentro
 * useFloatingPanel) a scegliere se aprirsi sopra o sotto l'input in base
 * allo spazio disponibile, non un contenitore con scrollbar.
 */
.vx-datetimepicker__panel {
  width: 360px;
  max-width: calc(100vw - 16px);
  padding: 12px;
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: var(--vx-datetimepicker-panel-bg, #fff);
  color: var(--vx-datetimepicker-panel-text, #000);
  box-shadow:
    0 10px 24px rgba(0, 0, 0, 0.10),
    0 24px 54px rgba(0, 0, 0, 0.14);
  box-sizing: border-box;
}

.vx-datetimepicker__summary {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
  padding: 12px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--vx-datetimepicker-accent, $primary) 10%, transparent);
  color: var(--vx-datetimepicker-accent, $primary);
}

.vx-datetimepicker__summary-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.72;
}

.vx-datetimepicker__summary-main {
  font-size: 19px;
  line-height: 1.15;
  font-weight: 700;
  color: inherit;
  word-break: break-word;
}

.vx-datetimepicker__summary-sub {
  font-size: 13px;
  font-weight: 700;
  opacity: 0.88;
}

.vx-datetimepicker__tabs {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
  margin-bottom: 10px;
}

.vx-datetimepicker__tab {
  min-width: 0;
  border: none;
  border-radius: 10px;
  padding: 8px 10px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  background: transparent;
  color: inherit;
  opacity: 0.72;
  transition: background 0.18s ease, color 0.18s ease, opacity 0.18s ease, transform 0.18s ease;

  &:hover {
    opacity: 1;
    background: color-mix(in srgb, currentColor 8%, transparent);
  }

  &:active {
    transform: scale(0.98);
  }

  &--active {
    opacity: 1;
    background: color-mix(in srgb, var(--vx-datetimepicker-accent, $primary) 14%, transparent);
    color: var(--vx-datetimepicker-accent, $primary);
  }
}

.vx-datetimepicker__tabpanel {
  min-width: 0;
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
  transition: background 0.18s ease, opacity 0.18s ease, transform 0.18s ease;

  &:hover {
    opacity: 1;
    background: color-mix(in srgb, currentColor 8%, transparent);
  }

  &:active {
    transform: scale(0.95);
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
  transition: background 0.18s ease, transform 0.18s ease;

  &:hover {
    background: color-mix(in srgb, currentColor 8%, transparent);
  }

  &:active {
    transform: scale(0.98);
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
  height: 30px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: inherit;
  font-size: 12.5px;
  cursor: pointer;
  transition: background 0.16s ease, color 0.16s ease, transform 0.16s ease;

  &:not(&--selected):not(:disabled):hover {
    background: color-mix(in srgb, currentColor 8%, transparent);
  }

  &:not(:disabled):active {
    transform: scale(0.96);
  }

  &:disabled {
    cursor: default;
    opacity: 0.3;
  }

  &--empty {
    visibility: hidden;
  }

  &--today:not(&--selected) {
    box-shadow: inset 0 0 0 1px var(--vx-datetimepicker-accent, $primary);
  }

  &--selected {
    background: var(--vx-datetimepicker-accent, $primary);
    color: #fff;

    &:hover {
      background: color-mix(in srgb, var(--vx-datetimepicker-accent, $primary) 85%, black);
    }
  }
}

.vx-datetimepicker__cell {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 34px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: inherit;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.16s ease, transform 0.16s ease;

  &:hover {
    background: color-mix(in srgb, currentColor 8%, transparent);
  }

  &:active {
    transform: scale(0.97);
  }

  &--today {
    box-shadow: inset 0 0 0 1px var(--vx-datetimepicker-accent, $primary);
  }
}

.vx-datetimepicker__time-cols {
  display: flex;
  gap: 6px;
}

.vx-datetimepicker__time-col {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow: hidden;
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

.vx-datetimepicker__time-list {
  display: flex;
  flex-direction: column;
  gap: 2px;

  max-height: 220px;
  overflow-y: auto;
  overflow-x: hidden;

  scrollbar-width: thin;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 999px;
    background: rgba(0, 0, 0, 0.2);
  }
}

.vx-datetimepicker__time-cell {
  flex-shrink: 0;
  min-height: 32px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  background: transparent;
  color: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.16s ease, color 0.16s ease, transform 0.16s ease;

  &:not(&--selected):hover {
    background: color-mix(in srgb, currentColor 8%, transparent);
  }

  &:active {
    transform: scale(0.98);
  }

  &--selected {
    background: var(--vx-datetimepicker-accent, $primary);
    color: #fff;

    &:hover {
      background: color-mix(in srgb, var(--vx-datetimepicker-accent, $primary) 85%, black);
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
  background: color-mix(in srgb, var(--vx-datetimepicker-accent, $primary) 12%, transparent);
  color: var(--vx-datetimepicker-accent, $primary);
  transition: background 0.18s ease, color 0.18s ease, opacity 0.18s ease, transform 0.18s ease;

  &:hover {
    background: color-mix(in srgb, var(--vx-datetimepicker-accent, $primary) 20%, transparent);
  }

  &:active {
    transform: scale(0.98);
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
    background: var(--vx-datetimepicker-accent, $primary);
    color: #fff;

    &:hover {
      background: color-mix(in srgb, var(--vx-datetimepicker-accent, $primary) 85%, black);
    }
  }
}

@media (max-width: 640px) {
  .vx-datetimepicker__panel {
    width: calc(100vw - 16px);
    max-width: calc(100vw - 16px);
    padding: 10px;
    border-radius: 14px;
  }

  .vx-datetimepicker__summary {
    padding: 10px;
  }

  .vx-datetimepicker__summary-main {
    font-size: 17px;
  }

  .vx-datetimepicker__footer {
    flex-direction: column;
  }
}

@media (prefers-reduced-motion: reduce) {
  .vx-datetimepicker__icon-btn,
  .vx-datetimepicker__clear,
  .vx-datetimepicker__tab,
  .vx-datetimepicker__nav-btn,
  .vx-datetimepicker__month,
  .vx-datetimepicker__day,
  .vx-datetimepicker__cell,
  .vx-datetimepicker__time-cell,
  .vx-datetimepicker__footer-btn {
    transition-duration: 0.01ms !important;
  }
}
</style>