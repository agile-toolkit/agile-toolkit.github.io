/**
 * Central registry of all localStorage keys used by the Agile Toolkit suite.
 *
 * Ownership is determined by prefix matching first, then by exact legacy keys.
 * This means new keys added by an app are automatically claimed — without
 * requiring updates to this file — as long as the app uses a registered prefix.
 *
 * Multi-team / workspace note
 * ───────────────────────────
 * When workspace management lands (dashboard issue #10), namespaced keys will
 * follow the pattern:  agile-toolkit:workspace:<name>:<original-key>
 * The `agile-toolkit:` prefix is reserved for dashboard-internal keys and is
 * NOT included in per-app groups so workspace snapshots are never double-exported.
 * The backup format (v2) carries a `workspace` field in _meta; exporters and
 * importers use it to scope snapshots correctly once workspaces exist.
 */

export interface AppKeyGroup {
  appId: string
  appTitle: string
  /** Any localStorage key that starts with one of these is owned by this app. */
  keyPrefixes: string[]
  /**
   * Exact legacy key names that do not follow any prefix convention.
   * These are covered via exact match after prefix matching fails.
   */
  legacyKeys: string[]
}

export const APP_KEY_GROUPS: AppKeyGroup[] = [
  {
    appId: 'moving-motivators',
    appTitle: 'Moving Motivators',
    keyPrefixes: ['moving-motivators:'],
    legacyKeys: [],
  },
  {
    appId: 'scrum-facilitator',
    appTitle: 'Scrum Facilitator',
    keyPrefixes: ['scrum-facilitator-', 'scrum-facilitator:'],
    legacyKeys: [],
  },
  {
    appId: 'kanban-designer',
    appTitle: 'Kanban Designer',
    keyPrefixes: ['kanban-designer-', 'kanban-designer:'],
    legacyKeys: [],
  },
  {
    appId: 'salary-formula',
    appTitle: 'Salary Formula',
    keyPrefixes: ['salary-formula-', 'salary-formula:'],
    legacyKeys: ['salary_scenarios_v1', 'sprint_metrics_salary_bridge_v1'],
  },
  {
    appId: 'team-identity',
    appTitle: 'Team Identity',
    keyPrefixes: ['team-identity:', 'team-identity-'],
    legacyKeys: [],
  },
  {
    appId: 'improvement-board',
    appTitle: 'Improvement Board',
    keyPrefixes: ['improvement-board-', 'improvement-board:'],
    legacyKeys: [],
  },
  {
    appId: 'work-profiles',
    appTitle: 'Work Profiles',
    keyPrefixes: ['work-profiles-', 'work-profiles:', 'wp-profiles-'],
    legacyKeys: [],
  },
  {
    appId: 'planning-poker',
    appTitle: 'Planning Poker',
    keyPrefixes: ['planning-poker:', 'planning-poker-'],
    legacyKeys: ['sprintMetrics_planningPoker'],
  },
  {
    appId: 'sprint-metrics',
    appTitle: 'Sprint Metrics',
    keyPrefixes: ['sprint-metrics-', 'sprint-metrics:'],
    legacyKeys: [],
  },
  {
    appId: 'change-planner',
    appTitle: 'Change Planner',
    keyPrefixes: ['change-planner-', 'change-planner:'],
    legacyKeys: [],
  },
]

/** Returns the appId that owns this key, or null if it belongs to no known app. */
export function claimedByApp(key: string): string | null {
  for (const group of APP_KEY_GROUPS) {
    if (group.keyPrefixes.some(p => key.startsWith(p))) return group.appId
    if (group.legacyKeys.includes(key)) return group.appId
  }
  return null
}

/**
 * Scans ALL localStorage keys and returns a map of key → parsed value for
 * every key owned by a known app. This is the correct source for export:
 * it captures new keys added by apps without requiring this file to be updated.
 */
export function scanOwnedLocalStorage(): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key || claimedByApp(key) === null) continue
    const raw = localStorage.getItem(key)
    if (raw === null) continue
    try { result[key] = JSON.parse(raw) } catch { result[key] = raw }
  }
  return result
}

/** Returns the appIds that have at least one key present in the given data map. */
export function appsInData(data: Record<string, unknown>): string[] {
  const seen = new Set<string>()
  for (const key of Object.keys(data)) {
    const appId = claimedByApp(key)
    if (appId) seen.add(appId)
  }
  return APP_KEY_GROUPS.filter(g => seen.has(g.appId)).map(g => g.appId)
}

/** Human-readable app titles for a list of appIds, in suite order. */
export function appTitlesFor(appIds: string[]): string[] {
  const set = new Set(appIds)
  return APP_KEY_GROUPS.filter(g => set.has(g.appId)).map(g => g.appTitle)
}
