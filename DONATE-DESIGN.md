# DEYMFLIX — Donation Page: Design & Mechanics

**Status:** design only. Nothing here is implemented yet.
**Goal:** let viewers say thanks with money, with the fewest moving parts, working
on the web **and** inside the Android app, without a backend and without touching
the catalog.

---

## 1. Principles (these decide everything below)

1. **A tip jar, never a paywall.** No gated titles, no "premium" tier, no access
   sold. The moment the library is sold, the site becomes commerce around
   third-party copyrighted content — which is exactly what makes payment
   processors freeze accounts and claw back funds.
2. **No backend, no secrets.** The repo is public and the site is static. Any
   key in the page is public. Card data must never touch `deymflix.eu.cc` (PCI).
   So: **hosted payment links + QR only** — never an embedded card form.
3. **Money is manual and verified.** A GCash/Maya → Coins.ph InstaPay transfer
   can't be reconciled automatically from a static page, so the confirmation is
   a form + a human check + an approved donor list. That's a feature: no server
   to build or secure.
4. **Nothing navigates off-domain in the app** — see §5, this is the one real
   technical constraint.

---

## 2. Page: `donate.html`

Standalone page, same shell as the rest of the site (top-nav + bottom-nav +
site-footer), dark `#0b0b0f`, red `#e50914` accent, same font stack. Lives at
the repo root like `downloads.html`. Added to `sw.js` `SHELL` and to the
`_tools/_deploy.cjs` default file list.

### Entry points
| Where | Trigger | Deep link |
|---|---|---|
| Footer button "❤ Support DEYMFLIX" beside Developer Info | always | `donate.html?src=footer` |
| Player end-card after `ended` | once per title | `donate.html?src=player` |
| Dismissible nudge on Home | 3rd finished title in a session, max once / 7 days | `donate.html?src=nudge` |
| Request modal footer ("or just say thanks") | always | `donate.html?src=request` |

The bottom nav is already at 5 items with Explore in the centre — **do not add a
6th slot**; it breaks that layout. The footer + nudge + request-modal are enough.

### Page anatomy (top → bottom)
1. **Hero** — wordmark, `Keep DEYMFLIX free`, one honest line: what money pays
   for. Primary red CTA `❤ Donate` scrolls to the payment card; ghost CTA `Share`.
2. **Where your ₱ goes** — 3–4 cards with a rough split (e.g. CDN/bandwidth ·
   APIs & domain · dev time). Transparency is the single highest-converting
   block on a tip page.
3. **Amount — free entry, any amount.** A real numeric field (`inputmode="numeric"`,
   big red `₱` prefix) that accepts **any value**, with `₱50 / ₱100 / ₱250 / ₱500`
   chips as *shortcuts that fill the field* — typing always wins, and a chip only
   lights up when the typed value matches it. Non-digits are stripped, thousands
   are grouped (`₱1,000`), and an empty field degrades to read "the amount".
   Whatever is typed mirrors into both step lists, so the instruction the donor
   reads always matches the number they must enter in GCash/Maya.
   **No fixed-amount QR:** because any amount is allowed, the QR carries no
   amount (do *not* use Coins.ph's `Set amount`, which would lock the QR to one
   value and silently break every other amount).
4. **Pay** — one destination card: the Coins QR Ph image, the account number
   with a `❤ Copy` button, and a **GCash / Maya toggle** that swaps the
   step-by-step instructions. Not a list of competing rails — every donor ends
   up in the same Coins.ph wallet (§3).
5. **"I already sent it"** — reference number + name/handle (opt-in) + message,
   POSTed to the **existing web3forms key** (`f128f943-…`, already used by the
   movie-request form and the player Report tab). This is the only form.
6. **Donor wall** — reads from Firebase RTDB; only hand-approved entries.
7. **FAQ / trust** — "Is this a subscription?" No. "What do I get?" Nothing
   gated — the site stays exactly as it is. "Will my name show?" Only if you
   tick the box. **"Will you ever ask for my MPIN or OTP?" Never** — say it out
   loud; PH audiences are phished with exactly that script.
