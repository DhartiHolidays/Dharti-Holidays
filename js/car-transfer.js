/* =========================================================
   car-transfer.html logic
   ========================================================= */

document.getElementById('year').textContent = new Date().getFullYear();

const header = document.getElementById('siteHeader');
document.getElementById('navToggle').addEventListener('click', () => header.classList.toggle('open'));

// ---------- Common city/location list (typeahead via <datalist>) ----------
const CITIES = [
  'Ahmedabad Airport', 'Ahmedabad Railway Station', 'Gandhinagar', 'Vadodara', 'Surat',
  'Rajkot', 'Bhavnagar', 'Junagadh', 'Dwarka', 'Somnath', 'Diu', 'Mount Abu',
  'Udaipur', 'Jaipur', 'Jodhpur', 'Mumbai', 'Pune', 'Goa', 'Indore', 'Ujjain',
];
const cityListEl = document.getElementById('cityList');
CITIES.forEach(c => {
  const opt = document.createElement('option');
  opt.value = c;
  cityListEl.appendChild(opt);
});

// ---------- Trip type switching ----------
let tripType = 'oneway';
const tripTypeBtns = document.querySelectorAll('.trip-type-btn');
const returnDateField = document.getElementById('returnDateField');

tripTypeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tripTypeBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    tripType = btn.dataset.type;
    returnDateField.hidden = tripType !== 'roundtrip';
    document.getElementById('returnDate').required = tripType === 'roundtrip';
  });
});

// ---------- Submit ----------
document.getElementById('carTransferForm').addEventListener('submit', (e) => {
  e.preventDefault();

  const from = document.getElementById('fromLocation').value.trim();
  const to = document.getElementById('toLocation').value.trim();
  const pickupDate = document.getElementById('pickupDate').value;
  const pickupTime = document.getElementById('pickupTime').value;
  const returnDate = document.getElementById('returnDate').value;
  const carType = document.getElementById('carType').value;
  const pax = document.getElementById('paxCount').value;
  const name = document.getElementById('ctName').value.trim();
  const phone = document.getElementById('ctPhone').value.trim();
  const notes = document.getElementById('ctNotes').value.trim();

  const tripLabel = { oneway: 'One Way', roundtrip: 'Round Trip' }[tripType];

  let msg = `Hi Dharti Holidays, I'd like a car transfer quote:\n\n`;
  msg += `Trip Type: ${tripLabel}\n`;
  msg += `Pickup: ${from} on ${pickupDate} at ${pickupTime}\n`;
  msg += `Drop: ${to}\n`;
  if (tripType === 'roundtrip' && returnDate) msg += `Return Date: ${returnDate}\n`;
  const pickedVeh = (typeof vehicles !== 'undefined') ? vehicles.find(v => v.name === carType) : null;
  msg += pickedVeh
    ? `Vehicle: ${pickedVeh.name} (${pickedVeh.category}${pickedVeh.seats ? ', ' + pickedVeh.seats + ' seats' : ''})${pickedVeh.perKm ? ' — shown rate ₹' + pickedVeh.perKm + '/km' : ''}\n`
    : `Vehicle: ${carType}\n`;
  msg += `Passengers: ${pax}\n`;
  msg += `\nName: ${name}\nPhone: ${phone}`;
  if (notes) msg += `\nNotes: ${notes}`;

  submitEnquiry('car-transfer', name, phone, msg);

  document.getElementById('carTransferForm').reset();
  tripTypeBtns.forEach((b, i) => b.classList.toggle('active', i === 0));
  tripType = 'oneway';
  returnDateField.hidden = true;
});

// ?from=Ahmedabad&to=Udaipur — pre-fill the route (used by the "popular routes" links)
(function () {
  const p = new URLSearchParams(location.search);
  if (p.get('from')) document.getElementById('fromLocation').value = p.get('from');
  if (p.get('to')) document.getElementById('toLocation').value = p.get('to');
})();


/* =========================================================
   Vehicle cards (managed in admin -> Vehicles)
   ========================================================= */
let vehicles = [];
let vehCat = 'all';
const vEsc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const CAR_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11"/><rect x="3" y="11" width="18" height="6" rx="2"/><circle cx="7.5" cy="17" r="1.5"/><circle cx="16.5" cy="17" r="1.5"/></svg>';

