/**
 * DHARTI HOLIDAYS — Hotel Submission Backend
 * ============================================
 * Paste this whole file into script.google.com (bound to a
 * new Google Sheet). See SETUP-GUIDE.md for exact steps.
 *
 * This script:
 *  - Receives new hotel submissions from add-hotel.html and
 *    saves them as "pending" rows in the Sheet
 *  - Saves uploaded photos into a Google Drive folder and
 *    stores the shareable link
 *  - Lets admin.html list pending submissions and approve or
 *    reject them (protected by SECRET_KEY below)
 *  - Lets explore.html fetch only "approved" hotels to show
 *    on the live site
 */

// CHANGE THIS to your own secret before deploying — this is
// the password admin.html will ask you for. Keep it private.
const SECRET_KEY = 'Dharti@3116';

const SHEET_NAME = 'Hotels';
const DRIVE_FOLDER_NAME = 'Dharti Holidays Hotel Photos';

function doGet(e) {
  const action = e.parameter.action;

  if (action === 'listApproved') {
    return respond(getRows('approved'));
  }
  if (action === 'listPending') {
    if (e.parameter.key !== SECRET_KEY) return respond({ error: 'unauthorized' });
    return respond(getRows('pending'));
  }
  if (action === 'listDestinations') {
    return respond(listDestinations(true));
  }
  if (action === 'listDestinationsAdmin') {
    if (e.parameter.key !== SECRET_KEY) return respond({ error: 'unauthorized' });
    return respond(listDestinations(false));
  }
  if (action === 'listPackages') {
    return respond(listPackages(true));
  }
  if (action === 'listPackagesAdmin') {
    if (e.parameter.key !== SECRET_KEY) return respond({ error: 'unauthorized' });
    return respond(listPackages(false));
  }
  if (action === 'listVisaServices') {
    return respond(listVisaServices(true));
  }
  if (action === 'listVisaServicesAdmin') {
    if (e.parameter.key !== SECRET_KEY) return respond({ error: 'unauthorized' });
    return respond(listVisaServices(false));
  }
  if (action === 'listPassportServices') {
    return respond(listPassportServices(true));
  }
  if (action === 'listPassportServicesAdmin') {
    if (e.parameter.key !== SECRET_KEY) return respond({ error: 'unauthorized' });
    return respond(listPassportServices(false));
  }
  return respond({ error: 'unknown action' });
}

function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  const action = body.action;

  if (action === 'submitHotel') {
    return respond(submitHotel(body));
  }
  if (action === 'updateStatus') {
    if (body.key !== SECRET_KEY) return respond({ error: 'unauthorized' });
    return respond(updateStatus(body.id, body.status));
  }
  if (action === 'upsertDestination') {
    if (body.key !== SECRET_KEY) return respond({ error: 'unauthorized' });
    return respond(upsertDestination(body));
  }
  if (action === 'upsertPackage') {
    if (body.key !== SECRET_KEY) return respond({ error: 'unauthorized' });
    return respond(upsertPackage(body));
  }
  if (action === 'upsertVisaService') {
    if (body.key !== SECRET_KEY) return respond({ error: 'unauthorized' });
    return respond(upsertVisaService(body));
  }
  if (action === 'upsertPassportService') {
    if (body.key !== SECRET_KEY) return respond({ error: 'unauthorized' });
    return respond(upsertPassportService(body));
  }
  if (action === 'bulkImportHotels') {
    if (body.key !== SECRET_KEY) return respond({ error: 'unauthorized' });
    return respond(bulkImportHotels(body.hotels || []));
  }
  return respond({ error: 'unknown action' });
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      'id', 'timestamp', 'destinationId', 'destinationName', 'hotelName', 'location',
      'mapsLink', 'category', 'price', 'rating', 'amenities', 'photos',
      'status', 'submittedByName', 'submittedByPhone'
    ]);
  }
  return sheet;
}

function getFolder() {
  const folders = DriveApp.getFoldersByName(DRIVE_FOLDER_NAME);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(DRIVE_FOLDER_NAME);
}

