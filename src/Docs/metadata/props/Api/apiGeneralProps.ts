export const optionsColumns = [
  { key: 'name', label: 'Opzione', class: 'prop-name' },
  { key: 'type', label: 'Tipo', class: 'prop-type' },
  { key: 'default', label: 'Default', class: 'prop-default' },
  { key: 'description', label: 'Descrizione', class: 'prop-desc' },
]

export const optionsRows = [
  { name: 'method', type: "'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'", default: "'GET'", description: 'Metodo HTTP della richiesta.' },
  { name: 'pathParams', type: 'Record<string, string | number>', default: '—', description: "Sostituisce i segnaposto ':id' nell'endpoint." },
  { name: 'query', type: 'Record<string, string | number | boolean | Array<...>>', default: '—', description: 'Query string, supporta valori multipli per chiave.' },
  { name: 'body', type: 'T', default: '—', description: 'Payload della richiesta (JSON o FormData).' },
  { name: 'headers', type: 'Record<string, string>', default: '—', description: 'Header aggiuntivi, sovrascrivono quelli automatici.' },
  { name: 'showNotify', type: 'boolean', default: 'false', description: 'Mostra una notify automatica su successo/errore.' },
  { name: 'showOnlyErroNotify', type: 'boolean', default: 'false', description: 'Mostra la notify solo in caso di errore.' },
  { name: 'showNotifyLoading', type: 'boolean', default: 'false', description: 'Mostra una notify persistente durante la chiamata, aggiornata a fine richiesta.' },
  { name: 'loadingMessage', type: 'string', default: "'Caricamento in corso...'", description: 'Messaggio della notify di loading.' },
  { name: 'successMessage', type: 'string', default: 'risposta API', description: 'Messaggio custom per la notify di successo.' },
  { name: 'errorMessage', type: 'string', default: 'risposta API', description: "Messaggio custom per la notify d'errore." },
  { name: 'successMessagePath', type: 'string', default: '—', description: "Path dot-notation da cui leggere il messaggio di successo nella risposta (es. 'result.message'), se non è in data.message." },
  { name: 'errorMessagePath', type: 'string', default: '—', description: "Path dot-notation da cui leggere il messaggio d'errore nella risposta (es. 'error.details.reason'), se la struttura non è quella di default." },
  { name: 'skipContentType', type: 'boolean', default: 'false', description: "Non forza 'Content-Type: application/json' (utile per FormData)." },
  { name: 'doRefresh', type: 'boolean', default: 'true', description: 'Se false, disattiva il refresh automatico del token su 401.' },
  { name: 'doLogout', type: 'boolean', default: 'false', description: 'Forza il logout su 401 anche quando doRefresh è false.' },
  { name: 'expectBlob', type: 'boolean', default: 'false', description: 'Tratta la risposta come binaria (Blob) invece che JSON.' },
]

export const configColumns = [
  { key: 'name', label: 'Opzione', class: 'prop-name' },
  { key: 'type', label: 'Tipo', class: 'prop-type' },
  { key: 'required', label: 'Obbligatoria', class: 'prop-default' },
  { key: 'description', label: 'Descrizione', class: 'prop-desc' },
]

export const configRows = [
  { name: 'baseUrl', type: 'string', required: 'Sì', description: 'URL base delle API, prepesso a ogni endpoint.' },
  { name: 'getAccessToken', type: '() => string | null | undefined', required: 'No', description: "Recupera il token corrente per l'header Authorization." },
  { name: 'getRefreshToken', type: '() => string | null | undefined', required: 'No', description: 'Recupera il refresh token; se assente, niente auto-refresh.' },
  { name: 'refreshAccessToken', type: '() => Promise<void>', required: 'No', description: 'Esegue il refresh, deve aggiornare lo store del progetto.' },
  { name: 'onAuthLogout', type: '() => void', required: 'No', description: 'Chiamata quando il refresh fallisce o non è possibile.' },
  { name: 'getLocale', type: '() => string', required: 'No', description: "Valorizza l'header Accept-Language." },
  { name: 'translate', type: '(key, fallback) => string', required: 'No', description: 'Traduce i messaggi di default della libreria.' },
  { name: 'storageTokenKey', type: 'string', required: 'No', description: 'Chiave localStorage di fallback per il token (es. reset password).' },
]