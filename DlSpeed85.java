// ===========================================================================
//  DEYMFLIX -- DlSpeed85.java         (library class, v1.5)
// ===========================================================================
//  WHAT THIS IS
//    The fast download engine. DownloadManager is single-connection and on
//    some networks crawls. This engine opens SEVERAL connections to the CDN
//    in parallel (byte-range segments), writes them into part files, and
//    stitches them into the final movie file. It also owns the extra states
//    the Downloads screen needs:
//      - "Retrieving files..." while the size is being probed
//      - Insufficient Storage marking (red text on the screen)
//      - Retry that restarts the SAME url without going back to the movie page
//
//  HOW ROWS ARE LINKED
//    A registry row in the "deymflix_dl" preferences with a key starting
//    with "M" belongs to this engine. Value format (same as MainActivity):
//        title[POSTER]poster-url[SUB]subtitle-file-name
//    Everything else in this class lives in memory (status, progress, speed).
//    If the app is killed mid-download the row reappears with a Restart
//    button -- tapping it calls restartRow() and the download starts over.
//
//  100% ASCII, zero pipe characters.
// ===========================================================================
package com.deymflix.eu.cc;

import android.app.Activity;
import android.content.Context;
import android.content.SharedPreferences;
import android.os.Environment;
import android.widget.Toast;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.RandomAccessFile;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.Locale;

public class DlSpeed85 {

    // Row statuses (in-memory; a row without an entry counts as interrupted)
    public static final int ST_RUNNING = 0;
    public static final int ST_DONE = 1;
    public static final int ST_FAILED = 2;
    public static final int ST_PENDING = 3;   // queued: over the concurrency limit

    // Message marker the Downloads screen looks for to show the red
    // "Insufficient Storage" text.
    public static final String MSG_NOSPACE = "Insufficient Storage";
    public static final String MSG_RETRIEVING = "Retrieving files...";

    // progress[slot] = bytes fetched by that segment
    private static final HashMap<String, long[]> PROGRESS = new HashMap<String, long[]>();
    private static final HashMap<String, Integer> STATUS = new HashMap<String, Integer>();

    // ---- CONCURRENCY ("Downloads" settings: 1 / 2 / 3 at a time) ------
    // Persisted so the choice survives restarts. Default 1: one download at
    // a time, everything else sits in the Pending queue. Each engine start
    // and each engine FINISH calls pump() to launch queued rows into free
    // slots. GUARD serializes pump() so two finishes can't double-start.
    private static final Object GUARD = new Object();
    private static final String MAX_KEY = "deymflix_max_dl";
    private static int maxConcurrent(Context ctx) {
        try {
            int v = prefs(ctx).getInt(MAX_KEY, 1);
            if (v < 1) return 1;
            if (v > 3) return 3;
            return v;
        } catch (Exception e) { return 1; }
    }
    public static int getMaxConcurrent(Context ctx) { return maxConcurrent(ctx); }
    public static void setMaxConcurrent(Context ctx, int n) {
        if (n < 1) n = 1;
        if (n > 3) n = 3;
        prefs(ctx).edit().putInt(MAX_KEY, n).apply();
        pump(ctx); // raising the limit can start queued rows right away
    }
    // Rows waiting to run (engine rowIds), newest at the end. Rebuilt from
    // the registry when a screen opens after a process restart.
    private static final java.util.ArrayList<String> PENDING =
            new java.util.ArrayList<String>();

    // Launch queued rows while running count < limit. Called on every start,
    // every finish and every limit change.
    private static void pump(final Context ctx) {
        synchronized (GUARD) {
            try {
                int running = 0;
                ArrayList<String> all = engineRowIds(ctx);
                for (int i = 0; i < all.size(); i++) {
                    if (STATUS.get(all.get(i)) == Integer.valueOf(ST_RUNNING)) running++;
                }
                int limit = maxConcurrent(ctx);
                while (running < limit && !PENDING.isEmpty()) {
                    String rowId = PENDING.remove(0);
                    if (STATUS.get(rowId) != Integer.valueOf(ST_PENDING)) continue;
                    String[] meta = readRow(ctx, rowId);
                    String mu = meta[2];
                    if (mu == null) mu = "";
                    if (mu.length() == 0) {
                        // no url: dead row, fail it instead of hanging the queue
                        STATUS.put(rowId, ST_FAILED);
                        MSG.put(rowId, "Download failed -- tap Retry");
                        continue;
                    }
                    STATUS.put(rowId, ST_RUNNING);
                    MSG.put(rowId, MSG_RETRIEVING);
                    PROGRESS.put(rowId, new long[SEGMENTS + 1]);
                    STOP.put(rowId, new boolean[] { false });
                    runEngine(ctx, rowId, meta[2], null);
                    running++;
                }
            } catch (Exception e) { }
        }
    }
    private static final HashMap<String, String> MSG = new HashMap<String, String>();
    private static final HashMap<String, String> PATHS = new HashMap<String, String>();
    private static final HashMap<String, boolean[]> STOP = new HashMap<String, boolean[]>();

    private static final int SEGMENTS = 4;

    // Set by any worker that hits a disk-full error; runEngine checks it
    // when a download fails so the row is marked Insufficient Storage.
    private static volatile boolean noSpaceHit = false;