function saveImage(base64Data, fileName) {
  const parts = base64Data.split(',');
  const contentType = parts[0].match(/data:(.*);base64/)[1];
  const bytes = Utilities.base64Decode(parts[1]);
  const blob = Utilities.newBlob(bytes, contentType, fileName);
  const folder = getFolder();
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  // The thumbnail endpoint embeds far more reliably than the old
  // uc?export=view format, which Google frequently blocks for
  // direct <img> embedding.
  return 'https://drive.google.com/thumbnail?id=' + file.getId() + '&sz=w1000';
}

function submitHotel(body) {
  const sheet = getSheet();
  const id = Utilities.getUuid();
  const timestamp = new Date().toISOString();

  const photoUrls = {};
  const photos = body.photos || {};
  Object.keys(photos).forEach(function (sectionId) {
    const imagesForSection = photos[sectionId]; // array of base64 strings
    if (imagesForSection && imagesForSection.length) {
      photoUrls[sectionId] = imagesForSection.map(function (base64, i) {
        return saveImage(base64, id + '_' + sectionId + '_' + i + '.jpg');
      });
    }
  });

  sheet.appendRow([
    id, timestamp, body.destinationId, body.destinationName, body.hotelName, body.location,
    body.mapsLink, body.category, body.price, body.rating,
    JSON.stringify(body.amenities || []), JSON.stringify(photoUrls),
    'pending', body.submittedByName, body.submittedByPhone
  ]);

  return { success: true, id: id };
}

function updateStatus(id, status) {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.getRange(i + 1, 13).setValue(status); // column 13 = status
      return { success: true };
    }
  }
  return { error: 'not found' };
}

function getRows(status) {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  const rows = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[12] === status) {
      rows.push({
        id: row[0], timestamp: row[1], destinationId: row[2], destinationName: row[3],
        hotelName: row[4], location: row[5], mapsLink: row[6], category: row[7], price: row[8], rating: row[9],
        amenities: JSON.parse(row[10] || '[]'), photos: JSON.parse(row[11] || '{}'),
        status: row[12], submittedByName: row[13], submittedByPhone: row[14]
      });
    }
  }
  return rows;
}

function respond(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* =========================================================
   GENERIC SHEET HELPERS — used by Destinations and Packages
   ========================================================= */

function getSheetGeneric(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
  }
  return sheet;
}

function rowsToObjects(sheet, headers) {
  const data = sheet.getDataRange().getValues();
  const out = [];
  for (let i = 1; i < data.length; i++) {
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = data[i][idx]; });
    out.push(obj);
  }
  return out;
}

function findRowIndexById(sheet, id) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) return i + 1; // 1-indexed sheet row
  }
  return -1;
}

/* =========================================================
   DESTINATIONS
   ========================================================= */

const DEST_HEADERS = ['id', 'name', 'code', 'region', 'tagline', 'status'];

function listDestinations(activeOnly) {
  const sheet = getSheetGeneric('Destinations', DEST_HEADERS);
  const rows = rowsToObjects(sheet, DEST_HEADERS);
  return activeOnly ? rows.filter(r => r.status === 'active') : rows;
}

function upsertDestination(body) {
  const sheet = getSheetGeneric('Destinations', DEST_HEADERS);
  let id = body.id;
  const status = body.status || 'active';
  if (id) {
    const rowIdx = findRowIndexById(sheet, id);
    if (rowIdx === -1) return { error: 'not found' };
    sheet.getRange(rowIdx, 1, 1, DEST_HEADERS.length).setValues([[id, body.name, body.code, body.region, body.tagline, status]]);
  } else {
    id = Utilities.getUuid();
    sheet.appendRow([id, body.name, body.code, body.region, body.tagline, status]);
  }
  return { success: true, id: id };
}

/* =========================================================
   PACKAGES
   ========================================================= */

const PKG_HEADERS = [
  'id', 'category', 'routeFrom', 'routeTo', 'destinationLabel', 'tag', 'description',
  'meta1Label', 'meta1Value', 'meta2Label', 'meta2Value', 'meta3Label', 'meta3Value',
  'price', 'priceUnit', 'status'
];

