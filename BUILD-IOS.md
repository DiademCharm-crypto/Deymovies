# DEYMFLIX for iOS — build & install guide

This folder contains a complete native iOS app (Swift/Xcode) that mirrors the
Android app: site in a WebView with the same `DeymflixApp` bridge, native
AVPlayer for fullscreen/streams, background downloads, Downloads screen,
splash animation. The Swift sources compile on a Mac or a GitHub-hosted Mac —
not on this Windows PC.

## What exists here

| Path | What it is |
|---|---|
| `ios/project.yml` | XcodeGen spec (generates the Xcode project) |
| `ios/Deymflix/Sources/*.swift` | App code: splash, browser+bridge, player, downloads |
| `ios/Deymflix/Assets.xcassets` | App icon (1024px, hexagon mark) |
| `.github/workflows/ios.yml` | Cloud Mac build → unsigned IPA artifact |

## Route A — free, personal install (no Apple account)

1. Push this folder to GitHub → Actions tab → run **Build iOS IPA (unsigned)**.
2. Download the `Deymflix-unsigned-ipa` artifact.
3. On a PC install [Sideloadly](https://sideloadly.io) or AltStore.
4. iPhone via USB → Sideloadly → pick the IPA → sign with any free Apple ID
   → the app installs. Re-sign every 7 days (AltStore refreshes in background).

## Route B — TestFlight (public beta link on app.html)

1. Apple Developer Program **$99/year**.
2. Same GitHub build, then on any Mac (or a borrowed one / cloud Mac):
   `xcrun altool --upload-app Deymflix-unsigned.ipa` after signing with your
   distribution cert.
3. TestFlight → invite link → up to 10,000 testers install from Safari.
   Builds expire after 90 days — re-upload a fresh IPA monthly.

## Route C — App Store (public, permanent)

Same as Route B plus App Store review. Note: streaming apps need content
rights documentation; this is the slowest route.

## Known gaps vs the Android app

- iOS blocks true offline storage of large videos inside a WebView; the
  native `Downloader.swift` handles downloads instead (Documents/Deymflix).
- Sideloaded builds are personal-use; don't ship the IPA publicly.
- The site's `_episodeNum` ep1 stamp (player.html) benefits iOS the same as
  Android once deployed.

## Local build (if you ever get a Mac)

```bash
cd ios
xcodegen generate
open Deymflix.xcodeproj   # set your team in Signing, Cmd+R
```
