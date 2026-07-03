import { computed } from 'vue'

/**
 * Gestisce la maschera di formattazione/digitazione di un orario.
 * Token supportati: 'HH' (ore, 24h) e 'mm' (minuti). Default 'HH:mm'.
 * Analogo a useDateFormat ma per HH/mm invece di DD/MM/YYYY.
 *
 * @param {import('vue').Ref<string>|import('vue').ComputedRef<string>} formatRef  prop `format`
 */
export function useTimeFormat(formatRef) {
  function pad2(n) {
    return String(n).padStart(2, '0')
  }

  function buildTemplateFromString(str) {
    const tokenRe = /HH|mm/g
    const segments = []
    let lastIndex = 0
    let match

    while ((match = tokenRe.exec(str))) {
      if (match.index > lastIndex) {
        segments.push({ type: 'literal', value: str.slice(lastIndex, match.index) })
      }
      segments.push({ type: match[0] === 'HH' ? 'hour' : 'minute', length: 2 })
      lastIndex = tokenRe.lastIndex
    }
    if (lastIndex < str.length) {
      segments.push({ type: 'literal', value: str.slice(lastIndex) })
    }
    return segments
  }

  const formatTemplate = computed(() => buildTemplateFromString(formatRef.value || 'HH:mm'))

  const inputMaxLength = computed(() =>
    formatTemplate.value.reduce(
      (total, seg) => total + (seg.type === 'literal' ? seg.value.length : seg.length),
      0
    )
  )

  function formatTimeWithTemplate(hour, minute) {
    if (hour == null || minute == null) return ''
    return formatTemplate.value
      .map((seg) => {
        if (seg.type === 'hour') return pad2(hour)
        if (seg.type === 'minute') return pad2(minute)
        return seg.value
      })
      .join('')
  }

  function parseTemplateDigits(digits) {
    let cursor = 0
    let hour = null
    let minute = null

    for (const seg of formatTemplate.value) {
      if (seg.type === 'literal') continue
      const chunk = digits.slice(cursor, cursor + seg.length)
      cursor += chunk.length
      if (!chunk) continue
      if (seg.type === 'hour') hour = { value: Number(chunk), complete: chunk.length === seg.length }
      if (seg.type === 'minute') minute = { value: Number(chunk), complete: chunk.length === seg.length }
    }

    return { hour, minute }
  }

  function maskDigitsForInput(digits) {
    const { hour, minute } = parseTemplateDigits(digits)
    if (hour?.complete && hour.value > 23) hour.value = 23
    if (minute?.complete && minute.value > 59) minute.value = 59

    let cursor = 0
    let result = ''
    for (const seg of formatTemplate.value) {
      if (seg.type === 'literal') {
        if (cursor < digits.length) result += seg.value
        continue
      }
      const source = seg.type === 'hour' ? hour : minute
      if (!source) break
      const chunkDigits = digits.slice(cursor, cursor + seg.length)
      cursor += chunkDigits.length
      result += source.complete ? pad2(source.value).slice(-seg.length) : chunkDigits
    }
    return result
  }

  function parseHM(value) {
    if (!value) return null
    const [h, m] = value.split(':').map(Number)
    if (Number.isNaN(h) || Number.isNaN(m)) return null
    return { hour: h, minute: m }
  }

  function toHM(hour, minute) {
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