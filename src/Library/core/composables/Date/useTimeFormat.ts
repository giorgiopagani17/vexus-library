import {
  computed,
  type ComputedRef,
  type Ref,
} from 'vue'


export type TimeSegment =
  | {
      type: 'literal'
      value: string
    }
  | {
      type: 'hour' | 'minute'
      length: number
    }


export interface ParsedTimePart {
  value: number
  complete: boolean
}


export interface ParsedTemplateDigits {
  hour: ParsedTimePart | null
  minute: ParsedTimePart | null
}


export interface ParsedHM {
  hour: number
  minute: number
}


export interface UseTimeFormatReturn {

  formatTemplate: ComputedRef<TimeSegment[]>

  inputMaxLength: ComputedRef<number>

  formatTimeWithTemplate: (
    hour: number | null | undefined,
    minute: number | null | undefined
  ) => string

  parseTemplateDigits: (
    digits: string
  ) => ParsedTemplateDigits

  maskDigitsForInput: (
    digits: string
  ) => string

  parseHM: (
    value: string | null | undefined
  ) => ParsedHM | null

  toHM: (
    hour: number,
    minute: number
  ) => string

  pad2: (
    value: number
  ) => string
}



/**
 * Gestisce formattazione e digitazione di un orario.
 *
 * Token supportati:
 *
 * HH -> ore
 * mm -> minuti
 *
 * Default:
 * HH:mm
 */
export function useTimeFormat(
  formatRef:
    | Ref<string | undefined>
    | ComputedRef<string | undefined>
): UseTimeFormatReturn {


  function pad2(
    value: number
  ): string {
    return String(value).padStart(2, '0')
  }



  function buildTemplateFromString(
    str: string
  ): TimeSegment[] {

    const tokenRe = /HH|mm/g

    const segments: TimeSegment[] = []

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


      segments.push({
        type:
          match[0] === 'HH'
            ? 'hour'
            : 'minute',
        length: 2,
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



  const formatTemplate = computed<TimeSegment[]>(() =>
    buildTemplateFromString(
      formatRef.value || 'HH:mm'
    )
  )



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



  function formatTimeWithTemplate(
    hour: number | null | undefined,
    minute: number | null | undefined
  ): string {

    if (
      hour == null ||
      minute == null
    ) {
      return ''
    }



    return formatTemplate.value
      .map((segment) => {

        switch (segment.type) {

          case 'hour':
            return pad2(hour)


          case 'minute':
            return pad2(minute)


          case 'literal':
            return segment.value
        }

      })
      .join('')
  }



  function parseTemplateDigits(
    digits: string
  ): ParsedTemplateDigits {

    let cursor = 0

    let hour: ParsedTimePart | null = null

    let minute: ParsedTimePart | null = null



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


      const parsed: ParsedTimePart = {
        value: Number(chunk),
        complete:
          chunk.length === segment.length,
      }



      switch (segment.type) {

        case 'hour':
          hour = parsed
          break


        case 'minute':
          minute = parsed
          break
      }
    }



    return {
      hour,
      minute,
    }
  }



  function maskDigitsForInput(
    digits: string
  ): string {

    const {
      hour,
      minute,
    } = parseTemplateDigits(digits)



    if (
      hour?.complete &&
      hour.value > 23
    ) {
      hour.value = 23
    }



    if (
      minute?.complete &&
      minute.value > 59
    ) {
      minute.value = 59
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
        segment.type === 'hour'
          ? hour
          : minute



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



  function parseHM(
    value: string | null | undefined
  ): ParsedHM | null {

    if (!value) {
      return null
    }



    const [
      hour,
      minute,
    ] = value
      .split(':')
      .map(Number)



    if (
      Number.isNaN(hour) ||
      Number.isNaN(minute)
    ) {
      return null
    }



    return {
      hour,
      minute,
    }
  }



  function toHM(
    hour: number,
    minute: number
  ): string {

    return `${pad2(hour)}:${pad2(minute)}`
  }



  return {
    formatTemplate,
    inputMaxLength,
    formatTimeWithTemplate,
    parseTemplateDigits,
    maskDigitsForInput,
    parseHM,
    toHM,
    pad2,
  }
}