/* destination.html — one destination's guide, built from admin-managed data */
document.getElementById('year').textContent = new Date().getFullYear();
const hdr = document.getElementById('siteHeader');
document.getElementById('navToggle').addEventListener('click', () => hdr.classList.toggle('open'));

function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function photosOf(d) {
  try { const p = typeof d.photos === 'string' ? JSON.parse(d.photos || '[]') : (d.photos || []); return Array.isArray(p) ? p : []; }
  catch (e) { return []; }
}
function lines(t) { return String(t || '').split('\n').map(x => x.trim()).filter(Boolean); }

const root = document.getElementById('destRoot');
const wantedId = new URLSearchParams(location.search).get('id');

function relatedCard(d) {
  const photo = photosOf(d)[0];
  const media = photo ? `<img src="${esc(photo)}" alt="${esc(d.name)}" loading="lazy" width="600" height="400">` : `<div class="dg-placeholder"><span>${esc(d.name)}</span></div>`;
  return `<a class="dg-card" href="destination.html?id=${encodeURIComponent(d.id)}"><div class="dg-media">${media}</div><div class="dg-body"><h3>${esc(d.name)}</h3><p class="dg-loc">${esc(d.location || '')}</p><span class="dg-cta">View guide →</span></div></a>`;
}

function setMeta(d, photos) {
  const title = `${d.name} Travel Guide — Places to Visit, Food & Activities | Dharti Holidays`;
  document.title = title;
  const desc = (d.overview || d.tagline || `Plan your trip to ${d.name} with Dharti Holidays.`).replace(/\s+/g, ' ').slice(0, 155);
  let m = document.querySelector('meta[name="description"]');
  if (!m) { m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m); }
  m.content = desc;
  const canon = document.querySelector('link[rel="canonical"]');
  setCanonicalUrl(location.origin + '/destination.html?id=' + encodeURIComponent(d.id));
  const ld = document.createElement('script');
  ld.type = 'application/ld+json';
  ld.textContent = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'TouristDestination',
    name: d.name, description: d.overview || d.tagline || '', url: location.origin + '/destination.html?id=' + encodeURIComponent(d.id),
    ...(photos.length ? { image: photos } : {})
  });
  document.head.appendChild(ld);
}

