import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import {
  ACTIVE_KEY,
  WORKSPACES_KEY,
  createWorkspace,
  deleteWorkspace,
  readActive,
  readWorkspaces,
  restoreSnapshot,
  saveInto,
  snapshotCurrent,
  switchTo,
  writeWorkspaces,
  WorkspaceQuotaError,
  type Workspaces,
} from './workspaces'

/**
 * These tests exist because the workspace primitive is the platform's answer
 * to "one consultant, several teams", and every one of the three bugs below
 * lost a whole team's data silently.
 */

beforeEach(() => localStorage.clear())
afterEach(() => vi.restoreAllMocks())

/** Puts a recognisable set of app data on screen. */
function seedTeam(label: string) {
  localStorage.setItem('improvement-board-items', JSON.stringify([`${label}-improvement`]))
  localStorage.setItem('sprint-metrics-projects', JSON.stringify([`${label}-project`]))
  localStorage.setItem('team-identity-charter', JSON.stringify({ teamName: label }))
}

const liveItems = () => localStorage.getItem('improvement-board-items')

describe('snapshotCurrent', () => {
  it('captures app-owned keys', () => {
    seedTeam('alpha')
    expect(Object.keys(snapshotCurrent()).sort()).toEqual([
      'improvement-board-items',
      'sprint-metrics-projects',
      'team-identity-charter',
    ])
  })

  it('leaves device preferences out — they follow the person, not the team', () => {
    seedTeam('alpha')
    localStorage.setItem('theme', 'dark')
    localStorage.setItem('i18nextLng', 'es')
    localStorage.setItem(ACTIVE_KEY, 'Alpha')
    const snap = snapshotCurrent()
    expect(snap).not.toHaveProperty('theme')
    expect(snap).not.toHaveProperty('i18nextLng')
    expect(snap).not.toHaveProperty(ACTIVE_KEY)
  })

  it('captures the keys the registry used to miss', () => {
    localStorage.setItem('wp-sprint-capacity', '{"days":8}')
    localStorage.setItem('mm_about_dismissed', 'true')
    const snap = snapshotCurrent()
    expect(snap).toHaveProperty('wp-sprint-capacity')
    expect(snap).toHaveProperty('mm_about_dismissed')
  })
})

describe('restoreSnapshot', () => {
  it('clears app keys the incoming workspace has no entry for', () => {
    // The bleed bug: Team B never used Improvement Board, so restoring B used
    // to leave Team A's improvement items sitting there.
    seedTeam('alpha')
    restoreSnapshot({ 'sprint-metrics-projects': JSON.stringify(['beta-project']) })
    expect(liveItems()).toBeNull()
    expect(localStorage.getItem('sprint-metrics-projects')).toContain('beta-project')
  })

  it('does not touch device preferences', () => {
    localStorage.setItem('theme', 'dark')
    restoreSnapshot({})
    expect(localStorage.getItem('theme')).toBe('dark')
  })

  it('restoring an empty workspace really empties the apps', () => {
    seedTeam('alpha')
    restoreSnapshot({})
    expect(Object.keys(snapshotCurrent())).toEqual([])
  })
})

describe('switchTo', () => {
  it('checkpoints the outgoing workspace before loading the incoming one', () => {
    // The data-loss bug: switching used to move the *pointer* only, so the
    // next Save wrote the outgoing team's data into the incoming workspace.
    seedTeam('alpha')
    let ws: Workspaces = {}
    ws = saveInto('Alpha', ws)

    seedTeam('beta')
    ws = switchTo('Alpha', 'Beta', ws)

    // Beta had no snapshot, so it loads empty — and Beta's unsaved edits were
    // captured into Alpha rather than thrown away.
    expect(Object.keys(snapshotCurrent())).toEqual([])
    expect(ws['Alpha'].data['improvement-board-items']).toContain('beta-improvement')
  })

  it('round-trips two teams without either seeing the other', () => {
    let ws: Workspaces = {}
    seedTeam('alpha')
    ws = saveInto('Alpha', ws)

    ws = switchTo('Alpha', 'Beta', ws)
    localStorage.setItem('sprint-metrics-projects', JSON.stringify(['beta-project']))
    ws = saveInto('Beta', ws)

    ws = switchTo('Beta', 'Alpha', ws)
    expect(liveItems()).toContain('alpha-improvement')
    expect(localStorage.getItem('sprint-metrics-projects')).toContain('alpha-project')

    ws = switchTo('Alpha', 'Beta', ws)
    expect(liveItems()).toBeNull()
    expect(localStorage.getItem('sprint-metrics-projects')).toContain('beta-project')
  })

  it('moves the active pointer', () => {
    seedTeam('alpha')
    switchTo('Alpha', 'Beta', {})
    expect(readActive()).toBe('Beta')
  })

  it('is a no-op when the target is already active', () => {
    seedTeam('alpha')
    const ws = { Alpha: { savedAt: 1, data: {} } }
    expect(switchTo('Alpha', 'Alpha', ws)).toBe(ws)
    expect(liveItems()).toContain('alpha-improvement')
  })
})

