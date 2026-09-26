import { describe, it, expect } from 'vitest'
import {
  mqttConnectPacket, connackReturnCode, probeMqtt, probeNostr, verdict, ENDPOINTS, type Outcome,
} from './probes'

type Reply = (sent: unknown, ws: FakeSocket) => void

/** A WebSocket stand-in whose server side is scripted per test. */
class FakeSocket {
  static readonly CONNECTING = 0
  static readonly OPEN = 1
  static readonly CLOSING = 2
  static readonly CLOSED = 3
  static script: { open: boolean; reply?: Reply } = { open: true }
  static last: FakeSocket | null = null

  readyState = FakeSocket.CONNECTING
  binaryType = 'blob'
  sent: unknown[] = []
  onopen: (() => void) | null = null
  onmessage: ((ev: { data: unknown }) => void) | null = null
  onerror: (() => void) | null = null
  onclose: (() => void) | null = null

  constructor(readonly url: string, readonly protocols?: string) {
    FakeSocket.last = this
    const { open } = FakeSocket.script
    setTimeout(() => {
      if (open) {
        this.readyState = FakeSocket.OPEN
        this.onopen?.()
      } else {
        this.onerror?.()
        this.onclose?.()
      }
    }, 0)
  }

  send(data: unknown) {
    this.sent.push(data)
    const { reply } = FakeSocket.script
    if (reply) setTimeout(() => reply(data, this), 0)
  }

  deliver(data: unknown) {
    this.onmessage?.({ data })
  }

  close() {
    this.readyState = FakeSocket.CLOSED
  }
}

const opts = (timeoutMs = 200) => ({ WebSocketImpl: FakeSocket as unknown as typeof WebSocket, timeoutMs })
const buf = (...b: number[]) => Uint8Array.from(b).buffer

describe('MQTT packets', () => {
  it('builds a valid 3.1.1 CONNECT', () => {
    const p = mqttConnectPacket('abc')
    expect([...p]).toEqual([0x10, 15, 0, 4, 0x4d, 0x51, 0x54, 0x54, 4, 2, 0, 60, 0, 3, 0x61, 0x62, 0x63])
  })

  it('reads the CONNACK return code', () => {
    expect(connackReturnCode(Uint8Array.from([0x20, 2, 0, 0]))).toBe(0)
    expect(connackReturnCode(Uint8Array.from([0x20, 2, 0, 5]))).toBe(5)
    expect(connackReturnCode(Uint8Array.from([0x30, 2, 0, 0]))).toBeNull()
    expect(connackReturnCode(Uint8Array.from([0x20]))).toBeNull()
  })
})

describe('probeMqtt', () => {
  it('passes on an accepting CONNACK and says goodbye', async () => {
    FakeSocket.script = { open: true, reply: (_s, ws) => ws.deliver(buf(0x20, 2, 0, 0)) }
    const out = await probeMqtt('wss://broker', opts())
    expect(out.kind).toBe('pass')
    const ws = FakeSocket.last!
    expect(ws.protocols).toBe('mqtt')
    expect((ws.sent[0] as Uint8Array)[0]).toBe(0x10)
    expect([...(ws.sent[1] as Uint8Array)]).toEqual([0xe0, 0])
  })

  it('reports a rejecting CONNACK as refused', async () => {
    FakeSocket.script = { open: true, reply: (_s, ws) => ws.deliver(buf(0x20, 2, 0, 5)) }
    expect(await probeMqtt('wss://broker', opts())).toMatchObject({ kind: 'refused', detail: 'not authorised' })
  })

  it('reports a non-MQTT reply (e.g. a proxy error page) as refused', async () => {
    FakeSocket.script = { open: true, reply: (_s, ws) => ws.deliver('<html>blocked</html>') }
    expect(await probeMqtt('wss://broker', opts())).toMatchObject({ kind: 'refused', detail: 'reply was not MQTT' })
  })

  it('reports a socket that never opens as blocked', async () => {
    FakeSocket.script = { open: false }
    expect((await probeMqtt('wss://broker', opts())).kind).toBe('blocked')
  })

  it('times out when the broker stays silent', async () => {
    FakeSocket.script = { open: true }
    expect((await probeMqtt('wss://broker', opts(30))).kind).toBe('timeout')
  })
})

describe('probeNostr', () => {
  const subOf = (sent: unknown) => (JSON.parse(String(sent)) as string[])[1]

  it('passes on EOSE for its own subscription and closes it', async () => {
    FakeSocket.script = {
      open: true,
      reply: (s, ws) => {
        if ((JSON.parse(String(s)) as string[])[0] === 'REQ') ws.deliver(JSON.stringify(['EOSE', subOf(s)]))
      },
    }
    expect((await probeNostr('wss://relay', opts())).kind).toBe('pass')
    const [req, close] = FakeSocket.last!.sent.map(s => JSON.parse(String(s)) as unknown[])
    expect(req[0]).toBe('REQ')
    expect(req[2]).toEqual({ kinds: [20888], limit: 0 })
    expect(close).toEqual(['CLOSE', req[1]])
  })

  it('ignores an EOSE for someone else’s subscription', async () => {
    FakeSocket.script = { open: true, reply: (_s, ws) => ws.deliver(JSON.stringify(['EOSE', 'other'])) }
    expect((await probeNostr('wss://relay', opts(30))).kind).toBe('timeout')
  })

  it('reports CLOSED with the relay’s reason', async () => {
    FakeSocket.script = { open: true, reply: (s, ws) => ws.deliver(JSON.stringify(['CLOSED', subOf(s), 'auth-required: sign in'])) }
    expect(await probeNostr('wss://relay', opts())).toMatchObject({ kind: 'refused', detail: 'auth-required: sign in' })
  })
})

describe('verdict', () => {
  const pass: Outcome = { kind: 'pass', ms: 10 }
  const fail: Outcome = { kind: 'blocked', ms: 10 }
  const byName = (name: string) => ENDPOINTS.find(e => e.name === name)!
  const run = (passing: string[]) => ENDPOINTS.map(endpoint => ({ endpoint, outcome: passing.includes(endpoint.name) ? pass : fail }))

  it('judges only the relays the apps use', () => {
    expect(verdict(run(['HiveMQ', 'Damus']))).toBe('works')
    expect(verdict(run(['nos.lol']))).toBe('nostr-only')
    expect(verdict(run(['EMQX']))).toBe('mqtt-only')
    expect(verdict(run(['Mosquitto', 'Primal']))).toBe('none')
    expect(byName('Mosquitto').inUse).toBe(false)
  })
})