8. **Site footer** (standard).

The header is **logo-only**: no search bar. `donate.html` is a destination, not a
browse surface, so the search field that every other page carries is removed
(and with it the header's inline search layout).

### Non-negotiable content rule: no names on the page
**No personal name appears anywhere on `donate.html`** — not the wallet owner's,
not the developer's. Concretely, that means:
- The payment card has **no "Account name" row** (a row would have to print a
  name). It shows institution, number and method only.
- There is no "run by <name>" credit line.
- The FAQ answers the name question **generically** ("Why does my app show a
  different account name?") without repeating who that name belongs to.
- The donor wall shows only handles people typed themselves, or `Anonymous`.
- The footer keeps its existing `Developer Info` button, whose label and
  subtitle carry no name.

---

## 3. Destination: the Coins.ph wallet (donors pay from GCash or Maya)

There is exactly **one destination**, not a list of rails: the Coins.ph wallet.
GCash and Maya are just two doors into it, both over **InstaPay / QR Ph**
(the BSP national real-time rail).

### What the donor has to enter
| Field | Value | Where it comes from |
|---|---|---|
| Institution | **DCPay Philippines, Inc. (Coins.ph)** | Coins.ph's licensed EMI name — this is what the sender's app lists |
| Account name | your **registered full name on Coins.ph** | KYC name, fixed — what the sender sees on the confirm screen |
| Account number | your **registered mobile number** (e.g. `09171234567`) | the number linked to the Coins.ph account |
| Method | **InstaPay** (instant) or **PESONet** (next banking day) | |
| Per-transaction cap | ₱50,000 (InstaPay) | |

Coins.ph's own supported-sender list includes **GCash** and **Maya Bank / Maya
Wallet**, so both of those are documented, working senders.

### Payer paths (this is the page's actual UI copy)

**GCash**
1. `Transfer` → `Local` (banks / e-wallets)
2. Pick **DCPay Philippines, Inc. (Coins.ph)** — if it isn't in the list, use
   `Scan / Upload Bank QR` and scan the Coins QR
3. Paste the account number → amount → confirm

**Maya**
1. `Bank Transfer` → choose **DCPay**
2. Type the account name + the number → amount → `Send`
3. Maya confirms by SMS

**QR Ph (both apps, and banks)**
`Scan QR` → the Coins QR image on the page → amount is pre-locked if you set a
fixed-amount QR. On the *same* phone the QR can't be scanned (you'd be scanning
your own screen), so **the copy button is the primary mobile path and the QR is
the desktop/second-device path.**

### Hard prerequisites (verify before publishing)
- The Coins.ph account must be at least **ID & Selfie verified (Level 2)** with a
  **verified mobile number** — receiving InstaPay is blocked otherwise.
- Export the QR properly: in the Coins.ph app, `Receive` → `Show Coins QR Code`
  → share/screenshot. Save the crop as **`icons/donate-qr.png`** and leave the
  amount **unset** (see §2 — any-amount entry is the design).
- **Never redraw or re-encode the QR.** Use the exported pixels as-is.
- **Crop the account name out of the asset.** The app's Receive screen prints the
  registered name directly under the QR, so a raw screenshot would put a name in
  the repo. `_tools/_qr_crop.cjs` does it with Node's `zlib` only (no image
  library):
  `node _tools/_qr_crop.cjs <screenshot.png> icons/donate-qr.png <x> <y> <size>`.
  The shipped crop is 366×366 — 315px of QR plus a ~26px white margin, which
  keeps a quiet zone without reaching the name text ~30px below.
- **Residual leak that cannot be cropped away:** the QR *payload* itself carries
  the registered account name, so a payer who scans it may see that name resolved
  in GCash/Maya. The page prints no name, but the code cannot hide its own
  contents — only a different account (§3.1 option 0) changes that.
