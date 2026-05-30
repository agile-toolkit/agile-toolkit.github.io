import { useTranslation } from 'react-i18next'
import type { AppMeta } from '../apps'
import type { AppData } from '../types'
import { timeAgo } from '../utils'
import Badge from './Badge'
import StatChipRow from './StatChipRow'
import MiniBarChart from './MiniBarChart'
import MiniKanban from './MiniKanban'
import MemberAvatars from './MemberAvatars'
import ProgressBar from './ProgressBar'

interface Props {
  app: AppMeta
  data: AppData | null
}

export default function AppCard({ app, data }: Props) {
  const { t } = useTranslation()
  const hasData = data !== null
  const titleKey = `apps.${app.id.replace(/-/g, '_')}.title`
  const descKey  = `apps.${app.id.replace(/-/g, '_')}.desc`

  const borderClass = data?.live
    ? 'border-t-[2px] border-t-orange-400 border-x-slate-200 dark:border-x-gray-700 border-b-slate-200 dark:border-b-gray-700'
    : hasData
    ? 'border-t-[2px] border-t-emerald-400 border-x-slate-200 dark:border-x-gray-700 border-b-slate-200 dark:border-b-gray-700'
    : 'border-slate-200 dark:border-gray-700'

  return (
    <a
      href={app.href}
      className={`group flex flex-col bg-white dark:bg-gray-900 rounded-xl border transition-all duration-200 overflow-hidden hover:shadow-lg hover:shadow-blue-50 dark:hover:shadow-blue-900/20 hover:border-blue-400 dark:hover:border-blue-500 ${borderClass}`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-4 pb-0">
        <span className="text-2xl leading-none flex-shrink-0">{app.icon}</span>
        <span className="flex-1 font-semibold text-blue-600 dark:text-blue-400 text-[0.9375rem] leading-snug">
          {t(titleKey, app.title)}
        </span>
        {(data?.live || hasData) && (
          <Badge variant={data?.live ? 'live' : 'active'} />
        )}
      </div>

      {/* Description */}
      <p className="px-5 pt-2.5 text-sm text-slate-500 dark:text-gray-400 leading-relaxed flex-1">
        {t(descKey, app.desc)}
      </p>

      {/* Stats panel */}
      {hasData && (
        <div className="mx-5 mt-3 bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg px-3 py-2.5 space-y-2">
          {data.chips.length > 0 && <StatChipRow chips={data.chips} />}

          {data.progressTotal != null && data.progressTotal > 0 && (
            <ProgressBar done={data.progressDone ?? 0} total={data.progressTotal} />
          )}

          {data.boardColumns && data.boardColumns.length > 0 && (
            <MiniKanban columns={data.boardColumns} />
          )}

          {data.memberNames && data.memberNames.length > 0 && (
            <MemberAvatars names={data.memberNames} />
          )}

          {data.velocities && data.velocities.length > 1 && (
            <div className="flex items-center gap-2">
              <MiniBarChart values={data.velocities} />
              <span className="text-[0.725rem] text-slate-400 dark:text-gray-500">{t('card.velocity')}</span>
            </div>
          )}

          {data.timestamp != null && (
            <div className="text-right text-[0.7rem] text-slate-400 dark:text-gray-500 -mb-0.5">
              {timeAgo(data.timestamp)}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-end px-5 pt-2.5 pb-4">
        <span className="text-[0.8125rem] font-medium text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform inline-block">
          {t('card.open')}
        </span>
      </div>
    </a>
  )
}
