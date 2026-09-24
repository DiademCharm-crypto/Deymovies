# DEYMFLIX App v1.4 — Sketchware Pro Upgrade Guide (**v1.4g** build — TRANSFER-PROOF)

**Start from:** your existing project (608). Do NOT re-import — just re-paste the Java.
**Estimated time:** ~15 minutes. No new libraries.

> ## ⚠️ HOW TO MOVE THIS FILE TO YOUR PHONE (read first)
>
> Your compile errors were caused by the code traveling through **Telegram**:
> the `||` operator triggers spoiler-formatting and gets eaten (chunks vanish),
> and symbols get re-encoded into garbage. v1.4g is immune (100% ASCII, zero
> pipes) — but the transfer path still matters:
>
> 1. Upload `DEYMFLIX-APP-v1.4.java` to your **GitHub repo** (same repo as the site)
> 2. On your phone, open the file's **RAW** url in the browser
>    (`github.com/<you>/<repo>/raw/main/DEYMFLIX-APP-v1.4.java`)
> 3. Select All → Copy → paste into the Sketchware injection tabs
>
> Never copy code from a chat bubble. RAW text has no formatting — nothing can be eaten.
>
> **Paste check:** each tab's LAST line must be its `END OF SECTION` marker.
> **Tab check:** SECTION 4 belongs ONLY in DownloadsActivity — a past error
> showed it inside MainActivity (code about `COLUMN_TOTAL_SIZE_BYTES` in
> MainActivity.java = wrong tab).

---

## What's new in v1.4g (this build)

