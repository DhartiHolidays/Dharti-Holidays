/* =========================================================
   packages.html logic — nav, package tabs, and search.
   Same logic as the homepage's main.js, extracted so this
   page can run standalone.
   ========================================================= */

document.getElementById('year').textContent = new Date().getFullYear();

const header = document.getElementById('siteHeader');
document.getElementById('navToggle').addEventListener('click', () => header.classList.toggle('open'));

// ============ Package tabs ============
const tabButtons = document.querySelectorAll('.tab-btn');
const panels = document.querySelectorAll('.pkg-grid');

tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;
    tabButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    panels.forEach(panel => panel.classList.toggle('active', panel.dataset.panel === target));
  });
});

// ============ Destination search across all packages ============
const pkgSearchInput = document.getElementById('pkgSearch');
const pkgSearchClear = document.getElementById('pkgSearchClear');
const tabsBar = document.getElementById('tabs');
const allPanels = document.querySelectorAll('.pkg-grid[data-panel]:not([data-panel="search"])');
const searchResults = document.getElementById('searchResults');
const noMatch = document.getElementById('noMatch');
const noMatchTitle = document.getElementById('noMatchTitle');
const noMatchWhatsapp = document.getElementById('noMatchWhatsapp');
noMatchWhatsapp.addEventListener('click', () => {
  const query = pkgSearchInput.value.trim();
  logLead('package-custom-request', '', '', `Custom package request: ${query}`);
});

function ticketText(ticket) { return ticket.textContent.toLowerCase(); }

function runSearch(query) {
  const q = query.trim().toLowerCase();

  if (!q) {
    tabsBar.hidden = false;
    searchResults.classList.remove('active');
    searchResults.innerHTML = '';
    noMatch.hidden = true;
    pkgSearchClear.hidden = true;
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

// ============ Sticky header shadow on scroll ============
window.addEventListener('scroll', () => {
  header.style.boxShadow = window.scrollY > 10 ? '0 4px 16px rgba(11,37,69,0.06)' : 'none';
});
