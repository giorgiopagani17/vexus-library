import { computed } from 'vue'

/**
 * Gestisce la maschera di formattazione/digitazione di una data.
 * - Se `formatRef` ha un valore (es. 'DD/MM/YYYY'), viene usato quello.
 * - Altrimenti l'ordine giorno/mese/anno e i separatori vengono dedotti
 *   automaticamente da `localeRef` tramite Intl.
 *
 * @param {import('vue').Ref<string>|import('vue').ComputedRef<string>} formatRef  prop `format`
 * @param {import('vue').Ref<string>|import('vue').ComputedRef<string>} localeRef  prop `locale`
 */
export function useDateFormat(formatRef, localeRef) {
  function pad2(n) {
    return String(n).padStart(2, '0')
  }

  function buildTemplateFromString(str) {
    const tokenRe = /DD|MM|YYYY/g
    const segments = []
    let lastIndex = 0
    let match

    while ((match = tokenRe.exec(str))) {
      if (match.index > lastIndex) {
        segments.push({ type: 'literal', value: str.slice(lastIndex, match.index) })
      }
      const token = match[0]
      segments.push({
        type: token === 'DD' ? 'day' : token === 'MM' ? 'month' : 'year',
        length: token.length,
      })
      lastIndex = tokenRe.lastIndex
    }
    if (lastIndex < str.length) {
      segments.push({ type: 'literal', value: str.slice(lastIndex) })
    }
    return segments
  }

  const formatTemplate = computed(() => {
    if (formatRef.value) return buildTemplateFromString(formatRef.value)

    const parts = new Intl.DateTimeFormat(localeRef.value, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).formatToParts(new Date(2020, 0, 15))

    return parts
      .filter((p) => p.type !== 'era' && p.type !== 'unknown')
      .map((p) => {
        if (p.type === 'day') return { type: 'day', length: 2 }
        if (p.type === 'month') return { type: 'month', length: 2 }
        if (p.type === 'year') return { type: 'year', length: p.value.length }
        return { type: 'literal', value: p.value }
      })
  })

  const inputMaxLength = computed(() =>
    formatTemplate.value.reduce(
      (total, seg) => total + (seg.type === 'literal' ? seg.value.length : seg.length),
      0
    )
  )

  function formatDateWithTemplate(date) {
    if (!date) return ''
    return formatTemplate.value
      .map((seg) => {
        if (seg.type === 'day') return pad2(date.getDate())
        if (seg.type === 'month') return pad2(date.getMonth() + 1)
        if (seg.type === 'year') return String(date.getFullYear()).padStart(seg.length, '0')
        return seg.value
      })
      .join('')
  }

  // Estrae day/month/year dalle cifre digitate seguendo l'ordine del template.
  function parseTemplateDigits(digits) {
    let cursor = 0
    let day = null
    let month = null
    let year = null

    for (const seg of formatTemplate.value) {
      if (seg.type === 'literal') continue
      const chunk = digits.slice(cursor, cursor + seg.length)
      cursor += chunk.length
      if (!chunk) continue
      if (seg.type === 'day') day = { value: Number(chunk), complete: chunk.length === seg.length }
      if (seg.type === 'month') month = { value: Number(chunk), complete: chunk.length === seg.length }
      if (seg.type === 'year') year = { value: Number(chunk), complete: chunk.length === seg.length }
    }

    return { day, month, year }
  }

  // Formatta l'input mentre l'utente digita (clamp progressivo + separatori
  // letterali inseriti man mano che vengono "raggiunti").
  function maskDigitsForInput(digits) {
    const { day, month, year } = parseTemplateDigits(digits)
    if (day?.complete && day.value > 31) day.value = 31
    if (month?.complete && month.value > 12) month.value = 12

    let cursor = 0
    let result = ''
    for (const seg of formatTemplate.value) {
      if (seg.type === 'literal') {
        if (cursor < digits.length) result += seg.value
        continue
      }
      const source = seg.type === 'day' ? day : seg.type === 'month' ? month : year
      if (!source) break
      const chunkDigits = digits.slice(cursor, cursor + seg.length)
      cursor += chunkDigits.length
      result += source.complete ? pad2(source.value).slice(-seg.length) : chunkDigits
    }
    return result
  }

  function parseISO(value) {
    if (!value) return null
    const [y, m, d] = value.split('-').map(Number)
    if (!y || !m || !d) return null
    return new Date(y, m - 1, d)
  }

  function toISO(date) {
    const y = date.getFullYear()
    const m = pad2(date.getMonth() + 1)
    const d = pad2(date.getDate())
    return `${y}-${m}-${d}`
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