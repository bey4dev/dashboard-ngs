// EMERGENCY FALLBACK - Google Sheets API Direct Access
// File ini akan digunakan jika CSV export tidak berhasil

export async function fetchGoogleSheetsAPI(spreadsheetId: string, range: string) {
  const API_KEY = 'AIzaSyBmKzBbr8fwrlgOhjVWb7jgK_gzJ9XG9_Y8'; // Public API key untuk read-only
  
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${API_KEY}`;
  
  console.log('🔄 Using Google Sheets API as fallback:', url);
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    return data.values || [];
  } catch (error) {
    console.error('❌ Google Sheets API failed:', error);
    throw error;
  }
}

// Convert API response to CSV format
export function convertAPIResponseToCSV(values: string[][]): string {
  return values.map(row => 
    row.map(cell => 
      typeof cell === 'string' && (cell.includes(',') || cell.includes('"')) 
        ? `"${cell.replace(/"/g, '""')}"` 
        : cell
    ).join(',')
  ).join('\n');
}
