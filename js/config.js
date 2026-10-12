/* =========================================================
   Shared config — amenity icons + photo categories.
   Used by add-hotel.html (submission form), admin.html
   (approval dashboard), and explore.js (rendering hotel
   cards on the live site). Keep all three in sync by only
   editing this file.
   ========================================================= */

const AMENITIES = [
  { id: 'pool',        label: 'Swimming Pool',      icon: '🏊' },
  { id: 'breakfast',   label: 'Breakfast Included',  icon: '🍳' },
  { id: 'wifi',        label: 'Free WiFi',           icon: '📶' },
  { id: 'ac',          label: 'Air Conditioning',    icon: '❄️' },
  { id: 'parking',     label: 'Free Parking',        icon: '🅿️' },
  { id: 'spa',         label: 'Spa',                 icon: '🧖' },
  { id: 'gym',         label: 'Gym',                 icon: '🏋️' },
  { id: 'restaurant',  label: 'Restaurant',          icon: '🍽️' },
  { id: 'bar',         label: 'Bar',                 icon: '🍸' },
  { id: 'petfriendly', label: 'Pet Friendly',        icon: '🐾' },
  { id: 'roomservice', label: 'Room Service',        icon: '🛎️' },
  { id: 'beachaccess', label: 'Beach Access',        icon: '🏖️' },
  { id: 'mountainview',label: 'Mountain / Valley View', icon: '⛰️' },
  { id: 'lakeview',    label: 'Lake / River View',   icon: '🌊' },
  { id: 'elevator',    label: 'Elevator',            icon: '🛗' },
  { id: 'laundry',     label: 'Laundry Service',     icon: '🧺' },
];

const PHOTO_SECTIONS = [
  { id: 'exterior',   label: 'Exterior / Building' },
  { id: 'reception',  label: 'Reception Area' },
  { id: 'rooms',      label: 'Rooms' },
  { id: 'bathroom',   label: 'Bathroom' },
  { id: 'balcony',    label: 'Balcony' },
  { id: 'hall',       label: 'Hall / Banquet' },
  { id: 'pool',       label: 'Swimming Pool' },
  { id: 'additional', label: 'Additional Facility' },
];

/* Destinations now live in the Google Sheet and are managed
   from admin.html — no longer hardcoded here. */

/* =========================================================
   IMPORTANT — paste your deployed Google Apps Script Web
   App URL here after completing the setup steps. Until you
   do, the submission form and admin panel won't be able to
   save or load data. See SETUP-GUIDE.md in this folder.
   ========================================================= */
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxEAINbjMDi1IPN37oQPu_KKv_iUYcbuRH03_eMGaxfhkUrw-e1vzqHBdL_NQxz24jefw/exec';

/* =========================================================
   Shared lead logging helper — called from every enquiry
   form on the site alongside opening WhatsApp. Fire-and-
   forget: never blocks or delays the WhatsApp redirect, and
   fails silently if the backend isn't connected yet.
   ========================================================= */
function logLead(type, name, phone, details, enquiryNo) {
  if (typeof APPS_SCRIPT_URL === 'undefined' || APPS_SCRIPT_URL.includes('PASTE_YOUR')) return;
  try {
    fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'logLead', type, name, phone, details, enquiryNo: enquiryNo || '' }),
    }).catch(() => {});
  } catch (e) {
    // silent — lead logging never blocks the visitor
  }
}


/* =========================================================
   ENQUIRY NUMBER + ON-SCREEN CONFIRMATION
   Every enquiry gets a reference number (e.g. DH-261008-K7QM).
   It is shown on screen, added to the WhatsApp message, saved in
   the Leads sheet and included in the email alert — so a customer
   always knows their enquiry was received and can quote the number.
   ========================================================= */
function generateEnquiryNo() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  const stamp = String(d.getFullYear()).slice(2) + pad(d.getMonth() + 1) + pad(d.getDate());
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 4; i++) rand += chars[Math.floor(Math.random() * chars.length)];
  return 'DH-' + stamp + '-' + rand;
}

function submitEnquiry(type, name, phone, message) {
  const enquiryNo = generateEnquiryNo();
  const fullMessage = message + '\n\nEnquiry No: ' + enquiryNo;
  const waUrl = 'https://wa.me/919824044070?text=' + encodeURIComponent(fullMessage);
  window.open(waUrl, '_blank');
  logLead(type, name, phone, fullMessage, enquiryNo);
  showEnquiryConfirmation(enquiryNo, name, phone, waUrl);
  return enquiryNo;
}

function showEnquiryConfirmation(enquiryNo, name, phone, waUrl) {
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const old = document.getElementById('enquiryConfirm');
  if (old) old.remove();
  const wrap = document.createElement('div');
  wrap.id = 'enquiryConfirm';
  wrap.className = 'enquiry-confirm-overlay';
  wrap.innerHTML = `
    <div class="enquiry-confirm-card" role="dialog" aria-live="polite" aria-label="Enquiry received">
      <div class="enquiry-confirm-tick">✓</div>
      <h3>Enquiry received${name ? ', ' + esc(String(name).split(' ')[0]) : ''}!</h3>
      <p>Your enquiry number is</p>
      <div class="enquiry-no" id="enquiryNoText">${esc(enquiryNo)}</div>
      <p>Our team will contact you${phone ? ' on <strong>' + esc(phone) + '</strong>' : ''} shortly. Please keep this number handy — there is no need to submit the enquiry again.</p>
      <p style="font-size:12.5px;">A WhatsApp chat with your details also opened in a new tab. If it didn't, use the button below.</p>
      <div class="enquiry-confirm-actions">
        <a class="btn btn-navy" href="${esc(waUrl)}" target="_blank" rel="noopener noreferrer" style="padding:11px 18px;">Open WhatsApp</a>
        <button type="button" class="btn btn-primary" id="enquiryCopyBtn" style="padding:11px 18px;">Copy Number</button>
        <button type="button" class="btn btn-outline" id="enquiryCloseBtn" style="padding:11px 18px; color:var(--navy); border-color:var(--navy);">Close</button>
      </div>
    </div>`;
  document.body.appendChild(wrap);
  document.getElementById('enquiryCloseBtn').addEventListener('click', () => wrap.remove());
  wrap.addEventListener('click', (e) => { if (e.target === wrap) wrap.remove(); });
  document.getElementById('enquiryCopyBtn').addEventListener('click', (e) => {
    if (navigator.clipboard) navigator.clipboard.writeText(enquiryNo).then(() => { e.target.textContent = 'Copied ✓'; });
  });
}

/* =========================================================
   GOOGLE ANALYTICS (GA4) — set your Measurement ID to switch on
   Create a free property at analytics.google.com → Admin → Data
   Streams → Web, then paste the "G-XXXXXXXXXX" ID below.
   Never loads on the admin pages.
   ========================================================= */
const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';
(function () {
  if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID.includes('XXXX')) return;
  if (/admin|document-studio/.test(location.pathname)) return;
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID);
})();
