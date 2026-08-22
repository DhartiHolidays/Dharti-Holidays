/* =========================================================
   add-hotel.html logic
   ========================================================= */

// photos[sectionId] = array of { dataUrl, fileName }
const photos = {};

// ---------- Populate dropdowns ----------
const destSelect = document.getElementById('destination');

async function loadDestinationChoices() {
  destSelect.innerHTML = '<option>Loading...</option>';
  if (typeof APPS_SCRIPT_URL === 'undefined' || APPS_SCRIPT_URL.includes('PASTE_YOUR')) {
    destSelect.innerHTML = '<option>Setup incomplete</option>';
    return;
  }
  try {
    const res = await fetch(`${APPS_SCRIPT_URL}?action=listDestinations`);
    const rows = await res.json();
    destSelect.innerHTML = '';
    (Array.isArray(rows) ? rows : []).forEach(d => {
      const opt = document.createElement('option');
      opt.value = d.id;
      opt.textContent = d.name;
      destSelect.appendChild(opt);
    });
    if (destSelect.innerHTML === '') destSelect.innerHTML = '<option>No destinations set up yet</option>';
  } catch (err) {
    destSelect.innerHTML = '<option>Could not load destinations</option>';
    console.error(err);
  }
}
loadDestinationChoices();

const photoCategorySelect = document.getElementById('photoCategory');
PHOTO_SECTIONS.forEach(s => {
  const opt = document.createElement('option');
  opt.value = s.id;
  opt.textContent = s.label;
  photoCategorySelect.appendChild(opt);
});

// ---------- Amenity chips ----------
const selectedAmenities = new Set();
const amenityGrid = document.getElementById('amenityGrid');
AMENITIES.forEach(a => {
  const chip = document.createElement('div');
  chip.className = 'amenity-chip';
  chip.innerHTML = `<span class="icon">${a.icon}</span><span>${a.label}</span>`;
  chip.addEventListener('click', () => {
    if (selectedAmenities.has(a.id)) {
      selectedAmenities.delete(a.id);
      chip.classList.remove('selected');
    } else {
      selectedAmenities.add(a.id);
      chip.classList.add('selected');
    }
  });
  amenityGrid.appendChild(chip);
});

// ---------- Image resize helper (keeps uploads small/fast) ----------
function resizeImage(file, maxWidth = 1000, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ---------- Add photos to a category ----------
document.getElementById('addPhotoBtn').addEventListener('click', async () => {
  const sectionId = photoCategorySelect.value;
  const input = document.getElementById('photoInput');
  const files = Array.from(input.files || []);
  if (files.length === 0) return;

  if (!photos[sectionId]) photos[sectionId] = [];

  for (const file of files) {
    try {
      const dataUrl = await resizeImage(file);
      photos[sectionId].push({ dataUrl, fileName: file.name });
    } catch (err) {
      console.error('Could not process image', file.name, err);
    }
  }

  input.value = '';
  renderPhotoPreview();
});

function renderPhotoPreview() {
  const container = document.getElementById('photoPreviewGrid');
  container.innerHTML = '';

  Object.keys(photos).forEach(sectionId => {
    if (!photos[sectionId] || photos[sectionId].length === 0) return;
    const sectionMeta = PHOTO_SECTIONS.find(s => s.id === sectionId);

    const group = document.createElement('div');
    group.className = 'photo-section-group';
    group.innerHTML = `<h4>${sectionMeta ? sectionMeta.label : sectionId}</h4>`;

    const thumbs = document.createElement('div');
    thumbs.className = 'photo-thumbs';

    photos[sectionId].forEach((photo, idx) => {
      const thumb = document.createElement('div');
      thumb.className = 'photo-thumb';
      thumb.innerHTML = `<img src="${photo.dataUrl}" alt=""><button type="button" class="photo-thumb-remove">✕</button>`;
      thumb.querySelector('.photo-thumb-remove').addEventListener('click', () => {
        photos[sectionId].splice(idx, 1);
        renderPhotoPreview();
      });
      thumbs.appendChild(thumb);
    });

    group.appendChild(thumbs);
    container.appendChild(group);
  });
}

// ---------- Submit ----------
document.getElementById('hotelForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  if (APPS_SCRIPT_URL.includes('PASTE_YOUR')) {
    document.getElementById('formStatus').textContent =
      'Setup incomplete: the site owner needs to connect the Apps Script backend before submissions can be saved.';
    return;
  }

  const submitBtn = document.getElementById('submitBtn');
  const statusEl = document.getElementById('formStatus');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting...';
  statusEl.textContent = '';

  const destId = destSelect.value;
  const destName = destSelect.options[destSelect.selectedIndex]?.textContent || destId;

  // Reshape photos to { sectionId: [dataUrl, dataUrl, ...] } for the backend
  const photosPayload = {};
  Object.keys(photos).forEach(sectionId => {
    photosPayload[sectionId] = photos[sectionId].map(p => p.dataUrl);
  });

  const payload = {
    action: 'submitHotel',
    destinationId: destId,
    destinationName: destName,
    hotelName: document.getElementById('hotelName').value.trim(),
    location: document.getElementById('location').value.trim(),
    mapsLink: document.getElementById('mapsLink').value.trim(),
    category: document.getElementById('category').value,
    price: document.getElementById('price').value,
    rating: document.getElementById('rating').value,
    amenities: Array.from(selectedAmenities),
    photos: photosPayload,
    submittedByName: document.getElementById('submitterName').value.trim(),
    submittedByPhone: document.getElementById('submitterPhone').value.trim(),
  };

  try {
    // text/plain avoids a CORS preflight against Apps Script's web app endpoint
    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    });
    const result = await res.json();

    if (result.success) {
      statusEl.textContent = 'Thank you! Your hotel has been submitted and is pending review. We\'ll contact you once it\'s approved.';
      document.getElementById('hotelForm').reset();
      Object.keys(photos).forEach(k => delete photos[k]);
      renderPhotoPreview();
      selectedAmenities.clear();
      document.querySelectorAll('.amenity-chip.selected').forEach(c => c.classList.remove('selected'));
    } else {
      statusEl.textContent = 'Something went wrong: ' + (result.error || 'please try again.');
    }
  } catch (err) {
    statusEl.textContent = 'Could not reach the server. Please check your connection and try again.';
    console.error(err);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit for Review';
  }
});
