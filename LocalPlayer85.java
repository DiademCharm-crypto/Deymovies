// ===========================================================================
//  DEYMFLIX -- LocalPlayer85.java     (library class, v1.8 - SITE-TWIN UI)
// ===========================================================================
//  WHAT THIS IS
//    The offline player with the EXACT look and functions of the website's
//    video player (player.html), rebuilt natively on MediaPlayer:
//      - top bar: back chevron + title (hides with the controls)
//      - center controls: circle-arrow -10 / big play-pause circle / +10,
//        drawn from the same SVG path data the site uses
//      - seek badges ("-10" left, "+10" right) on double-tap seek
//      - floating speed badge ("2.0x Speed") on long-press 2x
//      - bottom bar: red seekbar (e50914, buffered track), bottom play icon,
//        HH:MM:SS time display, volume icon, settings, CC, fullscreen icon
//      - settings sheet: playback speed pills + subtitle on/off
//      - left-edge vertical brightness slider, right-edge volume slider
//      - "Buffering..." spinner overlay, controls auto-hide at 2.5s
//      - gestures: tap toggles controls, double-tap edges seek +-10s,
//        vertical swipe adjusts brightness (left) / volume (right),
//        long-press plays at 2x until release
//    The file is opened straight from disk (no WebView anywhere).
//
//  Icons: androidx.core.graphics.PathParser turns the site's own SVG path
//  strings into android.graphics.Path objects, so every glyph is the real
//  site icon, not an approximation.
//
//  100% ASCII, zero pipe characters.
// ===========================================================================
package com.deymflix.eu.cc;

import android.app.Activity;
import android.content.Context;
import android.content.pm.ActivityInfo;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.Typeface;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.os.Handler;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.SurfaceHolder;
import android.view.SurfaceView;
import android.view.View;
import android.view.WindowManager;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.SeekBar;
import android.widget.TextView;
import android.widget.Toast;

import java.io.File;
import java.util.Locale;

public class LocalPlayer85 {

    // ---- the site's own icon path data (viewBox 0 0 24 24) ----------------
    private static final String P_PLAY = "M8 5v14l11-7z";
    private static final String P_PAUSE = "M6 19h4V5H6v14zm8-14v14h4V5h-4z";
    private static final String P_REW = "M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z";
    private static final String P_FWD = "M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z";
    private static final String P_FS = "M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z";
    private static final String P_CC = "M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12zM6 10h2v2H6v-2zm0 4h8v2H6v-2zm10 0h2v2h-2v-2zm-6-4h8v2h-8v-2z";
    private static final String P_GEAR = "M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z";
    private static final String P_VOL = "M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z";
    // speaker with a slash through it (material volume_off)
    private static final String P_MUTE = "M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z";
    private static final String P_SUN = "M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1z";

    private static final int RED = 0xFFE50914;

    // -----------------------------------------------------------------------
    //  ENTRY POINT -- call LocalPlayer85.show(this) from the activity onCreate
    // -----------------------------------------------------------------------
    public static void show(final Activity act) {
        if (act == null) return;

        final String intentPath = act.getIntent().getStringExtra("path");
        // ONLINE MODE: a "url" extra means stream from the site (hybrid
        // player). No "path" needed then.
        final String intentUrl = act.getIntent().getStringExtra("url");
        final String title = act.getIntent().getStringExtra("title");
        final String sub = act.getIntent().getStringExtra("sub");

        final boolean online = intentUrl != null && intentUrl.length() > 0;
        final String path = intentPath == null ? "" : intentPath;
        final File vid = online ? null : new File(path);
        if (!online) {
            if (path.length() == 0) {
                Toast.makeText(act, "No video file to play", Toast.LENGTH_SHORT).show();
                act.finish();
                return;
            }
            if (!vid.exists()) {
                Toast.makeText(act, "File is gone -- delete this row and download again.", Toast.LENGTH_LONG).show();
                act.finish();
                return;
            }
        }
        boolean noTitle = title == null;
        if (!noTitle) noTitle = title.length() == 0;
        String fallbackTitle = online ? "Now playing" : String.valueOf(vid.getName());
        final String cleanTitle = noTitle ? fallbackTitle : title;

        act.setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE);
        act.getWindow().addFlags(WindowManager.LayoutParams.FLAG_SECURE);
        act.getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        if (android.os.Build.VERSION.SDK_INT >= 21) {
            act.getWindow().setStatusBarColor(Color.BLACK);
            act.getWindow().setNavigationBarColor(Color.BLACK);
        }
        act.getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                + View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                + View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                + View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                + View.SYSTEM_UI_FLAG_FULLSCREEN
                + View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
        act.setTitle(cleanTitle);

