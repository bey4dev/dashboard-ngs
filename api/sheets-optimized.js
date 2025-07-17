// Optimized API Route - Faster Google Sheets access
// File: /api/sheets-optimized.js

// Cache untuk mengurangi requests ke Google Sheets
let dataCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 menit cache

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'public, max-age=300'); // 5 menit browser cache

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { sheetId, gid } = req.query;

    if (!sheetId || !gid) {
      res.status(400).json({ error: 'Missing sheetId or gid parameter' });
      return;
    }

    const cacheKey = `${sheetId}-${gid}`;
    const cachedData = dataCache.get(cacheKey);
    
    // Return cached data if available and not expired
    if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_DURATION) {
      console.log('🚀 Returning cached data for:', cacheKey);
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('Content-Type', 'text/csv');
      res.status(200).send(cachedData.data);
      return;
    }

    console.log('📡 Fetching fresh data for:', cacheKey);

    // Try multiple URLs for better success rate
    const urls = [
      `https://docs.google.com/spreadsheets/u/0/d/${sheetId}/export?format=csv&gid=${gid}`,
      `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`,
      `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=${gid}`,
    ];

    let csvData = null;
    let lastError = null;

    for (const url of urls) {
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/csv,text/plain,*/*',
            'Accept-Language': 'en-US,en;q=0.9',
          },
          timeout: 10000, // 10 second timeout
        });

        if (response.ok) {
          csvData = await response.text();
          if (csvData && csvData.length > 0) {
            break; // Success, exit loop
          }
        }
      } catch (error) {
        lastError = error;
        continue; // Try next URL
      }
    }

    if (!csvData) {
      throw lastError || new Error('All fetch attempts failed');
    }

    // Cache the successful result
    dataCache.set(cacheKey, {
      data: csvData,
      timestamp: Date.now(),
    });

    // Clean old cache entries (basic cleanup)
    if (dataCache.size > 20) {
      const oldestKey = dataCache.keys().next().value;
      dataCache.delete(oldestKey);
    }

    console.log('✅ Fresh data fetched and cached, length:', csvData.length);
    
    res.setHeader('X-Cache', 'MISS');
    res.setHeader('Content-Type', 'text/csv');
    res.status(200).send(csvData);

  } catch (error) {
    console.error('❌ API Error:', error);
    res.status(500).json({
      error: 'Failed to fetch data',
      message: error.message,
    });
  }
}
