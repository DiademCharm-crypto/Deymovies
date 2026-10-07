// ===========================================================================
//  DEYMFLIX -- PlayerActivity.java        (v1.7 r22, native player shell)
// ===========================================================================
//  WHAT THIS IS
//    The app's player, as a REAL activity: the full screen is one WebView
//    that loads player-lite.html -- the player page with the website shell
//    taken out (no app.js, no catalog/episode files, no watch-party, no
//    seasonal theme; its data comes from play-index.js instead). Same layout,
//    same controls, same streams as player.html, without waiting for the
//    whole site.
//
//    NO NATIVE HEADER. r22 drew a native bar ("<" + the title) above the
//    WebView, which sat on top of the player's OWN top bar and showed the
//    title twice. The page's video controls already carry a working "<" back
//    button, so that is the only back control now: tapping it calls
//    DeymflixApp.closePlayer(), which finishes this activity and reveals
//    whatever screen started it. The Android back gesture/key does the same.
//    The title the page resolves is still reported through dfxTitle(), purely
//    for the diagnostics log and for the "streaming only" dialog wording.
//
//  WHY
//    Tapping a title used to load player.html inside the shell's WebView, so
//    app.js (645 KB) plus nine more files had to download and run before the
//    first frame of the video page. PlayerActivity's WebView loads one small
//    page plus one data file, and the bar around it is native -- the same
//    shape as the Me screen the owner asked to match.
//
//  WHAT IT KEEPS
//    - the page's own controls (info/cast/trailer tabs, episodes, bookmarks,
//      "More Like This" rail, subtitles, CinemaOS/embed handling: all of it)
//    - the app's signal path through the SAME implementations the shell uses:
//      the download engine (DlSpeed85 + MainScreen85's checks), the native
//      player handoff (LocalPlayer85) and the streaming-only gate
//    - app mode: the WebView user agent carries "DeymflixApp/<versionCode>",
//      which is what makes the page behave like the app (DFX_IS_APP, the
//      Download button, screen-recording protection)
//
//  NAVIGATION
//    - the rail's "More Like This" cards (player.html?id=...) reload THIS
//      activity's WebView with the new id
//    - any other page of our site (index.html, me.html...) hands over to the
//      shell activity, which owns those pages
//    - everything else is dropped: the player never leaves deymflix.eu.cc
//  100% ASCII.
// ===========================================================================
package com.deymflix.eu.cc;

import android.annotation.SuppressLint;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.pm.ActivityInfo;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

public class PlayerActivity extends AppCompatActivity {

    private static final String LITE_PAGE = "https://deymflix.eu.cc/player-lite.html";
    private static final int BG = 0xFF0B0B0F;
    private static final String EXTRA_QUERY = "dfx_query";

    private WebView web;
    private volatile boolean appFullscreen = false;
    private String query = "";
    private String lastTitle = "";

    // ── entry point: called by the shell when the page wants player.html ────
    public static void open(final android.app.Activity from, final String playerUrl) {
        if (from == null) return;
        Intent it = new Intent(from, PlayerActivity.class);
        it.putExtra(EXTRA_QUERY, queryOf(playerUrl));
        from.startActivity(it);
        try { from.overridePendingTransition(0, 0); } catch (Throwable t) { }
    }

    // "player.html?id=X&s=1&ep=2&dfxb=22.12" -> "id=X&s=1&ep=2"
    private static String queryOf(String url) {
        try {
            if (url == null) return "";
            int i = url.indexOf('?');
            String q = i < 0 ? "" : url.substring(i + 1);
            StringBuilder keep = new StringBuilder();
            for (String part : q.split("&")) {
                if (part.length() == 0) continue;
                if (part.startsWith("dfxb=")) continue;      // the shell's page token
                if (keep.length() > 0) keep.append('&');
                keep.append(part);
            }
            return keep.toString();
        } catch (Throwable t) {
            return "";
        }
    }

    private String buildCode() {
        try {
            return String.valueOf(getPackageManager().getPackageInfo(getPackageName(), 0).versionCode);
        } catch (Throwable t) {
            return "1";
        }
    }

