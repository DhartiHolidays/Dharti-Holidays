/* package.html — a package's itinerary, hotel category choice, extra hotels, PDF download and enquiry */
document.getElementById('year').textContent = new Date().getFullYear();
const hdr = document.getElementById('siteHeader');
document.getElementById('navToggle').addEventListener('click', () => hdr.classList.toggle('open'));

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const lines = t => String(t == null ? '' : t).split('\n').map(x => x.trim()).filter(Boolean);
function fmtPrice(p) {
  const s = String(p == null ? '' : p).trim();
  if (!s || /^[-–—\s]+$/.test(s)) return '';
  if (/^[\d,.]+$/.test(s)) return '₹' + Number(s.replace(/,/g, '')).toLocaleString('en-IN');
  return s;
}
const TIER_KEYS = ['3', '4', '5'];
const SOCIAL = { instagram: 'https://www.instagram.com/dhartiholidays_amd/', facebook: 'https://www.facebook.com/dhartiholidays' };

let PKG = null, D = {}, tier = '', extras = [], catalog = [], catalogById = {};
const root = document.getElementById('pkRoot');
const wantedId = new URLSearchParams(location.search).get('id');

function parseDetails(p) { try { const d = typeof p.details === 'string' ? JSON.parse(p.details || '{}') : (p.details || {}); return d && typeof d === 'object' ? d : {}; } catch (e) { return {}; } }
const tierData = k => (D.tiers && D.tiers[k]) || {};
const tierKeys = () => TIER_KEYS.filter(k => { const t = tierData(k); return (t.hotels && t.hotels.length) || t.price; });
const title = () => PKG.destinationLabel || ((PKG.routeFrom && PKG.routeTo) ? PKG.routeFrom + ' → ' + PKG.routeTo : 'Holiday Package');
function coverOf(h) { if (h && h.photos) for (const k of Object.keys(h.photos)) if (h.photos[k] && h.photos[k].length) return h.photos[k][0]; return ''; }

function metaChips() {
  return [[PKG.meta1Label, PKG.meta1Value], [PKG.meta2Label, PKG.meta2Value], [PKG.meta3Label, PKG.meta3Value]]
    .filter(m => m[1]).map(m => `<div><span>${esc(m[0])}</span><strong>${esc(m[1])}</strong></div>`).join('');
}

function setMeta() {
  const fromAhd = /AMD|ahmedabad/i.test(PKG.routeFrom || '');
  document.title = `${title()} Holiday Package${fromAhd ? ' from Ahmedabad' : ''} — Itinerary, Hotels & Price | Dharti Holidays`;
  const desc = String(D.overview || PKG.description || '').replace(/\s+/g, ' ').slice(0, 155);
  let m = document.querySelector('meta[name="description"]');
  if (!m) { m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m); }
  m.content = desc;
  const url = location.origin + '/package.html?id=' + encodeURIComponent(PKG.id);
  const c = document.querySelector('link[rel="canonical"]'); if (c) c.href = url;
  const ld = { '@context': 'https://schema.org', '@type': 'TouristTrip', name: title(), description: desc, url, provider: { '@type': 'TravelAgency', name: 'Dharti Holidays' } };
  if (PKG.photoUrl) ld.image = PKG.photoUrl;
  if (/^[\d,.]+$/.test(String(PKG.price || '').trim())) ld.offers = { '@type': 'Offer', priceCurrency: 'INR', price: String(PKG.price).replace(/,/g, '') };
  const s = document.createElement('script'); s.type = 'application/ld+json'; s.textContent = JSON.stringify(ld); document.head.appendChild(s);
}

function hotelRow(h) {
  const c = h.hotelId ? catalogById[h.hotelId] : null;
  const photo = c ? coverOf(c) : '';
  return `<div class="pk-hotel">
    ${photo ? `<img src="${esc(photo)}" alt="${esc(h.name)}" loading="lazy" width="84" height="64">` : `<div class="pk-hotel-ph">${esc((h.name || '?').charAt(0))}</div>`}
    <div><strong>${esc(h.name)}</strong><span>${esc(h.city || (c && c.destinationName) || '')}${c && c.rating ? ' · ' + esc(c.rating) + '★' : ''}</span></div>
  </div>`;
}

