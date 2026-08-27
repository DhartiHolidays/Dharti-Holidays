/* =========================================================
   DHARTI HOLIDAYS — Explore & Book
   Catalog data + browse/cart/enquiry logic.

   This is NOT a live booking engine — there's no real-time
   inventory or payment here. It's a shortlist tool: the
   visitor browses destinations and hotels, builds a trip
   list, and the "Send Enquiry" step packages that list into
   a WhatsApp message so your team can quote and confirm
   manually, same as any enquiry today.

   Destinations and hotels are no longer hardcoded here — they
   load live from the Google Sheet via Apps Script (see
   config.js for the URL, admin.html to manage the data).
   ========================================================= */

let DESTINATIONS = [];

async function loadDestinations() {
  if (typeof APPS_SCRIPT_URL === 'undefined' || APPS_SCRIPT_URL.includes('PASTE_YOUR')) {
    DESTINATIONS = [];
    return;
  }
  try {
    const res = await fetch(`${APPS_SCRIPT_URL}?action=listDestinations`);
    const rows = await res.json();
    DESTINATIONS = (Array.isArray(rows) ? rows : []).map(row => ({
      id: row.id, name: row.name, code: row.code, region: row.region,
      tagline: row.tagline, hotels: []
    }));
  } catch (err) {
    console.warn('Could not load destinations:', err);
    DESTINATIONS = [];
  }
}

// ============ Cart (in-memory for this session) ============
let cart = [];

function cartKey(destId, hotelName) { return `${destId}::${hotelName}`; }

function addToCart(destId, hotel) {
  const key = cartKey(destId, hotel.name);
  if (cart.some(item => item.key === key)) return;
  const dest = DESTINATIONS.find(d => d.id === destId);
  cart.push({ key, destinationId: destId, destinationName: dest.name, ...hotel });
  renderCart();
  openCart();
}

function removeFromCart(key) {
  cart = cart.filter(item => item.key !== key);
  renderCart();
}

function renderCart() {
  const badge = document.getElementById('cartBadge');
  const list = document.getElementById('cartList');
  const empty = document.getElementById('cartEmpty');
  const totalRow = document.getElementById('cartTotalRow');
  const totalEl = document.getElementById('cartTotal');

  badge.textContent = cart.length;
  badge.hidden = cart.length === 0;

  list.innerHTML = '';
  if (cart.length === 0) {
    empty.hidden = false;
    totalRow.hidden = true;
    return;
  }
  empty.hidden = true;
  totalRow.hidden = false;

  let total = 0;
  cart.forEach(item => {
    total += item.price;
    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `
      <div class="cart-item-info">
        <strong>${item.name}</strong>
        <span>${item.destinationName} · ${item.location} · ${item.category}</span>
      </div>
      <div class="cart-item-right">
        <span class="cart-item-price">₹${item.price.toLocaleString('en-IN')}<small>/night</small></span>
        <button class="cart-item-remove" aria-label="Remove" data-key="${item.key}">✕</button>
      </div>`;
    list.appendChild(row);
  });
  totalEl.textContent = `₹${total.toLocaleString('en-IN')}`;

  list.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', () => removeFromCart(btn.dataset.key));
  });
}

function openCart() { document.getElementById('cartDrawer').classList.add('open'); document.getElementById('cartOverlay').classList.add('open'); }
function closeCart() { document.getElementById('cartDrawer').classList.remove('open'); document.getElementById('cartOverlay').classList.remove('open'); }

// ============ Rendering destinations ============
function destinationCard(dest) {
  const div = document.createElement('div');
  div.className = 'dest-card';
  div.innerHTML = `
    <div class="dest-card-top">
      <span class="dest-code">${dest.code}</span>
      <span class="dest-region-tag">${dest.region === 'domestic' ? 'Domestic' : 'International'}</span>
    </div>
    <h3>${dest.name}</h3>
    <p>${dest.tagline}</p>
    <div class="dest-card-foot">
      <span>${dest.hotels.length} hotels available</span>
      <span class="dest-explore-link">Explore →</span>
    </div>`;
  div.addEventListener('click', () => openDestination(dest.id));
  return div;
}

function renderDestinations(filter = '', region = 'all') {
  const grid = document.getElementById('destGrid');
  const noResults = document.getElementById('destNoResults');
  grid.innerHTML = '';

  const q = filter.trim().toLowerCase();
  const matches = DESTINATIONS.filter(d => {
    const inRegion = region === 'all' || d.region === region;
    const inSearch = !q || d.name.toLowerCase().includes(q) || d.tagline.toLowerCase().includes(q);
    return inRegion && inSearch;
  });

  if (matches.length === 0) {
    noResults.hidden = false;
    document.getElementById('destNoResultsQuery').textContent = filter.trim();
    return;
  }
  noResults.hidden = true;
  matches.forEach(d => grid.appendChild(destinationCard(d)));
}

// ============ Destination detail (hotel list) modal with filters ============
let currentDestId = null;
let activeCategory = 'all';
let activeAmenities = new Set();
let activeSort = 'default';

