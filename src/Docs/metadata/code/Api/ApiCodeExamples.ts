export const setupCode = `// main.ts — una sola volta, a livello di app
import { createApiClient } from 'vexus'
import { useAuthStore } from '@/stores/auth'

app.use(createApiClient({
  baseUrl: env.apiUrl,
  getAccessToken: () => useAuthStore().accessToken,
  getRefreshToken: () => useAuthStore().refreshToken,
  refreshAccessToken: () => useAuthStore().refreshAccessToken(),
  onAuthLogout: () => {
    useAuthStore().logout()
    window.location.href = '/'
  },
  getLocale: () => normalizeLocale(i18n.global.locale.value),
}))`

export const usageCode = `// In qualsiasi componente, senza altro setup
import { useVxApi } from 'vexus'

const { VxRequest } = useVxApi()

const users = await VxRequest('users', { method: 'GET' })`

export const getPostCode = `const { VxRequest } = useVxApi()

// GET con query params
const list = await VxRequest('users', {
  method: 'GET',
  query: { page: 1, active: true }
})

// GET con path params
const user = await VxRequest('users/:id', {
  method: 'GET',
  pathParams: { id: 42 }
})

// POST
const created = await VxRequest('users', {
  method: 'POST',
  body: { name: 'Giorgio', role: 'admin' }
})`

export const notifyCode = `// Notify automatica di successo/errore
await VxRequest('users', {
  method: 'POST',
  body: payload,
  showNotify: true,
  successMessage: 'Utente creato con successo!',
  errorMessage: 'Impossibile creare l\\'utente.'
})

// Notify solo in caso di errore
await VxRequest('users/:id', {
  method: 'DELETE',
  pathParams: { id: 42 },
  showOnlyErroNotify: true,
  errorMessage: 'Impossibile eliminare l\\'utente.'
})`

export const messagePathCode = `// Se la struttura di errore/successo del backend
// non è quella di default (error.message / data.message),
// indica dove trovarla con un path dot-notation

await VxRequest('users', {
  method: 'POST',
  body: payload,
  showNotify: true,
  successMessagePath: 'result.message',       // legge raw.result.message
  errorMessagePath: 'error.details.reason'     // legge raw.error.details.reason
})

// Funziona anche con indici di array
await VxRequest('bulk-import', {
  method: 'POST',
  body: rows,
  showOnlyErroNotify: true,
  errorMessagePath: 'errors.0.message'         // legge raw.errors[0].message
})`

export const loadingCode = `// Notify persistente durante la chiamata, si trasforma
// automaticamente in success/error al termine
await VxRequest('reports/export', {
  method: 'GET',
  showNotifyLoading: true,
  loadingMessage: 'Generazione report in corso...',
  successMessage: 'Report pronto!'
})`

export const refreshCode = `// Su 401: se doRefresh non è false, la libreria tenta
// automaticamente il refresh del token e ripete la richiesta
await VxRequest('users/me', { method: 'GET' })

// Disattiva il refresh automatico per questa chiamata
await VxRequest('public/ping', { method: 'GET', doRefresh: false })

// Forza il logout su 401 anche a refresh disattivato
await VxRequest('admin/check', {
  method: 'GET',
  doRefresh: false,
  doLogout: true
})`

export const blobCode = `// Download di un file binario (excel, pdf, zip...)
const { data } = await VxRequest('reports/:id/download', {
  method: 'GET',
  pathParams: { id: reportId },
  expectBlob: true
})

const url = URL.createObjectURL(data)
window.open(url)`

export const configCode = `interface ApiClientConfig {
  baseUrl: string
  getAccessToken?: () => string | null | undefined
  getRefreshToken?: () => string | null | undefined
  refreshAccessToken?: () => Promise<void>
  onAuthLogout?: () => void
  getLocale?: () => string
  translate?: (key: string, fallback: string) => string
  storageTokenKey?: string
}`