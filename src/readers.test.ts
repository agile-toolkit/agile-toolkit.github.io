import { describe, it, expect, beforeEach } from 'vitest'
import { readAll, readTeamIdentityName } from './readers'

function set(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

beforeEach(() => localStorage.clear())

describe('readAll — empty state', () => {
  it('returns null for every app when localStorage is empty', () => {
    const all = readAll()
    for (const key of Object.keys(all)) {
      expect(all[key]).toBeNull()
    }
  })
})

describe('moving-motivators', () => {
  it('reads a solo session', () => {
    set('moving-motivators:lastSession', { ranked: ['mastery', 'freedom', 'curiosity'], savedAt: 100, change: 'a new manager' })
    const data = readAll()['moving-motivators']!
    expect(data.chips[0]!.value).toBe('Mastery · Freedom · Curiosity')
    expect(data.chips.some(c => c.label === 'change')).toBe(true)
  })

  it('prefers the more recent of solo vs team data', () => {
    set('moving-motivators:lastSession', { ranked: ['mastery'], savedAt: 100 })
    set('moving-motivators:motivationSnapshot', { topMotivators: ['freedom'], participantCount: 4, date: new Date(200).toISOString() })
    const data = readAll()['moving-motivators']!
    expect(data.chips[0]!.value).toBe('Freedom')
  })

  it('returns null when neither solo nor team data exists', () => {
    expect(readAll()['moving-motivators']).toBeNull()
  })
})

describe('scrum-facilitator', () => {
  it('reports a live in-progress ceremony', () => {
    set('scrum-facilitator-session', { ceremonyType: 'retro', participantCount: 5, retroNotesCount: 3, savedAt: 123 })
    const data = readAll()['scrum-facilitator']!
    expect(data.live).toBe(true)
    expect(data.chips.some(c => c.value === 'Retrospective')).toBe(true)
    expect(data.chips.some(c => c.label.startsWith('note'))).toBe(true)
  })

  it('falls back to history-only with no live session', () => {
    set('scrum-facilitator-history', [{ savedAt: 1 }, { savedAt: 2 }])
    const data = readAll()['scrum-facilitator']!
    expect(data.live).toBeFalsy()
    expect(data.chips.some(c => c.label.startsWith('session'))).toBe(true)
  })
})

describe('kanban-designer', () => {
  it('flags a column over its WIP limit', () => {
    set('kanban-designer-boards', [
      { id: 'b1', name: 'Board 1', updatedAt: 1, columns: [{ name: 'Doing', wipLimit: 2, cards: [1, 2, 3] }] },
    ])
    const data = readAll()['kanban-designer']!
    expect(data.attention).toBe(true)
    expect(data.boardColumns![0]!.overWip).toBe(true)
  })

  it('picks the current board by id, falling back to the last board', () => {
    set('kanban-designer-boards', [{ id: 'b1', name: 'First' }, { id: 'b2', name: 'Second' }])
    localStorage.setItem('kanban-designer-current-id', 'b2')
    const data = readAll()['kanban-designer']!
    expect(data.chips.some(c => c.value === '"Second"')).toBe(true)
  })
})

describe('salary-formula', () => {
  it('reads the structured session summary', () => {
    set('salary-formula:lastSession', {
      profileCount: 3, lastScenario: 'Senior EU', totalSalaryRange: { min: 50000, max: 90000, currency: 'EUR' }, updatedAt: new Date(500).toISOString(),
    })
    const data = readAll()['salary-formula']!
    expect(data.chips.some(c => c.value === '50k–90k EUR')).toBe(true)
  })

  it('falls back to raw profile/scenario arrays', () => {
    set('salary-formula-profiles', [{}, {}])
    set('salary_scenarios_v1', [{ savedAt: 42 }])
    const data = readAll()['salary-formula']!
    expect(data.chips.some(c => c.label === 'profiles')).toBe(true)
    expect(data.timestamp).toBe(42)
  })
})

describe('team-identity', () => {
  it('reads the current session', () => {
    set('team-identity:lastSession', { teamName: 'Alpha', symbol: '🦊', valuesCount: 3, savedAt: 10 })
    const data = readAll()['team-identity']!
    expect(data.chips.some(c => c.value === '"Alpha"')).toBe(true)
  })

  it('prefers an in-progress draft newer than the last session', () => {
    set('team-identity:lastSession', { teamName: 'Alpha', savedAt: 10 })
    set('team-identity:draft', { step: 2, savedAt: 20 })
    const data = readAll()['team-identity']!
    expect(data.live).toBe(true)
    expect(data.chips.some(c => c.value === 'step 2/5')).toBe(true)
  })

  it('falls back to the legacy charter key', () => {
    set('team-identity-charter', { teamName: 'Legacy', agreements: [1, 2], savedAt: 5 })
    const data = readAll()['team-identity']!
    expect(data.chips.some(c => c.label === 'agreements')).toBe(true)
  })
})

describe('readTeamIdentityName', () => {
  it('returns the trimmed team name when set', () => {
    set('team-identity:lastSession', { teamName: '  Alpha  ' })
    expect(readTeamIdentityName()).toBe('Alpha')
  })
  it('returns null when unset or blank', () => {
    expect(readTeamIdentityName()).toBeNull()
    set('team-identity:lastSession', { teamName: '   ' })
    expect(readTeamIdentityName()).toBeNull()
  })
})

describe('improvement-board', () => {
  it('reads the structured session summary', () => {
    set('improvement-board:lastSession', { total: 5, inProgress: 2, done: 1, memberCount: 3, lastUpdated: new Date(9).toISOString() })
    const data = readAll()['improvement-board']!
    expect(data.progressDone).toBe(1)
    expect(data.progressTotal).toBe(5)
  })

  it('falls back to raw item/member arrays and computes done count', () => {
    set('improvement-board-items', [{ status: 'done' }, { status: 'open' }, { completedAt: 1 }])
    const data = readAll()['improvement-board']!
    expect(data.progressDone).toBe(2)
    expect(data.progressTotal).toBe(3)
  })
})

describe('work-profiles', () => {
  it('reads the structured session summary', () => {
    set('work-profiles:lastSession', { profileCount: 4, avgCapacity: 82.4, topSkills: ['React', 'TS'], lastUpdated: new Date(1).toISOString() })
    const data = readAll()['work-profiles']!
    expect(data.chips.some(c => c.value === '82%')).toBe(true)
  })

  it('falls back to raw profile/credit arrays', () => {
    set('work-profiles-data', [{ name: 'Alice', createdAt: 1 }])
    set('work-profiles-credits', [{ points: 3 }, { points: 2 }])
    const data = readAll()['work-profiles']!
    expect(data.memberNames).toEqual(['Alice'])
    expect(data.chips.some(c => c.value === 5)).toBe(true)
  })
})

describe('planning-poker', () => {
  it('reads the current session', () => {
    set('planning-poker:lastSession', { sessionName: 'Sprint 12', storyCount: 5, estimatedCount: 3, avgPoints: 5.333, date: new Date(1).toISOString() })
    const data = readAll()['planning-poker']!
    expect(data.chips.some(c => c.value === '3/5')).toBe(true)
    expect(data.chips.some(c => c.value === '5.3')).toBe(true)
  })

  it('falls back to history, then to the legacy sprintMetrics key', () => {
    set('planning-poker:history', [{ sessionName: 'Old', storyCount: 2, estimatedCount: 2, date: new Date(1).toISOString() }])
    expect(readAll()['planning-poker']!.chips.some(c => c.value === '"Old"')).toBe(true)

    localStorage.clear()
    set('sprintMetrics_planningPoker', [{ finalEstimate: '5' }, { finalEstimate: '3' }])
    const data = readAll()['planning-poker']!
    expect(data.chips.some(c => c.value === 4)).toBe(false) // count chip is stories, not avg
    expect(data.chips.some(c => c.label === 'avg pts')).toBe(true)
  })
})

describe('sprint-metrics', () => {
  it('reads the current session including a valid mood emoji', () => {
    set('sprint-metrics:lastSession', { projectName: 'Core', avgVelocity: 30, lastVelocity: 28, lastMood: 4, updatedAt: new Date(1).toISOString() })
    const data = readAll()['sprint-metrics']!
    expect(data.chips.some(c => c.label === 'mood')).toBe(true)
  })

  it('falls back to raw sprint array + config', () => {
    set('sprint-metrics-sprints', [{ completed: 10 }, { completed: 12 }])
    set('sprint-metrics-config', { name: 'Legacy Project' })
    const data = readAll()['sprint-metrics']!
    expect(data.velocities).toEqual([10, 12])
  })
})

describe('change-planner', () => {
  it('counts overdue actions on the most recently updated active initiative', () => {
    const today = new Date().toISOString().slice(0, 10)
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
    set('change-planner-initiatives', [
      {
        title: 'Rollout', updatedAt: 100,
        actions: [
          { status: 'todo', dueDate: yesterday },
          { status: 'done', dueDate: yesterday },
        ],
      },
    ])
    const data = readAll()['change-planner']!
    expect(data.attention).toBe(true)
    expect(data.chips.some(c => c.label === 'overdue')).toBe(true)
    void today
  })

  it('excludes archived initiatives from the "active" chip', () => {
    set('change-planner-initiatives', [
      { title: 'Done one', completedAt: 1, updatedAt: 1 },
      { title: 'Active one', updatedAt: 2 },
    ])
    const data = readAll()['change-planner']!
    expect(data.chips.some(c => c.value === 1 && c.label === 'active')).toBe(true)
  })
})

describe('kanban-tracker', () => {
  it('flags a column over its WIP limit', () => {
    set('kanban-tracker-boards', [
      { id: 'b1', name: 'Board 1', updatedAt: 1, columns: [{ name: 'Doing', wipLimit: 2, cards: [1, 2, 3] }] },
    ])
    const data = readAll()['kanban-tracker']!
    expect(data.attention).toBe(true)
    expect(data.boardColumns![0]!.overWip).toBe(true)
  })

  it('picks the most recently updated board as current (no current-id key)', () => {
    set('kanban-tracker-boards', [
      { id: 'b1', name: 'First', updatedAt: 1 },
      { id: 'b2', name: 'Second', updatedAt: 2 },
    ])
    const data = readAll()['kanban-tracker']!
    expect(data.chips.some(c => c.value === '"Second"')).toBe(true)
  })

  it('returns null with no boards', () => {
    expect(readAll()['kanban-tracker']).toBeNull()
  })
})
