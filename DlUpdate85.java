// ===========================================================================
//  DEYMFLIX -- DlUpdate85.java        (library class, v1.9 - FORCE UPDATE)
// ===========================================================================
//  WHAT THIS IS
//    The in-app updater. On every app start it fetches the site manifest
//    (app-update.json -- the SAME file the website's update checker reads)
//    and compares the remote version against CURRENT_VERSION below. When the
//    site is newer:
//      - a dialog pops up: "Update available -- version X"
//      - ONE button: Download. Tapping it starts the APK download and shows
//        a live progress bar inside the dialog.
//      - no cancel/close: the dialog cannot be dismissed, and it REPOPUPS
//        whenever the user tries to use the app (resume, back, navigation)
//        until the update is installed.
//      - when the download finishes, the system installer opens; after the
//        user installs, the app relaunches updated.
//
//  HOW TO RELEASE AN UPDATE (your workflow, unchanged):
//    1. upload the new APK to the site (e.g. apk/Deymflix-v2.0.apk)
//    2. edit app-update.json: {"version":"2.0","url":"apk/Deymflix-v2.0.apk",...}
//    3. bump CURRENT_VERSION in this file for the NEXT build
//  Every installed app with a lower version blocks itself until updated.
//
//  100% ASCII, zero pipe characters.
// ===========================================================================
package com.deymflix.eu.cc;

import android.app.Activity;
import android.app.Dialog;
import android.app.DownloadManager;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.database.Cursor;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.os.Environment;
import android.os.Handler;
import android.view.Gravity;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import java.io.File;
import java.net.HttpURLConnection;
import java.net.URL;

public class DlUpdate85 {

    // The version of the APP this file is compiled into. Bump this on every
    // release (it must match what you put in app-update.json next release).
    public static final String CURRENT_VERSION = "1.5";

    private static final String MANIFEST_URL =
            "https://deymflix.eu.cc/app-update.json";
    private static final String SITE_BASE = "https://deymflix.eu.cc/";
    private static final String PREF = "deymflix_update";
    private static final String K_DL_ID = "dlId";
    private static final String K_DL_URL = "dlUrl";

    private static boolean dialogShowing = false;

    // =======================================================================
    //  ENTRY POINTS -- call from MainScreen85 (install + resume)
    // =======================================================================
    public static void checkAndEnforce(final Activity act) {
        if (act == null) return;
        if (dialogShowing) return;
        new Thread(new Runnable() { @Override public void run() {
            String remote = fetchManifestVersion();
            if (remote == null) return; // offline / manifest missing: allow
            if (!isNewer(remote, CURRENT_VERSION)) return;
            String url = fetchManifestUrl();
            final String v = remote;
            final String u = url == null ? "" : url;
            act.runOnUiThread(new Runnable() { @Override public void run() {
                showUpdateDialog(act, v, u);
            }});
        }}).start();
    }

    // -----------------------------------------------------------------------
    //  Manifest fetches (tiny hand parser -- the file is flat and ours)
    // -----------------------------------------------------------------------
    private static String fetchManifestVersion() {
        return manifestField("version");
    }

    private static String fetchManifestUrl() {
        return manifestField("url");
    }

