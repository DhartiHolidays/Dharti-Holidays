/* =========================================================
   admin.html logic
   ========================================================= */

let adminKey = '';

document.getElementById('unlockBtn').addEventListener('click', unlock);
document.getElementById('adminKey').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') unlock();
});

async function unlock() {
  const key = document.getElementById('adminKey').value.trim();
  const errorEl = document.getElementById('gateError');
  errorEl.textContent = '';

  if (!key) return;
  if (APPS_SCRIPT_URL.includes('PASTE_YOUR')) {
    errorEl.textContent = 'Setup incomplete: connect the Apps Script backend first (see SETUP-GUIDE.md).';
    return;
  }

  document.getElementById('unlockBtn').textContent = 'Checking...';

  try {
    const res = await fetch(`${APPS_SCRIPT_URL}?action=listPending&key=${encodeURIComponent(key)}`);
    const data = await res.json();

    if (data.error === 'unauthorized') {
      errorEl.textContent = 'Incorrect admin key.';
      document.getElementById('unlockBtn').textContent = 'Unlock';
      return;
    }

    adminKey = key;
    document.getElementById('gateSection').hidden = true;
    document.getElementById('dashboardSection').hidden = false;
    renderPending(data);
  } catch (err) {
    errorEl.textContent = 'Could not reach the server. Check your connection and try again.';
    document.getElementById('unlockBtn').textContent = 'Unlock';
    console.error(err);
  }
}

// ---------- Tabs ----------
document.querySelectorAll('.admin-tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.dataset.tab;
    document.getElementById('pendingPanel').hidden = tab !== 'pending';
    document.getElementById('livePanel').hidden = tab !== 'live';
    document.getElementById('destinationsPanel').hidden = tab !== 'destinations';
    document.getElementById('packagesPanel').hidden = tab !== 'packages';
    document.getElementById('visaPanel').hidden = tab !== 'visa';
    document.getElementById('passportPanel').hidden = tab !== 'passport';
    if (tab === 'live') loadLiveHotels();
    if (tab === 'destinations') loadDestinationsAdmin();
    if (tab === 'packages') loadPackagesAdmin();
    if (tab === 'visa') loadVisaAdmin();
    if (tab === 'passport') loadPassportAdmin();
  });
});

async function loadLiveHotels() {
  const list = document.getElementById('liveList');
  const empty = document.getElementById('liveEmptyState');
  list.innerHTML = '<p style="color:var(--slate); font-size:14px;">Loading...</p>';

  try {
    const res = await fetch(`${APPS_SCRIPT_URL}?action=listApproved`);
    const rows = await res.json();
    list.innerHTML = '';

    if (!rows || rows.length === 0) {
      empty.hidden = false;
      return;
    }
    empty.hidden = true;

    rows.forEach(row => {
      const card = document.createElement('div');
      card.className = 'live-card';
      card.innerHTML = `
        <div class="live-card-info">
          <strong>${row.hotelName}</strong>
          <span>${row.destinationName} · ${row.category} · ₹${Number(row.price).toLocaleString('en-IN')}/night</span>
        </div>
        <button class="btn btn-remove">Remove from Site</button>`;
      card.querySelector('.btn-remove').addEventListener('click', () => {
        if (confirm(`Remove "${row.hotelName}" from the live site?`)) {
          removeHotel(row.id, card);
        }
      });
      list.appendChild(card);
    });
  } catch (err) {
    list.innerHTML = '<p style="color:var(--red); font-size:14px;">Could not load live hotels.</p>';
    console.error(err);
  }
}

async function removeHotel(id, cardEl) {
  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'updateStatus', key: adminKey, id, status: 'removed' }),
    });
    const result = await res.json();
    if (result.success) {
      cardEl.style.opacity = '0.4';
      setTimeout(() => cardEl.remove(), 300);
    } else {
      alert('Could not remove: ' + (result.error || 'unknown error'));
    }
  } catch (err) {
    alert('Could not reach the server. Please try again.');
    console.error(err);
  }
}

