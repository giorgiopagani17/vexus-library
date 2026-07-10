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
          aria-label="Open date and time range picker"
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
          :placeholder="placeholder"
          autocomplete="off"
          @focus="onFieldFocus($event, chromeFocus)"
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
          aria-label="Clear date and time range"
          @mousedown.prevent
          @click="onClear"
        >
          <X :size="14" />
        </button>
      </template>
    </VxFieldWrapper>

    <Transition name="vx-dtrange-fade">
      <div
        v-if="isOpen"
        ref="panelRef"
        class="vx-dtrange__panel"
        role="dialog"
        aria-label="Date and time range picker dialog"
        :style="panelStyle"
      >
        <div class="vx-dtrange__summary">
          <div class="vx-dtrange__summary-label">
            {{ summaryLabel }}
          </div>

          <div class="vx-dtrange__summary-grid">
            <div class="vx-dtrange__summary-card">
              <div class="vx-dtrange__summary-card-label">{{ startLabel }}</div>
              <div class="vx-dtrange__summary-card-main">
                {{ pendingStart ? dateFormat.formatDateWithTemplate(pendingStart) : emptyStartLabel }}
              </div>
              <div v-if="pendingStart" class="vx-dtrange__summary-card-sub">
                {{ timeFormat.formatTimeWithTemplate(pendingStartHour, pendingStartMinute) }}
              </div>
            </div>

            <div class="vx-dtrange__summary-sep" aria-hidden="true">→</div>

            <div class="vx-dtrange__summary-card">
              <div class="vx-dtrange__summary-card-label">{{ endLabel }}</div>
              <div class="vx-dtrange__summary-card-main">
                {{ pendingEnd ? dateFormat.formatDateWithTemplate(pendingEnd) : emptyEndLabel }}
              </div>
              <div v-if="pendingEnd" class="vx-dtrange__summary-card-sub">
                {{ timeFormat.formatTimeWithTemplate(pendingEndHour, pendingEndMinute) }}
              </div>
            </div>
          </div>
        </div>

        <div class="vx-dtrange__tabs" role="tablist" aria-label="Date and time range sections">
          <button
            id="vx-dtrange-tab-date"
            type="button"
            role="tab"
            class="vx-dtrange__tab"
            :class="{ 'vx-dtrange__tab--active': activeTab === 'date' }"
            :aria-selected="activeTab === 'date'"
            aria-controls="vx-dtrange-panel-date"
            @click="activeTab = 'date'"
          >
            {{ dateTabLabel }}
          </button>

          <button
            id="vx-dtrange-tab-time"
            type="button"
            role="tab"
            class="vx-dtrange__tab"
            :class="{ 'vx-dtrange__tab--active': activeTab === 'time' }"
            :aria-selected="activeTab === 'time'"
            aria-controls="vx-dtrange-panel-time"
            @click="activeTab = 'time'"
          >
            {{ timeTabLabel }}
          </button>
        </div>

        <div
          v-show="activeTab === 'date'"
          id="vx-dtrange-panel-date"
          role="tabpanel"
          aria-labelledby="vx-dtrange-tab-date"
          class="vx-dtrange__tabpanel"
        >
          <div class="vx-dtrange__nav">
            <button
              type="button"
              class="vx-dtrange__nav-btn"
              aria-label="Previous month"
              @click="calendar.navPrev"
            >
              <ChevronLeft :size="16" />
            </button>

            <button type="button" class="vx-dtrange__month" @click="calendar.onHeaderClick">
              {{ calendar.headerLabel.value }}
            </button>

            <button
              type="button"
              class="vx-dtrange__nav-btn"
              aria-label="Next month"
              @click="calendar.navNext"
            >
              <ChevronRight :size="16" />
            </button>
          </div>

          <template v-if="calendar.viewMode.value === 'days'">
            <div class="vx-dtrange__weekdays">
              <span v-for="(day, index) in calendar.weekDays.value" :key="`${day}-${index}`">
                {{ day }}
              </span>
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
        </div>

        <div
          v-show="activeTab === 'time'"
          id="vx-dtrange-panel-time"
          role="tabpanel"
          aria-labelledby="vx-dtrange-tab-time"
          class="vx-dtrange__tabpanel"
        >
          <div class="vx-dtrange__time-switch" role="tablist" aria-label="Start and end time panels">
            <button
              id="vx-dtrange-time-tab-start"
              type="button"
              role="tab"
              class="vx-dtrange__time-switch-btn"
              :class="{ 'vx-dtrange__time-switch-btn--active': activeTimeTab === 'start' }"
              :aria-selected="activeTimeTab === 'start'"
              aria-controls="vx-dtrange-time-panel-start"
              @click="activeTimeTab = 'start'"
            >
              {{ startLabel }}
            </button>

            <button
              id="vx-dtrange-time-tab-end"
              type="button"
              role="tab"
              class="vx-dtrange__time-switch-btn"
              :class="{ 'vx-dtrange__time-switch-btn--active': activeTimeTab === 'end' }"
              :aria-selected="activeTimeTab === 'end'"
              aria-controls="vx-dtrange-time-panel-end"
              @click="activeTimeTab = 'end'"
            >
              {{ endLabel }}
            </button>
          </div>

          <div class="vx-dtrange__time-panels">
            <section
              id="vx-dtrange-time-panel-start"
              role="tabpanel"
              aria-labelledby="vx-dtrange-time-tab-start"
              class="vx-dtrange__time-panel vx-dtrange__time-panel--start"
              :class="{
                'vx-dtrange__time-panel--disabled': !pendingStart,
                'vx-dtrange__time-panel--mobile-hidden': activeTimeTab !== 'start',
              }"
            >
              <div class="vx-dtrange__time-panel-title">
                <Clock :size="13" />
                <span>{{ startLabel }}</span>
              </div>

              <div v-if="pendingStart" class="vx-dtrange__time-row">
                <div class="vx-dtrange__time-col">
                  <div class="vx-dtrange__time-subtitle">{{ startHourLabel }}</div>
                  <div class="vx-dtrange__time-list">
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
                  <div class="vx-dtrange__time-subtitle">{{ startMinuteLabel }}</div>
                  <div class="vx-dtrange__time-list">
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

              <div v-else class="vx-dtrange__time-empty">
                {{ selectStartFirstLabel }}
              </div>
            </section>

            <section
              id="vx-dtrange-time-panel-end"
              role="tabpanel"
              aria-labelledby="vx-dtrange-time-tab-end"
              class="vx-dtrange__time-panel vx-dtrange__time-panel--end"
              :class="{
                'vx-dtrange__time-panel--disabled': !pendingEnd,
                'vx-dtrange__time-panel--mobile-hidden': activeTimeTab !== 'end',
              }"
            >
              <div class="vx-dtrange__time-panel-title">
                <Clock :size="13" />
                <span>{{ endLabel }}</span>
              </div>

              <div v-if="pendingEnd" class="vx-dtrange__time-row">
                <div class="vx-dtrange__time-col">
                  <div class="vx-dtrange__time-subtitle">{{ endHourLabel }}</div>
                  <div class="vx-dtrange__time-list">
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
                  <div class="vx-dtrange__time-subtitle">{{ endMinuteLabel }}</div>
                  <div class="vx-dtrange__time-list">
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

              <div v-else class="vx-dtrange__time-empty">
                {{ selectEndFirstLabel }}
              </div>
            </section>
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
            {{ clearFooterLabel }}
          </button>

          <button
            type="button"
            class="vx-dtrange__footer-btn vx-dtrange__footer-btn--primary"
            :disabled="!pendingStart || !pendingEnd"
            @click="confirmSelection"
          >
            {{ confirmLabel }}
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
import { useFloatingPanel } from '@/Library/core/composables/Input/useFloatingPanel'
import { useCloseWhenReferenceHidden } from '@/Library/core/composables/Input/useCloseWhenReferenceHidden'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ start: '', end: '' }),
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
  timeFormat: {
    type: String,
    default: 'HH:mm',
  },
  separator: {
    type: String,
    default: ' ',
  },
  minuteStep: {
    type: Number,
    default: 5,
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
    default: 'Select a date and time range',
  },
  rangeSeparator: {
    type: String,
    default: '-',
  },
  clearFooterLabel: {
    type: String,
    default: 'Clear',
  },
  confirmLabel: {
    type: String,
    default: 'Confirm',
  },
  startHourLabel: {
    type: String,
    default: 'Hours',
  },
  startMinuteLabel: {
    type: String,
    default: 'Minutes',
  },
  endHourLabel: {
    type: String,
    default: 'Hours',
  },
  endMinuteLabel: {
    type: String,
    default: 'Minutes',
  },
  dateTabLabel: {
    type: String,
    default: 'Date',
  },
  timeTabLabel: {
    type: String,
    default: 'Time',
  },
  summaryLabel: {
    type: String,
    default: 'Selected range',
  },
  startLabel: {
    type: String,
    default: 'Start',
  },
  endLabel: {
    type: String,
    default: 'End',
  },
  emptyStartLabel: {
    type: String,
    default: 'Select start',
  },
  emptyEndLabel: {
    type: String,
    default: 'Select end',
  },
  selectStartFirstLabel: {
    type: String,
    default: 'Select the start date first',
  },
  selectEndFirstLabel: {
    type: String,
    default: 'Select the end date first',
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

const emit = defineEmits(['update:modelValue', 'change', 'clear', 'focus', 'blur'])

const rootRef = ref(null)
const panelRef = ref(null)
const isOpen = ref(false)
const hoverDate = ref(null)
const activeTab = ref('date')
const activeTimeTab = ref('start')

const { panelStyle } = useFloatingPanel(rootRef, panelRef, isOpen, {
  gap: 6,
  viewportPadding: 8,
})

useCloseWhenReferenceHidden(rootRef, isOpen, () => {
  isOpen.value = false
})

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

function parseModelField(value) {
  if (!value) return null
  const [datePart, timePart] = value.split(props.separator)
  const date = dateFormat.parseISO(datePart)
  if (!date) return null
  const hm = timeFormat.parseHM(timePart || '00:00')
  return { date, hour: hm ? hm.hour : 0, minute: hm ? hm.minute : 0 }
}

function serializeField(date, hour, minute) {
  if (!date) return ''
  return `${dateFormat.toISO(date)}${props.separator}${timeFormat.toHM(hour, minute)}`
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
  const minDate = pendingStart.value && rangeEnd && pendingStart.value < rangeEnd ? pendingStart.value : rangeEnd
  const maxDate = pendingStart.value && rangeEnd && pendingStart.value < rangeEnd ? rangeEnd : pendingStart.value
  const inRange = pendingStart.value && rangeEnd && date > minDate && date < maxDate

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
    activeTimeTab.value = 'start'
    return
  }

  if (date < pendingStart.value) {
    pendingEnd.value = pendingStart.value
    pendingStart.value = date
  } else {
    pendingEnd.value = date
  }

  activeTab.value = 'time'
  activeTimeTab.value = 'start'
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
  activeTimeTab.value = 'start'
  emit('update:modelValue', { start: '', end: '' })
  emit('clear')
}

