import { describe, it, expect } from 'vitest'
import { keysToClear } from './ErrorBoundary'
import { APP_KEY_GROUPS } from '../data-keys'

/**
 * Every app in the suite shares one origin, so "clear this app's data" is a
 * scalpel pointed at a drawer everyone keeps their things in. These tests pin
 * down both failure directions: clearing too little leaves the app bricked,
 * clearing too much destroys a neighbour's work.
 */

// One key from each app, as actually written by that app's source.
const REAL_KEYS = [
  'moving-motivators:lastSession',
  'moving-motivators:sessionHistory',
  'mm_about_dismissed',
  'scrum-facilitator-session',
  'scrum-facilitator-history',
  'kanban-designer-boards',
  'kanban-designer:currentBoard',
  'salary-formula-profiles',
  'salary-formula:lastReviewed',
  'salary_scenarios_v1',
  'sprint_metrics_salary_bridge_v1',
  'team-identity-charter',
  'team-identity:charters',
  'improvement-board-items',
  'improvement-board:sprintHistory',
  'work-profiles-data',
  'wp-profiles-export',
  'wp-sprint-capacity',
  'planning-poker:history',
  'sprintMetrics_planningPoker',
  'sprint-metrics-projects',
  'sprint-metrics:lastSession',
  'change-planner-initiatives',
  'agile-toolkit:workspaces',
  'agile-toolkit:activeTeam',
  // Genuinely global, owned by nobody:
  'theme',
  'i18nextLng',
]

const groupFor = (appId: string) => {
  const g = APP_KEY_GROUPS.find(x => x.appId === appId)
  if (!g) throw new Error(`no key group for ${appId}`)
  return g
}

describe('keysToClear', () => {
  it('matches by prefix', () => {
    expect(keysToClear(REAL_KEYS, ['planning-poker:', 'planning-poker-'])).toEqual([
      'planning-poker:history',
    ])
  })

  it('picks up legacy keys that predate the prefix convention', () => {
    expect(
      keysToClear(REAL_KEYS, ['planning-poker:'], ['sprintMetrics_planningPoker']),
    ).toContain('sprintMetrics_planningPoker')
  })

  it('leaves the shared globals alone', () => {
    for (const group of APP_KEY_GROUPS) {
      const cleared = keysToClear(REAL_KEYS, group.keyPrefixes, group.legacyKeys)
      expect(cleared).not.toContain('theme')
      expect(cleared).not.toContain('i18nextLng')
    }
  })

  it('never reaches into another app, for any app in the suite', () => {
    for (const group of APP_KEY_GROUPS) {
      const cleared = keysToClear(REAL_KEYS, group.keyPrefixes, group.legacyKeys)
      for (const key of cleared) {
        const owner = APP_KEY_GROUPS.find(
          g => g.keyPrefixes.some(p => key.startsWith(p)) || g.legacyKeys.includes(key),
        )
        expect(owner?.appId, `${key} cleared by ${group.appId}`).toBe(group.appId)
      }
    }
  })

  it('clears something for every app — a group whose prefixes match nothing is a typo', () => {
    for (const group of APP_KEY_GROUPS) {
      expect(
        keysToClear(REAL_KEYS, group.keyPrefixes, group.legacyKeys).length,
        `${group.appId} matched no real key`,
      ).toBeGreaterThan(0)
    }
  })

  it('covers the keys that were falling through the registry', () => {
    // wp-sprint-capacity (real sprint capacity data) and mm_about_dismissed
    // matched no prefix before this pass, so they were silently skipped by
    // backup, by workspace snapshots and by reset alike.
    expect(keysToClear(REAL_KEYS, groupFor('work-profiles').keyPrefixes)).toContain(
      'wp-sprint-capacity',
    )
    expect(keysToClear(REAL_KEYS, groupFor('moving-motivators').keyPrefixes)).toContain(
      'mm_about_dismissed',
    )
  })

  it('returns nothing when the app has written nothing', () => {
    expect(keysToClear([], ['planning-poker:'])).toEqual([])
  })
})
