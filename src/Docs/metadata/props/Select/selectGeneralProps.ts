export const propsColumns = [
  { key: 'name', label: 'Prop', class: 'prop-name' },
  { key: 'type', label: 'Tipo', class: 'prop-type' },
  { key: 'default', label: 'Default', class: 'prop-default' },
  { key: 'desc', label: 'Descrizione', class: 'prop-desc' }
]

export const propsRows = [
    {
        name:'modelValue',
        type:'string | number | boolean | object | array | null',
        default:'null',
        desc:'Valore selezionato usato con v-model'
    },
    {
        name:'options',
        type:'array',
        default:'[]',
        desc:'Lista delle opzioni locali'
    },
    {
        name:'optionLabel',
        type:'string | function',
        default:"'label'",
        desc:'Proprietà o funzione per ricavare la label'
    },
    {
        name:'optionValue',
        type:'string | function',
        default:"'value'",
        desc:'Proprietà o funzione per ricavare il valore'
    },
    {
        name:'emitValue',
        type:'boolean',
        default:'false',
        desc:'Emette il valore risolto invece dell’intero oggetto'
    },
    {
        name:'multiple',
        type:'boolean',
        default:'false',
        desc:'Permette selezioni multiple'
    },
    {
        name:'useChips',
        type:'boolean',
        default:'true',
        desc:'Mostra le selezioni multiple come chip'
    },
    {
        name:'searchable',
        type:'boolean',
        default:'true',
        desc:'Abilita ricerca interna'
    },
    {
        name:'clearable',
        type:'boolean',
        default:'false',
        desc:'Mostra pulsante per cancellare'
    },
    {
        name:'url',
        type:'string | null',
        default:'null',
        desc:'Endpoint remoto per caricare le opzioni'
        },
    {
        name:'searchParam',
        type:'string',
        default:"'searchTerm'",
        desc:'Parametro query usato per la ricerca remota'
    },
    {
        name:'rowsPerPage',
        type:'number',
        default:'10',
        desc:'Numero elementi caricati per pagina'
    },
    {
        name:'extraParams',
        type:'object',
        default:'{}',
        desc:'Parametri extra per richieste remote'
    },
    {
        name:'transformOption',
        type:'function',
        default:'null',
        desc:'Trasforma ogni elemento remoto prima del rendering'
    },
    {
        name:'label',
        type:'string',
        default:"''",
        desc:'Label sopra il campo'
    },
    {
        name:'hint',
        type:'string',
        default:"''",
        desc:'Testo di supporto'
    },
    {
        name:'error',
        type:'boolean',
        default:'false',
        desc:'Stato errore'
    },
    {
        name:'errorMessage',
        type:'string',
        default:"''",
        desc:'Messaggio errore'
    },
    {
        name:'variant',
        type:"'outline' | 'ghost' | 'text'",
        default:"'outline'",
        desc:'Variante visiva'
    },
    {
        name:'size',
        type:'string | object',
        default:"'md'",
        desc:'Dimensione'
    },
    {
        name:'color',
        type:'string',
        default:'null',
        desc:'Colore accent/focus'
    },
    {
        name:'colors',
        type:'object',
        default:'null',
        desc:'Override colori custom'
    },
    {
        name:'focusEffect',
        type:'string',
        default:"'ring'",
        desc:'Effetto focus'
    },
    {
        name:'disabled',
        type:'boolean',
        default:'false',
        desc:'Disabilita il campo'
    },
    {
        name:'loading',
        type:'boolean',
        default:'false',
        desc:'Mostra spinner'
    },
    {
        name:'block',
        type:'boolean',
        default:'false',
        desc:'Occupa tutta la larghezza'
    }
]