function renderPending(rows) {
  const list = document.getElementById('pendingList');
  const empty = document.getElementById('emptyState');
  list.innerHTML = '';

  if (!rows || rows.length === 0) {
    empty.hidden = false;
    return;
  }
  empty.hidden = true;

  rows.forEach(row => {
    const card = document.createElement('div');
    card.className = 'pending-card';

    const amenityLabels = (row.amenities || []).map(id => {
      const a = AMENITIES.find(x => x.id === id);
      return a ? `<span>${a.icon} ${a.label}</span>` : '';
    }).join('');

    const photoGroups = Object.keys(row.photos || {}).map(sectionId => {
      const sectionMeta = PHOTO_SECTIONS.find(s => s.id === sectionId);
      const urls = row.photos[sectionId] || [];
      const thumbs = urls.map(url => `<img src="${url}" alt="">`).join('');
      return `<div class="pending-photo-group"><h5>${sectionMeta ? sectionMeta.label : sectionId}</h5><div class="photo-thumbs">${thumbs}</div></div>`;
    }).join('');

    card.innerHTML = `
      <div class="pending-card-head">
        <div>
          <h3>${row.hotelName}</h3>
          <div class="pending-card-meta">${row.destinationName} · Submitted ${new Date(row.timestamp).toLocaleDateString('en-IN')} · <a href="${row.mapsLink}" target="_blank">View on Maps</a></div>
        </div>
      </div>
      <div class="pending-detail-row">
        <div><span>Category</span><strong>${row.category}</strong></div>
        <div><span>Price / Night</span><strong>₹${Number(row.price).toLocaleString('en-IN')}</strong></div>
        <div><span>Rating</span><strong>${row.rating || '—'}</strong></div>
        <div><span>Submitted By</span><strong>${row.submittedByName} (${row.submittedByPhone})</strong></div>
      </div>
      <div class="pending-amenities">${amenityLabels || '<span>No amenities selected</span>'}</div>
      <div class="pending-photos">${photoGroups || '<p style="font-size:13px;color:var(--slate);">No photos uploaded.</p>'}</div>
      <div class="pending-actions">
        <button class="btn btn-primary approve-btn">Approve</button>
        <button class="btn btn-reject reject-btn">Reject</button>
      </div>`;

    card.querySelector('.approve-btn').addEventListener('click', () => updateStatus(row.id, 'approved', card));
    card.querySelector('.reject-btn').addEventListener('click', () => updateStatus(row.id, 'rejected', card));

    list.appendChild(card);
  });
}

async function updateStatus(id, status, cardEl) {
  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'updateStatus', key: adminKey, id, status }),
    });
    const result = await res.json();
    if (result.success) {
      cardEl.style.opacity = '0.4';
      cardEl.style.pointerEvents = 'none';
      setTimeout(() => cardEl.remove(), 400);
    } else {
      alert('Could not update: ' + (result.error || 'unknown error'));
    }
  } catch (err) {
    alert('Could not reach the server. Please try again.');
    console.error(err);
  }
}

/* =========================================================
   DESTINATIONS MANAGEMENT
   ========================================================= */

async function loadDestinationsAdmin() {
  const list = document.getElementById('destList');
  list.innerHTML = '<p style="color:var(--slate); font-size:14px;">Loading...</p>';
  try {
    const res = await fetch(`${APPS_SCRIPT_URL}?action=listDestinationsAdmin&key=${encodeURIComponent(adminKey)}`);
    const rows = await res.json();
    list.innerHTML = '';

    (Array.isArray(rows) ? rows : []).filter(r => r.status !== 'removed').forEach(row => {
      const card = document.createElement('div');
      card.className = 'live-card';
      card.innerHTML = `
        <div class="live-card-info">
          <strong>${row.name}</strong>
          <span>${row.code} · ${row.region === 'domestic' ? 'Domestic' : 'International'} · ${row.tagline}</span>
        </div>
        <div style="display:flex; gap:10px;">
          <button class="btn btn-navy" style="padding:9px 18px; font-size:12px;" data-action="edit">Edit</button>
          <button class="btn btn-remove" data-action="remove">Remove</button>
        </div>`;
      card.querySelector('[data-action="edit"]').addEventListener('click', () => editDestination(row));
      card.querySelector('[data-action="remove"]').addEventListener('click', () => {
        if (confirm(`Remove destination "${row.name}"? Its hotels will no longer be browsable.`)) {
          removeDestination(row);
        }
      });
      list.appendChild(card);
    });

    if (list.innerHTML === '') list.innerHTML = '<p style="color:var(--slate); font-size:14px;">No destinations yet — add one above.</p>';
  } catch (err) {
    list.innerHTML = '<p style="color:var(--red); font-size:14px;">Could not load destinations.</p>';
    console.error(err);
  }
}

