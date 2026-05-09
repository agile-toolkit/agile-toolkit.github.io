interface Props {
  values: number[]
}

export default function MiniBarChart({ values }: Props) {
  const data = values.slice(-8)
  if (data.length < 2) return null
  const W = 80, H = 22
  const max = Math.max(...data)
  const barW = Math.floor((W / data.length) - 2)

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="flex-shrink-0">
      {data.map((v, i) => {
        const h = max > 0 ? Math.max(2, (v / max) * (H - 2)) : 2
        return (
          <rect
            key={i}
            x={i * (barW + 2)}
            y={H - h}
            width={barW}
            height={h}
            rx="1"
            fill={i === data.length - 1 ? '#2563eb' : '#bfdbfe'}
          />
        )
      })}
    </svg>
  )
}