- **The InstaPay number is needed in full.** The Receive screen shows it masked
  (`****8355`), so the last four digits are visible there but the page's manual
  path needs the complete mobile number typed in by the owner — the design keeps
  a masked placeholder until then.
- Run a **₱1 live test from both GCash and Maya** and note the exact recipient
  name each app displayed — put that name on the page so the confirm screen
  doesn't look like a scam.

### Fees and limits
- **Coins.ph charges zero receiving fees** for incoming InstaPay.
- The **sender's** app may charge its own outbound fee (varies by method and
  promos, roughly ₱0–₱25) — say this on the page, and set the smallest suggested
  amount to **₱100** so a fee doesn't eat a ₱50 tip.
- InstaPay transfers are **final and irreversible** — a typo'd number is gone.
  The page must say: check the number before confirming.

### Two privacy traps to decide on *before* publishing
1. **The account number is your mobile number.** Publishing it hands your
   personal number to every visitor, permanently. **Strong recommendation: open
   a dedicated SIM/number for the Coins.ph account** (₱99 SIM) and register that
   one, so the public number isn't the one you use for OTPs and personal calls.
   Decide now — swapping the number later means re-doing KYC and re-exporting
   the QR.
2. **The account name cannot be set to "DEYMFLIX"** on a personal wallet — it
   is the wallet's KYC name (currently your mother's). See §3.1 for what can and
   cannot be changed, and the four options.

### 3.1 The payee name is fixed — what to do about it

**Hard fact:** the name a GCash/Maya donor sees comes from **DCPay/Coins.ph's
KYC record for the receiving wallet**. There is no nickname, alias or display
name for a person-to-person wallet: InstaPay / QR Ph P2P carries the registered
account name, and the Coins.ph app bakes it into the QR payload when it
generates the code (so editing the image would just break the QR). With a
personal account, **the donor sees your mother's name, and no app setting
changes that.**

| # | Option | What the donor sees | What it costs |
|---|---|---|---|
| **0** | Receive on a **different account** (e.g. your own) | that account's KYC name — the site's public name, not a relative's | ₱0. Needs an ID- & Selfie-verified Coins.ph account |
| **1** | **Print no name at all and brand the page** (recommended, already built into the mockup) | the wallet's registered name *only* on the donor's own confirmation screen, `DEYMFLIX` everywhere on the page | ₱0 |
| 2 | Branded platform checkout (Ko-fi / BMC / PayPal Business) | `DEYMFLIX` on the support page and the receipt | reintroduces the processor-freeze risk, and the in-app tap needs the `openExternal` bridge (APK rebuild) |
| 3 | Crypto into the wallet (USDT-TRC20 / BTC) | **nothing** — just an address, no name at all | friction for PH donors; on-ramp/off-ramp steps |
| 4 | Merchant QR Ph / **Coins.ph Business** — the *only* way a wallet QR literally reads "DEYMFLIX" | the registered business name | DTI + BIR + MDR ~1–2% + settlement to a bank + filings — **and a publicly searchable registry record** |

**Why option 4 is not the easy win it looks like.** Merchant QR Ph requires
business registration (DTI for a sole proprietorship, plus BIR 2303 and a bank
account), and DTI business-name records are **publicly searchable**. Registering
"DEYMFLIX" as a business permanently ties a real, identifiable person — your
mother, as owner — to the site in a government registry. That is a *bigger* and
more durable exposure than a name flashing on a payment screen for ten seconds,
on a site whose legal posture is "we embed third-party players". Only take this
path if you want a real business for other reasons, with the filings and the
content-posture change that implies.

**What actually fixes the trust problem (option 1, ₱0).** Donors don't bail
because a name is unfamiliar; they bail when **the page and the payment screen
disagree**. So the payment card repeats every field the donor is about to see —
**except the name**, which is never printed:

