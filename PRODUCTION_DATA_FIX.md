# 🔧 Production Data Loading Issues - Troubleshooting Guide

## 🚨 Masalah yang Teridentifikasi

Berdasarkan screenshot yang diberikan:

✅ **Data yang BERHASIL dimuat:**
- Performa Platform (kotak hijau) - Data kategori penjualan
- Data menampilkan: Lokalan Rp 4.950.000, itemku Rp 430.000

❌ **Data yang GAGAL dimuat:**
- Summary Cards (kotak merah) - Semua menampilkan Rp 0
- Trading Metrics (kotak merah) - Tidak ada data profit margin

## 🔍 Root Cause Analysis

### 1. Environment Variables Mismatch

**Masalah Utama:**
```typescript
// Di kode menggunakan:
const SPREADSHEET_ID = import.meta.env.VITE_GOOGLE_SHEETS_ID 

// Tapi di Vercel mungkin di-set sebagai:
VITE_GOOGLE_SHEET_ID (tanpa 'S')
```

### 2. Missing Environment Variables

**Variables yang HARUS ada di Vercel:**
```env
VITE_GOOGLE_CLIENT_ID=561808879266-[rest-of-client-id].apps.googleusercontent.com
VITE_GOOGLE_CLIENT_SECRET=GOCSPX-[rest-of-client-secret]
VITE_GOOGLE_SHEETS_ID=1aU9Z2ofa93NZcti57l403fFDxJAyDFwe4Ux1LbI28tk
VITE_USE_MOCK_DATA=false
```

## 🔧 SOLUSI LANGSUNG

### Step 1: Fix Environment Variables di Vercel

1. **Buka Vercel Dashboard**
   - Project: dashboard-ngs
   - Settings > Environment Variables

2. **Tambah/Update Variables:**
   ```
   Name: VITE_GOOGLE_SHEETS_ID
   Value: 1aU9Z2ofa93NZcti57l403fFDxJAyDFwe4Ux1LbI28tk
   
   Name: VITE_USE_MOCK_DATA  
   Value: false
   
   Name: VITE_GOOGLE_CLIENT_ID
   Value: [your-google-client-id]
   
   Name: VITE_GOOGLE_CLIENT_SECRET
   Value: [your-google-client-secret]
   ```

3. **Redeploy Project**
   - Deployments > kebab menu > Redeploy

### Step 2: Verify Google Sheets Access

1. **Test Manual Access:**
   ```
   https://docs.google.com/spreadsheets/d/1aU9Z2ofa93NZcti57l403fFDxJAyDFwe4Ux1LbI28tk/export?format=csv&gid=0
   ```

2. **Check Sheet Permissions:**
   - Pastikan Google Sheet public atau accessible
   - Test URL di browser

### Step 3: Debug Production

1. **Check Browser Console:**
   ```javascript
   // Di browser, cek console untuk error:
   console.log('Environment check:');
   console.log('SPREADSHEET_ID:', import.meta.env.VITE_GOOGLE_SHEETS_ID);
   console.log('USE_MOCK_DATA:', import.meta.env.VITE_USE_MOCK_DATA);
   ```

2. **Look for Network Errors:**
   - Developer Tools > Network tab
   - Cari failed requests ke Google Sheets

## 🔍 Debugging Commands

### Check Current Configuration:

1. **Browser Console (di production site):**
   ```javascript
   // Check environment variables
   console.log('VITE_GOOGLE_SHEETS_ID:', import.meta.env.VITE_GOOGLE_SHEETS_ID);
   console.log('VITE_USE_MOCK_DATA:', import.meta.env.VITE_USE_MOCK_DATA);
   
   // Check if data loading functions exist
   console.log('fetchDebtData exists:', typeof fetchDebtData !== 'undefined');
   console.log('fetchSalesData exists:', typeof fetchSalesData !== 'undefined');
   ```

2. **Network Tab Analysis:**
   - Look for failed CSV export requests
   - Check CORS errors
   - Verify sheet access permissions

## 📋 Expected Fix Timeline

1. **Update Environment Variables** (5 minutes)
2. **Redeploy Vercel** (2-5 minutes)
3. **Test Production** (immediate)

## 🎯 Success Indicators

After fix, you should see:
- ✅ Summary cards showing real debt data
- ✅ Sales data displaying actual values  
- ✅ Trading metrics showing profit calculations
- ✅ All data consistent between localhost and production

## 🚨 Emergency Fallback

If still not working:

1. **Force Environment Detection:**
   ```typescript
   // Temporary fix - hardcode values
   const SPREADSHEET_ID = '1aU9Z2ofa93NZcti57l403fFDxJAyDFwe4Ux1LbI28tk';
   const USE_MOCK_DATA = false;
   ```

2. **Check Alternative Sheet Access:**
   - Verify sheet is public
   - Test different GID values
   - Check sheet structure matches expected format

---

**Next Steps:** Update Vercel environment variables and redeploy! 🚀
