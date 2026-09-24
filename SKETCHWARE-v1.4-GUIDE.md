# DEYMFLIX App v1.4h — Sketchware Pro Upgrade Guide (compile-fixed)

**Start from:** your existing project (608). Do NOT re-import — just re-paste the Java.
**Estimated time:** ~15 minutes. No new libraries.

> ## ⚠️ FIRST: the website (fix this before the app)
>
> `app.js` was accidentally overwritten with only its app-mode block (87 KB → 7.7 KB)
> and that broken file is live on **deymflix.eu.cc**, which is why the hero and every
> row (Recently Added, K-Drama, AI Reels, Tagalog) are empty — in a browser *and* on
> the phone. The catalog and the renderers live in `app.js`.
>
> **It has already been restored on your PC**: `app.js` is back to the full site code
> plus the new app-mode extras. **Upload it to GitHub** (the repo you already use for
> the site) together with the 7 pages that now point at it:
>
> | Upload | Why |
> |---|---|
> | `app.js` | the whole site script — this is the real fix |
> | `index.html`, `explore.html`, `category.html`, `mylist.html`, `history.html`, `reels.html`, `player.html` | they now say `app.js?v=160.4`, so no browser keeps the broken copy |
>
> Nothing else on the site changed. If you ever see empty rows again, first check the
> size of `app.js` on GitHub: under 20 KB means it got clobbered again.
>
> Why you saw **Request** in the bottom nav in your browser: that is correct. The nav
> change (Request out, Downloads in, footer Request-a-Movie button) only happens when
> the WebView reports itself as the DEYMFLIX app (`DeymflixApp/1.4g` in the user agent).
> In Chrome / desktop the site is exactly as before — that part never changed.

> ## ⚠️ HOW TO MOVE THE JAVA TO YOUR PHONE (read first)
>
> 1. Upload `DEYMFLIX-APP-v1.4.java` and the `SECTION-4x-paste.txt` files to your GitHub repo.
> 2. On the phone, open the file's **RAW** url and use **Select All → Copy**
>    (tap and hold the text → *Select all*, NOT a hand-drag selection — a partial
>    selection is what mangled SECTION 4D last time and produced 78 errors).
> 3. Paste into the Sketchware injection tab. In every tab: **Select All → Delete** first.
> 4. Never copy code from a chat bubble.
>
> **Paste check:** each tab's LAST line must be its `END OF SECTION` marker.
> `SECTION 4A` must still contain the line `private boolean paste4Acomplete = true;` —
> if it is missing, that paste was truncated, re-copy it.
> **Tab check:** SECTION 4 belongs ONLY in DownloadsActivity.

---

## What's new in this build (compared with the build that failed)

| Fix | Detail |
|---|---|
| **78 compile errors fixed** | see "What was actually broken" below — 9 of them were real code bugs, the rest came from one truncated paste |
| **My Downloads tabs** | Downloading / Downloaded, with a single Cancel button (Pending used to add two) |
| **Posters on download cards** | the card code now has its own `readDlMeta86` / `loadPosterInto` copies inside DownloadsActivity |
| **Offline player opens** | the player activity is launched with the class name your project actually has |
| **Player URL build** | wrapped in try/catch (URLEncoder throws a checked exception) |
| **Smaller pastes** | biggest section is now 4.5 KB (was 6.2 KB) |

### What was actually broken (so you can spot it next time)

| Error you saw | Real cause |
|---|---|
| `list85/empty85 cannot be resolved to a variable` (×4) | the tab click-listeners were written **above** `list85` and `empty85`. An anonymous inner class can only capture locals that are already declared — the listeners moved below the declarations |
| `readDlMeta86 / posterBg85 / loadPosterInto / deleteDlMeta86 is undefined for the type DownloadsActivity` | those helpers only existed in **MainActivity**. New **SECTION 4F** adds the DownloadsActivity copies (same `deymflix_dl` preferences, so both screens show the same posters) |
| `Syntax error, insert "}" to complete ClassBody`, `misplaced construct(s)`, `Duplicate method onClick` | one paste arrived incomplete: the middle of SECTION 4D was missing, so a chunk of card code landed outside its method. Full clear + re-paste |
| `LocalPlayerActivity cannot be resolved to a type` | the file in your project is `LocalplayerActivity.java` (lowercase **p**). Java is case-sensitive — the code now says `LocalplayerActivity` |
| `Unhandled exception type UnsupportedEncodingException` (×3) | `URLEncoder.encode` is a checked exception; the player URL build is now inside `try/catch` |

---

## STEP 0 — Manifest (Manifest tab) — already done on your side

1. Permission (Android 13+):
```
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```
2. On **MainActivity**:
```
android:configChanges="orientation|screenSize|screenLayout|smallestScreenSize|keyboardHidden"
```

WRITE_EXTERNAL_STORAGE is **not needed** — downloads are private.

## STEP 1 — MainActivity Java (Java/Kotlin Injection)

In each tab: **Select All → Delete → paste**:

