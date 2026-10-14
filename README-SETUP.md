# MYNJU — Versi dengan Google Sheets + Apps Script

Website boutique MYNJU yang sudah di-upgrade supaya produk & pesanan disimpan di Google Sheets, dikelola lewat Apps Script.

## Fitur yang sudah ada di website asli
- Hero, Collection, About
- Wishlist (tombol hati)
- Shopping bag / Cart + order via WhatsApp
- Contact float (WA + Instagram)
- Auto-scroll otomatis
- Filter kategori (All / New / Dress / Top / Skirt)

## Fitur baru
- Produk di-load dinamis dari Google Sheets
- Admin Panel (klik logo **MYNJU** 4x berturut-turut)
- Password admin: `Bismillaah` (disimpan di Script Properties, tidak ada di GitHub)
- CRUD Produk (Create, Read, Update, Delete)
- Lihat & hapus pesanan (otomatis tercatat saat klik Order via WhatsApp)
- Sheet + header otomatis dibuat oleh script (tidak perlu bikin manual)

---

## Cara Setup (Langkah demi Langkah)

### 1. Siapkan Google Spreadsheet + Apps Script

1. Buka [https://script.google.com](https://script.google.com) → New Project
2. Hapus kode default, lalu paste seluruh isi file `Code.gs`
3. Di menu atas, pilih fungsi `initialize` lalu klik **Run**
   - Beri izin saat diminta
   - Setelah selesai, cek Log (View → Logs) untuk melihat link Spreadsheet-nya
4. Buka spreadsheet yang baru dibuat, pastikan ada sheet **Products** dan **Orders** beserta headernya. Data awal 3 produk juga sudah masuk.

### 2. Deploy sebagai Web App

1. Klik **Deploy** → **New deployment**
2. Type: **Web app**
3. Description: MYNJU Backend
4. Execute as: **Me**
5. Who has access: **Anyone**
6. Klik **Deploy**
7. **Copy URL** Web App (yang berakhiran `/exec`)

### 3. Update Frontend

1. Buka file `script.js`
2. Cari baris:
   ```js
   const API_URL = 'YOUR_APPS_SCRIPT_WEB_APP_URL_HERE';
   ```
3. Ganti dengan URL Web App yang tadi dicopy.
4. Upload semua file ke GitHub Pages (ganti file lama).

### 4. Tes

- Buka website → produk harus muncul dari Sheet
- Klik logo **MYNJU** 4 kali → panel admin muncul
- Masukkan password `Bismillaah`
- Coba tambah / edit / hapus produk
- Tambah produk ke bag → Order via WhatsApp → cek di sheet Orders

---

## Catatan Keamanan

- Password admin **tidak** tersimpan di GitHub Pages.
- Semua config (password, Spreadsheet ID) ada di **Script Properties** Apps Script.
- Token admin hanya berlaku 2 jam (disimpan di Cache).

## Struktur Sheet (otomatis)

**Products**
id | name | category | price | displayPrice | imageUrl | badge | collection | isNew | active | description | createdAt

**Orders**
id | date | customerName | phone | items | total | status | notes

---

Kalau mau ganti password admin, jalankan di Apps Script:

```js
PropertiesService.getScriptProperties().setProperty('ADMIN_PASSWORD', 'PasswordBaruKamu');
```

Selamat mencoba! ♡
