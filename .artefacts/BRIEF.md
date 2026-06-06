# Agile Toolkit Dashboard — Brief

## Overview

Central hub for the 10-app Agile Toolkit suite. Two roles: (1) displays a card per app with live data surfaced from each app's `localStorage`; (2) hosts the shared design system (tokens, component catalog, reusable source files) used across all apps.

## Features

- [x] App card grid — 10 cards with icon, title, description, live localStorage data preview, CTA link
- [x] Active/Live badge states on cards (emerald = data present, amber = session in progress)
- [x] Hero header with suite branding and in-use app count
- [x] `localStorage` readers for all 10 apps (`src/readers.ts`) — Moving Motivators reader updated to parse `moving-motivators:lastSession`; Team Identity reader updated to prefer `team-identity:lastSession` (with legacy fallback to `team-identity-charter`)
- [x] Auto-refresh every 5 s + `storage` event listener
- [x] Design system: `tokens.css` — color, spacing, typography tokens
- [x] Design system: `AppCard`, `Badge`, `MemberAvatars`, `MiniBarChart`, `MiniKanban`, `ProgressBar`, `StatChipRow` components
- [x] Design system: `AppHeader` + `LanguagePicker` components (issue #3)
- [x] Design system: `ThemeToggle` component + light/dark theme tokens in `tokens.css`
- [x] Export / Import — v2 format with `_meta` envelope + `data` wrapper; prefix-based key ownership (no hardcoded list); import preview/confirm step; workspace-ready (`_meta.workspace` field; reads `agile-toolkit:activeWorkspace` when set)
- [x] Language switch — EN / ES / BE / RU via react-i18next; `LanguagePicker` in sticky nav; full UI translated including all 10 app titles and descriptions
- [x] Theme toggle — light / dark / system-default via `ThemeToggle` in sticky nav; anti-flash script in `index.html`; `dark:` variants on all components; `darkMode: 'class'` in Tailwind

## Design System

Location: `design-system/`

| File | Purpose |
|------|---------|
| `tokens.css` | CSS custom properties for colors, spacing, radii, typography, light/dark theme tokens |
| `components.md` | Component catalog with usage, props, code snippets |
| `components/AppHeader.tsx` | Standard sticky header for all 10 apps |
| `components/LanguagePicker.tsx` | Flag+code dropdown language switcher |
| `components/ThemeToggle.tsx` | Sun/moon button; sets `class="dark"` on `<html>`, persists to `localStorage('theme')` |
| `components/AppCard.tsx` | Dashboard app card |
| `components/Badge.tsx` | Live/Active status pill |
| `components/MemberAvatars.tsx` | Team member initials circles |
| `components/MiniBarChart.tsx` | SVG spark-bar chart |
| `components/MiniKanban.tsx` | Miniature board preview |
| `components/ProgressBar.tsx` | Emerald completion bar |
| `components/StatChipRow.tsx` | Key-value chip row |

## Backlog

- [ ] [#3] Design System: AppHeader + LanguagePicker + ThemeToggle components — implemented, pending adoption by 10 apps
- [ ] [#7] Feature: Update readers to prefer `salary-formula:lastSession` and `work-profiles:lastSession` summary keys
- [ ] [#8] Integration: Sprint Metrics — add `sprint-metrics:lastSession` key for richer Dashboard card
- [ ] [#9] UX: Sort Dashboard cards by recency — active apps bubble to top
- [x] [#10] Feature: Multi-team / multi-project workspace management (snapshot + restore named workspaces) — approved, queued for implementation

## Tech notes

- react-i18next added; locales in `src/i18n/{en,es,be,ru}.json`; language persisted to `localStorage('i18nextLng')`. The `AppHeader` and `LanguagePicker` design system components are reference implementations for copying into the 10 apps; they are not compiled by this repo's `tsc` (only `src/` is in `tsconfig.app.json`).
- Readers in `src/readers.ts` consume well-known `localStorage` keys documented in each app's `BRIEF.md ## localStorage keys` section.

## Agent Log

### 2026-06-06 — research: found approved issue #10 — pivoting to implementation
- Done: checked open issues; found #10 (Multi-team workspace management) with `approved` label
- Remaining: implement WorkspaceManager component — selector, save, new, load, delete, rename; localStorage keys agile-toolkit:workspaces and agile-toolkit:activeWorkspace
- Next task: implement #10 (WorkspaceManager in Dashboard — workspace selector dropdown in nav, save current, new workspace, manage drawer with load/delete/rename; agile-toolkit:workspaces stores {[name]: {[key]: value, savedAt}}; agile-toolkit:activeWorkspace stores active name; wire into App.tsx nav bar alongside ExportImport; update data-keys.ts to exclude workspace keys from app export sets)

### 2026-05-30 — feat: language switch + theme toggle
- Done: added react-i18next with EN/ES/BE/RU locales (`src/i18n/*.json`) — all UI strings translated including all 10 app titles and descriptions; added `LanguagePicker.tsx` and `ThemeToggle.tsx` (copied from design system, adapted for dashboard's slate color scheme); added sticky nav bar in `App.tsx` hosting both controls; updated `tailwind.config.js` (`darkMode: 'class'`), `index.html` (anti-flash script), `main.tsx` (i18n import); applied `dark:` variants to every component (AppCard, Badge, StatChipRow, ProgressBar, MiniKanban, MemberAvatars, ExportImport); `ProgressBar` and `AppCard` also use `t()` for translatable strings
- Next task: check issues for human feedback

### 2026-05-30 — feat: export/import v2 — prefix ownership, backup envelope, import preview
- Done: redesigned `data-keys.ts` — each app declares `keyPrefixes[]` and `legacyKeys[]`; `claimedByApp(key)` resolves ownership by prefix match first; `scanOwnedLocalStorage()` scans ALL localStorage by ownership (not a hardcoded list); added `src/backup.ts` — v2 envelope `{ _meta: { version, exportedAt, workspace, keyCount, appIds }, data: { ... } }`, `parseBackup()` reads both v1 (flat) and v2 formats; updated `ExportImport.tsx` — export uses scan, writes v2, filename includes workspace slug; import shows confirmation step (apps found, key count, workspace) before writing; skips unrecognised keys
- Next task: check issues for human feedback

### 2026-05-30 — feat: export/import + multi-team issues
- Done: added `src/data-keys.ts` (central registry of all 27 known localStorage keys across 10 apps, grouped by app); added `src/components/ExportImport.tsx` (Export downloads backup JSON; Import reads backup and restores known keys, dispatches storage event to refresh cards); wired into `App.tsx` between the grid and footer; created dashboard issue #10 (workspace management design); created multi-team issues in moving-motivators#34, team-identity#26, scrum-facilitator#24
- Next task: check issues for human feedback

### 2026-05-30 — research: reader improvements and UX opportunities
- Done: created issues #7 (update readers to prefer salary-formula:lastSession and work-profiles:lastSession summary keys — richer data, consistent pattern), #8 (Sprint Metrics: add sprint-metrics:lastSession summary key for velocity trend on Dashboard card — cross-repo task in sprint-metrics + Dashboard), #9 (UX: sort Dashboard cards by recency, active apps bubble to top using existing AppData.timestamp field)
- Waiting for human review on all three
- Next task: check issues for human feedback

### 2026-05-27 — feat: Moving Motivators and Team Identity dashboard card readers
- Done: added `readMovingMotivators()` reading `moving-motivators:lastSession` — shows top 3 motivators (capitalized, joined with ·) and change text chip; wired into `readAll()` replacing the previous `null`; updated `readTeamIdentity()` to prefer `team-identity:lastSession` (teamName, symbol, valuesCount, agreementsCount) with legacy fallback to `team-identity-charter` key
- Remaining features: none known
- Next task: check issues for human feedback; conduct research cycle (integration opportunities, UX improvements)

### 2026-05-20 — feat: AppHeader + LanguagePicker + ThemeToggle design system components (issue #3)
- Done: created `design-system/components/AppHeader.tsx` (white sticky h-14 header, grid icon → dashboard, brand-colored title, optional nav pills, children slot); created `design-system/components/LanguagePicker.tsx` (custom flag+code dropdown: 🇬🇧EN 🇪🇸ES 🇧🇾BE 🇷🇺RU, outside-click + keyboard nav); created `design-system/components/ThemeToggle.tsx` (sun/moon icon button, `class="dark"` on `<html>`, localStorage persistence, system preference detection); extended `design-system/tokens.css` with full `:root` light tokens + `.dark` block with 16 semantic theme variables; documented all three in `design-system/components.md` with props, token quick-reference table, anti-flash script, and tailwind.config.js change
- Header adoption issues: moving-motivators#24, scrum-facilitator#18, kanban-designer#16, salary-formula#21, team-identity#20, improvement-board#19, work-profiles#18, planning-poker#19, sprint-metrics#20, change-planner#31
- Theme adoption issues: moving-motivators#25, scrum-facilitator#19, kanban-designer#17, salary-formula#22, team-identity#21, improvement-board#20, work-profiles#19, planning-poker#20, sprint-metrics#21, change-planner#32
- Next task: check issues for human feedback; implement adoption issues as they are approved (header first, then theme per app)
