import './network-check.css'
import { ENDPOINTS, probe, verdict, type Endpoint, type Outcome, type Verdict } from './probes'

interface Row {
  endpoint: Endpoint
  outcome: Outcome | null
  el: HTMLElement
}

const PORT_LABEL = (url: string) => new URL(url).port || '443'

const STATUS_TEXT: Record<Outcome['kind'], string> = {
  pass: 'Reachable',
  refused: 'Connected, but refused',
  blocked: 'Blocked',
  timeout: 'No answer',
}

const VERDICT_TEXT: Record<Verdict, { title: string; body: string }> = {
  works: {
    title: 'Team sessions will work on this network',
    body: 'Both transports are reachable. Sessions use MQTT brokers and Nostr relays at once.',
  },
  'nostr-only': {
    title: 'Team sessions will work, over Nostr only',
    body: 'The MQTT ports are blocked here, but the Nostr relays on port 443 get through. Sessions still connect; late joiners catch up slightly more slowly.',
  },
  'mqtt-only': {
    title: 'Team sessions will work, over MQTT only',
    body: 'The Nostr relays are blocked here, but the MQTT brokers get through.',
  },
  none: {
    title: 'Team sessions can’t connect from this network',
    body: 'None of the relays the apps use answered. Solo mode still works. Send the results below to whoever maintains the toolkit.',
  },
}

function h<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, text?: string): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag)
  if (cls) el.className = cls
  if (text !== undefined) el.textContent = text
  return el
}

function renderRow(row: Row): void {
  const { endpoint, outcome, el } = row
  el.replaceChildren()
  el.dataset.state = outcome?.kind ?? 'pending'

  const main = h('div', 'nc-row-main')
  const name = h('span', 'nc-name', endpoint.name)
  const meta = h('span', 'nc-meta', `${endpoint.protocol === 'mqtt' ? 'MQTT' : 'Nostr'} · port ${PORT_LABEL(endpoint.url)}`)
  main.append(name, meta)
  if (!endpoint.inUse) main.append(h('span', 'nc-tag', 'candidate'))

  const status = h('div', 'nc-status')
  const label = h('span', 'nc-status-label', outcome ? STATUS_TEXT[outcome.kind] : 'Checking…')
  status.append(label)
  if (outcome) status.append(h('span', 'nc-ms', `${outcome.ms} ms`))

  el.append(main, status)
  if (outcome?.kind === 'refused') el.append(h('p', 'nc-detail', outcome.detail))
}

function reportText(rows: Row[], v: Verdict): string {
  const lines = [
    'Agile Toolkit network check',
    `Time: ${new Date().toISOString()}`,
    `Browser: ${navigator.userAgent}`,
    `Verdict: ${VERDICT_TEXT[v].title}`,
    '',
    ...rows.map(({ endpoint, outcome }) => {
      const o = outcome!
      const extra = o.kind === 'refused' ? ` (${o.detail})` : ''
      const use = endpoint.inUse ? '' : ' [candidate]'
      return `${endpoint.name}${use} ${endpoint.url}: ${STATUS_TEXT[o.kind]}${extra}, ${o.ms} ms`
    }),
  ]
  return lines.join('\n')
}

async function run(list: HTMLElement, verdictEl: HTMLElement, runBtn: HTMLButtonElement, copyBtn: HTMLButtonElement) {
  runBtn.disabled = true
  copyBtn.hidden = true
  verdictEl.hidden = true
  list.replaceChildren()

  const rows: Row[] = ENDPOINTS.map(endpoint => {
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

  const v = verdict(rows.map(r => ({ endpoint: r.endpoint, outcome: r.outcome! })))
  verdictEl.dataset.verdict = v
  verdictEl.replaceChildren(h('h2', 'nc-verdict-title', VERDICT_TEXT[v].title), h('p', 'nc-verdict-body', VERDICT_TEXT[v].body))
  verdictEl.hidden = false

  const text = reportText(rows, v)
  copyBtn.hidden = false
  copyBtn.onclick = async () => {
    try {
      await navigator.clipboard.writeText(text)
      copyBtn.textContent = 'Copied'
    } catch {
      window.prompt('Copy the results:', text)
    }
    setTimeout(() => (copyBtn.textContent = 'Copy results'), 2_000)
  }

  runBtn.disabled = false
  runBtn.textContent = 'Run again'
}

const list = document.getElementById('nc-list')!
const verdictEl = document.getElementById('nc-verdict')!
const runBtn = document.getElementById('nc-run') as HTMLButtonElement
const copyBtn = document.getElementById('nc-copy') as HTMLButtonElement
runBtn.addEventListener('click', () => void run(list, verdictEl, runBtn, copyBtn))
void run(list, verdictEl, runBtn, copyBtn)