function listPackages(activeOnly) {
  const sheet = getSheetGeneric('Packages', PKG_HEADERS);
  const rows = rowsToObjects(sheet, PKG_HEADERS);
  return activeOnly ? rows.filter(r => r.status === 'active') : rows;
}

function upsertPackage(body) {
  const sheet = getSheetGeneric('Packages', PKG_HEADERS);
  let id = body.id;
  const status = body.status || 'active';
  const values = [
    id || '', body.category, body.routeFrom, body.routeTo, body.destinationLabel, body.tag,
    body.description, body.meta1Label, body.meta1Value, body.meta2Label, body.meta2Value,
    body.meta3Label, body.meta3Value, body.price, body.priceUnit, status
  ];
  if (id) {
    const rowIdx = findRowIndexById(sheet, id);
    if (rowIdx === -1) return { error: 'not found' };
    sheet.getRange(rowIdx, 1, 1, PKG_HEADERS.length).setValues([values]);
  } else {
    id = Utilities.getUuid();
    values[0] = id;
    sheet.appendRow(values);
  }
  return { success: true, id: id };
}

/* =========================================================
   VISA SERVICES
   ========================================================= */

const VISA_HEADERS = ['id', 'country', 'visaType', 'processingTime', 'price', 'priceUnit', 'notes', 'status'];

function listVisaServices(activeOnly) {
  const sheet = getSheetGeneric('VisaServices', VISA_HEADERS);
  const rows = rowsToObjects(sheet, VISA_HEADERS);
  return activeOnly ? rows.filter(r => r.status === 'active') : rows;
}

function upsertVisaService(body) {
  const sheet = getSheetGeneric('VisaServices', VISA_HEADERS);
  let id = body.id;
  const status = body.status || 'active';
  const values = [id || '', body.country, body.visaType, body.processingTime, body.price, body.priceUnit, body.notes, status];
  if (id) {
    const rowIdx = findRowIndexById(sheet, id);
    if (rowIdx === -1) return { error: 'not found' };
    sheet.getRange(rowIdx, 1, 1, VISA_HEADERS.length).setValues([values]);
  } else {
    id = Utilities.getUuid();
    values[0] = id;
    sheet.appendRow(values);
  }
  return { success: true, id: id };
}

/* =========================================================
   PASSPORT SERVICES
   ========================================================= */

const PASSPORT_HEADERS = ['id', 'serviceType', 'processingTime', 'price', 'priceUnit', 'notes', 'status'];

function listPassportServices(activeOnly) {
  const sheet = getSheetGeneric('PassportServices', PASSPORT_HEADERS);
  const rows = rowsToObjects(sheet, PASSPORT_HEADERS);
  return activeOnly ? rows.filter(r => r.status === 'active') : rows;
}

function upsertPassportService(body) {
  const sheet = getSheetGeneric('PassportServices', PASSPORT_HEADERS);
  let id = body.id;
  const status = body.status || 'active';
  const values = [id || '', body.serviceType, body.processingTime, body.price, body.priceUnit, body.notes, status];
  if (id) {
    const rowIdx = findRowIndexById(sheet, id);
    if (rowIdx === -1) return { error: 'not found' };
    sheet.getRange(rowIdx, 1, 1, PASSPORT_HEADERS.length).setValues([values]);
  } else {
    id = Utilities.getUuid();
    values[0] = id;
    sheet.appendRow(values);
  }
  return { success: true, id: id };
}

/* =========================================================
   ONE-TIME MIGRATION
   Run this once from the Apps Script editor (select
   "seedInitialData" from the function dropdown, click Run)
   to copy the original demo destinations, hotels, and
   packages into the Sheet so nothing disappears when you
   switch the site over to the admin-managed system. Safe to
   run only once — it checks each sheet is empty first.
   ========================================================= */

function seedInitialData() {
  seedDestinations();
  seedHotels();
  seedPackages();
  seedVisaServices();
  seedPassportServices();
}