function openPicker() {
  if (props.disabled || props.loading) return
  isOpen.value = true
  activeTab.value = 'date'
  activeTimeTab.value = 'start'
  calendar.resetToDate(startParsed.value?.date ?? endParsed.value?.date ?? new Date())
  pendingStart.value = startParsed.value?.date ?? null
  pendingEnd.value = endParsed.value?.date ?? null
  pendingStartHour.value = startParsed.value?.hour ?? 9
  pendingStartMinute.value = startParsed.value?.minute ?? 0
  pendingEndHour.value = endParsed.value?.hour ?? 18
  pendingEndMinute.value = endParsed.value?.minute ?? 0
}

function onFieldFocus(event, chromeFocus) {
  openPicker()
  chromeFocus?.(event)
  emit('focus', event)
}

useClickOutside(rootRef, () => {
  isOpen.value = false
})

function displayFieldValue(parsed) {
  if (!parsed) return ''
  return `${dateFormat.formatDateWithTemplate(parsed.date)}${props.separator}${timeFormat.formatTimeWithTemplate(parsed.hour, parsed.minute)}`
}

const displayValue = computed(() => {
  const start = displayFieldValue(startParsed.value)
  const end = displayFieldValue(endParsed.value)
  if (start && end) return `${start} ${props.rangeSeparator} ${end}`
  return start || end || ''
})

