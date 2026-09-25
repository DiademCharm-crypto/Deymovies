# DEYMFLIX App v1.4i — Sketchware Pro guide (library build, zero big pastes)

**Start from:** your existing project (608). No re-import. **Time:** ~15 minutes.

## Why this version exists (read once)

| Attempt | What happened |
|---|---|
| v1.4g pastes (4A–4F) | ~24 KB pasted in 6 pieces; one hand-selected region carried a stray `}` → 78 compile errors that were all one character |
| v1.4h drop-in files | the two `.java` files were placed in `app/src/main/java/...` correctly — and **Sketchware deleted them during the build** (it regenerates that folder and removes anything it did not generate), so the build failed with `cannot be resolved` and the files vanished |

Conclusion: nothing inside `mysc/608/app/src/main/java` survives a build. But
**local libraries do** — they live in `.sketchware/libs/local_libs/` (outside the
project), and Sketchware puts their `classes.jar` on the compiler classpath and
their `classes.dex` into the APK. Your project already uses nine of them
(swiperefreshlayout, androidx core, ...).

So all three screens now ship as one local library: **deymflix-screens-1.0**.

| Screen | Class in the library | The activity tab says |
|---|---|---|
| MainActivity (WebView, splash, bridge, downloads, fullscreen) | `MainScreen85` | `MainScreen85.install(this);` |
| My Downloads | `DlScreen85` | `DlScreen85.show(this);` |
| Offline player | `LocalPlayer85` | `LocalPlayer85.show(this);` |

Everything is compiled here against the real Android SDK before it reaches you —
including **mode B**, which compiles the three activities exactly like Sketchware
will: screens resolved *only from the library jar*. `node .freebuff/build-check.js`
→ **ALL CHECKS PASSED**.

---

## STEP 1 — Copy the library to the phone (one-time)

Upload `deymflix-screens-1.0.zip` to your site repo. On the phone:

1. Download it (or use `https://deymflix.eu.cc/install-app-files.html`).
2. Unzip. You get a folder `deymflix-screens-1.0` with `classes.jar` and `classes.dex`.
3. Move that folder to:

```
/storage/emulated/0/.sketchware/libs/local_libs/deymflix-screens-1.0/
```

so the two files sit directly inside it. `.sketchware` starts with a dot — enable
"show hidden files" in your file manager.

## STEP 2 — Register the library in the project (one-time)

1. Open the file `.sketchware/data/608/local_library` with a text editor
   (MT Manager's editor works). It is one JSON array — your current entries start
   with swiperefreshlayout. NOTE: it is directly in the `608` folder — there is
   no second `data` subfolder, despite what older notes said.
2. Add this object as one more element of that array (comma between elements):

```
{
 "dexPath": "/storage/emulated/0/.sketchware/libs/local_libs/deymflix-screens-1.0/classes.dex",
 "jarPath": "/storage/emulated/0/.sketchware/libs/local_libs/deymflix-screens-1.0/classes.jar",
 "name": "deymflix-screens-1.0"
}
```

(The same text is in `ADD-TO-local_library.txt`. Keep it valid JSON — the app
parses this file on every build.)

## STEP 3 — Replace the activity code with one-liners

DownloadsActivity first (it still holds old code — that is exactly what produced
the stray-`}` errors before):

**DownloadsActivity** → Logic → **⋮** → Java/Kotlin Injection → **every tab**:
Select All → Delete; scroll to confirm each tab is truly empty. Then in `onCreate`:

```
DlScreen85.show(this);
```

**Player activity** (`LocalplayerActivity`) → same: clear every tab, then `onCreate`:

```
LocalPlayer85.show(this);
```

**MainActivity** → three tabs (each currently holds the failed v1.4h paste — clear
them all):

| Tab | Paste |
|---|---|
| `onCreate` | `MainScreen85.install(this);` |
| `onBackPressed` | `MainScreen85.back(this);` |
| `onResume` | `MainScreen85.resume(this);` |

The MainActivity **layout keeps its WebView** — the library finds it by walking the
view tree (no id lookup). Manifest attributes (configChanges, POST_NOTIFICATIONS)
stay as they are.

## STEP 4 — Assets (unchanged from v1.4h)

```
/storage/emulated/0/.sketchware/mysc/608/app/src/main/assets/local-player.html
```

Copy `local-player.html` there if it is not already. The offline player falls back
to the copy on deymflix.eu.cc when the asset is missing, so online playback works
either way.

## STEP 5 — Build

Expected: splash hexagon → site loads → bottom nav has **Downloads** (app only) →
download flow with hidden notifications → My Downloads with tabs/posters → Play
opens landscape fullscreen offline with subtitles.

## If the build fails

| Message | Meaning |
|---|---|
| `cannot find symbol: class MainScreen85` / `DlScreen85` / `LocalPlayer85` | STEP 1 or STEP 2 is incomplete: the folder must contain both files, and the JSON entry must be inside the project's `data/local_library` array. Re-check the exact path characters |
| Files in the folder are named `deymflix-screens-1.0_classes.jar` / `_classes.dex` | wrong names — many Android file managers/extractors prepend the zip name. Rename them to exactly `classes.jar` and `classes.dex` (long-press → Rename), keeping them in the `deymflix-screens-1.0` folder. The registration JSON points at the plain names, so any other filename = invisible library |
| Library shows enabled but its classes don't resolve | the project's `data/608/local_library` entry is just `{"name":"…"}` with no paths (Sketchware saves that when the folder was missing at registration time). The entry needs all three keys: `dexPath`, `jarPath`, `name` |
| `Duplicate method` / stray `}` | old code still in a tab — clear every tab of that activity |
| App builds but Downloads opens blank/empty | DownloadsActivity's `downloads.xml` must stay empty; the screen builds itself |
| App builds but tapping a download shows nothing | the old 4A–4F text is still somewhere; clear all DownloadsActivity tabs |

## Updating the library later

If I ever change a screen: I rebuild the zip, you re-copy `classes.jar` +
`classes.dex` over the same folder — **no pasting ever again**.

## Verification / file map

```
node .freebuff/build-check.js      # compiles everything, ALL CHECKS PASSED = ship it
```

- `MainScreen85.java`, `DlScreen85.java`, `LocalPlayer85.java` — the three screens (source of truth)
- `.freebuff/make-screens-lib.js` — builds `deymflix-screens-lib/` (jar + dex + registration)
- `deymflix-screens-1.0.zip` — what you upload and copy to the phone
- `ADD-TO-local_library.txt` — the JSON entry for STEP 2
- `DEYMFLIX-APP-v1.4.java` — now just the five one-liners + documentation
- `SECTION-1..6-paste.txt` — the five one-line tab contents
- `.freebuff/archive-section4-6.txt` — every big paste that ever failed, kept for reference
- `install-app-files.html` — phone download page for the zip
