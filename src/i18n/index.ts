import { createI18n } from 'vue-i18n'

import it from './locales/it'
import en from './locales/en'

const messages = {
  it,
  en
}

const i18n = createI18n({
  legacy: false,
  locale: 'it',
  fallbackLocale: 'en',
  messages
})

export default i18n