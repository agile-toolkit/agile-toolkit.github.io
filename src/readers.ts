import type { AppData, BoardColumnPreview, StatChip } from './types'
import { trunc, plural } from './utils'

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

function chip(value: string | number, label: string): StatChip {
  return { value, label }
}

// ── moving-motivators ───────────────────────────────────────────────────────────
function readMovingMotivators(): AppData | null {
  const session = read<{
    date?: string; savedAt?: number; ranked?: string[];
    change?: string; changes?: Record<string, string>
  }>('moving-motivators:lastSession')
  if (!session?.ranked?.length) return null

  const top3 = session.ranked.slice(0, 3)
    .map(id => id.charAt(0).toUpperCase() + id.slice(1))
    .join(' · ')
  const chips: StatChip[] = [chip(top3, 'top motivators')]
  if (session.change) chips.push(chip(`"${trunc(session.change, 22)}"`, 'change'))
  return { chips, timestamp: session.savedAt }
}

// ── scrum-facilitator ───────────────────────────────────────────────────────────
function readScrumFacilitator(): AppData | null {
  const session = read<{ ceremonyType?: string; stepIndex?: number; savedAt?: number }>(
    'scrum-facilitator-session',
  )
  const history = read<Array<{ savedAt?: number }>>('scrum-facilitator-history') ?? []
  if (!session && !history.length) return null

  const labels: Record<string, string> = {
    daily: 'Daily Standup',
    planning: 'Sprint Planning',
    review: 'Sprint Review',
    retro: 'Retrospective',
    refinement: 'Refinement',
  }

  const chips: StatChip[] = []
  let live = false
  let timestamp: number | undefined

  if (session?.ceremonyType) {
    live = true
    chips.push(chip(labels[session.ceremonyType] ?? session.ceremonyType, 'in progress'))
    timestamp = session.savedAt
  }
  if (history.length) {
    chips.push(chip(history.length, plural(history.length, 'session')))
    if (!timestamp) timestamp = history[history.length - 1]?.savedAt
  }
  return { chips, timestamp, live }
}

// ── kanban-designer ──────────────────────────────────────────────────────────
function readKanbanDesigner(): AppData | null {
  type Col = { name: string; wipLimit?: number; cards?: unknown[] }
  type Board = { id: string; name: string; updatedAt?: number; columns?: Col[] }
  const boards = read<Board[]>('kanban-designer-boards') ?? []
  if (!boards.length) return null

  const currentId = localStorage.getItem('kanban-designer-current-id')
  const cur = boards.find(b => b.id === currentId) ?? boards[boards.length - 1]!

  const totalCards = boards.reduce(
    (s, b) => s + (b.columns ?? []).reduce((cs, c) => cs + (c.cards ?? []).length, 0),
    0,
  )
  const chips: StatChip[] = [chip(boards.length, plural(boards.length, 'board'))]
  if (cur.name) chips.push(chip(`"${trunc(cur.name, 18)}"`, 'active'))
  if (totalCards > 0) chips.push(chip(totalCards, plural(totalCards, 'card')))

  const boardColumns: BoardColumnPreview[] = (cur.columns ?? []).map(c => ({
    name: c.name,
    count: (c.cards ?? []).length,
    wip: c.wipLimit,
    overWip: !!c.wipLimit && (c.cards ?? []).length > c.wipLimit,
  }))

  return { chips, timestamp: cur.updatedAt, boardColumns }
}

// ── salary-formula ──────────────────────────────────────────────────────────
function readSalaryFormula(): AppData | null {
  const profiles = read<unknown[]>('salary-formula-profiles') ?? []
  const scenarios = read<Array<{ savedAt?: number }>>('salary_scenarios_v1') ?? []
  if (!profiles.length && !scenarios.length) return null

  const chips: StatChip[] = []
  if (profiles.length)  chips.push(chip(profiles.length,  plural(profiles.length,  'profile')))
  if (scenarios.length) chips.push(chip(scenarios.length, plural(scenarios.length, 'scenario')))
  return { chips, timestamp: scenarios[scenarios.length - 1]?.savedAt }
}

// ── team-identity ────────────────────────────────────────────────────────────
function readTeamIdentity(): AppData | null {
  const session = read<{
    teamName?: string; symbol?: string; valuesCount?: number;
    agreementsCount?: number; savedAt?: number
  }>('team-identity:lastSession')

  if (session) {
    const chips: StatChip[] = []
    if (session.teamName) chips.push(chip(`"${trunc(session.teamName, 20)}"`, ''))
    if (session.symbol)   chips.push(chip(session.symbol, ''))
    if (session.valuesCount)     chips.push(chip(session.valuesCount, plural(session.valuesCount, 'value')))
    if (session.agreementsCount) chips.push(chip(session.agreementsCount, plural(session.agreementsCount, 'agreement')))
    if (!chips.length) return null
    return { chips, timestamp: session.savedAt }
  }

  // Fallback to legacy key
  const ch = read<{
    teamName?: string; agreements?: unknown[]; values?: unknown[]; savedAt?: number
  }>('team-identity-charter')
  if (!ch) return null
  const chips: StatChip[] = []
  if (ch.teamName)           chips.push(chip(`"${trunc(ch.teamName, 20)}"`, ''))
  if (ch.agreements?.length) chips.push(chip(ch.agreements.length, plural(ch.agreements.length, 'agreement')))
  if (ch.values?.length)     chips.push(chip(ch.values.length, plural(ch.values.length, 'value')))
  if (!chips.length) return null
  return { chips, timestamp: ch.savedAt }
}

