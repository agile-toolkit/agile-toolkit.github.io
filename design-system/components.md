# Agile Toolkit — Component Catalog

All components use **React 18 + TypeScript + Tailwind CSS**.

Before writing a new UI element, check this catalog. Use an existing component if one fits.  
If you build something new that could appear in two or more apps, add it here.

Source files live in `design-system/components/`. Copy them into `src/components/` when adding to an app.

Color values, spacing, and radii are documented in `design-system/tokens.css`.

---

## AppHeader

The standard top-of-page navigation bar for every app in the suite. White, sticky, 56 px tall (`h-14`). Contains:
- **Left**: 4-square grid icon (link to Dashboard) + app title button
- **Right**: optional nav pills + `<LanguagePicker />` + optional children slot

**Source:** `design-system/components/AppHeader.tsx`  
**Depends on:** `design-system/components/LanguagePicker.tsx` (copy both)  
**Live in:** each app's `src/components/AppHeader.tsx` (copy on adoption)

### Props

| Prop           | Type                                                                 | Description                                               |
|----------------|----------------------------------------------------------------------|-----------------------------------------------------------|
| `title`        | `string`                                                             | App name displayed next to the grid icon                  |
| `onTitleClick` | `() => void` (optional)                                              | Called when the title is clicked (go-home / reset). Omit to render a non-interactive `<span>`. |
| `navItems`     | `{ key: string; label: string; active: boolean; onClick: () => void }[]` (optional) | Nav pills rendered between title and language picker |
| `children`     | `React.ReactNode` (optional)                                         | Extra controls appended after the language picker         |

### Usage — minimal

```tsx
import AppHeader from './components/AppHeader'

// Inside render:
<AppHeader title={t('app.title')} onTitleClick={reset} />
```

### Usage — with nav pills and extra control

```tsx
<AppHeader
  title={t('app.title')}
  onTitleClick={() => setScreen('home')}
  navItems={[
    { key: 'settings', label: t('nav.settings'), active: screen === 'settings', onClick: () => setScreen('settings') },
    { key: 'history',  label: t('nav.history'),  active: screen === 'history',  onClick: () => setScreen('history')  },
  ]}
>
  <button onClick={handleExport} className="btn-ghost text-sm">Export</button>
</AppHeader>
```

### Style invariants (do not override)

