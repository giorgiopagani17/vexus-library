import { computed, ref, type ComputedRef, type Ref } from 'vue'

/**
 * Composable condiviso da tutti i componenti "campo" del design system
 * (VxInput, VxDate, VxTime, VxColorPicker, ecc).
 *
 * Centralizza:
 *
 * - generazione di un id stabile per istanza (label <-> field)
 * - stato di focus
 * - calcolo delle CSS custom properties (colori, radius)
 *   a partire dalle prop `color` / `colors` / `radius`
 * - dimensione icona risolta in base a `size` / `iconSize`
 *
 * Qualunque nuovo componente "campo" dovrebbe passare da qui invece di
 * reimplementare id/focus/cssVars da zero, per restare coerente
 * con VxInput e con gli eventuali picker futuri.
 */

export interface FieldSizeObject {
  preset?: string
  iconSize?: number
}

export type FieldSize = string | FieldSizeObject | number

export interface FieldColors {
  background?: string
  text?: string
  icon?: string
  border?: string
  focusBorder?: string
  focusShadow?: string
  placeholder?: string
}

export interface FieldChromeProps {
  color?: string
  colors?: FieldColors
  radius?: string | number
  size?: FieldSize
  iconSize?: number
}

export type CssVars = Record<string, string>


export interface FieldChrome {
  fieldId: string
  isFocused: Ref<boolean>
  resolvedIconSize: ComputedRef<number>
  cssVars: ComputedRef<CssVars>
  onFocus: () => void
  onBlur: () => void
}


export function useFieldChrome(
  props: FieldChromeProps,
  prefix = 'vx-field'
): FieldChrome {

  const isFocused = ref(false)

  // id stabile per istanza, per collegare label e field
  const fieldId = `${prefix}-${Math.random()
    .toString(36)
    .slice(2, 9)}`


  const sizeToIcon: Record<string, number> = {
    sm: 14,
    md: 16,
    lg: 18,
  }


  const resolvedSize = computed<string>(() => {
    if (typeof props.size === 'string') {
      return props.size
    }

    if (
      typeof props.size === 'object' &&
      props.size !== null &&
      props.size.preset
    ) {
      return props.size.preset
    }

    return 'custom'
  })


  const resolvedIconSize = computed<number>(() => {
    if (props.iconSize != null) {
      return props.iconSize
    }

    if (
      typeof props.size === 'object' &&
      props.size !== null &&
      props.size.iconSize != null
    ) {
      return props.size.iconSize
    }

    return sizeToIcon[resolvedSize.value] ?? 16
  })


  function toCssSize(
    value?: string | number | null
  ): string | null {

    if (value === undefined || value === null) {
      return null
    }

    return typeof value === 'number'
      ? `${value}px`
      : value
  }


  const colorMap: Record<keyof FieldColors, string> = {
    background: '--input-bg',
    text: '--input-text',
    icon: '--input-icon',
    border: '--input-border',
    focusBorder: '--input-border-focus',
    focusShadow: '--input-shadow-focus',
    placeholder: '--input-placeholder',
  }


  const cssVars = computed<CssVars>(() => {

    const vars: CssVars = {}


    /**
     * `color` è un valore CSS libero:
     * imposta bordo/focus direttamente tramite CSS custom property.
     *
     * Viene sovrascritto da:
     * colors.focusBorder
     * colors.focusShadow
     * se presenti.
     */
    if (props.color) {
      vars['--input-border-focus'] = props.color

      vars['--input-shadow-focus'] =
        `color-mix(in srgb, ${props.color} 25%, transparent)`
    }


    const colors = props.colors ?? {}

    for (const key in colorMap) {

      const typedKey = key as keyof FieldColors
      const value = colors[typedKey]

      if (value) {
        vars[colorMap[typedKey]] = value
      }
    }


    const radius = toCssSize(props.radius)

    if (radius) {
      vars['--input-radius'] = radius
    }


    return vars
  })


  function onFocus(): void {
    isFocused.value = true
  }


  function onBlur(): void {
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