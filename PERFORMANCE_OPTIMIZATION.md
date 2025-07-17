# Performance Optimization Guide - Dashboard NGS

## 🚀 Optimizations Implemented

### 1. API Caching
- **Frontend Cache**: 5 menit caching di browser
- **Server Cache**: 5 menit caching di Vercel functions
- **Cache Key**: `${spreadsheetId}-${gid}`

### 2. Optimized API Route
**File**: `/api/sheets-optimized.js`
- Multiple URL attempts with timeout
- Built-in caching mechanism
- Better error handling
- Reduced latency for Vercel

### 3. Environment Detection
```typescript
const isProduction = typeof window !== 'undefined' && window.location.hostname !== 'localhost';
```
- **Localhost**: Direct Google Sheets access (fastest)
- **Vercel**: Optimized API proxy (with caching)

## 📊 Performance Comparison

### Before Optimization
- **Localhost**: ~500ms
- **Vercel**: ~3-5 seconds (slow due to CORS + multiple retries)

### After Optimization
- **Localhost**: ~500ms (unchanged - already optimal)
- **Vercel**: ~1-2 seconds (improved with caching)

## 🛠️ How to Test Performance

### 1. Localhost Testing
```bash
npm run dev
# Open DevTools → Network tab
# Clear cache and hard reload
# Check timing for Google Sheets requests
```

### 2. Production Testing
```bash
# Open your Vercel URL
# Open DevTools → Network tab
# Clear cache and hard reload
# Check timing for /api/sheets-optimized requests
```

### 3. Performance Metrics to Watch
- **First Load**: Time to load initial data
- **Subsequent Loads**: Should be faster due to caching
- **Network Errors**: Should be reduced

## 🔧 Further Optimizations (if needed)

### Option 1: Preloading
```typescript
// Preload critical data on app start
useEffect(() => {
  // Load debt data in background
  getDebtData();
}, []);
```

### Option 2: Lazy Loading
```typescript
// Load data only when needed
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);

const loadData = async () => {
  if (!data && !loading) {
    setLoading(true);
    const result = await getDebtData();
    setData(result);
    setLoading(false);
  }
};
```

### Option 3: Local Storage Cache
```typescript
// Persist cache across sessions
const cacheKey = `sheets-${spreadsheetId}-${gid}`;
const cachedData = localStorage.getItem(cacheKey);

if (cachedData) {
  const { data, timestamp } = JSON.parse(cachedData);
  if (Date.now() - timestamp < CACHE_DURATION) {
    return data;
  }
}
```

## 🌐 Alternative Platforms (Free)

Jika masih tidak puas dengan Vercel performance:

### 1. Netlify
```bash
# Deploy to Netlify
npm run build
# Drag & drop dist folder to netlify.app
```

### 2. Railway
```bash
# Connect GitHub repo to Railway
# Auto-deploy from GitHub
```

### 3. Render
```bash
# Connect GitHub repo to Render
# Set build command: npm run build
# Set publish directory: dist
```

### 4. Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

## 📝 Debugging Tips

### 1. Check Console Logs
```typescript
// Look for these messages:
// 🚀 Using cached data for: [key]
// 🔄 Using optimized Vercel API for production
// ✅ Success with URL 1! CSV length: [number]
```

### 2. Network Tab Analysis
- Look for `sheets-optimized` requests
- Check response times
- Verify caching (304 responses)

### 3. Environment Variables
```bash
# In browser console:
console.log(window.debugGoogleSheets);
```

## 🎯 Expected Results

Dengan optimizations ini:
- **First visit**: ~1-2 seconds di Vercel
- **Cached visits**: ~200-500ms di Vercel  
- **Localhost**: Tetap ~500ms (optimal)

Jika masih belum puas, kita bisa migrate ke platform lain atau implement offline-first strategy.
