// Vercel API Route - Proxy untuk Google Sheets
// File: /api/sheets.js

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
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

    console.log('🔗 Proxying Google Sheets request:', { sheetId, gid });

    // Construct Google Sheets CSV export URL
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
    
    console.log('📡 Fetching from:', csvUrl);

    // Fetch from Google Sheets with proper headers
    const response = await fetch(csvUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/csv,text/plain,*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Google Sheets fetch failed:', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText.substring(0, 500),
      });
      
      res.status(response.status).json({
        error: `Google Sheets fetch failed: ${response.status} - ${response.statusText}`,
        details: errorText.substring(0, 500),
      });
      return;
    }

    const csvData = await response.text();
    console.log('✅ CSV data length:', csvData.length);

    // Return CSV data with proper content type
    res.setHeader('Content-Type', 'text/csv');
    res.status(200).send(csvData);

  } catch (error) {
    console.error('❌ API Error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
}
