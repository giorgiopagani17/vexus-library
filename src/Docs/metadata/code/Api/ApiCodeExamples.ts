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
import { useApi } from 'vexus'

const { request } = useApi()

const users = await request('users', { method: 'GET' })`

export const getPostCode = `const { request } = useApi()

// GET con query params
const list = await request('users', {
  method: 'GET',
  query: { page: 1, active: true }
})

// GET con path params
const user = await request('users/:id', {
  method: 'GET',
  pathParams: { id: 42 }
})

// POST
const created = await request('users', {
  method: 'POST',
  body: { name: 'Giorgio', role: 'admin' }
})`

export const notifyCode = `// Notify automatica di successo/errore
await request('users', {
  method: 'POST',
  body: payload,
  showNotify: true,
  successMessage: 'Utente creato con successo!',
  errorMessage: 'Impossibile creare l\\'utente.'
})

// Notify solo in caso di errore
await request('users/:id', {
  method: 'DELETE',
  pathParams: { id: 42 },
  showOnlyErroNotify: true,
  errorMessage: 'Impossibile eliminare l\\'utente.'
})`

export const messagePathCode = `// Se la struttura di errore/successo del backend
// non è quella di default (error.message / data.message),
// indica dove trovarla con un path dot-notation

await request('users', {
  method: 'POST',
  body: payload,
  showNotify: true,
  successMessagePath: 'result.message',       // legge raw.result.message
  errorMessagePath: 'error.details.reason'     // legge raw.error.details.reason
})

// Funziona anche con indici di array
await request('bulk-import', {
  method: 'POST',
  body: rows,
  showOnlyErroNotify: true,
  errorMessagePath: 'errors.0.message'         // legge raw.errors[0].message
})`

export const loadingCode = `// Notify persistente durante la chiamata, si trasforma
// automaticamente in success/error al termine
await request('reports/export', {
  method: 'GET',
  showNotifyLoading: true,
  loadingMessage: 'Generazione report in corso...',
  successMessage: 'Report pronto!'
})`

export const refreshCode = `// Su 401: se doRefresh non è false, la libreria tenta
// automaticamente il refresh del token e ripete la richiesta
await request('users/me', { method: 'GET' })

// Disattiva il refresh automatico per questa chiamata
await request('public/ping', { method: 'GET', doRefresh: false })

// Forza il logout su 401 anche a refresh disattivato
await request('admin/check', {
  method: 'GET',
  doRefresh: false,
  doLogout: true
})`

export const blobCode = `// Download di un file binario (excel, pdf, zip...)
const { data } = await request('reports/:id/download', {
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