function seedDestinations() {
  const sheet = getSheetGeneric('Destinations', DEST_HEADERS);
  if (sheet.getLastRow() > 1) return; // already seeded
  const data = [
    ['kerala', 'Kerala', 'COK', 'domestic', 'Backwaters, tea hills and houseboats'],
    ['goa', 'Goa', 'GOI', 'domestic', 'Beaches, nightlife and Portuguese charm'],
    ['kashmir', 'Kashmir', 'SXR', 'domestic', 'Houseboats, valleys and snow-capped peaks'],
    ['rajasthan', 'Rajasthan', 'JAI', 'domestic', 'Forts, palaces and desert heritage'],
    ['dubai', 'Dubai', 'DXB', 'international', 'Skyline, desert safaris and shopping'],
    ['bali', 'Bali', 'DPS', 'international', 'Rice terraces, temples and beach clubs'],
    ['maldives', 'Maldives', 'MLE', 'international', 'Overwater villas and coral reefs'],
    ['thailand', 'Thailand', 'BKK', 'international', 'Islands, street food and city temples'],
  ];
  data.forEach(d => sheet.appendRow([d[0], d[1], d[2], d[3], d[4], 'active']));
}

function seedHotels() {
  const sheet = getSheet(); // existing Hotels sheet
  if (sheet.getLastRow() > 1) return; // already has data — don't duplicate
  const now = new Date().toISOString();
  const hotels = [
    ['kerala','Kerala','Lake Palace Resort','','Deluxe',4200,4.5,['Backwater View','Breakfast Included','Free WiFi']],
    ['kerala','Kerala','Spice Tree Munnar','','Luxury',7800,4.7,['Mountain View','Spa','Pool']],
    ['kerala','Kerala','Periyar Woods','','Budget',2400,4.1,['Forest View','Breakfast Included']],
    ['goa','Goa','Baga Sands Resort','','Deluxe',3800,4.3,['Beach Access','Pool','Breakfast Included']],
    ['goa','Goa','Palolem Beach Huts','','Budget',1800,4.0,['Beachfront','Free WiFi']],
    ['goa','Goa','The Fern Grande','','Luxury',6900,4.6,['Pool','Spa','Breakfast Included']],
    ['kashmir','Kashmir','Dal Lake Houseboat','','Deluxe',3500,4.6,['Lake View','Breakfast Included']],
    ['kashmir','Kashmir','Gulmarg Heights','','Luxury',8200,4.7,['Mountain View','Bonfire','Spa']],
    ['kashmir','Kashmir','Pahalgam Valley Inn','','Budget',2100,4.0,['Valley View','Free WiFi']],
    ['rajasthan','Rajasthan','Heritage Haveli','','Deluxe',4600,4.4,['Courtyard','Breakfast Included']],
    ['rajasthan','Rajasthan','Lake View Palace','','Luxury',9500,4.8,['Lake View','Pool','Spa']],
    ['rajasthan','Rajasthan','Blue City Stay','','Budget',2000,4.0,['Rooftop','Free WiFi']],
    ['dubai','Dubai','Marina Bay Hotel','','Deluxe',8500,4.5,['Marina View','Pool','Breakfast Included']],
    ['dubai','Dubai','Downtown Skyline Suites','','Luxury',15000,4.8,['Burj Khalifa View','Spa','Pool']],
    ['dubai','Dubai','Deira Budget Inn','','Budget',4200,3.9,['Free WiFi','Breakfast Included']],
    ['bali','Bali','Ubud Rice View Villas','','Deluxe',6200,4.6,['Rice Field View','Private Pool']],
    ['bali','Bali','Seminyak Beach Resort','','Luxury',11000,4.7,['Beachfront','Spa','Pool']],
    ['bali','Bali','Kuta Budget Stay','','Budget',2800,4.0,['Free WiFi','Breakfast Included']],
    ['maldives','Maldives','Coral Overwater Villas','','Luxury',24000,4.9,['Overwater Villa','Private Deck','All Meals']],
    ['maldives','Maldives','Lagoon View Retreat','','Deluxe',14000,4.6,['Lagoon View','Breakfast Included']],
    ['thailand','Thailand','Sukhumvit City Hotel','','Deluxe',4800,4.3,['City View','Pool','Breakfast Included']],
    ['thailand','Thailand','Patong Beachfront','','Luxury',9200,4.6,['Beachfront','Spa','Pool']],
    ['thailand','Thailand','Pattaya Budget Stay','','Budget',2200,3.9,['Free WiFi']],
  ];
  const locationMap = {
    'Lake Palace Resort':'Alleppey','Spice Tree Munnar':'Munnar','Periyar Woods':'Thekkady',
    'Baga Sands Resort':'North Goa','Palolem Beach Huts':'South Goa','The Fern Grande':'Candolim',
    'Dal Lake Houseboat':'Srinagar','Gulmarg Heights':'Gulmarg','Pahalgam Valley Inn':'Pahalgam',
    'Heritage Haveli':'Jaipur','Lake View Palace':'Udaipur','Blue City Stay':'Jodhpur',
    'Marina Bay Hotel':'Dubai Marina','Downtown Skyline Suites':'Downtown Dubai','Deira Budget Inn':'Deira',
    'Ubud Rice View Villas':'Ubud','Seminyak Beach Resort':'Seminyak','Kuta Budget Stay':'Kuta',
    'Coral Overwater Villas':'North Male Atoll','Lagoon View Retreat':'South Male Atoll',
    'Sukhumvit City Hotel':'Bangkok','Patong Beachfront':'Phuket','Pattaya Budget Stay':'Pattaya',
  };
  hotels.forEach(h => {
    const id = Utilities.getUuid();
    const hotelName = h[2];
    const location = locationMap[hotelName] || '';
    sheet.appendRow([
      id, now, h[0], h[1], hotelName, location, '', h[4], h[5], h[6],
      JSON.stringify(h[7]), JSON.stringify({}), 'approved', 'Dharti Holidays', ''
    ]);
  });
}

