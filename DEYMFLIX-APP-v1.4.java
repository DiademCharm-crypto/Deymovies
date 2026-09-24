// ===========================================================================
//  DEYMFLIX APP v1.4i -- ONE-LINE PACK (nothing big is pasted anymore)
// ===========================================================================
//
//  HISTORY, in one paragraph: the My Downloads screen used to be ~24 KB of
//  paste (4A-4F); a hand-selected region arrived with a stray brace and the
//  phone compiler reported 78 errors that were all that one character. The
//  screen then moved into plain .java files -- which Sketchware DELETES from
//  app/src/main/java on every build (verified on your device: the two files
//  vanished during a build). So all three screens now ship inside a Sketchware
//  LOCAL LIBRARY (deymflix-screens-1.0): libraries live outside the project,
//  survive every build, and their classes.jar is on the compiler classpath.
//
//  WHAT YOU PASTE NOW -- five tiny tabs:
//
//    MainActivity        onCreate       MainScreen85.install(this);
//    MainActivity        onBackPressed  MainScreen85.back(this);
//    MainActivity        onResume       MainScreen85.resume(this);
//    DownloadsActivity   onCreate       DlScreen85.show(this);
//    player activity     onCreate       LocalPlayer85.show(this);
//
//  The library is installed once from the PC:
//    1. copy deymflix-screens-lib/ (classes.jar + classes.dex) to
//       /storage/emulated/0/.sketchware/libs/local_libs/deymflix-screens-1.0/
//    2. add the registration line (see SKETCHWARE-v1.4-GUIDE.md) to
//       .sketchware/data/608/data/local_library  (its own data file,
//       same format your swiperefreshlayout entry already uses)
//
//  MainActivity NOTE: the MainActivity layout keeps its WebView (webview1) --
//  the library finds it by walking the view tree, no id needed. Your existing
//  layout and manifest settings stay untouched.
//
//  Every file here is 100% ASCII with ZERO pipe characters.
// ===========================================================================


// ---------------------------------------------------------------------------
// MainActivity -> Logic -> vdots -> Java/Kotlin Injection -> onCreate
// ---------------------------------------------------------------------------
MainScreen85.install(this);
// ============ END OF SECTION 1 -- last line of the onCreate tab ============


// ---------------------------------------------------------------------------
// MainActivity -> onBackPressed
// ---------------------------------------------------------------------------
MainScreen85.back(this);
// ============ END OF SECTION 2 ============


// ---------------------------------------------------------------------------
// MainActivity -> onResume
// ---------------------------------------------------------------------------
MainScreen85.resume(this);
// ============ END OF SECTION 3 ============


// ---------------------------------------------------------------------------
// DownloadsActivity -> onCreate   (downloads.xml stays empty)
// ---------------------------------------------------------------------------
DlScreen85.show(this);
// ============ END OF SECTION 4 ============


// ---------------------------------------------------------------------------
// player activity (LocalplayerActivity) -> onCreate
// ---------------------------------------------------------------------------
LocalPlayer85.show(this);
// ============ END OF SECTION 6 ============