const inputValue = ref(displayValue.value)

watch(
  () => [props.modelValue?.start, props.modelValue?.end],
  () => {
    inputValue.value = displayValue.value
    pendingStart.value = startParsed.value?.date ?? null
    pendingEnd.value = endParsed.value?.date ?? null
    pendingStartHour.value = startParsed.value?.hour ?? 9
    pendingStartMinute.value = startParsed.value?.minute ?? 0
    pendingEndHour.value = endParsed.value?.hour ?? 18
    pendingEndMinute.value = endParsed.value?.minute ?? 0
  }
)

const rangeSeparatorPattern = /\s*(?:→|—|–|-|to)\s*/i

function parseFieldRaw(raw) {
  const dateDigitsLen = dateFormat.formatTemplate.value.reduce((t, s) => t + (s.type !== 'literal' ? s.length : 0), 0)
  const timeDigitsLen = timeFormat.formatTemplate.value.reduce((t, s) => t + (s.type !== 'literal' ? s.length : 0), 0)

  const digits = raw.replace(/\D/g, '')
  const dateDigits = digits.slice(0, dateDigitsLen)
  const timeDigits = digits.slice(dateDigitsLen, dateDigitsLen + timeDigitsLen)

  const { day, month, year } = dateFormat.parseTemplateDigits(dateDigits)
  if (!day?.complete || !month?.complete || !year?.complete || String(year.value).length < 4) return null

  const date = new Date(year.value, month.value - 1, day.value)
  if (
    date.getFullYear() !== year.value ||
    date.getMonth() !== month.value - 1 ||
    date.getDate() !== day.value
  ) {
    return null
  }

  if (isDayDisabled(date)) return null

  const { hour, minute } = timeFormat.parseTemplateDigits(timeDigits)
  const h = hour?.complete ? Math.min(hour.value, 23) : 0
  const m = minute?.complete ? Math.min(minute.value, 59) : 0

  return { date, hour: h, minute: m }
}

