import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { readActiveTeam } from '../team'

/**
 * Copy this file (and team.ts) into src/components/ + src/ when adopting in
 * an app. Displays the suite-wide active team name
 * (`agile-toolkit:activeTeam`), if set. Renders nothing when no team is set
 * — never blocks or gates solo use.
 *
 * Usage: <TeamPill />  (drop into AppHeader's children slot, or any header)
 */
export default function TeamPill() {
  const { t } = useTranslation()
  const [team, setTeam] = useState(() => readActiveTeam())

  useEffect(() => {
    const refresh = () => setTeam(readActiveTeam())
    window.addEventListener('storage', refresh)
    const id = setInterval(refresh, 5000)
    return () => { window.removeEventListener('storage', refresh); clearInterval(id) }
  }, [])

  if (!team) return null

  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-[color:var(--app-accent-soft)] text-[color:var(--app-accent-strong)] flex-shrink-0 max-w-[10rem] truncate"
      title={t('team.pill_label', { name: team.name })}
    >
      {team.name}
    </span>
  )
}
