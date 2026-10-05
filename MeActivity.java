// ===========================================================================
//  DEYMFLIX -- MeActivity.java        (v1.7, native Me screen)
// ===========================================================================
//  WHAT THIS IS
//    The Me tab as a REAL activity, the same way the Downloads screen is
//    (DownloadsActivity). The bar in this app is Home / Reels / Explore /
//    History / Me, and Me opens here -- red theme, like the rest of the app.
//
//  WHAT IT CONTAINS
//    - a WebView with the Me page (me.html?native=1): sign in / create account
//      / Google login (the phone's own account picker), account header,
//      watch-history gate, Continue Watching carousel, My list, Download
//      (-> the native DownloadsActivity), download settings and
//      "Diagnostics you can send"
//    - a native bottom bar with the same five tabs as the site's bar, so the
//      layout never shifts between the shell and this screen
//    - the same JS bridge names the page already talks to, implemented on
//      top of MainScreen85's helpers so both screens answer identically
//
//  WHY A WEBVIEW
//    The Me screen is the one place that must show live site data (history,
//    posters, list). Hosting the existing page keeps one source of truth for
//    that UI; the bar is native so this screen is a real activity with the
//    app's own navigation.
//  100% ASCII.
// ===========================================================================
package com.deymflix.eu.cc;

import android.content.Intent;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.Typeface;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;

public class MeActivity extends AppCompatActivity {

    private static final String ME_URL = "https://deymflix.eu.cc/me.html?native=1&src=activity";

    // Cache-busting, same idea as the shell activity: Cloudflare keeps the
    // page in the WebView cache for minutes-to-hours, and a Me screen frozen
    // on the retired layout after a site deploy is exactly what users saw.
    private String meUrl() {
        int code = 1;
        try {
            code = getPackageManager().getPackageInfo(getPackageName(), 0).versionCode;
        } catch (Throwable t) { }
        return ME_URL + "&dfxb=" + code + "." + (System.currentTimeMillis() / 3600000L);
    }
    private static final int RED = 0xFFE50914;
    private static final int DIM = 0xFF888888;   // the site's inactive tab colour
    private static final int BG = 0xFF0B0B0F;

    // Same five tabs, same order, as the site's bar (Home, Reels, Explore,
    // History, Me). Me is the active one here; the rest hand the route back to
    // the shell activity, reusing the single MainActivity instance.
    private static final String[] LABELS = { "Home", "Reels", "Explore", "History", "Me" };
    private static final String[] ROUTES = { "index.html", "reels.html", "explore.html", "history.html", null };

    // Geometry copied from the site's own <svg> markup (index.html dock), so the
    // native bar draws the identical five icons instead of lookalikes: the same
    // 24-unit viewBox, 2-unit strokes and the SAME shapes -- including the rounded
    // Reels frame (rx 2.18) the old hand-made paths had squared off, and the two
    // arcs written out explicitly so every parser draws a full circle.
    private static final String P_HOME =
            "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10";
    private static final String P_REELS =
            "M4.18 2h15.64a2.18 2.18 0 0 1 2.18 2.18v15.64a2.18 2.18 0 0 1-2.18 2.18H4.18"
          + "a2.18 2.18 0 0 1-2.18-2.18V4.18a2.18 2.18 0 0 1 2.18-2.18z"
          + " M7 2V22 M17 2V22 M2 12H22 M2 7h5 M2 17h5 M17 17h5 M17 7h5";
    private static final String P_EXPLORE =
            "M11 3a8 8 0 1 0 0 16a8 8 0 1 0 0-16z M16.65 16.65L21 21";
    private static final String P_HISTORY =
            "M12 2a10 10 0 1 0 0 20a10 10 0 1 0 0-20z M12 6V12l4 2";
    private static final String P_ME =
            "M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10z M4 21v-1c0-2.76 3.58-5 8-5s8 2.24 8 5v1";

    private static final String[] PATHS = { P_HOME, P_REELS, P_EXPLORE, P_HISTORY, P_ME };

    private WebView web;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        float d = getResources().getDisplayMetrics().density;

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(BG);

