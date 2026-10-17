/* vehicle.html — one vehicle's details + trip enquiry form */
document.getElementById('year').textContent = new Date().getFullYear();
const hdr = document.getElementById('siteHeader');
document.getElementById('navToggle').addEventListener('click', () => hdr.classList.toggle('open'));

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = v => { const s = String(v == null ? '' : v).trim(); return !s ? '' : (/^[\d,.]+$/.test(s) ? '₹' + Number(s.replace(/,/g, '')).toLocaleString('en-IN') : s); };
const CAR_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11"/><rect x="3" y="11" width="18" height="6" rx="2"/><circle cx="7.5" cy="17" r="1.5"/><circle cx="16.5" cy="17" r="1.5"/></svg>';
const CITIES = ['Ahmedabad Airport', 'Ahmedabad Railway Station', 'Ahmedabad City', 'Gandhinagar', 'Vadodara', 'Surat', 'Rajkot', 'Bhavnagar', 'Junagadh', 'Dwarka', 'Somnath', 'Diu', 'Mount Abu', 'Udaipur', 'Jaipur', 'Jodhpur', 'Mumbai', 'Pune', 'Goa', 'Indore', 'Ujjain'];
const root = document.getElementById('vehRoot');
const wantedId = new URLSearchParams(location.search).get('id');
let V = null, tripType = 'oneway';

function todayStr() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }

function setMeta() {
  document.title = `${V.name} ${V.category ? V.category + ' ' : ''}Cab on Rent from Ahmedabad — Rate per km & Booking | Dharti Holidays`;
  const desc = `${V.name}${V.similarTo ? ' ' + V.similarTo : ''} — ${V.category || 'car'}${V.seats ? ', ' + V.seats + ' seater' : ''}${V.perKm ? ', ₹' + V.perKm + ' per km' : ''}. Enquire with Dharti Holidays, Ahmedabad for outstation trips and airport transfers.`;
  let m = document.querySelector('meta[name="description"]');
  if (!m) { m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m); }
  m.content = desc.slice(0, 160);
  const c = document.querySelector('link[rel="canonical"]'); if (c) c.href = location.origin + '/vehicle.html?id=' + encodeURIComponent(V.id);
}

function otherCard(v) {
  const media = v.photoUrl ? `<img src="${esc(v.photoUrl)}" alt="${esc(v.name)}" loading="lazy" width="600" height="340">` : CAR_SVG;
  return `<a class="veh-card veh-card-link" href="vehicle.html?id=${encodeURIComponent(v.id)}"><div class="veh-media">${media}<span class="veh-cat">${esc(v.category)}</span></div><div class="veh-body"><h3>${esc(v.name)}</h3><div class="veh-rate">${v.perKm ? `<strong>₹${esc(v.perKm)}</strong><span>per km</span>` : '<span>Rate on request</span>'}</div></div></a>`;
}

