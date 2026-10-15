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
- Admin Panel (tombol **Admin ♡** di header; shortcut logo 4x tetap tersedia)
- Password admin: `Bismillaah` (disimpan di Script Properties, tidak ada di GitHub)
- CRUD Produk (Create, Read, Update, Delete)
- Lihat, edit, ubah status, dan hapus pesanan; nama dan nomor WhatsApp wajib diminta saat checkout
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


## Upgrade Checkout & Pembayaran (versi revisi)

Website kini menyediakan checkout dengan pilihan pembayaran manual dan pembayaran online Midtrans. Katalog baru (Tunik, Abaya, Dress, Rok, Blouse, Kemeja, Outer/Cardigan, Setelan Matching) ditambahkan otomatis ke Sheet `Products` berdasarkan nama produk ketika backend menerima permintaan produk. Harga, nama, kategori, dan foto bisa diedit dari Admin Panel.

### Pembayaran manual
- Pembeli mengisi nama, nomor WhatsApp, dan alamat, lalu memilih QRIS manual atau transfer bank/e-wallet.
- Website membuka chat WhatsApp MYNJU dengan ringkasan pesanan dan meminta instruksi pembayaran resmi.
- **Belum ada QRIS/rekening yang ditanam di website**, supaya tidak menggunakan detail pembayaran yang keliru. Kirimkan QRIS/rekening resmi ke pelanggan melalui WhatsApp, atau tambahkan detail resmi milik toko sebelum mengubah alur ini.

### Midtrans (uji Sandbox)
1. Buat/masuk akun Midtrans dan buka bagian **Sandbox** untuk mengambil **Server Key Sandbox**. Jangan pernah memasukkan Server Key ke `script.js` atau file publik.
2. Buka project Google Apps Script yang menjadi backend MYNJU.
3. Di **Project Settings → Script Properties**, tambahkan:
   - `MIDTRANS_SERVER_KEY` = Server Key Sandbox milik toko.
   - `MIDTRANS_IS_PRODUCTION` = `false` untuk pengujian Sandbox.
4. Pastikan Apps Script mengizinkan akses eksternal (`UrlFetchApp`) saat diminta, lalu **Deploy → Manage deployments → Edit** dan terbitkan versi baru Web App. URL `/exec` harus tetap sesuai dengan `API_URL` di `script.js`.
5. Tes dari website menggunakan produk yang ada di Sheet. Pilih **Pembayaran online otomatis**. Browser akan diarahkan ke halaman pembayaran Midtrans Sandbox. Gunakan data/metode uji dari dokumentasi resmi Midtrans Sandbox, bukan uang sungguhan.
6. Untuk transaksi nyata, akun Midtrans harus aktif/terverifikasi, ganti `MIDTRANS_SERVER_KEY` dengan Server Key Production dan set `MIDTRANS_IS_PRODUCTION` menjadi `true`. Deploy ulang. Jangan aktifkan production sebelum pengujian berhasil.

**Penting:** GitHub Pages hanya meng-host frontend. Pembuatan transaksi Midtrans dilakukan di Apps Script agar Server Key tidak terbuka. Status pembayaran otomatis belum disinkronkan kembali ke status order di panel admin/webhook; cek status transaksi melalui dashboard Midtrans sebelum menandai pesanan lunas atau mengirim barang. Jangan menganggap pelanggan sudah membayar hanya karena halaman pembayaran terbuka.

### Produk dan foto
- Produk koleksi tambahan dibuat otomatis saat endpoint `getProducts` dipanggil; tunggu sebentar lalu refresh halaman.
- Gambar contoh memakai foto produk dari Unsplash atau gambar lama dalam ZIP. Ganti dengan foto produk milik MYNJU dari Admin Panel untuk hasil yang akurat.
- Nama kategori yang tampil di filter berasal dari produk aktif di database.


## Upgrade Admin & Pesanan
- Tombol Admin tampil di header desktop maupun ponsel. Password default `Bismillaah` disimpan di Script Properties setelah fungsi `initialize()` dijalankan.
- Admin dapat melihat pesanan, mengubah nama/nomor WhatsApp/catatan, mengubah status menjadi **Baru masuk**, **Sudah dijawab**, **Sedang dilayani**, atau **Selesai dilayani**, dan menghapus pesanan.
- CRUD produk (tambah, lihat, edit, hapus) tetap tersedia. Perubahan backend `Code.gs` wajib ditempel ke project Apps Script dan deployment Web App diperbarui ke versi terbaru. URL `/exec` tetap sama jika deployment yang sama diedit.
- Tombol “Pesan langsung via WhatsApp” kini membuka checkout terlebih dahulu agar nama dan nomor WhatsApp dikumpulkan dan pesanan tercatat sebelum chat WhatsApp dibuka.