        web = buildWebView();
        root.addView(web, new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, 0, 1f));

        // The dock is the SITE's dock, not a flat native strip: it floats as a
        // rounded pill with 16px side and bottom margins (see buildBar), so the
        // pill itself carries the spacing -- no hairline above it any more.
        root.addView(buildBar(d), new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT));

        setContentView(root);
        web.loadUrl(meUrl());
        MainScreen85.log85("nav", "Me screen opened");
    }

    // ── the WebView: app-mode contract, exactly like the shell ─────────────
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
        // The site detects the app (and the exact build) from this token.
        String baseUa = s.getUserAgentString();
        if (baseUa != null && !baseUa.contains("DeymflixApp")) {
            String code = "1";
            try {
                code = String.valueOf(getPackageManager()
                        .getPackageInfo(getPackageName(), 0).versionCode);
            } catch (Throwable t) { }
            s.setUserAgentString(baseUa + " DeymflixApp/" + code);
        }
        wv.setBackgroundColor(BG);
        wv.addJavascriptInterface(new MeBridge(), "DeymflixApp");
        wv.setWebChromeClient(new WebChromeClient());
        wv.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView v, String url) {
                // Never leave the app from the Me screen: our own pages load,
                // everything else (ads, popunders) is dropped.
                if (url == null) return false;
                return !url.startsWith("https://deymflix.eu.cc/");
            }
        });
        return wv;
    }

    // ── the dock: an exact copy of the site's floating pill ────────────────
    // style.css: .bottom-nav = 16px side/bottom margins, 28px radius, 6px vertical
    // padding, rgba(22,22,22,.75) over a 1px rgba(255,255,255,.12) border.
    // .bottom-nav-item = 6px 2px padding, 4px gap, 22px stroked icon, 9.6px
    // semibold label; the ACTIVE tab is brand red and carries the 20x3 red
    // indicator across its top edge.
    private LinearLayout buildBar(float d) {
        LinearLayout outer = new LinearLayout(this);
        outer.setOrientation(LinearLayout.VERTICAL);
        outer.setBackgroundColor(Color.TRANSPARENT);
        outer.setPadding((int) (16 * d), 0, (int) (16 * d), (int) (16 * d));

        LinearLayout bar = new LinearLayout(this);
        bar.setOrientation(LinearLayout.HORIZONTAL);
        android.graphics.drawable.GradientDrawable pill =
                new android.graphics.drawable.GradientDrawable();
        pill.setColor(0xE6161616);                       // rgba(22,22,22,.75) over dark
        pill.setCornerRadius(28 * d);
        pill.setStroke(Math.max(1, (int) d), 0x1FFFFFFF); // 1px white @ 12%
        bar.setBackground(pill);
        bar.setPadding(0, (int) (6 * d), 0, (int) (6 * d));

        for (int i = 0; i < LABELS.length; i++) {
            final int idx = i;
            boolean active = ROUTES[i] == null;          // Me
            LinearLayout tab = new LinearLayout(this);
            tab.setOrientation(LinearLayout.VERTICAL);
            tab.setGravity(Gravity.CENTER);
            tab.setClickable(true);
            tab.setPadding((int) (2 * d), (int) (6 * d), (int) (2 * d), (int) (6 * d));
            tab.setOnClickListener(new View.OnClickListener() {
                @Override public void onClick(View v) { go(ROUTES[idx]); }
            });

            // the site's active marker: 20px wide, 3px tall, red, on the top edge
            View marker = new View(this);
            if (active) {
                android.graphics.drawable.GradientDrawable md =
                        new android.graphics.drawable.GradientDrawable();
                md.setColor(RED);
                md.setCornerRadius(2 * d);
                marker.setBackground(md);
            }
            tab.addView(marker, new LinearLayout.LayoutParams(
                    (int) (20 * d), Math.max(1, (int) (3 * d))));

            NavIcon icon = new NavIcon(this, PATHS[i], active ? RED : DIM, 22 * d);
            LinearLayout.LayoutParams ip = new LinearLayout.LayoutParams(
                    (int) (22 * d), (int) (22 * d));
            tab.addView(icon, ip);   // the 3dp marker above already supplies the gap

            TextView label = new TextView(this);
            label.setText(LABELS[i]);
            label.setTextSize(9.6f);                     // 0.6rem on the site
            label.setLetterSpacing(0.03f);               // 0.3px
            label.setIncludeFontPadding(false);          // Android's extra font box would
            label.setTypeface(Typeface.DEFAULT_BOLD);    // make the pill taller than the site's
            label.setTextColor(active ? RED : DIM);
            label.setSingleLine(true);
            label.setGravity(Gravity.CENTER);
            LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.WRAP_CONTENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT);
            lp.topMargin = (int) (4 * d);                // the site's 4px gap
            tab.addView(label, lp);

            bar.addView(tab, new LinearLayout.LayoutParams(0,
                    LinearLayout.LayoutParams.WRAP_CONTENT, 1f));
        }
        outer.addView(bar, new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT));
        return outer;
    }

    // Tab taps: the shell loads the requested page (single instance), this
    // screen steps out of the way so the back stack stays flat.
    private void go(String route) {
        if (route == null) {
            try { web.reload(); } catch (Throwable t) { }
            return;
        }
        // Preferred: hand the route to the shell that is already alive
        // underneath. Same activity, same WebView -- the page swaps in place and
        // Me closes, so no loading splash is replayed (it used to restart the
        // whole shell and replay the logo on every tab tap).
        if (MainScreen85.navigateFromMe(this, route)) {
            finish();
            overridePendingTransition(0, 0);
            return;
        }
        try {
            Intent it = new Intent();
            it.setClassName(this, getPackageName() + ".MainActivity");
            it.putExtra("dfx_route", route);
            // No live shell to reuse: a fresh one still must not replay the logo.
            it.putExtra("dfx_nosplash", true);
            it.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
            startActivity(it);
            finish();
            overridePendingTransition(0, 0);
        } catch (Throwable t) {
            MainScreen85.log85("nav", "could not open " + route);
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        // the Google account picker answers here
        MainScreen85.onActivityResult(this, requestCode, resultCode, data);
    }

    @Override
    public void onBackPressed() {
        // back leaves the Me screen exactly like the Downloads screen does
        finish();
    }

    // NOTE: no reload on resume. Coming back from the account picker must land
    // on the very same page instance, or the picked address would be lost.

    // =======================================================================
    //  JS BRIDGE -- the same names me.html/apponly.js already call
    // =======================================================================
    private final class MeBridge {
        @android.webkit.JavascriptInterface
        public void openDownloads() {
            runOnUiThread(new Runnable() { @Override public void run() {
                MainScreen85.openDownloads85(MeActivity.this);
            }});
        }
        @android.webkit.JavascriptInterface
        public String getDownloadPrefs() {
            return MainScreen85.downloadPrefsJson(MeActivity.this);
        }
        @android.webkit.JavascriptInterface
        public void setDownloadPrefs(final String quality, final boolean wifiOnly) {
            runOnUiThread(new Runnable() { @Override public void run() {
                MainScreen85.setDownloadPrefs85(MeActivity.this, quality, wifiOnly);
            }});
        }
        @android.webkit.JavascriptInterface
        public String getDiagnostics(final String extra) {
            try { return MainScreen85.diagnosticsJson(MeActivity.this, extra); }
            catch (Throwable t) { return "{}"; }
        }
        @android.webkit.JavascriptInterface
        public String getLogs() {
            try { return MainScreen85.logsText85(); } catch (Throwable t) { return ""; }
        }
        @android.webkit.JavascriptInterface
        public void copyText(final String label, final String text) {
            runOnUiThread(new Runnable() { @Override public void run() {
                try { MainScreen85.copy85(MeActivity.this, label, text); } catch (Throwable t) { }
            }});
        }
        @android.webkit.JavascriptInterface
        public String getAppInfo() {
            try { return MainScreen85.appInfoJson85(MeActivity.this); }
            catch (Throwable t) { return "{}"; }
        }
        @android.webkit.JavascriptInterface
        public String getGoogleAccounts() {
            try { return MainScreen85.googleAccountsJson(MeActivity.this); }
            catch (Throwable t) { return "[]"; }
        }
        @android.webkit.JavascriptInterface
        public String requestAccounts() {
            try { return MainScreen85.askAccounts85(MeActivity.this); }
            catch (Throwable t) { return "unavailable"; }
        }
        @android.webkit.JavascriptInterface
        public void pickGoogleAccount() {
            runOnUiThread(new Runnable() { @Override public void run() {
                try { MainScreen85.pickGoogleAccount(MeActivity.this); } catch (Throwable t) { }
            }});
        }
        @android.webkit.JavascriptInterface
        public String takeGoogleEmail() {
            return MainScreen85.takeGoogleEmail85();
        }
        @android.webkit.JavascriptInterface
        public boolean hasMic() {
            try { return MainScreen85.hasMic85(MeActivity.this); } catch (Throwable t) { return false; }
        }
        @android.webkit.JavascriptInterface
        public void log(final String tag, final String msg) {
            try { MainScreen85.log85(tag, msg); } catch (Throwable t) { }
        }
        @android.webkit.JavascriptInterface
        public void openMe() {
            // already here
        }
    }

    // =======================================================================
    //  NAV ICON -- stroked paths, so the icons match the site's SVGs exactly
    // =======================================================================
    private static final class NavIcon extends View {
        private final Path path = new Path();
        private final Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);

        NavIcon(android.content.Context c, String pathData, int color, float size) {
            super(c);
            try {
                Path p = androidx.core.graphics.PathParser.createPathFromPathData(pathData);
                if (p != null) path.set(p);
            } catch (Throwable t) { }
            paint.setStyle(Paint.Style.STROKE);
            // The path lives in the site's 24-unit viewBox and the canvas below
            // scales it to the view, so the stroke is 2 UNITS like the SVG's
            // stroke-width="2" -- it is scaled by the same factor. (Doing it in
            // pixels double-scaled the line: 13px thick instead of 5px, which is
            // why the old icons looked like fat blobs next to the site's.)
            paint.setStrokeWidth(2f);
            paint.setStrokeCap(Paint.Cap.ROUND);
            paint.setStrokeJoin(Paint.Join.ROUND);
            paint.setColor(color);
        }

        @Override
        protected void onDraw(Canvas canvas) {
            super.onDraw(canvas);
            int w = getWidth(), h = getHeight();
            // No padding: the site's icons keep a 1-unit margin inside the
            // viewBox, so a 2-unit stroke still lands inside the 22px box.
            canvas.save();
            canvas.scale(w / 24f, h / 24f);
            canvas.drawPath(path, paint);
            canvas.restore();
        }
    }
}
