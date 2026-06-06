import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { scanOwnedLocalStorage } from '../data-keys'

// ── types ──────────────────────────────────────────────────────────────────────

interface WorkspaceSnapshot {
  savedAt: number
  data: Record<string, string>
}

type Workspaces = Record<string, WorkspaceSnapshot>

// ── storage helpers ────────────────────────────────────────────────────────────

const WORKSPACES_KEY = 'agile-toolkit:workspaces'
const ACTIVE_KEY = 'agile-toolkit:activeWorkspace'

function readWorkspaces(): Workspaces {
  try {
    return JSON.parse(localStorage.getItem(WORKSPACES_KEY) ?? '{}') as Workspaces
  } catch {
    return {}
  }
}

function writeWorkspaces(ws: Workspaces) {
  localStorage.setItem(WORKSPACES_KEY, JSON.stringify(ws))
}

function readActive(): string {
  return localStorage.getItem(ACTIVE_KEY) ?? 'Default'
}

function writeActive(name: string) {
  localStorage.setItem(ACTIVE_KEY, name)
}

function snapshotCurrent(): Record<string, string> {
  const owned = scanOwnedLocalStorage()
  const snapshot: Record<string, string> = {}
  for (const key of Object.keys(owned)) {
    const raw = localStorage.getItem(key)
    if (raw !== null) snapshot[key] = raw
  }
  return snapshot
}

function restoreSnapshot(data: Record<string, string>) {
  for (const [key, value] of Object.entries(data)) {
    try { localStorage.setItem(key, value) } catch { /* quota */ }
  }
  window.dispatchEvent(new Event('storage'))
}

// ── component ──────────────────────────────────────────────────────────────────

