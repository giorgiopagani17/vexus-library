import { computed, ref } from 'vue'

/**
 * Composable condiviso da tutti i componenti "campo" del design system
 * (VxInput, VxDatePicker, VxTimePicker, VxColorPicker, ecc).
 *
 * Centralizza:
 * - generazione di un id stabile per instanza (label <-> field)
 * - stato di focus
 * - calcolo delle CSS custom properties (colori, radius) a partire
 *   dalle prop `color` / `colors` / `radius`
 * - dimensione icona risolta in base a `size` / `iconSize`
 *
 * Qualunque nuovo componente "campo" dovrebbe passare da qui invece di
 * reimplementare id/focus/cssVars da zero, per restare coerente con
 * VxInput e con gli eventuali picker futuri.
 *
 * @param {object} props - le prop del componente chiamante. Ci si
 *   aspetta che includa (tutte opzionali): color, colors, radius,
 *   size, iconSize
 * @param {string} [prefix='vx-field'] - prefisso usato per l'id generato
 */
export function useFieldChrome(props, prefix = 'vx-field') {
  const isFocused = ref(false)

  // id stabile per instanza, per collegare label e field
  const fieldId = `${prefix}-${Math.random().toString(36).slice(2, 9)}`

  const sizeToIcon = { sm: 14, md: 16, lg: 18 }
  const resolvedSize = computed(() => {
    if (typeof props.size === 'string') return props.size
    return props.size?.preset || 'custom'
  })
  const resolvedIconSize = computed(
    () => props.iconSize ?? (props.size && typeof props.size === 'object' ? props.size.iconSize : null) ?? sizeToIcon[resolvedSize.value] ?? 16
  )

  const toCssSize = (value) => {
    if (value === undefined || value === null) return null
    return typeof value === 'number' ? `${value}px` : value
  }

  const colorMap = {
    background: '--input-bg',
    text: '--input-text',
    border: '--input-border',
    focusBorder: '--input-border-focus',
    focusShadow: '--input-shadow-focus',
    placeholder: '--input-placeholder',
  }

  const cssVars = computed(() => {
    const vars = {}

    // `color` è sempre un valore CSS libero: imposta bordo/focus
    // direttamente via CSS custom property.
    // Viene sovrascritto da `colors.focusBorder`/`colors.focusShadow`
    // se presenti (v. sotto).
    if (props.color) {
      vars['--input-border-focus'] = props.color
      vars['--input-shadow-focus'] = `color-mix(in srgb, ${props.color} 25%, transparent)`
    }

    const c = props.colors || {}
    for (const key in colorMap) {
      const value = c[key]
      if (value) vars[colorMap[key]] = value
    }

    const radius = toCssSize(props.radius)
    if (radius) vars['--input-radius'] = radius

    return vars
  })

  function onFocus() {
    isFocused.value = true
  }

  function onBlur() {
    isFocused.value = false
  }

  return {
    fieldId,
    isFocused,
    resolvedIconSize,
    cssVars,
    onFocus,
    onBlur,
  }
}