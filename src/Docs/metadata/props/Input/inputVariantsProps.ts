// Stessa struttura di colonne di inputGeneralProps.js, riusata per ogni
// variante dedicata (VxDate, VxDateRange, VxDateTime,
// VxDateTimeRange, VxTime, VxColorPicker, VxRange). Tenerle separate
// da inputGeneralProps evita di mischiare prop di VxInput (type, spinners,
// accept, ecc.) che su queste varianti non esistono.
//
// `propsRows` (le prop di VxInput) NON è definito in questo file: vive in
// inputGeneralProps.js. Viene ri-esportato qui sotto solo per comodità, nel
// caso qualcosa importi tutto da un unico modulo — la fonte resta
// inputGeneralProps.js.

export const propsColumns = [
  { key: 'name', label: 'Prop', class: 'prop-name' },
  { key: 'type', label: 'Tipo', class: 'prop-type' },
  { key: 'default', label: 'Default', class: 'prop-default' },
  { key: 'desc', label: 'Descrizione', class: 'prop-desc' },
]

// Prop condivise da tutti i componenti "picker" (Date/DateRange/DateTime/
// DateTimeRange/Time): chrome visivo identico a VxInput, apertura/anchoring
// gestiti internamente da AnchoredOverlay (nessuna prop da configurare per
// quello: è automatico, vedi doc del componente AnchoredOverlay).
const sharedPickerRows = [
  {
    name: 'variant',
    type: "'outline' | 'ghost' | 'text'",
    default: "'outline'",
    desc: 'Stile visivo del campo',
  },
  {
    name: 'color',
    type: 'string',
    default: "'#7c3aed'",
    desc: 'Colore del bordo, del focus ring e degli elementi selezionati nel pannello',
  },
  {
    name: 'colors',
    type: '{ background?, text?, icon?, border?, focusBorder?, focusShadow?, placeholder? }',
    default: 'null',
    desc: 'Override completo dei colori del campo (non del pannello)',
  },
  {
    name: 'size',
    type: "'sm' | 'md' | 'lg'",
    default: "'md'",
    desc: 'Dimensione del campo',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    desc: 'Disabilita il campo e impedisce l’apertura del pannello',
  },
  {
    name: 'loading',
    type: 'boolean',
    default: 'false',
    desc: 'Mostra spinner e disabilita il campo',
  },
  {
    name: 'block',
    type: 'boolean',
    default: 'false',
    desc: 'Occupa tutta la larghezza disponibile',
  },
  {
    name: 'pill',
    type: 'boolean',
    default: 'false',
    desc: 'Bordo completamente arrotondato',
  },
  {
    name: 'radius',
    type: 'number | string',
    default: 'null',
    desc: 'Override del border-radius del campo',
  },
  {
    name: 'icon',
    type: 'Component | Function | null',
    default: 'null',
    desc: 'Icona del campo (di default il calendario/orologio/ecc. dedicato)',
  },
  {
    name: 'iconPosition',
    type: "'left' | 'right'",
    default: "'right'",
    desc: 'Posizione della prop `icon`',
  },
  {
    name: 'iconSize',
    type: 'number | string',
    default: 'null',
    desc: 'Override della dimensione icona',
  },
  {
    name: 'clearable',
    type: 'boolean',
    default: 'false',
    desc: 'Mostra una X per svuotare il valore quando presente',
  },
  {
    name: 'placeholder',
    type: 'string',
    default: 'varia per componente',
    desc: 'Placeholder del campo',
  },
  {
    name: 'label',
    type: 'string',
    default: "''",
    desc: 'Etichetta sopra il campo',
  },
  {
    name: 'hint',
    type: 'string',
    default: "''",
    desc: 'Testo di aiuto sotto il campo',
  },
  {
    name: 'error',
    type: 'boolean',
    default: 'false',
    desc: 'Attiva lo stato di errore',
  },
  {
    name: 'errorMessage',
    type: 'string',
    default: "''",
    desc: 'Messaggio mostrato sotto il campo quando `error` è true',
  },
  {
    name: 'focusEffect',
    type: "'ring' | 'lift' | 'glow' | 'none' | 'custom'",
    default: "'ring'",
    desc: 'Effetto visivo applicato allo stato di focus',
  },
]

