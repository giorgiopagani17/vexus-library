export const propsColumns = [
  { key: 'name', label: 'Prop', class: 'prop-name' },
  { key: 'type', label: 'Tipo', class: 'prop-type' },
  { key: 'default', label: 'Default', class: 'prop-default' },
  { key: 'desc', label: 'Descrizione', class: 'prop-desc' }
]

export const propsRows = [
  {
    name: 'variant',
    type: "'solid' | 'outline' | 'ghost' | 'text'",
    default: "'solid'",
    desc: 'Stile base del bottone'
  },
  {
    name: 'color',
    type: "'primary' | 'secondary' | 'positive' | 'negative' | 'warning' | 'info' | string",
    default: "'primary'",
    desc: "Palette colore del bottone. Oltre ai 6 token predefiniti, accetta un valore CSS custom qualsiasi ('#7c3aed', 'rgb(...)', 'var(--mio-colore)')"
  },
  {
    name: 'size',
    type: "'sm' | 'md' | 'lg'",
    default: "'md'",
    desc: 'Dimensione del bottone'
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    desc: 'Disabilita il bottone'
  },
  {
    name: 'loading',
    type: 'boolean',
    default: 'false',
    desc: 'Mostra spinner e blocca interazione'
  },
  {
    name: 'block',
    type: 'boolean',
    default: 'false',
    desc: 'Full width'
  },
  {
    name: 'pill',
    type: 'boolean',
    default: 'false',
    desc: 'Bordo completamente arrotondato'
  },
  {
    name: 'radius',
    type: 'number | string',
    default: 'null',
    desc: 'Override border-radius'
  },
  {
    name: 'icon',
    type: 'Component | Function | null',
    default: 'null',
    desc: 'Icona principale'
  },
  {
    name: 'iconPosition',
    type: "'left' | 'right'",
    default: "'left'",
    desc: 'Posizione icona'
  },
  {
    name: 'iconSize',
    type: 'number | string',
    default: 'auto',
    desc: 'Dimensione icona'
  },
  {
    name: 'colors',
    type: '{ background?, text?, border?, hoverBackground?, hoverText?, hoverBorder?, shadow? }',
    default: 'null',
    desc: "Override completo dei colori, scavalca `color`. Ogni chiave accetta un colore CSS ('#fff', 'rgba(...)'), una custom property ('var(--mio-colore)') oppure un nome token della palette ('primary', 'secondary', ...)"
  },
  {
    name: 'tag',
    type: 'string | object | function',
    default: "'button'",
    desc: 'Elemento root renderizzato'
  }
]