function renderTier() {
  const keys = tierKeys();
  const tabs = document.getElementById('pkTabs'), body = document.getElementById('pkTierBody');
  if (!tabs) return;
  tabs.innerHTML = keys.map(k => `<button type="button" class="pk-tab${k === tier ? ' active' : ''}" data-tier="${k}">${k} Star</button>`).join('');
  const t = tierData(tier);
  const price = fmtPrice(t.price);
  body.innerHTML = (price ? `<p class="pk-tier-price">Package price with ${tier} Star hotels: <strong>${esc(price)}</strong> <small>per person · indicative</small></p>` : '')
    + ((t.hotels && t.hotels.length) ? t.hotels.map(hotelRow).join('') : '<p class="pk-muted">Hotels for this category are confirmed in your quote.</p>');
  renderSide();
}

function renderExtras() {
  const box = document.getElementById('pkExtras');
  if (!box) return;
  box.innerHTML = extras.length
    ? '<h4>Hotels you added</h4>' + extras.map((h, i) => `<div class="pk-chip">${esc(h.name)}${h.city ? ' <small>· ' + esc(h.city) + '</small>' : ''}<button type="button" data-remove="${i}" aria-label="Remove">✕</button></div>`).join('')
    : '';
}

function renderSide() {
  const t = tierData(tier);
  const el = document.getElementById('pkTierPriceSide');
  if (el) el.innerHTML = fmtPrice(t.price) ? `<div class="pk-side-tier">${esc(tier)} Star hotels: <strong>${esc(fmtPrice(t.price))}</strong></div>` : '';
}

function searchCatalog(q) {
  const out = document.getElementById('pkSearchResults');
  q = q.trim().toLowerCase();
  if (q.length < 2) { out.innerHTML = ''; return; }
  const hits = catalog.filter(h => (String(h.hotelName) + ' ' + (h.destinationName || '') + ' ' + (h.location || '')).toLowerCase().includes(q)).slice(0, 8);
  out.innerHTML = hits.length ? hits.map(h => `<div class="pk-result"><div><strong>${esc(h.hotelName)}</strong><span>${esc(h.destinationName || h.location || '')} · ${esc(h.category || '')}${Number(h.price) ? ' · ₹' + Number(h.price).toLocaleString('en-IN') + '/night' : ''}</span></div><button type="button" class="btn btn-outline-dark" style="padding:7px 14px;" data-add="${esc(h.id)}">Add</button></div>`).join('')
    : '<p class="pk-muted">No match in our hotel list. You can still ask us for any hotel in the notes of your enquiry.</p>';
}

function summaryText(name, phone, date, pax, notes) {
  const t = tierData(tier);
  let m = `Hi Dharti Holidays, I'd like a quote for this package:\n\nPackage: ${title()}`;
  if (PKG.routeFrom && PKG.routeTo) m += ` (${PKG.routeFrom} → ${PKG.routeTo})`;
  if (tier) m += `\nHotel category: ${tier} Star` + (fmtPrice(t.price) ? ` (shown: ${fmtPrice(t.price)} per person)` : '');
  else if (fmtPrice(PKG.price)) m += `\nPrice shown: ${fmtPrice(PKG.price)}${PKG.priceUnit ? ' ' + PKG.priceUnit : ''}`;
  if (tier && t.hotels && t.hotels.length) m += `\nPackage hotels: ${t.hotels.map(h => h.name).join(', ')}`;
  if (extras.length) m += `\nExtra hotels I'd like: ${extras.map(h => h.name + (h.city ? ' (' + h.city + ')' : '')).join(', ')}`;
  m += `\nTravellers: ${pax}`;
  if (date) m += `\nTravel date: ${date}`;
  m += `\nName: ${name}\nPhone: ${phone}`;
  if (notes) m += `\nNotes: ${notes}`;
  return m;
}

