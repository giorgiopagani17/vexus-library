export const generalPropsColumns = [
  { key: 'name', label: 'Prop', class: 'prop-name' },
  { key: 'type', label: 'Tipo', class: 'prop-type' },
  { key: 'default', label: 'Default', class: 'prop-default' },
  { key: 'desc', label: 'Descrizione', class: 'prop-desc' },
]

export const generalProps = [
  { name: 'message', type: 'string', default: "''", desc: 'Testo principale della notifica' },
  { name: 'html', type: 'boolean', default: 'false', desc: 'Se true, renderizza `message` come HTML (v-html)' },
  { name: 'title', type: 'string | null', default: 'null', desc: 'Titolo opzionale sopra il messaggio' },
  { name: 'type', type: "'default' | 'success' | 'error' | 'warning' | 'info'", default: "'default'", desc: 'Variante visiva con icona/colore automatico' },
  { name: 'colors', type: 'NotifyColors | null', default: 'null', desc: 'Override dei singoli colori, vedi tabella sopra' },
  { name: 'loading', type: 'boolean', default: 'false', desc: 'Mostra uno spinner al posto dell\'icona' },
  { name: 'progress', type: 'boolean', default: 'false', desc: 'Mostra la barra di countdown prima della chiusura' },
  { name: 'duration', type: 'number', default: '4000', desc: 'Tempo in ms prima della chiusura automatica. 0 = persistente' },
  { name: 'position', type: "'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center-center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'", default: "'bottom-center'", desc: 'Posizione sullo schermo' },
  { name: 'icon', type: 'Component | null', default: 'null', desc: 'Icona custom, sovrascrive quella automatica' },
  { name: 'iconSize', type: 'number | string', default: '20', desc: 'Dimensione in px dell\'icona (o dello spinner)' },
  { name: 'textSize', type: 'number | string', default: '13', desc: 'Dimensione in px del testo del messaggio' },
  { name: 'titleSize', type: 'number | string', default: '13', desc: 'Dimensione in px del titolo' },
  { name: 'radius', type: 'number | string', default: '14', desc: 'Raggio di curvatura in px dei bordi della notifica' },
  { name: 'closeButtonSize', type: 'number | string', default: '16', desc: 'Dimensione in px del pulsante di chiusura' },
  { name: 'actions', type: 'Array<{ label, action, color? }>', default: '[]', desc: 'Bottoni interattivi dentro la notifica' },
  { name: 'alignItems', type: "'flex-start' | 'center' | 'flex-end'", default: "'center'", desc: 'Allineamento verticale del contenuto della notifica' },
  { name: 'closable', type: 'boolean', default: 'true', desc: 'Mostra/nasconde il pulsante di chiusura manuale' },
  { name: 'onClose', type: '() => void | null', default: 'null', desc: 'Callback eseguita alla chiusura' }
]