// Prop condivise solo dai componenti basati sul calendario (Date, DateRange,
// DateTime, DateTimeRange): locale, formato data, primo giorno settimana.
const sharedCalendarRows = [
  {
    name: 'locale',
    type: 'string',
    default: "'en-US'",
    desc: 'Locale usato per nomi di mesi/giorni e formato data di default',
  },
  {
    name: 'format',
    type: 'string',
    default: "''",
    desc: 'Override del formato data mostrato nel campo (es. \'DD/MM/YYYY\'); vuoto = dedotto dal locale',
  },
  {
    name: 'firstDayOfWeek',
    type: 'number | null',
    default: 'null',
    desc: 'Primo giorno della settimana (0 = domenica); null = dedotto dal locale',
  },
  {
    name: 'min',
    type: 'string',
    default: "''",
    desc: 'Data minima selezionabile, formato ISO \'YYYY-MM-DD\'',
  },
  {
    name: 'max',
    type: 'string',
    default: "''",
    desc: 'Data massima selezionabile, formato ISO \'YYYY-MM-DD\'',
  },
]

// Prop condivise dai componenti con selezione dell'orario (DateTime,
// DateTimeRange, Time).
const sharedTimeRows = [
  {
    name: 'timeFormat',
    type: 'string',
    default: "'HH:mm'",
    desc: 'Formato di visualizzazione dell’orario nel campo',
  },
  {
    name: 'minuteStep',
    type: 'number',
    default: '5',
    desc: 'Intervallo tra un minuto selezionabile e l’altro nella colonna minuti',
  },
]

export const datePickerPropsRows = [
  {
    name: 'modelValue',
    type: 'string',
    default: "''",
    desc: 'Data selezionata, formato ISO \'YYYY-MM-DD\' (v-model)',
  },
  ...sharedCalendarRows,
  ...sharedPickerRows,
  {
    name: 'clearFooterLabel',
    type: 'string',
    default: "'Clear'",
    desc: 'Testo del pulsante che svuota il valore nel footer del pannello',
  },
  {
    name: 'todayLabel',
    type: 'string',
    default: "'Today'",
    desc: 'Testo del pulsante che seleziona la data odierna',
  },
]

export const dateRangePropsRows = [
  {
    name: 'modelValue',
    type: '{ start: string, end: string }',
    default: "{ start: '', end: '' }",
    desc: 'Intervallo selezionato, entrambe le date in formato ISO \'YYYY-MM-DD\' (v-model)',
  },
  ...sharedCalendarRows,
  ...sharedPickerRows,
  {
    name: 'rangeSeparator',
    type: 'string',
    default: "'-'",
    desc: 'Separatore mostrato nel campo tra data di inizio e fine, e riconosciuto in fase di digitazione libera (accetta anche \'to\', \'→\', \'—\', \'–\')',
  },
  {
    name: 'clearFooterLabel',
    type: 'string',
    default: "'Clear'",
    desc: 'Testo del pulsante che svuota il valore nel footer del pannello',
  },
]

export const dateTimePickerPropsRows = [
  {
    name: 'modelValue',
    type: 'string',
    default: "''",
    desc: 'Data e ora selezionate, formato canonico \'YYYY-MM-DD HH:mm\' (v-model)',
  },
  ...sharedCalendarRows,
  ...sharedTimeRows,
  {
    name: 'separator',
    type: 'string',
    default: "' '",
    desc: 'Separatore tra la parte data e la parte ora nel valore/campo',
  },
  ...sharedPickerRows,
  {
    name: 'nowLabel',
    type: 'string',
    default: "'Now'",
    desc: 'Testo del pulsante che seleziona data e ora correnti',
  },
  {
    name: 'confirmLabel',
    type: 'string',
    default: "'Confirm'",
    desc: 'Testo del pulsante di conferma selezione',
  },
  {
    name: 'clearFooterLabel',
    type: 'string',
    default: "'Clear'",
    desc: 'Testo del pulsante che svuota il valore nel footer del pannello',
  },
  {
    name: 'hoursLabel / minutesLabel',
    type: 'string',
    default: "'Hours' / 'Minutes'",
    desc: 'Intestazioni delle colonne ore/minuti nel tab Time',
  },
  {
    name: 'dateTabLabel / timeTabLabel',
    type: 'string',
    default: "'Date' / 'Time'",
    desc: 'Etichette dei due tab del pannello',
  },
  {
    name: 'summaryLabel',
    type: 'string',
    default: "'Selected'",
    desc: 'Etichetta sopra il riepilogo data/ora selezionata in cima al pannello',
  },
]