function buildPrintDoc(clientName) {
  const t = tierData(tier);
  const days = (D.days || []).filter(d => d.title || d.desc);
  const inc = D.inclusions || [], exc = D.exclusions || [];
  const hotelRows = (t.hotels || []).map(h => `<tr><td><strong>${esc(h.name)}</strong></td><td>${esc(h.city || '')}</td><td>${esc(tier)} Star</td></tr>`).join('');
  const extraRows = extras.map(h => `<tr><td><strong>${esc(h.name)}</strong></td><td>${esc(h.city || '')}</td><td>Requested by you</td></tr>`).join('');
  const price = fmtPrice(t.price) || fmtPrice(PKG.price);
  const unit = PKG.priceUnit || 'per person';
  return `<div class="itin-doc">
    <div class="itin-doc-head">
      <div class="itin-doc-head-brand"><img src="images/logo-192.webp" alt="Dharti Holidays"><div><strong>Dharti Holidays</strong><span>Ahmedabad · Travel Desk</span></div></div>
      <div class="itin-doc-head-right">521, Satya-2, Ranna Park, Naranpura, Ahmedabad 380013<br>+91 93746 15071 · +91 98797 52230<br>dhartiholidays@gmail.com · www.dhartiholidays.com</div>
    </div>
    <div class="itin-intro"><p><strong>${esc(title())}</strong> — itinerary${clientName ? ' prepared for ' + esc(clientName) : ''}</p>
      <div class="itin-note">This is an indicative itinerary. Hotels, sightseeing, transfers and prices are confirmed in your personalised quote.</div></div>
    <div class="itin-section"><div class="itin-section-title">Package Overview</div>
      <div class="itin-overview">
        <div class="itin-overview-top"><div class="trip-id">Route<strong>${esc(PKG.routeFrom && PKG.routeTo ? PKG.routeFrom + ' → ' + PKG.routeTo : title())}</strong></div>${PKG.tag ? `<div class="status-tag">${esc(PKG.tag)}</div>` : ''}</div>
        <div class="itin-overview-grid">${[[PKG.meta1Label, PKG.meta1Value], [PKG.meta2Label, PKG.meta2Value], [PKG.meta3Label, PKG.meta3Value]].filter(m => m[1]).map(m => `<div><span>${esc(m[0])}</span><strong>${esc(m[1])}</strong></div>`).join('')}${tier ? `<div><span>Hotel category</span><strong>${esc(tier)} Star</strong></div>` : ''}</div>
      </div>
      ${D.overview || PKG.description ? `<p style="margin-top:12px;font-size:12.5px;">${esc(D.overview || PKG.description)}</p>` : ''}
    </div>
    ${(hotelRows || extraRows) ? `<div class="itin-section" style="padding-top:0;"><div class="itin-section-title">Hotels</div><table class="itin-hotel-table"><thead><tr><th>Hotel</th><th>City</th><th>Category</th></tr></thead><tbody>${hotelRows}${extraRows}</tbody></table></div>` : ''}
    ${days.length ? `<div class="itin-section" style="padding-top:0;"><div class="itin-section-title">Day-Wise Itinerary</div>${days.map((d, i) => `<div class="itin-day-card"><div class="itin-day-head"><span class="day-title">Day ${i + 1}${d.title ? ' — ' + esc(d.title) : ''}</span></div><div class="itin-day-body"><p>${esc(d.desc || '').replace(/\n/g, '<br>')}</p></div></div>`).join('')}</div>` : ''}
    ${(inc.length || exc.length) ? `<div class="itin-section" style="padding-top:0;"><div class="itin-section-title">Inclusions &amp; Exclusions</div><div class="pk-print-cols"><div><h4>Included</h4><ul>${inc.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div><div><h4>Not included</h4><ul>${exc.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div></div></div>` : ''}
    ${price ? `<div class="itin-section" style="padding-top:0;"><div class="itin-section-title">Starting Price</div><div class="itin-price-panel"><div><div class="price-label">${esc(unit)}${tier ? ' · ' + esc(tier) + ' Star hotels' : ''}</div><div class="price-amount">${esc(price)}</div></div><div class="price-total"><span class="price-label">Indicative</span><strong>Final price in your quote</strong></div></div></div>` : ''}
    ${D.notes ? `<div class="itin-section" style="padding-top:0;"><div class="itin-section-title">Notes</div><p style="font-size:12px;">${esc(D.notes).replace(/\n/g, '<br>')}</p></div>` : ''}
    <div class="itin-doc-foot"><div class="itin-thank-you">Thank you for considering Dharti Holidays</div>
      <p>Call / WhatsApp: +91 93746 15071 · +91 98240 44070 · dhartiholidays@gmail.com</p>
      <p>Instagram: @dhartiholidays_amd · Facebook: @dhartiholidays · www.dhartiholidays.com</p></div>
  </div>`;
}

function downloadPdf() {
  const nm = (document.getElementById('pkName') || {}).value || '';
  document.getElementById('itinPrint').innerHTML = buildPrintDoc(nm.trim());
  const old = document.title;
  document.title = 'Dharti Holidays - ' + title() + ' Itinerary';
  const restore = () => { document.title = old; window.removeEventListener('afterprint', restore); };
  window.addEventListener('afterprint', restore);
  setTimeout(() => window.print(), 150);
}

function render() {
  const keys = tierKeys();
  if (keys.length) tier = keys.includes(tier) ? tier : keys[0];
  const days = (D.days || []).filter(d => d.title || d.desc);
  const inc = D.inclusions || [], exc = D.exclusions || [];
  const priceMain = fmtPrice(PKG.price);
  root.innerHTML = `
  <section class="pk-hero"><div class="wrap pk-hero-grid">
    <div class="pk-cover">${PKG.photoUrl ? `<img src="${esc(PKG.photoUrl)}" alt="${esc(title())}" width="900" height="560">` : `<div class="dg-placeholder big"><span>${esc(title())}</span></div>`}</div>
    <div class="pk-intro">
      ${PKG.tag ? `<span class="eyebrow">${esc(PKG.tag)}</span>` : ''}
      <h1>${esc(title())}</h1>
      ${PKG.routeFrom && PKG.routeTo ? `<p class="pk-route">${esc(PKG.routeFrom)} → ${esc(PKG.routeTo)}</p>` : ''}
      <p class="pk-desc">${esc(PKG.description || '')}</p>
      <div class="dd-facts">${metaChips()}</div>
      ${priceMain ? `<div class="pk-price"><span>Starting from</span><strong>${esc(priceMain)}</strong> <small>${esc(PKG.priceUnit || 'per person')}</small></div>` : ''}
      <div class="dd-actions"><a class="btn btn-primary" href="#pkEnquiry">Enquire now</a><button type="button" class="btn btn-outline-dark" id="pkDownload">Download itinerary (PDF)</button></div>
    </div>
  </div></section>

  <section class="dd-section"><div class="wrap dd-cols">
    <div class="dd-main-col">
      ${D.overview ? `<h2>Overview</h2><p class="dd-overview">${esc(D.overview).replace(/\n/g, '<br>')}</p>` : ''}
      ${keys.length ? `<h2>Choose your hotel category</h2><div class="pk-tabs" id="pkTabs"></div><div id="pkTierBody"></div>` : ''}
      <h2>Add a hotel of your choice</h2>
      <p class="pk-muted">Want to stay somewhere specific? Search our hotel list and add it — we'll include it in your quote. <a href="hotels.html" style="color:var(--gold);font-weight:700;">Browse all hotels →</a></p>
      <input type="text" id="pkHotelSearch" class="pk-search" placeholder="Search a hotel or city, e.g. Goa, Dubai, Taj..." autocomplete="off">
      <div id="pkSearchResults"></div><div id="pkExtras"></div>
      ${days.length ? `<h2>Day-wise itinerary</h2><div class="pk-days">${days.map((d, i) => `<div class="pk-day"><div class="pk-day-n">Day ${i + 1}</div><div><h3>${esc(d.title || '')}</h3><p>${esc(d.desc || '').replace(/\n/g, '<br>')}</p></div></div>`).join('')}</div>` : '<p class="pk-muted" style="margin-top:20px;">The detailed day-wise plan for this package is prepared with your quote — send an enquiry and we\'ll share it.</p>'}
      ${(inc.length || exc.length) ? `<div class="pk-ie">${inc.length ? `<div><h2>Included</h2><ul class="pk-list pk-yes">${inc.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>` : ''}${exc.length ? `<div><h2>Not included</h2><ul class="pk-list pk-no">${exc.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>` : ''}</div>` : ''}
      ${D.notes ? `<h2>Good to know</h2><p class="dd-overview">${esc(D.notes).replace(/\n/g, '<br>')}</p>` : ''}
    </div>
    <aside class="dd-enquiry" id="pkEnquiry">
      <h3>Enquire about this package</h3>
      <p>Tell us your plan and we'll send a personal quote with your chosen hotels.</p>
      <div id="pkTierPriceSide"></div>
      <form class="dd-form" id="pkForm">
        <div class="field"><label for="pkName">Your name</label><input type="text" id="pkName" required placeholder="Full name"></div>
        <div class="field"><label for="pkPhone">Phone number</label><input type="tel" id="pkPhone" required placeholder="+91"></div>
        <div class="field"><label for="pkDate">Travel date (approx.)</label><input type="text" id="pkDate" placeholder="e.g. 20 Dec, or flexible"></div>
        <div class="field"><label for="pkPax">Travellers</label><input type="number" id="pkPax" min="1" value="2"></div>
        <div class="field"><label for="pkNotes">Anything else? (optional)</label><textarea id="pkNotes" placeholder="Budget, special requests..."></textarea></div>
        <button type="submit" class="btn btn-primary">Send Enquiry</button>
      </form>
      <button type="button" class="btn btn-outline" id="pkDownload2" style="width:100%;justify-content:center;margin-top:12px;">Download itinerary (PDF)</button>
      <p class="pk-hint">In the print window, choose <strong>Save as PDF</strong>.</p>
    </aside>
  </div></section>`;

  renderTier(); renderExtras();
  document.getElementById('pkDownload').addEventListener('click', downloadPdf);
  document.getElementById('pkDownload2').addEventListener('click', downloadPdf);
  root.addEventListener('click', (e) => {
    const tb = e.target.closest('[data-tier]'); if (tb) { tier = tb.dataset.tier; renderTier(); return; }
    const ad = e.target.closest('[data-add]');
    if (ad) { const h = catalogById[ad.dataset.add]; if (h && !extras.some(x => x.name === h.hotelName)) { extras.push({ name: h.hotelName, city: h.destinationName || h.location || '' }); renderExtras(); } return; }
    const rm = e.target.closest('[data-remove]'); if (rm) { extras.splice(Number(rm.dataset.remove), 1); renderExtras(); }
  });
  document.getElementById('pkHotelSearch').addEventListener('input', (e) => searchCatalog(e.target.value));
  document.getElementById('pkForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('pkName').value.trim(), phone = document.getElementById('pkPhone').value.trim();
    submitEnquiry('package', name, phone, summaryText(name, phone, document.getElementById('pkDate').value.trim(), document.getElementById('pkPax').value, document.getElementById('pkNotes').value.trim()));
    document.getElementById('pkForm').reset();
  });
}

async function loadCatalog() {
  try {
    const res = await fetch(`${APPS_SCRIPT_URL}?action=listApproved`);
    const rows = await res.json();
    catalog = Array.isArray(rows) ? rows : [];
    catalog.forEach(h => { catalogById[h.id] = h; });
    if (PKG) { renderTier(); }
  } catch (err) { console.warn('Hotel list unavailable', err); }
}

async function load() {
  if (typeof APPS_SCRIPT_URL === 'undefined' || APPS_SCRIPT_URL.includes('PASTE_YOUR')) { root.innerHTML = '<div class="wrap"><p class="dd-loading">Packages will appear here once connected.</p></div>'; return; }
  try {
    const res = await fetch(`${APPS_SCRIPT_URL}?action=listPackages`);
    const rows = await res.json();
    PKG = (Array.isArray(rows) ? rows : []).find(p => String(p.id) === String(wantedId));
    if (!PKG) { root.innerHTML = '<div class="wrap"><div class="dd-loading"><h2>Package not found</h2><p style="margin:10px 0 20px;">It may have been removed or the link is incorrect.</p><a class="btn btn-primary" href="packages.html">See all packages</a></div></div>'; return; }
    D = parseDetails(PKG);
    setMeta(); render(); loadCatalog();
  } catch (err) { root.innerHTML = '<div class="wrap"><p class="dd-loading">Could not load this package right now — please try again shortly.</p></div>'; console.error(err); }
}
load();
