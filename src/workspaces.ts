import { scanOwnedLocalStorage } from './data-keys'

/**
 * The workspace primitive: one named set of every app's data, so a
 * consultant or a scrum master can hold several teams on one device.
 *
 * Kept out of the component because the interesting part is not the dropdown,
 * it is what happens to a few megabytes of somebody's team data when they
 * click it. Three bugs lived here while this logic was inline:
 *
 *  - switching wrote the active *name* only, leaving the previous workspace's
 *    data on screen; the next Save then wrote it into the workspace the user
 *    had switched *to*, destroying it;
 *  - restoring wrote the snapshot over the top without clearing, so any app
 *    the incoming workspace had no entry for kept showing the outgoing team's
 *    data;
 *  - a new workspace started as a copy of whatever was on screen.
 */

export const WORKSPACES_KEY = 'agile-toolkit:workspaces'
export const ACTIVE_KEY = 'agile-toolkit:activeWorkspace'
export const DEFAULT_WORKSPACE = 'Default'

export interface WorkspaceSnapshot {
  savedAt: number
  data: Record<string, string>
}

export type Workspaces = Record<string, WorkspaceSnapshot>

export class WorkspaceQuotaError extends Error {
  constructor(public workspace: string) {
    super(`Could not save workspace "${workspace}"`)
    this.name = 'WorkspaceQuotaError'
  }
}

export function readWorkspaces(): Workspaces {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(WORKSPACES_KEY) ?? '{}')
    // Guarded, not cast: this key is as corruptible as any other, and a bad
    // value here would otherwise throw on the dashboard's first render.
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    const out: Workspaces = {}
    for (const [name, snap] of Object.entries(parsed as Record<string, unknown>)) {
      if (!snap || typeof snap !== 'object') continue
      const { savedAt, data } = snap as Partial<WorkspaceSnapshot>
      out[name] = {
        savedAt: typeof savedAt === 'number' ? savedAt : 0,
        data: data && typeof data === 'object' && !Array.isArray(data) ? data : {},
      }
    }
    return out
  } catch {
    return {}
  }
}

export function writeWorkspaces(ws: Workspaces): void {
  localStorage.setItem(WORKSPACES_KEY, JSON.stringify(ws))
}

export function readActive(): string {
  return localStorage.getItem(ACTIVE_KEY) ?? DEFAULT_WORKSPACE
}

export function writeActive(name: string): void {
  localStorage.setItem(ACTIVE_KEY, name)
}

/** Everything the apps currently have in storage, as raw strings. */
export function snapshotCurrent(): Record<string, string> {
  const snapshot: Record<string, string> = {}
  for (const key of Object.keys(scanOwnedLocalStorage())) {
    const raw = localStorage.getItem(key)
    if (raw !== null) snapshot[key] = raw
  }
  return snapshot
}

/**
 * Makes the apps' live storage match `data` exactly.
 *
 * The clear step is the point: without it a workspace is only ever additive,
 * and a team that never used Improvement Board inherits the previous team's
 * improvement items.
 *
 * Only app-owned keys are touched. `theme`, `i18nextLng` and the dashboard's
 * own `agile-toolkit:` keys are device preferences rather than team data, so
 * they follow the person across workspaces.
 */
export function restoreSnapshot(data: Record<string, string>): void {
  for (const key of Object.keys(scanOwnedLocalStorage())) {
    if (!(key in data)) localStorage.removeItem(key)
  }
  for (const [key, value] of Object.entries(data)) {
    localStorage.setItem(key, value)
  }
}

/**
 * Captures live app data into `name` and persists the result.
 *
 * Throws `WorkspaceQuotaError` rather than swallowing: a snapshot is a full
 * copy of every app's data, so N workspaces cost roughly N times one workspace
 * inside a ~5 MB origin budget, and quota is the realistic failure. A
 * workspace the user believes was saved and wasn't is the worst outcome here,
 * so this fails loudly.
 */
export function saveInto(name: string, ws: Workspaces): Workspaces {
  const next: Workspaces = { ...ws, [name]: { savedAt: Date.now(), data: snapshotCurrent() } }
  try {
    writeWorkspaces(next)
  } catch {
    throw new WorkspaceQuotaError(name)
  }
  return next
}

/**
 * Checkpoints the outgoing workspace, then loads the incoming one.
 *
 * Returns the updated map. A workspace with no snapshot yet loads as empty,
 * which is what "new workspace" means.
 */
export function switchTo(from: string, to: string, ws: Workspaces): Workspaces {
  if (from === to) return ws
  const saved = saveInto(from, ws)
  restoreSnapshot(saved[to]?.data ?? {})
  writeActive(to)
  return saved
}

/** Checkpoints the current workspace, then starts `name` genuinely empty. */
export function createWorkspace(active: string, name: string, ws: Workspaces): Workspaces {
  const saved = saveInto(active, ws)
  const next: Workspaces = { ...saved, [name]: { savedAt: 0, data: {} } }
  try {
    writeWorkspaces(next)
  } catch {
    throw new WorkspaceQuotaError(name)
  }
  restoreSnapshot({})
  writeActive(name)
  return next
}

/**
 * Removes `name`. When it is the workspace currently loaded, the data on
 * screen has to move to the fallback too — otherwise the fallback silently
 * inherits the deleted workspace's data.
 */
export function deleteWorkspace(
  name: string,
  active: string,
  ws: Workspaces,
): { workspaces: Workspaces; active: string } {
  const next = { ...ws }
  delete next[name]
  writeWorkspaces(next)
  if (active !== name) return { workspaces: next, active }

  const fallback = Object.keys(next)[0] ?? DEFAULT_WORKSPACE
  restoreSnapshot(next[fallback]?.data ?? {})
  writeActive(fallback)
  return { workspaces: next, active: fallback }
}
