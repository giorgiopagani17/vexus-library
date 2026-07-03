import { inject, type App, type InjectionKey } from 'vue';
import type { ApiClientConfig } from '@/Library/core/types/apiTypes';

export const API_CONFIG_KEY: InjectionKey<ApiClientConfig> = Symbol('vexus-api-config');

/**
 * Plugin da registrare nel progetto consumer:
 *
 *   import { createApiClient } from '@vexus/api';
 *
 *   app.use(createApiClient({
 *     baseUrl: env.apiUrl,
 *     getAccessToken: () => useAuthStore().accessToken,
 *     getRefreshToken: () => useAuthStore().refreshToken,
 *     refreshAccessToken: () => useAuthStore().refreshAccessToken(),
 *     onAuthLogout: () => {
 *       useAuthStore().logout();
 *       window.location.href = '/';
 *     },
 *     getLocale: () => normalizeLocale(i18n.global.locale.value),
 *     translate: (key, fallback) => i18n.global.t(key) || fallback,
 *     storageTokenKey: 'reset_password_token',
 *   }));
 *
 * Da quel momento in poi, ogni componente Vexus (o del progetto) può fare
 * semplicemente `useVxApi().VxRequest(...)` senza sapere nulla di store/env.
 */
export function createApiClient(config: ApiClientConfig) {
  return {
    install(app: App) {
      app.provide(API_CONFIG_KEY, config);
    },
  };
}

export function VxApiConfig(): ApiClientConfig {
  const config = inject(API_CONFIG_KEY);
  if (!config) {
    throw new Error(
      '[vexus] useVxApi: nessuna configurazione trovata. ' +
      'Registra il plugin prima di usare useVxApi():\n' +
      "  app.use(createApiClient({ baseUrl, getAccessToken, ... }))"
    );
  }
  return config;
}