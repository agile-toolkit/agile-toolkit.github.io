interface Props {
  variant: 'live' | 'active' | 'attention'
}

export default function Badge({ variant }: Props) {
  if (variant === 'live') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[0.65rem] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 flex-shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
        Live
      </span>
    )
  }
  if (variant === 'attention') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[0.65rem] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-red-100 text-red-700 flex-shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
        Needs attention
      </span>
    )
  }
  return (
    <span className="text-[0.65rem] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 flex-shrink-0">
      Active
    </span>
  )
}
