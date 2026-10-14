/**
 * MYNJU Backend - Google Apps Script
 * 
 * Cara pakai:
 * 1. Buat project Apps Script baru di https://script.google.com
 * 2. Paste kode ini ke Code.gs
 * 3. Jalankan fungsi initialize() sekali (beri izin)
 * 4. Deploy sebagai Web App:
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy URL Web App, masukkan ke script.js di frontend (API_URL)
 * 
 * Semua password & config disimpan di Script Properties, TIDAK di GitHub.
 */

const PROP = PropertiesService.getScriptProperties();

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || '';
  try {
    if (action === 'getProducts') {
      return jsonResponse(getActiveProducts());
    }
    if (action === 'ping') {
      return jsonResponse({ ok: true, message: 'MYNJU Backend ready' });
    }
    return jsonResponse({ error: 'Unknown action. Use ?action=getProducts' });
  } catch (err) {
    return jsonResponse({ error: err.toString() });
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || '{}');
    const action = data.action;

    if (action === 'login') {
      return jsonResponse(handleLogin(data.password));
    }

    // logOrder bisa tanpa token (untuk recording dari cart)
    if (action === 'logOrder') {
      return jsonResponse(logOrder(data.order));
    }

    // Semua aksi admin lain butuh token
    if (!validateToken(data.token)) {
      return jsonResponse({ success: false, error: 'Unauthorized' });
    }

    switch (action) {
      case 'getAllProducts': return jsonResponse(getAllProducts());
      case 'addProduct': return jsonResponse(addProduct(data.product));
      case 'updateProduct': return jsonResponse(updateProduct(data.product));
      case 'deleteProduct': return jsonResponse(deleteProduct(data.id));
      case 'getOrders': return jsonResponse(getOrders());
      case 'deleteOrder': return jsonResponse(deleteOrder(data.id));
      default: return jsonResponse({ success: false, error: 'Unknown action' });
    }
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

// ========== AUTH ==========
function handleLogin(password) {
  const adminPass = PROP.getProperty('ADMIN_PASSWORD') || 'Bismillaah';
  if (password === adminPass) {
    const token = Utilities.getUuid();
    CacheService.getScriptCache().put('admin_' + token, 'valid', 7200); // 2 jam
    return { success: true, token: token };
  }
  return { success: false, error: 'Password salah' };
}

function validateToken(token) {
  if (!token) return false;
  return CacheService.getScriptCache().get('admin_' + token) === 'valid';
}

// ========== SHEET SETUP ==========
function getSpreadsheet() {
  let id = PROP.getProperty('SPREADSHEET_ID');
  if (!id) {
    // Auto create if not set
    const ss = SpreadsheetApp.create('MYNJU Database');
    id = ss.getId();
    PROP.setProperty('SPREADSHEET_ID', id);
    Logger.log('Spreadsheet baru dibuat: ' + ss.getUrl());
  }
  return SpreadsheetApp.openById(id);
}

function ensureSheets() {
  const ss = getSpreadsheet();

  // Products sheet
  let products = ss.getSheetByName('Products');
  if (!products) {
    products = ss.insertSheet('Products');
    products.appendRow([
      'id', 'name', 'category', 'price', 'displayPrice',
      'imageUrl', 'badge', 'collection', 'isNew', 'active',
      'description', 'createdAt'
    ]);
    products.setFrozenRows(1);
    seedInitialProducts(products);
  }

  // Orders sheet
  let orders = ss.getSheetByName('Orders');
  if (!orders) {
    orders = ss.insertSheet('Orders');
    orders.appendRow([
      'id', 'date', 'customerName', 'phone', 'items',
      'total', 'status', 'notes'
    ]);
    orders.setFrozenRows(1);
  }

  return { products: products, orders: orders };
}