    private static String manifestField(String key) {
        try {
            HttpURLConnection c = (HttpURLConnection) new URL(MANIFEST_URL).openConnection();
            c.setConnectTimeout(6000);
            c.setReadTimeout(6000);
            c.setRequestProperty("Cache-Control", "no-cache");
            c.setRequestProperty("User-Agent", "DeymflixApp/1.5");
            int code = c.getResponseCode();
            if (code != 200) {
                c.disconnect();
                return null;
            }
            java.io.BufferedReader br = new java.io.BufferedReader(
                    new java.io.InputStreamReader(c.getInputStream(), "UTF-8"));
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = br.readLine()) != null) sb.append(line);
            br.close();
            c.disconnect();
            String json = sb.toString();
            int k = json.indexOf("\"" + key + "\"");
            if (k < 0) return null;
            int colon = json.indexOf(':', k);
            if (colon < 0) return null;
            int q1 = json.indexOf('"', colon);
            if (q1 < 0) return null;
            int q2 = json.indexOf('"', q1 + 1);
            if (q2 < 0) return null;
            return json.substring(q1 + 1, q2);
        } catch (Exception e) {
            return null;
        }
    }

    // 1.5 vs 1.4.9 style compare
    private static boolean isNewer(String remote, String local) {
        try {
            String[] a = remote.split("\\.");
            String[] b = local.split("\\.");
            int n = Math.max(a.length, b.length);
            for (int i = 0; i < n; i++) {
                int x = 0;
                int y = 0;
                if (i < a.length) x = Integer.parseInt(a[i].trim());
                if (i < b.length) y = Integer.parseInt(b[i].trim());
                if (x > y) return true;
                if (x < y) return false;
            }
            return false;
        } catch (Exception e) {
            return false;
        }
    }

    // -----------------------------------------------------------------------
    //  The dialog: title, version line, ONE button, progress bar
    //  Non-dismissible. Repopups from checkAndEnforce() on every resume.
    // -----------------------------------------------------------------------
    private static void showUpdateDialog(final Activity act, final String version,
            final String apkUrl) {
        if (dialogShowing) return;
        if (act.isFinishing()) return;
        dialogShowing = true;

        float d = act.getResources().getDisplayMetrics().density;
        LinearLayout box = new LinearLayout(act);
        box.setOrientation(LinearLayout.VERTICAL);
        int pad = (int) (24 * d);
        box.setPadding(pad, pad, pad, (int) (18 * d));
        GradientDrawable card = new GradientDrawable();
        card.setColor(Color.parseColor("#141418"));
        card.setCornerRadius(22 * d);
        card.setStroke(1, Color.parseColor("#2A2A30"));

        // head: hexagon mark + title, exactly like the exit dialog
        LinearLayout head = new LinearLayout(act);
        head.setOrientation(LinearLayout.HORIZONTAL);
        head.setGravity(Gravity.CENTER_VERTICAL);
        View mark = new MainScreen85.HexagonLogoView(act);
        head.addView(mark, new LinearLayout.LayoutParams(
                (int) (40 * d), (int) (40 * d)));
        TextView tTitle = new TextView(act);
        tTitle.setText("Update available");
        tTitle.setTextColor(Color.WHITE);
        tTitle.setTextSize(19);
        tTitle.setTypeface(Typeface.DEFAULT_BOLD);
        LinearLayout.LayoutParams tp = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT);
        tp.leftMargin = (int) (14 * d);
        head.addView(tTitle, tp);
        box.addView(head, new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT));

        // version chip: red-tinted pill with the required version
        TextView chip = new TextView(act);
        chip.setText("Version " + version + " -- required");
        chip.setTextColor(Color.parseColor("#FF8A90"));
        chip.setTextSize(12);
        chip.setTypeface(Typeface.DEFAULT_BOLD);
        GradientDrawable chipBg = new GradientDrawable();
        chipBg.setColor(Color.parseColor("#22E50914"));
        chipBg.setCornerRadius(999 * d);
        chipBg.setStroke(1, Color.parseColor("#59E50914"));
        chip.setBackgroundDrawable(chipBg);
        chip.setPadding((int) (12 * d), (int) (5 * d), (int) (12 * d), (int) (5 * d));
        LinearLayout.LayoutParams cp = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT);
        cp.topMargin = (int) (14 * d);
        box.addView(chip, cp);

        TextView tMsg = new TextView(act);
        tMsg.setText("Download and install the new version to keep using DEYMFLIX.");
        tMsg.setTextColor(Color.parseColor("#9A9A9A"));
        tMsg.setTextSize(15);
        tMsg.setLineSpacing(3 * d, 1f);
        LinearLayout.LayoutParams mp = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT);
        mp.topMargin = (int) (14 * d);

        final ProgressBar bar = new ProgressBar(act, null,
                android.R.attr.progressBarStyleHorizontal);
        bar.setMax(100);
        bar.setProgress(0);
        try {
            bar.getProgressDrawable().setColorFilter(
                    Color.parseColor("#E50914"), android.graphics.PorterDuff.Mode.SRC_IN);
        } catch (Exception e) { }
        LinearLayout.LayoutParams bp = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT);
        bp.topMargin = (int) (16 * d);
        bar.setVisibility(View.GONE);

        final TextView pct = new TextView(act);
        pct.setText("0%");
        pct.setTextColor(Color.parseColor("#9A9A9A"));
        pct.setTextSize(12);
        pct.setGravity(Gravity.CENTER);
        pct.setVisibility(View.GONE);

        Button yes = new Button(act);
        yes.setText("DOWNLOAD UPDATE");
        yes.setAllCaps(true);
        yes.setTextColor(Color.WHITE);
        yes.setTypeface(Typeface.DEFAULT_BOLD);
        yes.setTextSize(14);
        GradientDrawable rb = new GradientDrawable();
        rb.setColor(Color.parseColor("#E50914"));
        rb.setCornerRadius(12 * d);
        yes.setBackgroundDrawable(rb);
        LinearLayout.LayoutParams yp = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT);
        yp.topMargin = (int) (22 * d);

        box.addView(tTitle);
        box.addView(tMsg, mp);
        box.addView(bar, bp);
        box.addView(pct);
        box.addView(yes, yp);

        final Dialog dl = new Dialog(act);
        dl.getWindow().setBackgroundDrawable(card);
        dl.setContentView(box);
        int width = (int) (act.getResources().getDisplayMetrics().widthPixels * 0.82f);
        dl.getWindow().setLayout(width,
                android.view.ViewGroup.LayoutParams.WRAP_CONTENT);
        dl.setCancelable(false);
        dl.setCanceledOnTouchOutside(false);

        yes.setOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View v) {
                yes.setVisibility(View.GONE);
                bar.setVisibility(View.VISIBLE);
                pct.setVisibility(View.VISIBLE);
                startDownload(act, dl, bar, pct, version, apkUrl);
            }
        });

        dl.show();
        // released when the dialog goes away for any reason
        dl.setOnDismissListener(new android.content.DialogInterface.OnDismissListener() {
            @Override public void onDismiss(android.content.DialogInterface di) {
                dialogShowing = false;
            }
        });
    }

    // -----------------------------------------------------------------------
    //  APK download via DownloadManager (progress polled 2x per second)
    // -----------------------------------------------------------------------
    private static void startDownload(final Activity act, final Dialog dl,
            final ProgressBar bar, final TextView pct, final String version,
            final String apkUrl) {
        try {
            SharedPreferences p = act.getSharedPreferences(PREF, 0);
            // resume an existing download of the SAME url if there is one
            long existing = p.getLong(K_DL_ID, -1L);
            String existingUrl = p.getString(K_DL_URL, "");
            String full = apkUrl.startsWith("http") ? apkUrl : SITE_BASE + apkUrl;
            if (existing > 0 && existingUrl.equals(full)) {
                int s = statusOf(act, existing);
                boolean inFlight = s == DownloadManager.STATUS_RUNNING;
                if (!inFlight) inFlight = s == DownloadManager.STATUS_PAUSED;
                if (!inFlight) inFlight = s == DownloadManager.STATUS_PENDING;
                if (inFlight) {
                    watch(act, dl, bar, pct, existing, version);
                    return;
                }
                if (s == DownloadManager.STATUS_SUCCESSFUL) {
                    install(act, existing);
                    return;
                }
            }
            DownloadManager dm = (DownloadManager)
                    act.getSystemService(Context.DOWNLOAD_SERVICE);
            DownloadManager.Request req = new DownloadManager.Request(Uri.parse(full));
            req.setTitle("DEYMFLIX v" + version);
            req.setDescription("Downloading update");
            req.setNotificationVisibility(
                    DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
            req.setMimeType("application/vnd.android.package-archive");
            req.setDestinationInExternalFilesDir(act,
                    Environment.DIRECTORY_DOWNLOADS, "deymflix-update.apk");
            long id = dm.enqueue(req);
            p.edit().putLong(K_DL_ID, id).putString(K_DL_URL, full).apply();
            watch(act, dl, bar, pct, id, version);
        } catch (Exception e) {
            Toast.makeText(act.getApplicationContext(),
                    "Download failed -- check your connection", Toast.LENGTH_LONG).show();
            dialogShowing = false;
            dl.dismiss();
        }
    }

    private static int statusOf(Context ctx, long id) {
        try {
            DownloadManager dm = (DownloadManager)
                    ctx.getSystemService(Context.DOWNLOAD_SERVICE);
            Cursor c = dm.query(new DownloadManager.Query().setFilterById(id));
            int s = -1;
            if (c != null && c.moveToFirst()) {
                s = c.getInt(c.getColumnIndexOrThrow(DownloadManager.COLUMN_STATUS));
            }
            if (c != null) c.close();
            return s;
        } catch (Exception e) {
            return -1;
        }
    }

    private static void watch(final Activity act, final Dialog dl,
            final ProgressBar bar, final TextView pct, final long id,
            final String version) {
        final Handler h = new Handler();
        h.postDelayed(new Runnable() {
            @Override public void run() {
                if (act.isFinishing()) return;
                if (!dl.isShowing()) return;
                try {
                    DownloadManager dm = (DownloadManager)
                            act.getSystemService(Context.DOWNLOAD_SERVICE);
                    Cursor c = dm.query(new DownloadManager.Query().setFilterById(id));
                    if (c != null && c.moveToFirst()) {
                        int st = c.getInt(c.getColumnIndexOrThrow(DownloadManager.COLUMN_STATUS));
                        if (st == DownloadManager.STATUS_SUCCESSFUL) {
                            c.close();
                            bar.setProgress(100);
                            pct.setText("100%");
                            install(act, id);
                            return;
                        }
                        if (st == DownloadManager.STATUS_FAILED) {
                            c.close();
                            pct.setText("Download failed -- tap Download again");
                            dialogShowing = false;
                            return;
                        }
                        long done = c.getLong(c.getColumnIndexOrThrow(
                                DownloadManager.COLUMN_BYTES_DOWNLOADED_SO_FAR));
                        long total = c.getLong(c.getColumnIndexOrThrow(
                                DownloadManager.COLUMN_TOTAL_SIZE_BYTES));
                        c.close();
                        if (total > 0) {
                            int p2 = (int) (done * 100 / total);
                            bar.setProgress(p2);
                            pct.setText(String.valueOf(p2) + "%  "
                                    + human(done) + " / " + human(total));
                        }
                    } else if (c != null) {
                        c.close();
                    }
                } catch (Exception e) { }
                h.postDelayed(this, 500);
            }
        }, 500);
    }

    // -----------------------------------------------------------------------
    //  Install handoff (FileProvider-free: our own external dir + flags)
    // -----------------------------------------------------------------------
    private static void install(final Activity act, final long id) {
        try {
            DownloadManager dm = (DownloadManager)
                    act.getSystemService(Context.DOWNLOAD_SERVICE);
            Uri u = dm.getUriForDownloadedFile(id);
            if (u == null) {
                Toast.makeText(act, "Update file is gone -- download again", Toast.LENGTH_LONG).show();
                return;
            }
            Intent it = new Intent(Intent.ACTION_INSTALL_PACKAGE);
            it.setData(u);
            it.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            it.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            act.startActivity(it);
        } catch (Exception e) {
            Toast.makeText(act,
                    "Open the downloaded file to install the update",
                    Toast.LENGTH_LONG).show();
        }
    }

    private static String human(long b) {
        if (b <= 0) return "-";
        double x = b;
        String[] u = new String[] { "B", "KB", "MB", "GB" };
        int i = 0;
        while (x >= 1024 && i < u.length - 1) {
            x /= 1024;
            i++;
        }
        return String.format(java.util.Locale.US, "%.1f %s",
                Double.valueOf(x), u[i]);
    }
}
