import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
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
      flash({ type: 'err', msg: t('data.export_empty') })
      return
    }
    const workspace = activeWorkspaceName()
    triggerDownload(json, workspace)
    const titles = appTitlesFor(appIds)
    const appSummary = titles.length <= 3
      ? titles.join(', ')
      : `${titles.slice(0, 3).join(', ')} +${titles.length - 3} more`
    flash({ type: 'ok', msg: t('data.export_ok', { count: keyCount, apps: appSummary }) })
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
        flash({ type: 'err', msg: t('data.import_none') })
        return
      }
      setPreview({
        data,
        workspace: meta.workspace,
        keyCount: Object.keys(data).filter(k => claimedByApp(k) !== null).length,
        appTitles: appTitlesFor(appIds),
      })
    } catch {
      flash({ type: 'err', msg: t('data.import_error') })
    }
  }

  // ── import: confirm → restore ────────────────────────────────────────────────

  function handleConfirmImport() {
    if (!preview) return
    const { restored, skipped } = restoreData(preview.data)
    setPreview(null)
    if (skipped.length > 0) {
      flash({ type: 'err', msg: t('data.import_partial', { count: restored, skipped: skipped.length }) })
    } else {
      flash({ type: 'ok', msg: t('data.import_ok', { count: restored, apps: preview.appTitles.join(', ') }) })
    }
  }

  // ── render ───────────────────────────────────────────────────────────────────

  return (
    <div className="border-t border-slate-200 dark:border-gray-800 mt-4">
      <div className="max-w-[1120px] mx-auto px-6 py-6">
        <p className="text-[0.75rem] font-semibold uppercase tracking-widest text-slate-400 dark:text-gray-500 mb-3">
          {t('data.section')}
        </p>

        {/* Normal toolbar */}
        {!preview && (
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 text-sm font-medium text-slate-700 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-gray-800 hover:border-slate-300 dark:hover:border-gray-600 transition-colors shadow-sm"
            >
              <DownloadIcon />
              {t('data.export_btn')}
            </button>

            <button
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 text-sm font-medium text-slate-700 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-gray-800 hover:border-slate-300 dark:hover:border-gray-600 transition-colors shadow-sm"
            >
              <UploadIcon />
              {t('data.import_btn')}
            </button>

            <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleFileChange} />

            {status ? (
              <StatusBadge status={status} />
            ) : (
              <span className="text-xs text-slate-400 dark:text-gray-500">
                {t('data.hint')}
              </span>
            )}
          </div>
        )}

        {/* Import confirmation */}
        {preview && (
          <div className="flex flex-wrap items-start gap-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-4 py-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                {t('data.import_confirm_title', { count: preview.keyCount, workspace: preview.workspace })}
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                {t('data.import_confirm_apps', { apps: preview.appTitles.join(' · ') })}
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                {t('data.import_confirm_warn')}
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0 pt-0.5">
              <button
                onClick={handleConfirmImport}
                className="px-3 py-1.5 rounded-lg bg-amber-600 dark:bg-amber-700 text-white text-sm font-medium hover:bg-amber-700 dark:hover:bg-amber-600 transition-colors"
              >
                {t('data.restore_btn')}
              </button>
              <button
                onClick={() => setPreview(null)}
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-gray-900 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 text-sm font-medium hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-colors"
              >
                {t('data.cancel_btn')}
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
        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
        : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
    }`}>
      {status.msg}
    </span>
  )
}

function DownloadIcon() {
  return (
    <svg className="w-4 h-4 text-slate-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  )
}

function UploadIcon() {
  return (
    <svg className="w-4 h-4 text-slate-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4 4l4-4m0 0l4 4m-4-4V4" />
    </svg>
  )
}