export const dateTimeRangePropsRows = [
  {
    name: 'modelValue',
    type: '{ start: string, end: string }',
    default: "{ start: '', end: '' }",
    desc: 'Intervallo selezionato, entrambi i valori in formato canonico \'YYYY-MM-DD HH:mm\' (v-model)',
  },
  ...sharedCalendarRows,
  ...sharedTimeRows,
  {
    name: 'separator',
    type: 'string',
    default: "' '",
    desc: 'Separatore tra la parte data e la parte ora di ciascun valore',
  },
  ...sharedPickerRows,
  {
    name: 'rangeSeparator',
    type: 'string',
    default: "'-'",
    desc: 'Separatore mostrato/riconosciuto nel campo tra inizio e fine intervallo',
  },
  {
    name: 'confirmLabel',
    type: 'string',
    default: "'Confirm'",
    desc: 'Testo del pulsante di conferma selezione (attivo solo con inizio e fine impostati)',
  },
  {
    name: 'clearFooterLabel',
    type: 'string',
    default: "'Clear'",
    desc: 'Testo del pulsante che svuota il valore nel footer del pannello',
  },
  {
    name: 'startLabel / endLabel',
    type: 'string',
    default: "'Start' / 'End'",
    desc: 'Etichette usate nel riepilogo e nel tab-switch mobile per inizio/fine',
  },
  {
    name: 'emptyStartLabel / emptyEndLabel',
    type: 'string',
    default: "'Select start' / 'Select end'",
    desc: 'Testo mostrato nel riepilogo quando inizio/fine non sono ancora impostati',
  },
  {
    name: 'startHourLabel / startMinuteLabel / endHourLabel / endMinuteLabel',
    type: 'string',
    default: "'Hours' / 'Minutes'",
    desc: 'Intestazioni delle colonne ore/minuti per inizio e fine nel tab Time',
  },
  {
    name: 'dateTabLabel / timeTabLabel',
    type: 'string',
    default: "'Date' / 'Time'",
    desc: 'Etichette dei due tab principali del pannello',
  },
  {
    name: 'summaryLabel',
    type: 'string',
    default: "'Selected range'",
    desc: 'Etichetta sopra il riepilogo inizio/fine in cima al pannello',
  },
]

export const timePickerPropsRows = [
  {
    name: 'modelValue',
    type: 'string',
    default: "''",
    desc: 'Orario selezionato, formato \'HH:mm\' 24h (v-model)',
  },
  ...sharedTimeRows.filter((row) => row.name === 'minuteStep'),
  {
    name: 'format',
    type: 'string',
    default: "'HH:mm'",
    desc: 'Formato di visualizzazione dell’orario nel campo',
  },
  ...sharedPickerRows,
  {
    name: 'openLabel',
    type: 'string',
    default: "'Open time picker'",
    desc: 'aria-label del pulsante che apre il pannello',
  },
  {
    name: 'clearLabel',
    type: 'string',
    default: "'Clear'",
    desc: 'aria-label del pulsante clear',
  },
  {
    name: 'dialogLabel',
    type: 'string',
    default: "'Select a time'",
    desc: 'aria-label del pannello (dialog)',
  },
  {
    name: 'clearFooterLabel',
    type: 'string',
    default: "'Clear'",
    desc: 'Testo del pulsante che svuota il valore nel footer del pannello',
  },
]

