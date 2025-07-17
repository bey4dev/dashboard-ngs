# 🔧 Google Sheets Permission Fix - URGENT

## 🚨 MASALAH TERIDENTIFIKASI

Dari console error terlihat:
- ✅ Environment variables sudah benar
- ✅ Sold items data berhasil dimuat
- ❌ **Error 400** saat akses debt sheet (GID: 0) dan sales sheet (GID: 1)

**Root Cause:** Google Sheets tidak public/accessible untuk export CSV.

## 🔧 SOLUSI LANGSUNG - Buat Google Sheets Public

### Step 1: Buka Google Sheets

1. **Buka Google Sheets Anda:**
   ```
   https://docs.google.com/spreadsheets/d/1aU9Z2ofa93NZcti57l403fFDxJAyDFwe4Ux1LbI28tk/edit
   ```

2. **Klik tombol "Share" (Bagikan)** di kanan atas

### Step 2: Set Permission Public

1. **Klik "Change to anyone with the link"**
2. **Pilih "Anyone on the internet with this link can view"**
3. **Pastikan role: "Viewer"**
4. **Klik "Done"**

### Step 3: Test Manual Access

Test URL berikut di browser untuk memastikan bisa diakses:

1. **Debt Sheet (GID 0):**
   ```
   https://docs.google.com/spreadsheets/d/1aU9Z2ofa93NZcti57l403fFDxJAyDFwe4Ux1LbI28tk/export?format=csv&gid=0
   ```

2. **Sales Sheet (GID 1):**
   ```
   https://docs.google.com/spreadsheets/d/1aU9Z2ofa93NZcti57l403fFDxJAyDFwe4Ux1LbI28tk/export?format=csv&gid=1
   ```

**Expected Result:** Harus mendownload file CSV, bukan error 400.

## 🔍 Identifikasi Sheet GID yang Benar

Jika masih error setelah public, mungkin GID tidak sesuai:

### Cara Cek GID:

1. **Buka Google Sheets**
2. **Klik tab sheet** yang ingin dicek
3. **Lihat URL bar:**
   ```
   https://docs.google.com/spreadsheets/d/[ID]/edit#gid=[NUMBER]
   ```
   
   GID adalah angka setelah `#gid=`

### Update GID di Kode (jika perlu):

Jika GID berbeda, update di `.env`:
```env
VITE_DEBT_SHEET_GID=0        # Ganti dengan GID yang benar
VITE_SALES_SHEET_GID=1       # Ganti dengan GID yang benar
```

## 🎯 Quick Test Commands

Setelah membuat sheet public, test di browser console production:

```javascript
// Test debt sheet access
fetch('https://docs.google.com/spreadsheets/d/1aU9Z2ofa93NZcti57l403fFDxJAyDFwe4Ux1LbI28tk/export?format=csv&gid=0')
  .then(r => console.log('Debt sheet status:', r.status))
  .catch(e => console.error('Debt sheet error:', e));

// Test sales sheet access  
fetch('https://docs.google.com/spreadsheets/d/1aU9Z2ofa93NZcti57l403fFDxJAyDFwe4Ux1LbI28tk/export?format=csv&gid=1')
  .then(r => console.log('Sales sheet status:', r.status))
  .catch(e => console.error('Sales sheet error:', e));
```

## 🔄 Alternative Solution - OAuth API

Jika tidak bisa membuat public, gunakan Google Sheets API dengan OAuth:

### Setup Google Sheets API:

1. **Enable Google Sheets API** di Google Cloud Console
2. **Update service** untuk menggunakan OAuth token
3. **Gunakan API endpoint** instead of CSV export

**API Endpoint:**
```
https://sheets.googleapis.com/v4/spreadsheets/{SHEET_ID}/values/{RANGE}
```

## ⏱️ Expected Fix Timeline

1. **Make sheet public** (2 menit)
2. **Test CSV access** (1 menit)
3. **Refresh production site** (immediate)
4. **Verify data loading** (immediate)

**Total: ~5 menit**

## 🎉 Success Indicators

After making sheet public:
- ✅ Console errors 400 hilang
- ✅ Summary cards menampilkan data real
- ✅ Trading metrics menampilkan profit calculations
- ✅ Semua data loading success

---

**URGENT ACTION:** Buat Google Sheets public terlebih dahulu! 🚀