| Feature | How it works |
|---|---|
| **No system notifications** | `VISIBILITY_HIDDEN` — nothing in the notification shade, no "Download complete" tap-to-open-raw-file leak. Progress lives on My Downloads |
| **Anonymous DM rows** | DownloadManager title is just "DEYMFLIX" — nothing movie-related outside the app |
| **Netflix rotation fix** | Only the **video element** fullscreen rotates the phone landscape now. Page fullscreen (trailers etc.) keeps portrait. The whole page never rotates anymore |
| **Downloading / Downloaded tabs** | Netflix-style tabs on My Downloads: running/paused/pending under **Downloading**, finished under **Downloaded** |
| **Posters on cards + no flicker** | Poster bitmaps are cached — the 1s refresh no longer re-downloads art (cards stay stable) |
| **Subtitles download with the movie** | The app looks up `subtitles/manifest.json` (English first, then PHsub), saves `dfx_xxx.srt` next to `dfx_xxx.mp4`, and deletes it with the movie |
| **Auto-fullscreen offline player** | Play starts landscape-locked and fullscreen immediately, 100% offline (file is already on disk). Clear toast if the file is missing |
| **Player.html-style offline player** | local-player.html upgraded: auto-hiding controls, red seek bar + scrub, 10s skip, buffered bar, time code, CC button with the downloaded subtitle track |
| **Request button moved** | In app mode the Request nav item is removed (6 items didn't fit) — a **Request a Movie** button sits at the very bottom of the footer on every page |

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

## STEP 1 — Paste the v1.4g Java  (⚠️ v1.4f APKs must FULL RE-PASTE — bridge signatures changed)

**MainActivity → Logic → ⋮ → Java/Kotlin Injection** — in each tab: **Select All → Delete → paste**:

| Section | Tab | Size |
|---|---|---|
| SECTION 1 | `onCreate` | big block (contains the class-level helpers) |
| SECTION 2 | `onBackPressed` | **ONE LINE**: `handleBack();` |
| SECTION 3 | `onResume` | **ONE LINE**: `handleResume();` |

**DownloadsActivity → Logic → ⋮ → Java/Kotlin Injection**:

| Section | File | Tab | Size |
|---|---|---|---|
| SECTION 4A | `SECTION-4A-paste.txt` | `onCreate` (FULL CLEAR first) | ~4.9 KB |
| SECTION 4B | `SECTION-4B-paste.txt` | same tab, **directly below 4A** | ~3.6 KB |
| SECTION 4C | `SECTION-4C-paste.txt` | same tab, **directly below 4B** | ~4.3 KB |
| SECTION 4D | `SECTION-4D-paste.txt` | same tab, **directly below 4C** | ~6.2 KB |
| SECTION 4E | `SECTION-4E-paste.txt` | same tab, **directly below 4D** | ~2.5 KB |

Paste **4A → 4B → 4C → 4D → 4E** in order, all in the same onCreate tab.
Leave `downloads.xml` **empty** — the screen builds itself in code.

### STEP 1.5 — Offline player (LocalPlayerActivity) — RE-PASTE for this build

1. **LocalPlayerActivity → Logic → ⋮ → Java/Kotlin Injection → onCreate**:
   Select All → Delete → paste **SECTION 6** from the master file
   (also saved as `.freebuff/section6.txt` — upload to GitHub RAW to copy).
   New in v1.4g: starts **landscape-locked** (auto-fullscreen like Netflix),
   carries the downloaded subtitle to the player, and FLAG_SECURE is scoped to
   this activity only.
2. **Asset manager**: replace the old `local-player.html` asset with the updated
   file (Netflix-style controls + subtitles). Same filename, so just replace it.
3. If you have not created LocalPlayerActivity yet: **Activity manager → Add
   Activity** → name it EXACTLY `LocalPlayerActivity` (empty layout is fine).

**Clean-paste check:** each part must end with its `END OF SECTION 4x` marker
(4A → 4B → 4C → 4D → 4E). If a marker is missing, that paste was truncated →
re-copy that section (from GitHub RAW, not a chat app).

⚠️ **Replace, don't append** — duplicate methods = compile errors.

ℹ️ Note: SECTION 1 and SECTION 4A each contain **one unmatched `}`** on purpose
(they close onCreate so the helpers live at class level). Same pattern as v1.3 —
do not "fix" it. Sections 2, 3, 4B–4E are fully balanced.

## STEP 1.9 — Upload the site files (GitHub Pages) — required for posters + nav fix

Upload together:

| File | Why |
|---|---|
| `app.js` (?v=160.3) | removes Request nav item, adds footer Request-a-Movie button, safe 2-arg fullscreen bridge, episode-aware download titles |
| `player.html` | sends `isVideo` with the fullscreen call (video rotates, page doesn't) |
| `style.css` (?v=160.3) | footer request button styles, app-mode padding |
| all 7 HTML pages | ?v=160.3 references |
| `local-player.html` | **also add/replace as an APP ASSET in Sketchware** (STEP 1.5) |

## STEP 2 — Build & install

Build the APK in Sketchware Pro and install. Expected on launch:

1. **Bottom nav** — Request is gone, Downloads is there; footer shows the red **Request a Movie** button at the very bottom
2. **Download flow** — movie → ⬇ → themed dialog with poster + size → **no notification in the shade**; watch progress on My Downloads instead
3. **My Downloads** — **Downloading / Downloaded tabs** with poster cards; Play / Cancel / Resume / Retry / Delete per state
4. **Play** — opens instantly in landscape fullscreen, offline; Netflix-style controls; CC shows the subtitle that downloaded with the movie
5. **Fullscreen on player.html** — tapping fullscreen rotates **the video only**; the rest of the page stays portrait

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Nav still shows Request in the app | Old app.js cached — pull to refresh once; confirm `app.js?v=160.3` is on GitHub Pages |
| No poster on cards | Old APK (pre-v1.4f) or app.js/player.html not uploaded — posters come from `window.__dfxCurrentMovie` in player.html |
| "Cannot play (code N)" on Play | N is the DownloadManager error code (e.g. 1006 = no space, 1001 = network). Retry the download |
| Subtitle missing in offline player | That title had no matching file in `subtitles/manifest.json` — regenerate the manifest after adding subs |
| Page rotated landscape before | Old SECTION 1 — full-clear onCreate and re-paste v1.4g |
| Splash hangs | It can't (6s timer). If seen, SECTION 1 paste is incomplete |
| "This title cannot be downloaded." | iframe/HLS-only title — expected; direct MP4s download fine |
| `confirmAndDownload ... not applicable for arguments` | Old v1.4a/b block still in the DownloadListener — full-clear the onCreate tab and re-paste SECTION 1 |
| Duplicate-method compile error | Old block not fully deleted — Select All first |

---

## File map

- `DEYMFLIX-APP-v1.4.java` — v1.4g: SECTION 1–3 (MainActivity), 4A–4E (DownloadsActivity), 6 (LocalPlayerActivity)
- `SECTION-4A-paste.txt` … `SECTION-4E-paste.txt` — phone paste files (regenerate: `node .freebuff/extract-4abcd.js`)
- `.freebuff/verify-v14f.js` — structural checker (0 pipes, 0 non-ASCII, balances, dup methods)
- `local-player.html` — in-app offline player (controls + subtitles) — also a Sketchware asset
- `subtitles/manifest.json` — the subtitle index the app queries (regenerate: `node .freebuff/gen-sub-manifest.js`)
- `app.js` / `player.html` / `style.css` (website) — app-mode nav, footer request button, 2-arg fullscreen bridge