> **Send to** Bank / E-wallet transfer
> **Institution** DCPay Philippines, Inc. (Coins.ph)
> **Account number** 09•• ••• ••••  [❤ Copy]
> **Method** InstaPay — instant, no receiving fee
>
> *Check the number before you confirm. InstaPay transfers are instant and
> cannot be reversed. Your app shows a registered account name on the
> confirmation screen — that's the receiving wallet, so match the number exactly
> before sending.*

The name question is then handled once, in the FAQ, without naming anyone:

> **Why does my app show a different account name?** The wallet is registered
> under the owner's legal name, which is what any bank or e-wallet is required
> to display for an account transfer. It isn't a business name, so make sure the
> **number** matches the one above before you send.

The brand lives where it actually converts: the page, the payment card, the
donor wall, the share card. The wallet is invisible plumbing — and the page
prints no name whatsoever.

**Option 0 is still worth considering for a non-branding reason:** whoever holds
the KYC name legally owns the money and carries the risk. Any account other than
a relative's personal wallet is a better fit for the site's income, because that
relative's identity is otherwise attached to the revenue and their account is
the one exposed to KYC/AML review, reversals and any dispute that lands later.

### Why this replaced a rail list
- **One destination, zero navigation.** No outbound links are needed, which
  means the page works inside the current APK with **no bridge and no app
  rebuild** (§5).
- **No processor to freeze.** PayPal/Stripe/Ko-fi/BMC are all downstream of a
  streaming-site ToS problem; a Coins.ph wallet receiving InstaPay isn't.
- **Optional later:** an international rail (PayPal.me / crypto to the same
  Coins.ph account) for non-PH supporters — add it only when there's demand,
  since it reintroduces the navigation problem in the app.
- Coins.ph is a BSP-regulated EMI/VASP: **regular or large inflows can trigger
  KYC/AML review**, and the wallet doubles as a crypto exchange — don't
  commingle it with personal funds; keep a separate ledger.

---

## 4. How the money flow works

```
donor taps a rail on donate.html
   ├─ GCash: Transfer → Local → DCPay Philippines (Coins.ph) → InstaPay → paste number
   ├─ Maya:  Bank Transfer → DCPay → name + number            → send
   └─ either: Scan QR (Coins QR Ph, amount pre-locked by the amount chip)
        ↓  credited to the Coins.ph wallet in real time (no receiving fee)
Coins.ph push notification + transaction history entry (with the sender's name)
        ↓
donor submits the reference number from their GCash/Maya receipt → web3forms
        ↓
you match it in the Coins.ph history (amount + time + sender name)
        ↓
`node _tools/_donors.cjs add "<name>" <amount> "<note>"`  (DRY unless --apply)
        ↓
Firebase RTDB `supporters` updated → donor wall renders on next load
```

- **`_tools/_donors.cjs`** mirrors the existing tool style (`_set_embed.cjs`):
  `list | add | remove | hide | export`, dry-run by default, `--apply` to write.
  The repo stays the source of truth and there's no admin dashboard to build.
- Suggested RTDB shape (public, read-only by rules):
  `supporters/<pushId> = { name, amount, currency, note, date, anonymous:false }`
  — **no emails, no reference numbers, no payment identifiers** in the public
  tree. Keep the verification log locally (`_tools/_donors.json`).
- **Automation later, not now:** if they ever want auto-reconciliation, the
  piece that fits is a Cloudflare Worker webhook (Stripe/PayMongo) writing to
  RTDB. That's new infrastructure and a new secret — deliberately out of scope.

---

## 5. The app constraint (the important finding)

`MainScreen85.java`:

- `isInternalNavigation()` cancels **all** top-frame navigation except
  `deymflix.eu.cc` and subdomains — *silently*, by design (it's what stops
  embed ads from hijacking the player).
- `setSupportMultipleWindows(false)` means `window.open()` / `target="_blank"`
  can't escape either; they load in the same WebView and then get cancelled.
- `intent://`, `mailto:`, `market:` are explicitly blocked too.

**So today, tapping a PayPal/Ko-fi link — any external payment link — inside
the app does nothing at all.** `deymflix.eu.cc/donate.html` itself loads fine
(same origin) — it's the payment *tap* that dies.