function hotelCardHtml(destId, hotel) {
  const key = cartKey(destId, hotel.name);
  const inCart = cart.some(item => item.key === key);

  const amenityHtml = (hotel.amenities || []).map(a => {
    if (typeof AMENITIES !== 'undefined') {
      const match = AMENITIES.find(x => x.id === a);
      if (match) return `<span>${match.icon} ${match.label}</span>`;
    }
    return `<span>${a}</span>`;
  }).join('');

  let coverUrl = '';
  if (hotel.photos) {
    for (const sectionId of Object.keys(hotel.photos)) {
      if (hotel.photos[sectionId] && hotel.photos[sectionId].length) {
        coverUrl = hotel.photos[sectionId][0];
        break;
      }
    }
  }
  const coverHtml = coverUrl ? `<img class="hotel-thumb" src="${coverUrl}" alt="${hotel.name}">` : '';

  const card = document.createElement('div');
  card.className = 'hotel-card';
  card.innerHTML = `
    ${coverHtml}
    <div class="hotel-card-main">
      <div class="hotel-card-head">
        <h4>${hotel.name}</h4>
        <span class="hotel-category">${hotel.category}</span>
      </div>
      <p class="hotel-location">${hotel.location} · ★ ${hotel.rating}</p>
      <div class="hotel-amenities">${amenityHtml}</div>
    </div>
    <div class="hotel-card-side">
      <div class="hotel-price">₹${Number(hotel.price).toLocaleString('en-IN')}<span>per night</span></div>
      <button class="btn ${inCart ? 'btn-navy' : 'btn-primary'} add-trip-btn" ${inCart ? 'disabled' : ''}>${inCart ? 'Added ✓' : 'Add to Trip'}</button>
    </div>`;
  card.querySelector('.add-trip-btn').addEventListener('click', (e) => {
    addToCart(destId, hotel);
    e.target.textContent = 'Added ✓';
    e.target.disabled = true;
    e.target.classList.replace('btn-primary', 'btn-navy');
  });
  return card;
}

function getFilteredSortedHotels() {
  const dest = DESTINATIONS.find(d => d.id === currentDestId);
  if (!dest) return [];

  let hotels = dest.hotels.filter(h => {
    if (activeCategory !== 'all' && h.category !== activeCategory) return false;
    if (activeAmenities.size > 0) {
      const hotelAmenitySet = new Set(h.amenities || []);
      for (const a of activeAmenities) {
        if (!hotelAmenitySet.has(a)) return false;
      }
    }
    return true;
  });

  if (activeSort === 'price-low') hotels = hotels.slice().sort((a, b) => a.price - b.price);
  if (activeSort === 'price-high') hotels = hotels.slice().sort((a, b) => b.price - a.price);
  if (activeSort === 'rating') hotels = hotels.slice().sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));

  return hotels;
}

function renderAmenityFilterSidebar() {
  const dest = DESTINATIONS.find(d => d.id === currentDestId);
  const container = document.getElementById('amenityFilterList');
  container.innerHTML = '';

  // Count how many hotels (matching current category filter, ignoring amenity filter) have each amenity
  const categoryScoped = dest.hotels.filter(h => activeCategory === 'all' || h.category === activeCategory);
  const amenityCounts = {};
  categoryScoped.forEach(h => {
    (h.amenities || []).forEach(a => { amenityCounts[a] = (amenityCounts[a] || 0) + 1; });
  });

  const sortedAmenities = Object.keys(amenityCounts).sort((a, b) => amenityCounts[b] - amenityCounts[a]);

  sortedAmenities.forEach(a => {
    const match = typeof AMENITIES !== 'undefined' ? AMENITIES.find(x => x.id === a) : null;
    const label = match ? `${match.icon} ${match.label}` : a;
    const count = amenityCounts[a];
    const item = document.createElement('label');
    item.className = 'amenity-filter-item' + (count === 0 ? ' disabled' : '');
    item.innerHTML = `<span><input type="checkbox" ${activeAmenities.has(a) ? 'checked' : ''}> ${label}</span><span class="count">${count}</span>`;
    item.querySelector('input').addEventListener('change', (e) => {
      if (e.target.checked) activeAmenities.add(a); else activeAmenities.delete(a);
      renderHotelResults();
    });
    container.appendChild(item);
  });

  if (sortedAmenities.length === 0) {
    container.innerHTML = '<p style="font-size:12px; color:var(--slate);">No amenity data yet.</p>';
  }
}

function renderHotelResults() {
  const hotelList = document.getElementById('destModalHotels');
  const countEl = document.getElementById('hotelResultCount');
  const filtered = getFilteredSortedHotels();

  hotelList.innerHTML = '';
  if (filtered.length === 0) {
    hotelList.innerHTML = '<div class="no-hotel-match">No hotels match these filters — try clearing one.</div>';
  } else {
    filtered.forEach(hotel => hotelList.appendChild(hotelCardHtml(currentDestId, hotel)));
  }

  const dest = DESTINATIONS.find(d => d.id === currentDestId);
  countEl.textContent = `${filtered.length} of ${dest.hotels.length} hotels`;
  renderAmenityFilterSidebar();
}