export default function WorkspaceManager() {
  const { t } = useTranslation()
  const [active, setActive] = useState(readActive)
  const [workspaces, setWorkspaces] = useState<Workspaces>(readWorkspaces)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [manageOpen, setManageOpen] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)
  const [renaming, setRenaming] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  // sync when another tab or component writes workspace keys
  useEffect(() => {
    const sync = () => {
      setActive(readActive())
      setWorkspaces(readWorkspaces())
    }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])

  // close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [dropdownOpen])

  function persistWorkspaces(ws: Workspaces) {
    writeWorkspaces(ws)
    setWorkspaces({ ...ws })
  }

  function handleSaveCurrent() {
    const ws = { ...workspaces }
    ws[active] = { savedAt: Date.now(), data: snapshotCurrent() }
    persistWorkspaces(ws)
    setSavedFlash(true)
    setTimeout(() => setSavedFlash(false), 2000)
  }

  function handleSwitchWorkspace(name: string) {
    writeActive(name)
    setActive(name)
    setDropdownOpen(false)
  }

  function handleNewWorkspace() {
    setDropdownOpen(false)
    const name = window.prompt(t('workspace.prompt_name'), '')?.trim()
    if (!name) return
    const ws = { ...workspaces }
    if (!ws[name]) ws[name] = { savedAt: 0, data: {} }
    persistWorkspaces(ws)
    writeActive(name)
    setActive(name)
  }

  function handleLoad(name: string) {
    const snap = workspaces[name]
    if (!snap?.savedAt) return
    restoreSnapshot(snap.data)
    writeActive(name)
    setActive(name)
    setManageOpen(false)
  }

  function handleDelete(name: string) {
    if (!window.confirm(t('workspace.delete_confirm', { name }))) return
    const ws = { ...workspaces }
    delete ws[name]
    persistWorkspaces(ws)
    if (active === name) {
      const fallback = Object.keys(ws)[0] ?? 'Default'
      writeActive(fallback)
      setActive(fallback)
    }
  }

  function handleRenameStart(name: string) {
    setRenaming(name)
    setRenameValue(name)
  }

  function handleRenameCommit() {
    if (!renaming) return
    const newName = renameValue.trim()
    if (!newName || newName === renaming) { setRenaming(null); return }
    const ws: Workspaces = {}
    for (const [k, v] of Object.entries(workspaces)) {
      ws[k === renaming ? newName : k] = v
    }
    persistWorkspaces(ws)
    if (active === renaming) {
      writeActive(newName)
      setActive(newName)
    }
    setRenaming(null)
  }

  const workspaceNames = Object.keys(workspaces)
  const displayName = active.length > 16 ? active.slice(0, 16) + '…' : active

  return (
    <>
      {/* Workspace controls — rendered inline in the stats row */}
      <div className="flex items-center gap-2">
        {/* Save current */}
        <button
          onClick={handleSaveCurrent}
          title={t('workspace.save')}
          className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors border ${
            savedFlash
              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
              : 'bg-white dark:bg-gray-900 border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800'
          }`}
        >
          {savedFlash ? t('workspace.saved') : t('workspace.save')}
        </button>

        {/* Workspace selector */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(o => !o)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors"
          >
            <WorkspaceIcon />
            <span className="max-w-[120px] truncate">{displayName}</span>
            <ChevronIcon open={dropdownOpen} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-52 rounded-xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 shadow-lg z-50 overflow-hidden py-1">
              {workspaceNames.length > 0 && (
                <>
                  {workspaceNames.map(name => (
                    <button
                      key={name}
                      onClick={() => handleSwitchWorkspace(name)}
                      className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors ${
                        name === active
                          ? 'text-blue-600 dark:text-blue-400 font-medium'
                          : 'text-slate-700 dark:text-gray-200'
                      }`}
                    >
                      <span className="w-4 flex-shrink-0 text-center">
                        {name === active ? '✓' : ''}
                      </span>
                      <span className="truncate">{name}</span>
                    </button>
                  ))}
                  <div className="my-1 border-t border-slate-100 dark:border-gray-800" />
                </>
              )}
              <button
                onClick={handleNewWorkspace}
                className="w-full text-left px-3 py-2 text-sm text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
              >
                <span className="w-4 flex-shrink-0 text-center text-slate-400">+</span>
                {t('workspace.new')}
              </button>
              <button
                onClick={() => { setDropdownOpen(false); setManageOpen(true) }}
                className="w-full text-left px-3 py-2 text-sm text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
              >
                <span className="w-4 flex-shrink-0 text-center text-slate-400">⚙</span>
                {t('workspace.manage')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Manage workspaces modal */}
      {manageOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
          <div
            className="absolute inset-0 bg-black/40 dark:bg-black/60"
            onClick={() => setManageOpen(false)}
          />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-gray-700">
              <h2 className="text-base font-semibold text-slate-900 dark:text-gray-50">
                {t('workspace.manage_title')}
              </h2>
              <button
                onClick={() => setManageOpen(false)}
                aria-label={t('workspace.close')}
                className="text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300 transition-colors text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-gray-800 max-h-96 overflow-y-auto">
              {workspaceNames.length === 0 && (
                <p className="px-5 py-8 text-sm text-center text-slate-400 dark:text-gray-500">
                  {t('workspace.empty')}
                </p>
              )}
              {workspaceNames.map(name => {
                const snap = workspaces[name]
                return (
                  <div key={name} className="px-5 py-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      {renaming === name ? (
                        <form
                          onSubmit={e => { e.preventDefault(); handleRenameCommit() }}
                          className="flex gap-2"
                        >
                          <input
                            autoFocus
                            value={renameValue}
                            onChange={e => setRenameValue(e.target.value)}
                            onBlur={handleRenameCommit}
                            className="flex-1 text-sm border border-blue-300 dark:border-blue-700 rounded px-2 py-0.5 bg-white dark:bg-gray-800 text-slate-900 dark:text-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <button
                            type="submit"
                            className="text-xs text-blue-600 dark:text-blue-400 font-medium"
                          >
                            OK
                          </button>
                        </form>
                      ) : (
                        <p className={`text-sm font-medium truncate ${
                          name === active
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-slate-900 dark:text-gray-50'
                        }`}>
                          {name}{name === active && ' ✓'}
                        </p>
                      )}
                      <p className="text-xs text-slate-400 dark:text-gray-500 mt-0.5">
                        {snap.savedAt > 0
                          ? t('workspace.saved_at', {
                              time: new Date(snap.savedAt).toLocaleString(),
                            })
                          : t('workspace.no_snapshot')}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleLoad(name)}
                        disabled={!snap.savedAt}
                        className="px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        {t('workspace.load')}
                      </button>
                      <button
                        onClick={() => handleRenameStart(name)}
                        className="px-2.5 py-1 rounded-md text-xs font-medium text-slate-500 dark:text-gray-400 border border-slate-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        {t('workspace.rename')}
                      </button>
                      <button
                        onClick={() => handleDelete(name)}
                        className="px-2.5 py-1 rounded-md text-xs font-medium text-red-500 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        {t('workspace.delete')}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ── icons ──────────────────────────────────────────────────────────────────────

function WorkspaceIcon() {
  return (
    <svg
      className="w-3.5 h-3.5 text-slate-400 dark:text-gray-500 flex-shrink-0"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
      />
    </svg>
  )
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-3 h-3 text-slate-400 dark:text-gray-500 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
}
