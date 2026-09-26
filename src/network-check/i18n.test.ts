import { describe, it, expect } from 'vitest'
import en from './i18n/en.json'
import es from './i18n/es.json'
import be from './i18n/be.json'
import ru from './i18n/ru.json'
import { toLang, translate } from './i18n'

const placeholders = (s: string) => [...s.matchAll(/\{\{(\w+)\}\}/g)].map(m => m[1]).sort()

describe.each([['es', es], ['be', be], ['ru', ru]] as const)('%s locale', (_code, dict) => {
  it('has exactly the English keys', () => {
    expect(Object.keys(dict).sort()).toEqual(Object.keys(en).sort())
  })

  it('keeps every placeholder and translates every sentence', () => {
    const d = dict as Record<string, string>
    for (const [key, text] of Object.entries(en)) {
      expect(placeholders(d[key]), key).toEqual(placeholders(text))
      expect(d[key].trim(), key).not.toBe('')
    }
    // Only the brand-name back link and the unit "ms" may legitimately match English.
    const same = Object.keys(en).filter(k => d[k] === (en as Record<string, string>)[k])
    expect(same.filter(k => k !== 'back' && k !== 'ms')).toEqual([])
  })
})

describe('translate', () => {
  it('fills placeholders', () => {
    expect(translate('ru', 'port', { port: 8884 })).toBe('порт 8884')
    expect(translate('en', 'ms', { ms: 42 })).toBe('42 ms')
  })

  it('leaves unknown placeholders visible rather than blank', () => {
    expect(translate('en', 'port')).toBe('port {{port}}')
  })
})

describe('toLang', () => {
  it('maps stored and regional codes to a supported language', () => {
    expect(toLang('be')).toBe('be')
    expect(toLang('es-ES')).toBe('es')
    expect(toLang('RU')).toBe('ru')
    expect(toLang('de')).toBe('en')
    expect(toLang(null)).toBe('en')
  })
})
