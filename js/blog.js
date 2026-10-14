/* blog.html — list of published posts (managed in admin -> Blog) */
document.getElementById('year').textContent = new Date().getFullYear();
const hdr = document.getElementById('siteHeader');
document.getElementById('navToggle').addEventListener('click', () => hdr.classList.toggle('open'));

function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function fmtDate(iso) { const d = new Date(iso); return isNaN(d) ? '' : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
function postCard(p) {
  const media = p.coverUrl
    ? `<img src="${esc(p.coverUrl)}" alt="${esc(p.title)}" loading="lazy" width="600" height="400">`
    : `<div class="dg-placeholder"><span>${esc(p.category || 'Travel')}</span></div>`;
  return `<a class="blog-card" href="post.html?id=${encodeURIComponent(p.id)}">
    <div class="blog-media">${media}</div>
    <div class="blog-body">
      <span class="blog-cat">${esc(p.category || 'Travel')}</span>
      <h3>${esc(p.title)}</h3>
      <p>${esc(p.summary || '')}</p>
      <span class="blog-meta">${esc(fmtDate(p.publishedAt))}${p.author ? ' · ' + esc(p.author) : ''}</span>
    </div></a>`;
}

const grid = document.getElementById('blogGrid');
const emptyEl = document.getElementById('blogEmpty');
const filterEl = document.getElementById('blogCatFilter');
let posts = [], cat = 'all', query = '';

function render() {
  const q = query.trim().toLowerCase();
  const list = posts.filter(p => (cat === 'all' || p.category === cat) && (!q || (p.title + ' ' + (p.summary || '') + ' ' + (p.category || '')).toLowerCase().includes(q)));
  grid.innerHTML = list.map(postCard).join('');
  emptyEl.hidden = list.length > 0;
}
function buildFilters() {
  const cats = Array.from(new Set(posts.map(p => p.category).filter(Boolean)));
  filterEl.innerHTML = ['all'].concat(cats).map(c => `<button class="region-btn${c === cat ? ' active' : ''}" data-cat="${esc(c)}">${c === 'all' ? 'All' : esc(c)}</button>`).join('');
  filterEl.querySelectorAll('.region-btn').forEach(b => b.addEventListener('click', () => {
    cat = b.dataset.cat; filterEl.querySelectorAll('.region-btn').forEach(x => x.classList.toggle('active', x === b)); render();
  }));
}
async function load() {
  if (typeof APPS_SCRIPT_URL === 'undefined' || APPS_SCRIPT_URL.includes('PASTE_YOUR')) { grid.innerHTML = '<p class="dd-loading" style="grid-column:1/-1;">Articles will appear here once connected.</p>'; return; }
  grid.innerHTML = '<p class="dd-loading" style="grid-column:1/-1;">Loading articles...</p>';
  try {
    const res = await fetch(`${APPS_SCRIPT_URL}?action=listPosts`);
    const rows = await res.json();
    posts = Array.isArray(rows) ? rows : [];
    if (!posts.length) { grid.innerHTML = '<p class="dd-loading" style="grid-column:1/-1;">No articles yet — check back soon.</p>'; return; }
    buildFilters(); render();
  } catch (err) { grid.innerHTML = '<p class="dd-loading" style="grid-column:1/-1;">Could not load articles right now — please try again shortly.</p>'; console.error(err); }
}
document.getElementById('blogSearch').addEventListener('input', e => { query = e.target.value; render(); });
load();
