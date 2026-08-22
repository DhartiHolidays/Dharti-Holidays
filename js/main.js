// ============ Footer year ============
document.getElementById('year').textContent = new Date().getFullYear();

// ============ Mobile nav toggle ============
const header = document.getElementById('siteHeader');
const navToggle = document.getElementById('navToggle');
navToggle.addEventListener('click', () => {
  header.classList.toggle('open');
});
// Close mobile nav when a link is clicked
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => header.classList.remove('open'));
});

// ============ Package tabs ============
const tabButtons = document.querySelectorAll('.tab-btn');
const panels = document.querySelectorAll('.pkg-grid');

tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;

    tabButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    panels.forEach(panel => {
      panel.classList.toggle('active', panel.dataset.panel === target);
    });
  });
});

// ============ Destination search across all packages ============
// Searches every ticket card in every tab (not just the active one),
// so "Kerala" matches even if the Domestic tab isn't open. If nothing
// matches, shows a fallback that still moves the visitor toward
// WhatsApp or the enquiry form instead of a dead end.
const pkgSearchInput = document.getElementById('pkgSearch');
const pkgSearchClear = document.getElementById('pkgSearchClear');
const tabsBar = document.getElementById('tabs');
const allPanels = document.querySelectorAll('.pkg-grid[data-panel]:not([data-panel="search"])');
const searchResults = document.getElementById('searchResults');
const noMatch = document.getElementById('noMatch');
const noMatchTitle = document.getElementById('noMatchTitle');
const noMatchWhatsapp = document.getElementById('noMatchWhatsapp');

function ticketText(ticket) {
  return ticket.textContent.toLowerCase();
}

function runSearch(query) {
  const q = query.trim().toLowerCase();

  if (!q) {
    // Reset to normal tab view
    tabsBar.hidden = false;
    searchResults.classList.remove('active');
    searchResults.innerHTML = '';
    noMatch.hidden = true;
    pkgSearchClear.hidden = true;
    // restore whichever tab was active
    const activeTab = document.querySelector('.tab-btn.active');
    panels.forEach(panel => panel.classList.toggle('active', panel.dataset.panel === activeTab.dataset.tab));
    return;
  }

  pkgSearchClear.hidden = false;
  tabsBar.hidden = true;
  panels.forEach(p => p.classList.remove('active'));

  const matches = [];
  allPanels.forEach(panel => {
    panel.querySelectorAll('.ticket').forEach(ticket => {
      if (ticketText(ticket).includes(q)) matches.push(ticket);
    });
  });

  if (matches.length === 0) {
    searchResults.classList.remove('active');
    searchResults.innerHTML = '';
    noMatch.hidden = false;
    noMatchTitle.textContent = `We don't have "${query.trim()}" listed yet`;
    const msg = `Hi Dharti Holidays, I'm looking for a package to ${query.trim()} — is this something you can arrange?`;
    noMatchWhatsapp.href = `https://wa.me/919824044070?text=${encodeURIComponent(msg)}`;
  } else {
    noMatch.hidden = true;
    searchResults.innerHTML = '';
    matches.forEach(ticket => searchResults.appendChild(ticket.cloneNode(true)));
    searchResults.classList.add('active');
  }
}

pkgSearchInput.addEventListener('input', () => runSearch(pkgSearchInput.value));
pkgSearchClear.addEventListener('click', () => {
  pkgSearchInput.value = '';
  runSearch('');
  pkgSearchInput.focus();
});

// ============ Enquiry form -> WhatsApp handoff ============
// Since this is a static site with no backend, the form composes
// a WhatsApp message with the enquiry details so it reaches you
// instantly. Swap this for a real form backend (e.g. Formspree,
// Google Sheets via Apps Script, or your own API) if you'd like
// enquiries logged automatically as well.
const enquiryForm = document.getElementById('enquiryForm');
const WHATSAPP_NUMBER = '919824044070';

enquiryForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const destination = document.getElementById('destination').value.trim();
  const type = document.getElementById('type').value;
  const message = document.getElementById('message').value.trim();

  let text = `Hi Dharti Holidays, I'd like a travel enquiry:\n`;
  text += `Name: ${name}\n`;
  text += `Phone: ${phone}\n`;
  if (destination) text += `Destination: ${destination}\n`;
  text += `Package Type: ${type}\n`;
  if (message) text += `Notes: ${message}`;

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');

  enquiryForm.reset();
});

// ============ Sticky header shadow on scroll ============
let lastScroll = 0;
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  header.style.boxShadow = y > 10 ? '0 4px 16px rgba(11,37,69,0.06)' : 'none';
  lastScroll = y;
});
