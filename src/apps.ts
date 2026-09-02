export interface AppMeta {
  id: string
  title: string
  icon: string
  href: string
  desc: string
}

export const APPS: AppMeta[] = [
  {
    id: 'moving-motivators',
    title: 'Moving Motivators',
    icon: '🎴',
    href: 'https://agile-toolkit.github.io/moving-motivators/',
    desc: 'A card-based exercise for exploring what motivates you and your team. Rank your top intrinsic motivators and assess how a change affects each one.',
  },
  {
    id: 'scrum-facilitator',
    title: 'Scrum Facilitator',
    icon: '⏱️',
    href: 'https://agile-toolkit.github.io/scrum-facilitator/',
    desc: 'A guided ceremony runner for Scrum events — sprint planning, daily standup, review, and retrospective — with timers and facilitation scripts.',
  },
  {
    id: 'kanban-designer',
    title: 'Kanban Designer',
    icon: '🗂️',
    href: 'https://agile-toolkit.github.io/kanban-designer/',
    desc: "Design and configure Kanban boards — columns, WIP limits, swim lanes — with 10 board archetypes for reference. Designs the flow; doesn't run the work.",
  },
  {
    id: 'salary-formula',
    title: 'Salary Formula',
    icon: '💰',
    href: 'https://agile-toolkit.github.io/salary-formula/',
    desc: 'A transparent salary calculator — build a formula from five factors, save and compare profiles, model what-if scenarios, and check pay equity.',
  },
  {
    id: 'team-identity',
    title: 'Team Identity',
    icon: '🤝',
    href: 'https://agile-toolkit.github.io/team-identity/',
    desc: 'A guided workshop for naming your team, picking a symbol, choosing shared values, and agreeing on working norms — ends in a shareable team charter.',
  },
  {
    id: 'improvement-board',
    title: 'Improvement Board',
    icon: '📌',
    href: 'https://agile-toolkit.github.io/improvement-board/',
    desc: 'Capture problems, run structured Improvement Dialogues, assign peer coaches, and track progress from Identified through Done.',
  },
  {
    id: 'work-profiles',
    title: 'Work Profiles',
    icon: '👤',
    href: 'https://agile-toolkit.github.io/work-profiles/',
    desc: 'A team skill map and project-credit log — transparent skills, better task matching, and recognized contributions, over job titles.',
  },
  {
    id: 'planning-poker',
    title: 'Planning Poker',
    icon: '🃏',
    href: 'https://agile-toolkit.github.io/planning-poker/',
    desc: 'Real-time Planning Poker — simultaneous voting and instant reveal. Solo practice mode, or a live PIN/QR team session with hidden-until-reveal cards.',
  },
  {
    id: 'sprint-metrics',
    title: 'Sprint Metrics',
    icon: '📊',
    href: 'https://agile-toolkit.github.io/sprint-metrics/',
    desc: 'A sprint metrics dashboard — velocity, burn-down/burn-up, Cumulative Flow Diagrams, and finish-date forecasts, entirely client-side with no backend.',
  },
  {
    id: 'change-planner',
    title: 'Change Planner',
    icon: '🔄',
    href: 'https://agile-toolkit.github.io/change-planner/',
    desc: "Plan change initiatives across Jurgen Appelo's 4 facets — Dance with the System, Mind the People, Stimulate the Network, Change the Environment.",
  },
]
