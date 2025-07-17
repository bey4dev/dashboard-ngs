# 🔧 Google Cloud Console Configuration Fix

## 🚨 Masalah Redirect Mismatch - Solusi

### 📋 Yang Perlu Dikonfigurasi di Google Cloud Console:

1. **Buka Google Cloud Console**
   - Masuk ke [console.cloud.google.com](https://console.cloud.google.com)
   - Pilih project Anda

2. **Masuk ke APIs & Services > Credentials**
   - Klik OAuth 2.0 Client ID Anda: `561808879266-eohb1fn3bv4j1tk2ecqiomeld1g72pq4.apps.googleusercontent.com`

### 🔗 Authorized JavaScript Origins

Tambahkan semua domain berikut:

```
http://localhost:5173
http://localhost:3000
http://localhost:4173
https://your-vercel-domain.vercel.app
```

**Contoh untuk Vercel:**
```
https://dashboard-ngs.vercel.app
https://dashboard-ngs-git-main.vercel.app
https://dashboard-ngs-bey4dev.vercel.app
```

### 🔄 Authorized Redirect URIs

Tambahkan semua redirect URI berikut:

```
http://localhost:5173/auth/callback
http://localhost:3000/auth/callback
http://localhost:4173/auth/callback
https://your-vercel-domain.vercel.app/auth/callback
```

**Contoh untuk Vercel:**
```
https://dashboard-ngs.vercel.app/auth/callback
https://dashboard-ngs-git-main.vercel.app/auth/callback
https://dashboard-ngs-bey4dev.vercel.app/auth/callback
```

## 🔧 Perbaikan Yang Sudah Dilakukan

1. **Auto-detect Redirect URI**
   - Kode sekarang otomatis mendeteksi domain saat ini
   - Tidak perlu set manual untuk setiap environment

2. **Environment Variable Fix**
   - Simplified configuration
   - Auto-fallback untuk development

## 📋 Langkah-langkah Fix:

### 1. Update Google Cloud Console Settings

1. **Login ke Google Cloud Console**
   ```
   https://console.cloud.google.com
   ```

2. **Navigate ke Credentials**
   ```
   APIs & Services > Credentials > OAuth 2.0 Client IDs
   ```

3. **Edit OAuth 2.0 Client ID**
   - Klik Client ID: `561808879266-eohb1fn3bv4j1tk2ecqiomeld1g72pq4`

4. **Update Authorized JavaScript origins**
   ```
   http://localhost:5173
   https://dashboard-ngs.vercel.app
   https://dashboard-ngs-git-main.vercel.app
   ```

5. **Update Authorized redirect URIs**
   ```
   http://localhost:5173/auth/callback
   https://dashboard-ngs.vercel.app/auth/callback
   https://dashboard-ngs-git-main.vercel.app/auth/callback
   ```

### 2. Test Locally

```bash
npm run dev
# Buka http://localhost:5173
# Test login Google
```

### 3. Deploy ke Vercel

1. **Commit changes**
2. **Push to GitHub**
3. **Vercel auto-deploy**
4. **Test production login**

## 🔍 Debugging Redirect Mismatch

### Check Current Settings:

1. **Lihat Console Browser**
   - Buka Developer Tools
   - Check error message lengkap

2. **Verifikasi Redirect URI**
   ```javascript
   console.log('Current redirect URI:', window.location.origin + '/auth/callback');
   ```

3. **Check Google Auth URL**
   - Lihat URL yang di-generate saat login
   - Pastikan redirect_uri parameter sesuai

### Common Errors:

1. **Error 400: redirect_uri_mismatch**
   ```
   The redirect URI in the request, http://localhost:5173/auth/callback, 
   does not match the ones authorized for the OAuth client.
   ```
   **Solution**: Add exact URL to Google Cloud Console

2. **Error 400: invalid_request**
   ```
   Invalid parameter value for redirect_uri
   ```
   **Solution**: Check URL format dan encoding

## 🎯 Quick Fix Checklist

- [ ] Google Cloud Console credentials updated
- [ ] Authorized JavaScript origins added
- [ ] Authorized redirect URIs added
- [ ] Local development tested
- [ ] Production deployment tested
- [ ] All domains working

## 📞 Support

Jika masih ada error:
1. Screenshot error message lengkap
2. Check Google Cloud Console audit logs
3. Verify semua URLs exact match (case-sensitive)

---

**Note**: Perubahan di Google Cloud Console bisa memerlukan beberapa menit untuk aktif.
