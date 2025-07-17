# 🚀 Panduan Deploy Dashboard NGS ke Vercel

## Prerequisites
- ✅ Code sudah terupload ke GitHub: https://github.com/bey4dev/dashboard-ngs.git
- ✅ Akun Vercel (daftar di [vercel.com](https://vercel.com))
- ✅ Google Cloud Project dengan Google Sheets API dan OAuth 2.0 enabled

## 📋 Langkah-langkah Deploy

### 1. Setup Vercel Project

1. **Login ke Vercel**
   - Buka [vercel.com](https://vercel.com)
   - Login dengan GitHub account Anda

2. **Import Project**
   - Klik tombol "New Project"
   - Pilih "Import Git Repository"
   - Cari dan pilih repository: `bey4dev/dashboard-ngs`
   - Klik "Import"

3. **Configure Project Settings**
   ```
   Project Name: dashboard-ngs
   Framework Preset: Vite
   Root Directory: ./
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

### 2. Environment Variables Setup

Di Vercel dashboard, tambahkan environment variables berikut:

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_GOOGLE_CLIENT_SECRET=your_google_client_secret_here
VITE_GOOGLE_SHEET_ID=your_google_sheet_id_here
```

**Cara menambahkan:**
1. Masuk ke Project Dashboard di Vercel
2. Klik tab "Settings"
3. Klik "Environment Variables"
4. Tambahkan satu per satu variable di atas

### 3. Update Google OAuth Settings

1. **Buka Google Cloud Console**
   - Masuk ke [console.cloud.google.com](https://console.cloud.google.com)
   - Pilih project Anda

2. **Update Authorized JavaScript Origins**
   - Masuk ke "APIs & Services" > "Credentials"
   - Klik OAuth 2.0 Client ID Anda
   - Tambahkan Vercel domain ke "Authorized JavaScript origins":
     ```
     https://dashboard-ngs.vercel.app
     ```
     atau sesuai dengan domain yang diberikan Vercel

3. **Update Authorized Redirect URIs**
   - Tambahkan ke "Authorized redirect URIs":
     ```
     https://dashboard-ngs.vercel.app/auth/callback
     ```

### 4. Deploy

1. **Automatic Deploy**
   - Setelah setup, Vercel akan otomatis deploy
   - Tunggu proses build selesai (biasanya 2-5 menit)

2. **Manual Deploy** (jika diperlukan)
   - Di Vercel dashboard, klik "Deploy"
   - Atau push ke branch `main` di GitHub untuk trigger auto-deploy

### 5. Verifikasi Deployment

1. **Check Build Logs**
   - Pastikan tidak ada error saat build
   - Check di tab "Functions" untuk serverless functions

2. **Test Application**
   - Buka URL yang diberikan Vercel
   - Test login dengan Google
   - Pastikan data dari Google Sheets dapat ditampilkan

## 🔧 Build Configuration

### Build Commands
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  }
}
```

### Vercel Configuration (Optional)
Buat file `vercel.json` di root project untuk konfigurasi advanced:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET, POST, PUT, DELETE, OPTIONS" },
        { "key": "Access-Control-Allow-Headers", "value": "Content-Type, Authorization" }
      ]
    }
  ]
}
```

## 🚨 Troubleshooting

### Common Issues

1. **Build Fails**
   ```bash
   # Check dependencies
   npm install
   npm run build
   ```

2. **Environment Variables Not Working**
   - Pastikan nama variable benar (case-sensitive)
   - Restart deployment setelah menambah env vars

3. **Google OAuth Error**
   - Pastikan domain Vercel sudah ditambahkan ke Google OAuth settings
   - Check redirect URI sesuai dengan domain Vercel

4. **Google Sheets API Error**
   - Pastikan Google Sheets API enabled
   - Check service account permissions
   - Verify sheet ID benar

### Monitoring & Logs

1. **Vercel Dashboard**
   - Monitor function invocations
   - Check error logs
   - View deployment history

2. **Real-time Logs**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login
   vercel login
   
   # View logs
   vercel logs
   ```

## 🔄 Continuous Deployment

### Auto Deploy Setup
- ✅ Sudah aktif: setiap push ke branch `main` akan trigger deploy
- Branch lain tidak akan auto-deploy
- Pull requests akan membuat preview deployment

### Custom Domains (Optional)
1. Beli domain di registrar
2. Di Vercel: Settings > Domains
3. Tambahkan custom domain
4. Update DNS records sesuai instruksi Vercel

## 📝 Post-Deployment Checklist

- [ ] Website dapat diakses
- [ ] Google OAuth berfungsi
- [ ] Data Google Sheets tampil dengan benar
- [ ] Semua fitur dashboard berfungsi
- [ ] Responsive design bekerja di mobile
- [ ] Performance check (Lighthouse score)

## 🔗 Useful Links

- **Vercel Docs**: https://vercel.com/docs
- **Vite Deployment**: https://vitejs.dev/guide/static-deploy.html#vercel
- **Google OAuth Setup**: https://developers.google.com/identity/oauth2/web/guides/overview

---

🎉 **Selamat! Dashboard NGS Anda sudah live di Vercel!**

Domain default: `https://dashboard-ngs.vercel.app` (atau sesuai nama project Anda)
