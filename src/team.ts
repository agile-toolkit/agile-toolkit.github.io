// Cross-app team identity contract (agile-toolkit:activeTeam).
// See GOAL.md / ROADMAP.md E2 and README.md `## localStorage keys`.
//
// Written by whichever app last set a team name (starting with Team
// Identity), read by the Dashboard and, in future per-app epics, by any
// tool that currently asks the user for its own team name.

export interface ActiveTeam {
  name: string
  source: string
  updatedAt: number
}

const KEY = 'agile-toolkit:activeTeam'

export function readActiveTeam(): ActiveTeam | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<ActiveTeam>
    return parsed?.name ? (parsed as ActiveTeam) : null
  } catch {
    return null
  }
}

// No-ops when the name/source already match, so polling loops don't spam
// `storage` events or rewrite `updatedAt` on every refresh tick.
export function writeActiveTeam(name: string, source: string): void {
  const trimmed = name.trim()
  if (!trimmed) return
  try {
    const current = readActiveTeam()
    if (current?.name === trimmed && current.source === source) return
    localStorage.setItem(KEY, JSON.stringify({ name: trimmed, source, updatedAt: Date.now() }))
  } catch {
    /* storage unavailable or quota exceeded */
  }
}
