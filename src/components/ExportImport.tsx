import { useRef, useState } from 'react'
import { scanOwnedLocalStorage, claimedByApp, appsInData, appTitlesFor } from '../data-keys'
import { parseBackup, activeWorkspaceName } from '../backup'

// ── export ────────────────────────────────────────────────────────────────────

function buildExport(): { json: string; keyCount: number; appIds: string[] } {
  const data = scanOwnedLocalStorage()
  const appIds = appsInData(data)
  const meta = {
    version: 2,
    exportedAt: new Date().toISOString(),
    workspace: activeWorkspaceName(),
    keyCount: Object.keys(data).length,
    appIds,
  }
  return { json: JSON.stringify({ _meta: meta, data }, null, 2), keyCount: meta.keyCount, appIds }
}

function triggerDownload(json: string, workspace: string) {
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const slug = workspace.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'default'
  a.download = `agile-toolkit-${slug}-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ── import ────────────────────────────────────────────────────────────────────

function restoreData(data: Record<string, unknown>): { restored: number; skipped: string[] } {
  let restored = 0
  const skipped: string[] = []
  for (const [key, value] of Object.entries(data)) {
    if (claimedByApp(key) === null) { skipped.push(key); continue }
    try {
      localStorage.setItem(key, JSON.stringify(value))
      restored++
    } catch {
      skipped.push(key)
    }
  }
  window.dispatchEvent(new Event('storage'))
  return { restored, skipped }
}

// ── types ─────────────────────────────────────────────────────────────────────

type Status = { type: 'ok' | 'err'; msg: string }

interface ImportPreview {
  data: Record<string, unknown>
  workspace: string
  keyCount: number
  appTitles: string[]
}

// ── component ─────────────────────────────────────────────────────────────────

export default function ExportImport() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [status, setStatus]   = useState<Status | null>(null)
  const [preview, setPreview] = useState<ImportPreview | null>(null)

  function flash(s: Status) {
    setStatus(s)
    setTimeout(() => setStatus(null), 5000)
  }

  // ── export ──────────────────────────────────────────────────────────────────

  function handleExport() {
    const { json, keyCount, appIds } = buildExport()
    if (keyCount === 0) {
      flash({ type: 'err', msg: 'No app data found in this browser — nothing to export.' })
      return
    }
    const workspace = activeWorkspaceName()
    triggerDownload(json, workspace)
    const titles = appTitlesFor(appIds)
    const appSummary = titles.length <= 3
      ? titles.join(', ')
      : `${titles.slice(0, 3).join(', ')} +${titles.length - 3} more`
    flash({ type: 'ok', msg: `Exported ${keyCount} keys (${appSummary}).` })
  }

  // ── import: parse file → show preview ───────────────────────────────────────

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    try {
      const raw = await file.text()
      const { meta, data } = parseBackup(raw)
      const appIds = appsInData(data)
      if (appIds.length === 0) {
        flash({ type: 'err', msg: 'No recognised app data found in this file.' })
        return
      }
      setPreview({
        data,
        workspace: meta.workspace,
        keyCount: Object.keys(data).filter(k => claimedByApp(k) !== null).length,
        appTitles: appTitlesFor(appIds),
      })
    } catch (err) {
      flash({ type: 'err', msg: (err as Error).message ?? 'Could not read backup file.' })
    }
  }

  // ── import: confirm → restore ────────────────────────────────────────────────

  function handleConfirmImport() {
    if (!preview) return
    const { restored, skipped } = restoreData(preview.data)
    setPreview(null)
    if (skipped.length > 0) {
      flash({ type: 'err', msg: `Restored ${restored} keys. Skipped ${skipped.length} unrecognised.` })
    } else {
      flash({ type: 'ok', msg: `Restored ${restored} keys for: ${preview.appTitles.join(', ')}.` })
    }
  }

  // ── render ───────────────────────────────────────────────────────────────────

  return (
    <div className="border-t border-slate-200 mt-4">
      <div className="max-w-[1120px] mx-auto px-6 py-6">
        <p className="text-[0.75rem] font-semibold uppercase tracking-widest text-slate-400 mb-3">
          Data Management
        </p>

        {/* Normal toolbar */}
        {!preview && (
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm"
            >
              <DownloadIcon />
              Export all data
            </button>

            <button
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm"
            >
              <UploadIcon />
              Import data
            </button>

            <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleFileChange} />

            {status ? (
              <StatusBadge status={status} />
            ) : (
              <span className="text-xs text-slate-400">
                Back up all app data from this browser, or restore a previous backup.
              </span>
            )}
          </div>
        )}

        {/* Import confirmation */}
        {preview && (
          <div className="flex flex-wrap items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-amber-900">
                Restore {preview.keyCount} keys from workspace &ldquo;{preview.workspace}&rdquo;?
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                Apps: {preview.appTitles.join(' · ')}
              </p>
              <p className="text-xs text-amber-600 mt-1">
                Existing data for these apps will be overwritten.
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0 pt-0.5">
              <button
                onClick={handleConfirmImport}
                className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 transition-colors"
              >
                Restore
              </button>
              <button
                onClick={() => setPreview(null)}
                className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-800 text-sm font-medium hover:bg-amber-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── small helpers ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`text-sm px-3 py-1.5 rounded-lg border ${
      status.type === 'ok'
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
        : 'bg-red-50 text-red-700 border-red-200'
    }`}>
      {status.msg}
    </span>
  )
}

function DownloadIcon() {
  return (
    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  )
}

function UploadIcon() {
  return (
    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4 4l4-4m0 0l4 4m-4-4V4" />
    </svg>
  )
}
