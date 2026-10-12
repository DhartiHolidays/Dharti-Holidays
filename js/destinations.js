/* destinations.html — lists admin-managed destinations */
document.getElementById('year').textContent = new Date().getFullYear();
const hdr = document.getElementById('siteHeader');
document.getElementById('navToggle').addEventListener('click', () => hdr.classList.toggle('open'));

function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function photosOf(d) {
  try { const p = typeof d.photos === 'string' ? JSON.parse(d.photos || '[]') : (d.photos || []); return Array.isArray(p) ? p : []; }
  catch (e) { return []; }
}

const grid = document.getElementById('dgGrid');
const emptyEl = document.getElementById('dgEmpty');
let allDest = [], region = 'all', query = '';

function cardHtml(d) {
  const photo = photosOf(d)[0];
  const media = photo
    ? `<img src="${esc(photo)}" alt="${esc(d.name)} travel guide" loading="lazy" width="600" height="400">`
    : `<div class="dg-placeholder"><span>${esc(d.name)}</span></div>`;
  return `<a class="dg-card" href="destination.html?id=${encodeURIComponent(d.id)}">
    <div class="dg-media">${media}<span class="dg-region">${d.region === 'international' ? 'International' : 'Domestic'}</span></div>
    <div class="dg-body">
      <h3>${esc(d.name)}</h3>
      <p class="dg-loc">${esc(d.location || '')}</p>
      <p class="dg-tag">${esc(d.tagline || '')}</p>
      <span class="dg-cta">View guide →</span>
    </div></a>`;
}

function render() {
  const q = query.trim().toLowerCase();
  const list = allDest.filter(d =>
    (region === 'all' || d.region === region) &&
    (!q || (d.name + ' ' + (d.location || '') + ' ' + (d.tagline || '')).toLowerCase().includes(q)));
  grid.innerHTML = list.map(cardHtml).join('');
  emptyEl.hidden = list.length > 0 || allDest.length === 0;
}

async function load() {
  grid.innerHTML = '<p class="dd-loading" style="grid-column:1/-1;">Loading destinations...</p>';
  if (typeof APPS_SCRIPT_URL === 'undefined' || APPS_SCRIPT_URL.includes('PASTE_YOUR')) {
    grid.innerHTML = '<p class="dd-loading" style="grid-column:1/-1;">Destination guides will appear here once connected.</p>';
    return;
  }
  try {
    const res = await fetch(`${APPS_SCRIPT_URL}?action=listDestinations`);
    const rows = await res.json();
    allDest = Array.isArray(rows) ? rows : [];
    if (!allDest.length) grid.innerHTML = '<p class="dd-loading" style="grid-column:1/-1;">No destinations added yet — check back soon.</p>';
    else render();
  } catch (err) {
    grid.innerHTML = '<p class="dd-loading" style="grid-column:1/-1;">Could not load destinations right now — please try again shortly.</p>';
    console.error(err);
  }
}

document.getElementById('dgSearch').addEventListener('input', (e) => { query = e.target.value; render(); });
document.querySelectorAll('#dgRegionFilter .region-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#dgRegionFilter .region-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    region = btn.dataset.region;
    render();
  });
});
load();