function render(all) {
  const feats = String(V.features || '').split('\n').map(x => x.trim()).filter(Boolean);
  const rows = [['Category', V.category], ['Seating capacity', V.seats ? V.seats + ' passengers' : ''], ['Luggage space', V.luggage], ['Air conditioning', V.ac === 'No' ? 'No' : 'Yes'],
    ['Rate per km', money(V.perKm) ? money(V.perKm) + ' per km' : ''], ['Minimum km per day', V.minKmPerDay ? V.minKmPerDay + ' km' : ''], ['Driver allowance', money(V.driverAllowance) ? money(V.driverAllowance) + ' per day' : ''], ['Night halt charge', money(V.nightCharge)]].filter(r => r[1]);
  const others = all.filter(x => String(x.id) !== String(V.id)).slice(0, 3);
  root.innerHTML = `
  <section class="dd-hero"><div class="wrap dd-hero-grid">
    <div class="dd-gallery"><div class="dd-main">${V.photoUrl ? `<img src="${esc(V.photoUrl)}" alt="${esc(V.name)}" width="900" height="600">` : `<div class="vd-ph">${CAR_SVG}</div>`}</div></div>
    <div class="dd-intro">
      <span class="eyebrow">${esc(V.category || 'Vehicle')}</span>
      <h1>${esc(V.name)} ${V.similarTo ? `<small>${esc(V.similarTo)}</small>` : ''}</h1>
      <div class="dd-facts">
        <div><span>Seats</span><strong>${esc(V.seats || '—')}</strong></div>
        <div><span>Luggage</span><strong>${esc(V.luggage || '—')}</strong></div>
        <div><span>A/C</span><strong>${V.ac === 'No' ? 'No' : 'Yes'}</strong></div>
      </div>
      <div class="vd-rate">${money(V.perKm) ? `<strong>${esc(money(V.perKm))}</strong><span>per km</span>` : '<span>Rate on request — we confirm it in your quote</span>'}</div>
      <div class="dd-actions"><a class="btn btn-primary" href="#vdEnquiry">Enquire for this vehicle</a><a class="btn btn-outline-dark" href="car-transfer.html">See all vehicles</a></div>
    </div>
  </div></section>

  <section class="dd-section"><div class="wrap dd-cols">
    <div class="dd-main-col">
      <h2>Vehicle details</h2>
      <table class="vd-table">${rows.map(r => `<tr><th>${esc(r[0])}</th><td>${esc(r[1])}</td></tr>`).join('')}</table>
      ${feats.length ? `<h2>Features</h2><ul class="dd-chips">${feats.map(f => `<li>${esc(f)}</li>`).join('')}</ul>` : ''}
      <h2>How charges work</h2>
      <p class="vd-note">Charges depend on the kilometres travelled. For longer trips the minimum km per day, driver allowance and night halt charge shown above can apply. Tolls, parking and state taxes, where applicable, are stated in your quote. The rate shown is indicative; we confirm the final fare after you send your trip details.</p>
    </div>
    <aside class="dd-enquiry" id="vdEnquiry">
      <h3>Enquire for ${esc(V.name)}</h3>
      <p>Tell us about your trip and we'll confirm availability and the final fare.</p>
      <form class="dd-form" id="vdForm">
        <div class="vd-toggle" id="vdTrip"><button type="button" class="active" data-type="oneway">One Way</button><button type="button" data-type="roundtrip">Round Trip</button></div>
        <div class="field"><label for="vdFrom">Pickup location</label><input type="text" id="vdFrom" list="vdCities" required placeholder="e.g. Ahmedabad Airport"></div>
        <div class="field"><label for="vdTo">Drop location</label><input type="text" id="vdTo" list="vdCities" required placeholder="e.g. Udaipur"></div>
        <div class="vd-row2">
          <div class="field"><label for="vdDate">Pickup date</label><input type="date" id="vdDate" required min="${todayStr()}"></div>
          <div class="field"><label for="vdTime">Pickup time</label><input type="time" id="vdTime" required></div>
        </div>
        <div class="field" id="vdReturnField" hidden><label for="vdReturn">Return date</label><input type="date" id="vdReturn" min="${todayStr()}"></div>
        <div class="field"><label for="vdPax">Passengers</label><input type="number" id="vdPax" min="1" value="2" required><span class="vd-warn" id="vdPaxNote"></span></div>
        <div class="field"><label for="vdName">Your name</label><input type="text" id="vdName" required placeholder="Full name"></div>
        <div class="field"><label for="vdPhone">Phone number</label><input type="tel" id="vdPhone" required placeholder="+91"></div>
        <div class="field"><label for="vdNotes">Anything else? (optional)</label><textarea id="vdNotes" placeholder="Luggage, extra stops, flight number for pickup..."></textarea></div>
        <button type="submit" class="btn btn-primary">Send Enquiry</button>
      </form>
      <datalist id="vdCities">${CITIES.map(c => `<option value="${esc(c)}">`).join('')}</datalist>
    </aside>
  </div></section>
  ${others.length ? `<section class="dd-related"><div class="wrap"><h2>Other vehicles</h2><div class="veh-grid">${others.map(otherCard).join('')}</div></div></section>` : ''}`;

  document.getElementById('vdTrip').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-type]'); if (!b) return;
    tripType = b.dataset.type;
    document.querySelectorAll('#vdTrip button').forEach(x => x.classList.toggle('active', x === b));
    document.getElementById('vdReturnField').hidden = tripType !== 'roundtrip';
    document.getElementById('vdReturn').required = tripType === 'roundtrip';
  });
  document.getElementById('vdDate').addEventListener('change', (e) => { document.getElementById('vdReturn').min = e.target.value || todayStr(); });
  document.getElementById('vdPax').addEventListener('input', (e) => {
    const seats = parseInt(V.seats, 10), pax = parseInt(e.target.value, 10);
    document.getElementById('vdPaxNote').textContent = (seats && pax > seats) ? `This vehicle seats ${seats}. We'll suggest a bigger one if needed.` : '';
  });
  document.getElementById('vdForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const g = id => document.getElementById(id).value.trim();
    let msg = `Hi Dharti Holidays, I'd like a quote for a car transfer:\n\nVehicle: ${V.name}${V.similarTo ? ' ' + V.similarTo : ''} (${V.category || 'car'}${V.seats ? ', ' + V.seats + ' seats' : ''})`;
    if (money(V.perKm)) msg += `\nShown rate: ${money(V.perKm)} per km`;
    msg += `\nTrip type: ${tripType === 'roundtrip' ? 'Round Trip' : 'One Way'}\nPickup: ${g('vdFrom')} on ${g('vdDate')} at ${g('vdTime')}\nDrop: ${g('vdTo')}`;
    if (tripType === 'roundtrip' && g('vdReturn')) msg += `\nReturn date: ${g('vdReturn')}`;
    msg += `\nPassengers: ${g('vdPax')}\n\nName: ${g('vdName')}\nPhone: ${g('vdPhone')}`;
    if (g('vdNotes')) msg += `\nNotes: ${g('vdNotes')}`;
    submitEnquiry('car-transfer', g('vdName'), g('vdPhone'), msg);
    document.getElementById('vdForm').reset();
    document.getElementById('vdPaxNote').textContent = '';
  });
}

async function load() {
  if (typeof APPS_SCRIPT_URL === 'undefined' || APPS_SCRIPT_URL.includes('PASTE_YOUR')) { root.innerHTML = '<div class="wrap"><p class="dd-loading">Vehicles will appear here once connected.</p></div>'; return; }
  try {
    const res = await fetch(`${APPS_SCRIPT_URL}?action=listVehicles`);
    const rows = await res.json();
    const all = Array.isArray(rows) ? rows : [];
    V = all.find(x => String(x.id) === String(wantedId));
    if (!V) { root.innerHTML = '<div class="wrap"><div class="dd-loading"><h2>Vehicle not found</h2><p style="margin:10px 0 20px;">It may no longer be available or the link is incorrect.</p><a class="btn btn-primary" href="car-transfer.html">See all vehicles</a></div></div>'; return; }
    setMeta(); render(all);
  } catch (err) { root.innerHTML = '<div class="wrap"><p class="dd-loading">Could not load this vehicle right now — please try again shortly.</p></div>'; console.error(err); }
}
load();
