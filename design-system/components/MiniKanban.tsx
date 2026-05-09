interface BoardColumnPreview {
  name: string
  count: number
  wip?: number
  overWip: boolean
}

interface Props { columns: BoardColumnPreview[] }

export default function MiniKanban({ columns }: Props) {
  const shown = columns.slice(0, 5)
  return (
    <div className="flex gap-1 mt-1">
      {shown.map((col, i) => (
        <div
          key={i}
          className={`flex-1 min-w-0 rounded px-1 py-0.5 text-center border ${
            col.overWip ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'
          }`}
        >
          <div className={`text-[0.6rem] truncate font-medium leading-tight ${col.overWip ? 'text-red-600' : 'text-slate-500'}`}>
            {col.name}
          </div>
          <div className={`text-[0.8125rem] font-bold leading-tight ${col.overWip ? 'text-red-700' : 'text-slate-700'}`}>
            {col.count}
            {col.wip ? <span className="text-[0.6rem] font-normal text-slate-400">/{col.wip}</span> : null}
          </div>
        </div>
      ))}
    </div>
  )
}