    // Registry suffixes: the file path and byte size live IN the row so Play
    // and the screen survive an app restart (the in-memory maps die with the
    // process; the preferences do not).
    private static final String K_PATH = "[PATH]";
    private static final String K_SIZE = "[SIZE]";
    private static final String K_NAME = "[NAME]";   // episode sub-title

    // App context cache so statusOf()/finalPath() can read the registry
    // without a context argument (the screen always calls engineRowIds()
    // first, which primes it).
    private static volatile Context CTX;
    private static volatile Context appCtx;

    private static void rememberCtx(Context ctx) {
        if (ctx != null) CTX = ctx.getApplicationContext();
        if (appCtx == null) appCtx = ctx.getApplicationContext();
    }

    // App context for other classes (duplicate-download check). Null until
    // the engine has run once this process.
    public static Context appContext() {
        return appCtx;
    }

    // Path of the FINISHED download matching a title (hybrid-player
    // fallback), or null. Engine registry first, DownloadManager meta second.
    public static class OfflineEpisode {
        public String rowId;    // engine registry key ("") for dm rows
        public long dmId;       // DownloadManager id (0 for engine rows)
        public String title;    // full row title ("Series epN" or "Movie")
        public String path;     // video file path
        public String subName;  // sidecar subtitle file name (may be null)
        public String epName;   // episode descriptive sub-title (may be null)
        public int ep;          // episode number (0 = not an episode)
    }

    // Every FINISHED download of a series (title "... epN"), in episode
    // order. Backs the offline player's Episodes list. Also finds the
    // marker-less ep1 rows: a series row with no other episode number
    // while sibling "ep2+" rows exist counts as episode 1.
    public static java.util.ArrayList<OfflineEpisode> offlineEpisodesFor(Context ctx, String seriesName) {
        java.util.ArrayList<OfflineEpisode> out = new java.util.ArrayList<OfflineEpisode>();
        if (ctx == null) return out;
        if (seriesName == null) return out;
        String want = seriesName.trim().toLowerCase(Locale.US);
        if (want.length() == 0) return out;
        try {
            rememberCtx(ctx);
            ArrayList<String> ids = engineRowIds(ctx);
            for (int i = 0; i < ids.size(); i++) {
                String rid = ids.get(i);
                if (statusOf(rid) != ST_DONE) continue;
                String[] meta = readRow(ctx, rid);
                String t = meta[0] == null ? "" : meta[0];
                String ser = seriesOfTitle(t);
                int ep = episodeNumOfTitle(t);
                if (ser == null) continue;
                if (!ser.toLowerCase(Locale.US).equals(want)) continue;
                OfflineEpisode oe = new OfflineEpisode();
                oe.rowId = rid;
                oe.dmId = 0L;
                oe.title = t;
                oe.path = PATHS.get(rid);
                if (oe.path == null) oe.path = meta[4];
                oe.subName = meta[3];
                oe.epName = meta.length > 6 ? meta[6] : "";
                oe.ep = ep;
                out.add(oe);
            }
            // marker-less ep1 rows: same series key, no ep marker anywhere
            for (int i = 0; i < ids.size(); i++) {
                String rid = ids.get(i);
                if (statusOf(rid) != ST_DONE) continue;
                String[] meta = readRow(ctx, rid);
                String t = meta[0] == null ? "" : meta[0];
                if (seriesOfTitle(t) != null) continue;
                if (episodeNumOfTitle(t) > 0) continue;
                String key = seriesKeyOfTitle(t);
                if (key == null) continue;
                if (!key.toLowerCase(Locale.US).equals(want)) continue;
                if (out.isEmpty()) continue; // no siblings: it is just a movie
                boolean dup = false;
                for (int j = 0; j < out.size(); j++) {
                    if (out.get(j).ep == 1) { dup = true; break; }
                }
                if (dup) continue;
                OfflineEpisode oe = new OfflineEpisode();
                oe.rowId = rid;
                oe.dmId = 0L;
                oe.title = t;
                oe.path = PATHS.get(rid);
                if (oe.path == null) oe.path = meta[4];
                oe.subName = meta[3];
                oe.epName = meta.length > 6 ? meta[6] : "";
                oe.ep = 1;
                out.add(oe);
            }
            java.util.Collections.sort(out, new java.util.Comparator<OfflineEpisode>() {
                @Override public int compare(OfflineEpisode a, OfflineEpisode b) { return a.ep - b.ep; }
            });
        } catch (Exception e) { }
        return out;
    }

    // "Series Name ep3" -> "Series Name" (null when not an episode row)
    public static String seriesOfTitle(String t) {
        if (t == null) return null;
        java.util.regex.Matcher m = java.util.regex.Pattern
                .compile("\\s+ep\\s*(\\d+)\\s*$").matcher(t.trim());
        if (m.find()) return t.trim().substring(0, m.start());
        return null;
    }

    public static int episodeNumOfTitle(String t) {
        if (t == null) return 0;
        java.util.regex.Matcher m = java.util.regex.Pattern
                .compile("\\s+ep\\s*(\\d+)\\s*$").matcher(t.trim());
        if (m.find()) {
            try { return Integer.parseInt(m.group(1)); } catch (Exception e) { return 0; }
        }
        return 0;
    }