function seedPackages() {
  const sheet = getSheetGeneric('Packages', PKG_HEADERS);
  if (sheet.getLastRow() > 1) return;
  const rows = [
    ['domestic','AMD','SXR','Kashmir','Popular','Srinagar, Gulmarg and Pahalgam with houseboat stay and Shikara ride included.','Duration','5N/6D','Best Season','Mar–Oct','Ideal For','Family','18999','per person onward'],
    ['domestic','AMD','GOI','Goa','Weekend','North & South Goa beaches, water sports and a sunset cruise, with airport transfers.','Duration','3N/4D','Best Season','Oct–Feb','Ideal For','Friends','10499','per person onward'],
    ['domestic','AMD','COK','Kerala','Nature',"Munnar, Thekkady and an Alleppey houseboat stay through God's Own Country.",'Duration','6N/7D','Best Season','Sep–Mar','Ideal For','Family','21999','per person onward'],
    ['domestic','AMD','JAI','Rajasthan','Heritage','Jaipur, Udaipur and Jodhpur — forts, palaces and a Mewar heritage experience.','Duration','5N/6D','Best Season','Oct–Mar','Ideal For','Family','16499','per person onward'],
    ['domestic','AMD','IXL','Ladakh','Adventure','Leh, Nubra Valley and Pangong Lake, with acclimatisation days built in.','Duration','6N/7D','Best Season','May–Sep','Ideal For','Groups','27999','per person onward'],
    ['domestic','AMD','IXZ','Andaman','Island','Port Blair, Havelock and Neil Island with scuba and snorkelling options.','Duration','5N/6D','Best Season','Oct–May','Ideal For','Family','24999','per person onward'],
    ['international','AMD','DXB','Dubai','Popular','City tour, desert safari and Burj Khalifa entry, with visa handled by us.','Duration','4N/5D','Visa','Assisted','Ideal For','Family','42999','per person onward'],
    ['international','AMD','BKK','Thailand','Value','Bangkok and Pattaya with an island tour and city sightseeing included.','Duration','5N/6D','Visa','Assisted','Ideal For','Friends','38999','per person onward'],
    ['international','AMD','SIN','Singapore','City Break','Singapore and Malaysia combo with Universal Studios and Gardens by the Bay.','Duration','6N/7D','Visa','Assisted','Ideal For','Family','64999','per person onward'],
    ['international','AMD','CDG','Europe','Premium','France, Switzerland and Italy multi-country tour with a local guide throughout.','Duration','9N/10D','Visa','Assisted','Ideal For','Family','145999','per person onward'],
    ['international','AMD','KTM','Nepal','Value','Kathmandu and Pokhara with temple visits and a lakeside stay.','Duration','4N/5D','Visa','On Arrival','Ideal For','Family','22999','per person onward'],
    ['international','AMD','DPS','Bali','Trending','Ubud, Kuta and Nusa Penida with a private day tour and beach club access.','Duration','5N/6D','Visa','On Arrival','Ideal For','Friends','54999','per person onward'],
    ['honeymoon','AMD','MLE','Maldives','Signature','Overwater villa stay with candlelight dinner and a private sunset cruise.','Duration','4N/5D','Stay','Overwater Villa','Ideal For','Couples','89999','per couple onward'],
    ['honeymoon','AMD','DPS','Bali','Romantic',"Private pool villa in Ubud with a couple's spa session and waterfall tour.",'Duration','5N/6D','Stay','Private Villa','Ideal For','Couples','58999','per couple onward'],
    ['honeymoon','AMD','SXR','Kashmir','Classic','Houseboat stay in Srinagar plus Gulmarg gondola and Pahalgam valley visit.','Duration','5N/6D','Stay','Houseboat','Ideal For','Couples','32999','per couple onward'],
    ['honeymoon','AMD','HKT','Phuket','Beach','Beachfront resort stay with an island-hopping tour and sunset dinner cruise.','Duration','5N/6D','Stay','Beach Resort','Ideal For','Couples','49999','per couple onward'],
    ['corporate','','','MICE','Groups','Venue booking, stay, transport and team-activities coordination for offsites and conferences.','Group Size','20–500+','Billing','Single Invoice','Ideal For','Companies','Custom','quote on request'],
    ['corporate','','','School & College','Groups','Educational and adventure tours with dedicated group leaders and safety planning.','Group Size','30–200','Billing','Single Invoice','Ideal For','Institutes','Custom','quote on request'],
    ['corporate','','','Pilgrimage','Groups','Char Dham, Dwarka-Somnath and other yatra circuits with coach transport arranged.','Group Size','10–100','Billing','Single Invoice','Ideal For','Communities','Custom','quote on request'],
    ['corporate','','','Family Reunion','Groups','Coordinated flights, block hotel bookings and shared itineraries for big family groups.','Group Size','15–80','Billing','Single Invoice','Ideal For','Families','Custom','quote on request'],
  ];
  rows.forEach(r => {
    const id = Utilities.getUuid();
    sheet.appendRow([id, r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7], r[8], r[9], r[10], r[11], r[12], r[13], 'active']);
  });
}

