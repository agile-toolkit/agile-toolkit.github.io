interface Props { names: string[] }

const COLORS = [
  'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300',
  'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
  'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
  'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300',
  'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300',
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
        <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-gray-700 flex items-center justify-center text-[0.5625rem] font-bold text-slate-500 dark:text-gray-400">
          +{extra}
        </div>
      )}
    </div>
  )
}