function openDestination(destId) {
  currentDestId = destId;
  activeCategory = 'all';
  activeAmenities = new Set();
  activeSort = 'default';

  const dest = DESTINATIONS.find(d => d.id === destId);
  const modal = document.getElementById('destModal');
  document.getElementById('destModalTitle').textContent = dest.name;
  document.getElementById('destModalTagline').textContent = dest.tagline;

  document.querySelectorAll('#categoryFilterChips .filter-chip').forEach((c, i) => c.classList.toggle('active', i === 0));
  document.getElementById('hotelSortSelect').value = 'default';

  renderHotelResults();

  modal.classList.add('open');
  document.getElementById('destModalOverlay').classList.add('open');
}

document.querySelectorAll('#categoryFilterChips .filter-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('#categoryFilterChips .filter-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    activeCategory = chip.dataset.category;
    renderHotelResults();
  });
});

document.getElementById('hotelSortSelect').addEventListener('change', (e) => {
  activeSort = e.target.value;
  renderHotelResults();
});

document.getElementById('clearFiltersBtn').addEventListener('click', () => {
  activeCategory = 'all';
  activeAmenities = new Set();
  activeSort = 'default';
  document.querySelectorAll('#categoryFilterChips .filter-chip').forEach((c, i) => c.classList.toggle('active', i === 0));
  document.getElementById('hotelSortSelect').value = 'default';
  renderHotelResults();
});

function closeDestination() {
  document.getElementById('destModal').classList.remove('open');
  document.getElementById('destModalOverlay').classList.remove('open');
}

// ============ Enquiry checkout ============
function buildEnquiryMessage(name, phone, dates) {
  let msg = `Hi Dharti Holidays, I'd like a quote for a trip I've shortlisted:\n\n`;
  cart.forEach(item => {
    msg += `• ${item.name} (${item.destinationName} - ${item.location}), ${item.category}, ~₹${item.price.toLocaleString('en-IN')}/night\n`;
  });
  msg += `\nName: ${name}\nPhone: ${phone}`;
  if (dates) msg += `\nPreferred Dates: ${dates}`;
  return msg;
}

document.getElementById('checkoutForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('coName').value.trim();
  const phone = document.getElementById('coPhone').value.trim();
  const dates = document.getElementById('coDates').value.trim();

  const message = buildEnquiryMessage(name, phone, dates);
  const url = `https://wa.me/919824044070?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
  logLead('hotel-cart', name, phone, message);

  cart = [];
  renderCart();
  document.getElementById('checkoutForm').reset();
  closeCart();
});

// ============ Merge in hotelier-submitted, approved hotels ============
// Fetches approved rows from the Apps Script backend and folds them
// into the matching destination's hotel list, so Explore & Book stays
// static-fast by default but picks up new listings once approved.
// Fails silently if the backend isn't configured yet — curated
// hotels still work either way.
async function loadApprovedHotels() {
  if (typeof APPS_SCRIPT_URL === 'undefined' || APPS_SCRIPT_URL.includes('PASTE_YOUR')) return;

  try {
    const res = await fetch(`${APPS_SCRIPT_URL}?action=listApproved`);
    const rows = await res.json();
    if (!Array.isArray(rows)) return;

    rows.forEach(row => {
      const dest = DESTINATIONS.find(d => d.id === row.destinationId);
      if (!dest) return; // skip if destination isn't one of the known ones

      const alreadyAdded = dest.hotels.some(h => h.name === row.hotelName);
      if (alreadyAdded) return;

      dest.hotels.push({
        name: row.hotelName,
        location: row.location || row.destinationName,
        category: row.category,
        price: Number(row.price) || 0,
        rating: row.rating || '—',
        amenities: row.amenities || [],
        photos: row.photos || {},
      });
    });
  } catch (err) {
    console.warn('Could not load hotelier-submitted hotels:', err);
  }
}

// ============ Wire up search, filters, modals ============
document.getElementById('destSearch').addEventListener('input', (e) => {
  const activeRegion = document.querySelector('.region-btn.active').dataset.region;
  renderDestinations(e.target.value, activeRegion);
});

document.querySelectorAll('.region-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.region-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderDestinations(document.getElementById('destSearch').value, btn.dataset.region);
  });
});

document.getElementById('cartToggle').addEventListener('click', openCart);
document.getElementById('cartClose').addEventListener('click', closeCart);
document.getElementById('cartOverlay').addEventListener('click', closeCart);
document.getElementById('destModalClose').addEventListener('click', closeDestination);
document.getElementById('destModalOverlay').addEventListener('click', closeDestination);

document.getElementById('year2').textContent = new Date().getFullYear();

// Mobile nav (same behaviour as main site)
const header2 = document.getElementById('siteHeader');
document.getElementById('navToggle').addEventListener('click', () => header2.classList.toggle('open'));

// Initial render
const destGridEl = document.getElementById('destGrid');
destGridEl.innerHTML = '<p style="color:var(--slate); grid-column:1/-1;">Loading destinations...</p>';

loadDestinations()
  .then(() => loadApprovedHotels())
  .then(() => {
    renderDestinations();
  });
renderCart();