    // Loose series key: lowercase, non-alphanumerics collapsed ("The+Scandal"
    // and "The Scandal" match) -- mirrors the downloads screen grouping.
    public static String seriesKeyOfTitle(String t) {
        if (t == null) return null;
        return t.toLowerCase(Locale.US).replaceAll("[^a-z0-9]+", " ").trim();
    }

    public static String downloadedPathFor(Context ctx, String title) {
        if (ctx == null) return null;
        if (title == null) return null;
        if (title.length() == 0) return null;
        try {
            int ep = MainScreen85.episodeNumFromTitle(title);
            java.util.ArrayList<String> ids = engineRowIds(ctx);
            for (int i = 0; i < ids.size(); i++) {
                String rid = ids.get(i);
                if (statusOf(rid) != ST_DONE) continue;
                String[] m = readRow(ctx, rid);
                String t = m[0] == null ? "" : m[0];
                if (t.length() == 0) continue;
                boolean sameTitle = t.equalsIgnoreCase(title);
                boolean sameEp = ep > 0 && ep == MainScreen85.episodeNumFromTitle(t);
                if (sameTitle) {
                    String p = m[4] == null ? "" : m[4];
                    if (p.length() > 0 && new File(p).exists()) return p;
                }
                if (sameEp) {
                    String p = m[4] == null ? "" : m[4];
                    if (p.length() > 0 && new File(p).exists()) return p;
                }
            }
        } catch (Exception e) { }
        return null;
    }

    // Rewrite just the [SIZE] part of a row, keeping everything else.
    private static void storeSize(Context ctx, String rowId, long total) {
        try {
            SharedPreferences p = prefs(ctx);
            String raw = p.getString(rowId, "");
            if (raw == null) return;
            if (raw.length() == 0) return;
            String out;
            int cut = raw.indexOf(K_SIZE);
            if (cut >= 0) {
                out = raw.substring(0, cut + K_SIZE.length()) + String.valueOf(total);
            } else {
                out = raw + K_SIZE + String.valueOf(total);
            }
            p.edit().putString(rowId, out).apply();
        } catch (Exception e) { }
    }

    // =======================================================================
    //  START -- called from the download dialog on the movie page
    //  Returns false when storage is short or the engine could not run
    //  (the caller falls back to DownloadManager in that case).
    // =======================================================================
    // Standard start: engine + the "Downloading X" toast. The series
    // bulk-download uses startQuiet (one summary toast for all episodes).
    public static boolean start(final Activity act, final String url, final String title,
            final String poster, final String subUrl) {
        return start(act, url, title, poster, subUrl, "");
    }

    public static boolean start(final Activity act, final String url, final String title,
            final String poster, final String subUrl, final String epName) {
        boolean ok = startQuiet(act, url, title, poster, subUrl, epName);
        if (ok) {
            Toast.makeText(act.getApplicationContext(),
                    "Downloading " + (title == null ? "video" : title) + " -- track it on My Downloads",
                    Toast.LENGTH_LONG).show();
        }
        return ok;
    }

    // Same engine start WITHOUT the per-download toast (bulk downloads).
    public static boolean startQuiet(final Activity act, final String url, final String title,
            final String poster, final String subUrl) {
        return startQuiet(act, url, title, poster, subUrl, "");
    }

