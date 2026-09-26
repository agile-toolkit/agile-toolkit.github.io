/**
 * Reachability probes for the public relays that carry team sessions in
 * Planning Poker and Moving Motivators (their `src/live/channels.ts`).
 *
 * Each probe opens a real WebSocket from the visitor's network and waits for
 * a protocol-level answer, not just a TCP/TLS handshake: an MQTT CONNACK from
 * a broker, an EOSE from a Nostr relay. A corporate proxy that accepts the
 * socket but mangles the traffic therefore still shows up as a failure.
 */

export type Protocol = 'mqtt' | 'nostr'

export interface Endpoint {
  name: string
  protocol: Protocol
  url: string
  /** True for the relays the apps connect to today. */
  inUse: boolean
}

export const ENDPOINTS: Endpoint[] = [
  { name: 'HiveMQ', protocol: 'mqtt', url: 'wss://broker.hivemq.com:8884/mqtt', inUse: true },
  { name: 'EMQX', protocol: 'mqtt', url: 'wss://broker.emqx.io:8084/mqtt', inUse: true },
  { name: 'Mosquitto', protocol: 'mqtt', url: 'wss://test.mosquitto.org:8081/mqtt', inUse: false },
  { name: 'Damus', protocol: 'nostr', url: 'wss://relay.damus.io', inUse: true },
  { name: 'nos.lol', protocol: 'nostr', url: 'wss://nos.lol', inUse: true },
  { name: 'Primal', protocol: 'nostr', url: 'wss://relay.primal.net', inUse: false },
]

export type Outcome =
  /** Relay answered at the protocol level. */
  | { kind: 'pass'; ms: number }
  /** Socket opened, but the relay refused or the reply wasn't the protocol. */
  | { kind: 'refused'; ms: number; detail: string }
  /** Socket failed or closed before the relay answered. */
  | { kind: 'blocked'; ms: number }
  /** No answer within the time limit. */
  | { kind: 'timeout'; ms: number }

export interface ProbeOptions {
  timeoutMs?: number
  WebSocketImpl?: typeof WebSocket
  now?: () => number
}

/** Same connect timeout the apps use before giving up on a broker. */
export const DEFAULT_TIMEOUT_MS = 8_000

/** An MQTT 3.1.1 CONNECT packet: clean session, 60 s keepalive, no credentials. */
export function mqttConnectPacket(clientId: string): Uint8Array {
  const id = new TextEncoder().encode(clientId)
  if (id.length > 23) throw new Error('MQTT 3.1.1 client ids are at most 23 bytes')
  const body = [0x00, 0x04, 0x4d, 0x51, 0x54, 0x54, 0x04, 0x02, 0x00, 0x3c, 0x00, id.length, ...id]
  // Remaining length fits in one byte (< 128) for any id this short.
  return Uint8Array.from([0x10, body.length, ...body])
}

export const MQTT_DISCONNECT = Uint8Array.from([0xe0, 0x00])

/**
 * The return code of a CONNACK packet (0 = accepted), or null if the bytes
 * are not a CONNACK.
 */
export function connackReturnCode(bytes: Uint8Array): number | null {
  if (bytes.length < 4 || bytes[0] !== 0x20 || bytes[1] !== 0x02) return null
  return bytes[3]
}

const CONNACK_REASONS: Record<number, string> = {
  1: 'unsupported protocol version',
  2: 'client id rejected',
  3: 'server unavailable',
  4: 'bad username or password',
  5: 'not authorised',
}

function randomId(prefix: string): string {
  return prefix + Math.random().toString(36).slice(2, 12)
}

/**
 * Opens `url`, calls `onOpen` once connected, and feeds each message to
 * `onMessage` until one of them settles the probe.
 */
