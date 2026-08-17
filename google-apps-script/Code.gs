const SPREADSHEET_ID = '1f9ucOd_RCf66ZXGe4r_psfGlcKBDtZw8aGBKVSqllqo';
const SHEET_NAME = 'Groceries';
const API_KEY = 'GANTI_DENGAN_KODE_RAHASIA_ANDA';
const HEADERS = ['id','name','category','qty','unit','price_before','price_after','purchase_date','stock','bought','updated_at'];

function output(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
function authorized(e) { return e && e.parameter && e.parameter.key === API_KEY; }
function doGet(e) {
  if (!authorized(e)) return output({error:'unauthorized'});
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
  const values = sheet.getDataRange().getValues();
  const items = values.slice(1).filter(row => row[0] !== '').map(row => ({
    id: row[0], name: row[1], category: row[2], qty: Number(row[3]), unit: row[4],
    before: Number(row[5]), after: Number(row[6]), date: String(row[7]),
    stock: Number(row[8]), bought: row[9] === true || row[9] === 'true'
  }));
  return output({items});
}
function doPost(e) {
  if (!authorized(e)) return output({error:'unauthorized'});
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const payload = JSON.parse(e.postData.contents || '{}');
    const items = Array.isArray(payload.items) ? payload.items : [];
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) sheet.getRange(2, 1, lastRow - 1, HEADERS.length).clearContent();
    if (items.length) {
      const rows = items.map(item => [item.id,item.name,item.category,item.qty,item.unit,item.before,item.after,item.date,item.stock,Boolean(item.bought),new Date()]);
      sheet.getRange(2, 1, rows.length, HEADERS.length).setValues(rows);
    }
    return output({ok:true,count:items.length});
  } finally { lock.releaseLock(); }
}