function vehCardHtml(v) {
  const feats = String(v.features || '').split('\n').map(x => x.trim()).filter(Boolean);
  const extras = [v.minKmPerDay ? `Minimum ${vEsc(v.minKmPerDay)} km per day` : '', v.driverAllowance ? `Driver allowance ₹${vEsc(v.driverAllowance)} per day` : '', v.nightCharge ? `Night halt ₹${vEsc(v.nightCharge)}` : ''].filter(Boolean);
  const href = `vehicle.html?id=${encodeURIComponent(v.id)}`;
  return `<div class="veh-card">
    <a class="veh-card-link" href="${href}">
      <div class="veh-media">${v.photoUrl ? `<img src="${vEsc(v.photoUrl)}" alt="${vEsc(v.name)}" loading="lazy" width="600" height="340">` : CAR_SVG}<span class="veh-cat">${vEsc(v.category)}</span></div>
      <div class="veh-body">
        <h3>${vEsc(v.name)} ${v.similarTo ? `<small>${vEsc(v.similarTo)}</small>` : ''}</h3>
        <div class="veh-specs">
          <div><span>Seats</span><strong>${vEsc(v.seats || '—')}</strong></div>
          <div><span>Luggage</span><strong>${vEsc(v.luggage || '—')}</strong></div>
          <div><span>A/C</span><strong>${v.ac === 'No' ? 'No' : 'Yes'}</strong></div>
        </div>
        <div class="veh-rate">${v.perKm ? `<strong>₹${vEsc(v.perKm)}</strong><span>per km</span>` : '<span>Rate on request</span>'}</div>
        ${extras.length ? `<div class="veh-extra">${extras.map(vEsc).join('<br>')}</div>` : ''}
        ${feats.length ? `<div class="veh-features">${feats.map(f => `<span>${vEsc(f)}</span>`).join('')}</div>` : ''}
      </div>
    </a>
    <div style="padding:0 18px 18px;"><a class="btn btn-primary" href="${href}">View details &amp; enquire →</a></div>
  </div>`;
}

function renderVehicles() {
  document.getElementById('vehGrid').innerHTML = vehicles.filter(v => vehCat === 'all' || v.category === vehCat).map(vehCardHtml).join('');
}

function buildVehFilter() {
  const cats = Array.from(new Set(vehicles.map(v => v.category).filter(Boolean)));
  const f = document.getElementById('vehFilter');
  f.innerHTML = ['all'].concat(cats).map(c => `<button class="region-btn${c === vehCat ? ' active' : ''}" data-cat="${vEsc(c)}">${c === 'all' ? 'All' : vEsc(c)}</button>`).join('');
  f.querySelectorAll('.region-btn').forEach(b => b.addEventListener('click', () => { vehCat = b.dataset.cat; f.querySelectorAll('.region-btn').forEach(x => x.classList.toggle('active', x === b)); renderVehicles(); }));
}

function rebuildCarSelect() {
  const sel = document.getElementById('carType');
  sel.innerHTML = vehicles.map(v => `<option value="${vEsc(v.name)}">${vEsc(v.name)} — ${vEsc(v.category)}${v.seats ? ' (' + vEsc(v.seats) + ' seats)' : ''}</option>`).join('') + '<option value="Not Sure — Suggest One">Not sure — suggest one for me</option>';
}


(async function loadVehicles() {
  if (typeof APPS_SCRIPT_URL === 'undefined' || APPS_SCRIPT_URL.includes('PASTE_YOUR')) return;
  try {
    const res = await fetch(`${APPS_SCRIPT_URL}?action=listVehicles`);
    const rows = await res.json();
    if (!Array.isArray(rows) || !rows.length) return;      // nothing added in admin yet: keep the simple dropdown
    vehicles = rows;
    rebuildCarSelect(); document.getElementById('carType').value = 'Not Sure — Suggest One'; buildVehFilter(); renderVehicles();
    const f = document.getElementById('carTransferForm'); if (f && !document.getElementById('vehFormNote')) f.insertAdjacentHTML('beforebegin', '<p id="vehFormNote" class="veh-sub" style="margin-bottom:14px;"><strong>Not sure which vehicle?</strong> Tell us your trip below and we\'ll suggest the right one. Or pick a vehicle above to see its details and enquire for it directly.</p>');
    document.getElementById('vehicleSection').hidden = false;
  } catch (err) { console.warn('Vehicles unavailable', err); }
})();
