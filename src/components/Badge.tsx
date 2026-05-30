interface Props {
  variant: 'live' | 'active'
}

export default function Badge({ variant }: Props) {
  if (variant === 'live') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[0.65rem] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 flex-shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
        Live
      </span>
    )
  }
  return (
    <span className="text-[0.65rem] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex-shrink-0">
      Active
    </span>
  )
}
