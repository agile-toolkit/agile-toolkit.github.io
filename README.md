# Agile Toolkit — Dashboard

Central hub for the Agile Toolkit suite. Shows a live-updating card per app,
reading each app's own `localStorage` in the same browser — no backend, no
sync. Also hosts the shared design system (`design-system/`) that the other
apps copy tokens and components from.

See `GOAL.md` for why this exists and `ROADMAP.md` for what's next.

## Dev commands

```bash
npm install
npm run dev      # local dev server
npm run build    # tsc -b && vite build
npm run preview  # preview a production build
npm test         # vitest run — src/readers.ts and src/utils.ts unit coverage
```

Deploys to GitHub Pages via `.github/workflows/deploy.yml` on push to `main`.

## localStorage keys

Only the Dashboard's own keys are listed here — for the other apps' keys see
each app's own README. Ownership of every key in `localStorage` is resolved
by `src/data-keys.ts` (`APP_KEY_GROUPS`, prefix match first, then legacy exact
match); the Dashboard scans by ownership rather than a hardcoded list, so a
new key an app adds under a registered prefix is picked up automatically.

| Key | Shape | Purpose |
|-----|-------|---------|
| `agile-toolkit:activeWorkspace` | `string` — active workspace name (default `"Default"`) | Set by `WorkspaceManager`; read on every app-data scan |
| `agile-toolkit:workspaces` | `{ [name]: { savedAt: number, data: Record<string,string> } }` | Named snapshots of every other app's owned keys, saved/restored by `WorkspaceManager` |
| `agile-toolkit:activeTeam` | `{ name: string, source: string, updatedAt: number }` | Cross-app team identity contract (E2). Written by whichever app last set a team name — today that's the Dashboard itself, seeding it from Team Identity's `teamName` on every scan (`src/team.ts`). Read by `TeamPill` in the nav bar. Other apps can adopt the same read/write helpers (`design-system/team.ts`) to stop asking for a team name they could read from here. |

The `agile-toolkit:` prefix is reserved for these Dashboard-internal keys and
is excluded from per-app export/import so a workspace snapshot is never
double-exported.

## Tech notes

- **Readers** (`src/readers.ts`) — one function per app, each preferring a
  dedicated `<app>:lastSession` summary key (richer, pre-aggregated) with a
  fallback to that app's raw arrays for apps that haven't written a summary
  key yet, or for legacy data written before the summary key existed.
  `src/readers.test.ts` covers both the summary-key and fallback path for
  every app, plus a few branching edge cases (Moving Motivators' solo-vs-team
  recency pick, Change Planner's overdue-action count) — this is the
  suite-wide integration surface, so a silent regression here breaks every
  app's dashboard card at once.
- **`AppData.attention`** — optional flag a reader sets when that app has
  something at-risk (Change Planner: an overdue open action; Kanban Designer:
  a column over its WIP limit). Renders as the red `Badge` `'attention'`
  variant on the card header; priority vs. the other badge states is
  `live` > `attention` > `active`.
- **Refresh** — polls every 5s and also listens for the `storage` event, so a
  card updates within the same tab if another app writes to `localStorage`
  (e.g. two tabs open side by side).
- **Design system** (`design-system/`) — `tokens.css` (colors, spacing,
  radii, typography, light/dark theme variables) and `components.md` (catalog
  with props + usage). Each app keeps its own **copy** of `tokens.css` at
  `src/tokens.css` (never imported/symlinked) and copies components into its
  own `src/components/` on adoption. Includes `useFacilitatorMode.ts` +
  `FacilitatorToggle.tsx` — a projector/presentation mode toggle (bigger UI,
  hidden secondary chrome) any app can adopt; this Dashboard is the second
  app to adopt it, after it originated in Team Identity.
- **Theme** — `data-theme="dark"` attribute on `<html>` (not a CSS class);
  `darkMode: ['selector', '[data-theme="dark"]']` in `tailwind.config.js`; an
  anti-flash inline script in `index.html` reads `localStorage.theme` and
  sets the attribute before first paint.
- **Export/Import** (`src/backup.ts`, `src/components/ExportImport.tsx`) — v2
  backup format: `{ _meta: { version, exportedAt, workspace, keyCount,
  appIds }, data: {...} }`. `parseBackup()` also reads the older v1 flat
  format for backward compatibility. Import shows a preview (apps found, key
  count, workspace) before writing.
