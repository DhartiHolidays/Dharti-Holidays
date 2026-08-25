/* =========================================================
   passport.html logic
   ========================================================= */

document.getElementById('year').textContent = new Date().getFullYear();
const header = document.getElementById('siteHeader');
document.getElementById('navToggle').addEventListener('click', () => header.classList.toggle('open'));

function passportCardHtml(service) {
  return `
    <article class="ticket">
      <div class="ticket-head">
        <div class="ticket-route">${service.serviceType}</div>
      </div>
      <div class="ticket-perf"></div>
      <div class="ticket-body">
        <p>${service.notes || 'Application filing and document guidance included.'}</p>
        <div class="ticket-meta">
          <span>Processing Time<br><strong>${service.processingTime}</strong></span>
        </div>
      </div>
      <div class="ticket-foot">
        <div class="ticket-price">₹${service.price}<span>${service.priceUnit || ''}</span></div>
        <a href="#customPassportForm" class="ticket-link" onclick="prefillPassportService('${service.serviceType.replace(/'/g, "\\'")}')">Enquire →</a>
      </div>
    </article>`;
}

function prefillPassportService(serviceType) {
  document.getElementById('cpServiceType').value = serviceType;
}

async function loadPassportServices() {
  const grid = document.getElementById('passportGrid');
  grid.innerHTML = '<p style="color:var(--slate); grid-column:1/-1;">Loading...</p>';

  if (typeof APPS_SCRIPT_URL === 'undefined' || APPS_SCRIPT_URL.includes('PASTE_YOUR')) {
    grid.innerHTML = '<p style="color:var(--slate); grid-column:1/-1;">Passport service listings will appear here once connected — use the form below to enquire directly.</p>';
    return;
  }

  try {
    const res = await fetch(`${APPS_SCRIPT_URL}?action=listPassportServices`);
    const rows = await res.json();
    const items = Array.isArray(rows) ? rows : [];
    if (items.length === 0) {
      grid.innerHTML = '<p style="color:var(--slate); grid-column:1/-1;">No services listed yet — use the form below to enquire directly.</p>';
      return;
    }
    grid.innerHTML = items.map(passportCardHtml).join('');
  } catch (err) {
    grid.innerHTML = '<p style="color:var(--red); grid-column:1/-1;">Could not load services — please use the form below.</p>';
    console.error(err);
  }
}

document.getElementById('customPassportForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const serviceType = document.getElementById('cpServiceType').value.trim();
  const applicants = document.getElementById('cpApplicants').value;
  const name = document.getElementById('cpName').value.trim();
  const phone = document.getElementById('cpPhone').value.trim();

  let msg = `Hi Dharti Holidays, I'd like passport assistance:\n\n`;
  msg += `Service Needed: ${serviceType}\n`;
  msg += `Applicants: ${applicants}\n`;
  msg += `\nName: ${name}\nPhone: ${phone}`;

  window.open(`https://wa.me/919824044070?text=${encodeURIComponent(msg)}`, '_blank');
  logLead('passport', name, phone, msg);
});

loadPassportServices();