### Coins.ph routing sidesteps it completely
Because the destination is a **wallet that receives via QR Ph + InstaPay**, the
page needs **no outbound navigation at all**: the QR is a local image in
`icons/`, and the account number is copied to the clipboard. Nothing to cancel,
so **the donation page works in every APK that exists today — no bridge, no
app rebuild, no UA bump.**

The only thing that would need the bridge is an *optional* international rail
(PayPal.me etc.) added later:
```java
@android.webkit.JavascriptInterface
public void openExternal(final String url) { /* whitelist + ACTION_VIEW */ }
```
with a capability check (`typeof DeymflixApp.openExternal === 'function'`) so
older APKs degrade instead of crashing, exactly like the existing `APP_VG`
guard in app.js.

### Remaining app-side gotchas
- `security.js` kills the context menu, drag, and `copy`/`cut` **outside
  inputs** (`security.js` §6), and the player sets `user-select: none`. So the
  page must ship its own `❤ Copy` button (`navigator.clipboard.writeText`, with
  a toast fallback) — long-press-to-select will not work. Keeping the number in
  a `readonly <input>` also makes the native selection path work.
- **On the same phone the donor cannot scan the QR they're looking at**, and no
  universal link can jump them into GCash/Maya. So the numbered per-app steps
  and the copy button are the *primary* experience on mobile — the QR is the
  secondary path for desktop readers and second devices.
- The request firewall is a **blocklist** (`AD_HOSTS` + a blanket `.cfd` ban),
  not a whitelist, so nothing payment-related is blocked — the page is pure
  local assets plus the existing web3forms POST, which already works in-app.
- Get the QR image into `sw.js`'s cached set (`donate-qr.png`) so the donation
  page still shows a scannable code offline or on a bad connection.

---

## 6. Visual spec (so implementation is mechanical)

- Shell: `.top-nav`, `.content-section` / `.section-header-title`, `.site-footer`,
  `<html class="dfx-app">` hides the "Get the Android App" footer block (existing
  convention, `style.css:2115`).
- Hero: gradient card (`135deg, #0a0a0a → #1a0a0e`), 96px heart glyph, wordmark
  using `DEYM<em>FLIX</em>` with the red `em` (same pattern as the loader).
- Amount chips: pill row, `overflow-x:auto` on narrow screens, selected =
  1px `#e50914` border + `rgba(229,9,20,.12)` tint; "Other" reveals a numeric
  input with `inputmode="numeric"` + `pattern` for ₱.
- Destination card: the QR in a white quiet-zone tile (QRs on dark backgrounds
  scan badly — give it a white/very light background and ≥16px padding),
  `min-height: 56px` rows for the copied fields (44px+ touch targets),
  `-webkit-tap-highlight-color: transparent`.
- GCash / Maya toggle: two pills; selecting one swaps the numbered steps below
  it. Default to `GCash` (largest audience), keep both step lists in the DOM so
  the switch is instant and offline-safe.
- "Where it goes": `grid-template-columns: repeat(auto-fill, minmax(220px, 1fr))`.
- Donor wall: reuse the home `horizontal-scroll` pattern; avatar = initial in a
  red circle; `Name · ₱250 · 2 days ago`; empty state `Be the first ❤`.
