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
  const sessionHistory = read<Array<{ savedAt?: number; teamName?: string }>>('moving-motivators:sessionHistory') ?? []
  if (!session?.ranked?.length) return null

  const top3 = session.ranked.slice(0, 3)
    .map(id => id.charAt(0).toUpperCase() + id.slice(1))
    .join(' · ')
  const chips: StatChip[] = [chip(top3, 'top motivators')]
  if (session.change) chips.push(chip(`"${trunc(session.change, 22)}"`, 'change'))
  if (sessionHistory.length > 1) chips.push(chip(sessionHistory.length, plural(sessionHistory.length, 'session')))
  const timestamp = session.savedAt ?? sessionHistory[0]?.savedAt
  return { chips, timestamp }
}

// ── scrum-facilitator ───────────────────────────────────────────────────────────
function readScrumFacilitator(): AppData | null {
  const session = read<{
    ceremonyType?: string; stepIndex?: number; savedAt?: number
    participantCount?: number; retroNotesCount?: number
  }>(
    'scrum-facilitator-session',
  )
  const history = read<Array<{ savedAt?: number }>>('scrum-facilitator-history') ?? []
  const teamNameRaw = localStorage.getItem('scrum-facilitator-team-name')
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

  if (teamNameRaw) chips.push(chip(`"${trunc(teamNameRaw, 20)}"`, ''))
  if (session?.ceremonyType) {
    live = true
    chips.push(chip(labels[session.ceremonyType] ?? session.ceremonyType, 'in progress'))
    if (session.participantCount && session.participantCount > 0) {
      chips.push(chip(session.participantCount, plural(session.participantCount, 'participant')))
    }
    if (session.ceremonyType === 'retro' && session.retroNotesCount && session.retroNotesCount > 0) {
      chips.push(chip(session.retroNotesCount, plural(session.retroNotesCount, 'note')))
    }
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
  const session = read<{
    lastScenario?: string | null
    profileCount?: number
    totalSalaryRange?: { min: number; max: number; currency: string } | null
    updatedAt?: string
  }>('salary-formula:lastSession')

  if (session?.profileCount != null) {
    const chips: StatChip[] = [chip(session.profileCount, plural(session.profileCount, 'profile'))]
    if (session.lastScenario) chips.push(chip(`"${trunc(session.lastScenario, 18)}"`, 'scenario'))
    if (session.totalSalaryRange) {
      const { min, max, currency } = session.totalSalaryRange
      const fmt = (n: number) => n >= 1000 ? `${Math.round(n / 1000)}k` : String(n)
      chips.push(chip(`${fmt(min)}–${fmt(max)} ${currency}`, 'range'))
    }
    const ts = session.updatedAt ? new Date(session.updatedAt).getTime() : undefined
    return { chips, timestamp: ts && !isNaN(ts) ? ts : undefined }
  }

  // fallback: raw arrays
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

  const draft = read<{ charter?: unknown; step?: number; savedAt?: number }>('team-identity:draft')
  const draftIsNewer = !!draft && (!session || (draft.savedAt ?? 0) > (session.savedAt ?? 0))

  if (session || draft) {
    const chips: StatChip[] = []
    if (session?.teamName)       chips.push(chip(`"${trunc(session.teamName, 20)}"`, ''))
    if (session?.symbol)         chips.push(chip(session.symbol, ''))
    if (session?.valuesCount)    chips.push(chip(session.valuesCount, plural(session.valuesCount, 'value')))
    if (session?.agreementsCount) chips.push(chip(session.agreementsCount, plural(session.agreementsCount, 'agreement')))
    if (draftIsNewer) {
      chips.push(chip(draft!.step != null ? `step ${draft!.step}/5` : 'draft', 'in progress'))
    }
    if (!chips.length) return null
    return {
      chips,
      timestamp: draftIsNewer ? draft!.savedAt : session?.savedAt,
      live: draftIsNewer,
    }
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
  const session = read<{
    identified?: number; inProgress?: number; done?: number
    total?: number; memberCount?: number; lastUpdated?: string
  }>('improvement-board:lastSession')

  if (session?.total != null) {
    const chips: StatChip[] = []
    if (session.total > 0)     chips.push(chip(session.total, plural(session.total, 'item')))
    if (session.inProgress)    chips.push(chip(session.inProgress, 'active'))
    if (session.memberCount)   chips.push(chip(session.memberCount, plural(session.memberCount, 'member')))
    const ts = session.lastUpdated ? new Date(session.lastUpdated).getTime() : undefined
    return {
      chips,
      progressDone: session.done ?? 0,
      progressTotal: session.total,
      timestamp: ts && !isNaN(ts) ? ts : undefined,
    }
  }

  // Fallback: raw arrays
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
  const session = read<{
    profileCount?: number
    avgCapacity?: number
    topSkills?: string[]
    lastUpdated?: string
  }>('work-profiles:lastSession')

  if (session?.profileCount != null) {
    const chips: StatChip[] = [chip(session.profileCount, plural(session.profileCount, 'profile'))]
    if (session.avgCapacity != null) chips.push(chip(`${Math.round(session.avgCapacity)}%`, 'avg capacity'))
    if (session.topSkills?.length) chips.push(chip(session.topSkills.slice(0, 2).join(' · '), 'top skills'))
    const ts = session.lastUpdated ? new Date(session.lastUpdated).getTime() : undefined
    return { chips, timestamp: ts && !isNaN(ts) ? ts : undefined }
  }

  // fallback: raw arrays
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
  type PokerSession = {
    sessionName?: string; deckType?: string
    storyCount?: number; estimatedCount?: number
    avgPoints?: number | null; date?: string
  }

  const session = read<PokerSession>('planning-poker:lastSession')
  const history = read<PokerSession[]>('planning-poker:history') ?? []

  const buildChips = (s: PokerSession, sessionCount?: number): StatChip[] => {
    const chips: StatChip[] = []
    if (s.sessionName) chips.push(chip(`"${trunc(s.sessionName, 20)}"`, ''))
    const est = s.estimatedCount ?? 0
    const tot = s.storyCount ?? 0
    if (tot > 0) chips.push(chip(`${est}/${tot}`, 'estimated'))
    else if (est > 0) chips.push(chip(est, plural(est, 'story', 'stories')))
    if (s.avgPoints != null) chips.push(chip(Number(s.avgPoints).toFixed(1), 'avg pts'))
    if (sessionCount != null && sessionCount > 1) chips.push(chip(sessionCount, plural(sessionCount, 'session')))
    return chips
  }

  if (session?.storyCount != null || session?.estimatedCount != null) {
    const chips = buildChips(session, history.length)
    const ts = session.date ? new Date(session.date).getTime() : undefined
    return { chips, timestamp: ts && !isNaN(ts) ? ts : undefined }
  }

  if (history.length) {
    const h0 = history[0]!
    const chips = buildChips(h0, history.length)
    const ts = h0.date ? new Date(h0.date).getTime() : undefined
    return { chips, timestamp: ts && !isNaN(ts) ? ts : undefined }
  }

  // Final fallback: legacy key
  const stories = read<Array<{ finalEstimate?: string | number }>>('sprintMetrics_planningPoker') ?? []
  if (!stories.length) return null
  const nums = stories.map(s => parseFloat(String(s.finalEstimate))).filter(x => x > 0 && !isNaN(x))
  const chips: StatChip[] = [chip(stories.length, `${plural(stories.length, 'story', 'stories')} estimated`)]
  if (nums.length) chips.push(chip((nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1), 'avg pts'))
  return { chips }
}

// ── sprint-metrics ──────────────────────────────────────────────────────────
const MOOD_EMOJIS = ['😫', '😟', '😐', '🙂', '😄']

function readSprintMetrics(): AppData | null {
  const session = read<{
    projectName?: string
    lastVelocity?: number
    avgVelocity?: number
    sprintsRemaining?: number | null
    lastMood?: number | null
    updatedAt?: string
  }>('sprint-metrics:lastSession')

  if (session?.avgVelocity != null) {
    const chips: StatChip[] = []
    if (session.projectName) chips.push(chip(`"${trunc(session.projectName, 18)}"`, ''))
    if (session.lastVelocity != null) chips.push(chip(session.lastVelocity, 'last vel.'))
    chips.push(chip(session.avgVelocity, 'avg vel.'))
    if (session.sprintsRemaining != null) chips.push(chip(session.sprintsRemaining, plural(session.sprintsRemaining, 'sprint left')))
    if (session.lastMood != null && session.lastMood >= 1 && session.lastMood <= 5) {
      chips.push(chip(MOOD_EMOJIS[session.lastMood - 1]!, 'mood'))
    }
    const rawSprints = read<Array<{ completed?: number }>>('sprint-metrics-sprints') ?? []
    const velocities = rawSprints.map(s => Number(s.completed) || 0).filter(v => v > 0)
    const ts = session.updatedAt ? new Date(session.updatedAt).getTime() : undefined
    return { chips, velocities: velocities.length ? velocities : undefined, timestamp: ts && !isNaN(ts) ? ts : undefined }
  }

  // fallback: raw arrays
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
  type FacetId = 'dance' | 'mind' | 'stimulate' | 'change'
  type Action = { facet?: FacetId; status?: string; dueDate?: string }
  type Initiative = {
    completedAt?: number; title?: string; goal?: string
    updatedAt?: number; createdAt?: number
    facetNotes?: Record<string, string>; actions?: Action[]
  }
  const FACETS: FacetId[] = ['dance', 'mind', 'stimulate', 'change']

  const inits = read<Initiative[]>('change-planner-initiatives') ?? []
  if (!inits.length) return null

  const activeInits = inits.filter(i => !i.completedAt)
  const active = activeInits.length

  const chips: StatChip[] = [chip(inits.length, plural(inits.length, 'initiative'))]
  if (active > 0 && active < inits.length) chips.push(chip(active, 'active'))

  const top = [...(activeInits.length ? activeInits : inits)].sort(
    (a, b) => ((b.updatedAt ?? b.createdAt ?? 0) - (a.updatedAt ?? a.createdAt ?? 0)),
  )[0]

  if (top?.title) chips.push(chip(`"${trunc(top.title, 22)}"`, ''))
  if (top?.goal) chips.push(chip(trunc(top.goal, 40), 'goal'))

  const actions = top?.actions ?? []
  const today = new Date().toISOString().slice(0, 10)
  const openCount = actions.filter(a => a.status !== 'done').length
  const overdueCount = actions.filter(a => a.status !== 'done' && !!a.dueDate && a.dueDate < today).length
  if (openCount > 0) chips.push(chip(openCount, plural(openCount, 'open action')))
  if (overdueCount > 0) chips.push(chip(overdueCount, 'overdue'))

  const facetCoverage = FACETS.map(fid => {
    const hasNote = !!(top?.facetNotes?.[fid]?.trim())
    const hasAction = actions.some(a => a.facet === fid)
    return hasNote || hasAction
  })

  return {
    chips,
    timestamp: top?.updatedAt ?? top?.createdAt,
    facetCoverage,
  }
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
