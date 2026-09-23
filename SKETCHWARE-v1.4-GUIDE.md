# DEYMFLIX App v1.4 — Sketchware Pro Upgrade Guide

**Start from:** your v1.3 project (it already has the SwipeRefresh layout fix and the local `androidx.swiperefreshlayout` library).
**Estimated time:** ~15 minutes. No new libraries needed.

---

## What's new in v1.4

| Feature | How it works |
|---|---|
| **Splash screen** | Branded loading overlay on launch; hides itself the moment the site finishes loading (`onPageFinished`), with a 6-second safety timeout |
| **App-mode gate** | WebView UA gets ` DeymflixApp/1.4` → website shows the ⬇ nav item + Download button **only inside the app** |
| **Confirm dialog** | "Download The Runner? · 1080p · 1.4 GB" — real size via native HEAD request |
| **Progress notification** | DownloadManager shows a live progress bar in the status bar automatically |
| **Downloads page** | "My Downloads" screen with live %, Cancel and Delete |

---

## STEP 1 — Manifest permissions (Manifest tab)

Add these two lines (INTERNET / ACCESS_NETWORK_STATE are already there):

```
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="28" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

POST_NOTIFICATIONS is what makes the download progress notification visible on Android 13+.
(The Java also requests it at runtime before the first download — belt and suspenders.)

## STEP 2 — Paste the v1.4 Java (Logic → MainActivity → ⋮ → Java/Kotlin Injection)

Open `DEYMFLIX-APP-v1.4.java` and paste over the corresponding v1.3 blocks:

| Section | Paste into tab | Replaces |
|---|---|---|
| SECTION 1 | `onCreate` | v1.3 SECTION 1 |
| SECTION 2 | `onBackPressed` | v1.3 SECTION 2 (unchanged content) |
| SECTION 3 | `onResume` | v1.3 SECTION 3 (unchanged content) |

⚠️ **Replace, don't append** — v1.3 and v1.4 both define the same methods (`isNetworkAvailable`, etc.). If you append, you get duplicate-method compile errors. Delete the old block first.

⚠️ **Keep the layout as-is** — `main` XML must still be `swipe_refresh` wrapping `webview1`. v1.4 doesn't change it.

## STEP 3 — (Optional) DownloadsActivity

Not required. The Downloads screen is a themed dialog built in code, opened by the nav item. If you later want a real activity, create it in Activity manager and move `showDownloadsPage()`'s body there — but the v1.4 dialog works standalone.

## STEP 4 — Build & install

1. Build the APK in Sketchware Pro.
2. Install on your phone.
3. Expected behavior on launch:
   - **Black splash with red DEYMFLIX + spinner** appears instantly
   - The moment the site's home page finishes loading, the splash **fades out**
   - If the site takes >6s, the splash dismisses itself (never a stuck screen)
4. Verify app mode: open the site in the app → the bottom nav now shows **6 items** ending with ⬇ **Downloads**. Open the same site in Chrome → still 5 items, no Download button.
5. Verify a download: play any movie → tap the ⬇ beside the bookmark button → confirm dialog shows **quality + size** → Download → progress appears in the notification shade and in **My Downloads** (Cancel works while active, Delete works after completion).

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Nav shows 5 items in the app | UA line not pasted (SECTION 1 step 2), or the site's `app.js` is cached — force-reload once |
| Splash never disappears | It can't (6s timer) — if you see it hang, you pasted SECTION 1 without the closing `}` of onCreate |
| "This title cannot be downloaded." | The title streams via iframe/HLS only — direct MP4s are downloadable; that's expected for iframe-embed titles |
| Download notification missing on Android 13+ | Grant Notifications permission when prompted on the first download |
| Duplicate-method compile error | Old v1.3 block not deleted — STEP 2 warning |
| Confirm dialog shows "Size: unknown" | HEAD request blocked/timeout — download still works; size just wasn't retrievable |

---

## File map (what each piece does)

- `DEYMFLIX-APP-v1.4.java` — the 3 paste sections
- `downloads.html` — web fallback if the bridge is ever unavailable
- `app.js` (website) — app-mode detection: injects the ⬇ nav item + player Download button
- `player.html` (website) — exposes the current direct MP4 URL to the download flow
