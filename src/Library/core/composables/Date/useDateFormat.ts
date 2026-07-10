import {
  computed,
  type ComputedRef,
  type Ref,
} from 'vue'


export type DateSegment =
  | {
      type: 'literal'
      value: string
    }
  | {
      type: 'day' | 'month' | 'year'
      length: number
    }


export interface ParsedDatePart {
  value: number
  complete: boolean
}


export interface ParsedTemplateDateDigits {
  day: ParsedDatePart | null
  month: ParsedDatePart | null
  year: ParsedDatePart | null
}


export interface UseDateFormatReturn {

  formatTemplate: ComputedRef<DateSegment[]>

  inputMaxLength: ComputedRef<number>

  formatDateWithTemplate: (
    date: Date | null | undefined
  ) => string

  parseTemplateDigits: (
    digits: string
  ) => ParsedTemplateDateDigits

  maskDigitsForInput: (
    digits: string
  ) => string

  parseISO: (
    value: string | null | undefined
  ) => Date | null

  toISO: (
    date: Date
  ) => string

  pad2: (
    value: number
  ) => string
}



/**
 * Gestisce formattazione e digitazione di una data.
 *
 * Token supportati:
 *
 * DD     -> giorno
 * MM     -> mese
 * YYYY   -> anno
 *
 * Se formatRef non è valorizzato,
 * genera automaticamente il template
 * dalla locale tramite Intl.
 */
export function useDateFormat(
  formatRef:
    | Ref<string | undefined>
    | ComputedRef<string | undefined>,

  localeRef:
    | Ref<string | undefined>
    | ComputedRef<string | undefined>
): UseDateFormatReturn {



  function pad2(
    value: number
  ): string {

    return String(value).padStart(2, '0')
  }



  function buildTemplateFromString(
    str: string
  ): DateSegment[] {

    const tokenRe = /DD|MM|YYYY/g

    const segments: DateSegment[] = []

    let lastIndex = 0

    let match: RegExpExecArray | null



    while ((match = tokenRe.exec(str)) !== null) {


      if (match.index > lastIndex) {

        segments.push({
          type: 'literal',
          value: str.slice(
            lastIndex,
            match.index
          ),
        })

      }



      const token = match[0]


      segments.push({

        type:
          token === 'DD'
            ? 'day'
            : token === 'MM'
              ? 'month'
              : 'year',

        length: token.length,
      })



      lastIndex = tokenRe.lastIndex
    }



    if (lastIndex < str.length) {

      segments.push({
        type: 'literal',
        value: str.slice(lastIndex),
      })

    }



    return segments
  }





  const formatTemplate = computed<DateSegment[]>(() => {


    if (formatRef.value) {

      return buildTemplateFromString(
        formatRef.value
      )

    }



    const parts =
      new Intl.DateTimeFormat(
        localeRef.value || undefined,
        {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }
      )
      .formatToParts(
        new Date(2020, 0, 15)
      )



    return parts
      .filter(
        part =>
          part.type !== 'era' &&
          part.type !== 'unknown'
      )
      .map<DateSegment>((part) => {


        switch (part.type) {

          case 'day':

            return {
              type: 'day',
              length: 2,
            }


          case 'month':

            return {
              type: 'month',
              length: 2,
            }


          case 'year':

            return {
              type: 'year',
              length: part.value.length,
            }


          default:

            return {
              type: 'literal',
              value: part.value,
            }

        }

      })
  })





  const inputMaxLength = computed<number>(() =>

    formatTemplate.value.reduce(
      (total, segment) => {


        if (segment.type === 'literal') {

          return total + segment.value.length

        }


        return total + segment.length

      },
      0
    )

  )





  function formatDateWithTemplate(
    date: Date | null | undefined
  ): string {


    if (!date) {
      return ''
    }



    return formatTemplate.value

      .map((segment) => {


        switch (segment.type) {


          case 'day':

            return pad2(
              date.getDate()
            )



          case 'month':

            return pad2(
              date.getMonth() + 1
            )



          case 'year':

            return String(
              date.getFullYear()
            )
            .padStart(
              segment.length,
              '0'
            )



          case 'literal':

            return segment.value

        }

      })

      .join('')
  }





  function parseTemplateDigits(
    digits: string
  ): ParsedTemplateDateDigits {


    let cursor = 0


    let day: ParsedDatePart | null = null

    let month: ParsedDatePart | null = null

    let year: ParsedDatePart | null = null





    for (const segment of formatTemplate.value) {


      if (segment.type === 'literal') {
        continue
      }



      const chunk = digits.slice(
        cursor,
        cursor + segment.length
      )


      cursor += chunk.length



      if (!chunk) {
        continue
      }



      const parsed: ParsedDatePart = {

        value: Number(chunk),

        complete:
          chunk.length === segment.length,

      }



      switch (segment.type) {


        case 'day':
          day = parsed
          break



        case 'month':
          month = parsed
          break



        case 'year':
          year = parsed
          break

      }

    }



    return {
      day,
      month,
      year,
    }

  }





  function maskDigitsForInput(
    digits: string
  ): string {


    const {
      day,
      month,
      year,

    } = parseTemplateDigits(digits)



    if (
      day?.complete &&
      day.value > 31
    ) {

      day.value = 31

    }



    if (
      month?.complete &&
      month.value > 12
    ) {

      month.value = 12

    }





    let cursor = 0

    let result = ''





    for (const segment of formatTemplate.value) {



      if (segment.type === 'literal') {


        if (cursor < digits.length) {

          result += segment.value

        }


        continue

      }





      const source =

        segment.type === 'day'
          ? day
          : segment.type === 'month'
            ? month
            : year





      if (!source) {
        break
      }





      const chunkDigits = digits.slice(

        cursor,

        cursor + segment.length

      )



      cursor += chunkDigits.length





      result += source.complete

        ? pad2(source.value)
            .slice(-segment.length)

        : chunkDigits

    }





    return result

  }





  function parseISO(
    value: string | null | undefined
  ): Date | null {


    if (!value) {
      return null
    }



    const [
      year,
      month,
      day,

    ] = value
      .split('-')
      .map(Number)





    if (
      !year ||
      !month ||
      !day
    ) {

      return null

    }





    return new Date(
      year,
      month - 1,
      day
    )

  }





  function toISO(
    date: Date
  ): string {


    const year =
      date.getFullYear()


    const month =
      pad2(
        date.getMonth() + 1
      )


    const day =
      pad2(
        date.getDate()
      )



    return `${year}-${month}-${day}`

  }





  return {

    formatTemplate,

    inputMaxLength,

    formatDateWithTemplate,

    parseTemplateDigits,

    maskDigitsForInput,

    parseISO,

    toISO,

    pad2,

  }

}