export const colorPickerPropsRows = [
  {
    name: 'modelValue',
    type: 'string',
    default: "''",
    desc: 'Colore selezionato, formato hex \'#rrggbb\' (v-model)',
  },
  {
    name: 'showHex',
    type: 'boolean',
    default: 'true',
    desc: 'Mostra il valore hex accanto allo swatch',
  },
  ...sharedPickerRows.filter((row) => row.name !== 'icon' && row.name !== 'iconPosition' && row.name !== 'iconSize'),
]

export const rangePropsRows = [
  {
    name: 'modelValue',
    type: 'number | string',
    default: '50',
    desc: 'Valore corrente dello slider (v-model)',
  },
  {
    name: 'min',
    type: 'number | string',
    default: '0',
    desc: 'Valore minimo',
  },
  {
    name: 'max',
    type: 'number | string',
    default: '100',
    desc: 'Valore massimo',
  },
  {
    name: 'step',
    type: 'number | string',
    default: '1',
    desc: 'Incremento tra un valore selezionabile e l’altro',
  },
  {
    name: 'showValue',
    type: 'boolean',
    default: 'true',
    desc: 'Mostra il valore numerico corrente a destra dello slider',
  },
  {
    name: 'variant',
    type: "'outline' | 'ghost' | 'text'",
    default: "'outline'",
    desc: 'Stile visivo del campo che contiene lo slider',
  },
  {
    name: 'color',
    type: 'string',
    default: "'#7c3aed'",
    desc: 'Colore della porzione riempita e del thumb',
  },
  {
    name: 'colors',
    type: 'object',
    default: 'null',
    desc: 'Override colori del campo che contiene lo slider',
  },
  {
    name: 'size',
    type: "'sm' | 'md' | 'lg'",
    default: "'md'",
    desc: 'Dimensione del campo',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    desc: 'Disabilita lo slider',
  },
  {
    name: 'loading',
    type: 'boolean',
    default: 'false',
    desc: 'Mostra spinner e disabilita lo slider',
  },
  {
    name: 'block',
    type: 'boolean',
    default: 'false',
    desc: 'Occupa tutta la larghezza disponibile',
  },
  {
    name: 'pill',
    type: 'boolean',
    default: 'false',
    desc: 'Bordo completamente arrotondato del campo',
  },
  {
    name: 'radius',
    type: 'number | string',
    default: 'null',
    desc: 'Override del border-radius del campo',
  },
  {
    name: 'icon',
    type: 'Component | Function | null',
    default: 'null',
    desc: 'Icona opzionale a inizio campo',
  },
  {
    name: 'iconPosition',
    type: "'left' | 'right'",
    default: "'left'",
    desc: 'Posizione della prop `icon`',
  },
  {
    name: 'iconSize',
    type: 'number | string',
    default: 'null',
    desc: 'Override della dimensione icona',
  },
  {
    name: 'label',
    type: 'string',
    default: "''",
    desc: 'Etichetta sopra il campo',
  },
  {
    name: 'hint',
    type: 'string',
    default: "''",
    desc: 'Testo di aiuto sotto il campo',
  },
  {
    name: 'error',
    type: 'boolean',
    default: 'false',
    desc: 'Attiva lo stato di errore',
  },
  {
    name: 'errorMessage',
    type: 'string',
    default: "''",
    desc: 'Messaggio mostrato sotto il campo quando `error` è true',
  },
  {
    name: 'focusEffect',
    type: "'ring' | 'lift' | 'glow' | 'none' | 'custom'",
    default: "'ring'",
    desc: 'Effetto visivo applicato allo stato di focus',
  },
]

