import './network-check.css'
import { ENDPOINTS, probe, verdict, type Endpoint, type Outcome, type Verdict } from './probes'
import { LANGS, readLang, saveLang, toLang, translate, type Key, type Lang } from './i18n'

interface Row {
  endpoint: Endpoint
  outcome: Outcome | null
  el: HTMLElement
}

let lang: Lang = readLang()
const t = (key: Key, vars?: Record<string, string | number>) => translate(lang, key, vars)

const PORT_LABEL = (url: string) => new URL(url).port || '443'

function h<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, text?: string): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag)
  if (cls) el.className = cls
  if (text !== undefined) el.textContent = text
  return el
}

/** Fills every `data-i18n` element and the document metadata in the current language. */
function applyStatic(): void {
  document.documentElement.lang = lang
  document.title = t('doc_title')
  document.querySelector('meta[name="description"]')?.setAttribute('content', t('doc_description'))
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n as Key)
  })
  document.querySelectorAll<HTMLElement>('[data-i18n-label]').forEach(el => {
    el.setAttribute('aria-label', t(el.dataset.i18nLabel as Key))
  })
}

function renderRow(row: Row): void {
  const { endpoint, outcome, el } = row
  el.replaceChildren()
  el.dataset.state = outcome?.kind ?? 'pending'

  const main = h('div', 'nc-row-main')
  main.append(
    h('span', 'nc-name', endpoint.name),
    h('span', 'nc-meta', `${endpoint.protocol === 'mqtt' ? 'MQTT' : 'Nostr'} · ${t('port', { port: PORT_LABEL(endpoint.url) })}`),
  )
  if (!endpoint.inUse) main.append(h('span', 'nc-tag', t('candidate')))

  const status = h('div', 'nc-status')
  status.append(h('span', 'nc-status-label', outcome ? t(`status.${outcome.kind}`) : t('checking')))
  if (outcome) status.append(h('span', 'nc-ms', t('ms', { ms: outcome.ms })))

  el.append(main, status)
  // Protocol-level detail (a CONNACK reason, or the relay's own words) stays untranslated.
  if (outcome?.kind === 'refused') el.append(h('p', 'nc-detail', outcome.detail))
}

function renderVerdict(el: HTMLElement, v: Verdict): void {
  el.dataset.verdict = v
  el.replaceChildren(h('h2', 'nc-verdict-title', t(`verdict.${v}.title`)), h('p', 'nc-verdict-body', t(`verdict.${v}.body`)))
  el.hidden = false
}

/**
 * The copied report is always English: it goes to whoever maintains the
 * toolkit, who should be able to read it whatever language the sender uses.
 */
function reportText(rows: Row[], v: Verdict): string {
  const en = (key: Key) => translate('en', key)
  return [
    'Agile Toolkit network check',
    `Time: ${new Date().toISOString()}`,
    `Browser: ${navigator.userAgent}`,
    `Page language: ${lang}`,
    `Verdict: ${en(`verdict.${v}.title`)}`,
    '',
    ...rows.map(({ endpoint, outcome }) => {
      const o = outcome!
      const extra = o.kind === 'refused' ? ` (${o.detail})` : ''
      const use = endpoint.inUse ? '' : ' [candidate]'
      return `${endpoint.name}${use} ${endpoint.url}: ${en(`status.${o.kind}`)}${extra}, ${o.ms} ms`
    }),
  ].join('\n')
}

const list = document.getElementById('nc-list')!
const verdictEl = document.getElementById('nc-verdict')!
const runBtn = document.getElementById('nc-run') as HTMLButtonElement
const copyBtn = document.getElementById('nc-copy') as HTMLButtonElement
const langSelect = document.getElementById('nc-lang') as HTMLSelectElement

let rows: Row[] = []
let lastVerdict: Verdict | null = null
let copyReset: ReturnType<typeof setTimeout> | undefined

async function run(): Promise<void> {
  runBtn.disabled = true
  copyBtn.hidden = true
  verdictEl.hidden = true
  lastVerdict = null
  list.replaceChildren()

  rows = ENDPOINTS.map(endpoint => {
    const el = h('li', 'nc-row')
    list.append(el)
    const row: Row = { endpoint, outcome: null, el }
    renderRow(row)
    return row
  })

  await Promise.all(
    rows.map(async row => {
      row.outcome = await probe(row.endpoint)
      renderRow(row)
    }),
  )

  lastVerdict = verdict(rows.map(r => ({ endpoint: r.endpoint, outcome: r.outcome! })))
  renderVerdict(verdictEl, lastVerdict)
  copyBtn.hidden = false
  runBtn.disabled = false
}

copyBtn.addEventListener('click', async () => {
  if (!lastVerdict) return
  const text = reportText(rows, lastVerdict)
  try {
    await navigator.clipboard.writeText(text)
    copyBtn.textContent = t('copied')
  } catch {
    window.prompt(t('copy_prompt'), text)
  }
  clearTimeout(copyReset)
  copyReset = setTimeout(() => (copyBtn.textContent = t('copy')), 2_000)
})

for (const code of LANGS) {
  const option = h('option', undefined, code.toUpperCase())
  option.value = code
  langSelect.append(option)
}
langSelect.value = lang
langSelect.addEventListener('change', () => {
  lang = toLang(langSelect.value)
  saveLang(lang)
  applyStatic()
  rows.forEach(renderRow)
  if (lastVerdict) renderVerdict(verdictEl, lastVerdict)
})

runBtn.addEventListener('click', () => void run())
applyStatic()
void run()