| Section | Tab | Size |
|---|---|---|
| SECTION 1 | `onCreate` | 41 KB (contains the class-level helpers) |
| SECTION 2 | `onBackPressed` | **ONE LINE**: `handleBack();` |
| SECTION 3 | `onResume` | **ONE LINE**: `handleResume();` |

## STEP 2 — DownloadsActivity Java (Java/Kotlin Injection → same `onCreate` tab)

`downloads.xml` stays **EMPTY** — the screen builds itself in code.
Paste in this exact order, each one directly below the previous one:

| Order | File | Size |
|---|---|---|
| 1 | `SECTION-4A-paste.txt` | 3.9 KB |
| 2 | `SECTION-4B-paste.txt` | 3.6 KB |
| 3 | `SECTION-4C-paste.txt` | 4.3 KB |
| 4 | `SECTION-4D-paste.txt` | 4.5 KB |
| 5 | `SECTION-4E-paste.txt` | 3.2 KB |
| 6 | `SECTION-4F-paste.txt` | 3.9 KB |

**New in this build:** SECTION 4F (the registry/poster helpers). Without it the build
fails with `... is undefined for the type DownloadsActivity`.
After the last paste, the tab must end with `END OF SECTION 4F`.

⚠️ **Replace, don't append** — duplicate methods = compile errors.

ℹ️ SECTION 1 and SECTION 4A each contain **one unmatched `}`** on purpose (they close
`onCreate` so the helpers below them live at class level). Same pattern as v1.3 —
do not "fix" it. Sections 2, 3 and 4B–4F are fully balanced.

## STEP 3 — Player activity (SECTION 6)

Your activity file is `LocalplayerActivity.java` — keep that spelling, the download
list launches it by that exact name.

1. That activity → **Logic → ⋮ → Java/Kotlin Injection → onCreate**:
   Select All → Delete → paste **SECTION 6** (also saved as `.freebuff/section6.txt`,
   upload it to GitHub to copy from RAW).
   It starts landscape-locked/fullscreen, carries the downloaded subtitle, and keeps
   FLAG_SECURE (screenshots come out black) scoped to this activity only.
2. **Asset manager**: replace the `local-player.html` asset with the updated file
   in this folder (Netflix-style controls, red seek bar, CC button, 10 s skip).

## STEP 4 — Upload the site files (see the top of this guide)

`app.js` + the 7 pages that reference `app.js?v=160.4`. `style.css` and
`local-player.html` are already correct on the server from the previous upload.

## STEP 5 — Build & install

Expected on launch:

1. **Bottom nav (app only)** — Downloads is there, Request moved to a red
   **Request a Movie** button at the bottom of the footer
2. **Download flow** — movie → ⬇ → themed dialog with poster + size → no notification
   in the shade; track progress on My Downloads
3. **My Downloads** — Downloading / Downloaded tabs with poster cards;
   Play / Cancel / Resume / Retry / Delete per state
4. **Play** — opens instantly in landscape fullscreen, offline; CC shows the subtitle
   that downloaded with the movie
5. **player.html fullscreen** — tapping fullscreen rotates **the video only**;
   the rest of the page stays portrait

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Empty hero / empty rows on the site | `app.js` is the wrong size on GitHub (should be ~88 KB). Re-upload it + the 7 pages |
| "Duplicate method" compile error | old block not fully deleted — Select All first, then paste |
| `... is undefined for the type DownloadsActivity` | SECTION 4F is missing from the tab |
| The tab ends mid-code (no `END OF SECTION` marker) | that paste was truncated — re-copy with Select All from the RAW url |
| Nav still shows Request in the app | old `app.js` cached — pull to refresh once; confirm the page says `app.js?v=160.4` |
| No poster on cards | update the app (pre-v1.4f APKs cannot show them) |
| "Cannot play (code N)" on Play | N is the DownloadManager error code (1006 = no space, 1001 = network) — retry the download |
| Subtitle missing in the offline player | that title had no match in `subtitles/manifest.json`; regenerate the manifest after adding subs |
| Page rotated landscape before | old SECTION 1 — full-clear onCreate and re-paste |
| `confirmAndDownload ... not applicable for arguments` | old block still in the DownloadListener — full-clear the onCreate tab and re-paste SECTION 1 |

---

## File map

- `DEYMFLIX-APP-v1.4.java` — SECTION 1–3 (MainActivity), 4A–4F (DownloadsActivity), 6 (player activity)
- `SECTION-4A-paste.txt` … `SECTION-4F-paste.txt` — phone paste files
  (regenerate: `node .freebuff/extract-4abcd.js`)
- `.freebuff/extract-section6.js` — regenerates `.freebuff/section6.txt`
- `.freebuff/verify-v14g.js` — real checker: resolves every method call, finds forward
  references, checked exceptions, duplicate/oversized pastes, and that `app.js` still
  has its catalog (`node .freebuff/verify-v14g.js`)
- `.freebuff/app-v160.2-restored.js` — the GitHub-history copy of `app.js` used to
  restore the site (commit `57e737c2cc`)
- `app.js` — whole site script (catalog + renderers + app-mode extras at the bottom)
- `local-player.html` — in-app offline player (also a Sketchware asset)
- `subtitles/manifest.json` — subtitle index the app queries