    // Same engine start WITHOUT the per-download toast (bulk downloads).
    // epName: descriptive episode sub-title (optional, may be null/empty).
    public static boolean startQuiet(final Activity act, final String url, final String title,
            final String poster, final String subUrl, final String epName) {
        if (act == null) return false;
        if (url == null) return false;
        if (url.length() == 0) return false;
        rememberCtx(act);
        try {
            File dir = dlDir(act);
            long free = freeBytes();
            if (free < 268435456L) { // 256 MB floor: never even start
                Toast.makeText(act.getApplicationContext(),
                        MSG_NOSPACE + " -- free up space and try again", Toast.LENGTH_LONG).show();
                return false;
            }
            String rowId = "M" + String.valueOf(System.currentTimeMillis())
                    + String.valueOf((long) (Math.random() * 1000L));
            String token = "dfx_" + randomToken() + ".mp4";
            String subName = token.replace(".mp4", ".srt");
            SharedPreferences p = act.getSharedPreferences("deymflix_dl", 0);
            // Row layout:
            //   title[URL]video-url[POSTER]poster[SUB]sub[PATH]file[SIZE]bytes
            // URL lets Retry restart without the movie page; PATH+SIZE let
            // Play and the screen survive an app restart.
            String finalPath = new File(dir, token).getAbsolutePath();
            p.edit().putString(rowId,
                    (title == null ? "Video" : title)
                    + "[URL]" + url
                    + "[POSTER]" + (poster == null ? "" : poster)
                    + "[SUB]" + subName
                    + K_NAME + (epName == null ? "" : epName)
                    + K_PATH + finalPath
                    + K_SIZE + "-1").apply();
            PATHS.put(rowId, finalPath);

            // CONCURRENCY: running rows keep their slot; over-limit starts
            // sit in the Pending queue until a running row finishes (or the
            // user raises the limit in Downloads settings).
            int running = 0;
            ArrayList<String> all = engineRowIds(act);
            for (int i = 0; i < all.size(); i++) {
                if (STATUS.get(all.get(i)) == Integer.valueOf(ST_RUNNING)) running++;
            }
            if (running >= maxConcurrent(act)) {
                STATUS.put(rowId, ST_PENDING);
                MSG.put(rowId, "");
                PROGRESS.put(rowId, new long[SEGMENTS + 1]);
                STOP.put(rowId, new boolean[] { false });
                synchronized (GUARD) { PENDING.add(rowId); }
                pump(act.getApplicationContext());
                return true;
            }

            STOP.put(rowId, new boolean[] { false });
            STATUS.put(rowId, ST_RUNNING);
            MSG.put(rowId, "");
            PROGRESS.put(rowId, new long[SEGMENTS + 1]);
            runEngine(act.getApplicationContext(), rowId, url, subUrl);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    // =======================================================================
    //  RETRY -- the button on the Downloads screen. Wipes the parts and
    //  starts the same url over. Shows "Retrieving files..." right away.
    // =======================================================================
    public static void restartRow(final Context ctx, final String rowId) {
        try {
            String[] meta = readRow(ctx, rowId);
            // no url stored: cannot restart without it
            if (meta[2] == null) return;
            if (meta[2].length() == 0) return;
            boolean[] stop = STOP.get(rowId);
            if (stop != null) stop[0] = true;
            // give any running threads a beat to notice the stop flag
            try { Thread.sleep(250); } catch (Exception e) { }
            deleteParts(ctx, rowId);
            STOP.put(rowId, new boolean[] { false });
            STATUS.put(rowId, ST_RUNNING);
            MSG.put(rowId, MSG_RETRIEVING);
            PROGRESS.put(rowId, new long[SEGMENTS + 1]);
            Toast.makeText(ctx, "Retrying " + (meta[0].length() == 0 ? "download" : meta[0]),
                    Toast.LENGTH_SHORT).show();
            runEngine(ctx, rowId, meta[2], null);
        } catch (Exception e) {
            STATUS.put(rowId, ST_FAILED);
            MSG.put(rowId, "Retry failed");
        }
    }

    // Legacy DownloadManager rows that failed (for example Insufficient
    // Storage): pull the url back out of DownloadManager, remove that row,
    // and hand the download to this engine.
    public static void restartFromDm(final Activity act, final long dmId, final String title,
            final String poster, final String subName) {
        try {
            android.app.DownloadManager dm =
                    (android.app.DownloadManager) act.getSystemService(Context.DOWNLOAD_SERVICE);
            android.database.Cursor c = dm.query(new android.app.DownloadManager.Query().setFilterById(dmId));
            String url = "";
            if (c != null && c.moveToFirst()) {
                String u = c.getString(c.getColumnIndexOrThrow(android.app.DownloadManager.COLUMN_URI));
                if (u != null) url = u;
            }
            if (c != null) c.close();
            if (url.length() == 0) {
                Toast.makeText(act, "Open the movie again and tap download", Toast.LENGTH_SHORT).show();
                return;
            }
            try { dm.remove(dmId); } catch (Exception e) { }
            SharedPreferences p = act.getSharedPreferences("deymflix_dl", 0);
            p.edit().remove(String.valueOf(dmId)).apply();
            String subUrl = MainScreen85.findSubUrlForMovie(title, MainScreen85.episodeNumFromTitle(title));
            start(act, url, title, poster, subUrl);
        } catch (Exception e) {
            Toast.makeText(act, "Could not restart this download", Toast.LENGTH_SHORT).show();
        }
    }

    // =======================================================================
    //  CANCEL / DELETE
    // =======================================================================
    public static void cancelRow(final Context ctx, final String rowId) {
        boolean[] stop = STOP.get(rowId);
        if (stop != null) stop[0] = true;
        deleteParts(ctx, rowId);
        prefs(ctx).edit().remove(rowId).apply();
        STATUS.remove(rowId);
        MSG.remove(rowId);
        PROGRESS.remove(rowId);
        PATHS.remove(rowId);
        STOP.remove(rowId);
        synchronized (GUARD) { PENDING.remove(rowId); }
        pump(ctx); // a cancelled pending/running row frees a slot
    }

    public static void deleteRow(final Context ctx, final String rowId) {
        // read everything BEFORE cancelRow wipes the registry row
        String path = PATHS.get(rowId);
        String[] meta = readRow(ctx, rowId);
        cancelRow(ctx, rowId);
        try {
            if (path != null && path.length() > 0) new File(path).delete();
            if (meta[3] != null && meta[3].length() > 0) {
                new File(dlDir(ctx), meta[3]).delete();
            }
        } catch (Exception e) { }
    }

    // =======================================================================
    //  READERS the Downloads screen polls once per second
    // =======================================================================
    public static int statusOf(String rowId) {
        Integer s = STATUS.get(rowId);
        if (s != null) return s.intValue();
        // No in-memory state (process restarted): recover from the registry.
        String path = pathOfRow(rowId);
        if (path.length() > 0) {
            File f = new File(path);
            if (f.exists()) {
                PATHS.put(rowId, path);
                // A file that exists from a previous process is either the
                // finished movie or a partial single-stream download; the
                // screen treats this as DONE when the size matches.
                long want = sizeOfRow(rowId);
                STATUS.put(rowId, (want > 0 && f.length() == want) ? ST_DONE : ST_FAILED);
                MSG.put(rowId, STATUS.get(rowId) == ST_DONE ? "" : "");
                return STATUS.get(rowId).intValue();
            }
            // no file at all: this row never finished anything -- dead
            STATUS.put(rowId, ST_FAILED);
            MSG.put(rowId, "Download failed -- tap Retry");
            return ST_FAILED;
        }
        return ST_FAILED;
    }

    public static String msgOf(String rowId) {
        String m = MSG.get(rowId);
        return m == null ? "" : m;
    }

    // {done, total, lastDone, lastTime, speed} -- the screen computes speed
    public static long[] progressOf(String rowId) {
        long[] p = PROGRESS.get(rowId);
        if (p == null) return new long[] { 0L, -1L, 0L, 0L, 0L };
        long done = 0;
        synchronized (p) { for (int i = 0; i < SEGMENTS; i++) done += p[i]; }
        return new long[] { done, p[SEGMENTS], 0L, 0L, 0L };
    }

    public static String finalPath(String rowId) {
        String p = PATHS.get(rowId);
        if (p != null) return p;
        return pathOfRow(rowId);
    }

    // row value -> stored file path ("" when absent)
    private static String pathOfRow(String rowId) {
        try {
            String[] m = readRow(CTX, rowId);
            return m[4] == null ? "" : m[4];
        } catch (Exception e) {
            return "";
        }
    }

    private static long sizeOfRow(String rowId) {
        try {
            String[] m = readRow(CTX, rowId);
            if (m[5] == null) return -1L;
            return Long.parseLong(m[5]);
        } catch (Exception e) {
            return -1L;
        }
    }

    public static ArrayList<String> engineRowIds(Context ctx) {
        rememberCtx(ctx);
        ArrayList<String> ids = new ArrayList<String>();
        boolean anyRunning = false;
        try {
            for (Object k : prefs(ctx).getAll().keySet()) {
                String key = String.valueOf(k);
                if (key.startsWith("M")) ids.add(key);
            }
            Collections.sort(ids, Collections.reverseOrder());
            // After a process restart the in-memory queue is empty while
            // registry rows may still be marked running. Recover: rebuild the
            // pending queue from rows that never got a file and re-admit the
            // ones already running, so the 1/2/3 limit keeps holding.
            if (PENDING.isEmpty() && !recovering) {
                recovering = true;
                for (int i = 0; i < ids.size(); i++) {
                    String rid = ids.get(i);
                    Integer st = STATUS.get(rid);
                    if (st != null && st.intValue() == ST_PENDING) {
                        PENDING.add(rid);
                    }
                }
                pump(ctx);
            }
            for (int i = 0; i < ids.size(); i++) {
                if (STATUS.get(ids.get(i)) == Integer.valueOf(ST_RUNNING)) anyRunning = true;
            }
        } catch (Exception e) { }
        if (anyRunning) recovering = false;
        return ids;
    }
    private static volatile boolean recovering = false;

    // =======================================================================
    //  THE ENGINE (background thread)
    // =======================================================================
    private static void runEngine(final Context ctx, final String rowId, final String url,
            final String subUrl) {
        new Thread(new Runnable() { @Override public void run() {
            final boolean[] stop = STOP.get(rowId);
            final long[] prog = PROGRESS.get(rowId);
            File dir = dlDir(ctx);
            File finalFile = new File(PATHS.get(rowId));

            // -- 1) probe the real size with a 1-byte range request ------
            long total = -1;
            boolean ranged = true;
            try {
                HttpURLConnection c = open(url);
                c.setRequestProperty("Range", "bytes=0-0");
                int code = c.getResponseCode();
                if (code == 206) {
                    String cr = c.getHeaderField("Content-Range");
                    if (cr != null) {
                        int slash = cr.lastIndexOf('/');
                        if (slash >= 0 && slash < cr.length() - 1) {
                            total = Long.parseLong(cr.substring(slash + 1).trim());
                        }
                    }
                } else if (code == 200) {
                    ranged = false; // server ignores ranges: single stream
                    long cl = c.getContentLengthLong();
                    if (cl > 0) total = cl;
                }
                c.disconnect();
            } catch (Exception e) {
                total = -1;
            }
            if (stop[0]) return;
            if (prog != null) prog[SEGMENTS] = total < 0 ? -1L : total;
            if (total > 0) storeSize(ctx, rowId, total);

            // -- 2) storage guard before writing anything ---------------
            if (total > 0) {
                long free = freeBytes();
                if (free - total < 262144000L) { // 250 MB margin
                    STATUS.put(rowId, ST_FAILED);
                    MSG.put(rowId, MSG_NOSPACE);
                    return;
                }
            }

            // -- 3) download the segments -------------------------------
            boolean ok;
            if (ranged && total > 0) {
                long chunk = total / SEGMENTS;
                File[] parts = new File[SEGMENTS];
                long[] starts = new long[SEGMENTS];
                long[] ends = new long[SEGMENTS];
                for (int i = 0; i < SEGMENTS; i++) {
                    parts[i] = new File(dir, rowId + ".part" + i);
                    starts[i] = (long) i * chunk;
                    ends[i] = (i == SEGMENTS - 1) ? (total - 1) : ((long) (i + 1) * chunk - 1);
                    if (prog != null) prog[i] = 0L;
                }
                Thread[] ts = new Thread[SEGMENTS];
                for (int i = 0; i < SEGMENTS; i++) {
                    final int slot = i;
                    final File part = parts[i];
                    final long s = starts[i];
                    final long eEnd = ends[i];
                    ts[i] = new Thread(new Runnable() { @Override public void run() {
                        fetchPart(url, s, eEnd, part, prog, slot, stop);
                    }});
                    ts[i].start();
                }
                for (int i = 0; i < SEGMENTS; i++) {
                    try { ts[i].join(); } catch (Exception e) { }
                }
                ok = true;
                for (int i = 0; i < SEGMENTS; i++) {
                    long want = ends[i] - starts[i] + 1;
                    if (parts[i].length() != want) ok = false;
                }
                if (ok) {
                    MSG.put(rowId, "Merging files...");
                    ok = merge(rowId, parts, finalFile);
                }
                if (!ok) {
                    for (int i = 0; i < SEGMENTS; i++) parts[i].delete();
                }
            } else {
                // no range support or unknown size: one stream, straight to
                // the final file (still works, just not accelerated)
                ok = fetchWhole(url, finalFile, prog, stop);
            }
            if (stop[0]) return;
            if (!ok) {
                STATUS.put(rowId, ST_FAILED);
                String cur = MSG.get(rowId);
                if (noSpaceHit) {
                    MSG.put(rowId, MSG_NOSPACE);
                } else if (isBlankOrTransient(cur)) {
                    MSG.put(rowId, "Download failed -- tap Retry");
                }
                return;
            }

            // -- 4) done: stitch complete, delete the part files --------
            if (ranged && total > 0) {
                for (int i = 0; i < SEGMENTS; i++) {
                    new File(dir, rowId + ".part" + i).delete();
                }
            }
            storeSize(ctx, rowId, finalFile.length());
            STATUS.put(rowId, ST_DONE);
            MSG.put(rowId, "");
            PATHS.put(rowId, finalFile.getAbsolutePath());
            // a slot just freed: start the next queued row
            pump(ctx);

            // -- 5) subtitle travels with it ----------------------------
            if (subUrl != null && subUrl.length() > 0) {
                try {
                    String[] meta = readRow(ctx, rowId);
                    File sub = new File(dir, meta[3]);
                    HttpURLConnection c = open(subUrl);
                    InputStream in = new BufferedInputStream(c.getInputStream());
                    FileOutputStream out = new FileOutputStream(sub);
                    byte[] buf = new byte[8192];
                    int n;
                    while ((n = in.read(buf)) != -1) out.write(buf, 0, n);
                    out.close();
                    in.close();
                    c.disconnect();
                } catch (Exception e) { }
            } else {
                // No manifest subtitle was passed in -- try once more from the
                // player's side later (ensureSubtitle), so nothing is lost.
            }
            // Additionally: DownloadManager-fallback subtitles land in their
            // own folder; copy any sidecar next to THIS movie too.
            copyDmSubtitleIfExists(ctx, meta3Safe(ctx, rowId));
        }}).start();
    }

    // true when a status message is blank or a transient phase the failure
    // handler is allowed to overwrite
    private static boolean isBlankOrTransient(String cur) {
        if (cur == null) return true;
        if (cur.length() == 0) return true;
        if (cur.equals(MSG_RETRIEVING)) return true;
        if (cur.equals("Merging files...")) return true;
        return false;
    }

    // One ranged segment with resume + retries. Returns true when the part
    // file holds exactly its byte range.
    private static boolean fetchPart(String url, long start, long end, File part,
            long[] prog, int slot, boolean[] stop) {
        long want = end - start + 1;
        for (int attempt = 1; attempt <= 5; attempt++) {
            if (stop[0]) return false;
            try {
                long cur = part.exists() ? part.length() : 0L;
                if (cur >= want) { if (prog != null) { synchronized (prog) { prog[slot] = want; } } return true; }
                if (prog != null) { synchronized (prog) { prog[slot] = cur; } }
                HttpURLConnection c = open(url);
                c.setRequestProperty("Range", "bytes=" + String.valueOf(start + cur) + "-" + String.valueOf(end));
                int code = c.getResponseCode();
                if (code != 206 && code != 200) { c.disconnect(); sleep(1200L * attempt); continue; }
                InputStream in = new BufferedInputStream(c.getInputStream(), 262144);
                RandomAccessFile raf = new RandomAccessFile(part, "rw");
                raf.seek(cur);
                byte[] buf = new byte[65536];
                long got = cur;
                int n;
                while ((n = in.read(buf)) != -1) {
                    if (stop[0]) break;
                    long remain = want - got;
                    if (remain <= 0) break;
                    int w = (int) Math.min((long) n, remain);
                    raf.write(buf, 0, w);
                    got += w;
                    if (prog != null) { synchronized (prog) { prog[slot] = got; } }
                }
                raf.close();
                in.close();
                c.disconnect();
                if (got >= want) return true;
                sleep(1000L * attempt); // short read: loop and resume
            } catch (Exception e) {
                String m = String.valueOf(e.getMessage());
                if (looksLikeNoSpace(m)) noSpaceHit = true;
                try {
                    if (part.length() == 0) part.delete();
                } catch (Exception e2) { }
                sleep(1200L * attempt);
            }
        }
        return false;
    }

    // Single-connection fallback for servers without byte ranges.
    private static boolean fetchWhole(String url, File out, long[] prog, boolean[] stop) {
        for (int attempt = 1; attempt <= 4; attempt++) {
            if (stop[0]) return false;
            try {
                long cur = out.exists() ? out.length() : 0L;
                HttpURLConnection c = open(url);
                if (cur > 0) c.setRequestProperty("Range", "bytes=" + String.valueOf(cur) + "-");
                int code = c.getResponseCode();
                if (code != 206 && code != 200) { c.disconnect(); sleep(1200L * attempt); continue; }
                InputStream in = new BufferedInputStream(c.getInputStream(), 262144);
                RandomAccessFile raf = new RandomAccessFile(out, "rw");
                raf.seek(cur);
                byte[] buf = new byte[65536];
                long got = cur;
                int n;
                while ((n = in.read(buf)) != -1) {
                    if (stop[0]) break;
                    raf.write(buf, 0, n);
                    got += n;
                    if (prog != null) { synchronized (prog) { prog[0] = got; } }
                }
                raf.close();
                in.close();
                c.disconnect();
                if (prog != null && prog[SEGMENTS] > 0 && got >= prog[SEGMENTS]) return true;
                if (prog != null && prog[SEGMENTS] <= 0 && n == -1) return true;
                sleep(1000L * attempt);
            } catch (Exception e) {
                String m = String.valueOf(e.getMessage());
                if (looksLikeNoSpace(m)) noSpaceHit = true;
                sleep(1200L * attempt);
            }
        }
        return false;
    }

    private static boolean merge(String rowId, File[] parts, File out) {
        try {
            FileOutputStream out2 = new FileOutputStream(out);
            byte[] buf = new byte[1048576];
            for (int i = 0; i < parts.length; i++) {
                FileInputStream in = new FileInputStream(parts[i]);
                int n;
                while ((n = in.read(buf)) != -1) out2.write(buf, 0, n);
                in.close();
            }
            out2.close();
            return out.length() > 0;
        } catch (Exception e) {
            String m = String.valueOf(e.getMessage());
            if (looksLikeNoSpace(m)) noSpaceHit = true;
            return false;
        }
    }

    private static String meta3Safe(Context ctx, String rowId) {
        try {
            String[] m = readRow(ctx, rowId);
            return m[3] == null ? "" : m[3];
        } catch (Exception e) {
            return "";
        }
    }

    // DownloadManager-fallback rows keep their subtitle in DownloadManager's
    // own directory; if a same-named .srt exists there, copy it next to the
    // engine movie so the player always finds it.
    private static void copyDmSubtitleIfExists(Context ctx, String subName) {
        if (subName == null) return;
        if (subName.length() == 0) return;
        try {
            File dest = new File(dlDir(ctx), subName);
            if (dest.exists()) return; // already there
            File dmDir = ctx.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
            if (dmDir == null) return;
            File src = new File(dmDir, subName);
            if (!src.exists()) return;
            java.io.FileInputStream in = new java.io.FileInputStream(src);
            java.io.FileOutputStream out = new java.io.FileOutputStream(dest);
            byte[] buf = new byte[8192];
            int n;
            while ((n = in.read(buf)) != -1) out.write(buf, 0, n);
            out.close();
            in.close();
        } catch (Exception e) { }
    }

    private static boolean looksLikeNoSpace(String m) {
        if (m == null) return false;
        if (m.indexOf("ENOSPC") != -1) return true;
        if (m.indexOf("No space") != -1) return true;
        return false;
    }

    // =======================================================================
    //  HELPERS
    // =======================================================================
    // Subtitle cache folder for the ONLINE player: same dir the engine
    // uses, files named after the site manifest entries.
    public static File subCacheDir(Context ctx) {
        return dlDir(ctx);
    }

    // ONLINE player: download BOTH language sidecars (Engsub + PHsub) for a
    // title into the cache folder so the language picker can swap live.
    // Files already present are kept (no re-download). Uses the shared
    // candidate list + HEAD probes, so it works even without the manifest.
    public static void cacheSubsForTitle(Context ctx, String title) {
        if (title == null) return;
        if (title.length() == 0) return;
        try {
            int ep = MainScreen85.episodeNumFromTitle(title);
            java.util.ArrayList<String> names = MainScreen85.subCandidatesFor(title, ep);
            File dir = dlDir(ctx);
            for (int i = 0; i < names.size() && i < 6; i++) {
                String name = names.get(i);
                File dest = new File(dir, new File(name).getName());
                if (dest.exists() && dest.length() > 0) continue;
                String url = MainScreen85.subFileUrl(name);
                if (url.length() == 0) continue;
                try {
                    HttpURLConnection c = open(url);
                    if (c.getResponseCode() != 200) { c.disconnect(); continue; }
                    InputStream in = new BufferedInputStream(c.getInputStream());
                    FileOutputStream out = new FileOutputStream(dest);
                    byte[] buf = new byte[8192];
                    int n;
                    while ((n = in.read(buf)) != -1) out.write(buf, 0, n);
                    out.close();
                    in.close();
                    c.disconnect();
                } catch (Exception e2) { }
            }
        } catch (Exception e) { }
    }

    private static String fetchManifest() {
        try {
            HttpURLConnection c = open("https://deymflix.eu.cc/subtitles/manifest.json");
            if (c.getResponseCode() != 200) { c.disconnect(); return ""; }
            java.io.BufferedReader br = new java.io.BufferedReader(
                    new java.io.InputStreamReader(c.getInputStream(), "UTF-8"));
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = br.readLine()) != null) sb.append(line);
            br.close();
            c.disconnect();
            return sb.toString();
        } catch (Exception e) {
            return "";
        }
    }

