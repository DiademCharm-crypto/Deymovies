HOW TO ADD MANUAL SUBTITLES
============================

1. Drop subtitle files in THIS folder (.srt recommended, .vtt / .ass / .ssa also work)

2. MOVIES — put the file right here, named after the movie:

     The Runner.srt
     Ma'am Chief: Shakedown in Seoul.srt
     Colony (2026)-en.srt

   SERIES — make one subfolder per series, one file per episode:

     Crew Girl/ep1.srt
     Crew Girl/ep2.srt
     Love U Lots/Episode 3.srt

   Episode filenames must contain the episode number: ep1, e1, episode 1
   or S01E01 all work. Files for OTHER episodes are never loaded by mistake
   (playing episode 2 will ignore ep1.srt automatically).

   These also work for episodes (no subfolder needed):
     Crew Girl-ep2.srt
     Crew Girl S01E02.srt

   Extra words in the name are fine:
     The.Runner.2026.1080p.BluRay.srt   → matches "The Runner"

3. That's it — the player checks this folder FIRST on every movie load.
   If a match is found, it is used automatically (online search is skipped).
   You can also pick any file manually: Settings → 📁 My Subtitles
   (files that match the current movie show a ★ match marker).

NOTES
- If the site is served by proxy-server.js, the folder is read live:
  adding a file works immediately (just reload the player page).
  Subfolders up to 3 levels deep are supported.
- On static hosting (GitHub Pages) with no backend, the player falls back
  to fetching "subtitles/<Movie Title>.srt" directly — keep movie files in
  the TOP level of this folder with simple names (subfolders need the backend).
- The list refreshes when the page reloads.
