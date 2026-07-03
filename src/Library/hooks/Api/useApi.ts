import { useVxNotify } from '@/Library/hooks/Notify/useVxNotify';
import { useApiConfig } from '@/Library/core/composables/Api/apiConfig';
import type { ApiOptions, ApiResponse, ApiBlobResponse } from '@/Library/core/types/apiTypes';

// Promise di refresh globale (modulo), condivisa tra tutte le chiamate concorrenti
let globalRefreshPromise: Promise<boolean> | null = null;

export function useApi() {
  const config = useApiConfig();
  const { VxNotify, update, dismiss } = useVxNotify();

  const t = (key: string, fallback: string) =>
    config.translate ? config.translate(key, fallback) : fallback;

  function buildUrl(
    endpoint: string,
    pathParams?: Record<string, string | number>,
    query?: Record<string, string | number | boolean | Array<string | number | boolean>>
  ): string {
    let url = endpoint;
    if (pathParams) {
      Object.entries(pathParams).forEach(([key, value]) => {
        url = url.replace(`:${key}`, encodeURIComponent(String(value)));
      });
    }
    if (query) {
      const queryString = Object.entries(query)
        .flatMap(([k, v]) => {
          if (Array.isArray(v)) {
            return v.map(el => `${encodeURIComponent(k)}=${encodeURIComponent(String(el))}`);
          }
          return `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`;
        })
        .join('&');
      if (queryString) url += (url.includes('?') ? '&' : '?') + queryString;
    }
    return config.baseUrl + url.replace(/^\/+/, '');
  }

  async function handleRefresh(): Promise<boolean> {
    if (globalRefreshPromise) {
      return await globalRefreshPromise;
    }

    if (!config.refreshAccessToken) {
      return false;
    }

    globalRefreshPromise = (async () => {
      try {
        await config.refreshAccessToken!();
        return true;
      } catch (error) {
        console.error('[useApi] Refresh fallito:', error);
        return false;
      }
    })();

    const result = await globalRefreshPromise;
    globalRefreshPromise = null;
    return result;
  }

  /**
   * Risolve un path tipo 'error.details.reason' o 'errors.0.message'
   * dentro un oggetto qualsiasi. Ritorna undefined se il path non esiste
   * o il valore risolto non è una stringa/numero utilizzabile.
   */
  function getByPath(obj: unknown, path?: string): string | undefined {
    if (!path || obj === null || obj === undefined) return undefined;
    const value = path.split('.').reduce<unknown>((acc, key) => {
      if (acc === null || acc === undefined) return undefined;
      return (acc as Record<string, unknown>)[key];
    }, obj);
    if (value === null || value === undefined) return undefined;
    return typeof value === 'string' || typeof value === 'number' ? String(value) : undefined;
  }

  function resolveAccessToken(): string | null {
    if (config.getAccessToken) {
      const token = config.getAccessToken();
      if (token) return token;
    }
    if (config.storageTokenKey) {
      try {
        const stored =
          typeof localStorage !== 'undefined' ? localStorage.getItem(config.storageTokenKey) : null;
        if (stored) return stored;
      } catch {
        // localStorage non disponibile, ignora
      }
    }
    return null;
  }

  async function request<TBody = unknown, TData = unknown>(
    endpoint: string,
    options: ApiOptions<TBody> = {},
    retry = true
  ): Promise<ApiResponse<TData> | ApiBlobResponse | undefined> {
    const url = buildUrl(endpoint, options.pathParams, options.query);

    // --- VxNotify di loading (persistente, poi aggiornata a fine chiamata) ---
    let loadingId: number | null = null;
    if (options.showNotifyLoading) {
      loadingId = VxNotify({
        type: 'default',
        loading: true,
        duration: 0,
        message: options.loadingMessage || t('messages.loading', 'Caricamento in corso...'),
      });
    }
    const hadLoadingNotify = loadingId !== null;

    const finalizeLoading = (patch: { type: 'success' | 'error'; message: string }) => {
      if (loadingId === null) return;
      update(loadingId, {
        type: patch.type,
        loading: false,
        message: patch.message,
        duration: 2500,
      });
      loadingId = null;
    };

    const headers: Record<string, string> = { ...(options.headers || {}) };

    if (!options.skipContentType && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    if (config.getLocale) {
      headers['Accept-Language'] = config.getLocale();
    }

    if (!headers['Authorization']) {
      const token = resolveAccessToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const fetchOptions: RequestInit = {
      method: options.method || 'GET',
      headers,
    };

    if (options.body) {
      fetchOptions.body =
        options.body instanceof FormData ? options.body : JSON.stringify(options.body);
    }

    try {
      const res = await fetch(url, fetchOptions);

      // --- gestione 401 ---
      if (res.status === 401 && retry && options.doRefresh !== false) {
        const refreshToken = config.getRefreshToken?.();
        if (refreshToken) {
          const refreshSuccess = await handleRefresh();
          if (refreshSuccess) {
            if (loadingId !== null) {
              dismiss(loadingId);
              loadingId = null;
            }
            return await request(endpoint, options, false);
          }
        }
        if (loadingId !== null) {
          dismiss(loadingId);
          loadingId = null;
        }
        config.onAuthLogout?.();
        return;
      }

      if (res.status === 401 && options.doRefresh === false && options.doLogout === true) {
        if (loadingId !== null) {
          dismiss(loadingId);
          loadingId = null;
        }
        config.onAuthLogout?.();
        return;
      }

      // --- risposte binarie (zip, excel, pdf, ecc.) ---
      const contentType = res.headers.get('content-type') || '';
      const isBlobResponse =
        options.expectBlob ||
        contentType.includes('application/zip') ||
        contentType.includes('application/octet-stream') ||
        contentType.includes('application/pdf') ||
        contentType.includes('application/vnd.ms-excel') ||
        contentType.includes('application/vnd.openxmlformats-officedocument');

      if (isBlobResponse) {
        const blob = await res.blob();
        if (!res.ok) {
          const errorMsg = options.errorMessage || 'Request failed';
          finalizeLoading({ type: 'error', message: errorMsg });
          if (!hadLoadingNotify && options.showNotify) {
            VxNotify({ type: 'error', message: errorMsg });
          }
          throw { status: res.status, message: errorMsg, blob, contentType };
        }
        finalizeLoading({ type: 'success', message: options.successMessage || 'Completato' });
        if (!hadLoadingNotify && options.showNotify && !options.showOnlyErroNotify && options.successMessage) {
          VxNotify({ type: 'success', message: options.successMessage });
        }
        return { data: blob, blob, status: res.status, contentType };
      }

      // --- risposta JSON ---
      const data: any = await res.json().catch(() => ({}));
      const mapped: ApiResponse<TData> = {
        data:
          data !== null && typeof data === 'object' && Object.prototype.hasOwnProperty.call(data, 'data')
            ? data.data
            : data,
        message: data?.message,
        status: res.status,
        error: data?.error,
        raw: data,
      };

      if (!res.ok) {
        const errorMsg =
          options.errorMessage ||
          getByPath(data, options.errorMessagePath) ||
          data?.error?.description ||
          data?.error?.message ||
          data?.message ||
          res.statusText;

        finalizeLoading({ type: 'error', message: errorMsg });
        if (!hadLoadingNotify && (options.showNotify || options.showOnlyErroNotify)) {
          VxNotify({ type: 'error', message: errorMsg });
        }
        throw mapped;
      }

      const successMsg =
        options.successMessage || getByPath(data, options.successMessagePath) || data?.message;
      finalizeLoading({ type: 'success', message: successMsg || 'Completato' });
      if (!hadLoadingNotify && options.showNotify && !options.showOnlyErroNotify && successMsg) {
        VxNotify({ type: 'success', message: successMsg });
      }

      return mapped;
    } catch (error: unknown) {
      finalizeLoading({ type: 'error', message: options.errorMessage || 'Errore' });

      // errore già arricchito con blob → rilancia così com'è
      if (error && typeof error === 'object' && 'blob' in error) {
        throw error;
      }

      // errore già gestito dal blocco !res.ok (VxNotify già mostrato)
      const hasStatus = error && typeof error === 'object' && 'status' in error;

      if (!hadLoadingNotify && !hasStatus && (options.showNotify || options.showOnlyErroNotify)) {
        const message = options.errorMessage || 'Network error or parsing error';
        VxNotify({ type: 'error', message });
      }
      throw error;
    }
  }

  return { request };
}