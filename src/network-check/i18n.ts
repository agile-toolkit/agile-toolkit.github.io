import en from './i18n/en.json'
import es from './i18n/es.json'
import be from './i18n/be.json'
import ru from './i18n/ru.json'

export type Key = keyof typeof en
export const LANGS = ['en', 'es', 'be', 'ru'] as const
export type Lang = (typeof LANGS)[number]

const DICTS: Record<Lang, Record<string, string>> = { en, es, be, ru }

/** Same key the dashboard's i18next setup reads and writes, so both pages share one choice. */
export const LANG_STORAGE_KEY = 'i18nextLng'

export function toLang(value: string | null | undefined): Lang {
  const code = (value ?? '').slice(0, 2).toLowerCase()
  return (LANGS as readonly string[]).includes(code) ? (code as Lang) : 'en'
}

export function readLang(): Lang {
  try {
    return toLang(localStorage.getItem(LANG_STORAGE_KEY))
  } catch {
    return 'en'
  }
}

export function saveLang(lang: Lang): void {
  try {
    localStorage.setItem(LANG_STORAGE_KEY, lang)
  } catch {
    /* private mode: the choice just won't persist */
  }
}

/** Looks `key` up in `lang`, falling back to English, and fills `{{name}}` placeholders. */
export function translate(lang: Lang, key: Key, vars: Record<string, string | number> = {}): string {
  const template = DICTS[lang][key] ?? en[key]
  return template.replace(/\{\{(\w+)\}\}/g, (m, name: string) => (name in vars ? String(vars[name]) : m))
}
