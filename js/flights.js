/* =========================================================
   flights.html logic
   ========================================================= */

document.getElementById('year').textContent = new Date().getFullYear();

const header = document.getElementById('siteHeader');
document.getElementById('navToggle').addEventListener('click', () => header.classList.toggle('open'));

// ---------- Common airport list (typeahead via <datalist>) ----------
const AIRPORTS = [
  'Ahmedabad (AMD)', 'Mumbai (BOM)', 'Delhi (DEL)', 'Bangalore (BLR)', 'Chennai (MAA)',
  'Kolkata (CCU)', 'Hyderabad (HYD)', 'Pune (PNQ)', 'Goa (GOI)', 'Kochi (COK)',
  'Jaipur (JAI)', 'Srinagar (SXR)', 'Leh (IXL)', 'Port Blair (IXZ)', 'Udaipur (UDR)',
  'Dubai (DXB)', 'Abu Dhabi (AUH)', 'Bangkok (BKK)', 'Singapore (SIN)', 'Kuala Lumpur (KUL)',
  'Kathmandu (KTM)', 'Bali - Denpasar (DPS)', 'Phuket (HKT)', 'Male (MLE)', 'London (LHR)',
  'Paris (CDG)', 'New York (JFK)', 'Toronto (YYZ)', 'Sydney (SYD)', 'Doha (DOH)',
];
const airportListEl = document.getElementById('airportList');
AIRPORTS.forEach(a => {
  const opt = document.createElement('option');
  opt.value = a;
  airportListEl.appendChild(opt);
});

// ---------- Trip type switching ----------
let tripType = 'oneway';
const tripTypeBtns = document.querySelectorAll('.trip-type-btn');
const simpleSection = document.getElementById('simpleTripSection');
const multiSection = document.getElementById('multiCitySection');
const returnDateField = document.getElementById('returnDateField');

tripTypeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tripTypeBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    tripType = btn.dataset.type;

    simpleSection.hidden = tripType === 'multicity';
    multiSection.hidden = tripType !== 'multicity';
    returnDateField.hidden = tripType !== 'roundtrip';

    document.getElementById('fromAirport').required = tripType !== 'multicity';
    document.getElementById('toAirport').required = tripType !== 'multicity';
    document.getElementById('departDate').required = tripType !== 'multicity';

    if (tripType === 'multicity' && multiCityLegsContainer.children.length === 0) {
      addLeg();
      addLeg();
    }
  });
});

// ---------- Pre-fill from the homepage hero search, if it sent us here ----------
(function prefillFromHeroSearch() {
  const params = new URLSearchParams(window.location.search);
  if (!params.has('from') && !params.has('to')) return;

  const tripParam = params.get('trip');
  if (tripParam === 'roundtrip') {
    document.querySelector('.trip-type-btn[data-type="roundtrip"]').click();
  }

  if (params.get('from')) document.getElementById('fromAirport').value = params.get('from');
  if (params.get('to')) document.getElementById('toAirport').value = params.get('to');
  if (params.get('depart')) document.getElementById('departDate').value = params.get('depart');
  if (params.get('return')) document.getElementById('returnDate').value = params.get('return');
})();

// ---------- Multi-city legs ----------
const multiCityLegsContainer = document.getElementById('multiCityLegs');
let legCount = 0;

function addLeg() {
  legCount++;
  const legId = `leg-${Date.now()}-${legCount}`;
  const row = document.createElement('div');
  row.className = 'leg-row';
  row.dataset.legId = legId;
  row.innerHTML = `
    <div class="field">
      <label>From</label>
      <input type="text" list="airportList" class="leg-from" required placeholder="City or airport">
    </div>
    <div class="field">
      <label>To</label>
      <input type="text" list="airportList" class="leg-to" required placeholder="City or airport">
    </div>
    <div class="field">
      <label>Date</label>
      <input type="date" class="leg-date" required>
    </div>
    <button type="button" class="leg-remove" aria-label="Remove flight">✕</button>
  `;
  row.querySelector('.leg-remove').addEventListener('click', () => {
    if (multiCityLegsContainer.children.length > 1) row.remove();
  });
  multiCityLegsContainer.appendChild(row);
}

document.getElementById('addLegBtn').addEventListener('click', addLeg);

// ---------- Submit ----------
document.getElementById('flightForm').addEventListener('submit', (e) => {
  e.preventDefault();

  const flightClass = document.getElementById('flightClass').value;
  const adults = document.getElementById('adultsCount').value;
  const children = document.getElementById('childrenCount').value;
  const infants = document.getElementById('infantsCount').value;
  const name = document.getElementById('flyerName').value.trim();
  const phone = document.getElementById('flyerPhone').value.trim();
  const notes = document.getElementById('flyerNotes').value.trim();

  let tripLabel = { oneway: 'One Way', roundtrip: 'Round Trip', multicity: 'Multi-City' }[tripType];
  let routeText = '';

  if (tripType === 'multicity') {
    const legs = Array.from(multiCityLegsContainer.children).map((row, i) => {
      const from = row.querySelector('.leg-from').value.trim();
      const to = row.querySelector('.leg-to').value.trim();
      const date = row.querySelector('.leg-date').value;
      return `  Flight ${i + 1}: ${from} → ${to} on ${date}`;
    });
    routeText = legs.join('\n');
  } else {
    const from = document.getElementById('fromAirport').value.trim();
    const to = document.getElementById('toAirport').value.trim();
    const depart = document.getElementById('departDate').value;
    routeText = `  ${from} → ${to} on ${depart}`;
    if (tripType === 'roundtrip') {
      const ret = document.getElementById('returnDate').value;
      routeText += `\n  Return: ${to} → ${from} on ${ret}`;
    }
  }

  let msg = `Hi Dharti Holidays, I'd like a flight quote:\n\n`;
  msg += `Trip Type: ${tripLabel}\n${routeText}\n\n`;
  msg += `Class: ${flightClass}\n`;
  msg += `Passengers: ${adults} Adult(s)`;
  if (Number(children) > 0) msg += `, ${children} Child(ren)`;
  if (Number(infants) > 0) msg += `, ${infants} Infant(s)`;
  msg += `\n\nName: ${name}\nPhone: ${phone}`;
  if (notes) msg += `\nNotes: ${notes}`;

  window.open(`https://wa.me/919824044070?text=${encodeURIComponent(msg)}`, '_blank');
  logLead('flight', name, phone, msg);
});
