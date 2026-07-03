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
          :aria-label="resolvedLabels.openLabel"
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
          :placeholder="effectivePlaceholder"
          :maxlength="dateFormat.inputMaxLength.value"
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
          class="vx-datepicker__clear"
          tabindex="-1"
          :aria-label="resolvedLabels.clear"
          @mousedown.prevent
          @click="onClear"
        >
          <X :size="resolvedIconSize" />
        </button>
      </template>
    </VxFieldWrapper>

    <Transition name="vx-datepicker-fade">
      <div v-if="isOpen" class="vx-datepicker__panel" role="dialog" :aria-label="resolvedLabels.dialogLabel">
        <div class="vx-datepicker__nav">
          <button
            type="button"
            class="vx-datepicker__nav-btn"
            :aria-label="resolvedLabels.prev"
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
            :aria-label="resolvedLabels.next"
            @click="calendar.navNext"
          >
            <ChevronRight :size="16" />
          </button>
        </div>

        <!-- Vista giorni -->
        <template v-if="calendar.viewMode.value === 'days'">
          <div class="vx-datepicker__weekdays">
            <span v-for="(day, index) in calendar.weekDays.value" :key="`${day}-${index}`">{{ day }}</span>
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

        <!-- Vista mesi -->
        <div v-else-if="calendar.viewMode.value === 'months'" class="vx-datepicker__grid vx-datepicker__grid--months">
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

        <!-- Vista anni -->
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
            {{ resolvedLabels.today }}
          </button>
          <button
            v-if="clearable && modelValue"
            type="button"
            class="vx-datepicker__footer-btn vx-datepicker__footer-btn--ghost"
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
import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-vue-next'
import VxFieldWrapper from '@/Library/core/utils/Input/fieldWrapper.vue'
import { useDateFormat } from '@/Library/core/composables/Date/useDateFormat'
import { useCalendarGrid } from '@/Library/core/composables/Date/useCalendarGrid'
import { useClickOutside } from '@/Library/core/composables/useClickOutside'

// Dizionario di base per le stringhe dell'interfaccia, selezionato in base
// alla lingua (subtag) ricavata da `locale`. Può essere sovrascritto in
// tutto o in parte tramite la prop `labels`.
const BASE_LABELS = {
  it: {
    placeholder: 'Seleziona una data',
    clear: 'Cancella',
    today: 'Oggi',
    clearFooter: 'Pulisci',
    prev: 'Precedente',
    next: 'Successivo',
    dialogLabel: 'Seleziona una data',
    openLabel: 'Apri selezione data',
  },
  en: {
    placeholder: 'Select a date',
    clear: 'Clear',
    today: 'Today',
    clearFooter: 'Clear',
    prev: 'Previous',
    next: 'Next',
    dialogLabel: 'Select a date',
    openLabel: 'Open date picker',
  },
  fr: {
    placeholder: 'Sélectionnez une date',
    clear: 'Effacer',
    today: "Aujourd'hui",
    clearFooter: 'Effacer',
    prev: 'Précédent',
    next: 'Suivant',
    dialogLabel: 'Sélectionnez une date',
    openLabel: 'Ouvrir le sélecteur de date',
  },
  de: {
    placeholder: 'Datum auswählen',
    clear: 'Löschen',
    today: 'Heute',
    clearFooter: 'Löschen',
    prev: 'Zurück',
    next: 'Weiter',
    dialogLabel: 'Datum auswählen',
    openLabel: 'Datumsauswahl öffnen',
  },
  es: {
    placeholder: 'Selecciona una fecha',
    clear: 'Borrar',
    today: 'Hoy',
    clearFooter: 'Borrar',
    prev: 'Anterior',
    next: 'Siguiente',
    dialogLabel: 'Selecciona una fecha',
    openLabel: 'Abrir selector de fecha',
  },
}