export const checkboxPropsRows = [
  {
    name: 'modelValue',
    type: 'boolean | any[]',
    default: 'false',
    desc: 'Valore del checkbox. Boolean per uso singolo, array per gruppi (v-model).',
  },
  {
    name: 'value',
    type: 'string | number | object',
    default: 'null',
    desc: 'Valore associato al checkbox quando viene usato in un gruppo (modelValue array).',
  },
  {
    name: 'trueValue',
    type: 'boolean | string | number',
    default: 'true',
    desc: 'Valore emesso quando il checkbox viene selezionato in modalità singola.',
  },
  {
    name: 'falseValue',
    type: 'boolean | string | number',
    default: 'false',
    desc: 'Valore emesso quando il checkbox viene deselezionato in modalità singola.',
  },
  {
    name: 'indeterminate',
    type: 'boolean',
    default: 'false',
    desc: 'Mostra lo stato indeterminato senza modificarne il comportamento.',
  },
  {
    name: 'name',
    type: 'string',
    default: 'undefined',
    desc: 'Nome dell’input nativo; utile per form HTML.',
  },
  {
    name: 'label',
    type: 'string',
    default: "''",
    desc: 'Etichetta mostrata accanto al checkbox.',
  },
  {
    name: 'hint',
    type: 'string',
    default: "''",
    desc: 'Testo di supporto mostrato sotto il controllo.',
  },
  {
    name: 'error',
    type: 'boolean',
    default: 'false',
    desc: 'Attiva lo stato di errore.',
  },
  {
    name: 'errorMessage',
    type: 'string',
    default: "''",
    desc: 'Messaggio mostrato sotto il controllo quando error è true.',
  },
  {
    name: 'color',
    type: 'string',
    default: "'#7c3aed'",
    desc: 'Colore del checkbox selezionato.',
  },
  {
    name: 'colors',
    type: 'object',
    default: 'null',
    desc: 'Override dei colori del componente.',
  },
  {
    name: 'size',
    type: "'sm' | 'md' | 'lg'",
    default: "'md'",
    desc: 'Dimensione del controllo.',
  },
  {
    name: 'radius',
    type: 'number | string',
    default: 'null',
    desc: 'Override del border-radius del checkbox.',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    desc: 'Disabilita il controllo.',
  },
  {
    name: 'loading',
    type: 'boolean',
    default: 'false',
    desc: 'Mostra lo spinner e impedisce l’interazione.',
  },
  {
    name: 'block',
    type: 'boolean',
    default: 'false',
    desc: 'Occupa tutta la larghezza disponibile.',
  },
  {
    name: 'focusEffect',
    type: "'ring' | 'lift' | 'glow' | 'none' | 'custom'",
    default: "'ring'",
    desc: 'Effetto visivo applicato al focus.',
  },
]

export const radioPropsRows = [
  {
    name: 'modelValue',
    type: 'string | number | boolean | object',
    default: 'null',
    desc: 'Valore selezionato del gruppo radio (v-model).',
  },
  {
    name: 'value',
    type: 'string | number | boolean | object',
    default: 'null',
    desc: 'Valore rappresentato da questo radio.',
  },
  {
    name: 'name',
    type: 'string',
    default: "''",
    desc: 'I radio con lo stesso name appartengono allo stesso gruppo.',
  },
  {
    name: 'label',
    type: 'string',
    default: "''",
    desc: 'Etichetta mostrata accanto al radio.',
  },
  {
    name: 'hint',
    type: 'string',
    default: "''",
    desc: 'Testo di supporto mostrato sotto il controllo.',
  },
  {
    name: 'error',
    type: 'boolean',
    default: 'false',
    desc: 'Attiva lo stato di errore.',
  },
  {
    name: 'errorMessage',
    type: 'string',
    default: "''",
    desc: 'Messaggio mostrato sotto il controllo quando error è true.',
  },
  {
    name: 'color',
    type: 'string',
    default: "'#7c3aed'",
    desc: 'Colore del radio selezionato.',
  },
  {
    name: 'colors',
    type: 'object',
    default: 'null',
    desc: 'Override dei colori del componente.',
  },
  {
    name: 'size',
    type: "'sm' | 'md' | 'lg'",
    default: "'md'",
    desc: 'Dimensione del controllo.',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    desc: 'Disabilita il controllo.',
  },
  {
    name: 'loading',
    type: 'boolean',
    default: 'false',
    desc: 'Mostra lo spinner e impedisce l’interazione.',
  },
  {
    name: 'block',
    type: 'boolean',
    default: 'false',
    desc: 'Occupa tutta la larghezza disponibile.',
  },
  {
    name: 'focusEffect',
    type: "'ring' | 'lift' | 'glow' | 'none' | 'custom'",
    default: "'ring'",
    desc: 'Effetto visivo applicato al focus.',
  },
]