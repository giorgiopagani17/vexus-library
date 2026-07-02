export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface ApiOptions<T = unknown> {
  method?: ApiMethod;
  pathParams?: Record<string, string | number>;
  // valori multipli per query params ripetuti
  query?: Record<string, string | number | boolean | Array<string | number | boolean>>;
  body?: T;
  headers?: Record<string, string>;
  successMessage?: string;
  errorMessage?: string;
  /**
   * Path (dot notation) da cui estrarre il messaggio di errore dalla
   * risposta raw del backend, quando la struttura non è quella di default
   * (error.description / error.message / message).
   * Es: 'error.details.reason', 'errors.0.message'
   */
  errorMessagePath?: string;
  /**
   * Path (dot notation) da cui estrarre il messaggio di successo dalla
   * risposta raw del backend, quando non è semplicemente `data.message`.
   * Es: 'result.message', 'meta.info'
   */
  successMessagePath?: string;
  showNotify?: boolean;
  showOnlyErroNotify?: boolean; // mostra notify solo in caso di errore
  skipContentType?: boolean;
  doRefresh?: boolean;
  doLogout?: boolean; // logout su 401 anche quando doRefresh è false (default: false)
  expectBlob?: boolean;
  showNotifyLoading?: boolean;
  loadingMessage?: string;
}

export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  status: number;
  error?: unknown;
  raw: unknown;
}

export interface ApiBlobResponse {
  data: Blob;
  blob: Blob;
  status: number;
  contentType: string;
}

/**
 * Configurazione che il progetto CONSUMER della libreria deve fornire
 * tramite `createApiClient(config)` + `app.use(...)`.
 *
 * Qui vive tutto ciò che è specifico del progetto (store di auth,
 * env, i18n) e che la libreria non può conoscere a priori.
 */
export interface ApiClientConfig {
  /** Es. env.apiUrl del progetto consumer */
  baseUrl: string;

  /** Come recuperare l'access token corrente */
  getAccessToken?: () => string | null | undefined;

  /** Come recuperare il refresh token corrente (se assente, niente auto-refresh) */
  getRefreshToken?: () => string | null | undefined;

  /** Esegue il refresh del token (deve aggiornare lo store del consumer) */
  refreshAccessToken?: () => Promise<void>;

  /** Chiamato quando il refresh fallisce o non è possibile (logout, redirect, ecc.) */
  onAuthLogout?: () => void;

  /** Locale corrente per l'header Accept-Language (es. () => i18n.global.locale.value) */
  getLocale?: () => string;

  /** Traduzioni opzionali per i messaggi di default (es. 'Caricamento in corso...') */
  translate?: (key: string, fallback: string) => string;

  /**
   * Fallback opzionale: chiave localStorage da cui leggere un token
   * quando non c'è un access token nello store (es. reset password flow).
   * Se non impostata, questo fallback viene semplicemente saltato.
   */
  storageTokenKey?: string;
}