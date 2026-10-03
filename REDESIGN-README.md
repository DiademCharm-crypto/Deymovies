# Website redesign — "Noir Glass" (theme v2)

**What it is:** a purely visual restyle of the browsing experience. New file
[theme-v2.css](theme-v2.css) loads *after* `style.css` and overrides colours,
depth and motion. **No markup, class name, or JS was changed** — the redesign is
one `<link>` line per page, which is what makes it trivially reversible.

## Undo (30 seconds)

```bash
# 1. restore every page + stylesheet to its exact pre-redesign bytes
node _tools/_backup.cjs restore before-redesign --apply

# 2. delete the theme layer (the restored pages no longer reference it)
rm theme-v2.css
```

Preview first if you like — the restore is a dry run without `--apply`, and it
prints a per-file diff of what would change:

```bash
node _tools/_backup.cjs restore before-redesign
node _tools/_backup.cjs list      # shows how many files drifted since the snapshot
```

The snapshot `_backups/before-redesign/` holds 11 files with md5 hashes, so the
restore verifies each byte before writing. It is never overwritten — taking a new
snapshot with the same name is refused.

## What actually changed

| Area | Before | After |
|---|---|---|
| Base colour | flat `#0f0f0f` | deeper `#07080b` + two ambient red light sources at the top of every page |
| Header | solid gradient | glass blur, logo glow, search field with a red focus ring |
| Hero | flat fade | directional fade so the copy always wins, glass kicker chip, gradient CTA with a glow, dots that light up |
| Section titles | plain bold text | red accent tick, tighter tracking |
| "View All" | flat red pill | glass chip that lifts and glows on hover |
| Poster cards | 8px radius, flat border, transparent overlay | 14px radius, layered shadows, a real bottom scrim so titles stay readable, hover lift + red rim |
| Card entrance | none | a fast staggered rise (`opacity` + the independent `translate` property, so it can never fight the `:hover` transform) |
| Rows | hard cut at the edge | edge fade masks |
| Bottom nav | glass pill | deeper glass, active item gets a red glow and a gradient indicator |
| Footer | flat | soft red wash + hairline |
| Reel thumbnails | broken images painted their `alt` text as a giant white sentence | alt text hidden, dark gradient placeholder tile |
| A11y | default focus | visible `:focus-visible` rings, red text selection, and every animation disabled under `prefers-reduced-motion` |

## Files touched

- **new:** `theme-v2.css`, `_tools/_backup.cjs`
- **one line added** (a `<link>` after `style.css`) in: `index.html`,
  `category.html`, `explore.html`, `history.html`, `mylist.html`, `reels.html`,
  `donate-design.html`

**`player.html` was deliberately left alone.** It carries a large inline
`<style>` block full of `!important` rules for the player, and the theme adds
little on an already-black immersive page. Adding the same `<link>` there is one
line whenever you want it.

## Two things to know

1. **A real bug surfaced while testing, not caused by the theme.** The homepage's
   "AI Reels & Shorts" row ships **12 thumbnails from dead hosts**
   (`zshipubcf.farsunpteltd.com` ×7, `s1.dmcdn.net` ×3, `media.anyshort.net`,
   `encrypted-tbn0.gstatic.com`) — every one fails to load. The theme stops them
   from looking broken, but the actual fix is re-hosting the images in
   `reels-data.js` or dropping the row.
2. **A trap worth remembering:** `style.css` hides the row scrollbars using the
   legacy `::-webkit-scrollbar` pseudo-element. In current Chromium the standard
   `scrollbar-width` property *overrides* that pseudo-element, so the first
   version of this theme accidentally grew a red scrollbar under every row.
   `theme-v2.css` now sets `scrollbar-width: none` on the rows (and a slim
   scrollbar on the page itself).
