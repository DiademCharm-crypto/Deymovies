# DEYMFLIX App v1.4h — Sketchware Pro guide (no more big pastes)

**Start from:** your existing project (608). No re-import, no new libraries.
**Time:** ~10 minutes. **Two lines of typing. Zero big pastes.**

> **Why this version exists.** Four builds failed for one reason: the My Downloads
> screen was ~24 KB of text that had to be pasted into the phone editor in six
> pieces, and one hand-selected region arrived with a stray `}`. The compiler then
> reported 78 errors that were all that one character — the code itself was fine.
>
> So the two big screens are now **plain `.java` files inside your project**, and
> each activity tab holds **one line** that calls into its file:

| Screen | File in the project | Line in the activity's `onCreate` |
|---|---|---|
| My Downloads | `DlScreen85.java` | `DlScreen85.show(this);` |
| Offline player | `LocalPlayer85.java` | `LocalPlayer85.show(this);` |

**Proof, not hope:** the whole app (MainActivity SECTION 1 + the two one-liners +
both new files) is compiled here against the real Android SDK before it goes to
your phone — `node .freebuff/build-check.js` → *43 class files, 0 errors*.
That check is what caught `DownloadManager` having no `resume()` and the missing
`try/catch` in the old player code, two bugs the phone build never reached.

---

## STEP 1 — Get the two files into the project folder

1. Upload `DlScreen85.java`, `LocalPlayer85.java` and `install-app-files.html` to
   your site repo (same way you upload the other pages).
2. On the phone open **https://deymflix.eu.cc/install-app-files.html** and tap both
   **Download** buttons — the files land in `Download`.
3. Move both files into:

```
/storage/emulated/0/.sketchware/mysc/608/app/src/main/java/com/deymflix/eu/cc/
```

That is the **same folder as `MainActivity.java`** — open it in a file manager
(MT Manager, Zarchiver, or Files) to confirm you see `MainActivity.java` sitting
next to the two new files. `.sketchware` starts with a dot, so if you cannot find
it, switch on "show hidden files" in your file manager.

> No file manager? Open the two pages on the PC and copy them across over USB —
> the folder path above is the only thing that matters.

---

## STEP 2 — Clear the old code, then paste one line (mandatory)

Old code left in a tab is exactly what produced the stray `}` errors.

**DownloadsActivity** → Logic → **⋮** → Java/Kotlin Injection:
1. For **every** tab you can reach, tap in it → **Select All → Delete**, and scroll
   to the bottom to confirm the tab is truly empty (delete any old 4A–4F text).
2. In the `onCreate` tab, type exactly:

```
DlScreen85.show(this);
```

**Player activity** (yours is `LocalplayerActivity` — capital L, lowercase p;
keep that spelling) → Logic → **⋮** → Java/Kotlin Injection:
1. Same: clear every tab.
2. In `onCreate`, type exactly:

```
LocalPlayer85.show(this);
```

