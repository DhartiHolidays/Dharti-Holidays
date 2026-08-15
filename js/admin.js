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
