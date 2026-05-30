import type { StatChip } from '../types'

interface Props { chips: StatChip[] }

export default function StatChipRow({ chips }: Props) {
  if (!chips.length) return null
  return (
    <div className="flex flex-wrap items-baseline gap-x-1 gap-y-0.5 text-[0.8125rem] text-slate-500 dark:text-gray-400 leading-snug">
      {chips.map((c, i) => (
        <span key={i} className="inline-flex items-baseline gap-1">
          {i > 0 && <span className="text-slate-300 dark:text-gray-600 mx-0.5">·</span>}
          {String(c.value) !== '' && (
            <b className="font-semibold text-slate-800 dark:text-gray-100">{c.value}</b>
          )}
          {c.label && <span>{c.label}</span>}
        </span>
      ))}
    </div>
  )
}
