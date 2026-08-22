/* =========================================================
   visa.html logic
   ========================================================= */

document.getElementById('year').textContent = new Date().getFullYear();
const header = document.getElementById('siteHeader');
document.getElementById('navToggle').addEventListener('click', () => header.classList.toggle('open'));

let visaServices = [];

function visaCardHtml(service) {
  return `
    <article class="ticket">
      <div class="ticket-head">
        <div class="ticket-route">${service.country}<small>${service.visaType}</small></div>
      </div>
      <div class="ticket-perf"></div>
      <div class="ticket-body">
        <p>${service.notes || 'Documentation guidance and application assistance included.'}</p>
        <div class="ticket-meta">
          <span>Processing Time<br><strong>${service.processingTime}</strong></span>
        </div>
      </div>
      <div class="ticket-foot">
        <div class="ticket-price">₹${service.price}<span>${service.priceUnit || ''}</span></div>
        <a href="#customVisaForm" class="ticket-link" onclick="prefillVisaCountry('${service.country.replace(/'/g, "\\'")}', '${service.visaType.replace(/'/g, "\\'")}')">Enquire →</a>
      </div>
    </article>`;
}

function prefillVisaCountry(country, visaType) {
  document.getElementById('cvCountry').value = country;
  const typeSelect = document.getElementById('cvVisaType');
  const match = Array.from(typeSelect.options).find(o => visaType.toLowerCase().includes(o.value.toLowerCase()));
  if (match) typeSelect.value = match.value;
}

async function loadVisaServices() {
  const grid = document.getElementById('visaGrid');
  grid.innerHTML = '<p style="color:var(--slate); grid-column:1/-1;">Loading...</p>';

  if (typeof APPS_SCRIPT_URL === 'undefined' || APPS_SCRIPT_URL.includes('PASTE_YOUR')) {
    grid.innerHTML = '<p style="color:var(--slate); grid-column:1/-1;">Visa listings will appear here once connected — use the form below to enquire directly.</p>';
    return;
  }

  try {
    const res = await fetch(`${APPS_SCRIPT_URL}?action=listVisaServices`);
    const rows = await res.json();
    visaServices = Array.isArray(rows) ? rows : [];
    renderVisaGrid(visaServices);
  } catch (err) {
    grid.innerHTML = '<p style="color:var(--red); grid-column:1/-1;">Could not load visa services — please use the form below.</p>';
    console.error(err);
  }
}

function renderVisaGrid(items) {
  const grid = document.getElementById('visaGrid');
  const noResults = document.getElementById('visaNoResults');
  grid.innerHTML = '';

  if (items.length === 0) {
    noResults.hidden = false;
    return;
  }
  noResults.hidden = true;
  grid.innerHTML = items.map(visaCardHtml).join('');
}

document.getElementById('visaSearch').addEventListener('input', (e) => {
  const q = e.target.value.trim().toLowerCase();
  document.getElementById('visaNoResultsQuery').textContent = e.target.value.trim();
  if (!q) { renderVisaGrid(visaServices); return; }
  const matches = visaServices.filter(s =>
    s.country.toLowerCase().includes(q) || s.visaType.toLowerCase().includes(q)
  );
  renderVisaGrid(matches);
});

document.getElementById('customVisaForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const country = document.getElementById('cvCountry').value.trim();
  const visaType = document.getElementById('cvVisaType').value;
  const travelDate = document.getElementById('cvTravelDate').value;
  const applicants = document.getElementById('cvApplicants').value;
  const name = document.getElementById('cvName').value.trim();
  const phone = document.getElementById('cvPhone').value.trim();

  let msg = `Hi Dharti Holidays, I'd like visa assistance:\n\n`;
  msg += `Destination Country: ${country}\n`;
  msg += `Visa Type: ${visaType}\n`;
  msg += `Applicants: ${applicants}\n`;
  if (travelDate) msg += `Planned Travel Date: ${travelDate}\n`;
  msg += `\nName: ${name}\nPhone: ${phone}`;

  window.open(`https://wa.me/919824044070?text=${encodeURIComponent(msg)}`, '_blank');
});

loadVisaServices();