        final Ui ui = new Ui(act, cleanTitle);
        final Player p = new Player(act, ui, vid, sub, cleanTitle,
                online ? intentUrl : null,
                act.getIntent().getStringExtra("fallback"));
        ui.bind(p);
        act.setContentView(ui.root);
        p.resumePos = readSavedPos(act, p.posKey());
        p.open();
        // background: fetch missing subtitle files (Engsub + PHsub from the
        // site's /subtitles folder -- no OpenSubtitles), then attach
        new Thread(new Runnable() { @Override public void run() {
            try {
                if (online) DlSpeed85.cacheSubsForTitle(act, cleanTitle);
                else DlSpeed85.ensureSubtitle(act, path, cleanTitle);
            } catch (Exception eSub) { }
            ui.handler.post(new Runnable() { @Override public void run() {
                if (!act.isFinishing()) p.applySidecarSub();
            }});
        }}).start();
    }

    private static int readSavedPos(Activity act, String fileName) {
        try {
            return act.getSharedPreferences("deymflix_dl", 0)
                    .getInt("pos_" + fileName, 0);
        } catch (Exception e) {
            return 0;
        }
    }

    private static void savePos(Activity act, String fileName, int msec) {
        try {
            act.getSharedPreferences("deymflix_dl", 0)
                    .edit().putInt("pos_" + fileName, msec).apply();
        } catch (Exception e) { }
    }

    // HH:MM:SS, exactly like the site's time display
    private static String fmt(int msec) {
        if (msec < 0) msec = 0;
        int s = msec / 1000;
        return String.format(Locale.US, "%02d:%02d:%02d",
                Integer.valueOf(s / 3600), Integer.valueOf((s % 3600) / 60),
                Integer.valueOf(s % 60));
    }

    // =======================================================================
    //  IconView -- draws one of the site's SVG icons via PathParser
    //  (pathData strings above are copied verbatim from player.html).
    //  Optional centered label for the "10" inside the seek arrows.
    // =======================================================================
    public static final class IconView extends View {
        private Path icon;
        private final String label;
        private final Paint paint;
        private final Paint textPaint;

        public IconView(Context c, String pathData, String labelText, int color, float dp) {
            super(c);
            Path parsed = null;
            try {
                parsed = androidx.core.graphics.PathParser.createPathFromPathData(pathData);
            } catch (Throwable t) {
                parsed = new Path();
            }
            icon = parsed;
            label = labelText;
            paint = new Paint(Paint.ANTI_ALIAS_FLAG);
            paint.setColor(color);
            paint.setStyle(Paint.Style.FILL);
            textPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
            textPaint.setColor(color);
            textPaint.setTypeface(Typeface.create(Typeface.SANS_SERIF, Typeface.BOLD));
            textPaint.setTextAlign(Paint.Align.CENTER);
            float s = dp * c.getResources().getDisplayMetrics().density;
            textPaint.setTextSize(s * 0.32f);
            setLayoutParams(new LinearLayout.LayoutParams((int) s, (int) s));
        }

        // Swap the drawn path at runtime (mute button toggles its icon).
        public void muteSwap(String pathData) {
            try {
                Path parsed = androidx.core.graphics.PathParser.createPathFromPathData(pathData);
                if (parsed != null) { icon.set(parsed); invalidate(); }
            } catch (Throwable t) { }
        }

        @Override protected void onDraw(Canvas canvas) {
            super.onDraw(canvas);
            int w = getWidth();
            int h = getHeight();
            if (w == 0) return;
            if (h == 0) return;
            float scale = Math.min(w, h) / 24f;
            canvas.save();
            canvas.translate((w - 24f * scale) / 2f, (h - 24f * scale) / 2f);
            canvas.scale(scale, scale);
            canvas.drawPath(icon, paint);
            canvas.restore();
            if (label != null) {
                float baseY = h / 2f - (textPaint.ascent() + textPaint.descent()) / 2f
                        + h * 0.06f;
                canvas.drawText(label, w / 2f, baseY, textPaint);
            }
        }
    }

    // =======================================================================
    //  VSlider -- the site's vertical slider bars (brightness / volume)
    // =======================================================================
    private static final class VSlider extends FrameLayout {
        final View fill;
        final FrameLayout track;
        int pct = 100;

        VSlider(Context c, String pathData, float d, boolean leftSide) {
            super(c);
            float s = d;
            LinearLayout box = new LinearLayout(c);
            box.setOrientation(LinearLayout.VERTICAL);
            box.setGravity(Gravity.CENTER_HORIZONTAL);
            box.setBackgroundColor(0x66000000);
            int pad = (int) (10 * s);
            box.setPadding(pad, pad, pad, pad);
            IconView ic = new IconView(c, pathData, null, Color.WHITE, 18 * (leftSide ? 1f : 1.15f));
            LinearLayout.LayoutParams ip = new LinearLayout.LayoutParams(
                    (int) (18 * s), (int) (18 * s));
            ip.bottomMargin = (int) (8 * s);
            box.addView(ic, ip);
            track = new FrameLayout(c);
            track.setBackgroundColor(0x44FFFFFF);
            track.setLayoutParams(new LinearLayout.LayoutParams(
                    (int) (4 * s), LinearLayout.LayoutParams.MATCH_PARENT));
            fill = new View(c);
            fill.setBackgroundColor(RED);
            FrameLayout.LayoutParams fp = new FrameLayout.LayoutParams(
                    FrameLayout.LayoutParams.MATCH_PARENT, 0, Gravity.BOTTOM);
            track.addView(fill, fp);
            LinearLayout.LayoutParams tp = new LinearLayout.LayoutParams(
                    (int) (4 * s), (int) (140 * s));
            box.addView(track, tp);
            FrameLayout.LayoutParams bp = new FrameLayout.LayoutParams(
                    FrameLayout.LayoutParams.WRAP_CONTENT,
                    FrameLayout.LayoutParams.WRAP_CONTENT,
                    Gravity.CENTER_VERTICAL
                            + (leftSide ? Gravity.START : Gravity.END));
            int m = (int) (14 * s);
            bp.setMargins(leftSide ? m : 0, 0, leftSide ? 0 : m, 0);
            addView(box, bp);
            setVisibility(View.GONE);
        }

        void setPct(int p) {
            pct = p;
            if (pct < 0) pct = 0;
            if (pct > 100) pct = 100;
            FrameLayout.LayoutParams fp =
                    (FrameLayout.LayoutParams) fill.getLayoutParams();
            fp.height = (int) ((float) track.getHeight() * pct / 100f);
            fill.setLayoutParams(fp);
        }
    }

    // =======================================================================
    //  THE NATIVE PLAYER ENGINE (same as v1.7, plus buffering reports)
    // =======================================================================
    private static final class Player implements SurfaceHolder.Callback,
            MediaPlayer.OnPreparedListener, MediaPlayer.OnCompletionListener,
            MediaPlayer.OnErrorListener, MediaPlayer.OnInfoListener,
            MediaPlayer.OnBufferingUpdateListener, SeekBar.OnSeekBarChangeListener {

        final Activity act;
        final Ui ui;
        final File file;        // null in online mode
        final String subName;
        final String streamUrl; // set in online mode, null offline
        final String fallbackUrl; // offline file to swap to if streaming fails
        MediaPlayer mp;
        boolean prepared = false;
        boolean userSeeking = false;
        int resumePos = 0;
        float speed = 1.0f;
        int lastSaveTick = 0;
        boolean subsOn = true;
        int subLang = 1;        // 0 = off, 1 = English (Engsub), 2 = Tagalog (PHsub)
        final String title85;
        boolean subApplied = false;

        Player(Activity a, Ui u, File f, String sub, String t, String url, String fallback) {
            act = a;
            ui = u;
            file = f;
            subName = sub == null ? "" : sub;
            title85 = t == null ? "" : t;
            streamUrl = url == null ? "" : url;
            fallbackUrl = fallback == null ? "" : fallback;
        }

        // resume-position key: file name offline, title online
        String posKey() {
            if (file != null) return file.getName();
            if (title85.length() > 0) return title85.toLowerCase(Locale.US).replaceAll("\\s+", "_");
            return "online_" + String.valueOf(streamUrl.hashCode());
        }

        void open() {
            ui.buffering.setVisibility(View.VISIBLE);
            SurfaceHolder h = ui.surface.getHolder();
            h.addCallback(this);
            if (h.getSurface() != null && h.getSurface().isValid()) startPlayer();
        }

        void startPlayer() {
            stopPlayer();
            mp = new MediaPlayer();
            mp.setAudioStreamType(AudioManager.STREAM_MUSIC);
            try {
                if (streamUrl.length() > 0) mp.setDataSource(streamUrl);
                else mp.setDataSource(file.getAbsolutePath());
                mp.setDisplay(ui.surface.getHolder());
                mp.setOnPreparedListener(this);
                mp.setOnCompletionListener(this);
                mp.setOnErrorListener(this);
                mp.setOnInfoListener(this);
                mp.setOnBufferingUpdateListener(this);
                mp.prepareAsync();
            } catch (Exception e) {
                fail("Cannot open this file");
            }
        }

        void stopPlayer() {
            if (mp != null) {
                try { mp.stop(); } catch (Exception e) { }
                try { mp.release(); } catch (Exception e) { }
                mp = null;
            }
            prepared = false;
        }

        @Override public void surfaceCreated(SurfaceHolder holder) {
            if (mp == null) startPlayer();
        }

        @Override public void surfaceChanged(SurfaceHolder holder, int f, int w, int h) { }

        @Override public void surfaceDestroyed(SurfaceHolder holder) {
            saveNow();
            stopPlayer();
        }

        @Override public void onPrepared(MediaPlayer m) {
            prepared = true;
            ui.buffering.setVisibility(View.GONE);
            ui.bar.setMax(m.getDuration());
            try {
                int vw = m.getVideoWidth();
                int vh = m.getVideoHeight();
                if (vw > 0 && vh > 0) {
                    final int fvw = vw;
                    final int fvh = vh;
                    ui.handler.postDelayed(new Runnable() {
                        @Override public void run() { ui.fitVideo(fvw, fvh); }
                    }, 60);
                }
            } catch (Exception e) { }
            m.setOnTimedTextListener(new MediaPlayer.OnTimedTextListener() {
                @Override public void onTimedText(MediaPlayer t, android.media.TimedText tt) {
                    String txt = "";
                    if (tt != null) {
                        try { txt = tt.getText(); } catch (Exception e) { txt = ""; }
                    }
                    if (txt == null) txt = "";
                    boolean blank = txt.length() == 0;
                    if (!subsOn) blank = true;
                    ui.subtitle.setText(txt);
                    ui.subtitle.setVisibility(blank ? View.GONE : View.VISIBLE);
                }
            });
            applySidecarSub();
            if (resumePos > 0 && resumePos < m.getDuration() - 5000) {
                m.seekTo(resumePos);
                ui.toast("Resumed");
            }
            m.start();
            ui.syncPlay(true);
            tick.run();
        }

        // 0 = off, 1 = English, 2 = Tagalog. Re-loads the matching sidecar.
        void setSubLang(int lang) {
            subLang = lang;
            subsOn = lang != 0;
            if (lang == 0) {
                ui.subtitle.setVisibility(View.GONE);
                ui.refreshSubLabel(this);
                ui.toast("Subtitles off");
                return;
            }
            subApplied = false;      // force re-pick with the new language
            applySidecarSub();
            ui.refreshSubLabel(this);
            ui.toast(lang == 1 ? "English subtitles" : "Tagalog subtitles");
        }

        private void applySidecarSub() {
            if (mp == null) return;
            if (subApplied) return;
            if (android.os.Build.VERSION.SDK_INT < 16) return;
            // which sidecar file matches the chosen language?
            File want = pickSubFile();
            if (want == null) {
                if (subLang != 0) ui.toast("No subtitle file for this title yet");
                return;
            }
            try {
                java.io.FileInputStream fis = new java.io.FileInputStream(want);
                try {
                    mp.addTimedTextSource(fis.getFD(), MediaPlayer.MEDIA_MIMETYPE_TEXT_SUBRIP);
                    int track = selectSrtTrack();
                    if (track >= 0) {
                        mp.selectTrack(track);
                        subApplied = true;
                    }
                } finally {
                    try { fis.close(); } catch (Exception e) { }
                }
            } catch (Exception e) { }
        }

        // Chooses the sidecar .srt for the chosen language: Engsub first,
        // then PHsub, then the plain-name file. Null when none exists.
        private File pickSubFile() {
            if (file == null) return onlineSubFile();
            File dir = file.getParentFile();
            String base = file.getName();
            int dot = base.lastIndexOf('.');
            String stem = dot > 0 ? base.substring(0, dot) : base;
            File plain = new File(dir, stem + ".srt");
            File named = subName.length() > 0 ? new File(dir, subName) : null;
            File[] all = dir.listFiles();
            File eng = null;
            File ph = null;
            if (all != null) {
                for (int i = 0; i < all.length; i++) {
                    String n = all[i].getName().toLowerCase(Locale.US);
                    if (!n.endsWith(".srt")) continue;
                    boolean isEng = n.indexOf("engsub") != -1;
                    if (!isEng) isEng = n.indexOf(".en.") != -1;
                    if (!isEng) isEng = n.endsWith("-en.srt");
                    if (isEng) eng = all[i];
                    boolean isPh = n.indexOf("phsub") != -1;
                    if (!isPh) isPh = n.indexOf("tagalog") != -1;
                    if (isPh) ph = all[i];
                }
            }
            if (subLang == 2) {
                if (ph != null) return ph;
                return eng != null ? eng : (named != null && named.exists() ? named : plain.exists() ? plain : null);
            }
            if (eng != null) return eng;
            if (ph != null) return ph;
            if (named != null && named.exists()) return named;
            return plain.exists() ? plain : null;
        }

        // ONLINE mode: subtitle sidecars live in the same cache folder the
        // engine uses; cacheSubsForTitle() downloads Engsub + PHsub there.
        private File onlineSubFile() {
            try {
                File dir = DlSpeed85.subCacheDir(ui.act);
                File[] all = dir.listFiles();
                if (all == null) return null;
                String want = title85 == null ? "" : title85.toLowerCase(Locale.US);
                int ep = MainScreen85.episodeNumFromTitle(want);
                String series = ep > 0
                        ? want.replaceAll("\\bep?\\.?\\s*\\d{1,2}\\b", " ").replaceAll("\\s+", " ").trim()
                        : want;
                File eng = null;
                File ph = null;
                for (int i = 0; i < all.length; i++) {
                    String n = all[i].getName().toLowerCase(Locale.US);
                    if (!n.endsWith(".srt")) continue;
                    boolean mine = n.indexOf(want) != -1;
                    if (!mine && ep > 0) {
                        boolean inSeries = n.indexOf(series) != -1;
                        java.util.regex.Matcher mN = java.util.regex.Pattern
                                .compile("\\bep?\\.?\\s*(\\d{1,2})\\b").matcher(n);
                        int fEp = 0;
                        if (mN.find()) { try { fEp = Integer.parseInt(mN.group(1)); } catch (Exception e2) { fEp = 0; } }
                        mine = inSeries && fEp == ep;
                    }
                    if (!mine) continue;
                    boolean isEng = n.indexOf("engsub") != -1;
                    if (!isEng) isEng = n.indexOf(".en.") != -1;
                    if (!isEng) isEng = n.endsWith("-en.srt");
                    boolean isPh = n.indexOf("phsub") != -1;
                    if (!isPh) isPh = n.indexOf("tagalog") != -1;
                    if (isEng && eng == null) eng = all[i];
                    if (isPh && ph == null) ph = all[i];
                }
                if (subLang == 2) {
                    if (ph != null) return ph;
                    return eng;
                }
                if (eng != null) return eng;
                return ph;
            } catch (Exception e) {
                return null;
            }
        }

        // (kept for reference -- replaced by the language-aware loader)
        private void legacyApplySidecarSub() {
            if (mp == null) return;
            if (android.os.Build.VERSION.SDK_INT < 16) return;
            try {
                File dir = file.getParentFile();
                String base = file.getName();
                int dot = base.lastIndexOf('.');
                String stem = dot > 0 ? base.substring(0, dot) : base;
                File[] candidates = new File[] {
                        new File(dir, subName),
                        new File(dir, stem + ".srt"),
                };
                for (int i = 0; i < candidates.length; i++) {
                    File s = candidates[i];
                    if (s.exists() && s.length() > 0) {
                        java.io.FileInputStream fis = new java.io.FileInputStream(s);
                        try {
                            mp.addTimedTextSource(fis.getFD(), MediaPlayer.MEDIA_MIMETYPE_TEXT_SUBRIP);
                            int track = selectSrtTrack();
                            if (track >= 0) mp.selectTrack(track);
                        } finally {
                            try { fis.close(); } catch (Exception e) { }
                        }
                        return;
                    }
                }
            } catch (Exception e) { }
        }

        private int selectSrtTrack() {
            if (mp == null) return -1;
            try {
                android.media.MediaPlayer.TrackInfo[] t = mp.getTrackInfo();
                for (int i = 0; i < t.length; i++) {
                    if (t[i].getTrackType() == MediaPlayer.TrackInfo.MEDIA_TRACK_TYPE_TIMEDTEXT) return i;
                }
            } catch (Exception e) { }
            return -1;
        }

        @Override public void onCompletion(MediaPlayer m) {
            ui.syncPlay(false);
            savePos(act, posKey(), 0);
        }

        @Override public boolean onError(MediaPlayer m, int what, int extra) {
            // online stream failed (dead link, codec, network): swap to the
            // downloaded copy when one exists, otherwise report and close
            if (streamUrl.length() > 0 && fallbackUrl.length() > 0) {
                ui.buffering.setVisibility(View.GONE);
                ui.toast("Stream failed -- playing downloaded copy");
                try {
                    stopPlayer();
                    File f = new File(fallbackUrl);
                    if (f.exists()) {
                        Player swap = new Player(act, ui, f, subName, title85, null, null);
                        swap.resumePos = m == null ? 0 : m.getCurrentPosition();
                        // take over this Player's identity in the Ui
                        ui.reattach(swap);
                        swap.resumePos = readSavedPos(act, swap.posKey());
                        swap.open();
                        return true;
                    }
                } catch (Exception e) { }
            }
            fail("Cannot play this file (code " + String.valueOf(what) + ")");
            return true;
        }

        @Override public boolean onInfo(MediaPlayer m, int what, int extra) {
            if (what == MediaPlayer.MEDIA_INFO_BUFFERING_START) {
                ui.buffering.setVisibility(View.VISIBLE);
            } else if (what == MediaPlayer.MEDIA_INFO_BUFFERING_END) {
                ui.buffering.setVisibility(View.GONE);
            }
            return true;
        }

        @Override public void onBufferingUpdate(MediaPlayer m, int pct) {
            if (m.getDuration() > 0) {
                ui.bar.setSecondaryProgress(m.getDuration() * pct / 100);
            }
        }

        final Runnable tick = new Runnable() {
            @Override public void run() {
                if (mp == null) return;
                if (act.isFinishing()) return;
                try {
                    if (prepared && !userSeeking) {
                        int cur = mp.getCurrentPosition();
                        ui.bar.setProgress(cur);
                        ui.time.setText(fmt(cur) + " / " + fmt(mp.getDuration()));
                        if (cur / 5000 != lastSaveTick) {
                            lastSaveTick = cur / 5000;
                            savePos(act, posKey(), cur);
                        }
                    }
                } catch (Exception e) { }
                ui.handler.postDelayed(this, 1000);
            }
        };

        private void saveNow() {
            try {
                if (mp != null && prepared) savePos(act, posKey(), mp.getCurrentPosition());
            } catch (Exception e) { }
        }

        private void fail(String msg) {
            ui.buffering.setVisibility(View.GONE);
            Toast.makeText(act, msg, Toast.LENGTH_LONG).show();
            act.finish();
        }

        boolean playing() {
            try { return mp != null && prepared && mp.isPlaying(); }
            catch (Exception e) { return false; }
        }

        void togglePlay() {
            if (mp == null) return;
            if (!prepared) return;
            try {
                if (mp.isPlaying()) {
                    mp.pause();
                    ui.syncPlay(false);
                } else {
                    mp.start();
                    ui.syncPlay(true);
                }
                ui.showBars();
            } catch (Exception e) { }
        }

        void seekBy(int delta) {
            if (mp == null) return;
            if (!prepared) return;
            try {
                int d = mp.getCurrentPosition() + delta;
                if (d < 0) d = 0;
                if (d > mp.getDuration()) d = mp.getDuration();
                mp.seekTo(d);
                ui.showBars();
            } catch (Exception e) { }
        }

        void setSpeed(float f) {
            if (android.os.Build.VERSION.SDK_INT < 23) {
                ui.toast("Speed needs Android 6+");
                return;
            }
            if (mp == null) return;
            try {
                mp.setPlaybackParams(mp.getPlaybackParams().setSpeed(f));
                speed = f;
                ui.speedBadge.setText(String.valueOf(f) + "x Speed");
                ui.syncPlay(playing());
            } catch (Exception e) { }
        }

        @Override public void onProgressChanged(SeekBar sb, int progress, boolean fromUser) {
            if (fromUser && prepared && mp != null) {
                ui.time.setText(fmt(progress) + " / " + fmt(mp.getDuration()));
            }
        }

        @Override public void onStartTrackingTouch(SeekBar sb) {
            userSeeking = true;
        }

        @Override public void onStopTrackingTouch(SeekBar sb) {
            userSeeking = false;
            if (mp != null && prepared) mp.seekTo(sb.getProgress());
            ui.showBars();
        }
    }

    // =======================================================================
    //  THE UI -- site player layout, built in code
    // =======================================================================
    private static final class Ui {
        final Activity act;
        final float d;
        final Handler handler;
        FrameLayout root;
        FrameLayout stage;
        SurfaceView surface;
        TextView subtitle;
        LinearLayout topBar;
        TextView backBtn;
        TextView titleTxt;
        LinearLayout center;
        FrameLayout playWrap;
        IconView playIcon;
        IconView rewIcon;
        IconView fwdIcon;
        LinearLayout bottomBar;
        SeekBar bar;
        IconView bottomPlay;
        TextView time;
        IconView volBtn;          // mute / unmute (sits right beside the timestamp)
        IconView gearBtn;
        boolean muted = false;
        int preMuteVol = 0;
        TextView rewBadge;
        TextView fwdBadge;
        TextView speedBadge;
        VSlider brightness;
        VSlider volume;
        LinearLayout buffering;
        LinearLayout settings;
        TextView epBtn;           // top-right Episodes button (series only)
        LinearLayout epPanel;     // slide-in episode list panel
        LinearLayout epPanelHost; // panel row host
        java.util.ArrayList<DlSpeed85.OfflineEpisode> episodes;
        int curEp = 0;
        LinearLayout speedRow;
        LinearLayout subRow;      // clickable language row (Engsub / PHsub / Off)
        TextView subToggle;
        TextView subChoice;       // current selection text on the right
        TextView subOffOpt;
        TextView subEngOpt;
        TextView subPhOpt;
        LinearLayout subLangBox;  // hidden language option list
        boolean bars = true;
        boolean fitMode = true;

        Ui(Activity a, String movieTitle) {
            act = a;
            d = a.getResources().getDisplayMetrics().density;
            handler = new Handler();

            root = new FrameLayout(a);
            root.setBackgroundColor(Color.BLACK);

            stage = new FrameLayout(a);
            root.addView(stage, new FrameLayout.LayoutParams(
                    FrameLayout.LayoutParams.MATCH_PARENT,
                    FrameLayout.LayoutParams.MATCH_PARENT,
                    Gravity.CENTER));

            surface = new SurfaceView(a);
            stage.addView(surface, new FrameLayout.LayoutParams(
                    FrameLayout.LayoutParams.MATCH_PARENT,
                    FrameLayout.LayoutParams.MATCH_PARENT,
                    Gravity.CENTER));

            // -- subtitle line (site style: bottom center, above the bar) --
            subtitle = new TextView(a);
            subtitle.setTextColor(Color.WHITE);
            subtitle.setTextSize(16);
            subtitle.setGravity(Gravity.CENTER);
            subtitle.setShadowLayer(6f, 0f, 2f, Color.BLACK);
            subtitle.setVisibility(View.GONE);
            FrameLayout.LayoutParams subLp = new FrameLayout.LayoutParams(
                    FrameLayout.LayoutParams.MATCH_PARENT,
                    FrameLayout.LayoutParams.WRAP_CONTENT,
                    Gravity.BOTTOM + Gravity.CENTER_HORIZONTAL);
            subLp.bottomMargin = (int) (58 * d);
            root.addView(subtitle, subLp);

            // -- buffering spinner overlay (site: ring + "Buffering...") --
            buffering = new LinearLayout(a);
            buffering.setOrientation(LinearLayout.VERTICAL);
            buffering.setGravity(Gravity.CENTER);
            buffering.setBackgroundColor(0x55000000);
            ProgressBar ring = new ProgressBar(a);
            ring.setIndeterminate(true);
            LinearLayout.LayoutParams rp = new LinearLayout.LayoutParams(
                    (int) (46 * d), (int) (46 * d));
            buffering.addView(ring, rp);
            TextView bt = new TextView(a);
            bt.setText("Buffering...");
            bt.setTextColor(Color.WHITE);
            bt.setTextSize(14);
            bt.setPadding(0, (int) (10 * d), 0, 0);
            buffering.addView(bt, new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.WRAP_CONTENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT));
            root.addView(buffering, new FrameLayout.LayoutParams(
                    FrameLayout.LayoutParams.MATCH_PARENT,
                    FrameLayout.LayoutParams.MATCH_PARENT,
                    Gravity.CENTER));
            buffering.setVisibility(View.GONE);

            // -- top bar: back chevron + title -----------------------------
            topBar = new LinearLayout(a);
            topBar.setOrientation(LinearLayout.HORIZONTAL);
            topBar.setGravity(Gravity.CENTER_VERTICAL);
            topBar.setBackgroundColor(0x66000000);
            topBar.setPadding((int) (12 * d), (int) (8 * d), (int) (14 * d), (int) (8 * d));
            backBtn = new TextView(a);
            backBtn.setText("<");
            backBtn.setTextColor(Color.WHITE);
            backBtn.setTextSize(20);
            backBtn.setTypeface(Typeface.DEFAULT_BOLD);
            backBtn.setPadding((int) (8 * d), 0, (int) (16 * d), 0);
            topBar.addView(backBtn, new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.WRAP_CONTENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT));
            titleTxt = new TextView(a);
            titleTxt.setText(movieTitle);
            titleTxt.setTextColor(Color.WHITE);
            titleTxt.setTextSize(15);
            titleTxt.setTypeface(Typeface.DEFAULT_BOLD);
            titleTxt.setSingleLine(true);
            titleTxt.setEllipsize(android.text.TextUtils.TruncateAt.END);
            topBar.addView(titleTxt, new LinearLayout.LayoutParams(
                    0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f));
            // EPISODES button (top right, like the site's panel): only
            // visible when episodes of this series are downloaded.
            epBtn = new TextView(a);
            epBtn.setText("Episodes");
            epBtn.setTextColor(Color.WHITE);
            epBtn.setTextSize(14);
            epBtn.setTypeface(Typeface.DEFAULT_BOLD);
            android.graphics.drawable.GradientDrawable epBg = new android.graphics.drawable.GradientDrawable();
            epBg.setColor(0x33FFFFFF);
            epBg.setCornerRadius(14 * d);
            epBtn.setBackgroundDrawable(epBg);
            epBtn.setPadding((int) (12 * d), (int) (6 * d), (int) (12 * d), (int) (6 * d));
            epBtn.setVisibility(View.GONE);
            topBar.addView(epBtn, new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.WRAP_CONTENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT));
            root.addView(topBar, new FrameLayout.LayoutParams(
                    FrameLayout.LayoutParams.MATCH_PARENT,
                    FrameLayout.LayoutParams.WRAP_CONTENT,
                    Gravity.TOP));

            // -- EPISODES PANEL: slides in from the right edge, same look
            //    as the site's List panel (dark translucent, episode rows,
            //    current one highlighted, close button).
            epPanel = new LinearLayout(a);
            epPanel.setOrientation(LinearLayout.VERTICAL);
            epPanel.setBackgroundColor(0xD90A0A0C);
            epPanel.setPadding((int) (16 * d), (int) (18 * d), (int) (16 * d), (int) (18 * d));
            LinearLayout epHead = new LinearLayout(a);
            epHead.setOrientation(LinearLayout.HORIZONTAL);
            epHead.setGravity(Gravity.CENTER_VERTICAL);
            TextView epTitle = new TextView(a);
            epTitle.setText("Episodes");
            epTitle.setTextColor(Color.WHITE);
            epTitle.setTextSize(18);
            epTitle.setTypeface(Typeface.DEFAULT_BOLD);
            epHead.addView(epTitle, new LinearLayout.LayoutParams(0, -2, 1f));
            TextView epClose = new TextView(a);
            epClose.setText("X");
            epClose.setTextColor(Color.WHITE);
            epClose.setTextSize(16);
            epClose.setTypeface(Typeface.DEFAULT_BOLD);
            epClose.setPadding((int) (10 * d), 0, (int) (2 * d), 0);
            epClose.setOnClickListener(new View.OnClickListener() {
                @Override public void onClick(View v) { showEpisodes(false); }
            });
            epHead.addView(epClose, new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.WRAP_CONTENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT));
            epPanel.addView(epHead, new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT));
            epPanelHost = new LinearLayout(a);
            epPanelHost.setOrientation(LinearLayout.VERTICAL);
            android.widget.ScrollView epSc = new android.widget.ScrollView(a);
            epSc.addView(epPanelHost, new android.view.ViewGroup.LayoutParams(
                    android.view.ViewGroup.LayoutParams.MATCH_PARENT,
                    android.view.ViewGroup.LayoutParams.WRAP_CONTENT));
            epPanel.addView(epSc, new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT, 1f));
            FrameLayout.LayoutParams epp = new FrameLayout.LayoutParams(
                    (int) (300 * d), FrameLayout.LayoutParams.MATCH_PARENT,
                    Gravity.TOP + Gravity.END);
            epp.rightMargin = -(int) (320 * d); // parked off-screen
            root.addView(epPanel, epp);

            // -- center controls: -10 / play-pause circle / +10 ------------
            center = new LinearLayout(a);
            center.setOrientation(LinearLayout.HORIZONTAL);
            center.setGravity(Gravity.CENTER);
            IconView rew = new IconView(a, P_REW, null, Color.WHITE, 46 * d);
            rewIcon = rew;
            LinearLayout.LayoutParams rl = new LinearLayout.LayoutParams(
                    (int) (46 * d), (int) (46 * d));
            rl.rightMargin = (int) (26 * d);
            center.addView(rew, rl);

            playWrap = new FrameLayout(a);
            android.graphics.drawable.GradientDrawable circle =
                    new android.graphics.drawable.GradientDrawable();
            circle.setShape(android.graphics.drawable.GradientDrawable.OVAL);
            circle.setColor(0x80000000);
            playWrap.setBackgroundDrawable(circle);
            playIcon = new IconView(a, P_PAUSE, null, Color.WHITE, 34 * d);
            playWrap.addView(playIcon, new FrameLayout.LayoutParams(
                    (int) (34 * d), (int) (34 * d), Gravity.CENTER));
            center.addView(playWrap, new FrameLayout.LayoutParams(
                    (int) (64 * d), (int) (64 * d), Gravity.CENTER));

            IconView fwd = new IconView(a, P_FWD, null, Color.WHITE, 46 * d);
            fwdIcon = fwd;
            LinearLayout.LayoutParams fl = new LinearLayout.LayoutParams(
                    (int) (46 * d), (int) (46 * d));
            fl.leftMargin = (int) (26 * d);
            center.addView(fwd, fl);

            FrameLayout.LayoutParams centerLp = new FrameLayout.LayoutParams(
                    FrameLayout.LayoutParams.WRAP_CONTENT,
                    FrameLayout.LayoutParams.WRAP_CONTENT,
                    Gravity.CENTER);
            root.addView(center, centerLp);

            // -- seek badges ------------------------------------------------
            rewBadge = pill(a, "-10");
            FrameLayout.LayoutParams rb = new FrameLayout.LayoutParams(
                    FrameLayout.LayoutParams.WRAP_CONTENT,
                    FrameLayout.LayoutParams.WRAP_CONTENT,
                    Gravity.CENTER_VERTICAL);
            rb.leftMargin = (int) (60 * d);
            root.addView(rewBadge, rb);
            fwdBadge = pill(a, "+10");
            FrameLayout.LayoutParams fb = new FrameLayout.LayoutParams(
                    FrameLayout.LayoutParams.WRAP_CONTENT,
                    FrameLayout.LayoutParams.WRAP_CONTENT,
                    Gravity.CENTER_VERTICAL + Gravity.END);
            fb.rightMargin = (int) (60 * d);
            root.addView(fwdBadge, fb);

            // -- floating speed badge --------------------------------------
            speedBadge = pill(a, "1.0x Speed");
            FrameLayout.LayoutParams sb = new FrameLayout.LayoutParams(
                    FrameLayout.LayoutParams.WRAP_CONTENT,
                    FrameLayout.LayoutParams.WRAP_CONTENT,
                    Gravity.CENTER_HORIZONTAL + Gravity.TOP);
            sb.topMargin = (int) (70 * d);
            root.addView(speedBadge, sb);

            // -- edge sliders -----------------------------------------------
            brightness = new VSlider(a, P_SUN, d, true);
            root.addView(brightness);
            volume = new VSlider(a, P_VOL, d, false);
            root.addView(volume);

            // -- bottom bar ---------------------------------------------------
            bottomBar = new LinearLayout(a);
            bottomBar.setOrientation(LinearLayout.VERTICAL);
            bottomBar.setBackgroundColor(0x66000000);
            bottomBar.setPadding((int) (12 * d), (int) (4 * d), (int) (12 * d), (int) (8 * d));

            bar = new SeekBar(a);
            bar.setMax(1000);
            bar.setProgress(0);
            bar.setSecondaryProgress(0);
            bar.setProgressTintList(android.content.res.ColorStateList.valueOf(RED));
            bar.setProgressBackgroundTintList(
                    android.content.res.ColorStateList.valueOf(0x55FFFFFF));
            bar.setSecondaryProgressTintList(
                    android.content.res.ColorStateList.valueOf(0x88E50914));
            bar.setThumbTintList(android.content.res.ColorStateList.valueOf(Color.WHITE));
            bottomBar.addView(bar, new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT));

            LinearLayout row = new LinearLayout(a);
            row.setOrientation(LinearLayout.HORIZONTAL);
            row.setGravity(Gravity.CENTER_VERTICAL);

            bottomPlay = new IconView(a, P_PAUSE, null, Color.WHITE, 22 * d);
            row.addView(bottomPlay, new LinearLayout.LayoutParams(
                    (int) (24 * d), (int) (24 * d)));

            time = new TextView(a);
            time.setText("00:00:00 / 00:00:00");
            time.setTextColor(Color.WHITE);
            time.setTextSize(13);
            time.setTypeface(Typeface.DEFAULT_BOLD);
            time.setPadding((int) (10 * d), 0, 0, 0);
            row.addView(time, new LinearLayout.LayoutParams(
                    0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f));

            // mute/unmute button: LEFT side of the icon group, directly
            // beside the timestamp (user request). Tapping toggles mute.
            volBtn = new IconView(a, P_VOL, null, Color.WHITE, 20 * d);
            row.addView(volBtn, new LinearLayout.LayoutParams(
                    (int) (24 * d), (int) (24 * d)));
            LinearLayout.LayoutParams vgap = (LinearLayout.LayoutParams)
                    volBtn.getLayoutParams();
            vgap.rightMargin = (int) (12 * d);
            volBtn.setLayoutParams(vgap);

            gearBtn = new IconView(a, P_GEAR, null, Color.WHITE, 20 * d);
            row.addView(gearBtn, new LinearLayout.LayoutParams(
                    (int) (24 * d), (int) (24 * d)));
            LinearLayout.LayoutParams ggap = (LinearLayout.LayoutParams)
                    gearBtn.getLayoutParams();
            ggap.rightMargin = (int) (12 * d);
            gearBtn.setLayoutParams(ggap);

            // (no fullscreen button here: the offline player IS fullscreen
            // already -- the old icon was really a fit/fill toggle and is
            // removed per user request. The video view still honors
            // fitVideo() with the default FIT sizing.)

            bottomBar.addView(row, new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT));
            root.addView(bottomBar, new FrameLayout.LayoutParams(
                    FrameLayout.LayoutParams.MATCH_PARENT,
                    FrameLayout.LayoutParams.WRAP_CONTENT,
                    Gravity.BOTTOM));

            // -- settings sheet (site: speed + subtitles) --------------------
            settings = new LinearLayout(a);
            settings.setOrientation(LinearLayout.VERTICAL);
            android.graphics.drawable.GradientDrawable sheet =
                    new android.graphics.drawable.GradientDrawable();
            sheet.setColor(0xEE141418);
            float rad = 16 * d;
            sheet.setCornerRadii(new float[] { rad, rad, rad, rad, 0f, 0f, 0f, 0f });
            settings.setBackgroundDrawable(sheet);
            settings.setPadding((int) (16 * d), (int) (14 * d), (int) (16 * d), (int) (18 * d));

            LinearLayout shRow = new LinearLayout(a);
            shRow.setOrientation(LinearLayout.HORIZONTAL);
            shRow.setGravity(Gravity.CENTER_VERTICAL);
            TextView sh = new TextView(a);
            sh.setText("Settings");
            sh.setTextColor(Color.WHITE);
            sh.setTextSize(15);
            sh.setTypeface(Typeface.DEFAULT_BOLD);
            shRow.addView(sh, new LinearLayout.LayoutParams(
                    0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f));
            TextView closeBtn = new TextView(a);
            closeBtn.setText("X");
            closeBtn.setTextColor(Color.WHITE);
            closeBtn.setTextSize(16);
            closeBtn.setTypeface(Typeface.DEFAULT_BOLD);
            closeBtn.setPadding((int) (12 * d), (int) (4 * d), (int) (4 * d), (int) (4 * d));
            closeBtn.setOnClickListener(new View.OnClickListener() {
                @Override public void onClick(View v) { closeSettings(); }
            });
            shRow.addView(closeBtn, new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.WRAP_CONTENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT));
            settings.addView(shRow, new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT));

            TextView sp = new TextView(a);
            sp.setText("Playback speed");
            sp.setTextColor(0xFF9A9A9A);
            sp.setTextSize(12);
            sp.setPadding(0, (int) (10 * d), 0, (int) (6 * d));
            settings.addView(sp, new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.WRAP_CONTENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT));

            speedRow = new LinearLayout(a);
            speedRow.setOrientation(LinearLayout.HORIZONTAL);
            speedRow.setGravity(Gravity.CENTER_VERTICAL);
            settings.addView(speedRow, new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.WRAP_CONTENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT));

            subToggle = new TextView(a);
            subToggle.setText("Subtitles");
            subToggle.setTextColor(Color.WHITE);
            subToggle.setTextSize(14);
            subToggle.setPadding(0, (int) (14 * d), 0, 0);
            subRow = new LinearLayout(a);
            subRow.setOrientation(LinearLayout.HORIZONTAL);
            subRow.setGravity(Gravity.CENTER_VERTICAL);
            subRow.setPadding(0, (int) (12 * d), 0, 0);
            subRow.addView(subToggle, new LinearLayout.LayoutParams(
                    0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f));
            subChoice = new TextView(a);
            subChoice.setText("Off");
            subChoice.setTextColor(0xFF9A9A9A);
            subChoice.setTextSize(13);
            subRow.addView(subChoice, new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.WRAP_CONTENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT));
            settings.addView(subRow, new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT));

            // language options: revealed when the Subtitles row is tapped
            subLangBox = new LinearLayout(a);
            subLangBox.setOrientation(LinearLayout.VERTICAL);
            subOffOpt = subLangOption(a, "Off");
            subEngOpt = subLangOption(a, "English (Engsub)");
            subPhOpt = subLangOption(a, "Tagalog (PHsub)");
            subLangBox.addView(subOffOpt);
            subLangBox.addView(subEngOpt);
            subLangBox.addView(subPhOpt);
            subLangBox.setVisibility(View.GONE);
            settings.addView(subLangBox, new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT));

            // compact panel anchored bottom-right (like the site's settings
            // popover) -- not a full-width sheet
            int panelW = (int) (260 * d);
            FrameLayout.LayoutParams setLp = new FrameLayout.LayoutParams(
                    panelW,
                    FrameLayout.LayoutParams.WRAP_CONTENT,
                    Gravity.BOTTOM + Gravity.END);
            int mg = (int) (14 * d);
            setLp.rightMargin = mg;
            setLp.bottomMargin = (int) (56 * d);
            settings.setVisibility(View.GONE);
            root.addView(settings, setLp);
        }

        private TextView pill(Context c, String text) {
            TextView t = new TextView(c);
            t.setText(text);
            t.setTextColor(Color.WHITE);
            t.setTextSize(13);
            t.setTypeface(Typeface.DEFAULT_BOLD);
            android.graphics.drawable.GradientDrawable bg =
                    new android.graphics.drawable.GradientDrawable();
            bg.setColor(0xB3000000);
            bg.setCornerRadius(20 * d);
            t.setBackgroundDrawable(bg);
            t.setPadding((int) (14 * d), (int) (6 * d), (int) (14 * d), (int) (6 * d));
            t.setVisibility(View.GONE);
            return t;
        }

        private TextView subLangOption(Context c, String text) {
            TextView t = new TextView(c);
            t.setText(text);
            t.setTextColor(0xFFCCCCCC);
            t.setTextSize(13);
            t.setPadding((int) (16 * d), (int) (8 * d), (int) (8 * d), (int) (8 * d));
            return t;
        }

        // after a stream-to-file fallback swap, the replacement Player's
        // callbacks all reach this Ui anyway -- nothing to rebind
        void reattach(final Player p) { }

        // ===== EPISODES PANEL ============================================
        // Filled from the download registry (finished episodes of this
        // series). Hidden entirely for standalone movies.
        void setupEpisodes(final Player p) {
            try {
                String ser = DlSpeed85.seriesOfTitle(p.title85);
                if (ser == null) ser = DlSpeed85.seriesOfTitle(seriesBaseName(p.title85));
                if (ser == null) return; // a plain movie: no list to show
                episodes = DlSpeed85.offlineEpisodesFor(act, ser);
                if (episodes == null) return;
                if (episodes.size() < 2) return; // one file is not a series
                epBtn.setVisibility(View.VISIBLE);
                epBtn.setOnClickListener(new View.OnClickListener() {
                    @Override public void onClick(View v) {
                        // hidden = parked at translationX 0 -> open; else close
                        showEpisodes(epPanel.getTranslationX() == 0);
                    }
                });
                curEp = DlSpeed85.episodeNumOfTitle(p.title85);
                if (curEp == 0) curEp = 1;
                buildEpRows(p);
            } catch (Exception e) { }
        }

        void buildEpRows(final Player p) {
            if (epPanelHost == null) return;
            epPanelHost.removeAllViews();
            if (episodes == null) return;
            for (int i = 0; i < episodes.size(); i++) {
                final DlSpeed85.OfflineEpisode oe = episodes.get(i);
                LinearLayout row = new LinearLayout(act);
                row.setOrientation(LinearLayout.VERTICAL);
                row.setClickable(true);
                row.setFocusable(true);
                android.graphics.drawable.GradientDrawable rb = new android.graphics.drawable.GradientDrawable();
                rb.setCornerRadius(10 * d);
                rb.setColor(oe.ep == curEp ? 0xFF6C5CE7 : 0x00000000);
                row.setBackgroundDrawable(rb);
                row.setPadding((int) (14 * d), (int) (12 * d), (int) (14 * d), (int) (12 * d));
                TextView main = new TextView(act);
                main.setText("Episode " + String.valueOf(oe.ep));
                main.setTextColor(Color.WHITE);
                main.setTextSize(16);
                main.setTypeface(Typeface.DEFAULT_BOLD);
                row.addView(main);
                if (oe.epName != null && oe.epName.length() > 0) {
                    TextView nm = new TextView(act);
                    nm.setText(oe.epName);
                    nm.setTextColor(0xFFBBBBBB);
                    nm.setTextSize(12);
                    nm.setSingleLine(true);
                    nm.setEllipsize(android.text.TextUtils.TruncateAt.END);
                    row.addView(nm);
                }
                row.setOnClickListener(new View.OnClickListener() {
                    @Override public void onClick(View v) {
                        if (oe.ep == curEp) { showEpisodes(false); return; }
                        switchEpisode(p, oe);
                    }
                });
                epPanelHost.addView(row, new LinearLayout.LayoutParams(
                        LinearLayout.LayoutParams.MATCH_PARENT,
                        LinearLayout.LayoutParams.WRAP_CONTENT));
                LinearLayout.LayoutParams lp = (LinearLayout.LayoutParams) row.getLayoutParams();
                lp.topMargin = (int) (6 * d);
                row.setLayoutParams(lp);
            }
        }

        void showEpisodes(boolean on) {
            if (epPanel == null) return;
            float d2 = act.getResources().getDisplayMetrics().density;
            // The panel is parked PAST the right edge (negative rightMargin).
            // Sliding it IN means pulling it left by its width (negative X).
            epPanel.animate().translationX(on ? -(int) (320 * d2) : 0).setDuration(220).start();
            if (on) showBars();
        }

        // Swap playback to another DOWNLOADED episode in place: stop the
        // current movie, reuse this activity with the new file.
        void switchEpisode(final Player p, final DlSpeed85.OfflineEpisode oe) {
            try {
                android.content.Intent it = new android.content.Intent(act, act.getClass());
                it.putExtra("path", oe.path);
                it.putExtra("title", oe.title);
                if (oe.subName != null && oe.subName.length() > 0) it.putExtra("sub", oe.subName);
                act.finish();
                act.startActivity(it);
            } catch (Exception e) {
                Toast.makeText(act, "Could not open this episode", Toast.LENGTH_SHORT).show();
            }
        }

        // "Crew Girl" stays "Crew Girl"; strip a trailing " - Ep Name" the
        // site sometimes embeds in the stored title.
        String seriesBaseName(String t) {
            if (t == null) return t;
            int cut = t.indexOf(" - ");
            if (cut > 0) return t.substring(0, cut);
            return t;
        }

        void bind(final Player p) {
            bar.setOnSeekBarChangeListener(p);
            backBtn.setOnClickListener(new View.OnClickListener() {
                @Override public void onClick(View v) { act.finish(); }
            });
            playWrap.setOnClickListener(new View.OnClickListener() {
                @Override public void onClick(View v) { p.togglePlay(); }
            });
            rewIcon.setOnClickListener(new View.OnClickListener() {
                @Override public void onClick(View v) { p.seekBy(-10000); }
            });
            fwdIcon.setOnClickListener(new View.OnClickListener() {
                @Override public void onClick(View v) { p.seekBy(10000); }
            });
            bottomPlay.setOnClickListener(new View.OnClickListener() {
                @Override public void onClick(View v) { p.togglePlay(); }
            });
            volBtn.setOnClickListener(new View.OnClickListener() {
                @Override public void onClick(View v) { toggleMute(); }
            });
            gearBtn.setOnClickListener(new View.OnClickListener() {
                @Override public void onClick(View v) { toggleSettings(p); }
            });
            subRow.setOnClickListener(new View.OnClickListener() {
                @Override public void onClick(View v) {
                    boolean open = subLangBox.getVisibility() == View.VISIBLE;
                    subLangBox.setVisibility(open ? View.GONE : View.VISIBLE);
                    showBars();
                }
            });
            subOffOpt.setOnClickListener(new View.OnClickListener() {
                @Override public void onClick(View v) { p.setSubLang(0); }
            });
            subEngOpt.setOnClickListener(new View.OnClickListener() {
                @Override public void onClick(View v) { p.setSubLang(1); }
            });
            subPhOpt.setOnClickListener(new View.OnClickListener() {
                @Override public void onClick(View v) { p.setSubLang(2); }
            });
            surfaceTouch(p);
            buildSpeedPills(p);
            setupEpisodes(p);
            showBars();
        }

        private void buildSpeedPills(final Player p) {
            final float[] steps = new float[] { 0.5f, 0.75f, 1.0f, 1.25f, 1.5f, 2.0f };
            for (int i = 0; i < steps.length; i++) {
                final float s = steps[i];
                TextView t = new TextView(act);
                t.setText(String.valueOf(s) + "x");
                t.setTextColor(Color.WHITE);
                t.setTextSize(13);
                t.setPadding((int) (12 * d), (int) (6 * d), (int) (12 * d), (int) (6 * d));
                android.graphics.drawable.GradientDrawable bg =
                        new android.graphics.drawable.GradientDrawable();
                bg.setCornerRadius(14 * d);
                bg.setColor(s == 1.0f ? RED : 0x33FFFFFF);
                t.setBackgroundDrawable(bg);
                LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
                        LinearLayout.LayoutParams.WRAP_CONTENT,
                        LinearLayout.LayoutParams.WRAP_CONTENT);
                lp.rightMargin = (int) (8 * d);
                t.setOnClickListener(new View.OnClickListener() {
                    @Override public void onClick(View v) {
                        p.setSpeed(s);
                        restyleSpeedPills(s);
                    }
                });
                speedRow.addView(t, lp);
            }
        }

        private void restyleSpeedPills(float sel) {
            final float[] steps = new float[] { 0.5f, 0.75f, 1.0f, 1.25f, 1.5f, 2.0f };
            for (int i = 0; i < speedRow.getChildCount(); i++) {
                View v = speedRow.getChildAt(i);
                android.graphics.drawable.GradientDrawable bg =
                        new android.graphics.drawable.GradientDrawable();
                bg.setCornerRadius(14 * d);
                bg.setColor(steps[i] == sel ? RED : 0x33FFFFFF);
                v.setBackgroundDrawable(bg);
            }
        }

        void toggleSettings(Player p) {
            boolean open = settings.getVisibility() == View.VISIBLE;
            settings.setVisibility(open ? View.GONE : View.VISIBLE);
            if (!open) {
                restyleSpeedPills(p.speed);
                refreshSubLabel(p);
            }
        }

        // right-hand value on the Subtitles row + which option is highlighted
        void refreshSubLabel(Player p) {
            int lang = p.subLang;
            subChoice.setText(lang == 1 ? "English" : (lang == 2 ? "Tagalog" : "Off"));
            subOffOpt.setTextColor(lang == 0 ? RED : 0xFFCCCCCC);
            subEngOpt.setTextColor(lang == 1 ? RED : 0xFFCCCCCC);
            subPhOpt.setTextColor(lang == 2 ? RED : 0xFFCCCCCC);
        }

        void closeSettings() {
            settings.setVisibility(View.GONE);
            showBars();
        }

        // the sheet lives and dies with the control bars: when the bars fade
        // away an open settings panel closes with them (site behavior)
        boolean settingsOpen() {
            return settings.getVisibility() == View.VISIBLE;
        }

        // Mute / unmute: speaker button beside the timestamp. Muting zeroes
        // the music stream (what MediaPlayer plays through) and remembers the
        // previous level so unmute restores it exactly.
        void toggleMute() {
            android.media.AudioManager am = (android.media.AudioManager)
                    act.getSystemService(Context.AUDIO_SERVICE);
            if (am == null) return;
            if (!muted) {
                preMuteVol = am.getStreamVolume(android.media.AudioManager.STREAM_MUSIC);
                am.setStreamVolume(android.media.AudioManager.STREAM_MUSIC, 0, 0);
                muted = true;
                volBtn.muteSwap(P_MUTE);
                toast("Muted");
            } else {
                int max = am.getStreamMaxVolume(android.media.AudioManager.STREAM_MUSIC);
                int v = preMuteVol > 0 ? preMuteVol : Math.max(1, max / 2);
                am.setStreamVolume(android.media.AudioManager.STREAM_MUSIC, Math.min(v, max), 0);
                muted = false;
                volBtn.muteSwap(P_VOL);
                toast("Unmuted");
            }
            showBars();
        }

        void flashSlider(final VSlider s) {
            s.setVisibility(View.VISIBLE);
            handler.removeCallbacks(hideRun);
            handler.postDelayed(hideRun, 2500);
        }

        // aspect fit (site default) or aspect fill (crop)
        void fitVideo(int vw, int vh) {
            fitVideo(vw, vh, fitMode);
        }

        void fitVideo(int vw, int vh, boolean fit) {
            int sw = stage.getWidth();
            int sh = stage.getHeight();
            if (sw == 0) return;
            if (sh == 0) return;
            float screen = (float) sw / sh;
            float video = (float) vw / vh;
            FrameLayout.LayoutParams lp;
            if (fit) {
                float scale = Math.min((float) sw / vw, (float) sh / vh);
                lp = new FrameLayout.LayoutParams(
                        (int) (vw * scale), (int) (vh * scale), Gravity.CENTER);
            } else {
                if (video > screen) {
                    lp = new FrameLayout.LayoutParams(
                            sw, (int) (sw / video), Gravity.CENTER);
                } else {
                    lp = new FrameLayout.LayoutParams(
                            (int) (sh * video), sh, Gravity.CENTER);
                }
            }
            surface.setLayoutParams(lp);
        }

        void syncPlay(boolean playing) {
            // rebuild the icon view with the right path (play or pause)
            int idx = center.indexOfChild(playWrap);
            playWrap.removeAllViews();
            playIcon = new IconView(act, playing ? P_PAUSE : P_PLAY, null, Color.WHITE, 34 * d);
            playWrap.addView(playIcon, new FrameLayout.LayoutParams(
                    (int) (34 * d), (int) (34 * d), Gravity.CENTER));
            if (idx < 0) idx = 1;
            // bottom play icon
            LinearLayout row = (LinearLayout) bottomBar.getChildAt(1);
            row.removeViewAt(0);
            IconView bp = new IconView(act, playing ? P_PAUSE : P_PLAY, null, Color.WHITE, 22 * d);
            bp.setOnClickListener(new View.OnClickListener() {
                @Override public void onClick(View v) { togglePlayRef.togglePlay(); }
            });
            row.addView(bp, 0, new LinearLayout.LayoutParams(
                    (int) (24 * d), (int) (24 * d)));
            bottomPlay = bp;
        }

        // set by bind(); lets syncPlay rebuild the bottom button
        Player togglePlayRef;

        // ---- show / hide (site: 2.5s auto-hide) --------------------------
        void showBars() {
            bars = true;
            topBar.setVisibility(View.VISIBLE);
            center.setVisibility(View.VISIBLE);
            bottomBar.setVisibility(View.VISIBLE);
            handler.removeCallbacks(hideRun);
            // an open settings panel gives you longer before the fade
            handler.postDelayed(hideRun, settingsOpen() ? 6000 : 2500);
        }

        void hideBars() {
            bars = false;
            topBar.setVisibility(View.GONE);
            center.setVisibility(View.GONE);
            bottomBar.setVisibility(View.GONE);
        }

        void toggleBars() {
            if (bars) hideBars();
            else showBars();
        }

        final Runnable hideRun = new Runnable() {
            @Override public void run() {
                hideBars();
                settings.setVisibility(View.GONE);
                brightness.setVisibility(View.GONE);
                volume.setVisibility(View.GONE);
            }
        };

        void flashBadge(TextView which) {
            which.setVisibility(View.VISIBLE);
            handler.postDelayed(new Runnable() {
                @Override public void run() {
                    rewBadge.setVisibility(View.GONE);
                    fwdBadge.setVisibility(View.GONE);
                }
            }, 600);
        }

        void toast(String s) {
            Toast.makeText(act.getApplicationContext(), s, Toast.LENGTH_SHORT).show();
        }

        // ---- gestures (site parity) --------------------------------------
        float gx;
        float gy;
        long gtime;
        long lastTap;
        boolean longFired;
        boolean sliding;
        int slideStartPct;
        final Runnable longRun = new Runnable() {
            @Override public void run() {
                longFired = true;
                slideStartPct = 0;
                speedBadge.setVisibility(View.VISIBLE);
            }
        };

        void surfaceTouch(final Player p) {
            togglePlayRef = p;
            surface.setOnTouchListener(new View.OnTouchListener() {
                @Override public boolean onTouch(View v, MotionEvent e) {
                    int w = surface.getWidth();
                    switch (e.getActionMasked()) {
                        case MotionEvent.ACTION_DOWN:
                            gx = e.getX();
                            gy = e.getY();
                            gtime = System.currentTimeMillis();
                            longFired = false;
                            sliding = false;
                            if (p.playing()) handler.postDelayed(longRun, 500);
                            return true;
                        case MotionEvent.ACTION_MOVE:
                            float dx = e.getX() - gx;
                            float dy = e.getY() - gy;
                            if (!longFired && Math.abs(dy) > 40 * d && Math.abs(dy) > Math.abs(dx)) {
                                handler.removeCallbacks(longRun);
                                sliding = true;
                                boolean left = gx < w / 2f;
                                VSlider s = left ? brightness : volume;
                                int span = (int) (220 * d);
                                int pct = slideStartPct - (int) (dy * 100 / span);
                                if (pct < 0) pct = 0;
                                if (pct > 100) pct = 100;
                                applySlider(p, left, pct);
                                s.setVisibility(View.VISIBLE);
                            }
                            return true;
                        case MotionEvent.ACTION_UP:
                            handler.removeCallbacks(longRun);
                            if (longFired) {
                                p.setSpeed(1.0f);
                                speedBadge.setVisibility(View.GONE);
                                return true;
                            }
                            if (sliding) {
                                handler.postDelayed(new Runnable() {
                                    @Override public void run() {
                                        brightness.setVisibility(View.GONE);
                                        volume.setVisibility(View.GONE);
                                    }
                                }, 800);
                                return true;
                            }
                            long now = System.currentTimeMillis();
                            if (now - lastTap < 300) {
                                lastTap = 0;
                                boolean left = e.getX() < w / 3f;
                                boolean right = e.getX() > w * 2f / 3f;
                                if (left) {
                                    p.seekBy(-10000);
                                    flashBadge(rewBadge);
                                } else if (right) {
                                    p.seekBy(10000);
                                    flashBadge(fwdBadge);
                                } else {
                                    p.togglePlay();
                                }
                            } else {
                                lastTap = now;
                                handler.postDelayed(new Runnable() {
                                    @Override public void run() {
                                        if (lastTap != 0 && System.currentTimeMillis() - lastTap >= 290) {
                                            lastTap = 0;
                                            toggleBars();
                                        }
                                    }
                                }, 310);
                            }
                            return true;
                        default:
                            return true;
                    }
                }
            });
        }

        void applySlider(Player p, boolean brightnessSide, int pct) {
            if (brightnessSide) {
                brightness.setPct(pct);
                float b = pct / 100f;
                if (b < 0.01f) b = 0.01f;
                WindowManager.LayoutParams lp = act.getWindow().getAttributes();
                lp.screenBrightness = b;
                act.getWindow().setAttributes(lp);
            } else {
                volume.setPct(pct);
                try {
                    AudioManager am = (AudioManager) act.getSystemService(Context.AUDIO_SERVICE);
                    int max = am.getStreamMaxVolume(AudioManager.STREAM_MUSIC);
                    am.setStreamVolume(AudioManager.STREAM_MUSIC, max * pct / 100, 0);
                } catch (Exception e) { }
            }
        }
    }
}
