import {
  computed,
  ref,
  type ComputedRef,
  type Ref,
} from 'vue'


export type CalendarViewMode =
  | 'days'
  | 'months'
  | 'years'


export interface UseCalendarGridOptions {

  locale:
    | Ref<string>
    | ComputedRef<string>

  firstDayOfWeek:
    | Ref<number>
    | ComputedRef<number>

  initialDate?: Date | null
}


export interface UseCalendarGridReturn {

  viewMode: Ref<CalendarViewMode>

  viewDate: Ref<Date>

  yearsPageStart: Ref<number>

  monthsShort: ComputedRef<string[]>

  weekDays: ComputedRef<string[]>

  yearsList: ComputedRef<number[]>

  headerLabel: ComputedRef<string>

  calendarDays: ComputedRef<(Date | null)[]>

  navPrev: () => void

  navNext: () => void

  pickMonth: (
    monthIndex: number
  ) => void

  pickYear: (
    year: number
  ) => void

  onHeaderClick: () => void

  resetToDate: (
    date?: Date | null
  ) => void

  isSameDay: (
    a: Date | null | undefined,
    b: Date | null | undefined
  ) => boolean

  isToday: (
    date: Date | null | undefined
  ) => boolean

  isCurrentMonth: (
    month: number
  ) => boolean

  isCurrentYear: (
    year: number
  ) => boolean

  capitalize: (
    value: string
  ) => string
}



/**
 * Navigazione e generazione della griglia calendario
 * (giorni/mesi/anni).
 *
 * Estratta da VxDatePicker per essere riusata
 * anche da DateTimePicker / RangePicker.
 */
export function useCalendarGrid(
  {
    locale,
    firstDayOfWeek,
    initialDate = null,
  }: UseCalendarGridOptions
): UseCalendarGridReturn {


  const viewMode = ref<CalendarViewMode>('days')


  const viewDate = ref<Date>(
    initialDate
      ? new Date(initialDate)
      : new Date()
  )


  const yearsPageStart = ref<number>(
    viewDate.value.getFullYear() - 5
  )



  function capitalize(
    value: string
  ): string {

    return value.length
      ? value.charAt(0).toUpperCase() + value.slice(1)
      : value
  }



  const monthsShort = computed<string[]>(() => {

    const formatter =
      new Intl.DateTimeFormat(
        locale.value,
        {
          month: 'short',
        }
      )


    return Array.from(
      {
        length: 12,
      },
      (_, index) =>
        capitalize(
          formatter.format(
            new Date(2020, index, 1)
          )
        )
    )
  })



  const weekDays = computed<string[]>(() => {

    const formatter =
      new Intl.DateTimeFormat(
        locale.value,
        {
          weekday: 'short',
        }
      )


    /**
     * 5 gennaio 2020 era domenica.
     * Genera Dom..Sab e ruota in base
     * al primo giorno settimana richiesto.
     */
    const sundayFirst =
      Array.from(
        {
          length: 7,
        },
        (_, index) =>
          capitalize(
            formatter.format(
              new Date(2020, 0, 5 + index)
            )
          )
      )


    const start =
      firstDayOfWeek.value


    return [
      ...sundayFirst.slice(start),
      ...sundayFirst.slice(0, start),
    ]
  })



  const monthLabel = computed<string>(() =>
    new Intl.DateTimeFormat(
      locale.value,
      {
        month: 'long',
        year: 'numeric',
      }
    )
    .format(viewDate.value)
  )



  const yearsList = computed<number[]>(() =>
    Array.from(
      {
        length: 12,
      },
      (_, index) =>
        yearsPageStart.value + index
    )
  )



  const headerLabel = computed<string>(() => {

    if (viewMode.value === 'years') {
      return `${yearsPageStart.value} - ${
        yearsPageStart.value + 11
      }`
    }


    if (viewMode.value === 'months') {
      return String(
        viewDate.value.getFullYear()
      )
    }


    return capitalize(
      monthLabel.value
    )
  })



  const calendarDays = computed<(Date | null)[]>(() => {

    const year =
      viewDate.value.getFullYear()

    const month =
      viewDate.value.getMonth()



    const firstOfMonth =
      new Date(
        year,
        month,
        1
      )


    const leadingBlank =
      (
        firstOfMonth.getDay()
        - firstDayOfWeek.value
        + 7
      ) % 7



    const daysInMonth =
      new Date(
        year,
        month + 1,
        0
      )
      .getDate()



    const cells: (Date | null)[] = []



    for (
      let i = 0;
      i < leadingBlank;
      i++
    ) {
      cells.push(null)
    }



    for (
      let day = 1;
      day <= daysInMonth;
      day++
    ) {
      cells.push(
        new Date(
          year,
          month,
          day
        )
      )
    }



    return cells
  })



  function shiftMonth(
    delta: number
  ): void {

    viewDate.value =
      new Date(
        viewDate.value.getFullYear(),
        viewDate.value.getMonth() + delta,
        1
      )
  }



  function shiftYear(
    delta: number
  ): void {

    viewDate.value =
      new Date(
        viewDate.value.getFullYear() + delta,
        viewDate.value.getMonth(),
        1
      )
  }



  function navPrev(): void {

    if (viewMode.value === 'days') {
      shiftMonth(-1)
      return
    }


    if (viewMode.value === 'months') {
      shiftYear(-1)
      return
    }


    yearsPageStart.value -= 12
  }



  function navNext(): void {

    if (viewMode.value === 'days') {
      shiftMonth(1)
      return
    }


    if (viewMode.value === 'months') {
      shiftYear(1)
      return
    }


    yearsPageStart.value += 12
  }



  function pickMonth(
    monthIndex: number
  ): void {

    viewDate.value =
      new Date(
        viewDate.value.getFullYear(),
        monthIndex,
        1
      )


    viewMode.value = 'days'
  }



  function pickYear(
    year: number
  ): void {

    viewDate.value =
      new Date(
        year,
        viewDate.value.getMonth(),
        1
      )


    viewMode.value = 'months'
  }



  function onHeaderClick(): void {

    if (viewMode.value === 'years') {
      return
    }


    yearsPageStart.value =
      viewDate.value.getFullYear() - 5


    viewMode.value = 'years'
  }



  function resetToDate(
    date?: Date | null
  ): void {

    viewDate.value =
      date
        ? new Date(date)
        : new Date()


    yearsPageStart.value =
      viewDate.value.getFullYear() - 5


    viewMode.value = 'days'
  }



  function isSameDay(
    a: Date | null | undefined,
    b: Date | null | undefined
  ): boolean {

    return Boolean(
      a &&
      b &&
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    )
  }



  function isToday(
    date: Date | null | undefined
  ): boolean {

    return isSameDay(
      date,
      new Date()
    )
  }



  function isCurrentMonth(
    month: number
  ): boolean {

    const now = new Date()


    return (
      now.getFullYear() ===
        viewDate.value.getFullYear()
      &&
      now.getMonth() === month
    )
  }



  function isCurrentYear(
    year: number
  ): boolean {

    return (
      new Date().getFullYear() === year
    )
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