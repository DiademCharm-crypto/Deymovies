# DEYMFLIX Sketchware App — Upgrade Guide (v1.0 → v2.0)

> ## ⚡ v1.3 SHORTCUT — if your only problems are: swipe-refresh dead, spinner
> stuck after swiping, videos stuck on "Buffering… 00:00:00", or back button
> not working → skip everything below and do **STEP 13 (v1.3 FIX PACK)** at the
> bottom of this file. Import `Deymflix v1.3.swb` + paste 3 blocks. Done.

Your app is a WebView wrapper (`com.deymflix.eu.cc`) around your site.
This guide takes it from "browser in a box" to a proper streaming app.

Work through the steps in order. Each one is independent — if one fails,
the app still builds with everything before it.

> **Import `Deymflix v1.3.swb`** — same compile fix as v1.2 (empty manifest
> injection) plus the v1.3 fix-pack instructions in its compile log.

---

## STEP 0 — Fix the compile error (ALREADY DONE FOR YOU)

**File: `Deymflix v1.1 (compile-fixed).swb` (in your Deymflix folder) already contains this fix.**
Import it in Sketchware: Project menu → **Import .swb** → pick that file → open the project.

What was wrong: Manifest Injection set `android:theme="@style/AppTheme"` on the
application tag, but Sketchware already applies that theme — duplicate attribute,
build fails at AndroidManifest.xml:16.

What the fixed file's Manifest Injection now contains (application attrs):

```
android:hardwareAccelerated="true" android:usesCleartextTraffic="true"
```

- `hardwareAccelerated` — required for smooth video rendering in WebView
- `usesCleartextTraffic` — allows http:// video URLs (some of your hosts may serve them)

---

## STEP 1 — Fullscreen video + autoplay + back button (the big one)

In Sketchware open your project → **Event** section → add these to the
`onCreate` event of your main activity (the one containing the WebView,
usually named `webview1`).

### 1a. Autoplay + fullscreen — paste in `onCreate` (add source code block)

```java
// Autoplay: allow videos to start without a user gesture (your ads auto-play)
binding.webview1.getSettings().setMediaPlaybackRequiresUserGesture(false);

// Fullscreen video support
binding.webview1.setWebChromeClient(new WebChromeClient() {
    private View customView;
    private WebChromeClient.CustomViewCallback customViewCallback;
    private FrameLayout fullscreenContainer;

    @Override
    public void onShowCustomView(View view, WebChromeClient.CustomViewCallback callback) {
        if (customView != null) { callback.onCustomViewHidden(); return; }
        customView = view;
        customViewCallback = callback;
        fullscreenContainer = new FrameLayout(getApplicationContext());
        fullscreenContainer.setBackgroundColor(android.graphics.Color.BLACK);
        fullscreenContainer.addView(view, new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));
        setContentView(fullscreenContainer);
        // Hide system bars while fullscreen
        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION |
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
    }

    @Override
    public void onHideCustomView() {
        if (customView == null) return;
        fullscreenContainer.removeAllViews();
        setContentView(#<your_main_layout>);   // <-- replace with your layout binding, see note
        customView = null;
        customViewCallback = null;
        getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_VISIBLE);
    }
});
```

> **Note on `setContentView(#<your_main_layout>)`:** In Sketchware Pro, type
> `setContentView(R.layout.main);` (or whatever your layout file is called —
> usually `main`). With ViewBinding enabled you can instead use
> `setContentView(binding.getRoot());` which is safer.

### 1b. Back button = smart navigation (updated)

Add to onBackPressed via the **Java/Kotlin Injection** menu (⋯ in Logic editor →
Java/Kotlin Injection → **onBackPressed** tab). Behavior: any page → goes back
in the site; nowhere to go → returns to index; **on index.html → Yes/No exit dialog**.

```java
String currentUrl = binding.webview1.getUrl();

// On the home page → confirm before exiting
if (currentUrl != null && (currentUrl.equals("https://deymflix.eu.cc/index.html")
        || currentUrl.equals("https://deymflix.eu.cc/")
        || currentUrl.endsWith("/index.html"))) {

    new android.app.AlertDialog.Builder(this)
        .setTitle("Exit DEYMFLIX?")
        .setMessage("Do you want to exit?")
        .setPositiveButton("Yes", new android.content.DialogInterface.OnClickListener() {
            @Override
            public void onClick(android.content.DialogInterface dialog, int which) {
                finish();
            }
        })
        .setNegativeButton("No", null)
        .show();
    return;
}

// Anywhere else → go back one page; if no history, go home
if (binding.webview1.canGoBack()) {
    binding.webview1.goBack();
} else {
    binding.webview1.loadUrl("https://deymflix.eu.cc/index.html");
}
```

