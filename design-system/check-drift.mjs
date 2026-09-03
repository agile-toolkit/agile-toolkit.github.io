#!/usr/bin/env node
// Reports drift between design-system/components/*.tsx (the source of truth)
// and each app's own copy under src/components/. Components are distributed
// by copy-paste (see components.md), not an npm package, so nothing stops a
// local edit from drifting silently — this is the check that catches it.
//
// Usage: node design-system/check-drift.mjs
// Run from the agile-toolkit.github.io repo root. Assumes every app repo is
// checked out as a sibling directory (../<repo>), matching how this suite's
// agents work (see AGENT_AUTONOMOUS.md: "All repos are cloned in this
// environment").
//
// Only checks components components.md documents as "copy on adoption" for
// other apps (LanguagePicker, AppHeader, ThemeToggle, useFacilitatorMode,
// FacilitatorToggle). AppCard, Badge, etc. are Dashboard-only and not meant
// to be copied elsewhere yet.

import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const suiteRoot = path.resolve(__dirname, '..', '..')

const APPS = [
  'moving-motivators', 'scrum-facilitator', 'kanban-designer', 'salary-formula',
  'team-identity', 'improvement-board', 'work-profiles', 'planning-poker',
  'sprint-metrics', 'change-planner',
]

const COPYABLE_COMPONENTS = [
  'LanguagePicker.tsx', 'AppHeader.tsx', 'ThemeToggle.tsx',
  'useFacilitatorMode.ts', 'FacilitatorToggle.tsx',
]

let driftCount = 0
let missingCount = 0

for (const component of COPYABLE_COMPONENTS) {
  const sourcePath = path.join(__dirname, 'components', component)
  if (!fs.existsSync(sourcePath)) continue

  console.log(`\n=== ${component} ===`)
  for (const app of APPS) {
    const appPath = path.join(suiteRoot, app, 'src', 'components', component)
    if (!fs.existsSync(appPath)) {
      console.log(`  ${app}: not adopted (no local copy)`)
      continue
    }
    try {
      execSync(`diff -q "${sourcePath}" "${appPath}"`, { stdio: 'pipe' })
      console.log(`  ${app}: MATCH`)
    } catch (e) {
      const lineDiff = execSync(`diff "${sourcePath}" "${appPath}" | grep -c '^[<>]' || true`, { shell: '/bin/bash' })
        .toString().trim()
      console.log(`  ${app}: DRIFTED (${lineDiff} differing lines) — diff "${sourcePath}" "${appPath}"`)
      driftCount++
    }
  }
}

console.log(`\n${driftCount} drifted copies found across ${APPS.length} apps.`)
if (driftCount > 0) {
  console.log('Run: for each DRIFTED line above, decide whether the app copy has a')
  console.log('deliberate local override (note it in that app\'s README) or whether')
  console.log('the design-system source should be updated and re-copied everywhere.')
  process.exitCode = 1
}
