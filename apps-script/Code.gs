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
const SECRET_KEY = 'CHANGE_ME_TO_A_SECRET';

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
  return respond({ error: 'unknown action' });
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      'id', 'timestamp', 'destinationId', 'destinationName', 'hotelName',
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
  return 'https://drive.google.com/uc?export=view&id=' + file.getId();
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
    id, timestamp, body.destinationId, body.destinationName, body.hotelName,
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
      sheet.getRange(i + 1, 12).setValue(status); // column 12 = status
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
    if (row[11] === status) {
      rows.push({
        id: row[0], timestamp: row[1], destinationId: row[2], destinationName: row[3],
        hotelName: row[4], mapsLink: row[5], category: row[6], price: row[7], rating: row[8],
        amenities: JSON.parse(row[9] || '[]'), photos: JSON.parse(row[10] || '{}'),
        status: row[11], submittedByName: row[12], submittedByPhone: row[13]
      });
    }
  }
  return rows;
}

function respond(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