> **If the compiler says `binding cannot be resolved` in onBackPressed** (scope
> varies by build), use findViewById instead: `android.webkit.WebView wv =
> (android.webkit.WebView) findViewById(R.id.webview1);` and use `wv.` everywhere
> in that snippet.

Without this, pressing back from any page instantly kills the app.

---

## STEP 2 — Downloads ("Download this video" button on your site)

**2a. Permission** — Manifest Injection → application is fine already, but ADD to
the permissions list (Sketchware → Permission manager):

```
android.permission.WRITE_EXTERNAL_STORAGE
```

(Sketchware requests runtime permission automatically when you use its download blocks.)

**2b. Paste in `onCreate` (add source code block):**

```java
binding.webview1.setDownloadListener(new DownloadListener() {
    @Override
    public void onDownloadStart(String url, String userAgent, String
            contentDisposition, String mimeType, long contentLength) {
        try {
            android.app.DownloadManager.Request req = new android.app.DownloadManager.Request(
                    android.net.Uri.parse(url));
            req.setNotificationVisibility(android.app.DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
            String fileName = android.webkit.URLUtil.guessFileName(url, contentDisposition, mimeType);
            req.setDestinationInExternalPublicDir(android.os.Environment.DIRECTORY_DOWNLOADS, fileName);
            req.setMimeType(mimeType);
            android.app.DownloadManager dm = (android.app.DownloadManager)
                    getSystemService(android.content.Context.DOWNLOAD_SERVICE);
            dm.enqueue(req);
            com.google.android.material.snackbar.Snackbar.make(
                    findViewById(android.R.id.content), "Downloading: " + fileName,
                    com.google.android.material.snackbar.Snackbar.LENGTH_SHORT).show();
        } catch (Exception e) {
            android.widget.Toast.makeText(getApplicationContext(), "Download failed", android.widget.Toast.LENGTH_SHORT).show();
        }
    }
});
```

---

## STEP 3 — Smart link handling (stay in-app for your site, out for the rest)

Paste in `onCreate` (add source code block). Keeps YouTube trailers and ad
pop-ups OUT of the app, your pages IN:

```java
binding.webview1.setWebViewClient(new WebViewClient() {
    @Override
    public boolean shouldOverrideUrlLoading(WebView view, String url) {
        String host = android.net.Uri.parse(url).getHost();
        if (host == null) return false;
        // Keep your own domains inside the app
        if (host.contains("deymflix.eu.cc") || host.contains("deymflix01.s3")
                || host.contains("video.deymflix") || host.contains("nbanaapp")) {
            return false; // load in WebView
        }
        // Everything else (youtube, ad networks) opens in the browser/app
        try {
            startActivity(new android.content.Intent(android.content.Intent.ACTION_VIEW,
                    android.net.Uri.parse(url)));
        } catch (Exception e) { }
        return true;
    }
});
```

---

## STEP 4 — Pull-to-refresh + no-internet detection

**4a.** Sketchware Pro → Library → local library: add
`androidx.swiperefreshlayout:swiperefreshlayout:1.1.0` (or use the built-in
"SwipeRefresh" component if your version has it).

**4b.** Add the component `swiperefreshlayout1` wrapping your WebView in the
layout editor (or paste XML into the layout).

**4c.** Event: `swiperefreshlayout1` → `onRefresh`:

```java
binding.webview1.reload();
```

And in the `onPageFinished` event of the WebView:

```java
swiperefreshlayout1.setRefreshing(false);
```

**4d. No-internet page** — in `onReceivedError` event of the WebView:

```java
binding.webview1.loadData("<html><body style='background:#0b0b0b;color:#fff;text-align:center;padding-top:40%;font-family:sans-serif'><h1 style='color:#e50914'>DEYMFLIX</h1><p>No internet connection.</p><p style='color:#888'>Check your connection and pull down to refresh.</p></body></html>", "text/html", "UTF-8");
```

---

## STEP 5 — App look & feel

**5a. Status bar color** — in `onCreate` (add source code block):

```java
getWindow().setStatusBarColor(android.graphics.Color.parseColor("#8B0000"));
getWindow().setNavigationBarColor(android.graphics.Color.parseColor("#0b0b0b"));
```

