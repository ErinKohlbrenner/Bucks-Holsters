/**
 * Buck's Holsters Orders: Google Sheets connection.
 *
 * Paste this whole file into a Google Apps Script project (see SETUP-GOOGLE-SHEETS.md) and deploy it
 * as a web app. It keeps:
 *   - a Drive folder named "Buck's Holsters Show Orders"
 *   - one Google Sheet per show inside that folder (named "<Show name> (<dates>)")
 *   - a "Show Index" sheet in the same folder that lists every show and links to its sheet
 *
 * Set TEAM_CODE below to a code your employees will type into the app. Requests without it are refused.
 */
const TEAM_CODE = 'change-me';

const FOLDER_NAME = "Buck's Holsters Show Orders";
const INDEX_NAME = 'Show Index';
const KEEP_DAYS = 90;

// Show Index columns
const IX = { id: 0, name: 1, start: 2, end: 3, url: 4, sheetId: 5, created: 6, count: 7, removed: 8 };
const INDEX_HEADERS = ['Show ID', 'Show', 'First Day', 'Last Day', 'Google Sheet', 'Sheet ID', 'Created', 'Orders', 'Removed From App'];

// Orders sheet columns (one row per order)
const ORDER_HEADERS = ['Order #', 'Created', 'Last Updated', 'Customer', 'Phone', 'Email', 'Address', 'Ship To',
  'Holsters', 'Mag Carriers', 'Special Instructions', 'Status', 'Order ID', 'App Data'];
const OC = { seq: 1, id: 13, data: 14 }; // 1-based column numbers

function doGet() {
  return json({ ok: true, app: "Buck's Holsters Orders" });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(25000);
  try {
    const req = JSON.parse(e.postData.contents);
    if (req.key !== TEAM_CODE) return json({ ok: false, error: 'Wrong team code' });
    const actions = { ping, listShows, saveShow, deleteShow, getOrders, saveOrder, deleteOrder };
    const fn = actions[req.action];
    if (!fn) return json({ ok: false, error: 'Unknown action ' + req.action });
    return json(Object.assign({ ok: true }, fn(req)));
  } catch (err) {
    return json({ ok: false, error: String(err && err.message || err) });
  } finally {
    lock.releaseLock();
  }
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// ---------- Folder and index ----------

function folder() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('FOLDER_ID');
  if (id) { try { return DriveApp.getFolderById(id); } catch (e) {} }
  const f = DriveApp.createFolder(FOLDER_NAME);
  props.setProperty('FOLDER_ID', f.getId());
  return f;
}

function indexSheet() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('INDEX_ID');
  if (id) { try { return SpreadsheetApp.openById(id).getSheets()[0]; } catch (e) {} }
  const ss = SpreadsheetApp.create(INDEX_NAME);
  DriveApp.getFileById(ss.getId()).moveTo(folder());
  const sh = ss.getSheets()[0];
  sh.setName('Shows');
  sh.getRange('A:I').setNumberFormat('@');
  sh.getRange(1, 1, 1, INDEX_HEADERS.length).setValues([INDEX_HEADERS]).setFontWeight('bold');
  sh.setFrozenRows(1);
  sh.hideColumns(IX.id + 1);
  sh.hideColumns(IX.sheetId + 1);
  props.setProperty('INDEX_ID', ss.getId());
  return sh;
}

function indexRows() {
  const sh = indexSheet();
  const n = sh.getLastRow() - 1;
  return n > 0 ? sh.getRange(2, 1, n, INDEX_HEADERS.length).getValues() : [];
}

function findShow(showId) {
  const rows = indexRows();
  const i = rows.findIndex((r) => r[IX.id] === showId);
  return i < 0 ? null : { row: i + 2, values: rows[i] };
}

function setCount(showId, count) {
  const found = findShow(showId);
  if (found) indexSheet().getRange(found.row, IX.count + 1).setValue(String(count));
}

