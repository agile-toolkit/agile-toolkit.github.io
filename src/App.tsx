import { useCallback, useEffect, useState } from 'react'
import { APPS } from './apps'
import { readAll } from './readers'
import type { AppData } from './types'
import AppCard from './components/AppCard'

export default function App() {
  const [data, setData] = useState<Record<string, AppData | null>>({})

  const refresh = useCallback(() => {
    try { setData(readAll()) } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    refresh()
    const id = setInterval(refresh, 5000)
    window.addEventListener('storage', refresh)
    return () => { clearInterval(id); window.removeEventListener('storage', refresh) }
  }, [refresh])

  const activeCount = Object.values(data).filter(Boolean).length

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero header */}
      <header
        className="text-white py-16 text-center px-4"
        style={{ background: 'linear-gradient(150deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)' }}
      >
        <div className="inline-block bg-white/10 border border-white/20 rounded-full px-4 py-1 text-xs uppercase tracking-widest text-white/85 mb-5">
          Management 3.0
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-4">Agile Toolkit</h1>
        <p className="text-lg text-white/80 max-w-lg mx-auto leading-relaxed">
          Small, focused web apps for day-to-day agile practice — planning, facilitation, metrics, and team health.
        </p>
      </header>

      {/* Grid */}
      <main className="max-w-[1120px] mx-auto px-6 py-10">
        <p className="text-[0.8125rem] font-semibold uppercase tracking-widest text-slate-500 mb-5">
          10 tools — all free &amp; open source
          {activeCount > 0 && (
            <>
              {' '}
              &nbsp;·&nbsp;{' '}
              <strong className="text-emerald-600">
                {activeCount} {activeCount === 1 ? 'app' : 'apps'} in use
              </strong>
            </>
          )}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {APPS.map(app => (
            <AppCard key={app.id} app={app} data={data[app.id] ?? null} />
          ))}
        </div>
      </main>

      <footer className="text-center py-10 text-sm text-slate-500 border-t border-slate-200 mt-6">
        <a href="https://github.com/agile-toolkit" className="text-blue-600 hover:underline">
          github.com/agile-toolkit
        </a>
        <span className="mx-2 opacity-40">·</span>
        Practical tools for teams that ship together.
      </footer>
    </div>
  )
}
