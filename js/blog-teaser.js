/* Homepage: latest 3 blog posts (section stays hidden until there are published posts) */
(function () {
  const sec = document.getElementById('blogTeaser');
  if (!sec || typeof APPS_SCRIPT_URL === 'undefined' || APPS_SCRIPT_URL.includes('PASTE_YOUR')) return;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  fetch(`${APPS_SCRIPT_URL}?action=listPosts`).then(r => r.json()).then(rows => {
    if (!Array.isArray(rows) || !rows.length) return;
    document.getElementById('blogTeaserGrid').innerHTML = rows.slice(0, 3).map(p => {
      const media = p.coverUrl ? `<img src="${esc(p.coverUrl)}" alt="${esc(p.title)}" loading="lazy" width="600" height="400">` : `<div class="dg-placeholder"><span>${esc(p.category || 'Travel')}</span></div>`;
      return `<a class="blog-card" href="post.html?id=${encodeURIComponent(p.id)}"><div class="blog-media">${media}</div><div class="blog-body"><span class="blog-cat">${esc(p.category || 'Travel')}</span><h3>${esc(p.title)}</h3><p>${esc(p.summary || '')}</p></div></a>`;
    }).join('');
    sec.hidden = false;
  }).catch(() => {});
})();
