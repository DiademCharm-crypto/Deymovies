// ===========================================================================
//  DEYMFLIX -- MainScreen85.java      (library class, v1.4i)
// ===========================================================================
//  WHAT THIS IS
//    Everything MainActivity used to carry as a giant paste: WebView boot,
//    splash, JS bridge, download flow, fullscreen handling, subtitles registry.
//    It ships inside deymflix-screens-1.0 (a Sketchware local library), so it
//    can never be mangled by a paste and never gets wiped by a build.
//
//  MainActivity keeps only three one-line tabs:
//      onCreate      MainScreen85.install(this);
//      onBackPressed MainScreen85.back(this);
//      onResume      MainScreen85.resume(this);
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
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.graphics.Path;
import android.graphics.drawable.GradientDrawable;
import android.os.Environment;
import android.view.Gravity;
import android.view.View;
import android.webkit.WebView;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.HashMap;
import java.util.Locale;

public class MainScreen85 {

    // One instance per live MainActivity (weak-ish: finished activities are
    // purged on every install/resume, so nothing leaks).
    private static final HashMap<Activity, MainScreen85> INSTANCES =
            new HashMap<Activity, MainScreen85>();

    private static void purgeDeadInstances() {
        java.util.ArrayList<Activity> dead = new java.util.ArrayList<Activity>();
        for (Activity a : INSTANCES.keySet()) {
            // No pipe characters anywhere in this file, so the "either" test is
            // written as two ifs instead of one condition.
            if (a.isFinishing()) {
                dead.add(a);
            } else if (android.os.Build.VERSION.SDK_INT >= 17 && a.isDestroyed()) {
                dead.add(a);
            }
        }
        for (Activity a : dead) INSTANCES.remove(a);
    }

    public static MainScreen85 instanceOf(Activity act) {
        MainScreen85 m = INSTANCES.get(act);
        return m;
    }

    // =======================================================================
    //  ENTRY POINTS (the three one-line tabs)
    // =======================================================================
    public static void install(final Activity act) {
        if (act == null) return;
        purgeDeadInstances();
        MainScreen85 m = new MainScreen85(act);
        INSTANCES.put(act, m);
        m.boot();
    }

    public static void back(final Activity act) {
        MainScreen85 m = act == null ? null : INSTANCES.get(act);
        if (m != null) {
            m.handleBack();
            return;
        }
        // No instance (should not happen): degrade gracefully.
        if (act == null) return;
        WebView wv = findWebView(act);
        if (wv != null && wv.canGoBack()) wv.goBack(); else act.finish();
    }

    public static void resume(final Activity act) {
        if (act == null) return;
        purgeDeadInstances();
        MainScreen85 m = INSTANCES.get(act);
        if (m != null) m.handleResume();
    }

    // =======================================================================
    //  Per-activity state (was: class-level fields inside MainActivity)
    // =======================================================================
    private final Activity act;
    private View mActivityRoot;
    private boolean appFullscreen = false;
    private boolean videoFs85 = false;

    // splash state
    private LinearLayout splashLayout;
    private java.util.Timer splashTimeoutTimer;
    private View hexagonView;
    private android.animation.ValueAnimator splashAnimator;

    private MainScreen85(Activity a) {
        this.act = a;
    }

