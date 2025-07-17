# Panduan Menggunakan Dashboard NogoGini Store

## Cara Menghubungkan Dashboard ke Google Sheets Anda

### Langkah 1: Persiapkan Google Sheets
1. Buka Google Sheets yang sudah berisi data hutang dan penjualan Anda
2. Pastikan setiap sheet memiliki header di baris pertama
3. Data bisa dalam format apapun, dashboard akan otomatis menyesuaikan

### Langkah 2: Set Google Sheets ke Public
1. Di Google Sheets, klik tombol **"Share"** (Bagikan) di pojok kanan atas
2. Pilih **"Anyone with the link can view"** (Siapa saja yang memiliki link dapat melihat)
3. Klik **"Copy link"**

### Langkah 3: Dapatkan Spreadsheet ID
Dari URL Google Sheets yang Anda copy, ambil bagian ID:
```
https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit#gid=0
```
Contoh: Jika URL Anda adalah:
```
https://docs.google.com/spreadsheets/d/1aU9Z2ofa93NZcti57l403fFDxJAyDFwe4Ux1LbI28tk/edit#gid=0
```
Maka SPREADSHEET_ID adalah: `1aU9Z2ofa93NZcti57l403fFDxJAyDFwe4Ux1LbI28tk`

### Langkah 4: Dapatkan Sheet GID
1. Buka tab sheet untuk **data hutang**, perhatikan URL berubah menjadi: `#gid=1234567`
2. Buka tab sheet untuk **data penjualan**, perhatikan URL berubah menjadi: `#gid=7654321`
3. Catat kedua nomor GID tersebut

### Langkah 5: Konfigurasi Dashboard
1. Buka file `.env.local` di root project (jika belum ada, buat file baru)
2. Isi dengan konfigurasi berikut:

```env
# Google Sheets Configuration
VITE_GOOGLE_SHEETS_ID=1aU9Z2ofa93NZcti57l403fFDxJAyDFwe4Ux1LbI28tk
VITE_DEBT_SHEET_GID=0
VITE_SALES_SHEET_GID=1234567

# Set ke false untuk membaca dari Google Sheets
VITE_USE_MOCK_DATA=false
```

### Langkah 6: Test Koneksi
1. Restart development server:
   ```bash
   npm run dev
   ```
2. Buka dashboard di browser: `http://localhost:5174/`
3. Scroll ke bawah, Anda akan melihat **"Google Sheets Connection Test"**
4. Klik **"Test All Connections"** untuk mengetes koneksi

### Langkah 7: Verifikasi Data
Jika koneksi berhasil:
- ✅ Dashboard akan menampilkan data dari Google Sheets Anda
- ✅ Data akan ter-update otomatis sesuai dengan perubahan di Google Sheets
- ✅ Klik tombol "Refresh Data" untuk memuat data terbaru

## Format Data yang Fleksibel

Dashboard ini dirancang untuk membaca berbagai format data:

### Data Hutang (bisa berupa kolom apapun):
- **Nama Customer/Pelanggan**: Teks bebas
- **Jumlah Hutang**: Angka (bisa dengan atau tanpa format Rp, titik, koma)
- **Tanggal Jatuh Tempo**: Format tanggal apapun (DD/MM/YYYY, YYYY-MM-DD, dll)
- **Status**: Teks bebas (lunas, belum bayar, terlambat, pending, paid, overdue, dll)
- **Keterangan**: Teks bebas

### Data Penjualan (bisa berupa kolom apapun):
- **Tanggal**: Format tanggal apapun
- **Produk**: Nama produk
- **Quantity**: Jumlah barang
- **Harga Satuan**: Angka (dengan atau tanpa format)
- **Total Harga**: Angka total (atau akan dihitung otomatis)
- **Customer**: Nama pelanggan

## Troubleshooting

### Jika Data Tidak Muncul:
1. **Periksa Console Browser** (F12 → Console) untuk melihat error
2. **Test URL Manual**: Coba buka di browser:
   ```
   https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/export?format=csv&gid=[GID]
   ```
3. **Periksa Permissions**: Pastikan Google Sheets bisa diakses publik
4. **Periksa GID**: Pastikan nomor GID benar untuk setiap sheet

### Error "Failed to fetch":
- Pastikan Google Sheets di-set ke public
- Coba refresh browser (Ctrl+F5)
- Periksa koneksi internet

### Data Tidak Sesuai Format:
- Dashboard akan otomatis menyesuaikan berbagai format
- Pastikan ada header di baris pertama
- Data kosong akan diisi dengan nilai default

## Tips Penggunaan

✅ **Auto-refresh**: Dashboard otomatis memuat ulang data setiap ada perubahan di Google Sheets  
✅ **Backup Data**: Data mock tetap tersedia jika koneksi Google Sheets bermasalah  
✅ **Real-time**: Perubahan di Google Sheets akan langsung terlihat setelah refresh  
✅ **Fleksible Format**: Tidak perlu mengubah format data yang sudah ada  

Selamat menggunakan Dashboard NogoGini Store! 🎉