- Mobile-first; ≤768px is the primary target (that's where the audience is).
- A11y: real `<label>`s, `aria-live="polite"` on the copy toast, ≥4.5:1 on muted
  text, and `@media (prefers-reduced-motion: reduce)` to disable the float/pulse
  animations reused from the loader.

---

## 7. Trust, legal, and risk (state these on the page and in the code)

- **Never gate content.** Keep it a tip jar. This is also the honest position:
  the money is for the domain, the CDN and your time — not for the movies.
- **The receiving wallet is a person, not the site.** Whoever's KYC name is on
  it owns the money legally and carries the risk if it ever becomes income,
  which is why §3.1 prefers an account whose name is already public — and why
  you should not run meaningful sums through a relative's wallet.
- **The receiving wallet is a personal account.** InstaPay transfers are final
  and irreversible, the account number is your mobile number, and Coins.ph can
  flag heavy inflows — so: **never commingle donation money with personal
  funds**, keep the donation ledger separate, and **archive every record
  locally** (`_tools/_donors.json` + a periodic export) so no single account is
  your only history.
- **If an international card processor is added later** (PayPal/Stripe/Ko-fi),
  the freeze-and-clawback risk returns with it: those ToS prohibit
  copyright-infringing activity. That's the reason Coins.ph/InstaPay is the
  primary rail and a processor is optional, never the only door.
- **Don't publish identifying details** (full legal name, address, school) on
  the page. "Diadem Charm · Philippines" is already the site's own convention.
- **Privacy:** donor names are opt-in; default to anonymous; never publish
  emails or reference numbers; let donors ask to be removed.
- **Anti-phishing line on the page:** "DEYMFLIX will never ask for your GCash
  MPIN, OTP, or card details." Donation pages for PH audiences are commonly
  cloned — say this explicitly so a clone is easier to spot.
- **Taxes:** regular tip income may be reportable in PH. Flag it to the owner;
  don't give tax advice on the page.

---

## 8. Measurement (no new services)

- Firebase RTDB is already in the project (used by the online counter). Log
  `analytics/donate/<event>` counters: `view`, `method_click/<gcash|maya|qr>`,
  `copy_click`, `form_submit`, `wall_visible`. That gives the funnel
  (view → payment tap → submitted → approved) with zero new dependencies.
- `measurementId` exists in `config.js` but gtag is not actually loaded, so
  don't assume GA — either load gtag or stick to the RTDB counters.
- Attribution via `?src=` so you can tell whether the nudge, the footer, or the
  player end-card actually converts — that decides whether to keep the nudge.

---

## 9. Build order (when you say go)

1. `donate.html` skeleton + styles only, wired into the footer (no payment yet).
2. Export + crop the Coins QR into `icons/donate-qr.png` (unset amount, no name
   in the pixels — `_tools/_qr_crop.cjs`), then build the payment card: QR tile +
   copy-number field + GCash/Maya step toggle + the free-entry amount field.
3. "I already sent it" form → reuse the existing web3forms key.
4. Firebase `supporters` read + `_tools/_donors.cjs` (dry-run/`--apply`).
5. Nudge on Home + end-card in `player.html`.
6. Housekeeping: `sw.js` `SHELL` (+ the QR image), `_tools/_deploy.cjs` list,
   cache-buster bump on the pages touched (if `style.css` changes:
   `160.5 → 160.6` everywhere).
7. **Only if wanted:** an international rail + the `openExternal` bridge + APK
   v1.7. Nothing above needs an app release.

---

## 10. Open decisions

1. **Whose wallet receives?** Decided on the page: it prints **no names** (§2).
   What's still open is *whose* KYC name flashes on the donor's own confirmation
   screen — an existing account, or a different verified account (§3.1 options
   0 vs 1). Business registration (option 4) is a much bigger commitment than it
   looks.
2. **Which number receives?** A dedicated SIM for that wallet (recommended — it
   goes public and stays public), or the personal number?
3. **Amounts — decided:** free entry, any amount, with ₱50/₱100/₱250/₱500 as
   shortcuts. Only note: sender-side InstaPay fees mean a tiny tip can be eaten
   by the transfer fee, so the page *mentions* it rather than enforcing a floor.
4. **International rail now or later?** (PayPal.me / crypto into the same
   Coins.ph account — later means no APK work.)
5. **Donor wall:** public with opt-in names/handles, or private thank-you page?
6. **Bottom-nav slot:** the mockup swaps the `Request` item for `Support`
   (the bar stays at 5 items — a 6th breaks the centred Explore layout). Keep
   that swap, or leave the nav untouched and keep Support in the footer + the
   player end-card only?
