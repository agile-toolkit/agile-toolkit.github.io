// Central registry of all localStorage keys written by the 10 Agile Toolkit apps.
// Used for export/import and future workspace management.

export interface AppKeyGroup {
  appId: string
  appTitle: string
  keys: string[]
}

export const APP_KEY_GROUPS: AppKeyGroup[] = [
  {
    appId: 'moving-motivators',
    appTitle: 'Moving Motivators',
    keys: [
      'moving-motivators:lastSession',
      'moving-motivators:sessionHistory',
    ],
  },
  {
    appId: 'scrum-facilitator',
    appTitle: 'Scrum Facilitator',
    keys: [
      'scrum-facilitator-session',
      'scrum-facilitator-history',
    ],
  },
  {
    appId: 'kanban-designer',
    appTitle: 'Kanban Designer',
    keys: [
      'kanban-designer-boards',
      'kanban-designer-current-id',
      'kanban-designer:lastSession',
    ],
  },
  {
    appId: 'salary-formula',
    appTitle: 'Salary Formula',
    keys: [
      'salary-formula-profiles',
      'salary_scenarios_v1',
      'salary-formula:lastSession',
      'salary-formula:teamHourlyRate',
      'sprint_metrics_salary_bridge_v1',
    ],
  },
  {
    appId: 'team-identity',
    appTitle: 'Team Identity',
    keys: [
      'team-identity:lastSession',
      'team-identity-charter',
    ],
  },
  {
    appId: 'improvement-board',
    appTitle: 'Improvement Board',
    keys: [
      'improvement-board-items',
      'improvement-board-members',
    ],
  },
  {
    appId: 'work-profiles',
    appTitle: 'Work Profiles',
    keys: [
      'work-profiles-data',
      'work-profiles-credits',
      'wp-profiles-export',
      'work-profiles:lastSession',
    ],
  },
  {
    appId: 'planning-poker',
    appTitle: 'Planning Poker',
    keys: [
      'sprintMetrics_planningPoker',
      'planning-poker:lastSession',
      'planning-poker:history',
    ],
  },
  {
    appId: 'sprint-metrics',
    appTitle: 'Sprint Metrics',
    keys: [
      'sprint-metrics-sprints',
      'sprint-metrics-config',
      'sprint-metrics:lastSession',
    ],
  },
  {
    appId: 'change-planner',
    appTitle: 'Change Planner',
    keys: [
      'change-planner-initiatives',
    ],
  },
]

export const ALL_KNOWN_KEYS: string[] = APP_KEY_GROUPS.flatMap(g => g.keys)
