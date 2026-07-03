import { ref, computed } from 'vue'

/**
 * Navigazione e generazione della griglia calendario (giorni/mesi/anni),
 * estratta da VxDatePicker per essere riusata anche da DateTime/Range picker.
 *
 * @param {Object} options
 * @param {import('vue').ComputedRef<string>} options.locale
 * @param {import('vue').ComputedRef<number>} options.firstDayOfWeek
 * @param {Date|null} [options.initialDate]
 */
export function useCalendarGrid({ locale, firstDayOfWeek, initialDate = null }) {
  const viewMode = ref('days') // 'days' | 'months' | 'years'
  const viewDate = ref(initialDate ? new Date(initialDate) : new Date())
  const yearsPageStart = ref(viewDate.value.getFullYear() - 5)

  function capitalize(str) {
    return str.length ? str.charAt(0).toUpperCase() + str.slice(1) : str
  }

  const monthsShort = computed(() => {
    const fmt = new Intl.DateTimeFormat(locale.value, { month: 'short' })
    return Array.from({ length: 12 }, (_, i) => capitalize(fmt.format(new Date(2020, i, 1))))
  })

  const weekDays = computed(() => {
    const fmt = new Intl.DateTimeFormat(locale.value, { weekday: 'short' })
    // 5 gennaio 2020 è una Domenica: genero Dom..Sab e ruoto in base al
    // primo giorno della settimana desiderato.
    const sundayFirst = Array.from({ length: 7 }, (_, i) => capitalize(fmt.format(new Date(2020, 0, 5 + i))))
    const start = firstDayOfWeek.value
    return [...sundayFirst.slice(start), ...sundayFirst.slice(0, start)]
  })

  const monthLabel = computed(() =>
    new Intl.DateTimeFormat(locale.value, { month: 'long', year: 'numeric' }).format(viewDate.value)
  )

  const yearsList = computed(() => Array.from({ length: 12 }, (_, i) => yearsPageStart.value + i))

  const headerLabel = computed(() => {
    if (viewMode.value === 'years') return `${yearsPageStart.value} - ${yearsPageStart.value + 11}`
    if (viewMode.value === 'months') return String(viewDate.value.getFullYear())
    return capitalize(monthLabel.value)
  })

  const calendarDays = computed(() => {
    const year = viewDate.value.getFullYear()
    const month = viewDate.value.getMonth()
    const firstOfMonth = new Date(year, month, 1)
    const leadingBlank = (firstOfMonth.getDay() - firstDayOfWeek.value + 7) % 7
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const cells = []
    for (let i = 0; i < leadingBlank; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
    return cells
  })

  function shiftMonth(delta) {
    viewDate.value = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() + delta, 1)
  }

  function shiftYear(delta) {
    viewDate.value = new Date(viewDate.value.getFullYear() + delta, viewDate.value.getMonth(), 1)
  }

  function navPrev() {
    if (viewMode.value === 'days') shiftMonth(-1)
    else if (viewMode.value === 'months') shiftYear(-1)
    else yearsPageStart.value -= 12
  }

  function navNext() {
    if (viewMode.value === 'days') shiftMonth(1)
    else if (viewMode.value === 'months') shiftYear(1)
    else yearsPageStart.value += 12
  }

  function pickMonth(monthIndex) {
    viewDate.value = new Date(viewDate.value.getFullYear(), monthIndex, 1)
    viewMode.value = 'days'
  }

  function pickYear(year) {
    viewDate.value = new Date(year, viewDate.value.getMonth(), 1)
    viewMode.value = 'months'
  }

  function onHeaderClick() {
    if (viewMode.value === 'years') return
    yearsPageStart.value = viewDate.value.getFullYear() - 5
    viewMode.value = 'years'
  }

  function resetToDate(date) {
    viewDate.value = date ? new Date(date) : new Date()
    yearsPageStart.value = viewDate.value.getFullYear() - 5
    viewMode.value = 'days'
  }

  function isSameDay(a, b) {
    return (
      !!a &&
      !!b &&
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    )
  }

  function isToday(date) {
    return isSameDay(date, new Date())
  }

  function isCurrentMonth(m) {
    const now = new Date()
    return now.getFullYear() === viewDate.value.getFullYear() && now.getMonth() === m
  }

  function isCurrentYear(y) {
    return new Date().getFullYear() === y
  }

  return {
    viewMode,
    viewDate,
    yearsPageStart,
    monthsShort,
    weekDays,
    yearsList,
    headerLabel,
    calendarDays,
    navPrev,
    navNext,
    pickMonth,
    pickYear,
    onHeaderClick,
    resetToDate,
    isSameDay,
    isToday,
    isCurrentMonth,
    isCurrentYear,
    capitalize,
  }
}