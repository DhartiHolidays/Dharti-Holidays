/* package.html — a package's itinerary, hotel category choice, extra hotels, PDF download and enquiry */
document.getElementById('year').textContent = new Date().getFullYear();
const hdr = document.getElementById('siteHeader');
document.getElementById('navToggle').addEventListener('click', () => hdr.classList.toggle('open'));

const LOGO_SRC = 'data:image/jpeg;base64,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';
const PRINT_IMG_WAIT = 9000;
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// Tidy text typed/pasted into admin: drop a repeated "Day 1 —" prefix and leading + - • markers
const cleanDayTitle = t => String(t == null ? '' : t).replace(/^\s*day\s*\d+\s*[-–—:.)]*\s*/i, '').trim();
const cleanList = arr => (Array.isArray(arr) ? arr : []).map(x => String(x == null ? '' : x).replace(/^[\s+\-–—•*·]+/, '').trim())
  .filter(x => x && !/^(inclusions?|exclusions?|included|not included|excluded)\s*:?$/i.test(x));
function getDays() {
  return (D.days || []).map(d => ({ title: cleanDayTitle(d.title), desc: d.desc || '', photos: Array.isArray(d.photos) ? d.photos.filter(Boolean) : [] }))
    .filter(d => d.title || d.desc || d.photos.length);
}
const dayPhotosPage = d => d.photos.length ? `<div class="pk-day-photos">${d.photos.map(u => `<img src="${esc(u)}" alt="${esc(d.title || 'Itinerary photo')}" loading="lazy" width="320" height="200">`).join('')}</div>` : '';
const dayPhotosPrint = d => d.photos.length ? `<div class="pk-print-photos">${d.photos.map(u => `<img src="${esc(u)}" alt="">`).join('')}</div>` : '';
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
  const c = document.querySelector('link[rel="canonical"]'); setCanonicalUrl(url);
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
  const days = getDays();
  const inc = cleanList(D.inclusions), exc = cleanList(D.exclusions);
  const hotelRows = (t.hotels || []).map(h => `<tr><td><strong>${esc(h.name)}</strong></td><td>${esc(h.city || '')}</td><td>${esc(tier)} Star</td></tr>`).join('');
  const extraRows = extras.map(h => `<tr><td><strong>${esc(h.name)}</strong></td><td>${esc(h.city || '')}</td><td>Requested by you</td></tr>`).join('');
  const price = fmtPrice(t.price) || fmtPrice(PKG.price);
  const unit = PKG.priceUnit || 'per person';
  return `<div class="itin-doc">
    <div class="itin-doc-head">
      <div class="itin-doc-head-brand"><img src="${LOGO_SRC}" alt="Dharti Holidays"><div><strong>Dharti Holidays</strong><span>Ahmedabad · Travel Desk</span></div></div>
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
    ${days.length ? `<div class="itin-section" style="padding-top:0;"><div class="itin-section-title">Day-Wise Itinerary</div>${days.map((d, i) => `<div class="itin-day-card"><div class="itin-day-head"><span class="day-title">Day ${i + 1}${d.title ? ' — ' + esc(d.title) : ''}</span></div><div class="itin-day-body"><p>${esc(d.desc || '').replace(/\n/g, '<br>')}</p>${dayPhotosPrint(d)}</div></div>`).join('')}</div>` : ''}
    ${(inc.length || exc.length) ? `<div class="itin-section" style="padding-top:0;"><div class="itin-section-title">Inclusions &amp; Exclusions</div><div class="pk-print-cols"><div><h4>Included</h4><ul>${inc.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div><div><h4>Not included</h4><ul>${exc.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div></div></div>` : ''}
    ${price ? `<div class="itin-section" style="padding-top:0;"><div class="itin-section-title">Starting Price</div><div class="itin-price-panel"><div><div class="price-label">${esc(unit)}${tier ? ' · ' + esc(tier) + ' Star hotels' : ''}</div><div class="price-amount">${esc(price)}</div></div><div class="price-total"><span class="price-label">Indicative</span><strong>Final price in your quote</strong></div></div></div>` : ''}
    ${D.notes ? `<div class="itin-section" style="padding-top:0;"><div class="itin-section-title">Notes</div><p style="font-size:12px;">${esc(D.notes).replace(/\n/g, '<br>')}</p></div>` : ''}
    <div class="itin-doc-foot"><div class="itin-thank-you">Thank you for considering Dharti Holidays</div>
      <p>Call: +91 93746 15071 · +91 98797 52230 · WhatsApp: +91 98240 44070 · dhartiholidays@gmail.com</p>
      <p>Instagram: @dhartiholidays_amd · Facebook: @dhartiholidays · www.dhartiholidays.com</p></div>
  </div>`;
}

async function downloadPdf() {
  const nm = (document.getElementById('pkName') || {}).value || '';
  const pr = document.getElementById('itinPrint');
  pr.innerHTML = buildPrintDoc(nm.trim());
  const btns = Array.from(document.querySelectorAll('#pkDownload, #pkDownload2'));
  btns.forEach(b => { b.disabled = true; b.dataset.label = b.textContent; b.textContent = 'Preparing PDF...'; });
  const imgs = Array.from(pr.querySelectorAll('img'));
  const ready = Promise.all(imgs.map(img => (img.complete && img.naturalWidth) ? Promise.resolve() : new Promise(r => { img.addEventListener('load', r); img.addEventListener('error', r); })));
  await Promise.race([ready, new Promise(r => setTimeout(r, PRINT_IMG_WAIT))]);
  await Promise.all(imgs.map(i => (i.decode ? i.decode().catch(() => {}) : null)));
  const old = document.title;
  document.title = 'Dharti Holidays - ' + title() + ' Itinerary';
  const restore = () => { document.title = old; window.removeEventListener('afterprint', restore); };
  window.addEventListener('afterprint', restore);
  btns.forEach(b => { b.disabled = false; b.textContent = b.dataset.label; });
  window.print();
}

function render() {
  const keys = tierKeys();
  if (keys.length) tier = keys.includes(tier) ? tier : keys[0];
  const days = getDays();
  const inc = cleanList(D.inclusions), exc = cleanList(D.exclusions);
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
      ${days.length ? `<h2>Day-wise itinerary</h2><div class="pk-days">${days.map((d, i) => `<div class="pk-day"><div class="pk-day-n">Day ${i + 1}</div><div><h3>${esc(d.title || '')}</h3><p>${esc(d.desc || '').replace(/\n/g, '<br>')}</p>${dayPhotosPage(d)}</div></div>`).join('')}</div>` : '<p class="pk-muted" style="margin-top:20px;">The detailed day-wise plan for this package is prepared with your quote — send an enquiry and we\'ll share it.</p>'}
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


// Each item has its own address, so the canonical + og:url are written here (not fixed in the HTML)
function setCanonicalUrl(u) {
  let l = document.querySelector('link[rel="canonical"]');
  if (!l) { l = document.createElement('link'); l.rel = 'canonical'; document.head.appendChild(l); }
  l.href = u;
  let og = document.querySelector('meta[property="og:url"]');
  if (!og) { og = document.createElement('meta'); og.setAttribute('property', 'og:url'); document.head.appendChild(og); }
  og.content = u;
}
