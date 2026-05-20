# Agile Toolkit Dashboard — Brief

## Overview

Central hub for the 10-app Agile Toolkit suite. Two roles: (1) displays a card per app with live data surfaced from each app's `localStorage`; (2) hosts the shared design system (tokens, component catalog, reusable source files) used across all apps.

## Features

- [x] App card grid — 10 cards with icon, title, description, live localStorage data preview, CTA link
- [x] Active/Live badge states on cards (emerald = data present, amber = session in progress)
- [x] Hero header with suite branding and in-use app count
- [x] `localStorage` readers for all 10 apps (`src/readers.ts`)
- [x] Auto-refresh every 5 s + `storage` event listener
- [x] Design system: `tokens.css` — color, spacing, typography tokens
- [x] Design system: `AppCard`, `Badge`, `MemberAvatars`, `MiniBarChart`, `MiniKanban`, `ProgressBar`, `StatChipRow` components
- [x] Design system: `AppHeader` + `LanguagePicker` components (issue #3)
- [x] Design system: `ThemeToggle` component + light/dark theme tokens in `tokens.css`

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

## Tech notes

- No react-i18next in this repo — Dashboard is English-only. The `AppHeader` and `LanguagePicker` design system components are reference implementations for copying into the 10 apps; they are not compiled by this repo's `tsc` (only `src/` is in `tsconfig.app.json`).
- Readers in `src/readers.ts` consume well-known `localStorage` keys documented in each app's `BRIEF.md ## localStorage keys` section.

## Agent Log

### 2026-05-20 — feat: AppHeader + LanguagePicker + ThemeToggle design system components (issue #3)
- Done: created `design-system/components/AppHeader.tsx` (white sticky h-14 header, grid icon → dashboard, brand-colored title, optional nav pills, children slot); created `design-system/components/LanguagePicker.tsx` (custom flag+code dropdown: 🇬🇧EN 🇪🇸ES 🇧🇾BE 🇷🇺RU, outside-click + keyboard nav); created `design-system/components/ThemeToggle.tsx` (sun/moon icon button, `class="dark"` on `<html>`, localStorage persistence, system preference detection); extended `design-system/tokens.css` with full `:root` light tokens + `.dark` block with 16 semantic theme variables; documented all three in `design-system/components.md` with props, token quick-reference table, anti-flash script, and tailwind.config.js change
- Header adoption issues: moving-motivators#24, scrum-facilitator#18, kanban-designer#16, salary-formula#21, team-identity#20, improvement-board#19, work-profiles#18, planning-poker#19, sprint-metrics#20, change-planner#31
- Theme adoption issues: moving-motivators#25, scrum-facilitator#19, kanban-designer#17, salary-formula#22, team-identity#21, improvement-board#20, work-profiles#19, planning-poker#20, sprint-metrics#21, change-planner#32
- Next task: check issues for human feedback; implement adoption issues as they are approved (header first, then theme per app)