describe('createWorkspace', () => {
  it('starts empty instead of inheriting what is on screen', () => {
    // The third bug: "New workspace" used to be a rename of the current one.
    seedTeam('alpha')
    createWorkspace('Alpha', 'Beta', {})
    expect(Object.keys(snapshotCurrent())).toEqual([])
    expect(readActive()).toBe('Beta')
  })

  it('checkpoints the outgoing workspace first, so nothing is lost', () => {
    seedTeam('alpha')
    const ws = createWorkspace('Alpha', 'Beta', {})
    expect(ws['Alpha'].data['improvement-board-items']).toContain('alpha-improvement')
    expect(ws['Beta']).toEqual({ savedAt: 0, data: {} })
  })
})

describe('deleteWorkspace', () => {
  it('moves the live data to the fallback when deleting the active workspace', () => {
    let ws: Workspaces = {}
    seedTeam('alpha')
    ws = saveInto('Alpha', ws)
    ws = switchTo('Alpha', 'Beta', ws)
    localStorage.setItem('improvement-board-items', JSON.stringify(['beta-improvement']))
    ws = saveInto('Beta', ws)

    const result = deleteWorkspace('Beta', 'Beta', ws)
    expect(result.active).toBe('Alpha')
    // Without the restore, Alpha would silently inherit Beta's items.
    expect(liveItems()).toContain('alpha-improvement')
  })

  it('leaves the live data alone when deleting an inactive workspace', () => {
    seedTeam('alpha')
    const ws = { Alpha: { savedAt: 1, data: {} }, Beta: { savedAt: 1, data: {} } }
    const result = deleteWorkspace('Beta', 'Alpha', ws)
    expect(result.active).toBe('Alpha')
    expect(liveItems()).toContain('alpha-improvement')
  })
})

describe('saveInto', () => {
  it('surfaces a quota failure instead of pretending it saved', () => {
    // A snapshot is a full copy of every app's data, so N workspaces cost
    // roughly N× one workspace in a ~5 MB budget. Quota is the realistic
    // failure and it used to be swallowed.
    seedTeam('alpha')
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('exceeded', 'QuotaExceededError')
    })
    expect(() => saveInto('Alpha', {})).toThrow(WorkspaceQuotaError)
  })
})

describe('readWorkspaces', () => {
  it('survives a corrupt workspaces key rather than throwing on first render', () => {
    localStorage.setItem(WORKSPACES_KEY, 'not json')
    expect(readWorkspaces()).toEqual({})
    localStorage.setItem(WORKSPACES_KEY, '[1,2,3]')
    expect(readWorkspaces()).toEqual({})
  })

  it('normalises a half-shaped snapshot', () => {
    localStorage.setItem(WORKSPACES_KEY, JSON.stringify({ Alpha: { data: 'nope' } }))
    expect(readWorkspaces()).toEqual({ Alpha: { savedAt: 0, data: {} } })
  })

  it('round-trips what it writes', () => {
    const ws: Workspaces = { Alpha: { savedAt: 7, data: { 'theme-x': '1' } } }
    writeWorkspaces(ws)
    expect(readWorkspaces()).toEqual(ws)
  })
})