// ── improvement-board ───────────────────────────────────────────────────────
function readImprovementBoard(): AppData | null {
  const items   = read<Array<{ completedAt?: number; status?: string }>>('improvement-board-items')   ?? []
  const members = read<unknown[]>('improvement-board-members') ?? []
  if (!items.length && !members.length) return null

  const done = items.filter(i => !!i.completedAt || i.status === 'done' || i.status === 'completed').length
  const chips: StatChip[] = []
  if (items.length)   chips.push(chip(items.length, plural(items.length, 'item')))
  if (members.length) chips.push(chip(members.length, plural(members.length, 'member')))
  return { chips, progressDone: done, progressTotal: items.length }
}

// ── work-profiles ──────────────────────────────────────────────────────────
function readWorkProfiles(): AppData | null {
  const profiles = read<Array<{ name?: string; createdAt?: number }>>('work-profiles-data') ?? []
  const credits  = read<Array<{ points?: number }>>('work-profiles-credits') ?? []
  if (!profiles.length && !credits.length) return null

  const chips: StatChip[] = []
  if (profiles.length) chips.push(chip(profiles.length, plural(profiles.length, 'profile')))
  if (credits.length) {
    chips.push(chip(credits.length, plural(credits.length, 'credit')))
    const pts = credits.reduce((s, c) => s + (Number(c.points) || 0), 0)
    if (pts > 0) chips.push(chip(pts, 'pts'))
  }
  const memberNames = profiles.map(p => p.name ?? '?').slice(0, 6)
  return { chips, timestamp: profiles[profiles.length - 1]?.createdAt, memberNames }
}

// ── planning-poker ──────────────────────────────────────────────────────────
function readPlanningPoker(): AppData | null {
  const stories = read<Array<{ finalEstimate?: string | number }>>('sprintMetrics_planningPoker') ?? []
  if (!stories.length) return null

  const nums = stories
    .map(s => parseFloat(String(s.finalEstimate)))
    .filter(x => x > 0 && !isNaN(x))
  const chips: StatChip[] = [
    chip(stories.length, `${plural(stories.length, 'story', 'stories')} estimated`),
  ]
  if (nums.length) {
    const avg = (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1)
    chips.push(chip(avg, 'avg pts'))
  }
  return { chips }
}

// ── sprint-metrics ──────────────────────────────────────────────────────────
function readSprintMetrics(): AppData | null {
  const sprints = read<Array<{ completed?: number; planned?: number }>>('sprint-metrics-sprints') ?? []
  const config  = read<{ name?: string }>('sprint-metrics-config')
  if (!sprints.length && !config) return null

  const chips: StatChip[] = []
  if (config?.name) chips.push(chip(`"${trunc(config.name, 18)}"`, ''))
  if (sprints.length) {
    chips.push(chip(sprints.length, plural(sprints.length, 'sprint')))
    const last = sprints[sprints.length - 1]
    if (last?.completed != null) chips.push(chip(last.completed, 'last vel.'))
  }
  const velocities = sprints.map(s => Number(s.completed) || 0).filter(v => v > 0)
  return { chips, velocities }
}

// ── change-planner ──────────────────────────────────────────────────────────
function readChangePlanner(): AppData | null {
  const inits = read<Array<{
    completedAt?: number; title?: string; updatedAt?: number; createdAt?: number
  }>>('change-planner-initiatives') ?? []
  if (!inits.length) return null

  const active = inits.filter(i => !i.completedAt).length
  const chips: StatChip[] = [chip(inits.length, plural(inits.length, 'initiative'))]
  if (active > 0 && active < inits.length) chips.push(chip(active, 'active'))

  const latest = [...inits].sort(
    (a, b) => ((b.updatedAt ?? b.createdAt ?? 0) - (a.updatedAt ?? a.createdAt ?? 0)),
  )[0]
  if (latest?.title) chips.push(chip(`"${trunc(latest.title, 22)}"`, ''))
  return { chips, timestamp: latest?.updatedAt ?? latest?.createdAt }
}

// ── public API ───────────────────────────────────────────────────────────────
export function readAll(): Record<string, AppData | null> {
  return {
    'moving-motivators': readMovingMotivators(),
    'scrum-facilitator':  readScrumFacilitator(),
    'kanban-designer':    readKanbanDesigner(),
    'salary-formula':     readSalaryFormula(),
    'team-identity':      readTeamIdentity(),
    'improvement-board':  readImprovementBoard(),
    'work-profiles':      readWorkProfiles(),
    'planning-poker':     readPlanningPoker(),
    'sprint-metrics':     readSprintMetrics(),
    'change-planner':     readChangePlanner(),
  }
}