function editDestination(row) {
  document.getElementById('destId').value = row.id;
  document.getElementById('destName').value = row.name;
  document.getElementById('destCode').value = row.code;
  document.getElementById('destRegion').value = row.region;
  document.getElementById('destTagline').value = row.tagline;
  document.getElementById('destFormTitle').textContent = `Editing: ${row.name}`;
  document.getElementById('destSubmitBtn').textContent = 'Save Changes';
  document.getElementById('destCancelBtn').hidden = false;
  document.getElementById('destForm').scrollIntoView({ behavior: 'smooth' });
}

function resetDestForm() {
  document.getElementById('destForm').reset();
  document.getElementById('destId').value = '';
  document.getElementById('destFormTitle').textContent = 'Add a Destination';
  document.getElementById('destSubmitBtn').textContent = 'Add Destination';
  document.getElementById('destCancelBtn').hidden = true;
}

document.getElementById('destCancelBtn').addEventListener('click', resetDestForm);

document.getElementById('destForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    action: 'upsertDestination',
    key: adminKey,
    id: document.getElementById('destId').value || undefined,
    name: document.getElementById('destName').value.trim(),
    code: document.getElementById('destCode').value.trim(),
    region: document.getElementById('destRegion').value,
    tagline: document.getElementById('destTagline').value.trim(),
  };
  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    if (result.success) {
      resetDestForm();
      loadDestinationsAdmin();
    } else {
      alert('Could not save: ' + (result.error || 'unknown error'));
    }
  } catch (err) {
    alert('Could not reach the server. Please try again.');
    console.error(err);
  }
});

async function removeDestination(row) {
  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'upsertDestination', key: adminKey, id: row.id, name: row.name, code: row.code, region: row.region, tagline: row.tagline, status: 'removed' }),
    });
    const result = await res.json();
    if (result.success) loadDestinationsAdmin();
    else alert('Could not remove: ' + (result.error || 'unknown error'));
  } catch (err) {
    alert('Could not reach the server. Please try again.');
    console.error(err);
  }
}

/* =========================================================
   PACKAGES MANAGEMENT
   ========================================================= */

let allPackagesCache = [];
let pkgFilter = 'all';

async function loadPackagesAdmin() {
  const list = document.getElementById('pkgList');
  list.innerHTML = '<p style="color:var(--slate); font-size:14px;">Loading...</p>';
  try {
    const res = await fetch(`${APPS_SCRIPT_URL}?action=listPackagesAdmin&key=${encodeURIComponent(adminKey)}`);
    const rows = await res.json();
    allPackagesCache = (Array.isArray(rows) ? rows : []).filter(r => r.status !== 'removed');
    renderPackagesAdmin();
  } catch (err) {
    list.innerHTML = '<p style="color:var(--red); font-size:14px;">Could not load packages.</p>';
    console.error(err);
  }
}

function renderPackagesAdmin() {
  const list = document.getElementById('pkgList');
  list.innerHTML = '';
  const items = pkgFilter === 'all' ? allPackagesCache : allPackagesCache.filter(p => p.category === pkgFilter);

  if (items.length === 0) {
    list.innerHTML = '<p style="color:var(--slate); font-size:14px;">No packages here yet — add one above.</p>';
    return;
  }

  items.forEach(row => {
    const label = (row.routeFrom && row.routeTo) ? `${row.routeFrom} → ${row.routeTo} (${row.destinationLabel})` : row.destinationLabel;
    const card = document.createElement('div');
    card.className = 'live-card';
    card.innerHTML = `
      <div class="live-card-info">
        <strong>${label}</strong>
        <span>${row.category} · ${row.tag || ''} · ${row.price}${row.priceUnit ? ' ' + row.priceUnit : ''}</span>
      </div>
      <div style="display:flex; gap:10px;">
        <button class="btn btn-navy" style="padding:9px 18px; font-size:12px;" data-action="edit">Edit</button>
        <button class="btn btn-remove" data-action="remove">Remove</button>
      </div>`;
    card.querySelector('[data-action="edit"]').addEventListener('click', () => editPackage(row));
    card.querySelector('[data-action="remove"]').addEventListener('click', () => {
      if (confirm(`Remove this package (${label})?`)) removePackage(row);
    });
    list.appendChild(card);
  });
}

