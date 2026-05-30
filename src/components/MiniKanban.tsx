import type { BoardColumnPreview } from '../types'

interface Props { columns: BoardColumnPreview[] }

export default function MiniKanban({ columns }: Props) {
  const shown = columns.slice(0, 5)
  return (
    <div className="flex gap-1 mt-1">
      {shown.map((col, i) => (
        <div
          key={i}
          className={`flex-1 min-w-0 rounded px-1 py-0.5 text-center border ${
            col.overWip
              ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              : 'bg-white dark:bg-gray-900 border-slate-200 dark:border-gray-700'
          }`}
        >
          <div className={`text-[0.6rem] truncate font-medium leading-tight ${
            col.overWip ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-gray-400'
          }`}>
            {col.name}
          </div>
          <div className={`text-[0.8125rem] font-bold leading-tight ${
            col.overWip ? 'text-red-700 dark:text-red-300' : 'text-slate-700 dark:text-gray-200'
          }`}>
            {col.count}
            {col.wip ? <span className="text-[0.6rem] font-normal text-slate-400 dark:text-gray-500">/{col.wip}</span> : null}
          </div>
        </div>
      ))}
    </div>
  )
}