function seedInitialProducts(sheet) {
  const now = new Date().toISOString();
  const data = [
    [Utilities.getUuid(), 'Rosé Midi Dress', 'dress', 189000, 'Rp 289K', 'rose-mini-dress.jpg', 'NEW', 'Soft Pink Collection', true, true, 'Cute midi dress untuk sehari-hari', now],
    [Utilities.getUuid(), 'Cherry Top', 'top', 129000, 'Rp 179K', 'cherry-top.jpg', 'BEST SELLER', 'Everyday Essentials', false, true, 'Soft cherry top yang nyaman', now],
    [Utilities.getUuid(), 'Creamy Skirt', 'skirt', 149000, 'Rp 219K', 'creamy-skirt.jpg', '', 'Soft Girl Collection', false, true, 'Creamy soft skirt yang manis', now]
  ];
  if (data.length) {
    sheet.getRange(2, 1, data.length, data[0].length).setValues(data);
  }
}

// Jalankan sekali dari editor Apps Script untuk setup awal
function initialize() {
  if (!PROP.getProperty('ADMIN_PASSWORD')) {
    PROP.setProperty('ADMIN_PASSWORD', 'Bismillaah');
  }
  ensureSheets();
  const id = PROP.getProperty('SPREADSHEET_ID');
  Logger.log('Setup selesai!');
  Logger.log('Spreadsheet ID: ' + id);
  Logger.log('Admin Password: ' + PROP.getProperty('ADMIN_PASSWORD'));
  Logger.log('Buka spreadsheet: https://docs.google.com/spreadsheets/d/' + id);
}

// ========== PRODUCTS ==========
function getActiveProducts() {
  const { products } = ensureSheets();
  const data = products.getDataRange().getValues();
  if (data.length <= 1) return [];
  const headers = data[0];
  const result = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const active = row[9]; // column active (0-based index 9)
    if (active === true || active === 'TRUE' || active === 'true') {
      result.push(rowToObject(headers, row));
    }
  }
  return result;
}

function getAllProducts() {
  const { products } = ensureSheets();
  const data = products.getDataRange().getValues();
  if (data.length <= 1) return [];
  const headers = data[0];
  return data.slice(1).map(row => rowToObject(headers, row));
}

function addProduct(product) {
  const { products } = ensureSheets();
  const id = Utilities.getUuid();
  const now = new Date().toISOString();
  products.appendRow([
    id,
    product.name || '',
    product.category || 'other',
    product.price || 0,
    product.displayPrice || '',
    product.imageUrl || '',
    product.badge || '',
    product.collection || '',
    product.isNew === true || product.isNew === 'true',
    product.active !== false,
    product.description || '',
    now
  ]);
  return { success: true, id: id };
}

function updateProduct(product) {
  if (!product.id) return { success: false, error: 'ID required' };
  const { products } = ensureSheets();
  const data = products.getDataRange().getValues();
  const headers = data[0];
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === product.id) {
      const row = i + 1;
      products.getRange(row, 2, 1, 10).setValues([[
        product.name || '',
        product.category || 'other',
        product.price || 0,
        product.displayPrice || '',
        product.imageUrl || '',
        product.badge || '',
        product.collection || '',
        product.isNew === true || product.isNew === 'true',
        product.active !== false,
        product.description || ''
      ]]);
      return { success: true };
    }
  }
  return { success: false, error: 'Produk tidak ditemukan' };
}

function deleteProduct(id) {
  const { products } = ensureSheets();
  const data = products.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      products.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { success: false, error: 'Produk tidak ditemukan' };
}

// ========== ORDERS ==========
function logOrder(order) {
  if (!order) return { success: false };
  const { orders } = ensureSheets();
  const id = Utilities.getUuid();
  orders.appendRow([
    id,
    order.date || new Date().toISOString(),
    order.customerName || '',
    order.phone || '',
    JSON.stringify(order.items || []),
    order.total || 0,
    'new',
    order.notes || ''
  ]);
  return { success: true, id: id };
}

function getOrders() {
  const { orders } = ensureSheets();
  const data = orders.getDataRange().getValues();
  if (data.length <= 1) return [];
  const headers = data[0];
  return data.slice(1).reverse().map(row => rowToObject(headers, row)); // terbaru di atas
}

function deleteOrder(id) {
  const { orders } = ensureSheets();
  const data = orders.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      orders.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { success: false, error: 'Order tidak ditemukan' };
}

// ========== HELPERS ==========
function rowToObject(headers, row) {
  const obj = {};
  headers.forEach((h, idx) => {
    obj[h] = row[idx];
  });
  return obj;
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