function parseRangeText(raw) {
  const parts = raw
    .split(rangeSeparatorPattern)
    .map((part) => part.trim())
    .filter(Boolean)

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
  emit('blur', event)
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

    .vx-dtrange__field {
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
  z-index: 50;
  width: 560px;
  max-width: calc(100vw - 16px);
  padding: 12px;
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: var(--vx-dtrange-panel-bg, #fff);
  color: var(--vx-dtrange-panel-text, #1e1e1e);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.14);
  overflow: hidden;
  box-sizing: border-box;
}

.vx-dtrange__summary {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
  padding: 12px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--vx-dtrange-accent, #7c3aed) 10%, transparent);
  color: var(--vx-dtrange-accent, #7c3aed);
}

.vx-dtrange__summary-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.72;
}

.vx-dtrange__summary-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  gap: 10px;
  align-items: center;
}

.vx-dtrange__summary-card {
  min-width: 0;
}

.vx-dtrange__summary-card-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.72;
  margin-bottom: 4px;
}

.vx-dtrange__summary-card-main {
  font-size: 17px;
  line-height: 1.15;
  font-weight: 700;
  color: inherit;
  word-break: break-word;
}

.vx-dtrange__summary-card-sub {
  margin-top: 4px;
  font-size: 13px;
  font-weight: 700;
  opacity: 0.88;
}

.vx-dtrange__summary-sep {
  font-size: 16px;
  font-weight: 800;
  opacity: 0.8;
}

.vx-dtrange__tabs {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
  margin-bottom: 10px;
}

.vx-dtrange__tab {
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
  transition: background 0.12s ease, color 0.12s ease, opacity 0.12s ease;

  &:hover {
    opacity: 1;
    background: color-mix(in srgb, currentColor 8%, transparent);
  }

  &--active {
    opacity: 1;
    background: color-mix(in srgb, var(--vx-dtrange-accent, #7c3aed) 14%, transparent);
    color: var(--vx-dtrange-accent, #7c3aed);
  }
}

.vx-dtrange__tabpanel {
  min-width: 0;
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
  height: 34px;
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

.vx-dtrange__time-switch {
  display: none;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
  margin-bottom: 10px;
}

.vx-dtrange__time-switch-btn {
  min-width: 0;
  border: none;
  border-radius: 10px;
  padding: 8px 10px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  background: transparent;
  color: inherit;
  opacity: 0.72;
  transition: background 0.12s ease, color 0.12s ease, opacity 0.12s ease;

  &:hover {
    opacity: 1;
    background: color-mix(in srgb, currentColor 8%, transparent);
  }

  &--active {
    opacity: 1;
    background: color-mix(in srgb, var(--vx-dtrange-accent, #7c3aed) 14%, transparent);
    color: var(--vx-dtrange-accent, #7c3aed);
  }
}

.vx-dtrange__time-panels {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.vx-dtrange__time-panel {
  min-width: 0;
  padding: 10px;
  border-radius: 12px;
  background: color-mix(in srgb, currentColor 4%, transparent);
  border: 1px solid rgba(0, 0, 0, 0.06);

  &--disabled {
    opacity: 0.55;
  }
}

.vx-dtrange__time-panel-title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  opacity: 0.72;
}

.vx-dtrange__time-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.vx-dtrange__time-col {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.vx-dtrange__time-subtitle {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  opacity: 0.65;
}

.vx-dtrange__time-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 200px;
  overflow-y: auto;
  padding-right: 2px;
  scrollbar-width: thin;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.15);
    border-radius: 4px;
  }
}

.vx-dtrange__time-cell {
  min-height: 32px;
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

.vx-dtrange__time-empty {
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  opacity: 0.55;
  padding: 8px;
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
  padding: 8px 10px;
  font-size: 12.5px;
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

@media (max-width: 720px) {
  .vx-dtrange__panel {
    width: calc(100vw - 16px);
    max-width: calc(100vw - 16px);
    padding: 10px;
    border-radius: 14px;
  }

  .vx-dtrange__summary-grid {
    grid-template-columns: 1fr;
  }

  .vx-dtrange__summary-sep {
    display: none;
  }

  .vx-dtrange__time-switch {
    display: grid;
  }

  .vx-dtrange__time-panels {
    grid-template-columns: 1fr;
  }

  .vx-dtrange__time-panel--mobile-hidden {
    display: none;
  }

  .vx-dtrange__footer,
  .vx-dtrange__footer--two-buttons {
    grid-template-columns: 1fr;
  }
}
</style>