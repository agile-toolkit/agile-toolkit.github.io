# Agile Toolkit — Component Catalog

All components use **React 18 + TypeScript + Tailwind CSS**.

Before writing a new UI element, check this catalog. Use an existing component if one fits.  
If you build something new that could appear in two or more apps, add it here.

Source files live in `design-system/components/`. Copy them into `src/components/` when adding to an app.

Color values, spacing, and radii are documented in `design-system/tokens.css`.

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

### Dashboard return link (in-app header)

All apps include a 4-square grid icon in the header that returns the user to the dashboard. Place it to the left of the app title.

```tsx
<a
  href="https://agile-toolkit.github.io/"
  title="Agile Toolkit"
  className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
>
  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
    <rect x="1" y="1" width="6" height="6" rx="1"/>
    <rect x="9" y="1" width="6" height="6" rx="1"/>
    <rect x="1" y="9" width="6" height="6" rx="1"/>
    <rect x="9" y="9" width="6" height="6" rx="1"/>
  </svg>
</a>
```

> **Note:** Planning Poker uses `hover:text-gray-200` instead of `hover:text-gray-600` because its header is dark (`bg-gray-800`).
