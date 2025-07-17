# Dashboard NogoGini Store

Dashboard untuk monitoring hutang piutang dan rekap penjualan dengan data dari Google Sheets.

## 🚀 Live Demo
- **Production**: [dashboard-ngs.vercel.app](https://dashboard-ngs.vercel.app)
- **GitHub**: [github.com/bey4dev/dashboard-ngs](https://github.com/bey4dev/dashboard-ngs)

## 🚀 Quick Start

### Metode Cepat (Recommended)
```bash
# Install dependencies
npm install

# Jalankan setup helper interaktif
npm run setup

# Jalankan aplikasi
npm run dev
```

### Metode Manual
Ikuti panduan di [GOOGLE_CLOUD_SETUP.md](./GOOGLE_CLOUD_SETUP.md)

## ✨ Fitur Utama

- 📊 **Monitoring Hutang Piutang**: Data hutang dengan status (Lunas, Pending, Terlambat)
- 📈 **Rekap Penjualan**: Data transaksi penjualan dengan detail lengkap
- 📋 **Summary Cards**: Ringkasan total penjualan, transaksi, dan status hutang
- 🔄 **Real-time Refresh**: Data terbaru dari Google Sheets
- 📱 **Responsive Design**: Optimal di desktop dan mobile
- 🧪 **Connection Test**: Tool untuk test koneksi Google Sheets
- ⚡ **Performance Optimized**: Caching dan optimasi untuk production

## 📊 Performance

### Localhost vs Production
- **Localhost**: ~500ms (direct Google Sheets access)
- **Production**: ~1-2s first load, ~200-500ms cached (optimized API)

### Testing Performance
```javascript
// Paste in browser console
fetch('/performance-test.js').then(r => r.text()).then(eval);
performanceTest.runAllTests();
```

📖 **Guides**: [PERFORMANCE_OPTIMIZATION.md](./PERFORMANCE_OPTIMIZATION.md)

## 🛠 Teknologi

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Data Source**: Google Sheets API
- **Build Tool**: Vite 7.0.4

## 📋 Setup Google Sheets Integration

### Opsi 1: Interactive Setup (Mudah)
```bash
npm run setup
```

Setup helper akan memandu Anda:
1. ✅ Konfigurasi otomatis
2. 🌐 Buka Google Cloud Console
3. 📖 Tampilkan instruksi
4. 🧪 Test koneksi

### Opsi 2: Manual Setup

1. **Buat Google Cloud Project**
   - Pergi ke [Google Cloud Console](https://console.cloud.google.com/)
   - Buat project baru atau pilih yang ada
   - Enable Google Sheets API

2. **Buat API Key**
   - Credentials → Create Credentials → API Key
   - (Opsional) Restrict API Key

3. **Setup Google Sheets**
   - Share spreadsheet: "Anyone with the link can view"
   - Copy Spreadsheet ID dari URL
   - Catat GID untuk setiap sheet

4. **Konfigurasi Environment**
   ```env
   VITE_GOOGLE_SHEETS_ID=your_spreadsheet_id
   VITE_GOOGLE_API_KEY=your_api_key
   VITE_DEBT_SHEET_GID=123456
   VITE_SALES_SHEET_GID=789012
   VITE_USE_MOCK_DATA=false
   ```

## 🗂 Struktur Project

```
src/
├── components/
│   ├── Header.tsx           # Header dengan refresh & update info
│   ├── SummaryCards.tsx     # Cards ringkasan data
│   ├── DebtTable.tsx        # Tabel hutang piutang
│   ├── SalesTable.tsx       # Tabel penjualan
│   └── GoogleSheetsTest.tsx # Tool test koneksi
├── services/
│   └── googleSheets.ts      # Service Google Sheets API
├── App.tsx                  # Main app component
└── main.tsx                 # Entry point
```

## 🎯 Scripts Available

```bash
npm run dev        # Development server
npm run build      # Production build
npm run preview    # Preview production build
npm run lint       # ESLint
npm run setup      # Interactive Google Cloud setup
```

## 🧪 Testing Koneksi

1. Jalankan aplikasi: `npm run dev`
2. Scroll ke bawah ke section "Google Sheets Connection Test"
3. Klik "Test All Connections"
4. Periksa hasil koneksi dan data

## 📚 Dokumentasi Lengkap

- [🔧 Google Cloud Setup](./GOOGLE_CLOUD_SETUP.md) - Setup Google Cloud Console
- [📖 Cara Penggunaan](./CARA_PENGGUNAAN.md) - Panduan penggunaan aplikasi

## 🔧 Troubleshooting

### CSS Tidak Muncul
```bash
# Pastikan Tailwind CSS v4 ter-install dengan benar
npm install @tailwindcss/vite tailwindcss
```

### Data Tidak Muncul
1. Periksa `.env.local` sudah benar
2. Pastikan Google Sheets sudah public
3. Test koneksi dengan tool bawaan
4. Periksa console browser untuk error

### API Key Error
- Pastikan API Key sudah dibuat di Google Cloud Console
- Enable Google Sheets API
- Periksa restrictions jika ada

## 📞 Support

Jika mengalami kendala:
1. Periksa dokumentasi [GOOGLE_CLOUD_SETUP.md](./GOOGLE_CLOUD_SETUP.md)
2. Gunakan tool test koneksi di aplikasi
3. Jalankan `npm run setup` untuk konfigurasi ulang

## Google Sheets Integration

Saat ini menggunakan mock data untuk development. Untuk production:

1. Setup Google Sheets API key
2. Update service functions di `src/services/googleSheets.ts`
3. Implementasikan parsing data sesuai format spreadsheet

Referensi: [Google Sheets API Quickstart](https://developers.google.com/workspace/sheets/api/quickstart/nodejs)

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
