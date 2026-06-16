export interface StatChip {
  value: string | number
  label: string
}

export interface BoardColumnPreview {
  name: string
  count: number
  wip?: number
  overWip: boolean
}

export interface AppData {
  chips: StatChip[]
  timestamp?: number
  live?: boolean
  velocities?: number[]
  progressDone?: number
  progressTotal?: number
  memberNames?: string[]
  boardColumns?: BoardColumnPreview[]
  facetCoverage?: boolean[]
}