function seedVisaServices() {
  const sheet = getSheetGeneric('VisaServices', VISA_HEADERS);
  if (sheet.getLastRow() > 1) return;
  const rows = [
    ['UAE (Dubai)', 'Tourist Visa', '3-4 working days', '3500', 'starting from', '14 & 30 day options available'],
    ['Thailand', 'Tourist Visa', '3-5 working days', '2800', 'starting from', 'Visa on arrival also available for short stays'],
    ['Singapore', 'Tourist Visa', '3-5 working days', '3200', 'starting from', ''],
    ['Schengen (Europe)', 'Tourist Visa', '10-15 working days', '7500', 'starting from', 'Covers France, Italy, Switzerland and more'],
    ['United Kingdom', 'Tourist Visa', '15-20 working days', '9500', 'starting from', ''],
    ['United States', 'Tourist Visa (B1/B2)', 'Varies — embassy dependent', '14000', 'starting from', 'Includes appointment assistance'],
    ['Malaysia', 'Tourist Visa', '3-4 working days', '2600', 'starting from', ''],
    ['Bali (Indonesia)', 'Visa on Arrival Assistance', '1-2 working days', '1800', 'starting from', 'Guidance for on-arrival visa process'],
  ];
  rows.forEach(r => {
    const id = Utilities.getUuid();
    sheet.appendRow([id, r[0], r[1], r[2], r[3], r[4], r[5], 'active']);
  });
}

