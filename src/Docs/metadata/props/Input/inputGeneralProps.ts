export const propsColumns = [
  { key: 'name', label: 'Prop', class: 'prop-name' },
  { key: 'type', label: 'Tipo', class: 'prop-type' },
  { key: 'default', label: 'Default', class: 'prop-default' },
  { key: 'desc', label: 'Descrizione', class: 'prop-desc' }
]

export const propsRows = [
  {
    name: 'modelValue',
    type: 'string | number | File | File[] | null',
    default: "''",
    desc: 'Valore del campo usato con v-model; per type="file" può essere un File o un array di File'
  },
  {
    name: 'type',
    type: "'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'file'",
    default: "'text'",
    desc: 'Tipo nativo dell’input, ignorato se tag è textarea'
  },
  {
    name: 'variant',
    type: "'outline' | 'ghost' | 'text'",
    default: "'outline'",
    desc: 'Stile visivo del campo'
  },
  {
    name: 'color',
    type: 'string',
    default: "'#7c3aed'",
    desc: "Colore del bordo e del focus ring. Accetta qualsiasi valore CSS valido ('#7c3aed', 'rgb(...)', 'rgba(...)', 'red', 'var(--mio-colore)')"
  },
  {
    name: 'size',
    type: "'sm' | 'md' | 'lg'",
    default: "'md'",
    desc: 'Dimensione del campo'
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    desc: 'Disabilita il campo'
  },
  {
    name: 'readonly',
    type: 'boolean',
    default: 'false',
    desc: 'Rende il campo non modificabile ma ancora selezionabile'
  },
  {
    name: 'loading',
    type: 'boolean',
    default: 'false',
    desc: 'Mostra spinner al posto del clear e disabilita il campo'
  },
  {
    name: 'block',
    type: 'boolean',
    default: 'false',
    desc: 'Occupa tutta la larghezza disponibile'
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
    desc: 'Override del border-radius'
  },
  {
    name: 'icon',
    type: 'Component | Function | null',
    default: 'null',
    desc: 'Componente icona usato se non passi gli slot custom'
  },
  {
    name: 'iconPosition',
    type: "'left' | 'right'",
    default: "'left'",
    desc: 'Posizione della prop `icon`'
  },
  {
    name: 'iconSize',
    type: 'number | string',
    default: 'null',
    desc: 'Override della dimensione icona'
  },
  {
    name: 'clearable',
    type: 'boolean',
    default: 'false',
    desc: 'Mostra una X per svuotare il campo quando contiene un valore'
  },
  {
    name: 'placeholder',
    type: 'string',
    default: "''",
    desc: 'Placeholder del campo'
  },
  {
    name: 'label',
    type: 'string',
    default: "''",
    desc: 'Etichetta sopra il campo'
  },
  {
    name: 'hint',
    type: 'string',
    default: "''",
    desc: 'Testo di aiuto sotto il campo'
  },
  {
    name: 'error',
    type: 'boolean',
    default: 'false',
    desc: 'Attiva lo stato di errore'
  },
  {
    name: 'errorMessage',
    type: 'string',
    default: "''",
    desc: 'Messaggio mostrato sotto il campo quando `error` è true'
  },
  {
    name: 'colors',
    type: '{ background?, text?, icon?, border?, focusBorder?, focusShadow?, placeholder? }',
    default: 'null',
    desc: "Override completo dei colori. Ogni chiave accetta qualsiasi colore CSS valido ('#fff', 'rgba(...)', 'red', 'var(--mio-colore)')"
  },
  {
    name: 'focusEffect',
    type: "'ring' | 'lift' | 'glow' | 'none' | 'custom'",
    default: "'ring'",
    desc: 'Effetto visivo applicato allo stato di focus'
  },
  {
    name: 'tag',
    type: "'input' | 'textarea'",
    default: "'input'",
    desc: 'Elemento renderizzato dal componente'
  },
  {
    name: 'spinners',
    type: 'boolean',
    default: 'true',
    desc: 'Mostra i pulsanti custom per type="number"'
  },
  {
    name: 'min',
    type: 'number | string | null',
    default: 'null',
    desc: 'Valore minimo per type="number"'
  },
  {
    name: 'max',
    type: 'number | string | null',
    default: 'null',
    desc: 'Valore massimo per type="number"'
  },
  {
    name: 'step',
    type: 'number | string',
    default: '1',
    desc: 'Incremento usato da type="number"'
  },
  {
    name: 'showPasswordToggle',
    type: 'boolean',
    default: 'true',
    desc: 'Mostra l’icona per rivelare o nascondere la password'
  },
  {
    name: 'autoValidate',
    type: 'boolean',
    default: 'true',
    desc: 'Valida automaticamente email, tel e url al blur'
  },
  {
    name: 'invalidMessage',
    type: 'string',
    default: "''",
    desc: 'Messaggio mostrato quando autoValidate rileva un formato non valido'
  },
  {
    name: 'accept',
    type: 'string',
    default: "''",
    desc: 'Lista di estensioni o mime type accettati da type="file"'
  },
  {
    name: 'multiple',
    type: 'boolean',
    default: 'false',
    desc: 'Consente di selezionare più file con type="file"'
  },
  {
    name: 'browseLabel',
    type: 'string',
    default: "'Scegli file'",
    desc: 'Testo del pulsante di selezione file'
  },
  {
    name: 'emptyLabel',
    type: 'string',
    default: "'Nessun file selezionato'",
    desc: 'Testo mostrato quando nessun file è stato selezionato'
  }
]