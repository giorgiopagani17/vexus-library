export const propsColumns = [
  { key: 'name', label: 'Nome', class: 'prop-name' },
  { key: 'type', label: 'Tipo', class: 'prop-type' },
  { key: 'default', label: 'Default', class: 'prop-default' },
  { key: 'desc', label: 'Descrizione', class: 'prop-desc' },
]

// ===== VxGenerateFiscalCode(input) =====
export const generateInputRows = [
  { name: 'name', type: 'string', default: '—', desc: 'Nome di battesimo' },
  { name: 'surname', type: 'string', default: '—', desc: 'Cognome' },
  { name: 'gender', type: "'M' | 'F'", default: '—', desc: 'Sesso anagrafico' },
  { name: 'day', type: 'number', default: '—', desc: 'Giorno di nascita (1-31)' },
  { name: 'month', type: 'number', default: '—', desc: 'Mese di nascita (1-12)' },
  { name: 'year', type: 'number', default: '—', desc: 'Anno di nascita a 4 cifre, es. 1990' },
  {
    name: 'birthplaceCode',
    type: 'string',
    default: '—',
    desc: "Codice catastale del comune (o stato estero) di nascita, es. 'H501' per Roma. Va fornito da chi chiama: la libreria non include il database dei comuni",
  },
]

// ===== VxDecodeFiscalCode(cf, referenceDate?) → DecodedCodiceFiscale | null =====
export const decodeOutputRows = [
  { name: 'gender', type: "'M' | 'F'", default: '—', desc: 'Sesso decodificato dal giorno (>40 = F)' },
  { name: 'day', type: 'number', default: '—', desc: 'Giorno di nascita decodificato' },
  { name: 'month', type: 'number', default: '—', desc: 'Mese di nascita decodificato' },
  {
    name: 'year',
    type: 'number',
    default: '—',
    desc: 'Anno a 4 cifre. Il CF codifica solo le ultime 2 cifre: la scelta del secolo (1900/2000) è euristica, vedi note',
  },
  { name: 'birthplaceCode', type: 'string', default: '—', desc: 'Codice catastale estratto dal CF (posizioni 12-15)' },
]

// ===== funzioni pure esportate da codiceFiscale.ts =====
export const functionsRows = [
  {
    name: 'VxGenerateFiscalCode(input)',
    type: 'VxGenerateFiscalCode → string',
    default: '—',
    desc: 'Genera un Codice Fiscale completo (16 caratteri) dai dati anagrafici',
  },
  {
    name: 'VxIsValidFiscalCodeFormat(cf)',
    type: 'string → boolean',
    default: '—',
    desc: 'Verifica solo la forma (16 caratteri, pattern lettere/cifre), non il checksum',
  },
  {
    name: 'VxIsValidFiscalCodeChecksum(cf)',
    type: 'string → boolean',
    default: '—',
    desc: 'Verifica il carattere di controllo (16° carattere). Assume formato già valido',
  },
  {
    name: 'VxIsValidFiscalCode(cf)',
    type: 'string → boolean',
    default: '—',
    desc: 'Formato + checksum insieme, equivalente al vecchio CodiceFiscale.check()',
  },
  {
    name: 'VxDecodeFiscalCode(cf, referenceDate?)',
    type: 'string → DecodedCodiceFiscale | null',
    default: 'referenceDate = new Date()',
    desc: "Decodifica un CF valido in dati anagrafici parziali (null se il formato non è valido). `referenceDate` influenza solo la scelta del secolo dell'anno",
  },
  {
    name: 'computeControlChar(first15Chars)',
    type: 'string → string',
    default: '—',
    desc: 'Calcola il solo carattere di controllo a partire dai primi 15 caratteri. Usata internamente da generate/validate, esposta per casi avanzati',
  },
]

// ===== VxUseFiscalCodeValidation(options) =====
export const hookOptionsRows = [
  {
    name: 'checkExistsFn',
    type: '(cf: string) => Promise<boolean>',
    default: 'undefined',
    desc: "Funzione iniettata da chi usa l'hook per verificare se il CF esiste già (es. chiamata API del progetto). Se assente, `checkExists: true` in validate() viene ignorato silenziosamente",
  },
]

// ===== validate(input): CFValidationInput → Promise<InvalidField[]> =====
export const validateInputRows = [
  { name: 'name', type: 'string', default: '—', desc: 'Nome da confrontare col CF' },
  { name: 'surname', type: 'string', default: '—', desc: 'Cognome da confrontare col CF' },
  { name: 'gender', type: "'M' | 'F' | null", default: '—', desc: 'Sesso da confrontare col CF' },
  { name: 'birthdayDate', type: 'Date', default: '—', desc: 'Data di nascita da confrontare col CF' },
  { name: 'codiceFiscale', type: 'string', default: '—', desc: 'Il Codice Fiscale da validare' },
  {
    name: 'birthplaceCode',
    type: 'string',
    default: 'undefined',
    desc: 'Codice catastale atteso del comune di nascita, confrontato con quello estratto dal CF',
  },
  {
    name: 'checkExists',
    type: 'boolean',
    default: 'false',
    desc: 'Se true (e `checkExistsFn` è stata passata all’hook), verifica che il CF non sia già registrato',
  },
  {
    name: 'requireAdult',
    type: 'boolean',
    default: 'false',
    desc: "Se true, restituisce errore ['cf'] (error.value = 'minorUserNotAllowed') quando il CF corrisponde a un minorenne, prima di qualsiasi altra validazione anagrafica",
  },
  {
    name: 'checkFormatOnly',
    type: 'boolean',
    default: 'false',
    desc: 'Se true, salta il confronto con nome/cognome/data/luogo: valida solo formato + checksum (+ requireAdult se richiesto)',
  },
]

export const validateReturnRows = [
  {
    name: 'invalidFields',
    type: "Array<'name'|'surname'|'gender'|'birthdayDate'|'cf'|'birthplace'|'cfExists'>",
    default: '[]',
    desc: 'Valore di ritorno di validate(): array vuoto se tutto è valido, altrimenti i campi incoerenti col CF',
  },
  {
    name: 'error',
    type: 'Ref<string | null>',
    default: 'null',
    desc: "Messaggio d'errore leggibile (o chiave da tradurre, es. 'minorUserNotAllowed') aggiornato ad ogni validate()",
  },
  {
    name: 'minor',
    type: 'Ref<boolean>',
    default: 'false',
    desc: 'true se il CF/data di nascita validati corrispondono a un minorenne (calcolato anche quando la validazione ha successo)',
  },
]