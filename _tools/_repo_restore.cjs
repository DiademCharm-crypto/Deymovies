// Repo repair: replace/add files from disk AND delete files, in ONE commit.
//
//   node _tools/_repo_restore.cjs --push app.js,index.html,style.css --delete portal.html,login.js
//   node _tools/_repo_restore.cjs --push PlayerActivity.java --dry-run
//   node _tools/_repo_restore.cjs --delete a.jpg,b.jpg --msg "Remove stray uploads"
//
// _app_release.cjs and _deploy.cjs only ever WRITE files to the repo, so a bad
// upload (or a wrong-folder upload) can never be undone with them. This tool
// adds the missing half: deletions. A tree entry whose sha is null removes the
// path when it is applied on top of base_tree.
//
// Everything lands in ONE commit — one Pages build, no half-fixed state.
// Nothing is touched unless you name it, so app-update.json and the APKs are
// safe unless you explicitly pass them.
//
// Token: /tmp/gtok (or _tools/_gtok), same as _deploy.cjs / _app_release.cjs.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const OWNER = 'DiademCharm-crypto';
const REPO = 'Deymovies';
const BRANCH = 'main';
const DIR = path.join(__dirname, '..') + path.sep;

let token = process.env.GTOK || '';
if (!token) {
  for (const p of ['/tmp/gtok', DIR + '_tools/_gtok']) {
    if (fs.existsSync(p)) { token = fs.readFileSync(p, 'utf8').trim(); break; }
  }
}

const argv = process.argv.slice(2);
const flag = (name, dflt) => {
  const i = argv.findIndex((a) => a === '--' + name);
  if (i !== -1 && argv[i + 1] && !argv[i + 1].startsWith('--')) return argv[i + 1];
  return dflt;
};
const has = (name) => argv.includes('--' + name);
const DRY = has('dry-run');
const PUSH = (flag('push', '') || '').split(',').map((s) => s.trim()).filter(Boolean);
const DEL = (flag('delete', '') || '').split(',').map((s) => s.trim()).filter(Boolean);

const die = (msg) => { console.error('x ' + msg); process.exit(1); };

if (!PUSH.length && !DEL.length) die('nothing to do: pass --push a,b and/or --delete c,d');
if (!token && !DRY) die('no token found (/tmp/gtok)');

