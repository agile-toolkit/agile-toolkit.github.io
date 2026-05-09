interface Props { names: string[] }

const COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-violet-100 text-violet-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-cyan-100 text-cyan-700',
]

function initials(name: string): string {
  return name.split(' ').map(p => p[0] ?? '').join('').slice(0, 2).toUpperCase() || '?'
}

export default function MemberAvatars({ names }: Props) {
  const shown = names.slice(0, 5)
  const extra = names.length - shown.length
  return (
    <div className="flex items-center gap-1 mt-1">
      {shown.map((name, i) => (
        <div
          key={i}
          title={name}
          className={`w-6 h-6 rounded-full flex items-center justify-center text-[0.5625rem] font-bold flex-shrink-0 ${COLORS[i % COLORS.length]}`}
        >
          {initials(name)}
        </div>
      ))}
      {extra > 0 && (
        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[0.5625rem] font-bold text-slate-500">
          +{extra}
        </div>
      )}
    </div>
  )
}
