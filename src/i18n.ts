import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './i18n/en.json'
import es from './i18n/es.json'
import be from './i18n/be.json'
import ru from './i18n/ru.json'

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, es: { translation: es }, be: { translation: be }, ru: { translation: ru } },
  lng: (() => {
    try { return localStorage.getItem('i18nextLng') ?? 'en' } catch { return 'en' }
  })(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

i18n.on('languageChanged', (lng) => {
  try { localStorage.setItem('i18nextLng', lng) } catch { /* ignore */ }
})

export default i18n