document.querySelectorAll('#pkgFilterTabs .tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#pkgFilterTabs .tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    pkgFilter = btn.dataset.filter;
    renderPackagesAdmin();
  });
});

function editPackage(row) {
  document.getElementById('pkgId').value = row.id;
  document.getElementById('pkgCategory').value = row.category;
  document.getElementById('pkgTag').value = row.tag || '';
  document.getElementById('pkgRouteFrom').value = row.routeFrom || '';
  document.getElementById('pkgRouteTo').value = row.routeTo || '';
  document.getElementById('pkgDestLabel').value = row.destinationLabel || '';
  document.getElementById('pkgDescription').value = row.description || '';
  document.getElementById('pkgMeta1Label').value = row.meta1Label || '';
  document.getElementById('pkgMeta1Value').value = row.meta1Value || '';
  document.getElementById('pkgMeta2Label').value = row.meta2Label || '';
  document.getElementById('pkgMeta2Value').value = row.meta2Value || '';
  document.getElementById('pkgMeta3Label').value = row.meta3Label || '';
  document.getElementById('pkgMeta3Value').value = row.meta3Value || '';
  document.getElementById('pkgPrice').value = row.price;
  document.getElementById('pkgPriceUnit').value = row.priceUnit || '';
  document.getElementById('pkgFormTitle').textContent = 'Editing Package';
  document.getElementById('pkgSubmitBtn').textContent = 'Save Changes';
  document.getElementById('pkgCancelBtn').hidden = false;
  document.getElementById('pkgForm').scrollIntoView({ behavior: 'smooth' });
}

function resetPkgForm() {
  document.getElementById('pkgForm').reset();
  document.getElementById('pkgId').value = '';
  document.getElementById('pkgFormTitle').textContent = 'Add a Package';
  document.getElementById('pkgSubmitBtn').textContent = 'Add Package';
  document.getElementById('pkgCancelBtn').hidden = true;
}

document.getElementById('pkgCancelBtn').addEventListener('click', resetPkgForm);

document.getElementById('pkgForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    action: 'upsertPackage',
    key: adminKey,
    id: document.getElementById('pkgId').value || undefined,
    category: document.getElementById('pkgCategory').value,
    tag: document.getElementById('pkgTag').value.trim(),
    routeFrom: document.getElementById('pkgRouteFrom').value.trim(),
    routeTo: document.getElementById('pkgRouteTo').value.trim(),
    destinationLabel: document.getElementById('pkgDestLabel').value.trim(),
    description: document.getElementById('pkgDescription').value.trim(),
    meta1Label: document.getElementById('pkgMeta1Label').value.trim(),
    meta1Value: document.getElementById('pkgMeta1Value').value.trim(),
    meta2Label: document.getElementById('pkgMeta2Label').value.trim(),
    meta2Value: document.getElementById('pkgMeta2Value').value.trim(),
    meta3Label: document.getElementById('pkgMeta3Label').value.trim(),
    meta3Value: document.getElementById('pkgMeta3Value').value.trim(),
    price: document.getElementById('pkgPrice').value.trim(),
    priceUnit: document.getElementById('pkgPriceUnit').value.trim(),
  };
  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    if (result.success) {
      resetPkgForm();
      loadPackagesAdmin();
    } else {
      alert('Could not save: ' + (result.error || 'unknown error'));
    }
  } catch (err) {
    alert('Could not reach the server. Please try again.');
    console.error(err);
  }
});

async function removePackage(row) {
  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'upsertPackage', key: adminKey, id: row.id, category: row.category, tag: row.tag, routeFrom: row.routeFrom, routeTo: row.routeTo, destinationLabel: row.destinationLabel, description: row.description, meta1Label: row.meta1Label, meta1Value: row.meta1Value, meta2Label: row.meta2Label, meta2Value: row.meta2Value, meta3Label: row.meta3Label, meta3Value: row.meta3Value, price: row.price, priceUnit: row.priceUnit, status: 'removed' }),
    });
    const result = await res.json();
    if (result.success) loadPackagesAdmin();
    else alert('Could not remove: ' + (result.error || 'unknown error'));
  } catch (err) {
    alert('Could not reach the server. Please try again.');
    console.error(err);
  }
}