const props = defineProps({
  /** Data selezionata, formato ISO 'YYYY-MM-DD' (v-model) */
  modelValue: {
    type: String,
    default: '',
  },
  /** Data minima selezionabile, formato ISO 'YYYY-MM-DD' */
  min: {
    type: String,
    default: '',
  },
  /** Data massima selezionabile, formato ISO 'YYYY-MM-DD' */
  max: {
    type: String,
    default: '',
  },
  /**
   * Locale BCP 47 usato per formattare la data mostrata, i nomi di mesi e
   * giorni, e per scegliere i testi di default dell'interfaccia (es. 'it-IT',
   * 'en-US', 'en-GB', 'fr-FR'...).
   */
  locale: {
    type: String,
    default: 'it-IT',
  },
  /**
   * Formato/maschera esplicito di visualizzazione e digitazione, con token
   * 'DD', 'MM', 'YYYY' e separatori a piacere (es. 'DD/MM/YYYY',
   * 'MM/DD/YYYY', 'YYYY-MM-DD'). Se omesso, viene dedotto da `locale`.
   */
  format: {
    type: String,
    default: '',
  },
  /**
   * Primo giorno della settimana nel calendario (0 = Domenica ... 6 = Sabato).
   * Se omesso, viene dedotto da `locale` (Lunedì per la maggior parte dei
   * locale, Domenica per 'en-US').
   */
  firstDayOfWeek: {
    type: Number,
    default: null,
  },
  /** Override puntuale dei testi dell'interfaccia (placeholder, bottoni, aria-label...) */
  labels: {
    type: Object,
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
  /** Posizione dell'icona del calendario nel campo: 'left' | 'right' */
  iconPosition: {
    type: String,
    default: 'right',
  },
  iconSize: {
    type: [Number, String],
    default: null,
  },
  /** Mostra una X per svuotare la data selezionata (nel campo e nel footer del pannello) */
  clearable: {
    type: Boolean,
    default: false,
  },
  /** Se omesso, viene usato il placeholder di default della lingua corrente */
  placeholder: {
    type: String,
    default: '',
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

// Nome dello slot dell'icona da valorizzare nel VxFieldWrapper, in base a
// `iconPosition` ('left' | 'right'). Prima era fissa su 'icon-right'.
const iconSlotName = computed(() => `icon-${props.iconPosition === 'left' ? 'left' : 'right'}`)

// ===== Localizzazione =====

const lang = computed(() => (props.locale || 'it').split('-')[0].toLowerCase())

const resolvedLabels = computed(() => ({
  ...(BASE_LABELS[lang.value] || BASE_LABELS.it),
  ...(props.labels || {}),
}))

const effectivePlaceholder = computed(() => props.placeholder || resolvedLabels.value.placeholder)

const resolvedFirstDayOfWeek = computed(() => {
  if (props.firstDayOfWeek !== null && props.firstDayOfWeek !== undefined) {
    return props.firstDayOfWeek
  }
  return props.locale.toLowerCase() === 'en-us' ? 0 : 1
})

// ===== Formato data (mask) e griglia calendario, via composable =====

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

function toggleOpen() {
  if (props.disabled || props.loading) return
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    calendar.resetToDate(selectedDate.value)
  }
}

useClickOutside(rootRef, () => {
  isOpen.value = false
})

// ===== Digitazione manuale della data =====

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

.vx-datepicker__panel {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 50;
  width: 260px;
  padding: 10px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: var(--vx-datepicker-panel-bg, #fff);
  color: var(--vx-datepicker-panel-text, #1e1e1e);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.14);
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
    box-shadow: inset 0 0 0 1px var(--vx-datepicker-accent, #7c3aed);
  }

  &--selected {
    background: var(--vx-datepicker-accent, #7c3aed);
    color: #fff;

    &:hover {
      background: color-mix(in srgb, var(--vx-datepicker-accent, #7c3aed) 85%, black);
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
    box-shadow: inset 0 0 0 1px var(--vx-datepicker-accent, #7c3aed);
  }

  &--selected {
    background: var(--vx-datepicker-accent, #7c3aed);
    color: #fff;

    &:hover {
      background: color-mix(in srgb, var(--vx-datepicker-accent, #7c3aed) 85%, black);
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
  background: color-mix(in srgb, var(--vx-datepicker-accent, #7c3aed) 12%, transparent);
  color: var(--vx-datepicker-accent, #7c3aed);

  &:hover {
    background: color-mix(in srgb, var(--vx-datepicker-accent, #7c3aed) 20%, transparent);
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

.vx-datepicker-fade-enter-active,
.vx-datepicker-fade-leave-active {
  transition: opacity 0.12s ease, transform 0.12s ease;
}

.vx-datepicker-fade-enter-from,
.vx-datepicker-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>