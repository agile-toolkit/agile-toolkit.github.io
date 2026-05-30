import { useTranslation } from 'react-i18next'

interface Props { done: number; total: number }

export default function ProgressBar({ done, total }: Props) {
  const { t } = useTranslation()
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  return (
    <div className="space-y-1 mt-1">
      <div className="flex justify-between text-[0.7rem] text-slate-400 dark:text-gray-500">
        <span>{t('card.progress_done', { count: done })}</span>
        <span>{t('card.progress_open', { count: total - done })}</span>
      </div>
      <div className="h-1.5 bg-slate-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