**5b. Splash** — Sketchware Pro has a built-in splash screen option in project
settings (App icon/splash). Enable it and pick your logo.

**5c. Custom User-Agent (so your site can detect app users later)** — in `onCreate`:

```java
String ua = binding.webview1.getSettings().getUserAgentString();
binding.webview1.getSettings().setUserAgentString(ua + " DeymflixApp/2.0");
```

---

## STEP 6 — Push notifications (new episode alerts)

You already have a Firebase project (`deymflix`).

1. Sketchware Pro → **Firebase** section → enable Cloud Messaging
2. Download `google-services.json` from
   https://console.firebase.google.com/project/deymflix/settings/general
   (Project settings → Your apps → Android app `com.deymflix.eu.cc` — if the
   Android app isn't registered yet, add it with that package name)
3. Import the JSON in Sketchware's Firebase section
4. In your Firebase console → Cloud Messaging → create a "New content" topic
   and send campaigns when you upload new movies
5. Optional server-side: send a notification automatically when you add a
   movie (can be wired later through your proxy-server.js)

---

## STEP 7 — In-app update check

Add a `TextView` (hidden) + this in `onCreate`:

```java
// Compare app version with a tiny file on your site
com.android.volley.RequestQueue q = com.android.volley.toolbox.Volley.newRequestQueue(this);
com.android.volley.toolbox.StringRequest req = new com.android.volley.toolbox.StringRequest(
        com.android.volley.Request.Method.GET, "https://deymflix.eu.cc/app-version.txt",
        new com.android.volley.Response.Listener<String>() {
            @Override public void onResponse(String response) {
                // app-version.txt contains e.g. "2"
                int latest = Integer.parseInt(response.trim());
                int mine = 1; // bump this when you ship a new APK
                if (latest > mine) {
                    android.app.AlertDialog.Builder b = new android.app.AlertDialog.Builder(MainActivity.this);
                    b.setTitle("Update available");
                    b.setMessage("A new version of DEYMFLIX is available. Please update.");
                    b.setCancelable(false);
                    b.setPositiveButton("Update", new android.content.DialogInterface.OnClickListener() {
                        public void onClick(android.content.DialogInterface d, int i) {
                            startActivity(new android.content.Intent(android.content.Intent.ACTION_VIEW,
                                    android.net.Uri.parse("https://deymflix.eu.cc/app.apk")));
                        }
                    });
                    b.show();
                }
            }
        }, new com.android.volley.Response.ErrorListener() {
            @Override public void onErrorResponse(com.android.volley.VolleyError e) { }
        });
q.add(req);
```

Then on your site, add two files:
- `app-version.txt` containing `2` (bump when you ship a new APK)
- `app.apk` — the latest APK download

(Volley needs the Sketchware Volley library enabled — Library → Volley.)

---

## Recommended order

| Priority | Step | Effort | Impact |
|---|---|---|---|
| 🔴 Must | Step 0 (compile fix) | done | app builds again |
| 🔴 Must | **Step 8 (blank screen fix)** | 5 min | **app shows your site** |
| 🔴 Must | **Step 9 (offline.html + swipe refresh)** | 15 min | branded offline page |
| 🟠 High | Step 1 (fullscreen/autoplay/back) | 15 min | core video UX |
| 🟠 High | Step 2 (downloads) | 10 min | user requests |
| 🟠 High | Step 3 (link handling) | 5 min | keeps users in-app |
| 🟡 Nice | Step 5 (colors/splash/UA) | 5 min | branding |
| 🟢 Later | Step 6 (push) | 30 min | engagement |
| 🟢 Later | Step 7 (update check) | 20 min | release safety |

---

## STEP 8 — Fix the blank screen (do this FIRST)

The app opens but shows a white page: the layout has **no WebView widget** and/or
no URL is assigned ("it needs widget webview" = there is no WebView in the layout).

### 8a. Add the WebView widget (required before any loadUrl block works)

**Visual editor way:**
1. Open **MainActivity** → **View/Layout editor** (screen-design tab, NOT Logic)
2. In the widget palette find **WebView** (usually near the bottom of the list)
3. Drag it onto the phone screen so it covers the whole page
4. Tap it → set **id** `webview1`, **layout_width** `match_parent`, **layout_height** `match_parent`
5. Save the layout

**XML way** (if WebView isn't in the palette) — switch the layout editor to the
XML tab and paste inside the root layout:

```xml
<WebView
    android:id="@+id/webview1"
    android:layout_width="match_parent"
    android:layout_height="match_parent" />
```

### 8b. Load your site

Now in **Logic → MainActivity → onCreate** the `webview1` blocks exist. Add:

1. `webview1 loadUrl` → string: `https://deymflix.eu.cc/index.html`
2. **Enable JavaScript + storage** (the usual cause of blank screens — your site
   is all JavaScript, and it uses localStorage for Continue Watching / My List):

> **ViewBinding note (v7 Pro):** your project has ViewBinding enabled, so raw-Java
> snippets must reference views as `binding.webview1`, NOT plain `webview1` —
> otherwise you get "webview1 cannot be resolved" at compile. The Sketchware
> *blocks* (loadUrl etc.) handle this automatically; only pasted Java needs the
> `binding.` prefix. All snippets below already use `binding.` where needed.
> (Exception: snippets using `findViewById(...)` work as-is.)

```java
binding.webview1.getSettings().setJavaScriptEnabled(true);
binding.webview1.getSettings().setDomStorageEnabled(true);
```

(paste as an "add source code directly" block in onCreate — use `binding.webview1`, not `webview1`)

3. Compile and run — the site should now load.

**Still blank?** Open the site in the phone's Chrome browser. If Chrome also
fails, the site is down — not the app. If Chrome works but the app is blank,
check Sketchware's Logcat (or temporarily `webview1.loadUrl("https://example.com")`)
to confirm the WebView itself works, then re-check the URL string for typos.

---

## STEP 9 — Offline page (your offline.html) + swipe refresh

Your `offline.html` (logo, "Connection Lost", Reload button) becomes the app's
offline screen. It already lives on your site — the app just redirects to it
when the network drops.

### 9a. Load offline.html when there's no internet

In **Event → onCreate** (add source code block):

```java
// If offline at launch, show your branded offline page
if (!isNetworkAvailable()) {
    binding.webview1.loadUrl("file:///android_asset/offline.html");
}
```

In **Event → onResume** (add source code block):

```java
// Recover automatically when connectivity returns
if (isNetworkAvailable() && binding.webview1.getUrl() != null
        && binding.webview1.getUrl().contains("offline.html")) {
    binding.webview1.loadUrl("https://deymflix.eu.cc/index.html");
}
```

Add this helper as a **add source code block** in onCreate too (defines isNetworkAvailable):

```java
}

private boolean isNetworkAvailable() {
    android.net.ConnectivityManager cm = (android.net.ConnectivityManager)
            getSystemService(android.content.Context.CONNECTIVITY_SERVICE);
    android.net.NetworkInfo ni = cm.getActiveNetworkInfo();
    return ni != null && ni.isConnected();
}
```

> The leading `}` closes onCreate so the helper can be a class method —
> Sketchware appends these blocks at the end of onCreate; this trick splits them.

**Offline DURING browsing** (user loses connection mid-session) — WebView error event:

In **Event → webview1 → onReceivedError** (add source code block):

```java
if (!isNetworkAvailable()) {
    binding.webview1.loadUrl("file:///android_asset/offline.html");
}
```

### 9b. Put offline.html into the app's assets

Sketchware → **Storage/Assets** (or the project's file manager):
- Create folder `assets` if missing
- Upload your `offline.html` there → it becomes `file:///android_asset/offline.html`

(Alternative: host it on your site at `https://deymflix.eu.cc/offline.html` and
load that URL instead of the asset — works identically, but needs a connection
the first time. The asset version works with zero internet, which is the point.)

### 9c. Swipe-to-refresh

> ⚠️ **WHERE CODE GOES — read before pasting:**
> - **Java** code (`binding.webview1...`, `if (...)`, `AlertDialog...`) → Logic → Java/Kotlin Injection tabs or ASD blocks
> - **XML** code (`<androidx...>`, `android:id=...`) → **View tab → layout editor → ⋮ → Edit XML** — NEVER into Java Injection
> - Pasting XML into a .java file causes "Syntax error, insert..." compile errors at the XML lines plus knock-on errors in the Java below it

1. Sketchware Pro → Library → add local library
   `androidx.swiperefreshlayout:swiperefreshlayout:1.1.0`
2. In the layout editor, wrap the WebView inside `SwipeRefreshLayout`
   (or open the XML view and paste this around your WebView):

```xml
<androidx.swiperefreshlayout.widget.SwipeRefreshLayout
    android:id="@+id/swipe_refresh"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <WebView
        android:id="@+id/webview1"
        android:layout_width="match_parent"
        android:layout_height="match_parent" />

</androidx.swiperefreshlayout.widget.SwipeRefreshLayout>
```

3. **Event → swipe_refresh → onRefresh** (add source code block):

```java
if (isNetworkAvailable()) {
    binding.webview1.reload();
} else {
    binding.webview1.loadUrl("file:///android_asset/offline.html");
}
binding.swipeRefresh.setRefreshing(false);
```

4. In **Event → webview1 → onPageFinished** (add source code block):

```java
binding.swipeRefresh.setRefreshing(false);
```

> With ViewBinding, reference views as `binding.webview1` and
> `binding.swipeRefresh` — done throughout this guide.

## Building the APK

1. Sketchware → your project → **Compile/Run**
2. If you see the duplicate-attribute error again → Step 0 wasn't applied
   (make sure you imported the fixed .swb)
3. Sign + install as usual

## Testing checklist after build

- [ ] App opens, site loads (no white screen) — Step 8
- [ ] Airplane mode at launch → your branded offline.html appears
- [ ] Airplane mode mid-browsing → offline.html; reconnect + swipe down → site returns
- [ ] Pull-to-refresh spins and reloads the page
- [ ] Play any movie → fullscreen button works, landscape rotates
- [ ] Ad plays → auto-advances to movie without a tap
- [ ] Back button goes back a page; exits only from home
- [ ] "Download this video" overlay → saves to Downloads
- [ ] YouTube trailer link opens the YouTube app, not in-WebView
- [ ] Subtitles: drop a file in /subtitles on the server → appears in player

---

## STEP 13 — v1.3 FIX PACK (swipe refresh, stuck spinner, buffering, back button)

**Use this if:** swipe-to-refresh does nothing, the white spinner circle stays
on screen after swiping, videos sit on "Buffering… 00:00:00" forever (player
AND reels), or the back button does nothing.

**Why it all broke at once:** the XML-injected SwipeRefreshLayout never got a
Sketchware Event page (so no refresh listener existed), nothing ever called
`setRefreshing(false)` (so the spinner stayed), the WebView never got
`setMediaPlaybackRequiresUserGesture(false)` (so `video.play()` was silently
blocked → infinite "Buffering…"), and the old back-button code relied on
`binding.` which isn't in scope in every injection tab.

### 13a. Import the v1.3 project file

Import `Deymflix v1.3.swb` (Project → Import .swb). It is your existing v1.2
project — same layout, same library — with updated instructions in its log.
(If you prefer keeping your imported project: it also works, the fix pack is
paste-only.)

### 13b. Confirm the layout (30 seconds, View tab)

View → layout editor → ⋮ → **Edit XML** → file `main`. `webview1` must sit
INSIDE `SwipeRefreshLayout` with id `swipe_refresh` (it already does — that's
where the spinner circle comes from). Nothing to change here.

### 13c. Paste the three blocks from `DEYMFLIX-APP-v1.3-FIX.java`

Open that file (it's in your Deymflix folder) — it contains exactly three
sections. In Logic → MainActivity → ⋮ → **Java/Kotlin Injection**:

| File section | Paste into tab |
|---|---|
| SECTION 1 | **onCreate** |
| SECTION 2 | **onBackPressed** |
| SECTION 3 | **onResume** |

Replace any older injected code in those tabs with these (old code fights the
new — e.g. two WebChromeClients, two refresh listeners).

**Library check:** Library manager must list
`androidx.swiperefreshlayout:swiperefreshlayout:1.1.0` (local library).
v1.2 projects already have it.

### 13d. offline.html into assets (once)

Sketchware → **Storage/Assets** → add `offline.html` from your Deymflix folder.
The fix pack redirects there automatically when the network drops and returns
to the site when connectivity is back.

### 13e. Build + test checklist

- [ ] Swipe down on any page → page reloads, spinner appears, **spinner disappears** when load finishes
- [ ] Play a movie → starts **without tapping** (no more Buffering… 00:00:00)
- [ ] Reels → same, plays automatically
- [ ] Player → back button leaves the player page (returns to where you were)
- [ ] On index.html → back asks "Do you want to exit?" with Yes/No
- [ ] Fullscreen video → rotates, exits fullscreen **without reloading the page**
- [ ] Airplane mode → offline.html appears; reconnect → app returns to the site on its own