/* =========================================================
   VISA SERVICES MANAGEMENT
   ========================================================= */

async function loadVisaAdmin() {
  const list = document.getElementById('visaList');
  list.innerHTML = '<p style="color:var(--slate); font-size:14px;">Loading...</p>';
  try {
    const res = await fetch(`${APPS_SCRIPT_URL}?action=listVisaServicesAdmin&key=${encodeURIComponent(adminKey)}`);
    const rows = await res.json();
    list.innerHTML = '';
    (Array.isArray(rows) ? rows : []).filter(r => r.status !== 'removed').forEach(row => {
      const card = document.createElement('div');
      card.className = 'live-card';
      card.innerHTML = `
        <div class="live-card-info">
          <strong>${row.country} — ${row.visaType}</strong>
          <span>${row.processingTime} · ₹${row.price} ${row.priceUnit || ''}</span>
        </div>
        <div style="display:flex; gap:10px;">
          <button class="btn btn-navy" style="padding:9px 18px; font-size:12px;" data-action="edit">Edit</button>
          <button class="btn btn-remove" data-action="remove">Remove</button>
        </div>`;
      card.querySelector('[data-action="edit"]').addEventListener('click', () => editVisa(row));
      card.querySelector('[data-action="remove"]').addEventListener('click', () => {
        if (confirm(`Remove "${row.country} — ${row.visaType}"?`)) removeVisa(row);
      });
      list.appendChild(card);
    });
    if (list.innerHTML === '') list.innerHTML = '<p style="color:var(--slate); font-size:14px;">No visa services yet — add one above.</p>';
  } catch (err) {
    list.innerHTML = '<p style="color:var(--red); font-size:14px;">Could not load visa services.</p>';
    console.error(err);
  }
}

function editVisa(row) {
  document.getElementById('visaId').value = row.id;
  document.getElementById('visaCountry').value = row.country;
  document.getElementById('visaType').value = row.visaType;
  document.getElementById('visaProcessingTime').value = row.processingTime;
  document.getElementById('visaPrice').value = row.price;
  document.getElementById('visaPriceUnit').value = row.priceUnit || '';
  document.getElementById('visaNotes').value = row.notes || '';
  document.getElementById('visaFormTitle').textContent = `Editing: ${row.country} — ${row.visaType}`;
  document.getElementById('visaSubmitBtn').textContent = 'Save Changes';
  document.getElementById('visaCancelBtn').hidden = false;
  document.getElementById('visaForm').scrollIntoView({ behavior: 'smooth' });
}

function resetVisaForm() {
  document.getElementById('visaForm').reset();
  document.getElementById('visaId').value = '';
  document.getElementById('visaFormTitle').textContent = 'Add a Visa Service';
  document.getElementById('visaSubmitBtn').textContent = 'Add Visa Service';
  document.getElementById('visaCancelBtn').hidden = true;
}

document.getElementById('visaCancelBtn').addEventListener('click', resetVisaForm);

document.getElementById('visaForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    action: 'upsertVisaService',
    key: adminKey,
    id: document.getElementById('visaId').value || undefined,
    country: document.getElementById('visaCountry').value.trim(),
    visaType: document.getElementById('visaType').value.trim(),
    processingTime: document.getElementById('visaProcessingTime').value.trim(),
    price: document.getElementById('visaPrice').value.trim(),
    priceUnit: document.getElementById('visaPriceUnit').value.trim(),
    notes: document.getElementById('visaNotes').value.trim(),
  };
  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    if (result.success) { resetVisaForm(); loadVisaAdmin(); }
    else alert('Could not save: ' + (result.error || 'unknown error'));
  } catch (err) {
    alert('Could not reach the server. Please try again.');
    console.error(err);
  }
});

async function removeVisa(row) {
  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'upsertVisaService', key: adminKey, id: row.id, country: row.country, visaType: row.visaType, processingTime: row.processingTime, price: row.price, priceUnit: row.priceUnit, notes: row.notes, status: 'removed' }),
    });
    const result = await res.json();
    if (result.success) loadVisaAdmin();
    else alert('Could not remove: ' + (result.error || 'unknown error'));
  } catch (err) {
    alert('Could not reach the server. Please try again.');
    console.error(err);
  }
}

