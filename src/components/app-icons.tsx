/**
 * Copy this file into src/components/app-icons.tsx when adopting in an app.
 * Dashboard-only today (used by AppCard for the 10 hub tile icons,
 * replacing the emoji previously stored in apps.ts's `icon` field).
 *
 * All use `fill`/`stroke="currentColor"` — render them inside an element
 * whose `color` is set to `var(--app-accent)` (the existing per-app accent
 * contract, tokens.css section 5) so each tile's icon automatically
 * matches its sibling app's brand color in both themes, with no
 * per-icon color choice needed here.
 */

interface IconProps {
  className?: string
}

/** Moving Motivators — fanned playing cards */
export function CardsIcon({ className = 'w-6 h-6' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="6" width="8" height="11" rx="1.2" transform="rotate(-12 7 11.5)" />
      <rect x="8.5" y="5.5" width="8" height="11" rx="1.2" />
    </svg>
  )
}

/** Scrum Facilitator — stopwatch */
export function StopwatchIcon({ className = 'w-6 h-6' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
      <circle cx="10" cy="11.5" r="6.5" />
      <path d="M10 8v3.5l2.5 2M7.5 2.5h5M10 2.5v2" />
    </svg>
  )
}

/** Kanban Designer — three board columns */
export function KanbanColumnsIcon({ className = 'w-6 h-6' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <rect x="2.5" y="3" width="4.5" height="14" rx="1" />
      <rect x="8.75" y="3" width="4.5" height="9" rx="1" />
      <rect x="15" y="3" width="4.5" height="11.5" rx="1" opacity="0.55" />
    </svg>
  )
}

/** Salary Formula — coin */
export function CoinIcon({ className = 'w-6 h-6' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <circle cx="10" cy="10" r="7.5" />
      <path d="M10 6v8M12.5 8.2c0-1.2-1.1-2-2.5-2s-2.5.9-2.5 2 1.1 1.6 2.5 1.8 2.5.7 2.5 1.9-1.1 2-2.5 2-2.5-.8-2.5-2" strokeLinecap="round" />
    </svg>
  )
}

/** Improvement Board — upward trend (progress on captured problems) */
export function TrendUpIcon({ className = 'w-6 h-6' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2.5 14.5l5-5 3.5 3.5 6-6.5" />
      <path d="M13.5 6h3.5v3.5" />
    </svg>
  )
}

/** Team Identity — an ID card (identity, not just "a team") */
export function IdentityCardIcon({ className = 'w-6 h-6' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <rect x="3" y="3" width="14" height="14" rx="2" />
      <circle cx="10" cy="8" r="2" />
      <path d="M6 15c0-2.2 1.8-3.5 4-3.5s4 1.3 4 3.5" />
    </svg>
  )
}

/** Work Profiles — a medal (recognized contributions, not just "a person") */
export function MedalIcon({ className = 'w-6 h-6' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" aria-hidden="true">
      <circle cx="10" cy="7" r="4.2" />
      <path d="M6.5 10.5l-1.5 6.5 5-2.5 5 2.5-1.5-6.5" />
    </svg>
  )
}

/** Planning Poker — single number card */
export function PokerCardIcon({ className = 'w-6 h-6' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" aria-hidden="true">
      <rect x="4.5" y="2.5" width="11" height="15" rx="1.5" />
      <text x="10" y="12.5" fontSize="6.5" fontWeight="700" textAnchor="middle" fill="currentColor" stroke="none" fontFamily="ui-sans-serif, system-ui">8</text>
    </svg>
  )
}
