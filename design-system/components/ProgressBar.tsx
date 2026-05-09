interface Props { done: number; total: number }

export default function ProgressBar({ done, total }: Props) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  return (
    <div className="space-y-1 mt-1">
      <div className="flex justify-between text-[0.7rem] text-slate-400">
        <span>{done} done</span>
        <span>{total - done} open</span>
      </div>
      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