function runProbe(
  url: string,
  protocols: string | undefined,
  opts: ProbeOptions,
  onOpen: (ws: WebSocket) => void,
  onMessage: (data: unknown, settle: (o: Outcome) => void, elapsed: () => number) => void,
  onFinish: (ws: WebSocket) => void,
): Promise<Outcome> {
  const WS = opts.WebSocketImpl ?? WebSocket
  const now = opts.now ?? (() => performance.now())
  const start = now()
  const elapsed = () => Math.round(now() - start)

  return new Promise<Outcome>(resolve => {
    let ws: WebSocket
    let done = false
    let timer: ReturnType<typeof setTimeout> | undefined

    const settle = (o: Outcome) => {
      if (done) return
      done = true
      clearTimeout(timer)
      try {
        if (ws.readyState === WS.OPEN) onFinish(ws)
        ws.close()
      } catch {
        /* already closing */
      }
      resolve(o)
    }

    try {
      ws = protocols === undefined ? new WS(url) : new WS(url, protocols)
    } catch {
      resolve({ kind: 'blocked', ms: elapsed() })
      return
    }
    ws.binaryType = 'arraybuffer'
    timer = setTimeout(() => settle({ kind: 'timeout', ms: elapsed() }), opts.timeoutMs ?? DEFAULT_TIMEOUT_MS)
    ws.onopen = () => onOpen(ws)
    ws.onmessage = ev => onMessage(ev.data, settle, elapsed)
    ws.onerror = () => settle({ kind: 'blocked', ms: elapsed() })
    ws.onclose = () => settle({ kind: 'blocked', ms: elapsed() })
  })
}

/** Passes once the broker returns an accepting CONNACK. */
export function probeMqtt(url: string, opts: ProbeOptions = {}): Promise<Outcome> {
  return runProbe(
    url,
    'mqtt',
    opts,
    ws => ws.send(mqttConnectPacket(randomId('at-check-'))),
    (data, settle, elapsed) => {
      const bytes = data instanceof ArrayBuffer ? new Uint8Array(data) : null
      const code = bytes ? connackReturnCode(bytes) : null
      if (code === 0) settle({ kind: 'pass', ms: elapsed() })
      else if (code !== null) settle({ kind: 'refused', ms: elapsed(), detail: CONNACK_REASONS[code] ?? `CONNACK code ${code}` })
      else settle({ kind: 'refused', ms: elapsed(), detail: 'reply was not MQTT' })
    },
    ws => ws.send(MQTT_DISCONNECT),
  )
}

/**
 * Passes once the relay ends an (empty) subscription with EOSE. Uses the same
 * ephemeral event kind the apps subscribe to.
 */
export function probeNostr(url: string, opts: ProbeOptions = {}): Promise<Outcome> {
  const subId = randomId('chk')
  return runProbe(
    url,
    undefined,
    opts,
    ws => ws.send(JSON.stringify(['REQ', subId, { kinds: [20888], limit: 0 }])),
    (data, settle, elapsed) => {
      let msg: unknown
      try {
        msg = JSON.parse(String(data))
      } catch {
        settle({ kind: 'refused', ms: elapsed(), detail: 'reply was not Nostr' })
        return
      }
      if (!Array.isArray(msg)) return
      if (msg[0] === 'EOSE' && msg[1] === subId) settle({ kind: 'pass', ms: elapsed() })
      else if (msg[0] === 'CLOSED' || msg[0] === 'NOTICE') {
        const text = String(msg[msg[0] === 'CLOSED' ? 2 : 1] ?? '').slice(0, 120)
        settle({ kind: 'refused', ms: elapsed(), detail: text || 'relay refused the request' })
      }
    },
    ws => ws.send(JSON.stringify(['CLOSE', subId])),
  )
}

export function probe(endpoint: Endpoint, opts: ProbeOptions = {}): Promise<Outcome> {
  return endpoint.protocol === 'mqtt' ? probeMqtt(endpoint.url, opts) : probeNostr(endpoint.url, opts)
}

export type Verdict = 'works' | 'nostr-only' | 'mqtt-only' | 'none'

/** Whether a team session can connect, judged by the relays the apps use today. */
export function verdict(results: ReadonlyArray<{ endpoint: Endpoint; outcome: Outcome }>): Verdict {
  const used = results.filter(r => r.endpoint.inUse && r.outcome.kind === 'pass')
  const mqtt = used.some(r => r.endpoint.protocol === 'mqtt')
  const nostr = used.some(r => r.endpoint.protocol === 'nostr')
  if (mqtt && nostr) return 'works'
  if (nostr) return 'nostr-only'
  if (mqtt) return 'mqtt-only'
  return 'none'
}
