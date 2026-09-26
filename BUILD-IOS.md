# DEYMFLIX iOS — Build & Install Guide

The iOS app lives in `ios/`. It mirrors the Android app: splash with the
spinning-ring logo, the site in a native WebView with the `DeymflixApp`
bridge, fullscreen handoff to a native AVPlayer (speed + English/Tagalog
subtitles), and real background downloads with a My Downloads screen.

Swift cannot be compiled on Windows — the build runs on GitHub's Mac
servers (free for public repos).

---------------------------------------------------------------------------
## STEP 1 — Push the ios/ folder to GitHub

Upload (or git push) these to your repo root:
- `ios/project.yml`
- `ios/Deymflix/Sources/` (4 .swift files)
- `ios/Deymflix/Assets.xcassets/` (the app icon)
- `.github/workflows/ios.yml`

## STEP 2 — Get the unsigned IPA from GitHub Actions

1. Repo → **Actions** tab → "Build iOS IPA (unsigned)"
2. If it did not start automatically: click it → **Run workflow** → Run
3. Wait ~5 minutes for the green check
4. Open the finished run → scroll to **Artifacts** → download
   **Deymflix-unsigned-ipa** → unzip → `Deymflix-unsigned.ipa`

## STEP 3 — Sign & install with Sideloadly (free, needs the iPad attached)

One-time setup on this PC:
1. Install **iTunes** (apple.com version, NOT Microsoft Store) — provides USB drivers
2. Install **iCloud** (apple.com) — additional drivers
3. Install **Sideloadly** from sideloadly.io

Every install:
1. Connect the iPad by USB → tap **Trust** on the iPad
2. Open Sideloadly → drag `Deymflix-unsigned.ipa` into it
3. Enter your Apple ID (the one signed into the iPad) → **Start**
4. Enter your Apple ID password when prompted; wait ~2 minutes
5. On the iPad: **Settings → General → VPN & Device Management** →
   your Apple ID → **Trust**

DEYMFLIX appears on the home screen. Free-signing limits: re-sign every
7 days (30 seconds in Sideloadly), max 3 sideloaded apps per device.

## Route B — TestFlight (no 7-day expiry, up to 10k testers)

Needs the $99/year Apple Developer account:
1. Paid cert + provisioning profile via developer.apple.com
2. Sign the same IPA (Xcode or Codemagic cloud signing)
3. Upload to App Store Connect → TestFlight → invite by link

## Troubleshooting the cloud build

If Actions turns red, open the failing log line. Typical causes:
- Swift syntax error → paste me the log lines, I fix them like Android
- `xcodegen: not found` → workflow cache issue → re-run the job
- Code signing noise is expected (we build unsigned) — only red on
  OTHER steps matters.
