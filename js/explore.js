/* =========================================================
   DHARTI HOLIDAYS — Explore & Book
   Catalog data + browse/cart/enquiry logic.

   This is NOT a live booking engine — there's no real-time
   inventory or payment here. It's a shortlist tool: the
   visitor browses destinations and hotels, builds a trip
   list, and the "Send Enquiry" step packages that list into
   a WhatsApp message so your team can quote and confirm
   manually, same as any enquiry today.

   To add/edit destinations or hotels, edit the DESTINATIONS
   array below — the whole page renders from this data.
   ========================================================= */

const DESTINATIONS = [
  {
    id: 'kerala', name: 'Kerala', code: 'COK', region: 'domestic',
    tagline: 'Backwaters, tea hills and houseboats',
    hotels: [
      { name: 'Lake Palace Resort', location: 'Alleppey', category: 'Deluxe', price: 4200, rating: 4.5, amenities: ['Backwater View', 'Breakfast Included', 'Free WiFi'] },
      { name: 'Spice Tree Munnar', location: 'Munnar', category: 'Luxury', price: 7800, rating: 4.7, amenities: ['Mountain View', 'Spa', 'Pool'] },
      { name: 'Periyar Woods', location: 'Thekkady', category: 'Budget', price: 2400, rating: 4.1, amenities: ['Forest View', 'Breakfast Included'] },
    ]
  },
  {
    id: 'goa', name: 'Goa', code: 'GOI', region: 'domestic',
    tagline: 'Beaches, nightlife and Portuguese charm',
    hotels: [
      { name: 'Baga Sands Resort', location: 'North Goa', category: 'Deluxe', price: 3800, rating: 4.3, amenities: ['Beach Access', 'Pool', 'Breakfast Included'] },
      { name: 'Palolem Beach Huts', location: 'South Goa', category: 'Budget', price: 1800, rating: 4.0, amenities: ['Beachfront', 'Free WiFi'] },
      { name: 'The Fern Grande', location: 'Candolim', category: 'Luxury', price: 6900, rating: 4.6, amenities: ['Pool', 'Spa', 'Breakfast Included'] },
    ]
  },
  {
    id: 'kashmir', name: 'Kashmir', code: 'SXR', region: 'domestic',
    tagline: 'Houseboats, valleys and snow-capped peaks',
    hotels: [
      { name: 'Dal Lake Houseboat', location: 'Srinagar', category: 'Deluxe', price: 3500, rating: 4.6, amenities: ['Lake View', 'Breakfast Included'] },
      { name: 'Gulmarg Heights', location: 'Gulmarg', category: 'Luxury', price: 8200, rating: 4.7, amenities: ['Mountain View', 'Bonfire', 'Spa'] },
      { name: 'Pahalgam Valley Inn', location: 'Pahalgam', category: 'Budget', price: 2100, rating: 4.0, amenities: ['Valley View', 'Free WiFi'] },
    ]
  },
  {
    id: 'rajasthan', name: 'Rajasthan', code: 'JAI', region: 'domestic',
    tagline: 'Forts, palaces and desert heritage',
    hotels: [
      { name: 'Heritage Haveli', location: 'Jaipur', category: 'Deluxe', price: 4600, rating: 4.4, amenities: ['Courtyard', 'Breakfast Included'] },
      { name: 'Lake View Palace', location: 'Udaipur', category: 'Luxury', price: 9500, rating: 4.8, amenities: ['Lake View', 'Pool', 'Spa'] },
      { name: 'Blue City Stay', location: 'Jodhpur', category: 'Budget', price: 2000, rating: 4.0, amenities: ['Rooftop', 'Free WiFi'] },
    ]
  },
  {
    id: 'dubai', name: 'Dubai', code: 'DXB', region: 'international',
    tagline: 'Skyline, desert safaris and shopping',
    hotels: [
      { name: 'Marina Bay Hotel', location: 'Dubai Marina', category: 'Deluxe', price: 8500, rating: 4.5, amenities: ['Marina View', 'Pool', 'Breakfast Included'] },
      { name: 'Downtown Skyline Suites', location: 'Downtown Dubai', category: 'Luxury', price: 15000, rating: 4.8, amenities: ['Burj Khalifa View', 'Spa', 'Pool'] },
      { name: 'Deira Budget Inn', location: 'Deira', category: 'Budget', price: 4200, rating: 3.9, amenities: ['Free WiFi', 'Breakfast Included'] },
    ]
  },
  {
    id: 'bali', name: 'Bali', code: 'DPS', region: 'international',
    tagline: 'Rice terraces, temples and beach clubs',
    hotels: [
      { name: 'Ubud Rice View Villas', location: 'Ubud', category: 'Deluxe', price: 6200, rating: 4.6, amenities: ['Rice Field View', 'Private Pool'] },
      { name: 'Seminyak Beach Resort', location: 'Seminyak', category: 'Luxury', price: 11000, rating: 4.7, amenities: ['Beachfront', 'Spa', 'Pool'] },
      { name: 'Kuta Budget Stay', location: 'Kuta', category: 'Budget', price: 2800, rating: 4.0, amenities: ['Free WiFi', 'Breakfast Included'] },
    ]
  },
  {
    id: 'maldives', name: 'Maldives', code: 'MLE', region: 'international',
    tagline: 'Overwater villas and coral reefs',
    hotels: [
      { name: 'Coral Overwater Villas', location: 'North Male Atoll', category: 'Luxury', price: 24000, rating: 4.9, amenities: ['Overwater Villa', 'Private Deck', 'All Meals'] },
      { name: 'Lagoon View Retreat', location: 'South Male Atoll', category: 'Deluxe', price: 14000, rating: 4.6, amenities: ['Lagoon View', 'Breakfast Included'] },
    ]
  },
  {
    id: 'thailand', name: 'Thailand', code: 'BKK', region: 'international',
    tagline: 'Islands, street food and city temples',
    hotels: [
      { name: 'Sukhumvit City Hotel', location: 'Bangkok', category: 'Deluxe', price: 4800, rating: 4.3, amenities: ['City View', 'Pool', 'Breakfast Included'] },
      { name: 'Patong Beachfront', location: 'Phuket', category: 'Luxury', price: 9200, rating: 4.6, amenities: ['Beachfront', 'Spa', 'Pool'] },
      { name: 'Pattaya Budget Stay', location: 'Pattaya', category: 'Budget', price: 2200, rating: 3.9, amenities: ['Free WiFi'] },
    ]
  },
];

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