    // =======================================================================
    //  BOOT (was: the whole onCreate paste)
    // =======================================================================
    private void boot() {
        final WebView wv = findWebView(act);
        if (wv == null) {
            Toast.makeText(act.getApplicationContext(),
                    "Main layout is missing its WebView", Toast.LENGTH_SHORT).show();
            act.finish();
            return;
        }
        // SwipeRefresh found by STRUCTURE (wraps the WebView) -- id-name proof
        final androidx.swiperefreshlayout.widget.SwipeRefreshLayout swipe =
                (wv.getParent() instanceof androidx.swiperefreshlayout.widget.SwipeRefreshLayout)
                        ? (androidx.swiperefreshlayout.widget.SwipeRefreshLayout) wv.getParent()
                        : null;

        // -- 1) WebView settings --
        wv.getSettings().setJavaScriptEnabled(true);
        wv.getSettings().setDomStorageEnabled(true);
        wv.getSettings().setDatabaseEnabled(true);
        wv.getSettings().setMediaPlaybackRequiresUserGesture(false);
        wv.getSettings().setLoadWithOverviewMode(true);
        wv.getSettings().setUseWideViewPort(true);
        wv.getSettings().setSupportZoom(false);
        wv.getSettings().setMixedContentMode(android.webkit.WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);

        // -- 2) APP-MODE: mark the WebView so the site enables app-only features --
        String baseUa = wv.getSettings().getUserAgentString();
        if (baseUa != null && !baseUa.contains("DeymflixApp")) {
            wv.getSettings().setUserAgentString(baseUa + " DeymflixApp/1.4");
        }

        // -- 3) SPLASH --
        showSplash();

        // -- 4) WebViewClient: spinner fix + offline redirect + splash dismiss --
        wv.setWebViewClient(new android.webkit.WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                if (swipe != null) swipe.setRefreshing(false);
                hideSplash();
            }
            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                if (!isNetworkAvailable()) {
                    view.loadUrl("file:///android_asset/offline.html");
                }
                if (swipe != null) swipe.setRefreshing(false);
                hideSplash();
            }
        });

        // -- 5) WebChromeClient (video fullscreen only; a PAGE fullscreen keeps
        //       portrait -- Netflix/LokLok behavior) --
        wv.setWebChromeClient(new android.webkit.WebChromeClient() {
            private View customView;
            private android.webkit.WebChromeClient.CustomViewCallback customViewCallback;
            private android.widget.FrameLayout fullscreenContainer;

            @Override
            public void onShowCustomView(View view, android.webkit.WebChromeClient.CustomViewCallback callback) {
                // Only the VIDEO element itself counts (Android renders it into a
                // FrameLayout / VideoView / SurfaceView). A plain div = the PAGE
                // went fullscreen: hide nothing, keep portrait.
                boolean isVideo = view instanceof android.widget.FrameLayout
                        ? true
                        : (view instanceof android.widget.VideoView
                        ? true
                        : (view instanceof android.view.SurfaceView));
                if (!isVideo) { callback.onCustomViewHidden(); return; }
                if (customView != null) { callback.onCustomViewHidden(); return; }
                customView = view;
                customViewCallback = callback;
                fullscreenContainer = new android.widget.FrameLayout(act);
                fullscreenContainer.setBackgroundColor(Color.BLACK);
                fullscreenContainer.addView(view, new android.widget.FrameLayout.LayoutParams(
                        android.widget.FrameLayout.LayoutParams.MATCH_PARENT,
                        android.widget.FrameLayout.LayoutParams.MATCH_PARENT));
                act.setContentView(fullscreenContainer);
                enterAppFullscreen();
            }

            @Override
            public void onHideCustomView() {
                if (customView == null) return;
                fullscreenContainer.removeAllViews();
                act.setContentView(mActivityRoot);
                customView = null;
                customViewCallback = null;
                exitAppFullscreen();
            }
        });

        // -- 6) Swipe-to-refresh --
        if (swipe != null) {
            swipe.setOnRefreshListener(new androidx.swiperefreshlayout.widget.SwipeRefreshLayout.OnRefreshListener() {
                @Override
                public void onRefresh() {
                    if (isNetworkAvailable()) {
                        wv.reload();
                    } else {
                        wv.loadUrl("file:///android_asset/offline.html");
                        swipe.setRefreshing(false);
                    }
                }
            });
            swipe.setDistanceToTriggerSync(220);
        }

        // -- 7) JS BRIDGE --
        wv.addJavascriptInterface(getDeymflixBridge(), "DeymflixApp");

        // -- 8) DownloadListener: bare-link fallback --
        wv.setDownloadListener(new android.webkit.DownloadListener() {
            @Override
            public void onDownloadStart(final String url, String userAgent, String contentDisposition, String mimeType, final long contentLength) {
                act.runOnUiThread(new Runnable() { @Override public void run() {
                    confirmAndDownload(url, guessTitleFromUrl(url), "", "");
                }});
            }
        });

        // -- 8b) Purge stale download-registry rows (older than 7 days) --
        purgeOldDlMeta86();

        // -- 9) Load the site --
        if (isNetworkAvailable()) {
            wv.loadUrl("https://deymflix.eu.cc/index.html");
        } else {
            wv.loadUrl("file:///android_asset/offline.html");
        }

        // Remember the real content view so video-fullscreen can restore it
        mActivityRoot = ((android.view.ViewGroup) act.findViewById(android.R.id.content)).getChildAt(0);
    }

    // Finds the project WebView without any R.id dependency (the library jar
    // cannot see the app's generated resources).
    private static WebView findWebView(Activity a) {
        View root = a.findViewById(android.R.id.content);
        return root == null ? null : findWebViewIn(root);
    }

    private static WebView findWebViewIn(View v) {
        if (v instanceof WebView) return (WebView) v;
        if (v instanceof android.view.ViewGroup) {
            android.view.ViewGroup g = (android.view.ViewGroup) v;
            for (int i = 0; i < g.getChildCount(); i++) {
                WebView w = findWebViewIn(g.getChildAt(i));
                if (w != null) return w;
            }
        }
        return null;
    }

    // =======================================================================
    //  BACK (was: handleBack)
    // =======================================================================
    private void handleBack() {
        WebView wvB = findWebView(act);
        if (isAppFullscreen()) {
            if (wvB != null) wvB.loadUrl("javascript:(function(){try{exitFullscreen();}catch(e){}try{DeymflixApp.toggleFullscreen(false,false);}catch(e2){}})();");
            return;
        }
        if (wvB == null) { act.finish(); return; }
        String currentUrl = wvB.getUrl() == null ? "" : wvB.getUrl();
        boolean atHome = currentUrl.equals("https://deymflix.eu.cc/");
        if (!atHome) atHome = currentUrl.equals("https://deymflix.eu.cc/index.html");
        if (!atHome) atHome = currentUrl.endsWith("/index.html");
        if (!atHome) atHome = currentUrl.startsWith("file:///android_asset/");
        if (atHome) {
            new android.app.AlertDialog.Builder(act)
                    .setTitle("Exit DEYMFLIX?")
                    .setMessage("Do you want to exit?")
                    .setPositiveButton("Yes", new android.content.DialogInterface.OnClickListener() {
                        @Override
                        public void onClick(android.content.DialogInterface dialog, int which) {
                            act.finish();
                        }
                    })
                    .setNegativeButton("No", null)
                    .show();
        } else if (wvB.canGoBack()) {
            wvB.goBack();
        } else {
            wvB.loadUrl("https://deymflix.eu.cc/index.html");
        }
    }

    // =======================================================================
    //  RESUME (was: handleResume)
    // =======================================================================
    private void handleResume() {
        WebView wvR = findWebView(act);
        if (wvR != null && isNetworkAvailable()
                && wvR.getUrl() != null
                && wvR.getUrl().startsWith("file:///android_asset/offline.html")) {
            wvR.loadUrl("https://deymflix.eu.cc/index.html");
        }
    }

    // =======================================================================
    //  NETWORK
    // =======================================================================
    private boolean isNetworkAvailable() {
        android.net.ConnectivityManager cm =
                (android.net.ConnectivityManager) act.getSystemService(Context.CONNECTIVITY_SERVICE);
        if (cm == null) return false;
        android.net.NetworkInfo ni = cm.getActiveNetworkInfo();
        return ni != null && ni.isConnected();
    }

    // =======================================================================
    //  ANIMATED SPLASH
    // =======================================================================
    private void showSplash() {
        if (splashLayout != null) return;
        float d = act.getResources().getDisplayMetrics().density;
        splashLayout = new LinearLayout(act);
        splashLayout.setOrientation(LinearLayout.VERTICAL);
        splashLayout.setGravity(Gravity.CENTER);
        splashLayout.setBackgroundColor(Color.parseColor("#0B0B0F"));
        splashLayout.setClickable(true);
        splashLayout.setFocusable(true);

        hexagonView = new HexagonLogoView(act);
        int side = Math.min(act.getResources().getDisplayMetrics().widthPixels,
                act.getResources().getDisplayMetrics().heightPixels) / 3;
        splashLayout.addView(hexagonView, new LinearLayout.LayoutParams(side, side));

        TextView logo = new TextView(act);
        logo.setText("DEYMFLIX");
        logo.setTextColor(Color.WHITE);
        logo.setTextSize(30);
        logo.setTypeface(android.graphics.Typeface.DEFAULT_BOLD);
        logo.setLetterSpacing(0.2f);
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT);
        lp.topMargin = (int) (28 * d);
        splashLayout.addView(logo, lp);

        TextView hint = new TextView(act);
        hint.setText("Loading your stream...");
        hint.setTextColor(Color.parseColor("#9A9A9A"));
        hint.setTextSize(13);
        LinearLayout.LayoutParams hp = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT);
        hp.topMargin = (int) (14 * d);
        splashLayout.addView(hint, hp);

        android.view.ViewGroup root = (android.view.ViewGroup) act.findViewById(android.R.id.content);
        root.addView(splashLayout, new android.view.ViewGroup.LayoutParams(
                android.view.ViewGroup.LayoutParams.MATCH_PARENT,
                android.view.ViewGroup.LayoutParams.MATCH_PARENT));

        splashTimeoutTimer = new java.util.Timer();
        splashTimeoutTimer.schedule(new java.util.TimerTask() {
            @Override
            public void run() {
                act.runOnUiThread(new Runnable() { @Override public void run() { hideSplash(); } });
            }
        }, 6000);
    }

    private void hideSplash() {
        if (splashLayout == null) return;
        if (splashTimeoutTimer != null) { splashTimeoutTimer.cancel(); splashTimeoutTimer = null; }
        if (splashAnimator != null) { splashAnimator.cancel(); splashAnimator = null; }
        if (hexagonView != null) { hexagonView.animate().cancel(); hexagonView = null; }
        final LinearLayout splash = splashLayout;
        splashLayout = null;
        splash.animate().alpha(0f).setDuration(300).withEndAction(new Runnable() {
            @Override public void run() {
                android.view.ViewGroup parent = (android.view.ViewGroup) splash.getParent();
                if (parent != null) parent.removeView(splash);
            }
        }).start();
    }

    // The animated hexagon-play logo (matches the site icon)
    private static class HexagonLogoView extends View {
        private final android.graphics.Paint hexPaint = new android.graphics.Paint(android.graphics.Paint.ANTI_ALIAS_FLAG);
        private final android.graphics.Paint glowPaint = new android.graphics.Paint(android.graphics.Paint.ANTI_ALIAS_FLAG);
        private final android.graphics.Paint triPaint = new android.graphics.Paint(android.graphics.Paint.ANTI_ALIAS_FLAG);
        private final Path hexPath = new Path();
        private final Path triPath = new Path();
        private float rotation = 0;

        HexagonLogoView(Context c) {
            super(c);
            hexPaint.setStyle(android.graphics.Paint.Style.STROKE);
            hexPaint.setColor(Color.parseColor("#E50914"));
            hexPaint.setStrokeWidth(14f);
            glowPaint.setStyle(android.graphics.Paint.Style.STROKE);
            glowPaint.setColor(Color.parseColor("#E50914"));
            glowPaint.setStrokeWidth(24f);
            glowPaint.setAlpha(70);
            glowPaint.setMaskFilter(new android.graphics.BlurMaskFilter(18f, android.graphics.BlurMaskFilter.Blur.NORMAL));
            triPaint.setStyle(android.graphics.Paint.Style.FILL);
            triPaint.setColor(Color.WHITE);
            buildPaths();
            android.animation.ValueAnimator animator = android.animation.ValueAnimator.ofFloat(0f, 360f);
            animator.setDuration(6000);
            animator.setRepeatCount(android.animation.ValueAnimator.INFINITE);
            animator.setInterpolator(new android.view.animation.LinearInterpolator());
            animator.addUpdateListener(new android.animation.ValueAnimator.AnimatorUpdateListener() {
                @Override
                public void onAnimationUpdate(android.animation.ValueAnimator a) {
                    rotation = (Float) a.getAnimatedValue();
                    float pulse = 1f + 0.06f * (float) Math.sin(Math.toRadians(rotation * 6));
                    setScaleX(pulse);
                    setScaleY(pulse);
                    invalidate();
                }
            });
            animator.start();
        }

        private void buildPaths() {
            float R = 100f;
            hexPath.reset();
            for (int i = 0; i < 6; i++) {
                double ang = Math.toRadians(60 * i - 90);
                float x = (float) (R * Math.cos(ang));
                float y = (float) (R * Math.sin(ang));
                if (i == 0) hexPath.moveTo(x, y); else hexPath.lineTo(x, y);
            }
            hexPath.close();
            triPath.reset();
            triPath.moveTo(-22f, -42f);
            triPath.lineTo(-22f, 42f);
            triPath.lineTo(48f, 0f);
            triPath.close();
        }

        @Override
        protected void onDraw(android.graphics.Canvas canvas) {
            super.onDraw(canvas);
            canvas.save();
            canvas.rotate(rotation);
            float scale = Math.min(getWidth(), getHeight()) / 240f;
            canvas.scale(scale, scale);
            canvas.drawPath(hexPath, glowPaint);
            canvas.drawPath(hexPath, hexPaint);
            canvas.restore();
            float tscale = Math.min(getWidth(), getHeight()) / 240f;
            canvas.save();
            canvas.scale(tscale, tscale);
            canvas.drawPath(triPath, triPaint);
            canvas.restore();
        }
    }

    // =======================================================================
    //  JS BRIDGE (name + signatures must match app.js exactly)
    // =======================================================================
    private Object getDeymflixBridge() {
        return new Object() {
            @android.webkit.JavascriptInterface
            public void requestDownload(final String url, final String title, final String quality, final String poster) {
                act.runOnUiThread(new Runnable() { @Override public void run() {
                    confirmAndDownload(url, title, quality, poster);
                }});
            }
            @android.webkit.JavascriptInterface
            public void openDownloads() {
                act.runOnUiThread(new Runnable() { @Override public void run() {
                    openDownloadsScreen();
                }});
            }
            // enter = true + isVideo = true: landscape lock + immersive bars.
            // A page-level fullscreen hides the bars but keeps portrait.
            @android.webkit.JavascriptInterface
            public void toggleFullscreen(final boolean enter, final boolean isVideo) {
                act.runOnUiThread(new Runnable() { @Override public void run() {
                    if (enter && isVideo) {
                        enterAppFullscreen();
                    } else if (!enter) {
                        exitAppFullscreen();
                    } else {
                        appFullscreen = true;
                        android.view.Window w = act.getWindow();
                        w.addFlags(android.view.WindowManager.LayoutParams.FLAG_FULLSCREEN);
                        w.getDecorView().setSystemUiVisibility(
                                View.SYSTEM_UI_FLAG_FULLSCREEN
                                + View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
                    }
                }});
            }
            // Anti-recording: black out screenshots while a movie plays.
            @android.webkit.JavascriptInterface
            public void setSecure(final boolean on) {
                act.runOnUiThread(new Runnable() { @Override public void run() {
                    if (on) {
                        act.getWindow().addFlags(android.view.WindowManager.LayoutParams.FLAG_SECURE);
                    } else {
                        act.getWindow().clearFlags(android.view.WindowManager.LayoutParams.FLAG_SECURE);
                    }
                }});
            }
        };
    }

    // The Downloads screen is launched by NAME so this jar never needs a
    // compile-time reference to the app's generated classes.
    private void openDownloadsScreen() {
        try {
            Intent it = new Intent();
            it.setClassName(act.getApplicationContext(), act.getPackageName() + ".DownloadsActivity");
            act.startActivity(it);
        } catch (Exception e) {
            Toast.makeText(act.getApplicationContext(),
                    "Downloads screen unavailable", Toast.LENGTH_SHORT).show();
        }
    }

    // =======================================================================
    //  APP FULLSCREEN (video only)
    // =======================================================================
    private void enterAppFullscreen() {
        appFullscreen = true;
        videoFs85 = true;
        act.setRequestedOrientation(android.content.pm.ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE);
        android.view.Window w = act.getWindow();
        w.addFlags(android.view.WindowManager.LayoutParams.FLAG_FULLSCREEN);
        w.getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_FULLSCREEN
                + View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                + View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                + View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                + View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                + View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
    }

    private void exitAppFullscreen() {
        appFullscreen = false;
        videoFs85 = false;
        act.setRequestedOrientation(android.content.pm.ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED);
        android.view.Window w = act.getWindow();
        w.clearFlags(android.view.WindowManager.LayoutParams.FLAG_FULLSCREEN);
        w.getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_VISIBLE);
    }

    private boolean isAppFullscreen() {
        return appFullscreen;
    }

    // =======================================================================
    //  THEMED CONFIRM DIALOG
    // =======================================================================
    private void confirmAndDownload(final String url, final String title, final String quality, final String poster) {
        if (url == null) {
            Toast.makeText(act.getApplicationContext(), "This title cannot be downloaded.", Toast.LENGTH_SHORT).show();
            return;
        }
        if (url.length() == 0) {
            Toast.makeText(act.getApplicationContext(), "This title cannot be downloaded.", Toast.LENGTH_SHORT).show();
            return;
        }
        if (android.os.Build.VERSION.SDK_INT >= 33
                && act.checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS) != android.content.pm.PackageManager.PERMISSION_GRANTED) {
            act.requestPermissions(new String[]{ android.Manifest.permission.POST_NOTIFICATIONS }, 4101);
        }

        Toast.makeText(act.getApplicationContext(), "Checking file...", Toast.LENGTH_SHORT).show();
        new Thread(new Runnable() { @Override public void run() {
            long size = -1;
            try {
                URL u = new URL(url);
                HttpURLConnection c = (HttpURLConnection) u.openConnection();
                c.setRequestMethod("HEAD");
                c.setConnectTimeout(8000);
                c.setReadTimeout(8000);
                c.setRequestProperty("User-Agent", "DeymflixApp/1.4");
                size = c.getContentLengthLong();
                c.disconnect();
            } catch (Exception e) { size = -1; }
            // Resolve the matching local subtitle (English first) so it
            // downloads together with the movie.
            final String subUrl = findSubUrlForMovie(title, episodeNumFromTitle(title));
            final long fSize = size;
            act.runOnUiThread(new Runnable() { @Override public void run() {
                showConfirmDialog(url, title, quality, poster, fSize, subUrl);
            }});
        }}).start();
    }

    // "Series Name ep3" -> 3. 0 = not an episode.
    private int episodeNumFromTitle(String t) {
        if (t == null) return 0;
        java.util.regex.Matcher m = java.util.regex.Pattern.compile("\\bep?\\.?\\s*(\\d{1,2})\\b").matcher(t.toLowerCase());
        if (m.find()) {
            try { return Integer.parseInt(m.group(1)); } catch (Exception e) { return 0; }
        }
        return 0;
    }

    private void showConfirmDialog(final String url, final String title, final String quality, final String poster, final long sizeBytes, final String subUrl) {
        float density = act.getResources().getDisplayMetrics().density;
        LinearLayout box = new LinearLayout(act);
        box.setOrientation(LinearLayout.HORIZONTAL);
        box.setPadding((int) (22 * density), (int) (20 * density), (int) (20 * density), (int) (18 * density));
        GradientDrawable card = new GradientDrawable();
        card.setColor(Color.parseColor("#141418"));
        card.setCornerRadius(18 * density);
        card.setStroke(1, Color.parseColor("#2A2A30"));

        // LEFT: poster thumbnail (same art as the movie card on the site)
        ImageView pv = new ImageView(act);
        LinearLayout.LayoutParams pvLp = new LinearLayout.LayoutParams((int) (92 * density), (int) (138 * density));
        pvLp.rightMargin = (int) (16 * density);
        pv.setScaleType(ImageView.ScaleType.CENTER_CROP);
        pv.setBackgroundDrawable(posterBg());
        loadPosterInto(pv, poster, (int) (92 * density), (int) (138 * density));

        // RIGHT: title, quality, size, note, buttons
        LinearLayout right = new LinearLayout(act);
        right.setOrientation(LinearLayout.VERTICAL);

        TextView tTitle = new TextView(act);
        tTitle.setText("Download");
        tTitle.setTextColor(Color.parseColor("#E50914"));
        tTitle.setTextSize(19);
        tTitle.setTypeface(android.graphics.Typeface.DEFAULT_BOLD);

        TextView tMsg = new TextView(act);
        String msg = title;
        if (quality != null && quality.length() > 0) msg = msg + "\nQuality: " + quality;
        msg = msg + "\nSize: " + (sizeBytes > 0 ? humanSize(sizeBytes) : "checking...");
        msg = msg + "\n\nSaved inside DEYMFLIX only. Watch it anytime from My Downloads.";
        tMsg.setText(msg);
        tMsg.setTextColor(Color.WHITE);
        tMsg.setTextSize(15);
        tMsg.setLineSpacing(4 * density, 1f);
        LinearLayout.LayoutParams mp = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        mp.topMargin = (int) (14 * density);

        LinearLayout btnRow = new LinearLayout(act);
        btnRow.setOrientation(LinearLayout.HORIZONTAL);
        LinearLayout.LayoutParams bp = new LinearLayout.LayoutParams(
                0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f);
        bp.topMargin = (int) (20 * density);

        Button no = new Button(act);
        no.setText("Cancel");
        no.setAllCaps(false);
        no.setTextColor(Color.parseColor("#BBBBBB"));
        no.setBackgroundDrawable(themedButtonBg("#1E1E24"));
        LinearLayout.LayoutParams noP = new LinearLayout.LayoutParams(bp);
        noP.rightMargin = (int) (10 * density);

        Button yes = new Button(act);
        yes.setText("Download");
        yes.setAllCaps(false);
        yes.setTextColor(Color.WHITE);
        yes.setTypeface(android.graphics.Typeface.DEFAULT_BOLD);
        yes.setBackgroundDrawable(themedButtonBg("#E50914"));

        btnRow.addView(no, noP);
        btnRow.addView(yes, new LinearLayout.LayoutParams(bp));
        right.addView(tTitle);
        right.addView(tMsg, mp);
        right.addView(btnRow, new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT));
        box.addView(pv, pvLp);
        box.addView(right, new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT, 1f));

        final Dialog d = new Dialog(act);
        d.getWindow().setBackgroundDrawable(card);
        d.setContentView(box);
        int width = (int) (act.getResources().getDisplayMetrics().widthPixels * 0.86f);
        d.getWindow().setLayout(width, android.view.ViewGroup.LayoutParams.WRAP_CONTENT);

        no.setOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View v) { d.dismiss(); }
        });
        yes.setOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View v) {
                d.dismiss();
                enqueueDownload(android.net.Uri.parse(url), title, quality, poster, subUrl);
            }
        });
        d.show();
    }

    private GradientDrawable themedButtonBg(String fill) {
        GradientDrawable g = new GradientDrawable();
        g.setColor(Color.parseColor(fill));
        g.setCornerRadius(12f * act.getResources().getDisplayMetrics().density);
        return g;
    }

    // =======================================================================
    //  ENQUEUE (PRIVATE STORAGE + RANDOM FILENAMES)
    //  Files land in the app PRIVATE dir:
    //    Android/data/com.deymflix.eu.cc/files/Movies/Deymflix
    //  Invisible to gallery and VLC, removed on uninstall. ANTI-COPY: random
    //  names (dfx_x7k2m9q4.mp4) -- no movie titles outside the app.
    // =======================================================================
    private void enqueueDownload(final android.net.Uri uri, final String title, final String quality, final String poster, final String subUrl) {
        try {
            DownloadManager.Request req = new DownloadManager.Request(uri);
            // HIDDEN: nothing in the notification shade -- progress lives on
            // the My Downloads screen instead.
            req.setNotificationVisibility(DownloadManager.Request.VISIBILITY_HIDDEN);
            req.setTitle("DEYMFLIX");
            req.setDescription("Saving for offline viewing");
            String fileName = "dfx_" + randomToken86() + ".mp4";
            File dir = new File(act.getExternalFilesDir(Environment.DIRECTORY_MOVIES), "Deymflix");
            dir.mkdirs();
            req.setDestinationUri(android.net.Uri.fromFile(new File(dir, fileName)));
            req.setMimeType("video/mp4");
            final String subName = fileName.replace(".mp4", ".srt");
            DownloadManager dm = (DownloadManager) act.getSystemService(Context.DOWNLOAD_SERVICE);
            final long newId = dm.enqueue(req);
            saveDlMeta86(newId, title, poster, subName);
            Toast.makeText(act.getApplicationContext(),
                    "Downloading " + title + " -- track it on My Downloads",
                    Toast.LENGTH_LONG).show();
            // The subtitle travels WITH the movie (same folder, same name .srt)
            if (subUrl != null && subUrl.length() > 0) {
                enqueueSubtitleDownload(dm, subUrl, subName, newId);
            }
        } catch (Exception e) {
            Toast.makeText(act.getApplicationContext(),
                    "Download failed: " + e.getMessage(), Toast.LENGTH_LONG).show();
        }
    }

    private void enqueueSubtitleDownload(DownloadManager dm, final String subUrl, final String subName, final long videoId) {
        try {
            DownloadManager.Request sreq = new DownloadManager.Request(android.net.Uri.parse(subUrl));
            sreq.setNotificationVisibility(DownloadManager.Request.VISIBILITY_HIDDEN);
            sreq.setTitle("DEYMFLIX");
            sreq.setDescription("Subtitles for offline viewing");
            File dir = new File(act.getExternalFilesDir(Environment.DIRECTORY_MOVIES), "Deymflix");
            dir.mkdirs();
            sreq.setDestinationUri(android.net.Uri.fromFile(new File(dir, subName)));
            sreq.setMimeType("application/x-subrip");
            long sid = dm.enqueue(sreq);
            // Link the subtitle row to its video id so cleanup follows the video
            SharedPreferences p = act.getSharedPreferences("deymflix_dl", 0);
            p.edit().putString("subsister_" + String.valueOf(sid), String.valueOf(videoId)).apply();
        } catch (Exception e2) { }
    }

    // =======================================================================
    //  LOCAL SUBTITLE MATCHING (mirrors player.html)
    // =======================================================================
    private String normalizeSubNameForSub(String s) {
        String out = (s == null ? "" : s).toLowerCase();
        out = out.replaceAll("[^A-Za-z0-9 ]", "");
        out = out.replaceAll("[._\\-]+", " ");
        out = out.replaceAll("\\s+", " ").trim();
        return out;
    }

    private boolean subNameMatchesMovie(String fileName, String title, int episodeNum) {
        String[] parts = String.valueOf(fileName).split("/");
        String dir = "";
        for (int i = 0; i < parts.length - 1; i++) {
            if (i > 0) dir = dir + " ";
            dir = dir + parts[i];
        }
        String base = parts[parts.length - 1];
        String f = normalizeSubNameForSub(base);
        String dd = normalizeSubNameForSub(dir);
        if (f.length() == 0) return false;
        String t = normalizeSubNameForSub(title);
        if (t.length() == 0) return false;
        // Other-episode guard: "... ep3" must never match a download of ep2
        if (episodeNum > 0) {
            java.util.regex.Matcher mm = java.util.regex.Pattern.compile("\\b(?:ep?\\.?\\s*)(\\d{1,2})\\b").matcher(f);
            while (mm.find()) {
                int n = 0;
                try { n = Integer.parseInt(mm.group(1)); } catch (Exception eNum) { n = 0; }
                if (n > 0 && n != episodeNum) return false;
            }
        }
        String hay = dd.length() > 0 ? dd + " " + f : f;
        if (hay.indexOf(t) != -1) return true;
        return t.indexOf(f) != -1;
    }

    // English (Engsub) first, then Tagalog (PHsub), then unlabeled.
    private int localSubLangRank(String fileName) {
        String f = String.valueOf(fileName).toLowerCase();
        if (f.indexOf("engsub") != -1) return 0;
        if (f.endsWith("-en.srt")) return 0;
        if (f.indexOf(".en.") != -1) return 0;
        if (f.indexOf("phsub") != -1) return 1;
        if (f.indexOf("tagalog") != -1) return 1;
        return 2;
    }

    private String findSubUrlForMovie(final String title, final int episodeNum) {
        try {
            String manifestUrl = "https://deymflix.eu.cc/subtitles/manifest.json";
            URL u = new URL(manifestUrl);
            HttpURLConnection c = (HttpURLConnection) u.openConnection();
            c.setConnectTimeout(8000);
            c.setReadTimeout(8000);
            c.setRequestProperty("User-Agent", "DeymflixApp/1.4");
            java.io.BufferedReader br = new java.io.BufferedReader(new java.io.InputStreamReader(c.getInputStream(), "UTF-8"));
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = br.readLine()) != null) sb.append(line);
            br.close();
            c.disconnect();
            String json = sb.toString();
            String best = "";
            int bestRank = 99;
            int idx = json.indexOf("\"files\"");
            if (idx < 0) return "";
            int arrStart = json.indexOf('[', idx);
            int arrEnd = json.indexOf(']', arrStart);
            if (arrStart < 0) return "";
            if (arrEnd < 0) return "";
            String arr = json.substring(arrStart + 1, arrEnd);
            // Pull the quoted strings out of the array (no JSON parser needed)
            String[] pieces = arr.split("\"");
            for (int pi = 1; pi < pieces.length; pi += 2) {
                String name = pieces[pi];
                if (!subNameMatchesMovie(name, title, episodeNum)) continue;
                int rank = localSubLangRank(name);
                if (rank < bestRank) { bestRank = rank; best = name; }
            }
            if (best.length() == 0) return "";
            return "https://deymflix.eu.cc/subtitles/" + java.net.URLEncoder.encode(best, "UTF-8").replace("%2F", "/");
        } catch (Exception e) {
            return "";
        }
    }

    // Random 8-char lowercase token for anonymous download filenames
    private String randomToken86() {
        String alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
        java.util.Random r = new java.util.Random();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 8; i++) {
            sb.append(alphabet.charAt(r.nextInt(alphabet.length())));
        }
        return sb.toString();
    }

    // =======================================================================
    //  SMALL HELPERS
    // =======================================================================
    private String humanSize(long bytes) {
        if (bytes <= 0) return "-";
        double b = bytes;
        String[] units = { "B", "KB", "MB", "GB" };
        int i = 0;
        while (b >= 1024 && i < units.length - 1) { b /= 1024; i++; }
        return String.format(Locale.US, "%.1f %s", b, units[i]);
    }

    private String guessTitleFromUrl(String url) {
        try {
            String path = android.net.Uri.parse(url).getLastPathSegment();
            if (path == null) return "Video";
            path = java.net.URLDecoder.decode(path, "UTF-8");
            int dot = path.lastIndexOf('.');
            if (dot > 0) {
                return path.substring(0, dot).replace('.', ' ').replace('_', ' ').replace('-', ' ').trim();
            }
            return path;
        } catch (Exception e) { return "Video"; }
    }

    // =======================================================================
    //  POSTER (confirm dialog) + DOWNLOAD REGISTRY
    //  Same "deymflix_dl" prefs the Downloads screen reads.
    // =======================================================================
    private static final HashMap<String, Bitmap> bitmapCache86 = new HashMap<String, Bitmap>();

    private void loadPosterInto(final ImageView target, final String url, final int wPx, final int hPx) {
        if (url == null) return;
        if (url.length() == 0) return;
        Bitmap cached86 = bitmapCache86.get(url);
        if (cached86 != null) {
            target.setImageBitmap(cached86);
            return;
        }
        new Thread(new Runnable() { @Override public void run() {
            try {
                URL u = new URL(url);
                HttpURLConnection c = (HttpURLConnection) u.openConnection();
                c.setConnectTimeout(8000);
                c.setReadTimeout(8000);
                c.setRequestProperty("User-Agent", "DeymflixApp/1.4");
                InputStream in = new BufferedInputStream(c.getInputStream());
                final Bitmap bmp = BitmapFactory.decodeStream(in);
                in.close();
                c.disconnect();
                if (bmp == null) return;
                final Bitmap scaled = Bitmap.createScaledBitmap(bmp, wPx, hPx, true);
                bitmapCache86.put(url, scaled);
                act.runOnUiThread(new Runnable() { @Override public void run() {
                    try { target.setImageBitmap(scaled); } catch (Exception e) { }
                }});
            } catch (Exception e) { /* keep placeholder */ }
        }}).start();
    }

    private GradientDrawable posterBg() {
        GradientDrawable g = new GradientDrawable();
        g.setColor(Color.parseColor("#1E1E24"));
        g.setCornerRadius(8f * act.getResources().getDisplayMetrics().density);
        return g;
    }

    // Drop registry rows whose download finished more than 7 days ago.
    private void purgeOldDlMeta86() {
        try {
            DownloadManager dm = (DownloadManager) act.getSystemService(Context.DOWNLOAD_SERVICE);
            SharedPreferences p = act.getSharedPreferences("deymflix_dl", 0);
            android.database.Cursor c = dm.query(new DownloadManager.Query().setFilterByStatus(DownloadManager.STATUS_SUCCESSFUL));
            java.util.HashSet<String> live = new java.util.HashSet<String>();
            if (c != null) {
                while (c.moveToNext()) {
                    long id = c.getLong(c.getColumnIndexOrThrow(DownloadManager.COLUMN_ID));
                    long when = c.getLong(c.getColumnIndexOrThrow(DownloadManager.COLUMN_LAST_MODIFIED_TIMESTAMP)) * 1000L;
                    if (System.currentTimeMillis() - when < 604800000L) live.add(String.valueOf(id));
                }
                c.close();
            }
            SharedPreferences.Editor ed = p.edit();
            boolean changed = false;
            for (java.util.Map.Entry<String, ?> e : p.getAll().entrySet()) {
                String k = String.valueOf(e.getKey());
                if (k.startsWith("subsister_")) continue;
                if (!live.contains(k)) { ed.remove(k); changed = true; }
            }
            // Drop subtitle-link rows whose VIDEO row is gone
            for (java.util.Map.Entry<String, ?> e : p.getAll().entrySet()) {
                String k = String.valueOf(e.getKey());
                if (!k.startsWith("subsister_")) continue;
                String vid = String.valueOf(e.getValue());
                if (!live.contains(vid)) { ed.remove(k); changed = true; }
            }
            if (changed) ed.apply();
        } catch (Exception e2) { }
    }

    // id -> "title[POSTER-url][SUB-name]" in app-private prefs
    private void saveDlMeta86(long id, String title, String poster, String subName) {
        SharedPreferences p = act.getSharedPreferences("deymflix_dl", 0);
        String cleanTitle = (title == null ? "Video" : title).split("\n")[0];
        p.edit().putString(String.valueOf(id),
                cleanTitle + "[POSTER]" + (poster == null ? "" : poster)
                + "[SUB]" + (subName == null ? "" : subName)).apply();
    }
}