`downloads.xml` stays **empty** — the Downloads screen builds itself in code.
(Your player activity's layout also stops mattering; the player builds its own.)

---

## STEP 3 — MainActivity (only if it is actually broken)

Your MainActivity already compiled in the last build, so **leave it alone**.
Touch it only if the nav/back button/fullscreen misbehaves, and then use
`SECTION-1-paste.txt` (onCreate), `SECTION-2-paste.txt` (onBackPressed),
`SECTION-3-paste.txt` (onResume) — Select All → Delete first.

SECTION 1 is still a ~41 KB block and it contains **one unmatched `}` on purpose**
(it closes `onCreate` so the helpers below it live at class level). Do not "fix" it.

---

## STEP 4 — Assets

The offline player needs the branded page at:

```
/storage/emulated/0/.sketchware/mysc/608/app/src/main/assets/local-player.html
```

Copy `local-player.html` from this folder into that one (same file-manager move).
If it is missing, the player automatically falls back to the copy on
`deymflix.eu.cc`, so offline playback needs the asset but online playback works
either way.

---

## STEP 5 — Build and check

| Check | Expected |
|---|---|
| Bottom nav (app only) | **Downloads** present, **Request** moved to a red *Request a Movie* button in the footer |
| Download flow | movie → ⬇ → themed dialog with poster + size → nothing in the notification shade |
| My Downloads | Downloading / Downloaded tabs, poster cards, Play / Retry / Restart / Cancel / Delete per state, storage line at the top |
| Play | opens instantly, landscape, fullscreen, offline; CC shows the subtitle that travelled with the movie; screenshots come out black |
| Website in a browser | hero + all rows, **Request** still in the nav — that is correct (see below) |

---

## If the build fails

| Message | What it really means |
|---|---|
| `cannot find symbol: class DlScreen85` (or `LocalPlayer85`) | the `.java` file is not in the project folder — wrong folder, or it never got moved out of `Download`. Re-copy it and build straight away |
| `Duplicate method onClick(View)` / `Syntax error, insert "}" to complete ClassBody` | old code is still in a tab. Clear **every** tab of that activity, then paste the one line |
| `Unhandled exception type UnsupportedEncodingException` | the old SECTION 6 player code is still pasted somewhere — clear the player activity's tabs |
| `LocalPlayerActivity cannot be resolved to a type` | old Downloads code still present — the new code launches the player by class **name**, so this cannot happen anymore |
| `tabTxt85 / readDlMeta86 / posterBg85 is undefined` | old 4A–4F text is still in DownloadsActivity — clear it |
| Empty hero / empty rows on the site | `app.js` on GitHub is the wrong size (should be ~88 KB) — re-upload it and the 7 pages |

---

## What was actually broken in the earlier builds

| Build | Errors | Real cause |
|---|---|---|
| v1.4g (78) | `list85/empty85 cannot be resolved` | the tab listeners were written **above** the declarations; a later block also called MainActivity-only helpers, and one paste of 6.2 KB was truncated. All of that code is gone now — replaced by `DlScreen85.java` |
| stray-brace builds (31 / 42) | `insert "}" to complete ClassBody`, `Duplicate method onClick` | one extra `}` left in the tab *above* `retry.setOnClickListener(...)`. Everything below it was read at class level, which is why `d`, `actRow`, `list`, `empty`, `dm`, `id` all suddenly "cannot be resolved" — they are *parameters* of a method the parser had already closed |
| `LocalplayerActivity.java` encoding errors (3) | `Unhandled exception type UnsupportedEncodingException` | `URLEncoder.encode` is a checked exception. `LocalPlayer85.java` now has that build inside a `try/catch` helper |
| Bonus bug found by compiling here | — | `DownloadManager` has **no** `resume()` method; a paused row now offers *Restart* instead of a call that would not compile |

---

## Website status

`app.js` (catalog + every row renderer + the app-mode block) is healthy both on your
PC and on **deymflix.eu.cc** — hero *Moana: Live Action*, Recently Added, K-Drama and
AI Reels all render, and the seven pages point at `app.js?v=160.4`.

Seeing **Request** in the bottom nav in Chrome is correct: the app-only nav change
(Request out, Downloads in, footer button) happens only when the page is opened by
the app's WebView. A normal browser is untouched.

---

## Verification and file map

Run this after any change — it compiles the app and checks the site wiring:

```
node .freebuff/build-check.js      # ALL CHECKS PASSED = safe to build the APK
```

- `DEYMFLIX-APP-v1.4.java` — the paste pack: SECTION 1–3 (MainActivity) and the two one-line stubs
- `SECTION-1/2/3-paste.txt`, `SECTION-4-paste.txt`, `SECTION-6-paste.txt` — one file per tab
  (regenerate: `node .freebuff/extract-pastes.js`)
- `DlScreen85.java` — the whole My Downloads screen
- `LocalPlayer85.java` — the whole offline player
- `install-app-files.html` — phone download page for those two files
- `.freebuff/build-check.js` — one command: compiles the app and checks the site wiring
- `.freebuff/gen-compile-harness.js` — rebuilds the Sketchware-shaped activity files from the pack
- `.freebuff/archive-section4-6.txt` — the old 4A–4F / SECTION 6 code, kept for reference only
- `.freebuff/app-v160.2-restored.js` — the GitHub-history copy of `app.js` used to restore the site
- `local-player.html` — in-app offline player (also a Sketchware asset)
- `subtitles/manifest.json` — subtitle index the app queries
