# Dashboard — Goal

## Problem

The Agile Toolkit suite is 10 independent apps, each with its own `localStorage`
and no backend. A user (or facilitator) working across several of them has no
single place to see what's going on — they have to open each app in turn to
check whether there's an active session, how recent it is, or whether anything
needs attention. There's also no shared way to back up or move data between
browsers, and no common visual language, so every app risks re-inventing its
own header, theme toggle, and card patterns.

## Audience

Anyone using two or more Agile Toolkit apps regularly — a Scrum Master or
facilitator running Planning Poker, Scrum Facilitator, and Retro boards across
a week, or a team lead checking in on Salary Formula, Work Profiles, and Team
Identity for the same roster. They open the Dashboard first, then jump into
whichever app has something worth looking at.

## Success criteria

1. A user can see, at a glance, a live-updating summary of the most recent
   session in each of the 10 suite apps, without opening any of them —
   including apps that only ever ran team/PIN-based sessions, not just solo
   ones.
2. A user can export all of their data across every app in one action and
   restore it in another browser/machine, and can save/switch between named
   workspaces (e.g. separate teams or projects) without losing data.
3. Every suite app can adopt a consistent header, language switcher, theme
   toggle, and card/badge primitives from `design-system/` instead of
   re-implementing them, so the suite reads as one product.
4. The Dashboard itself works fully in EN/ES/BE/RU and in both light and dark
   themes.
5. A card surfaces not just "there is data" but actionable signal — how
   recent it is, whether a session is live right now, and whether something
   in that app needs attention (e.g. overdue items) — so the user knows where
   to look first without guessing.

## Non-goals

- **Not a backend or sync service.** The Dashboard never talks to a server;
  it only reads `localStorage` that the other apps already wrote in the same
  browser. Export/import is the only way data moves between machines.
- **Not an editor.** The Dashboard never writes into another app's domain
  data — only into its own `agile-toolkit:` prefixed keys (workspaces, active
  workspace). Reading is one-directional.
- **Not a re-implementation of any app.** Cards are previews and deep links,
  not embedded copies of the apps they summarize.