/* =========================================================
   PASSPORT SERVICES MANAGEMENT
   ========================================================= */

async function loadPassportAdmin() {
  const list = document.getElementById('passportList');
  list.innerHTML = '<p style="color:var(--slate); font-size:14px;">Loading...</p>';
  try {
    const res = await fetch(`${APPS_SCRIPT_URL}?action=listPassportServicesAdmin&key=${encodeURIComponent(adminKey)}`);
    const rows = await res.json();
    list.innerHTML = '';
    (Array.isArray(rows) ? rows : []).filter(r => r.status !== 'removed').forEach(row => {
      const card = document.createElement('div');
      card.className = 'live-card';
      card.innerHTML = `
        <div class="live-card-info">
          <strong>${row.serviceType}</strong>
          <span>${row.processingTime} · ₹${row.price} ${row.priceUnit || ''}</span>
        </div>
        <div style="display:flex; gap:10px;">
          <button class="btn btn-navy" style="padding:9px 18px; font-size:12px;" data-action="edit">Edit</button>
          <button class="btn btn-remove" data-action="remove">Remove</button>
        </div>`;
      card.querySelector('[data-action="edit"]').addEventListener('click', () => editPassport(row));
      card.querySelector('[data-action="remove"]').addEventListener('click', () => {
        if (confirm(`Remove "${row.serviceType}"?`)) removePassport(row);
      });
      list.appendChild(card);
    });
    if (list.innerHTML === '') list.innerHTML = '<p style="color:var(--slate); font-size:14px;">No passport services yet — add one above.</p>';
  } catch (err) {
    list.innerHTML = '<p style="color:var(--red); font-size:14px;">Could not load passport services.</p>';
    console.error(err);
  }
}

function editPassport(row) {
  document.getElementById('passportId').value = row.id;
  document.getElementById('passportServiceType').value = row.serviceType;
  document.getElementById('passportProcessingTime').value = row.processingTime;
  document.getElementById('passportPrice').value = row.price;
  document.getElementById('passportPriceUnit').value = row.priceUnit || '';
  document.getElementById('passportNotes').value = row.notes || '';
  document.getElementById('passportFormTitle').textContent = `Editing: ${row.serviceType}`;
  document.getElementById('passportSubmitBtn').textContent = 'Save Changes';
  document.getElementById('passportCancelBtn').hidden = false;
  document.getElementById('passportForm').scrollIntoView({ behavior: 'smooth' });
}

function resetPassportForm() {
  document.getElementById('passportForm').reset();
  document.getElementById('passportId').value = '';
  document.getElementById('passportFormTitle').textContent = 'Add a Passport Service';
  document.getElementById('passportSubmitBtn').textContent = 'Add Passport Service';
  document.getElementById('passportCancelBtn').hidden = true;
}

document.getElementById('passportCancelBtn').addEventListener('click', resetPassportForm);

document.getElementById('passportForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    action: 'upsertPassportService',
    key: adminKey,
    id: document.getElementById('passportId').value || undefined,
    serviceType: document.getElementById('passportServiceType').value.trim(),
    processingTime: document.getElementById('passportProcessingTime').value.trim(),
    price: document.getElementById('passportPrice').value.trim(),
    priceUnit: document.getElementById('passportPriceUnit').value.trim(),
    notes: document.getElementById('passportNotes').value.trim(),
  };
  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    if (result.success) { resetPassportForm(); loadPassportAdmin(); }
    else alert('Could not save: ' + (result.error || 'unknown error'));
  } catch (err) {
    alert('Could not reach the server. Please try again.');
    console.error(err);
  }
});

async function removePassport(row) {
  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'upsertPassportService', key: adminKey, id: row.id, serviceType: row.serviceType, processingTime: row.processingTime, price: row.price, priceUnit: row.priceUnit, notes: row.notes, status: 'removed' }),
    });
    const result = await res.json();
    if (result.success) loadPassportAdmin();
    else alert('Could not remove: ' + (result.error || 'unknown error'));
  } catch (err) {
    alert('Could not reach the server. Please try again.');
    console.error(err);
  }
}
