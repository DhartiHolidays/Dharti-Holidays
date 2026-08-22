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
