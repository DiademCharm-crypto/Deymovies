// ===========================================================================
//  DEYMFLIX -- LocalPlayer85.java     (drop-in file, v1.4h)
// ===========================================================================
//  WHAT THIS IS
//    The whole offline player screen (the one that plays a finished download).
//    Landscape-locked, immersive, FLAG_SECURE (no screenshots), branded
//    local-player.html UI, back button, subtitle support.
//
//  WHY IT EXISTS
//    Every previous build failure came from pasting ~2 KB of code into the
//    Sketchware Java Injection editor. This file is plain Java in your project
//    folder, so nothing can be mangled by a clipboard.
//
//  HOW TO INSTALL (3 steps)
//    1. Save this file as (same folder as MainActivity.java):
//         /storage/emulated/0/.sketchware/mysc/608/app/src/main/java/com/deymflix/eu/cc/LocalPlayer85.java
//    2. In the player activity (LocalplayerActivity) -> Logic -> vdots ->
//       Java/Kotlin Injection: clear ALL tabs, then type exactly this one line
//       in the onCreate tab:
//             LocalPlayer85.show(this);
//    3. Make sure local-player.html is in the project assets:
//         /storage/emulated/0/.sketchware/mysc/608/app/src/main/assets/local-player.html
//       (if it is missing the player falls back to the copy on deymflix.eu.cc)
//
//  100% ASCII, zero pipe characters.
// ===========================================================================
package com.deymflix.eu.cc;

import android.app.Activity;
import android.content.pm.ActivityInfo;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.view.View;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.Toast;

import java.net.URLEncoder;

public class LocalPlayer85 {

    // =======================================================================
    //  ENTRY POINT -- call LocalPlayer85.show(this) from the activity onCreate
    // =======================================================================
    public static void show(final Activity act) {
        if (act == null) return;

        final String intentPath = act.getIntent().getStringExtra("path");
        final String title = act.getIntent().getStringExtra("title");
        final String sub = act.getIntent().getStringExtra("sub");

        // Q: why the extra variable? A: this file must contain ZERO pipe
        // characters (chat apps eat the double-pipe operator), so null checks
        // are written without one.
        final String path = intentPath == null ? "" : intentPath;
        if (path.length() == 0) {
            Toast.makeText(act, "No video file to play", Toast.LENGTH_SHORT).show();
            act.finish();
            return;
        }

        // NETFLIX BEHAVIOR: the player is landscape and stays landscape, so the
        // movie never shrinks into a letterbox when the phone tilts.
        act.setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE);

        // ANTI-RECORDING: screenshots and screen recordings come out black while
        // a downloaded movie plays (per-activity flag, the rest of the app and
        // the website stay normal).
        act.getWindow().addFlags(WindowManager.LayoutParams.FLAG_SECURE);
        // Keep the screen awake for the whole movie.
        act.getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        // Draw behind the bars so the immersive flags can hide them.
        if (Build.VERSION.SDK_INT >= 21) {
            act.getWindow().setStatusBarColor(Color.BLACK);
            act.getWindow().setNavigationBarColor(Color.BLACK);
        }

        final WebView pv = new WebView(act);
        WebSettings s = pv.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(true);
        s.setAllowContentAccess(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setLoadWithOverviewMode(true);
        s.setUseWideViewPort(true);
        if (Build.VERSION.SDK_INT >= 21) {
            s.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        }
        pv.setBackgroundColor(Color.BLACK);

        final FrameLayout root = new FrameLayout(act);
        root.setBackgroundColor(Color.BLACK);
        root.addView(pv, new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT));
        act.setContentView(root);

        immersive(root);

        // Fullscreen video: WebView stays attached underneath, state preserved.
        pv.setWebChromeClient(new WebChromeClient() {
            private View cv;

            @Override
            public void onShowCustomView(View view, CustomViewCallback callback) {
                if (cv != null) {
                    callback.onCustomViewHidden();
                    return;
                }
                cv = view;
                root.addView(view, new FrameLayout.LayoutParams(
                        FrameLayout.LayoutParams.MATCH_PARENT,
                        FrameLayout.LayoutParams.MATCH_PARENT));
                immersive(root);
            }

            @Override
            public void onHideCustomView() {
                if (cv == null) return;
                root.removeView(cv);
                cv = null;
                immersive(root);
            }
        });

        // Bridge the HTML back button uses to close the player.
        pv.addJavascriptInterface(new Object() {
            @JavascriptInterface
            public void exitPlayer() {
                act.runOnUiThread(new Runnable() {
                    @Override public void run() { act.finish(); }
                });
            }
        }, "DeymflixLocal");

        // If the asset is missing, fall back to the same page on the website so
        // the movie still plays instead of showing a blank screen.
        final String localUrl = buildUrl("file:///android_asset/local-player.html", path, title, sub);
        final String webUrl = buildUrl("https://deymflix.eu.cc/local-player.html", path, title, sub);

        pv.setWebViewClient(new WebViewClient() {
            private boolean fellBack = false;

            private void maybeFallback(WebView view, String failingUrl) {
                if (fellBack) return;
                // Only the page itself (never the movie file, which also lives
                // under file://) may trigger the website fallback.
                if (failingUrl == null) return;
                if (failingUrl.indexOf("local-player.html") < 0) return;
                fellBack = true;
                view.loadUrl(webUrl);
            }

            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                maybeFallback(view, failingUrl);
            }

            @Override
            public void onReceivedError(WebView view, android.webkit.WebResourceRequest req, android.webkit.WebResourceError err) {
                if (req != null && req.isForMainFrame()) maybeFallback(view, req.getUrl() == null ? null : req.getUrl().toString());
            }
        });

        pv.loadUrl(localUrl);

        // Release the player when the screen really goes away (audio must not
        // keep playing behind the site).
        root.addOnAttachStateChangeListener(new View.OnAttachStateChangeListener() {
            @Override public void onViewAttachedToWindow(View v) { }

            @Override public void onViewDetachedFromWindow(View v) {
                try {
                    if (act.isFinishing()) {
                        pv.loadUrl("about:blank");
                        pv.onPause();
                        pv.destroy();
                    }
                } catch (Exception e) { }
            }
        });
    }

    // =======================================================================
    //  Helpers
    // =======================================================================
    private static void immersive(View v) {
        v.setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                + View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                + View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                + View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                + View.SYSTEM_UI_FLAG_FULLSCREEN
                + View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
    }

    // URLEncoder.encode throws UnsupportedEncodingException (a checked
    // exception), so the build lives inside a try/catch -- otherwise the
    // activity would not compile.
    private static String buildUrl(String base, String path, String title, String sub) {
        String url = base + "?f=" + enc(path);
        if (title != null && title.length() > 0) url = url + "&t=" + enc(title);
        if (sub != null && sub.length() > 0) url = url + "&s=" + enc(sub);
        return url;
    }

    private static String enc(String value) {
        try {
            return URLEncoder.encode(value == null ? "" : value, "UTF-8");
        } catch (Exception e) {
            return "";
        }
    }

    // Kept so the file is useful to callers that already have a Uri.
    public static String fileNameOf(Uri u) {
        if (u == null) return "";
        String last = u.getLastPathSegment();
        return last == null ? "" : last;
    }
}
