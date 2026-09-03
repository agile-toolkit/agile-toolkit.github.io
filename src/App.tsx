import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { APPS } from './apps'
import { readAll, readTeamIdentityName } from './readers'
import { writeActiveTeam } from './team'
import type { AppData } from './types'
import AppCard from './components/AppCard'
import ExportImport from './components/ExportImport'
import FacilitatorToggle from './components/FacilitatorToggle'
import LanguagePicker from './components/LanguagePicker'
import TeamPill from './components/TeamPill'
import ThemeToggle from './components/ThemeToggle'
import { useFacilitatorMode } from './components/useFacilitatorMode'
import WorkspaceManager from './components/WorkspaceManager'

export default function App() {
  const { t } = useTranslation()
  const [data, setData] = useState<Record<string, AppData | null>>({})
  const [facilitatorMode, toggleFacilitatorMode] = useFacilitatorMode('agile-toolkit:facilitatorMode')

  const refresh = useCallback(() => {
    try { setData(readAll()) } catch { /* ignore */ }
    // Team Identity is the canonical "produces the team object" app per
    // GOAL.md — seed the cross-app activeTeam contract from it until other
    // apps adopt writing it directly (E2 Phase 2, filed per-repo).
    try {
      const name = readTeamIdentityName()
      if (name) writeActiveTeam(name, 'team-identity')
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    refresh()
    const id = setInterval(refresh, 5000)
    window.addEventListener('storage', refresh)
    return () => { clearInterval(id); window.removeEventListener('storage', refresh) }
  }, [refresh])

  const activeCount = Object.values(data).filter(Boolean).length

  const activeApps = APPS
    .filter(app => data[app.id] != null)
    .sort((a, b) => {
      const ta = data[a.id]?.timestamp ?? 0
      const tb = data[b.id]?.timestamp ?? 0
      return tb - ta
    })
  const inactiveApps = APPS.filter(app => data[app.id] == null)
  const sortedApps = [...activeApps, ...inactiveApps]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950" data-accent="cobalt">

      {/* Sticky nav */}
      <nav className="sticky top-0 z-20 bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm border-b border-slate-200 dark:border-gray-800">
        <div className="max-w-[1120px] mx-auto px-6 h-12 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-sm font-semibold text-slate-900 dark:text-gray-50 tracking-tight flex-shrink-0">
              Agile Toolkit
            </span>
            <TeamPill />
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {!facilitatorMode && <LanguagePicker />}
            <ThemeToggle />
            <FacilitatorToggle
              active={facilitatorMode}
              onToggle={toggleFacilitatorMode}
              labelOn={t('facilitator.toggle_on')}
              labelOff={t('facilitator.toggle_off')}
            />
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header
        className="text-white py-14 text-center px-4"
        style={{ background: 'var(--hero-gradient)' }}
      >
        <div className="inline-block bg-white/10 border border-white/20 rounded-full px-4 py-1 text-xs uppercase tracking-widest text-white/85 mb-5">
          {t('hero.badge')}
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-4">Agile Toolkit</h1>
        <p className="text-lg text-white/80 max-w-lg mx-auto leading-relaxed">
          {t('hero.subtitle')}
        </p>
      </header>

      {/* Grid */}
      <main className="max-w-[1120px] mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-5">
          <p className="text-[0.8125rem] font-semibold uppercase tracking-widest text-slate-500 dark:text-gray-400">
            {t('stats.label', { count: APPS.length })}
            {activeCount > 0 && (
              <>
                {' '}&nbsp;·&nbsp;{' '}
                <strong className="text-emerald-600 dark:text-emerald-400">
                  {t('stats.in_use', { count: activeCount })}
                </strong>
                {' '}&nbsp;·&nbsp;{' '}
                <span className="text-[color:var(--fg-3)] font-normal normal-case tracking-normal">
                  {t('stats.sorted_hint')}
                </span>
              </>
            )}
          </p>
          {!facilitatorMode && <WorkspaceManager />}
        </div>

        {activeCount === 0 && (
          <p className="text-sm text-slate-500 dark:text-gray-400 mb-5">
            {t('stats.empty_hint')}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedApps.map(app => (
            <AppCard key={app.id} app={app} data={data[app.id] ?? null} facilitatorMode={facilitatorMode} />
          ))}
        </div>
      </main>

      {!facilitatorMode && <ExportImport />}

      {!facilitatorMode && (
        <footer className="text-center py-10 text-sm text-slate-500 dark:text-gray-400 border-t border-slate-200 dark:border-gray-800 mt-2">
          <a href="https://github.com/agile-toolkit" className="text-blue-600 dark:text-blue-400 underline">
            github.com/agile-toolkit
          </a>
          <span className="mx-2 opacity-40">·</span>
          {t('footer.text')}
        </footer>
      )}
    </div>
  )
}
