import { useRef, useState } from 'react'
import { ALL_KNOWN_KEYS, APP_KEY_GROUPS } from '../data-keys'

interface BackupFile {
  _meta: { version: number; exportedAt: string; keyCount: number }
  [key: string]: unknown
}

function buildBackup(): { data: BackupFile; keyCount: number } {
  const backup: BackupFile = {
    _meta: { version: 1, exportedAt: new Date().toISOString(), keyCount: 0 },
  }
  let count = 0
  for (const key of ALL_KNOWN_KEYS) {
    const raw = localStorage.getItem(key)
    if (raw !== null) {
      try { backup[key] = JSON.parse(raw) } catch { backup[key] = raw }
      count++
    }
  }
  backup._meta.keyCount = count
  return { data: backup, keyCount: count }
}

function doExport() {
  const { data, keyCount } = buildBackup()
  if (keyCount === 0) return { keyCount: 0 }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `agile-toolkit-backup-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  return { keyCount }
}

function doImport(json: string): { keyCount: number; errors: string[] } {
  const parsed = JSON.parse(json) as Record<string, unknown>
  let keyCount = 0
  const errors: string[] = []
  for (const key of ALL_KNOWN_KEYS) {
    if (Object.prototype.hasOwnProperty.call(parsed, key)) {
      try {
        localStorage.setItem(key, JSON.stringify(parsed[key]))
        keyCount++
      } catch {
        errors.push(key)
      }
    }
  }
  window.dispatchEvent(new Event('storage'))
  return { keyCount, errors }
}

function appsSummary(data: BackupFile): string {
  const present = APP_KEY_GROUPS
    .filter(g => g.keys.some(k => Object.prototype.hasOwnProperty.call(data, k)))
    .map(g => g.appTitle)
  if (!present.length) return 'no app data found'
  if (present.length <= 3) return present.join(', ')
  return `${present.slice(0, 3).join(', ')} + ${present.length - 3} more`
}

export default function ExportImport() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)

  function handleExport() {
    const { keyCount } = doExport()
    if (keyCount === 0) {
      setStatus({ type: 'err', msg: 'No app data found in this browser — nothing to export.' })
    } else {
      setStatus({ type: 'ok', msg: `Exported ${keyCount} data ${keyCount === 1 ? 'key' : 'keys'}.` })
    }
    setTimeout(() => setStatus(null), 4000)
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    try {
      const raw = await file.text()
      const parsed = JSON.parse(raw) as BackupFile
      const summary = appsSummary(parsed)
      const { keyCount, errors } = doImport(raw)
      if (errors.length) {
        setStatus({ type: 'err', msg: `Imported ${keyCount} keys. Failed: ${errors.join(', ')}` })
      } else {
        setStatus({ type: 'ok', msg: `Restored ${keyCount} keys (${summary}).` })
      }
    } catch (err) {
      setStatus({ type: 'err', msg: (err as Error).message ?? 'Import failed.' })
    }
    setTimeout(() => setStatus(null), 5000)
  }

  return (
    <div className="border-t border-slate-200 mt-4">
      <div className="max-w-[1120px] mx-auto px-6 py-6">
        <p className="text-[0.75rem] font-semibold uppercase tracking-widest text-slate-400 mb-3">
          Data Management
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export all data
          </button>

          <button
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4 4l4-4m0 0l4 4m-4-4V4" />
            </svg>
            Import data
          </button>

          <input
            ref={fileRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleFileChange}
          />

          {status && (
            <span
              className={`text-sm px-3 py-1.5 rounded-lg ${
                status.type === 'ok'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {status.msg}
            </span>
          )}

          {!status && (
            <span className="text-xs text-slate-400">
              Back up all app data stored in this browser, or restore a previous backup.
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
