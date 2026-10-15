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
    if (action === 'createPayment') {
      return jsonResponse(createMidtransPayment(data.order));
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
      case 'updateOrder': return jsonResponse(updateOrder(data.id, data.order));
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

  seedAdditionalCatalog(products);
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

// Menambahkan koleksi baru satu kali per nama produk, termasuk untuk database lama.
function seedAdditionalCatalog(sheet) {
  const data = sheet.getDataRange().getValues();
  const existing = new Set(data.slice(1).map(row => String(row[1] || '').toLowerCase().trim()));
  const now = new Date().toISOString();
  const catalog = [
    ['Everyday Linen Tunic', 'tunik', 159000, 'Rp159.000', 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=900&q=85', 'NEW', 'Everyday Essentials', true, 'Tunik ringan untuk tampilan modest sehari-hari.'],
    ['Safa Flow Abaya', 'abaya', 249000, 'Rp249.000', 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=900&q=85', 'NEW', 'Soft Modest Collection', true, 'Abaya flowy dengan siluet anggun dan nyaman.'],
    ['Rosé Midi Dress', 'dress', 189000, 'Rp189.000', 'rose-mini-dress.jpg', 'BEST SELLER', 'Soft Pink Collection', true, 'Midi dress manis untuk acara santai maupun spesial.'],
    ['Lulu A-Line Skirt', 'rok', 139000, 'Rp139.000', 'creamy-skirt.jpg', 'NEW', 'Soft Girl Collection', true, 'Rok A-line yang mudah dipadukan dengan berbagai atasan.'],
    ['Mira Soft Blouse', 'blouse', 119000, 'Rp119.000', 'cherry-top.jpg', '', 'Everyday Essentials', false, 'Blouse simpel untuk mix and match sehari-hari.'],
    ['Nara Classic Shirt', 'kemeja', 129000, 'Rp129.000', 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=900&q=85', 'NEW', 'Daily Classic', true, 'Kemeja klasik dengan gaya clean dan versatile.'],
    ['Cloud Knit Outer', 'outer', 179000, 'Rp179.000', 'https://images.unsplash.com/photo-1551232864-3f0890e580d9?auto=format&fit=crop&w=900&q=85', '', 'Layering Edit', false, 'Outer ringan untuk layering yang effortless.'],
    ['Sunday Matching Set', 'setelan', 219000, 'Rp219.000', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=85', 'NEW', 'Easy Matching', true, 'Setelan matching praktis untuk tampilan serasi.']
  ];
  catalog.forEach(item => {
    const name = item[0].toLowerCase().trim();
    if (!existing.has(name)) {
      sheet.appendRow([Utilities.getUuid(), item[0], item[1], item[2], item[3], item[4], item[5], item[6], item[7], true, item[8], now]);
      existing.add(name);
    }
  });
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
  if (!order) return { success: false, error: 'Data pesanan tidak ditemukan.' };
  if (!String(order.customerName || '').trim() || !String(order.phone || '').trim()) {
    return { success: false, error: 'Nama dan nomor WhatsApp wajib diisi.' };
  }
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
    [order.paymentMethod ? 'Metode: ' + order.paymentMethod : '', order.address ? 'Alamat: ' + order.address : '', order.notes || ''].filter(Boolean).join(' | ')
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

function updateOrder(id, updates) {
  if (!id || !updates) return { success: false, error: 'Data pesanan tidak lengkap.' };
  const { orders } = ensureSheets();
  const data = orders.getDataRange().getValues();
  const allowedStatuses = ['new', 'answered', 'processing', 'serviced'];
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      const row = i + 1;
      const currentName = String(data[i][2] || '');
      const currentPhone = String(data[i][3] || '');
      const currentNotes = String(data[i][7] || '');
      const name = updates.customerName !== undefined ? String(updates.customerName).trim() : currentName;
      const phone = updates.phone !== undefined ? String(updates.phone).trim() : currentPhone;
      const notes = updates.notes !== undefined ? String(updates.notes).trim() : currentNotes;
      const status = allowedStatuses.indexOf(String(updates.status)) >= 0 ? String(updates.status) : String(data[i][6] || 'new');
      if (!name || !phone) return { success: false, error: 'Nama dan nomor WhatsApp tidak boleh kosong.' };
      orders.getRange(row, 3, 1, 2).setValues([[name, phone]]);
      orders.getRange(row, 7, 1, 2).setValues([[status, notes]]);
      return { success: true };
    }
  }
  return { success: false, error: 'Pesanan tidak ditemukan.' };
}

function deleteOrder(id) {
  const { orders } = ensureSheets();
  const data = orders.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      orders.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { success: false, error: 'Order tidak ditemukan' };
}

// ========== MIDTRANS CHECKOUT ==========
// Set MIDTRANS_SERVER_KEY dan MIDTRANS_IS_PRODUCTION di Apps Script > Project Settings > Script Properties.
// Gunakan Server Key Sandbox untuk pengujian; jangan pernah menaruh Server Key di script.js.
function createMidtransPayment(order) {
  if (!order || !order.items || !order.items.length) return { success: false, error: 'Keranjang kosong.' };
  if (!String(order.customerName || '').trim() || !String(order.phone || '').trim()) return { success: false, error: 'Nama dan nomor WhatsApp wajib diisi.' };
  const serverKey = PROP.getProperty('MIDTRANS_SERVER_KEY');
  if (!serverKey) return { success: false, error: 'Midtrans belum dikonfigurasi. Atur MIDTRANS_SERVER_KEY di Apps Script atau pilih pembayaran manual.' };

  const activeProducts = getActiveProducts();
  const itemDetails = [];
  let grossAmount = 0;
  for (const requested of order.items) {
    const product = activeProducts.find(p => String(p.name).trim() === String(requested.name).trim());
    const qty = Math.max(1, Math.min(99, parseInt(requested.qty, 10) || 1));
    if (!product) return { success: false, error: 'Produk tidak ditemukan atau sudah tidak aktif: ' + requested.name };
    const price = Math.round(Number(product.price) || 0);
    if (price <= 0) return { success: false, error: 'Harga produk tidak valid.' };
    itemDetails.push({ id: String(product.id).slice(0, 50), price: price, quantity: qty, name: String(product.name).slice(0, 50) });
    grossAmount += price * qty;
  }
  if (!grossAmount) return { success: false, error: 'Total pembayaran tidak valid.' };

  const isProduction = String(PROP.getProperty('MIDTRANS_IS_PRODUCTION') || 'false').toLowerCase() === 'true';
  // Midtrans Snap transaction API endpoint (redirect_url returned from /snap/v1/transactions).
  const snapEndpoint = isProduction ? 'https://app.midtrans.com/snap/v1/transactions' : 'https://app.sandbox.midtrans.com/snap/v1/transactions';
  const payload = {
    transaction_details: { order_id: 'MYNJU-' + Utilities.getUuid().slice(0, 12).toUpperCase(), gross_amount: grossAmount },
    item_details: itemDetails,
    customer_details: {
      first_name: String(order.customerName || 'Pelanggan MYNJU').slice(0, 50),
      phone: String(order.phone || '').slice(0, 20),
      shipping_address: { first_name: String(order.customerName || 'Pelanggan MYNJU').slice(0, 50), phone: String(order.phone || '').slice(0, 20), address: String(order.address || '').slice(0, 200) }
    },
    callbacks: { finish: 'https://yasminindira.github.io/mynju/' }
  };
  try {
    const response = UrlFetchApp.fetch(snapEndpoint, {
      method: 'post', contentType: 'application/json', payload: JSON.stringify(payload),
      headers: { Authorization: 'Basic ' + Utilities.base64Encode(serverKey + ':') }, muteHttpExceptions: true
    });
    const status = response.getResponseCode();
    const result = JSON.parse(response.getContentText() || '{}');
    if (status >= 200 && status < 300 && result.redirect_url) {
      logOrder({ customerName: order.customerName, phone: order.phone, address: order.address, items: itemDetails, total: grossAmount, notes: 'Midtrans ' + (isProduction ? 'Production' : 'Sandbox') + '; order_id=' + payload.transaction_details.order_id });
      return { success: true, redirect_url: result.redirect_url, order_id: payload.transaction_details.order_id };
    }
    return { success: false, error: result.error_messages ? result.error_messages.join(' ') : 'Midtrans menolak transaksi (HTTP ' + status + '). Periksa konfigurasi Sandbox/Production.' };
  } catch (err) {
    return { success: false, error: 'Tidak dapat menghubungi Midtrans: ' + err.toString() };
  }
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