// ============ Destination detail (hotel list) modal ============
function openDestination(destId) {
  const dest = DESTINATIONS.find(d => d.id === destId);
  const modal = document.getElementById('destModal');
  document.getElementById('destModalTitle').textContent = dest.name;
  document.getElementById('destModalTagline').textContent = dest.tagline;

  const hotelList = document.getElementById('destModalHotels');
  hotelList.innerHTML = '';
  dest.hotels.forEach(hotel => {
    const key = cartKey(destId, hotel.name);
    const inCart = cart.some(item => item.key === key);
    const card = document.createElement('div');
    card.className = 'hotel-card';

    // Amenities can be free-text tags (curated hotels) or icon
    // ids from AMENITIES (hotelier submissions) — render both.
    const amenityHtml = (hotel.amenities || []).map(a => {
      if (typeof AMENITIES !== 'undefined') {
        const match = AMENITIES.find(x => x.id === a);
        if (match) return `<span>${match.icon} ${match.label}</span>`;
      }
      return `<span>${a}</span>`;
    }).join('');

    // Cover photo: first available image from any uploaded category, if present
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
    hotelList.appendChild(card);
  });

  modal.classList.add('open');
  document.getElementById('destModalOverlay').classList.add('open');
}

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
        location: row.destinationName,
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
loadApprovedHotels().then(() => {
  renderDestinations();
});
renderCart();