    // Called by the player right before opening a file: if the sidecar .srt
    // is missing, fetch it from the site manifest now (covers movies
    // downloaded before subtitles were wired in).
    public static void ensureSubtitle(Context ctx, String videoPath, String title) {
        try {
            File vid = new File(videoPath);
            String base = vid.getName();
            int dot = base.lastIndexOf('.');
            String stem = dot > 0 ? base.substring(0, dot) : base;
            File sidecar = new File(vid.getParentFile(), stem + ".srt");
            if (sidecar.exists()) return; // already have it
            if (title == null) return;
            if (title.length() == 0) return;
            int ep = MainScreen85.episodeNumFromTitle(title);
            final String subUrl = MainScreen85.findSubUrlForMovie(title, ep);
            if (subUrl == null) return;
            if (subUrl.length() == 0) return;
            HttpURLConnection c = open(subUrl);
            int code = c.getResponseCode();
            if (code != 200) {
                c.disconnect();
                return;
            }
            InputStream in = new BufferedInputStream(c.getInputStream());
            FileOutputStream out = new FileOutputStream(sidecar);
            byte[] buf = new byte[8192];
            int n;
            while ((n = in.read(buf)) != -1) out.write(buf, 0, n);
            out.close();
            in.close();
            c.disconnect();
        } catch (Exception e) { }
    }

