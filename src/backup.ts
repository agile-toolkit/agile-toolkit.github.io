/**
 * Backup file format for the Agile Toolkit suite.
 *
 * v1 (legacy, import-only)
 * ────────────────────────
 * Data keys live at the root alongside _meta. Produced by the first
 * export/import implementation. Still accepted on import.
 * {
 *   "_meta": { "version": 1, "exportedAt": "...", "keyCount": N },
 *   "moving-motivators:lastSession": { ... },
 *   ...
 * }
 *
 * v2 (current)
 * ────────────
 * Data is nested under a "data" key, giving _meta room to grow without
 * collisions. Adds "workspace" and "appIds" for future multi-team use.
 * {
 *   "_meta": {
 *     "version": 2,
 *     "exportedAt": "...",
 *     "workspace": "Default",
 *     "keyCount": N,
 *     "appIds": ["moving-motivators", ...]
 *   },
 *   "data": {
 *     "moving-motivators:lastSession": { ... },
 *     ...
 *   }
 * }
 *
 * Multi-team / workspace note
 * ───────────────────────────
 * When workspace management (dashboard #10) ships, the exporter will read
 * the active workspace name from localStorage("agile-toolkit:activeWorkspace")
 * and embed it in _meta.workspace. The importer will offer a destination
 * workspace selector ("Restore into workspace: [Default ▾]"). No format
 * change is needed — the v2 envelope already supports this.
 */

export interface BackupMeta {
  version: number
  exportedAt: string
  workspace: string
  keyCount: number
  appIds: string[]
}

export interface BackupV2 {
  _meta: BackupMeta
  data: Record<string, unknown>
}

export interface BackupV1 {
  _meta: { version: 1; exportedAt: string; keyCount: number }
  [key: string]: unknown
}

export type AnyBackup = BackupV2 | BackupV1

/**
 * Parses raw JSON and extracts a normalised { meta, data } pair regardless
 * of which backup version the file uses.
 *
 * Throws if the JSON is unparseable or has no _meta.
 */
export function parseBackup(json: string): { meta: BackupMeta; data: Record<string, unknown> } {
  const raw = JSON.parse(json) as Record<string, unknown>
  if (!raw._meta || typeof raw._meta !== 'object') throw new Error('Not a valid Agile Toolkit backup file.')

  const meta = raw._meta as Record<string, unknown>
  const version = Number(meta.version ?? 1)

  if (version >= 2) {
    const b = raw as unknown as BackupV2
    return {
      meta: b._meta,
      data: (b.data && typeof b.data === 'object' && !Array.isArray(b.data))
        ? b.data
        : {},
    }
  }

  // v1: data keys sit at root alongside _meta
  const data: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(raw)) {
    if (key !== '_meta') data[key] = val
  }
  return {
    meta: {
      version: 1,
      exportedAt: String(meta.exportedAt ?? ''),
      workspace: 'Default',
      keyCount: Number(meta.keyCount ?? Object.keys(data).length),
      appIds: [],
    },
    data,
  }
}

/** Reads the active workspace name from localStorage (falls back to "Default"). */
export function activeWorkspaceName(): string {
  try {
    return localStorage.getItem('agile-toolkit:activeWorkspace') ?? 'Default'
  } catch {
    return 'Default'
  }
}
