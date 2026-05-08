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
    desc: 'Explore motivation and priorities with a familiar card-based exercise. Rank CHAMPFROGS motivators and assess change impact.',
  },
  {
    id: 'scrum-facilitator',
    title: 'Scrum Facilitator',
    icon: '⏱️',
    href: 'https://agile-toolkit.github.io/scrum-facilitator/',
    desc: 'Support scrum events and facilitation with clear, guided flows — timers, facilitation scripts, and retrospective tools.',
  },
  {
    id: 'kanban-designer',
    title: 'Kanban Designer',
    icon: '🗂️',
    href: 'https://agile-toolkit.github.io/kanban-designer/',
    desc: 'Design and iterate on boards and flow without fighting the tool. Visual guide to 10 Kanban board patterns.',
  },
  {
    id: 'salary-formula',
    title: 'Salary Formula',
    icon: '💰',
    href: 'https://agile-toolkit.github.io/salary-formula/',
    desc: 'Transparent, formula-based compensation models teams can reason about. Design fair salary formulas based on Management 3.0 principles.',
  },
  {
    id: 'team-identity',
    title: 'Team Identity',
    icon: '🤝',
    href: 'https://agile-toolkit.github.io/team-identity/',
    desc: 'Align on who the team is and how you want to show up together. Digital facilitation of Identity Symbols and Work Expo practices.',
  },
  {
    id: 'improvement-board',
    title: 'Improvement Board',
    icon: '📌',
    href: 'https://agile-toolkit.github.io/improvement-board/',
    desc: 'Surface improvements, experiments, and follow-through from retros. Platform for Improvement Dialogues and Copilot Programs.',
  },
  {
    id: 'work-profiles',
    title: 'Work Profiles',
    icon: '👤',
    href: 'https://agile-toolkit.github.io/work-profiles/',
    desc: 'Roles, expectations, and how people prefer to collaborate. Reputation-over-titles portfolio for tracking contributions and skills.',
  },
  {
    id: 'planning-poker',
    title: 'Planning Poker',
    icon: '🃏',
    href: 'https://agile-toolkit.github.io/planning-poker/',
    desc: 'Lightweight estimation sessions with a shared view of the table. Real-time tool with PIN-based team sessions and Fibonacci cards.',
  },
  {
    id: 'sprint-metrics',
    title: 'Sprint Metrics',
    icon: '📊',
    href: 'https://agile-toolkit.github.io/sprint-metrics/',
    desc: 'Burn-down, forecast, and sprint data in one place for the current iteration. Chrome extension for Jira with flow metrics.',
  },
  {
    id: 'change-planner',
    title: 'Change Planner',
    icon: '🔄',
    href: 'https://agile-toolkit.github.io/change-planner/',
    desc: "Structure and communicate change across teams and releases. Interactive planning based on the PDCA cycle and Jurgen Appelo's How to Change the World.",
  },
]