function cutoffDay() {
  const d = new Date();
  d.setDate(d.getDate() - KEEP_DAYS);
  return Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

// ---------- Actions ----------

function ping() {
  indexSheet();
  return {};
}

function listShows() {
  const cutoff = cutoffDay();
  const shows = indexRows()
    .filter((r) => r[IX.id] && !r[IX.removed] && String(r[IX.end]) >= cutoff)
    .map((r) => ({
      id: r[IX.id], name: r[IX.name], start: String(r[IX.start]), end: String(r[IX.end]),
      sheetUrl: r[IX.url], createdAt: Number(r[IX.created]) || 0, count: Number(r[IX.count]) || 0,
    }));
  return { shows };
}

function sheetTitle(show) {
  return show.name + ' (' + (show.start === show.end ? show.start : show.start + ' to ' + show.end) + ')';
}

function saveShow(req) {
  const show = req.show;
  const found = findShow(show.id);
  const ix = indexSheet();
  if (found) {
    const ss = SpreadsheetApp.openById(found.values[IX.sheetId]);
    ss.rename(sheetTitle(show));
    ix.getRange(found.row, IX.name + 1, 1, 3).setValues([[show.name, show.start, show.end]]);
    return { sheetUrl: ss.getUrl() };
  }
  const ss = SpreadsheetApp.create(sheetTitle(show));
  DriveApp.getFileById(ss.getId()).moveTo(folder());
  const sh = ss.getSheets()[0];
  sh.setName('Orders');
  sh.getRange('B:N').setNumberFormat('@');
  sh.getRange(1, 1, 1, ORDER_HEADERS.length).setValues([ORDER_HEADERS]).setFontWeight('bold').setBackground('#dde8dd');
  sh.setFrozenRows(1);
  sh.setColumnWidths(1, 1, 70);
  sh.setColumnWidths(2, 7, 150);
  sh.setColumnWidths(9, 2, 420);
  sh.setColumnWidths(11, 2, 260);
  sh.hideColumns(OC.id, 2);
  sh.getRange('A:L').setVerticalAlignment('top').setWrap(true);
  ix.appendRow([show.id, show.name, show.start, show.end, ss.getUrl(), ss.getId(), String(show.createdAt || Date.now()), '0', '']);
  return { sheetUrl: ss.getUrl() };
}

function deleteShow(req) {
  // The show's Google Sheet is kept in Drive; the show just stops appearing in the app.
  const found = findShow(req.id);
  if (found) indexSheet().getRange(found.row, IX.removed + 1).setValue(new Date().toISOString().slice(0, 10));
  return {};
}

function ordersSheet(showId) {
  const found = findShow(showId);
  if (!found) throw new Error('Show not found in Google Sheets');
  return SpreadsheetApp.openById(found.values[IX.sheetId]).getSheetByName('Orders');
}

function orderRows(sh) {
  const n = sh.getLastRow() - 1;
  return n > 0 ? sh.getRange(2, 1, n, ORDER_HEADERS.length).getValues() : [];
}

function getOrders(req) {
  const orders = orderRows(ordersSheet(req.showId))
    .filter((r) => r[OC.data - 1])
    .map((r) => JSON.parse(r[OC.data - 1]));
  return { orders };
}

function saveOrder(req) {
  const sh = ordersSheet(req.showId);
  const rows = orderRows(sh);
  const order = req.order;
  const at = rows.findIndex((r) => r[OC.id - 1] === order.id);

  // Keep order numbers unique within the show. If another phone already used this number,
  // this order gets the next free one and the app is told about it.
  let seq = Number(order.seq);
  const taken = rows.filter((r, i) => i !== at).map((r) => Number(r[OC.seq - 1]));
  if (taken.indexOf(seq) >= 0) seq = Math.max.apply(null, taken.concat([0])) + 1;
  order.seq = seq;

  const r = req.row;
  const values = [seq, r.created, r.updated, r.name, r.phone, r.email, r.address, r.shipTo,
    r.holsters, r.mags, r.notes, r.status, order.id, JSON.stringify(order)];
  if (at >= 0) sh.getRange(at + 2, 1, 1, values.length).setValues([values]);
  else sh.appendRow(values);

  const count = sh.getLastRow() - 1;
  if (count > 1) sh.getRange(2, 1, count, ORDER_HEADERS.length).sort(1);
  setCount(req.showId, count);
  return { seq };
}

function deleteOrder(req) {
  const sh = ordersSheet(req.showId);
  const rows = orderRows(sh);
  const at = rows.findIndex((r) => r[OC.id - 1] === req.id);
  if (at >= 0) sh.deleteRow(at + 2);
  setCount(req.showId, Math.max(0, sh.getLastRow() - 1));
  return {};
}
