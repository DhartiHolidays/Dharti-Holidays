/* post.html — one article */
document.getElementById('year').textContent = new Date().getFullYear();
const hdr = document.getElementById('siteHeader');
document.getElementById('navToggle').addEventListener('click', () => hdr.classList.toggle('open'));

function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function fmtDate(iso) { const d = new Date(iso); return isNaN(d) ? '' : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
function autolink(s) { return s.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'); }

// Blank line = new paragraph, "## " = heading, lines starting "- " = bullet list
function formatBody(text) {
  const lines = String(text || '').replace(/\r/g, '').split('\n');
  let out = '', para = [], list = [];
  const flushPara = () => { if (para.length) { out += '<p>' + autolink(esc(para.join('\n'))).replace(/\n/g, '<br>') + '</p>'; para = []; } };
  const flushList = () => { if (list.length) { out += '<ul>' + list.map(li => '<li>' + autolink(esc(li)) + '</li>').join('') + '</ul>'; list = []; } };
  lines.forEach(raw => {
    const l = raw.trim();
    if (!l) { flushPara(); flushList(); return; }
    if (l.indexOf('## ') === 0) { flushPara(); flushList(); out += '<h2>' + esc(l.slice(3)) + '</h2>'; return; }
    if (l.indexOf('- ') === 0) { flushPara(); list.push(l.slice(2)); return; }
    flushList(); para.push(l);
  });
  flushPara(); flushList();
  return out;
}

const root = document.getElementById('postRoot');
const wantedId = new URLSearchParams(location.search).get('id');

function relatedCard(p) {
  const media = p.coverUrl ? `<img src="${esc(p.coverUrl)}" alt="${esc(p.title)}" loading="lazy" width="600" height="400">` : `<div class="dg-placeholder"><span>${esc(p.category || 'Travel')}</span></div>`;
  return `<a class="blog-card" href="post.html?id=${encodeURIComponent(p.id)}"><div class="blog-media">${media}</div><div class="blog-body"><span class="blog-cat">${esc(p.category || 'Travel')}</span><h3>${esc(p.title)}</h3><span class="blog-meta">${esc(fmtDate(p.publishedAt))}</span></div></a>`;
}

function setMeta(p) {
  document.title = `${p.title} | Dharti Holidays Blog`;
  const desc = (p.summary || String(p.body || '').replace(/\s+/g, ' ')).slice(0, 155);
  let m = document.querySelector('meta[name="description"]');
  if (!m) { m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m); }
  m.content = desc;
  const url = location.origin + '/post.html?id=' + encodeURIComponent(p.id);
  const canon = document.querySelector('link[rel="canonical"]'); setCanonicalUrl(url);
  const ld = document.createElement('script'); ld.type = 'application/ld+json';
  ld.textContent = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Article', headline: p.title, description: desc,
    datePublished: p.publishedAt || undefined, mainEntityOfPage: url,
    ...(p.coverUrl ? { image: [p.coverUrl] } : {}),
    author: { '@type': 'Organization', name: p.author || 'Dharti Holidays' },
    publisher: { '@type': 'Organization', name: 'Dharti Holidays', logo: { '@type': 'ImageObject', url: location.origin + '/images/logo-192.webp' } }
  });
  document.head.appendChild(ld);
}

function render(p, all) {
  setMeta(p);
  const url = location.origin + '/post.html?id=' + encodeURIComponent(p.id);
  const related = all.filter(x => String(x.id) !== String(p.id)).slice(0, 3);
  root.innerHTML = `
  <section class="post-hero"><div class="wrap post-wrap">
    <a class="post-back" href="blog.html">← All articles</a>
    <span class="blog-cat">${esc(p.category || 'Travel')}</span>
    <h1>${esc(p.title)}</h1>
    <p class="post-meta">${esc(fmtDate(p.publishedAt))}${p.author ? ' · ' + esc(p.author) : ''}</p>
    ${p.coverUrl ? `<div class="post-cover"><img src="${esc(p.coverUrl)}" alt="${esc(p.title)}" width="780" height="420"></div>` : ''}
  </div></section>
  <section class="dd-section" style="padding-top:10px;"><div class="wrap post-wrap">
    <div class="post-body">${formatBody(p.body)}</div>
    <div class="post-share">
      <a class="btn btn-outline-dark" target="_blank" rel="noopener noreferrer" href="https://wa.me/?text=${encodeURIComponent(p.title + ' ' + url)}">Share on WhatsApp</a>
      <button type="button" class="btn btn-outline-dark" id="copyLinkBtn">Copy link</button>
    </div>
    <div class="post-cta">
      <h3>Planning a trip?</h3>
      <p>Tell us your dates and budget and we'll send a personal quote — flights, hotels, visa help and transfers included if you like.</p>
      <div class="dd-actions">
        <a class="btn btn-primary" href="packages.html">View packages</a>
        <a class="btn btn-outline" href="destinations.html">Destination guides</a>
        <a class="btn btn-outline" target="_blank" rel="noopener noreferrer" href="https://wa.me/919824044070?text=${encodeURIComponent('Hi Dharti Holidays, I read your article "' + p.title + '" and would like some help planning.')}">Chat on WhatsApp</a>
      </div>
    </div>
  </div></section>
  ${related.length ? `<section class="dd-related"><div class="wrap"><h2>More from our blog</h2><div class="blog-grid">${related.map(relatedCard).join('')}</div></div></section>` : ''}`;
  document.getElementById('copyLinkBtn').addEventListener('click', (e) => {
    if (navigator.clipboard) navigator.clipboard.writeText(url).then(() => { e.target.textContent = 'Link copied ✓'; });
  });
}

async function load() {
  if (typeof APPS_SCRIPT_URL === 'undefined' || APPS_SCRIPT_URL.includes('PASTE_YOUR')) { root.innerHTML = '<div class="wrap"><p class="dd-loading">Articles will appear here once connected.</p></div>'; return; }
  try {
    const [pRes, lRes] = await Promise.all([
      fetch(`${APPS_SCRIPT_URL}?action=getPost&id=${encodeURIComponent(wantedId || '')}`),
      fetch(`${APPS_SCRIPT_URL}?action=listPosts`)
    ]);
    const p = await pRes.json(); const all = await lRes.json();
    if (!p || p.error) { root.innerHTML = '<div class="wrap"><div class="dd-loading"><h2>Article not found</h2><p style="margin:10px 0 20px;">It may have been unpublished or the link is incorrect.</p><a class="btn btn-primary" href="blog.html">See all articles</a></div></div>'; return; }
    render(p, Array.isArray(all) ? all : []);
  } catch (err) { root.innerHTML = '<div class="wrap"><p class="dd-loading">Could not load this article right now — please try again shortly.</p></div>'; console.error(err); }
}
load();


// Each item has its own address, so the canonical + og:url are written here (not fixed in the HTML)
function setCanonicalUrl(u) {
  let l = document.querySelector('link[rel="canonical"]');
  if (!l) { l = document.createElement('link'); l.rel = 'canonical'; document.head.appendChild(l); }
  l.href = u;
  let og = document.querySelector('meta[property="og:url"]');
  if (!og) { og = document.createElement('meta'); og.setAttribute('property', 'og:url'); document.head.appendChild(og); }
  og.content = u;
}
