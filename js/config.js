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
const APPS_SCRIPT_URL = 'https://script.google.com/macros/library/d/1NWToyXhtyRAhKeRmaGdvDmyM6cpATy7S5etlqlUVtgx3QvQnKclTzAdX/11';

/* =========================================================
   Shared lead logging helper — called from every enquiry
   form on the site alongside opening WhatsApp. Fire-and-
   forget: never blocks or delays the WhatsApp redirect, and
   fails silently if the backend isn't connected yet.
   ========================================================= */
function logLead(type, name, phone, details) {
  if (typeof APPS_SCRIPT_URL === 'undefined' || APPS_SCRIPT_URL.includes('PASTE_YOUR')) return;
  try {
    fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'logLead', type, name, phone, details }),
    }).catch(() => {});
  } catch (e) {
    // silent — lead logging is a nice-to-have, never blocks the user
  }
}