| Property      | Value                                           |
|---------------|-------------------------------------------------|
| Background    | `bg-white`                                      |
| Border        | `border-b border-gray-200`                      |
| Position      | `sticky top-0 z-10`                             |
| Height        | `h-14` (56 px)                                  |
| Max-width     | `max-w-5xl mx-auto px-4`                        |
| Title color   | `text-brand-600` (uses each app's brand token)  |
| Active pill   | `bg-brand-50 text-brand-700`                    |
| Inactive pill | `text-gray-500 hover:bg-gray-100`               |

---

## LanguagePicker

A custom flag+code dropdown for switching between the four suite locales. Replaces the native `<select>`, button-group, and cycle-button patterns used across older app versions.

**Source:** `design-system/components/LanguagePicker.tsx`  
**Requires:** `react-i18next` configured with `en / es / be / ru` resources  
**Live in:** each app's `src/components/LanguagePicker.tsx` (copy on adoption)

### Flag map

| Code | Flag | Label |
|------|------|-------|
| `en` | 🇬🇧  | EN    |
| `es` | 🇪🇸  | ES    |
| `be` | 🇧🇾  | BE    |
| `ru` | 🇷🇺  | RU    |

### Props

None. Reads and sets language via `useTranslation()` → `i18n.changeLanguage(code)`.

### Behaviour

- Trigger button shows current flag + code + chevron (rotates when open).
- Click outside closes the dropdown (`mousedown` listener on `document`).
- Keyboard: **↓/↑** cycle languages while open, **Enter/Space/↓** open, **Escape** close.
- Active option highlighted with `bg-brand-50 text-brand-700` + checkmark icon.
- Dropdown anchored to the right edge of the trigger (`right-0`), `z-50`.

### Usage

```tsx
import LanguagePicker from './components/LanguagePicker'

// Standalone (e.g. inside AppHeader children slot):
<LanguagePicker />

// AppHeader handles placement automatically — just copy both files:
<AppHeader title={t('app.title')} onTitleClick={reset} />
// LanguagePicker is rendered inside AppHeader with no extra wiring needed.
```

---

## ThemeToggle

Sun/moon icon button that toggles between light and dark mode by setting `class="dark"` on `<html>`. Persists the user's preference to `localStorage('theme')` and respects `prefers-color-scheme` on first visit.

**Source:** `design-system/components/ThemeToggle.tsx`  
**Live in:** each app's `src/components/ThemeToggle.tsx` (copy on adoption)  
**Requires:** `darkMode: 'class'` in `tailwind.config.js`

### Props

None. Self-contained — reads and writes `localStorage('theme')`.

### Anti-flash setup

Paste this inline script into `index.html` inside `<head>` **before** any other scripts to prevent the flash of wrong theme on load:

```html
<script>
  (function(){
    var t = localStorage.getItem('theme');
    if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }
  })();
</script>
```

### Usage with AppHeader

```tsx
import ThemeToggle from './components/ThemeToggle'

<AppHeader title={t('app.title')} onTitleClick={reset}>
  <ThemeToggle />
</AppHeader>
```

### tailwind.config.js change required

```js
export default {
  darkMode: 'class',   // ← add this line
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: { colors: { brand: { /* ... */ } } } },
  plugins: [],
}
```

### Applying dark variants in components

Pair every Tailwind color class with its `dark:` counterpart. The semantic token map is in `design-system/tokens.css` under "Theme: Light" and "Theme: Dark":

```tsx
// Before (light only)
<div className="bg-white border border-gray-200">
  <p className="text-gray-900">Title</p>
  <p className="text-gray-500">Subtitle</p>
</div>

// After (theme-aware)
<div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
  <p className="text-gray-900 dark:text-gray-50">Title</p>
  <p className="text-gray-500 dark:text-gray-400">Subtitle</p>
</div>
```

### Token quick-reference

| Element              | Light                  | Dark                       |
|----------------------|------------------------|----------------------------|
| Page background      | `bg-white`             | `dark:bg-gray-950`         |
| Subtle bg (page)     | `bg-gray-50`           | `dark:bg-gray-900`         |
| Muted bg (panels)    | `bg-gray-100`          | `dark:bg-gray-800`         |
| Card / surface       | `bg-white`             | `dark:bg-gray-900`         |
| Header background    | `bg-white`             | `dark:bg-gray-900`         |
| Border (default)     | `border-gray-200`      | `dark:border-gray-700`     |
| Border (subtle)      | `border-gray-100`      | `dark:border-gray-800`     |
| Primary text         | `text-gray-900`        | `dark:text-gray-50`        |
| Secondary text       | `text-gray-600`        | `dark:text-gray-400`       |
| Muted text           | `text-gray-400`        | `dark:text-gray-600`       |
| Input background     | `bg-white`             | `dark:bg-gray-900`         |
| Input border         | `border-gray-300`      | `dark:border-gray-600`     |

---

## AppCard

A card that represents one app on the Dashboard. Shows icon, title, description, live/active badge, a stats panel with contextual localStorage data, and a CTA link.

**Source:** `design-system/components/AppCard.tsx`  
**Live in:** `agile-toolkit.github.io/src/components/AppCard.tsx`

### Props

| Prop   | Type              | Description                                         |
|--------|-------------------|-----------------------------------------------------|
| `app`  | `AppMeta`         | Static metadata: id, title, icon, href, desc        |
| `data` | `AppData \| null` | Live localStorage data; `null` = app never used     |

### Top-border states

| State   | Trigger              | Top border                  | Badge               |
|---------|----------------------|-----------------------------|---------------------|
| Default | `data === null`      | `--color-border`            | none                |
| Active  | `data !== null`      | `--color-active-top-border` | "Active" (emerald)  |
| Live    | `data.live === true` | `--color-live-top-border`   | "Live" + pulse dot  |

### Usage

```tsx
<AppCard app={appMeta} data={appData} />
```

---

## Badge

Inline pill that shows live/active status. Extracted from AppCard.

**Source:** `design-system/components/Badge.tsx`

### Props

| Prop      | Type                  | Description                    |
|-----------|-----------------------|--------------------------------|
| `variant` | `'live' \| 'active'` | Controls color scheme and icon |

### Usage

```tsx
<Badge variant="live" />    {/* amber pill + animated pulse dot */}
<Badge variant="active" />  {/* emerald pill                   */}
```

---

## MemberAvatars

Colored initials circles for a list of team member names. Shows up to 5, then "+N more".

**Source:** `design-system/components/MemberAvatars.tsx`  
**Live in:** `agile-toolkit.github.io/src/components/MemberAvatars.tsx`

### Props

| Prop    | Type       | Description                 |
|---------|------------|-----------------------------|
| `names` | `string[]` | Full names or display names |

### Behavior

- Initials: first letter of each space-separated word, max 2 chars, uppercase.
- Colors cycle through 6 avatar palette tokens (see `tokens.css --color-avatar-*`).
- Avatar size: `w-6 h-6` (24×24 px), `rounded-full`.
- Max shown: 5. Remainder shown as `+N` in a `slate-100` circle.

### Usage

```tsx
<MemberAvatars names={['Alice Smith', 'Bob Lee', 'Carol M']} />
```

---

## MiniBarChart

SVG spark-bar chart for trend data (e.g. sprint velocity over time). Last bar is highlighted in `blue-600`; earlier bars in `blue-200`.

**Source:** `design-system/components/MiniBarChart.tsx`  
**Live in:** `agile-toolkit.github.io/src/components/MiniBarChart.tsx`

### Props

| Prop     | Type       | Description                           |
|----------|------------|---------------------------------------|
| `values` | `number[]` | Ordered series; only last 8 are shown |

### Behavior

- Returns `null` if fewer than 2 values.
- Fixed viewport: 80×22 px SVG.
- Bar width auto-calculated to fill width with 2 px gaps.
- Minimum bar height: 2 px (zero values still render as a sliver).

### Usage

```tsx
<MiniBarChart values={[21, 18, 24, 20, 26, 23, 28, 25]} />
```

---

## MiniKanban

Miniature board preview showing column names and card counts, with red highlight when a WIP limit is exceeded.

**Source:** `design-system/components/MiniKanban.tsx`  
**Live in:** `agile-toolkit.github.io/src/components/MiniKanban.tsx`

### Props

| Prop      | Type                   | Description                              |
|-----------|------------------------|------------------------------------------|
| `columns` | `BoardColumnPreview[]` | Max 5 shown; each has name, count, wip   |

### `BoardColumnPreview` type

```ts
interface BoardColumnPreview {
  name: string
  count: number
  wip?: number      // WIP limit; omit if none
  overWip: boolean  // true → red highlight
}
```

### Usage

```tsx
<MiniKanban columns={[
  { name: 'To Do',       count: 4, overWip: false },
  { name: 'In Progress', count: 3, wip: 2, overWip: true },
  { name: 'Done',        count: 12, overWip: false },
]} />
```

---

## ProgressBar

Emerald progress bar with "X done / Y open" labels. Used on the Improvement Board card.

**Source:** `design-system/components/ProgressBar.tsx`  
**Live in:** `agile-toolkit.github.io/src/components/ProgressBar.tsx`

### Props

| Prop    | Type     | Description          |
|---------|----------|----------------------|
| `done`  | `number` | Completed item count |
| `total` | `number` | Total item count     |

### Behavior

- Fill = `done / total × 100%`, rounded to nearest integer.
- Fill color: `emerald-500` (`--color-active-fill`).
- Track: `slate-200`, `h-1.5`, `rounded-full`.
- Labels: "X done" (left) | "Y open" (right) in `text-[0.7rem] text-slate-400`.
- Smooth fill transition: `duration-500`.

### Usage

```tsx
<ProgressBar done={7} total={12} />
```

---

## StatChipRow

A horizontal row of key-value chips separated by `·` dots. Used in every app's stats panel to surface the most meaningful localStorage data at a glance.

**Source:** `design-system/components/StatChipRow.tsx`

### Props

| Prop    | Type         | Description           |
|---------|--------------|-----------------------|
| `chips` | `StatChip[]` | Ordered list of chips |

### `StatChip` type

```ts
interface StatChip {
  value: string | number  // rendered bold, slate-800
  label: string           // normal weight, slate-500; empty string = value only
}
```

### Usage

```tsx
<StatChipRow chips={[
  { value: 3,          label: 'boards' },
  { value: '"My Board"', label: 'active' },
  { value: 42,         label: 'cards' },
]} />
// renders: 3 boards · "My Board" active · 42 cards
```

---

## Patterns

### Stats panel

The grey inset box inside each AppCard. Compose the above components inside it:

```tsx
<div className="mx-5 mt-3 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 space-y-2">
  <StatChipRow chips={data.chips} />

  {data.progressTotal > 0 && (
    <ProgressBar done={data.progressDone ?? 0} total={data.progressTotal} />
  )}

  {data.boardColumns?.length > 0 && (
    <MiniKanban columns={data.boardColumns} />
  )}

  {data.memberNames?.length > 0 && (
    <MemberAvatars names={data.memberNames} />
  )}

  {data.velocities?.length > 1 && (
    <div className="flex items-center gap-2">
      <MiniBarChart values={data.velocities} />
      <span className="text-[0.725rem] text-slate-400">velocity trend</span>
    </div>
  )}

  {data.timestamp != null && (
    <div className="text-right text-[0.7rem] text-slate-400">
      {timeAgo(data.timestamp)}
    </div>
  )}
</div>
```

### Standard app header

Use the `AppHeader` component (see above) — it handles the dashboard grid icon, title, nav pills, language picker, and all style invariants in one place. Do not copy the old inline header pattern.