function seedPassportServices() {
  const sheet = getSheetGeneric('PassportServices', PASSPORT_HEADERS);
  if (sheet.getLastRow() > 1) return;
  const rows = [
    ['New Passport (Normal)', '30-45 days', '2000', 'service fee, excl. govt fee', 'Includes application and document guidance'],
    ['New Passport (Tatkal)', '7-14 days', '3500', 'service fee, excl. govt fee', ''],
    ['Passport Renewal (Normal)', '30-45 days', '2000', 'service fee, excl. govt fee', ''],
    ['Passport Renewal (Tatkal)', '7-14 days', '3500', 'service fee, excl. govt fee', ''],
    ['Lost / Damaged Passport Reissue', '30-45 days', '2500', 'service fee, excl. govt fee', ''],
    ['Passport for Minor', '30-45 days', '2000', 'service fee, excl. govt fee', ''],
    ['Police Clearance Certificate', '7-10 days', '1500', 'service fee, excl. govt fee', ''],
  ];
  rows.forEach(r => {
    const id = Utilities.getUuid();
    sheet.appendRow([id, r[0], r[1], r[2], r[3], r[4], 'active']);
  });
}

/* =========================================================
   BULK HOTEL IMPORT
   Called from admin.html's Bulk Import tab. Accepts an array
   of parsed CSV rows, auto-creates any destination that
   doesn't already exist (matched case-insensitively by name),
   and writes every hotel row in a single batch write — fast
   even for thousands of rows, since it's one operation
   instead of one per hotel.
   ========================================================= */

function bulkImportHotels(hotels) {
  if (!hotels || hotels.length === 0) return { success: true, imported: 0, destinationsCreated: 0, skipped: [] };

  const destSheet = getSheetGeneric('Destinations', DEST_HEADERS);
  const destRows = rowsToObjects(destSheet, DEST_HEADERS);
  // Map of lowercased destination name -> {id, name}
  const destMap = {};
  destRows.forEach(d => { destMap[String(d.name).toLowerCase().trim()] = { id: d.id, name: d.name }; });

  const newDestinations = [];
  const hotelRows = [];
  const skipped = [];
  const now = new Date().toISOString();

  hotels.forEach((h, idx) => {
    const destName = (h.destination || '').trim();
    const hotelName = (h.hotelName || '').trim();

    if (!destName || !hotelName) {
      skipped.push({ row: idx + 2, reason: 'Missing destination or hotel name' });
      return;
    }

    const key = destName.toLowerCase();
    let dest = destMap[key];

    if (!dest) {
      // Auto-create this destination
      const newId = Utilities.getUuid();
      const region = (h.region || 'domestic').toLowerCase().trim() === 'international' ? 'international' : 'domestic';
      const code = destName.substring(0, 3).toUpperCase();
      newDestinations.push([newId, destName, code, region, `Explore ${destName}`, 'active']);
      dest = { id: newId, name: destName };
      destMap[key] = dest; // so later rows with the same new destination reuse it, not duplicate
    }

    const photos = {};
    if (h.photoUrl && h.photoUrl.trim()) {
      photos.exterior = [h.photoUrl.trim()];
    }

    const amenities = (h.amenities || '')
      .split(',')
      .map(a => a.trim())
      .filter(a => a.length > 0);

    hotelRows.push([
      Utilities.getUuid(), now, dest.id, dest.name, hotelName, (h.location || '').trim(),
      (h.mapsLink || '').trim(), (h.category || 'Deluxe').trim(), h.price || 0, h.rating || '',
      JSON.stringify(amenities), JSON.stringify(photos),
      'approved', 'Dharti Holidays (Bulk Import)', ''
    ]);
  });

  // Write new destinations in one batch, if any
  if (newDestinations.length > 0) {
    destSheet.getRange(destSheet.getLastRow() + 1, 1, newDestinations.length, DEST_HEADERS.length).setValues(newDestinations);
  }

  // Write all hotel rows in one batch
  if (hotelRows.length > 0) {
    const hotelSheet = getSheet();
    hotelSheet.getRange(hotelSheet.getLastRow() + 1, 1, hotelRows.length, hotelRows[0].length).setValues(hotelRows);
  }

  return {
    success: true,
    imported: hotelRows.length,
    destinationsCreated: newDestinations.length,
    skipped: skipped
  };
}
