// Push CW-grouping fix to GitHub (uses the stored device-flow token)
const fs = require('fs');
const path = require('path');
const os = require('os');
const TMP = os.tmpdir();
const token = fs.readFileSync(path.join(TMP, 'gtok'), 'utf8').trim();
const REPO = 'DiademCharm-crypto/Deymovies';
const BRANCH = 'main';
const gh = { 'Accept': 'application/vnd.github+json', 'Authorization': 'Bearer ' + token, 'User-Agent': 'deymflix-deploy' };

async function pushFile(localPath, repoPath, message) {
  const content = fs.readFileSync(localPath).toString('base64');
  const api = 'https://api.github.com/repos/' + REPO + '/contents/' + encodeURI(repoPath);
  const g = await fetch(api + '?ref=' + BRANCH, { headers: gh });
  let sha = null;
  if (g.status === 200) sha = (await g.json()).sha;
  const p = await fetch(api, {
    method: 'PUT', headers: Object.assign({}, gh, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ message, content, branch: BRANCH, sha: sha || undefined })
  });
  if (p.status === 200 || p.status === 201) console.log('PUSHED ' + repoPath);
  else throw new Error('PUT ' + repoPath + ' HTTP ' + p.status + ' ' + JSON.stringify(await p.json().catch(() => ({}))));
}

(async () => {
  const base = 'C:/Users/chamb/OneDrive/Desktop/Deymflix/';
  const msg = 'Continue Watching: one card per series (last-watched episode) + deep-link ?s=&ep= resume';
  try {
    await pushFile(base + 'app.js', 'app.js', msg);
    await pushFile(base + 'episodes.js', 'episodes.js', msg);
    await pushFile(base + 'player.html', 'player.html', msg);
    console.log('ALL PUSHED');
    process.exit(0);
  } catch (e) { console.log('FAILED: ' + e.message); process.exit(1); }
})();
