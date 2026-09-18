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
  msg += `Vehicle: ${carType}\n`;
  msg += `Passengers: ${pax}\n`;
  msg += `\nName: ${name}\nPhone: ${phone}`;
  if (notes) msg += `\nNotes: ${notes}`;

  window.open(`https://wa.me/919824044070?text=${encodeURIComponent(msg)}`, '_blank');
  logLead('car-transfer', name, phone, msg);

  document.getElementById('carTransferForm').reset();
  tripTypeBtns.forEach((b, i) => b.classList.toggle('active', i === 0));
  tripType = 'oneway';
  returnDateField.hidden = true;
});
