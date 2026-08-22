/* =========================================================
   index.html — Packages loader
   Fetches active packages from the Sheet (via Apps Script)
   and renders them into the existing tab structure. Falls
   back to a friendly message if the backend isn't connected
   yet or returns nothing.
   ========================================================= */

function packageTicketHtml(pkg) {
  const routeLabel = (pkg.routeFrom && pkg.routeTo)
    ? `${pkg.routeFrom} → ${pkg.routeTo}`
    : pkg.destinationLabel;
  const subLabel = (pkg.routeFrom && pkg.routeTo) ? pkg.destinationLabel : '';

  const priceDisplay = /^\d+$/.test(String(pkg.price))
    ? `₹${Number(pkg.price).toLocaleString('en-IN')}`
    : pkg.price;

  return `
    <article class="ticket">
      <div class="ticket-head">
        <div class="ticket-route">${routeLabel}${subLabel ? `<small>${subLabel}</small>` : ''}</div>
        <div class="ticket-tag">${pkg.tag || ''}</div>
      </div>
      <div class="ticket-perf"></div>
      <div class="ticket-body">
        <p>${pkg.description || ''}</p>
        <div class="ticket-meta">
          <span>${pkg.meta1Label || ''}<br><strong>${pkg.meta1Value || ''}</strong></span>
          <span>${pkg.meta2Label || ''}<br><strong>${pkg.meta2Value || ''}</strong></span>
          <span>${pkg.meta3Label || ''}<br><strong>${pkg.meta3Value || ''}</strong></span>
        </div>
      </div>
      <div class="ticket-foot">
        <div class="ticket-price">${priceDisplay}<span>${pkg.priceUnit || ''}</span></div>
        <a href="#contact" class="ticket-link">Enquire →</a>
      </div>
    </article>`;
}

async function loadPackages() {
  const grids = {
    domestic: document.querySelector('.pkg-grid[data-panel="domestic"]'),
    international: document.querySelector('.pkg-grid[data-panel="international"]'),
    honeymoon: document.querySelector('.pkg-grid[data-panel="honeymoon"]'),
    corporate: document.querySelector('.pkg-grid[data-panel="corporate"]'),
  };

  Object.values(grids).forEach(g => {
    if (g) g.innerHTML = '<p style="color:var(--slate); grid-column:1/-1;">Loading packages...</p>';
  });

  if (typeof APPS_SCRIPT_URL === 'undefined' || APPS_SCRIPT_URL.includes('PASTE_YOUR')) {
    Object.values(grids).forEach(g => {
      if (g) g.innerHTML = '<p style="color:var(--slate); grid-column:1/-1;">Packages will appear here once connected — contact us directly for current offers.</p>';
    });
    return;
  }

  try {
    const res = await fetch(`${APPS_SCRIPT_URL}?action=listPackages`);
    const rows = await res.json();

    Object.keys(grids).forEach(category => {
      const grid = grids[category];
      if (!grid) return;
      const items = (Array.isArray(rows) ? rows : []).filter(p => p.category === category);
      if (items.length === 0) {
        grid.innerHTML = '<p style="color:var(--slate); grid-column:1/-1;">No packages listed here yet — check back soon or contact us directly.</p>';
        return;
      }
      grid.innerHTML = items.map(packageTicketHtml).join('');
    });
  } catch (err) {
    console.warn('Could not load packages:', err);
    Object.values(grids).forEach(g => {
      if (g) g.innerHTML = '<p style="color:var(--slate); grid-column:1/-1;">Could not load packages right now — please contact us directly.</p>';
    });
  }
}

loadPackages();