    private static HttpURLConnection open(String url) throws Exception {
        HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
        c.setConnectTimeout(12000);
        c.setReadTimeout(20000);
        c.setRequestProperty("User-Agent", "DeymflixApp/1.5");
        c.setRequestProperty("Accept-Encoding", "identity");
        return c;
    }

    private static void sleep(long ms) {
        try { Thread.sleep(ms); } catch (Exception e) { }
    }

    private static SharedPreferences prefs(Context ctx) {
        return ctx.getSharedPreferences("deymflix_dl", 0);
    }

    private static File dlDir(Context ctx) {
        File d = new File(ctx.getExternalFilesDir(Environment.DIRECTORY_MOVIES), "Deymflix");
        d.mkdirs();
        return d;
    }

    public static long freeBytes() {
        try {
            android.os.StatFs stat = new android.os.StatFs(Environment.getExternalStorageDirectory().getPath());
            return stat.getAvailableBlocksLong() * stat.getBlockSizeLong();
        } catch (Exception e) {
            return Long.MAX_VALUE;
        }
    }

    private static String randomToken() {
        String alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
        java.util.Random r = new java.util.Random();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 8; i++) sb.append(alphabet.charAt(r.nextInt(alphabet.length())));
        return sb.toString();
    }

    // row value -> {title, poster, url, subName, path, size}
    // row value -> {title, poster, url, subName, path, size, epName}
    public static String[] readRow(Context ctx, String rowId) {
        String raw = prefs(ctx).getString(rowId, "");
        String title = "";
        String poster = "";
        String url = "";
        String subName = "";
        String path = "";
        String size = "";
        String epName = "";
        if (raw != null && raw.length() > 0) {
            // PATH and SIZE ride at the END (after SUB/NAME) in fixed order
            int cutPath = raw.indexOf(K_PATH);
            if (cutPath >= 0) {
                int cutSize = raw.indexOf(K_SIZE, cutPath);
                if (cutSize >= 0) {
                    size = raw.substring(cutSize + K_SIZE.length());
                    raw = raw.substring(0, cutSize);
                }
                path = raw.substring(cutPath + K_PATH.length());
                raw = raw.substring(0, cutPath);
            }
            int cutName = raw.indexOf(K_NAME);
            if (cutName >= 0) {
                epName = raw.substring(cutName + K_NAME.length());
                raw = raw.substring(0, cutName);
            }
            int cutSub = raw.indexOf("[SUB]");
            if (cutSub >= 0) {
                subName = raw.substring(cutSub + 5);
                raw = raw.substring(0, cutSub);
            }
            int cutPoster = raw.indexOf("[POSTER]");
            if (cutPoster >= 0) {
                poster = raw.substring(cutPoster + 8);
                title = raw.substring(0, cutPoster);
            } else {
                title = raw;
            }
            int cutUrl = title.indexOf("[URL]");
            if (cutUrl >= 0) {
                url = title.substring(cutUrl + 5);
                title = title.substring(0, cutUrl);
            }
        }
        return new String[] { title == null ? "" : title, poster == null ? "" : poster,
                url == null ? "" : url, subName == null ? "" : subName,
                path == null ? "" : path, size == null ? "" : size,
                epName == null ? "" : epName };
    }

    private static void deleteParts(Context ctx, String rowId) {
        try {
            File dir = dlDir(ctx);
            for (int i = 0; i < SEGMENTS; i++) {
                new File(dir, rowId + ".part" + i).delete();
            }
        } catch (Exception e) { }
    }
}