    // Cloudflare keeps HTML in the WebView cache for minutes; the same
    // hour-stamped token the shell uses means a site deploy reaches the player
    // without waiting for it to expire.
    private String liteUrl(String q) {
        String base = LITE_PAGE + (q == null || q.length() == 0 ? "?" : "?" + q + "&");
        return base + "dfxb=" + buildCode() + "." + (System.currentTimeMillis() / 3600000L);
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        if (getIntent() != null && getIntent().getStringExtra(EXTRA_QUERY) != null) {
            query = getIntent().getStringExtra(EXTRA_QUERY);
        }

        // No native header: the player's own controls are the chrome. The
        // WebView is the whole screen, exactly like the page looks in a
        // browser -- which is also why the title is no longer drawn twice.
        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(BG);

        web = buildWebView();
        root.addView(web, new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT));

        setContentView(root);
        web.loadUrl(liteUrl(query));
        MainScreen85.log85("nav", "Player screen opened (" + (query.length() == 0 ? "no id" : query) + ")");
    }

    // ── the WebView: the shell's app-mode contract, one page lighter ───────
    @SuppressLint("SetJavaScriptEnabled")
    private WebView buildWebView() {
        WebView wv = new WebView(this);
        WebSettings s = wv.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setLoadWithOverviewMode(true);
        s.setUseWideViewPort(true);
        s.setSupportZoom(false);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);
        s.setSupportMultipleWindows(false);
        s.setJavaScriptCanOpenWindowsAutomatically(false);
        try { s.setAllowFileAccess(false); } catch (Throwable t) { }
        try { s.setAllowContentAccess(false); } catch (Throwable t) { }
        try { s.setSafeBrowsingEnabled(true); } catch (Throwable t) { }
        // The site reads the app (and the installed build) out of this token;
        // player-lite.html sets DFX_IS_APP from it exactly like app.js does.
        String baseUa = s.getUserAgentString();
        if (baseUa != null && !baseUa.contains("DeymflixApp")) {
            s.setUserAgentString(baseUa + " DeymflixApp/" + buildCode());
        }
        wv.setBackgroundColor(BG);
        wv.addJavascriptInterface(new PlayerBridge(), "DeymflixApp");
        // Console errors land in the app's diagnostics log, so a copied report
        // from the player screen is as useful as one from the shell.
        wv.setWebChromeClient(new android.webkit.WebChromeClient() {
            @Override
            public boolean onConsoleMessage(android.webkit.ConsoleMessage cm) {
                try {
                    if (cm != null && cm.messageLevel()
                            == android.webkit.ConsoleMessage.MessageLevel.ERROR) {
                        MainScreen85.log85("js:player", cm.message() + " @" + cm.lineNumber());
                    }
                } catch (Throwable t) { }
                return false;
            }
        });
        wv.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView v, String url) {
                return route(url);
            }
            @Override
            public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest req) {
                return route(req.getUrl() == null ? "" : req.getUrl().toString());
            }
            @Override
            public void onPageFinished(WebView v, String url) {
                hookTitle(v);
            }
        });
        return wv;
    }

    // ── navigation: our player (reload here), our site (hand to the shell) ──
    private boolean route(String url) {
        try {
            if (url == null || url.length() == 0) return true;
            android.net.Uri u = android.net.Uri.parse(url);
            String scheme = u.getScheme() == null ? "" : u.getScheme().toLowerCase();
            String host = u.getHost() == null ? "" : u.getHost().toLowerCase();
            if (host.equals("deymflix.eu.cc") || host.endsWith(".deymflix.eu.cc")) {
                String path = u.getPath() == null ? "" : u.getPath();
                if (path.indexOf("player.html") >= 0 || path.indexOf("player-lite.html") >= 0) {
                    // another title from the rail / a shared link: same screen,
                    // new id -- no extra activity on the back stack
                    loadQuery(queryOf(url));
                    return true;
                }
                String route = path.replace("/", "");
                if (route.length() > 0 && route.endsWith(".html")) {
                    leaveTo(route);
                    return true;
                }
                return true;
            }
            if (scheme.equals("about") || scheme.equals("data") || scheme.equals("blob")
                    || scheme.equals("javascript") || scheme.equals("file")) {
                return false;              // in-page bits stay functional
            }
        } catch (Throwable t) { }
        return true;                       // never leave the app from here
    }

    private void loadQuery(final String q) {
        query = q == null ? "" : q;
        try {
            runOnUiThread(new Runnable() { @Override public void run() {
                try { web.loadUrl(liteUrl(query)); } catch (Throwable t) { }
            }});
        } catch (Throwable t) { }
    }

    // Another title opened while this screen is already up (singleTop).
    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        try {
            if (intent != null && intent.getStringExtra(EXTRA_QUERY) != null) {
                setIntent(intent);
                loadQuery(intent.getStringExtra(EXTRA_QUERY));
            }
        } catch (Throwable t) { }
    }

    // ── the page reports the resolved title (log + dialog wording only) ────
    private void hookTitle(WebView wv) {
        String js = "(function(){try{"
                + "if(window.__dfxBarTitle)return;window.__dfxBarTitle=1;"
                + "var el=document.getElementById('current-title');"
                + "if(!el)return;"
                + "var push=function(){try{DeymflixApp.dfxTitle(el.textContent||'');}catch(e){}};"
                + "push();"
                + "try{new MutationObserver(push).observe(el,{childList:true,characterData:true,subtree:true});}catch(e2){}"
                + "}catch(e){}})();";
        try { wv.evaluateJavascript(js, null); } catch (Throwable t) { }
    }

    // ── leaving: the shell owns the website, so it gets the pages ─────────
    private void leave() {
        finish();
        overridePendingTransition(0, 0);
    }

    private void leaveTo(final String route) {
        try {
            Intent it = new Intent();
            it.setClassName(this, getPackageName() + ".MainActivity");
            it.putExtra("dfx_route", route);
            it.putExtra("dfx_nosplash", true);
            it.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            startActivity(it);
        } catch (Throwable t) {
            try { MainScreen85.log85("nav", "hand back failed: " + t.getMessage()); } catch (Throwable t2) { }
        }
        finish();
        overridePendingTransition(0, 0);
    }

    @Override
    public void onBackPressed() {
        leave();
    }

    @Override
    protected void onPause() {
        super.onPause();
        try { if (web != null) web.onPause(); } catch (Throwable t) { }
    }

    @Override
    protected void onResume() {
        super.onResume();
        try { if (web != null) web.onResume(); } catch (Throwable t) { }
    }

    @Override
    protected void onDestroy() {
        try {
            if (web != null) {
                try { web.loadUrl("about:blank"); } catch (Throwable t) { }
                try { ((ViewGroup) web.getParent()).removeView(web); } catch (Throwable t) { }
                web.destroy();
                web = null;
            }
        } catch (Throwable t) { }
        super.onDestroy();
    }

    // ── fullscreen: landscape + immersive + the page pinned over everything ─
    private void setAppFullscreen(final boolean enter) {
        try {
            if (enter) {
                appFullscreen = true;
                setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE);
                android.view.Window w = getWindow();
                w.addFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN);
                w.getDecorView().setSystemUiVisibility(
                        View.SYSTEM_UI_FLAG_FULLSCREEN
                        + View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        + View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                        + View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                        + View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                        + View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
                MainScreen85.jsClassToggle85(web, true);
            } else {
                appFullscreen = false;
                setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
                android.view.Window w = getWindow();
                w.clearFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN);
                w.getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_VISIBLE);
                MainScreen85.jsClassToggle85(web, false);
            }
        } catch (Throwable t) { }
    }

    private void toast(final String msg) {
        try { Toast.makeText(getApplicationContext(), msg, Toast.LENGTH_SHORT).show(); } catch (Throwable t) { }
    }

    private void alert(final String title, final String msg) {
        try {
            new android.app.AlertDialog.Builder(this)
                    .setTitle(title).setMessage(msg).setPositiveButton("OK", null).show();
        } catch (Throwable t) { }
    }

    // "Download unavailable -- this movie/episode is streaming only."
    // Same wording the shell uses (see MainScreen85.showStreamOnlyNamed).
    private void streamOnly(final String title) {
        String t = title == null ? "" : title.trim();
        boolean isEpisode = t.matches("(?s).*\\sep\\d+\\s*$");
        String name = t.replaceAll("\\sep\\d+\\s*$", "").trim();
        String what = isEpisode ? "episode" : (name.length() == 0 ? "title" : "movie");
        String msg = (name.length() == 0)
                ? ("This " + what + " is only available for streaming, so it can't be downloaded.")
                : ("\u201C" + name + "\u201D -- this " + what + " is only available for streaming, so it can't be downloaded.");
        alert("Download unavailable", msg);
    }

    // ── downloads: the SAME engine and gates as the shell ──────────────────
    private void startDownload(final String url, final String title, final String poster) {
        if (url == null || url.length() == 0) {
            toast("This title cannot be downloaded.");
            return;
        }
        if (!MainScreen85.isOwnMediaHost(url)) {
            streamOnly(title);
            return;
        }
        String dup = MainScreen85.alreadyOwnedMessage(title);
        if (dup != null) {
            alert("Already downloaded", dup);
            return;
        }
        if (Build.VERSION.SDK_INT >= 33
                && checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS)
                   != android.content.pm.PackageManager.PERMISSION_GRANTED) {
            try { requestPermissions(new String[]{ android.Manifest.permission.POST_NOTIFICATIONS }, 4101); }
            catch (Throwable t) { }
        }
        if (MainScreen85.wifiHold85(this)) {
            new android.app.AlertDialog.Builder(this)
                    .setTitle("Wi-Fi only is on")
                    .setMessage("Downloads wait for Wi-Fi. You are not on Wi-Fi right now.")
                    .setPositiveButton("Download anyway", new DialogInterface.OnClickListener() {
                        @Override public void onClick(DialogInterface d, int w) {
                            runDownload(url, title, poster);
                        }
                    })
                    .setNegativeButton("Wait for Wi-Fi", null)
                    .show();
            return;
        }
        runDownload(url, title, poster);
    }

    private void runDownload(final String url, final String title, final String poster) {
        try {
            String sub = MainScreen85.findSubUrlForMovie(title, MainScreen85.episodeNumFromTitle(title));
            boolean ok = DlSpeed85.start(this, url, title, poster, sub);
            if (!ok) toast("This title cannot be downloaded right now.");
        } catch (Throwable t) {
            toast("This title cannot be downloaded.");
        }
    }

    // ── native player handoff (same path the shell uses) ───────────────────
    private void launchNativePlayer(String url, String title, String url2) {
        try {
            String use = url == null ? "" : url;
            if (use.startsWith("blob:")) use = url2 == null ? "" : url2;
            if (use.length() == 0) return;      // nothing usable: the page keeps playing
            MainScreen85.log85("player", "native player: " + (title == null ? "" : title));
            Intent it = new Intent();
            it.setClassName(this, getPackageName() + ".LocalplayerActivity");
            it.putExtra("url", use);
            it.putExtra("title", title == null ? "" : title);
            it.putExtra("sub", "");
            String fallback = DlSpeed85.downloadedPathFor(this, title);
            if (fallback != null) it.putExtra("fallback", fallback);
            try {
                startActivity(it);
            } catch (Exception eUpper) {
                it.setClassName(this, getPackageName() + ".LocalPlayerActivity");
                startActivity(it);
            }
        } catch (Throwable t) { }
    }

    private void openDownloads() {
        try {
            Intent it = new Intent();
            it.setClassName(getApplicationContext(), getPackageName() + ".DownloadsActivity");
            startActivity(it);
        } catch (Throwable t) {
            toast("Downloads screen unavailable");
        }
    }

    // =======================================================================
    //  JS BRIDGE -- the names the player page already talks to
    // =======================================================================
    private final class PlayerBridge {

        // The page reports the resolved title. There is no bar to draw any
        // more, so this just remembers it: the "streaming only" dialog names
        // the title, and diagnostics get a readable trace of what played.
        @JavascriptInterface
        public void dfxTitle(final String t) {
            final String title = t == null ? "" : t.trim();
            if (title.length() == 0 || title.equals(lastTitle)) return;
            lastTitle = title;
            try { MainScreen85.log85("player", "title: " + title); } catch (Throwable t2) { }
        }

        // The player's own "<" back control (and anything else in the page
        // that means "leave the player") lands here: finish this activity and
        // reveal the screen that opened it. Same thing the Android back
        // gesture does, so both routes behave identically.
        @JavascriptInterface
        public void closePlayer() {
            runOnUiThread(new Runnable() { @Override public void run() {
                try {
                    MainScreen85.log85("nav", "player closed from the page's own back control"
                            + (lastTitle.length() == 0 ? "" : " (" + lastTitle + ")"));
                } catch (Throwable t) { }
                try { leave(); } catch (Throwable t) { }
            }});
        }

        // Screen-recording / screenshot protection while a movie plays.
        @JavascriptInterface
        public void setSecure(final boolean on) {
            runOnUiThread(new Runnable() { @Override public void run() {
                try {
                    if (on) getWindow().addFlags(WindowManager.LayoutParams.FLAG_SECURE);
                    else getWindow().clearFlags(WindowManager.LayoutParams.FLAG_SECURE);
                } catch (Throwable t) { }
            }});
        }

        // enter = true + isVideo = true: landscape + immersive bars. The page
        // always sends "enter" (a WebView cannot see the exit state), so a tap
        // while already fullscreen means TOGGLE OFF.
        @JavascriptInterface
        public void toggleFullscreen(final boolean enter, final boolean isVideo) {
            runOnUiThread(new Runnable() { @Override public void run() {
                if (enter && !appFullscreen) setAppFullscreen(true);
                else if (!enter && appFullscreen) setAppFullscreen(false);
                else if (enter && appFullscreen) setAppFullscreen(false);
            }});
        }

        // Embeds (CinemaOS and friends) are streaming-only in the app.
        @JavascriptInterface
        public void requestEmbedDownload() {
            runOnUiThread(new Runnable() { @Override public void run() {
                streamOnly(lastTitle);
            }});
        }

        @JavascriptInterface
        public void requestDownload(final String url, final String title,
                                    final String quality, final String poster) {
            runOnUiThread(new Runnable() { @Override public void run() {
                startDownload(url, title, poster);
            }});
        }

        @JavascriptInterface
        public void playOnline(final String url, final String title, final String url2) {
            runOnUiThread(new Runnable() { @Override public void run() {
                launchNativePlayer(url, title, url2);
            }});
        }

        @JavascriptInterface
        public void openDownloads() {
            runOnUiThread(new Runnable() { @Override public void run() {
                PlayerActivity.this.openDownloads();
            }});
        }

        @JavascriptInterface
        public String getDownloadPrefs() {
            try { return MainScreen85.downloadPrefsJson(PlayerActivity.this); }
            catch (Throwable t) { return "{}"; }
        }

        @JavascriptInterface
        public String getAppInfo() {
            try { return MainScreen85.appInfoJson85(PlayerActivity.this); }
            catch (Throwable t) { return "{}"; }
        }

        // The Me tab is the shell's screen; a page that asks for it hands back.
        @JavascriptInterface
        public void openMe() {
            runOnUiThread(new Runnable() { @Override public void run() {
                leaveTo("me.html");
            }});
        }

        // Page console, mirrored into diagnostics like the shell's bridge.
        @JavascriptInterface
        public void log(final String tag, final String msg) {
            try { MainScreen85.log85(tag == null ? "js" : ("js:" + tag), msg == null ? "" : msg); }
            catch (Throwable t) { }
        }
    }
}