function render(d, all) {
  const photos = photosOf(d);
  const places = lines(d.places), acts = lines(d.activities), foods = lines(d.food);
  const regionLabel = d.region === 'international' ? 'International' : 'Domestic';
  const related = all.filter(x => x.id !== d.id && x.region === d.region).slice(0, 4);
  setMeta(d, photos);

  root.innerHTML = `
  <section class="dd-hero"><div class="wrap dd-hero-grid">
    <div class="dd-gallery">
      <div class="dd-main">${photos[0]
        ? `<img id="ddMainImg" src="${esc(photos[0])}" alt="${esc(d.name)}" width="900" height="600">`
        : `<div class="dg-placeholder big"><span>${esc(d.name)}</span></div>`}</div>
      ${photos.length > 1 ? `<div class="dd-thumbs">${photos.map((p, i) => `<img src="${esc(p)}" data-src="${esc(p)}" alt="${esc(d.name)} photo ${i + 1}" loading="lazy" width="92" height="68">`).join('')}</div>` : ''}
    </div>
    <div class="dd-intro">
      <span class="eyebrow">${regionLabel} Destination</span>
      <h1>${esc(d.name)}</h1>
      <p class="dd-tagline">${esc(d.tagline || '')}</p>
      <div class="dd-facts">
        ${d.location ? `<div><span>Location</span><strong>${esc(d.location)}</strong></div>` : ''}
        ${d.bestTime ? `<div><span>Best time to visit</span><strong>${esc(d.bestTime)}</strong></div>` : ''}
        <div><span>Trip type</span><strong>${regionLabel}</strong></div>
      </div>
      <div class="dd-actions">
        <a class="btn btn-primary" href="#ddEnquiry">Plan this trip</a>
        <a class="btn btn-outline-dark" href="hotels.html?dest=${encodeURIComponent(d.id)}">Browse hotels</a>
        <a class="btn btn-outline-dark" href="packages.html?q=${encodeURIComponent(d.name)}">View packages</a>
      </div>
    </div>
  </div></section>

  <section class="dd-section"><div class="wrap dd-cols">
    <div class="dd-main-col">
      ${d.overview ? `<h2>About ${esc(d.name)}</h2><p class="dd-overview">${esc(d.overview).replace(/\n/g, '<br>')}</p>` : ''}
      ${places.length ? `<h2>Places to visit</h2><ol class="dd-places">${places.map(p => `<li>${esc(p)}</li>`).join('')}</ol>` : ''}
      ${acts.length ? `<h2>Things to do</h2><ul class="dd-chips">${acts.map(a => `<li>${esc(a)}</li>`).join('')}</ul>` : ''}
      ${foods.length ? `<h2>Food speciality</h2><ul class="dd-food">${foods.map(f => `<li>${esc(f)}</li>`).join('')}</ul>` : ''}
    </div>
    <aside class="dd-enquiry" id="ddEnquiry">
      <h3>Interested in ${esc(d.name)}?</h3>
      <p>Tell us your plan and we'll send a personal quote — flights, hotels and sightseeing included if you like.</p>
      <form class="dd-form" id="ddForm">
        <div class="field"><label for="ddName">Your name</label><input type="text" id="ddName" required placeholder="Full name"></div>
        <div class="field"><label for="ddPhone">Phone number</label><input type="tel" id="ddPhone" required placeholder="+91"></div>
        <div class="field"><label for="ddDates">Travel dates (approx.)</label><input type="text" id="ddDates" placeholder="e.g. 20–27 Dec"></div>
        <div class="field"><label for="ddPax">Travellers</label><input type="number" id="ddPax" min="1" value="2"></div>
        <div class="field"><label for="ddNotes">Anything else?</label><textarea id="ddNotes" placeholder="Budget, hotel type, interests..."></textarea></div>
        <button type="submit" class="btn btn-primary">Send Enquiry</button>
      </form>
    </aside>
  </div></section>

  ${related.length ? `<section class="dd-related"><div class="wrap"><h2>More ${regionLabel.toLowerCase()} destinations</h2><div class="dg-grid">${related.map(relatedCard).join('')}</div></div></section>` : ''}`;

  root.addEventListener('click', (e) => {
    const t = e.target.closest('.dd-thumbs img');
    const main = document.getElementById('ddMainImg');
    if (t && main) main.src = t.dataset.src;
  });

  document.getElementById('ddForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('ddName').value.trim();
    const phone = document.getElementById('ddPhone').value.trim();
    const dates = document.getElementById('ddDates').value.trim();
    const pax = document.getElementById('ddPax').value;
    const notes = document.getElementById('ddNotes').value.trim();
    let msg = `Hi Dharti Holidays, I'd like to plan a trip to ${d.name}:\n\nTravellers: ${pax}`;
    if (dates) msg += `\nTravel dates: ${dates}`;
    msg += `\nName: ${name}\nPhone: ${phone}`;
    if (notes) msg += `\nNotes: ${notes}`;
    submitEnquiry('destination', name, phone, msg);
    document.getElementById('ddForm').reset();
  });
}

async function load() {
  if (typeof APPS_SCRIPT_URL === 'undefined' || APPS_SCRIPT_URL.includes('PASTE_YOUR')) {
    root.innerHTML = '<div class="wrap"><p class="dd-loading">Destination guides will appear here once connected.</p></div>';
    return;
  }
  try {
    const res = await fetch(`${APPS_SCRIPT_URL}?action=listDestinations`);
    const rows = await res.json();
    const all = Array.isArray(rows) ? rows : [];
    const d = all.find(x => String(x.id) === String(wantedId));
    if (!d) {
      root.innerHTML = '<div class="wrap"><div class="dd-loading"><h2>Destination not found</h2><p style="margin:10px 0 20px;">It may have been removed or the link is incorrect.</p><a class="btn btn-primary" href="destinations.html">See all destinations</a></div></div>';
      return;
    }
    render(d, all);
  } catch (err) {
    root.innerHTML = '<div class="wrap"><p class="dd-loading">Could not load this guide right now — please try again shortly.</p></div>';
    console.error(err);
  }
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