// ── GitHub helpers (same shape as _app_release.cjs) ─────────────────────────
async function api(method, url, body) {
  const r = await fetch('https://api.github.com' + url, {
    method,
    headers: {
      authorization: 'Bearer ' + token,
      accept: 'application/vnd.github+json',
      'user-agent': 'deymflix-restore',
      'content-type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  let json = null;
  try { json = JSON.parse(text); } catch (e) { /* non-json */ }
  return { status: r.status, json, text };
}

const blobSha = (buf) => crypto.createHash('sha1')
  .update(Buffer.concat([Buffer.from('blob ' + buf.length + '\0', 'utf8'), buf])).digest('hex');

// A path must be a plain repo-relative POSIX path — refuse anything that could
// escape the repo or land somewhere unexpected.
function safePath(p) {
  if (!p || p.startsWith('/') || p.includes('..') || p.includes('\\')) return false;
  return true;
}

(async () => {
  // ── 1. plan ───────────────────────────────────────────────────────────────
  const files = [];   // { path, buf }
  for (const f of PUSH) {
    if (!safePath(f)) die('refusing suspicious path: ' + f);
    const local = DIR + f;
    if (!fs.existsSync(local)) die('missing locally: ' + f);
    if (fs.statSync(local).isDirectory()) die('is a directory, not a file: ' + f);
    files.push({ path: f, buf: fs.readFileSync(local) });
  }
  const deletes = [];
  for (const d of DEL) {
    if (!safePath(d)) die('refusing suspicious path: ' + d);
    deletes.push(d);
  }
  const dup = deletes.filter((d) => files.some((f) => f.path === d));
  if (dup.length) die('path both pushed and deleted: ' + dup.join(', '));

  console.log('push   ' + files.length + ' file(s)');
  for (const f of files) console.log('   ' + String(f.buf.length).padStart(9) + '  ' + f.path);
  console.log('delete ' + deletes.length + ' path(s)');
  for (const d of deletes) console.log('        -  ' + d);

  if (DRY) { console.log('\nDRY RUN — no writes made'); process.exit(0); }

  // ── 2. repo + head ────────────────────────────────────────────────────────
  const who = await api('GET', `/repos/${OWNER}/${REPO}`);
  if (who.status !== 200) die('token invalid: HTTP ' + who.status);
  if (!(who.json.permissions && who.json.permissions.push)) die('token has no push permission');
  const ref = await api('GET', `/repos/${OWNER}/${REPO}/git/ref/heads/${BRANCH}`);
  if (ref.status !== 200) die('cannot read ref: ' + ref.text.slice(0, 120));
  const headSha = ref.json.object.sha;
  const head = await api('GET', `/repos/${OWNER}/${REPO}/git/commits/${headSha}`);
  const baseTree = head.json.tree.sha;
  console.log('\nrepo ok: ' + who.json.full_name + ' | head ' + headSha.slice(0, 8));

  // ── 3. build the tree op list ─────────────────────────────────────────────
  const tree = [];
  for (const f of files) {
    const cur = await api('GET', `/repos/${OWNER}/${REPO}/contents/${f.path.split('/').map(encodeURIComponent).join('/')}?ref=${BRANCH}`);
    const remoteSha = cur.status === 200 && cur.json && cur.json.sha ? cur.json.sha : null;
    if (remoteSha && remoteSha === blobSha(f.buf)) {
      console.log('UNCHANGED ' + f.path + ' — skipped');
      continue;
    }
    const blob = await api('POST', `/repos/${OWNER}/${REPO}/git/blobs`, { content: f.buf.toString('base64'), encoding: 'base64' });
    if (blob.status !== 201) die('blob failed for ' + f.path + ': ' + blob.text.slice(0, 160));
    tree.push({ path: f.path, mode: '100644', type: 'blob', sha: blob.json.sha });
    console.log('STAGED  ' + f.path + ' (' + f.buf.length + ' B)');
  }
  for (const d of deletes) {
    const cur = await api('GET', `/repos/${OWNER}/${REPO}/contents/${d.split('/').map(encodeURIComponent).join('/')}?ref=${BRANCH}`);
    if (cur.status !== 200) {
      console.log('ABSENT  ' + d + ' — already gone, skipped');
      continue;
    }
    tree.push({ path: d, mode: '100644', type: 'blob', sha: null });
    console.log('REMOVED ' + d + ' (' + cur.json.size + ' B)');
  }
  if (!tree.length) { console.log('\nnothing changed — no commit made'); process.exit(0); }

  // ── 4. one commit ─────────────────────────────────────────────────────────
  const newTree = await api('POST', `/repos/${OWNER}/${REPO}/git/trees`, { base_tree: baseTree, tree });
  if (newTree.status !== 201) die('tree failed: ' + newTree.text.slice(0, 160));
  const changed = tree.map((t) => (t.sha === null ? '-' : '+') + t.path);
  const msg = process.env.DEPLOY_MSG || ('Repo repair: ' + files.length + ' file(s) restored, ' + deletes.length + ' removed');
  const commit = await api('POST', `/repos/${OWNER}/${REPO}/git/commits`, {
    message: msg + '\n\nFiles: ' + changed.join(', '),
    tree: newTree.json.sha,
    parents: [headSha],
  });
  if (commit.status !== 201) die('commit failed: ' + commit.text.slice(0, 160));
  const newSha = commit.json.sha;
  const upd = await api('PATCH', `/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`, { sha: newSha, force: false });
  if (upd.status !== 200) die('ref update failed: ' + upd.text.slice(0, 160));
  console.log('\nPUSHED  ' + tree.length + ' change(s) in one commit ' + newSha.slice(0, 8));

  // ── 5. verify what the REPO now holds ─────────────────────────────────────
  let bad = 0;
  for (const f of files) {
    const cur = await api('GET', `/repos/${OWNER}/${REPO}/contents/${f.path.split('/').map(encodeURIComponent).join('/')}?ref=${BRANCH}`);
    const ok = cur.status === 200 && cur.json && cur.json.sha === blobSha(f.buf);
    if (!ok) bad++;
    console.log((ok ? 'VERIFIED ' : 'MISMATCH ') + f.path + (ok ? ' sha ' + blobSha(f.buf).slice(0, 10) : ''));
  }
  for (const d of deletes) {
    const cur = await api('GET', `/repos/${OWNER}/${REPO}/contents/${d.split('/').map(encodeURIComponent).join('/')}?ref=${BRANCH}`);
    const ok = cur.status === 404;
    if (!ok) bad++;
    console.log((ok ? 'GONE     ' : 'STILL THERE ') + d);
  }
  console.log(bad ? '\n' + bad + ' verification failure(s) — inspect the repo' : '\nall changes verified against the repo');
  console.log('GitHub Pages needs a build before the site reflects this — check with:');
  console.log('  node _tools/_pages_builds.cjs');
})().catch((e) => { console.error('restore failed: ' + e.message); process.exit(1); });
