// Google Sheets API Service
// Supports both Google Sheets API and public CSV export methods

export interface DebtData {
  id: string;
  playerName: string;      // Player dari column 1
  memberId: string;        // Member ID dari column 2
  inputTime: string;       // Waktu Input dari column 3
  debtDate: string;        // Tanggal Hutang dari column 4
  hutang: number;          // HUTANG dari column 5
  setor: number;           // SETOR dari column 6
  sisaPembayaran: number;  // Sisa Pembayaran dari column 7
  statusTagihan: string;   // StatusTagihan dari column 8
  amount: number;          // Hutang untuk compatibility
  status: 'pending' | 'paid' | 'overdue' | 'nitip';
  description: string;
}

export interface SalesData {
  id: string;
  dateEntry: string;       // Date entry dari column 1
  pembelianEmas: number;   // Pembelian Emas dari column 2
  percentEmas: number;     // 2% percent Emas dari column 3
  penjualanEmas: number;   // Penjualan Emas dari column 4
  totalPenjualan: number;  // Total Penjualan dari column 7
  totalPembelian: number;  // Total Pembelian dari column 8
  profitEmas: number;      // Profit Emas dari column 10
  allProfit: number;       // All Profit dari column 11
  profit: number;          // Calculated profit untuk compatibility
}

export interface TransactionData {
  id: string;
  memberId: string;        // Member ID (kolom 1)
  playerName: string;      // Player (kolom 2) 
  dateOfEntry: string;     // Date of entry (kolom 3)
  time: string;            // Time (kolom 4)
  day: string;             // Day (kolom 5)
  idGame: string;          // ID Game (kolom 6)
  nickGame: string;        // Nick Game (kolom 7)
  masukAkun: string;       // Masuk Akun (kolom 8)
  coin: number;            // Coin (kolom 9)
  rateCoin: string;        // Rate Coin (kolom 10)
  room: string;            // Room (kolom 11)
  note: string;            // Note (kolom 12)
  payout: string;          // Payout (kolom 13)
  idCensored: string;      // ID Censored (kolom 14)
  idTransaksi: string;     // ID Transaksi (kolom 15)
}

export interface SoldItemData {
  id: string;
  itemName: string;        // Nama barang
  category: string;        // Kategori barang
  quantity: number;        // Jumlah terjual
  unitPrice: number;       // Harga satuan
  totalPrice: number;      // Total harga
  saleDate: string;        // Tanggal penjualan
  customerName?: string;   // Nama customer (opsional)
  notes?: string;          // Catatan (opsional)
}

export interface CategorySalesData {
  id: string;
  categoryName: string;    // Nama kategori (Lokalan, itemku, Vcgamer)
  totalRevenue: number;    // Total pendapatan dalam rupiah
  totalQuantity: number;   // Total barang terjual dalam pieces
  displayName: string;     // Nama untuk display di UI
}

// Configuration from environment variables
const SPREADSHEET_ID = import.meta.env.VITE_GOOGLE_SHEETS_ID || '1aU9Z2ofa93NZcti57l403fFDxJAyDFwe4Ux1LbI28tk';
const DEBT_SHEET_GID = import.meta.env.VITE_DEBT_SHEET_GID || '0';
const SALES_SHEET_GID = import.meta.env.VITE_SALES_SHEET_GID || '1';
const TRANSACTION_SHEET_GID = '17627704'; // GID untuk data transaksi yang masuk
const SOLD_ITEMS_SHEET_GID = '1522583917'; // GID untuk data barang terjual
const CATEGORY_SALES_SHEET_GID = '1609460300'; // GID untuk data kategori penjualan (Lokalan, itemku, Vcgamer)
// Force to false untuk debugging - pastikan menggunakan real data
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' ? true : false;

console.log('🔧 Environment Variables Check:');
console.log('VITE_GOOGLE_SHEETS_ID:', import.meta.env.VITE_GOOGLE_SHEETS_ID);
console.log('VITE_USE_MOCK_DATA:', import.meta.env.VITE_USE_MOCK_DATA);
console.log('USE_MOCK_DATA (computed):', USE_MOCK_DATA);
console.log('SPREADSHEET_ID (final):', SPREADSHEET_ID);
console.log('DEBT_SHEET_GID:', DEBT_SHEET_GID);
console.log('SALES_SHEET_GID:', SALES_SHEET_GID);
console.log('🎯 SOLD_ITEMS_SHEET_GID:', SOLD_ITEMS_SHEET_GID, '(Expected: 1522583917)');

// Production debugging
if (typeof window !== 'undefined') {
  (window as any).debugGoogleSheets = {
    SPREADSHEET_ID,
    USE_MOCK_DATA,
    env: {
      VITE_GOOGLE_SHEETS_ID: import.meta.env.VITE_GOOGLE_SHEETS_ID,
      VITE_USE_MOCK_DATA: import.meta.env.VITE_USE_MOCK_DATA,
    }
  };
  console.log('🐛 Debug info available at window.debugGoogleSheets');
}
console.log('SALES_SHEET_GID:', SALES_SHEET_GID);
console.log('🎯 SOLD_ITEMS_SHEET_GID:', SOLD_ITEMS_SHEET_GID, '(Expected: 1522583917)');

// Google Sheets CSV Export URL
const CSV_EXPORT_BASE = 'https://docs.google.com/spreadsheets/d';

// Alternative public URL that works better with CORS
const PUBLIC_CSV_BASE = 'https://docs.google.com/spreadsheets/u/0/d';

// Detect if running in production (Vercel)
const isProduction = typeof window !== 'undefined' && window.location.hostname !== 'localhost';

// SIMPLE SOLUTION: Try multiple URL formats until one works
async function fetchCSVData(spreadsheetId: string, gid: string): Promise<string> {
  const urls = [
    // Try public URL first (often works better)
    `${PUBLIC_CSV_BASE}/${spreadsheetId}/export?format=csv&gid=${gid}`,
    // Fallback to regular URL
    `${CSV_EXPORT_BASE}/${spreadsheetId}/export?format=csv&gid=${gid}`,
    // Alternative format
    `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&gid=${gid}`,
  ];

  let lastError: Error | null = null;

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    console.log(`� Trying URL ${i + 1}/${urls.length}:`, url);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'text/csv,text/plain,*/*',
          'Cache-Control': 'no-cache',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        mode: 'cors',
      });

      console.log(`📡 Response ${i + 1} status:`, response.status);

      if (response.ok) {
        const csvText = await response.text();
        if (csvText && csvText.length > 0) {
          console.log(`✅ Success with URL ${i + 1}! CSV length:`, csvText.length);
          return csvText;
        }
      }
    } catch (error) {
      console.warn(`❌ URL ${i + 1} failed:`, error);
      lastError = error as Error;
    }
  }

  throw lastError || new Error('All CSV fetch attempts failed');
}

// Fungsi untuk parsing CSV data
function parseCSV(csvText: string): string[][] {
  const lines = csvText.split('\n').filter(line => line.trim());
  return lines.map(line => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim().replace(/^"|"$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim().replace(/^"|"$/g, ''));
    return result;
  }).filter(row => row.some(cell => cell.length > 0));
}

// Fungsi untuk konversi data CSV ke DebtData sesuai struktur real
// Struktur: Player | Member ID | Waktu Input | Tanggal Hutang | HUTANG | SETOR | Sisa Pembayaran | StatusTagihan
function parseDebtDataFromCSV(rows: string[][]): DebtData[] {
  console.log('🔍 Parsing debt data from CSV. Total rows:', rows.length);
  if (rows.length <= 1) {
    console.log('⚠️ No data rows to parse (only header or empty)');
    return [];
  }
  
  const [, ...dataRows] = rows; // Skip header row
  console.log('📊 Data rows to process:', dataRows.length);
  
  const parsedData = dataRows.map((row, index) => {
    console.log(`Row ${index + 1}:`, row);
    
    const playerName = row[0]?.toString().trim() || `Player_${index + 1}`;
    const memberId = row[1]?.toString().trim() || `ID_${index + 1}`;
    const inputTime = row[2]?.toString().trim() || '';
    const debtDate = row[3]?.toString().trim() || '';
    
    // Parse amounts from specific columns using improved parsing
    const hutang = parseIndonesianNumber(row[4]?.toString() || '0');
    const setor = parseIndonesianNumber(row[5]?.toString() || '0');
    
    // Handle negative amounts in Sisa Pembayaran
    const sisaStr = row[6]?.toString() || '0';
    const sisaIsNegative = sisaStr.includes('-');
    const sisaPembayaran = sisaIsNegative ? -parseIndonesianNumber(sisaStr.replace('-', '')) : parseIndonesianNumber(sisaStr);
    
    const statusTagihan = row[7]?.toString().trim() || 'Hutang';
    
    // Tentukan status berdasarkan StatusTagihan
    let status: DebtData['status'] = 'pending';
    const statusLower = statusTagihan.toLowerCase();
    if (statusLower.includes('lunas') || statusLower.includes('paid')) {
      status = 'paid';
    } else if (statusLower.includes('nitip') || statusLower.includes('titip')) {
      status = 'nitip';
    } else if (statusLower.includes('terlambat') || statusLower.includes('overdue')) {
      status = 'overdue';
    }
    
    const result = {
      id: `debt_${index + 1}`,
      playerName,
      memberId,
      inputTime,
      debtDate,
      hutang,
      setor,
      sisaPembayaran,
      statusTagihan,
      amount: hutang, // For compatibility
      status,
      description: `${statusTagihan}: ${playerName} - ${memberId}`
    };
    
    console.log(`Parsed row ${index + 1}:`, result);
    return result;
  });
  
  const filteredData = parsedData.filter(item => {
    const isValidPlayer = item.playerName.trim() !== '' && 
                         item.playerName !== 'Player' &&
                         item.playerName !== 'undefined' &&
                         item.memberId.trim() !== '' &&
                         item.memberId !== 'Member ID';
    console.log(`Filter check for ${item.playerName}: ${isValidPlayer}`);
    return isValidPlayer;
  });
  console.log('✅ Filtered debt data:', filteredData.length, 'records');
  console.log('First 3 records:', filteredData.slice(0, 3));
  
  return filteredData;
}

// Fungsi untuk konversi data CSV ke SalesData sesuai struktur real
// Struktur: Date entry | Pembelian Emas | 2% percent Emas | Penjualan Emas | ... | Total Penjualan | Total Pembelian | ... | Profit Emas | All Profit
function parseIndonesianNumber(value: string): number {
  if (!value) return 0;
  
  // Remove Rp, spaces, quotes, and other non-numeric characters except . and ,
  let cleaned = value.toString().replace(/[Rp\s"']/g, '');
  
  console.log(`🔍 Parsing number: "${value}" -> cleaned: "${cleaned}"`);
  
  // Handle Indonesian number format: 1.200.000,50 or 1.200.000
  // If contains both . and ,, assume . is thousands separator and , is decimal
  if (cleaned.includes('.') && cleaned.includes(',')) {
    // Format: 1.200.000,50 -> 1200000.50
    const beforeComma = cleaned.split(',')[0].replace(/\./g, '');
    const afterComma = cleaned.split(',')[1];
    cleaned = beforeComma + '.' + afterComma;
    console.log(`Format 1.200.000,50 detected -> converted to: ${cleaned}`);
  } 
  // If only contains ., likely thousands separator (Indonesian format)
  else if (cleaned.includes('.')) {
    const dotParts = cleaned.split('.');
    
    // Check if this looks like thousands separator (multiple dots or single dot with 3 digits)
    if (dotParts.length > 2 || (dotParts.length === 2 && dotParts[1].length === 3)) {
      // Thousands separator: 1.200.000 or 1.200 -> remove all dots
      cleaned = cleaned.replace(/\./g, '');
      console.log(`Thousands separator detected -> converted to: ${cleaned}`);
    }
    // Otherwise keep . as decimal separator (like 1234.56)
  }
  // If only contains ,, treat as decimal separator
  else if (cleaned.includes(',')) {
    cleaned = cleaned.replace(/,/g, '.');
    console.log(`Decimal comma detected -> converted to: ${cleaned}`);
  }
  
  const result = parseFloat(cleaned) || 0;
  
  console.log(`✅ Final parsed value: ${result.toLocaleString('id-ID')}`);
  
  return result;
}

function parseSalesDataFromCSV(rows: string[][]): SalesData[] {
  if (rows.length <= 1) return [];
  
  const [, ...dataRows] = rows; // Skip header row
  return dataRows.map((row, index) => {
    const dateEntry = row[0]?.toString().trim() || '';
    
    // Parse individual emas data (columns 2-4)
    const pembelianEmas = parseIndonesianNumber(row[1]) || 0;
    const percentEmas = parseIndonesianNumber(row[2]) || 0;
    const penjualanEmas = parseIndonesianNumber(row[3]) || 0;
    // Parse total data (columns 7-8)
    const totalPenjualan = parseIndonesianNumber(row[6]) || 0;
    const totalPembelian = parseIndonesianNumber(row[7]) || 0;
    
    // Debug logging untuk total pembelian
    if (index < 3) {
      console.log(`Row ${index + 1} - Original totalPembelian:`, row[7]);
      console.log(`Row ${index + 1} - Parsed totalPembelian:`, totalPembelian);
    }
    
    // Parse profit data (columns 10-11)
    const profitEmas = parseIndonesianNumber(row[9]) || 0;
    const allProfit = parseIndonesianNumber(row[10]) || 0;
    
    // Use allProfit if available, otherwise calculate from emas data
    const profit = allProfit || (penjualanEmas - pembelianEmas);
    
    return {
      id: `sale_${index + 1}`,
      dateEntry,
      pembelianEmas,
      percentEmas,
      penjualanEmas,
      totalPenjualan,
      totalPembelian,
      profitEmas,
      allProfit,
      profit
    };
  }).filter(item => item.dateEntry.trim() !== '' && item.dateEntry !== 'Date entry');
}

// Parse transaction data from CSV
function parseTransactionDataFromCSV(rows: string[][]): TransactionData[] {
  console.log('🔍 Parsing transaction data from CSV. Total rows:', rows.length);
  if (rows.length <= 1) {
    console.log('⚠️ No transaction data rows to parse (only header or empty)');
    return [];
  }
  
  const [, ...dataRows] = rows; // Skip header row
  console.log('📊 Transaction data rows to process:', dataRows.length);
  
  const parsedData = dataRows.map((row, index) => {
    console.log(`Transaction Row ${index + 1}:`, row);
    
    // Struktur berdasarkan data sebenarnya:
    // Member ID,Player,Date of entry,Time,Day,ID Game,Nick Game,Masuk Akun,Coin,Rate Coin,Room,Note,Payout,ID Censored,ID Transaksi
    const memberId = row[0]?.toString().trim() || '';
    const playerName = row[1]?.toString().trim() || '';
    const dateOfEntry = row[2]?.toString().trim() || '';
    const time = row[3]?.toString().trim() || '';
    const day = row[4]?.toString().trim() || '';
    const idGame = row[5]?.toString().trim() || '';
    const nickGame = row[6]?.toString().trim() || '';
    const masukAkun = row[7]?.toString().trim() || '';
    
    // Parse coin as number
    const coinStr = row[8]?.toString().trim() || '0';
    const coin = parseInt(coinStr) || 0;
    
    const rateCoin = row[9]?.toString().trim() || '';
    const room = row[10]?.toString().trim() || '';
    const note = row[11]?.toString().trim() || '';
    const payout = row[12]?.toString().trim() || '';
    const idCensored = row[13]?.toString().trim() || '';
    const idTransaksi = row[14]?.toString().trim() || '';
    
    const result = {
      id: `transaction_${index + 1}`,
      memberId,
      playerName,
      dateOfEntry,
      time,
      day,
      idGame,
      nickGame,
      masukAkun,
      coin,
      rateCoin,
      room,
      note,
      payout,
      idCensored,
      idTransaksi
    };
    
    console.log(`Parsed transaction row ${index + 1}:`, result);
    return result;
  });
  
  const filteredData = parsedData.filter(item => {
    const isValid = item.playerName.trim() !== '' && 
                   item.playerName !== 'Player' &&
                   item.memberId.trim() !== '' &&
                   item.memberId !== 'Member ID';
    console.log(`Transaction filter check for ${item.playerName}: ${isValid}`);
    return isValid;
  });
  
  console.log('✅ Filtered transaction data:', filteredData.length, 'records');
  console.log('First 3 transaction records:', filteredData.slice(0, 3));
  
  return filteredData;
}

// Parse sold items data from CSV
function parseSoldItemsDataFromCSV(rows: string[][]): SoldItemData[] {
  console.log('🔍 Parsing sold items data from CSV. Total rows:', rows.length);
  if (rows.length <= 1) {
    console.log('⚠️ No data rows to parse (only header or empty)');
    return [];
  }

  const [headerRow, ...dataRows] = rows;
  console.log('📊 Header row:', headerRow);
  console.log('📊 Data rows to process:', dataRows.length);

  // Find the "Total Terjual" column index
  const totalTerjualIndex = headerRow.findIndex(col => 
    col && col.toString().toLowerCase().includes('total terjual')
  );
  
  // Find date column - look for common date column names
  const dateColumnIndex = headerRow.findIndex(col => 
    col && (
      col.toString().toLowerCase().includes('tanggal') ||
      col.toString().toLowerCase().includes('date') ||
      col.toString().toLowerCase().includes('waktu') ||
      col.toString().toLowerCase().includes('time') ||
      col.toString().toLowerCase().includes('hari') ||
      col.toString().toLowerCase().includes('day')
    )
  );
  
  console.log('🎯 Total Terjual column found at index:', totalTerjualIndex);
  console.log('📅 Date column found at index:', dateColumnIndex);
  console.log('📋 Available columns:', headerRow);
  
  if (totalTerjualIndex === -1) {
    console.error('❌ "Total Terjual" column not found in header!');
    return [];
  }

  const parsedData = dataRows.map((row, index) => {
    console.log(`Row ${index + 1}:`, row);
    
    // Get the "Total Terjual" value from the correct column
    const totalTerjualValue = parseIndonesianNumber(row[totalTerjualIndex]?.toString() || '0');
    
    // Get date value from date column or use row index as fallback
    let saleDate = '';
    if (dateColumnIndex !== -1 && row[dateColumnIndex]) {
      saleDate = row[dateColumnIndex].toString().trim();
    } else {
      // If no date column found, use current date minus row index (for testing)
      const fallbackDate = new Date();
      fallbackDate.setDate(fallbackDate.getDate() - index);
      saleDate = fallbackDate.toLocaleDateString('id-ID');
    }
    
    const result = {
      id: `sold_item_${index + 1}`,
      itemName: `Total Terjual Row ${index + 1}`,
      category: 'Total Terjual',
      quantity: totalTerjualValue, // Use Total Terjual as quantity
      unitPrice: 1,
      totalPrice: totalTerjualValue,
      saleDate: saleDate,
      customerName: '',
      notes: `From Total Terjual column (index ${totalTerjualIndex}), Date column (index ${dateColumnIndex})`
    };
    
    console.log(`Parsed sold item row ${index + 1}:`, result);
    return result;
  }).filter(item => item.quantity > 0); // Only include rows with valid quantity
  
  console.log('✅ Parsed sold items data:', parsedData.length, 'records');
  console.log('First 3 sold item records:', parsedData.slice(0, 3));
  console.log('Total quantity sum:', parsedData.reduce((sum, item) => sum + item.quantity, 0));
  
  return parsedData;
}

// Helper function to parse Indonesian currency format
function parseIndonesianCurrency(value: string): number {
  if (!value) return 0;
  
  // Remove Rp, spaces, and convert Indonesian format to number
  // Indonesian format: Rp 2.100.000,00 (titik = ribuan, koma = desimal)
  // But in Google Sheets, it might be: Rp2100000.00 or Rp 2.100.000
  
  let cleanValue = value.toString()
    .replace(/Rp/gi, '')  // Remove Rp
    .replace(/\s/g, '')   // Remove spaces
    .trim();
  
  // Check if there's a comma (Indonesian decimal separator)
  if (cleanValue.includes(',')) {
    // Format: 2.100.000,50 -> convert to 2100000.50
    const parts = cleanValue.split(',');
    const integerPart = parts[0].replace(/\./g, ''); // Remove dots (thousand separators)
    const decimalPart = parts[1] || '0';
    cleanValue = integerPart + '.' + decimalPart;
  } else {
    // No comma, check if dots are thousand separators or decimal
    const dotCount = (cleanValue.match(/\./g) || []).length;
    
    if (dotCount === 0) {
      // No dots, just a number
      cleanValue = cleanValue;
    } else if (dotCount === 1) {
      // One dot - could be decimal or thousand separator
      const dotIndex = cleanValue.lastIndexOf('.');
      const afterDot = cleanValue.substring(dotIndex + 1);
      
      if (afterDot.length <= 2) {
        // Likely decimal: 2100000.50
        cleanValue = cleanValue;
      } else {
        // Likely thousand separator: 2.100000
        cleanValue = cleanValue.replace(/\./g, '');
      }
    } else {
      // Multiple dots - thousand separators: 2.100.000
      cleanValue = cleanValue.replace(/\./g, '');
    }
  }
  
  const result = parseFloat(cleanValue) || 0;
  return result;
}
function parseCategorySalesDataFromCSV(rows: string[][]): CategorySalesData[] {
  if (rows.length <= 1) {
    return [];
  }

  // Initialize totals for each platform
  let lokalanTotalQty = 0;
  let itemkuTotalQty = 0;
  let vcgamerTotalQty = 0;
  let lokalanTotalRevenue = 0;
  let itemkuTotalRevenue = 0;
  let vcgamerTotalRevenue = 0;

  // Skip header row and process all data rows to calculate totals
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 10) continue; // Skip invalid rows
    
    // Based on sheet structure: Date entry | Lokalan | itemku | Vcgamer | Rate Lokalan | Rate itemku | Rate Vcgamer | Total Lokalan | Total itemku | Total Vcgamer
    // Columns: 0=Date, 1=Lokalan, 2=itemku, 3=Vcgamer, 4=Rate Lokalan, 5=Rate itemku, 6=Rate Vcgamer, 7=Total Lokalan, 8=Total itemku, 9=Total Vcgamer
    
    const lokalanQty = parseInt(row[1]?.toString().replace(/[^\d]/g, '')) || 0;
    const itemkuQty = parseInt(row[2]?.toString().replace(/[^\d]/g, '')) || 0;
    const vcgamerQty = parseInt(row[3]?.toString().replace(/[^\d]/g, '')) || 0;
    
    const lokalanRevenue = parseIndonesianCurrency(row[7]?.toString() || '');
    const itemkuRevenue = parseIndonesianCurrency(row[8]?.toString() || '');
    const vcgamerRevenue = parseIndonesianCurrency(row[9]?.toString() || '');

    // Add to totals
    lokalanTotalQty += lokalanQty;
    itemkuTotalQty += itemkuQty;
    vcgamerTotalQty += vcgamerQty;
    
    lokalanTotalRevenue += lokalanRevenue;
    itemkuTotalRevenue += itemkuRevenue;
    vcgamerTotalRevenue += vcgamerRevenue;
  }

  // Return summary data only
  const result: CategorySalesData[] = [];
  
  if (lokalanTotalQty > 0 || lokalanTotalRevenue > 0) {
    result.push({
      id: 'lokalan-total',
      categoryName: 'lokalan',
      displayName: 'Lokalan',
      totalQuantity: lokalanTotalQty,
      totalRevenue: lokalanTotalRevenue
    });
  }
  
  if (itemkuTotalQty > 0 || itemkuTotalRevenue > 0) {
    result.push({
      id: 'itemku-total',
      categoryName: 'itemku',
      displayName: 'itemku',
      totalQuantity: itemkuTotalQty,
      totalRevenue: itemkuTotalRevenue
    });
  }
  
  if (vcgamerTotalQty > 0 || vcgamerTotalRevenue > 0) {
    result.push({
      id: 'vcgamer-total',
      categoryName: 'vcgamer',
      displayName: 'Vcgamer',
      totalQuantity: vcgamerTotalQty,
      totalRevenue: vcgamerTotalRevenue
    });
  }

  // Sort by revenue descending
  return result.sort((a, b) => b.totalRevenue - a.totalRevenue);
}

// Mock data untuk development
const mockDebtData: DebtData[] = [
  {
    id: '1',
    playerName: 'Djoy',
    memberId: 'X_NGS_038',
    inputTime: '15/07/2025 15.13.18',
    debtDate: '26/08/2023',
    hutang: 15000000,
    setor: 12000000,
    sisaPembayaran: 3000000,
    statusTagihan: 'Hutang',
    amount: 15000000,
    status: 'pending',
    description: 'Hutang: Djoy - X_NGS_038'
  },
  {
    id: '2',
    playerName: 'ayahe Nindy',
    memberId: 'X_NGS_001',
    inputTime: '16/09/2023 23.22.11',
    debtDate: '26/08/2023',
    hutang: 8500000,
    setor: 8500000,
    sisaPembayaran: 0,
    statusTagihan: 'Lunas',
    amount: 8500000,
    status: 'paid',
    description: 'Lunas: ayahe Nindy - X_NGS_001'
  },
  {
    id: '3',
    playerName: 'Player Demo',
    memberId: 'X_NGS_999',
    inputTime: '15/07/2025 10.00.00',
    debtDate: '01/07/2025',
    hutang: 3200000,
    setor: 3200000,
    sisaPembayaran: 0,
    statusTagihan: 'Lunas',
    amount: 3200000,
    status: 'paid',
    description: 'Lunas: Player Demo - X_NGS_999'
  }
];

const mockSalesData: SalesData[] = [
  {
    id: '1',
    dateEntry: '6/29/2023',
    pembelianEmas: 4627000,
    percentEmas: 4719540,
    penjualanEmas: 3480000,
    totalPenjualan: 3480000,
    totalPembelian: 4627000,
    profitEmas: 0,
    allProfit: 0,
    profit: -1147000
  },
  {
    id: '2',
    dateEntry: '6/30/2023',
    pembelianEmas: 6187000,
    percentEmas: 6310740,
    penjualanEmas: 6632640,
    totalPenjualan: 6632640,
    totalPembelian: 6187000,
    profitEmas: 445640,
    allProfit: 445640,
    profit: 445640
  },
  {
    id: '3',
    dateEntry: '7/1/2023',
    pembelianEmas: 5314000,
    percentEmas: 5420280,
    penjualanEmas: 7009500,
    totalPenjualan: 7009500,
    totalPembelian: 5314000,
    profitEmas: 1695500,
    allProfit: 1695500,
    profit: 1695500
  },
  {
    id: '4',
    dateEntry: '7/2/2023',
    pembelianEmas: 5043000,
    percentEmas: 5143860,
    penjualanEmas: 5632500,
    totalPenjualan: 5632500,
    totalPembelian: 5043000,
    profitEmas: 589500,
    allProfit: 589500,
    profit: 589500
  },
  {
    id: '5',
    dateEntry: '7/3/2023',
    pembelianEmas: 7800000,
    percentEmas: 7956000,
    penjualanEmas: 8100000,
    totalPenjualan: 8100000,
    totalPembelian: 7800000,
    profitEmas: 300000,
    allProfit: 300000,
    profit: 300000
  }
];

const mockSoldItemsData: SoldItemData[] = [
  {
    id: '1',
    itemName: 'iPhone 15 Pro Max',
    category: 'Elektronik',
    quantity: 2,
    unitPrice: 18000000,
    totalPrice: 36000000,
    saleDate: '15/07/2025',
    customerName: 'Budi Santoso',
    notes: 'Warna Titanium Natural'
  },
  {
    id: '2',
    itemName: 'Samsung Galaxy S24 Ultra',
    category: 'Elektronik',
    quantity: 1,
    unitPrice: 16000000,
    totalPrice: 16000000,
    saleDate: '14/07/2025',
    customerName: 'Siti Aminah',
    notes: 'Warna Phantom Black'
  },
  {
    id: '3',
    itemName: 'MacBook Air M3',
    category: 'Laptop',
    quantity: 1,
    unitPrice: 20000000,
    totalPrice: 20000000,
    saleDate: '13/07/2025',
    customerName: 'Ahmad Rahman',
    notes: 'Spec 16GB RAM, 512GB SSD'
  },
  {
    id: '4',
    itemName: 'AirPods Pro 2',
    category: 'Aksesoris',
    quantity: 3,
    unitPrice: 3500000,
    totalPrice: 10500000,
    saleDate: '12/07/2025',
    customerName: 'Lisa Wijaya',
    notes: 'USB-C Version'
  },
  {
    id: '5',
    itemName: 'iPad Pro 12.9"',
    category: 'Tablet',
    quantity: 1,
    unitPrice: 15000000,
    totalPrice: 15000000,
    saleDate: '11/07/2025',
    customerName: 'Rudi Hartono',
    notes: 'M2 Chip, 256GB WiFi'
  }
];

export async function fetchDebtData(): Promise<DebtData[]> {
  try {
    console.log('🔧 fetchDebtData called - USE_MOCK_DATA:', USE_MOCK_DATA);
    console.log('🔧 Environment:', isProduction ? 'PRODUCTION' : 'DEVELOPMENT');
    
    // Jika menggunakan mock data untuk development
    if (USE_MOCK_DATA) {
      console.log('📊 Using mock debt data for development');
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockDebtData;
    }

    console.log('📊 Attempting to fetch debt data...');
    
    try {
      // STRATEGY 1: Try multiple CSV URLs
      const csvText = await fetchCSVData(SPREADSHEET_ID, DEBT_SHEET_GID);
      
      if (csvText && csvText.length > 0) {
        console.log('📄 CSV Text length:', csvText.length);
        console.log('📄 First 500 chars:', csvText.substring(0, 500));
        
        const rows = parseCSV(csvText);
        console.log('📊 Parsed rows:', rows.length);
        
        if (rows.length > 1) {
          const result = parseDebtDataFromCSV(rows);
          console.log('✅ Final debt data result:', result.length, 'records');
          return result;
        }
      }
    } catch (csvError) {
      console.warn('⚠️ CSV fetch failed, trying Google Sheets API...');
      
      try {
        // STRATEGY 2: Use Google Sheets API
        const { fetchGoogleSheetsAPI, convertAPIResponseToCSV } = await import('./googleSheetsAPI');
        const apiData = await fetchGoogleSheetsAPI(SPREADSHEET_ID, 'Sheet1!A:Z'); // Adjust range as needed
        
        if (apiData && apiData.length > 0) {
          const csvText = convertAPIResponseToCSV(apiData);
          const rows = parseCSV(csvText);
          
          if (rows.length > 1) {
            const result = parseDebtDataFromCSV(rows);
            console.log('✅ API fallback successful! Records:', result.length);
            return result;
          }
        }
      } catch (apiError) {
        console.warn('⚠️ Google Sheets API also failed:', apiError);
      }
    }
    
    // STRATEGY 3: Use mock data as final fallback
    console.warn('⚠️ All data fetching methods failed, using mock data');
    return mockDebtData;
    
  } catch (error) {
    console.error('❌ Error in fetchDebtData:', error);
    console.log('🔄 Falling back to mock data');
    return mockDebtData;
  }
}

export async function fetchSalesData(): Promise<SalesData[]> {
  try {
    console.log('🔧 fetchSalesData called - USE_MOCK_DATA:', USE_MOCK_DATA);
    console.log('🔧 Environment:', isProduction ? 'PRODUCTION' : 'DEVELOPMENT');
    
    // Jika menggunakan mock data untuk development
    if (USE_MOCK_DATA) {
      console.log('📊 Using mock sales data for development');
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockSalesData;
    }

    console.log('📊 Attempting to fetch sales data...');
    
    try {
      // STRATEGY 1: Try multiple CSV URLs
      const csvText = await fetchCSVData(SPREADSHEET_ID, SALES_SHEET_GID);
      
      if (csvText && csvText.length > 0) {
        console.log('📄 Sales CSV Text length:', csvText.length);
        console.log('📄 Sales CSV first 1000 chars:', csvText.substring(0, 1000));
        
        const rows = parseCSV(csvText);
        console.log('📊 Sales parsed rows:', rows.length);
        
        if (rows.length > 0) {
          console.log('📊 Sales Header row:', rows[0]);
          console.log('📊 Sales First data rows:', rows.slice(1, 4));
        }
        
        if (rows.length > 1) {
          const result = parseSalesDataFromCSV(rows);
          console.log('✅ Final sales data result:', result.length, 'records');
          return result;
        }
      }
    } catch (csvError) {
      console.warn('⚠️ Sales CSV fetch failed, trying Google Sheets API...');
      
      try {
        // STRATEGY 2: Use Google Sheets API
        const { fetchGoogleSheetsAPI, convertAPIResponseToCSV } = await import('./googleSheetsAPI');
        const apiData = await fetchGoogleSheetsAPI(SPREADSHEET_ID, 'Sheet2!A:Z'); // Adjust range as needed
        
        if (apiData && apiData.length > 0) {
          const csvText = convertAPIResponseToCSV(apiData);
          const rows = parseCSV(csvText);
          
          if (rows.length > 1) {
            const result = parseSalesDataFromCSV(rows);
            console.log('✅ Sales API fallback successful! Records:', result.length);
            return result;
          }
        }
      } catch (apiError) {
        console.warn('⚠️ Sales Google Sheets API also failed:', apiError);
      }
    }
    
    // STRATEGY 3: Use mock data as final fallback
    console.warn('⚠️ All sales data fetching methods failed, using mock data');
    return mockSalesData;
    
  } catch (error) {
    console.error('❌ Error in fetchSalesData:', error);
    console.log('🔄 Falling back to mock sales data');
    return mockSalesData;
  }
}

export async function fetchTransactionData(): Promise<TransactionData[]> {
  try {
    console.log('🔧 fetchTransactionData called for GID:', TRANSACTION_SHEET_GID);
    
    // Direct CSV Export untuk data transaksi
    console.log('📊 Fetching transaction data from CSV export...');
    const csvUrl = `${CSV_EXPORT_BASE}/${SPREADSHEET_ID}/export?format=csv&gid=${TRANSACTION_SHEET_GID}`;
    console.log('🔗 Transaction CSV URL:', csvUrl);
    const response = await fetch(csvUrl);
    
    if (!response.ok) {
      throw new Error(`Transaction CSV fetch failed: ${response.status}`);
    }
    
    const csvText = await response.text();
    console.log('📄 Transaction CSV Text length:', csvText.length);
    console.log('📄 Transaction CSV first 1000 chars:', csvText.substring(0, 1000));
    const rows = parseCSV(csvText);
    console.log('📊 Transaction parsed rows:', rows.length);
    if (rows.length > 0) {
      console.log('📊 Transaction Header row:', rows[0]);
      console.log('📊 Transaction First data rows:', rows.slice(1, 4));
    }
    
    if (rows.length > 1) {
      const result = parseTransactionDataFromCSV(rows);
      console.log('✅ Final transaction data result:', result.length, 'records');
      return result;
    }
    
    // Return empty array if no data
    console.warn('⚠️ No transaction data found');
    return [];
    
  } catch (error) {
    console.error('❌ Error fetching transaction data:', error);
    return [];
  }
}

export async function fetchSoldItemsData(): Promise<SoldItemData[]> {
  try {
    console.log('🔧 fetchSoldItemsData called for GID:', SOLD_ITEMS_SHEET_GID);
    console.log('🎯 Expected GID should be: 1522583917');
    console.log('✅ GID Match:', SOLD_ITEMS_SHEET_GID === '1522583917');
    console.log('🔄 USE_MOCK_DATA:', USE_MOCK_DATA);
    
    if (USE_MOCK_DATA) {
      console.log('🔄 Using mock sold items data (development mode)');
      return mockSoldItemsData;
    }

    console.log('🌐 Fetching REAL data from Google Sheets...');
    const csvUrl = `${CSV_EXPORT_BASE}/${SPREADSHEET_ID}/export?format=csv&gid=${SOLD_ITEMS_SHEET_GID}`;
    console.log('📡 Fetching sold items from URL:', csvUrl);
    
    const response = await fetch(csvUrl);
    if (!response.ok) {
      throw new Error(`Sold items CSV fetch failed: ${response.status}`);
    }
    
    const csvText = await response.text();
    console.log('📄 Sold items CSV Text length:', csvText.length);
    console.log('📄 Sold items CSV first 1000 chars:', csvText.substring(0, 1000));
    const rows = parseCSV(csvText);
    console.log('📊 Sold items parsed rows:', rows.length);
    if (rows.length > 0) {
      console.log('📊 Sold items Header row:', rows[0]);
      console.log('📊 Sold items First data rows:', rows.slice(1, 4));
    }
    
    if (rows.length > 1) {
      const result = parseSoldItemsDataFromCSV(rows);
      console.log('✅ Final sold items data result:', result.length, 'records');
      return result;
    }
    
    // Return empty array if no data
    console.warn('⚠️ No sold items data found');
    return [];
    
  } catch (error) {
    console.error('❌ Error fetching sold items data:', error);
    return [];
  }
}

// Fetch data kategori penjualan dari Google Sheets
export async function fetchCategorySalesData(dateFilter?: 'today' | 'yesterday' | 'week' | '2weeks' | 'month' | 'year' | 'lastYear'): Promise<CategorySalesData[]> {
  try {
    // Gunakan CSV export method
    const csvUrl = `${CSV_EXPORT_BASE}/${SPREADSHEET_ID}/export?format=csv&gid=${CATEGORY_SALES_SHEET_GID}`;
    
    const response = await fetch(csvUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const csvText = await response.text();
    const rows = parseCSV(csvText);
    
    if (rows.length <= 1) {
      console.warn('No category sales data found or only header row present');
      return [];
    }

    // Use date filter if provided
    const result = dateFilter 
      ? parseCategorySalesDataWithDateFilter(rows, dateFilter)
      : parseCategorySalesDataFromCSV(rows);
    
    return result;
    
  } catch (error) {
    console.error('Error fetching category sales data:', error);
    
    // Return mock data untuk development
    return [
      {
        id: 'category-1',
        categoryName: 'Lokalan',
        totalRevenue: 700000,
        totalQuantity: 25,
        displayName: 'Lokalan'
      },
      {
        id: 'category-2', 
        categoryName: 'itemku',
        totalRevenue: 5000000,
        totalQuantity: 150,
        displayName: 'itemku'
      },
      {
        id: 'category-3',
        categoryName: 'Vcgamer', 
        totalRevenue: 300000,
        totalQuantity: 10,
        displayName: 'Vcgamer'
      }
    ];
  }
}

// Filter category sales data by date - Parse data dengan filter tanggal
export function filterCategorySalesByDate(categorySales: CategorySalesData[], _filter: 'today' | 'yesterday' | 'week' | '2weeks' | 'month' | 'year' | 'lastYear'): CategorySalesData[] {
  // Karena category sales adalah hasil agregasi dari semua data,
  // kita perlu re-parse data dengan filter tanggal
  // Untuk sekarang return as is, nanti akan diimplementasi parsing dengan date range
  return categorySales;
}

// Parse category sales data dengan date filter
function parseCategorySalesDataWithDateFilter(rows: string[][], dateFilter?: 'today' | 'yesterday' | 'week' | '2weeks' | 'month' | 'year' | 'lastYear'): CategorySalesData[] {
  if (rows.length <= 1) {
    return [];
  }

  let startDate: Date, endDate: Date;
  const now = new Date();
  
  if (dateFilter) {
    // Calculate date range based on filter
    switch (dateFilter) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case 'yesterday':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        startDate = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case '2weeks':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear() + 1, 0, 1);
        break;
      case 'lastYear':
        startDate = new Date(now.getFullYear() - 1, 0, 1);
        endDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        // No filter, use all data
        return parseCategorySalesDataFromCSV(rows);
    }
  } else {
    // No filter, use all data
    return parseCategorySalesDataFromCSV(rows);
  }

  // Initialize totals for each platform
  let lokalanTotalQty = 0;
  let itemkuTotalQty = 0;
  let vcgamerTotalQty = 0;
  let lokalanTotalRevenue = 0;
  let itemkuTotalRevenue = 0;
  let vcgamerTotalRevenue = 0;

  // Filter and process data rows based on date range
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 10) continue; // Skip invalid rows
    
    // Parse date from first column
    const dateStr = row[0]?.toString().trim();
    if (!dateStr) continue;
    
    const rowDate = parseDateEntry(dateStr);
    if (!rowDate) continue;
    
    // Check if date is in range
    if (rowDate >= startDate && rowDate < endDate) {
      const lokalanQty = parseInt(row[1]?.toString().replace(/[^\d]/g, '')) || 0;
      const itemkuQty = parseInt(row[2]?.toString().replace(/[^\d]/g, '')) || 0;
      const vcgamerQty = parseInt(row[3]?.toString().replace(/[^\d]/g, '')) || 0;
      
      const lokalanRevenue = parseIndonesianCurrency(row[7]?.toString() || '');
      const itemkuRevenue = parseIndonesianCurrency(row[8]?.toString() || '');
      const vcgamerRevenue = parseIndonesianCurrency(row[9]?.toString() || '');

      // Add to totals
      lokalanTotalQty += lokalanQty;
      itemkuTotalQty += itemkuQty;
      vcgamerTotalQty += vcgamerQty;
      
      lokalanTotalRevenue += lokalanRevenue;
      itemkuTotalRevenue += itemkuRevenue;
      vcgamerTotalRevenue += vcgamerRevenue;
    }
  }

  // Return filtered summary data
  const result: CategorySalesData[] = [];
  
  if (lokalanTotalQty > 0 || lokalanTotalRevenue > 0) {
    result.push({
      id: 'lokalan-filtered',
      categoryName: 'lokalan',
      displayName: 'Lokalan',
      totalQuantity: lokalanTotalQty,
      totalRevenue: lokalanTotalRevenue
    });
  }
  
  if (itemkuTotalQty > 0 || itemkuTotalRevenue > 0) {
    result.push({
      id: 'itemku-filtered',
      categoryName: 'itemku',
      displayName: 'itemku',
      totalQuantity: itemkuTotalQty,
      totalRevenue: itemkuTotalRevenue
    });
  }
  
  if (vcgamerTotalQty > 0 || vcgamerTotalRevenue > 0) {
    result.push({
      id: 'vcgamer-filtered',
      categoryName: 'vcgamer',
      displayName: 'Vcgamer',
      totalQuantity: vcgamerTotalQty,
      totalRevenue: vcgamerTotalRevenue
    });
  }

  // Sort by revenue descending
  return result.sort((a, b) => b.totalRevenue - a.totalRevenue);
}

// Utility functions
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(dateString));
}

export function getDebtSummary(debts: DebtData[]) {
  // Total semua sisa pembayaran
  const total = debts.reduce((sum, debt) => sum + debt.sisaPembayaran, 0);
  
  // Sisa pembayaran berdasarkan status tagihan
  const hutang = debts.filter(debt => {
    const statusLower = debt.statusTagihan.toLowerCase();
    return statusLower.includes('hutang') || debt.status === 'pending' || debt.status === 'overdue';
  }).reduce((sum, debt) => sum + debt.sisaPembayaran, 0);
  
  const nitip = debts.filter(debt => {
    const statusLower = debt.statusTagihan.toLowerCase();
    return statusLower.includes('nitip') || statusLower.includes('titip') || debt.status === 'nitip';
  }).reduce((sum, debt) => sum + debt.sisaPembayaran, 0);
  
  const lunas = debts.filter(debt => {
    const statusLower = debt.statusTagihan.toLowerCase();
    return statusLower.includes('lunas') || debt.status === 'paid';
  }).reduce((sum, debt) => sum + debt.sisaPembayaran, 0);
  
  // Untuk backward compatibility, tetap sediakan pending/overdue/paid
  const pending = hutang; // Same as hutang
  const overdue = 0; // We don't separate overdue anymore
  const paid = lunas; // Same as lunas
  
  return { total, hutang, nitip, lunas, pending, overdue, paid };
}

export function getSalesSummary(sales: SalesData[]) {
  // Debug: Log beberapa data sales untuk analisis
  console.log('🔍 Sales data untuk debugging:');
  console.log('Total sales records:', sales.length);
  sales.slice(0, 5).forEach((sale, index) => {
    console.log(`Sale ${index + 1}:`, {
      dateEntry: sale.dateEntry,
      totalPembelian: sale.totalPembelian,
      pembelianEmas: sale.pembelianEmas,
      totalPenjualan: sale.totalPenjualan,
      penjualanEmas: sale.penjualanEmas,
      allProfit: sale.allProfit,
      profit: sale.profit
    });
  });

  // Gunakan data total jika tersedia, fallback ke data emas individual
  const totalRevenue = sales.reduce((sum, sale) => sum + (sale.totalPenjualan || sale.penjualanEmas), 0);
  const totalPurchase = sales.reduce((sum, sale) => sum + (sale.totalPembelian || sale.pembelianEmas), 0);
  const totalProfit = sales.reduce((sum, sale) => sum + (sale.allProfit || sale.profit), 0);
  const totalTransactions = sales.length;

  console.log('📊 Sales Summary Calculations:');
  console.log('Total Purchase (raw):', totalPurchase.toLocaleString('id-ID'));
  console.log('Total Revenue (raw):', totalRevenue.toLocaleString('id-ID'));
  console.log('Total Profit (raw):', totalProfit.toLocaleString('id-ID'));
  
  // Check if values seem to large (indicating potential formatting issue)
  let adjustedPurchase = totalPurchase;
  let adjustedRevenue = totalRevenue;
  
  console.log('📊 Final values (no automatic correction):');
  console.log('Purchase Total:', adjustedPurchase.toLocaleString('id-ID'));
  console.log('Revenue Total:', adjustedRevenue.toLocaleString('id-ID'));
  
  const averageTransaction = adjustedRevenue / totalTransactions || 0;
  
  // Sales by date for chart - gunakan total penjualan jika ada
  const salesByDate = sales.reduce((acc, sale) => {
    const date = sale.dateEntry;
    const amount = sale.totalPenjualan || sale.penjualanEmas;
    
    acc[date] = (acc[date] || 0) + amount;
    return acc;
  }, {} as Record<string, number>);
  
  return { 
    totalRevenue: adjustedRevenue, 
    totalPurchase: adjustedPurchase,
    totalProfit,
    totalTransactions, 
    averageTransaction, 
    salesByDate 
  };
}

export function getSoldItemsSummary(soldItems: SoldItemData[]) {
  console.log('🔍 Sold items data untuk debugging:');
  console.log('Total sold items records (filtered by date):', soldItems.length);
  console.log('🎯 Data source: Sheet GID 1522583917 (sold items sheet)');
  console.log('📅 Data shows: Total Terjual values for the selected date range');
  
  // Calculate totals - this will be sum of "Total Terjual" values for filtered dates
  const totalQuantitySold = soldItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalRevenue = soldItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalItems = soldItems.length;
  
  // Average values
  const averageQuantityPerItem = totalItems > 0 ? totalQuantitySold / totalItems : 0;
  const averageRevenuePerItem = totalItems > 0 ? totalRevenue / totalItems : 0;
  
  // Group by category
  const salesByCategory = soldItems.reduce((acc, item) => {
    const category = item.category || 'Lainnya';
    if (!acc[category]) {
      acc[category] = {
        totalQuantity: 0,
        totalRevenue: 0,
        itemCount: 0
      };
    }
    acc[category].totalQuantity += item.quantity;
    acc[category].totalRevenue += item.totalPrice;
    acc[category].itemCount += 1;
    return acc;
  }, {} as Record<string, { totalQuantity: number; totalRevenue: number; itemCount: number }>);
  
  // Top selling items by quantity
  const topSellingItems = [...soldItems]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);
  
  // Top revenue items
  const topRevenueItems = [...soldItems]
    .sort((a, b) => b.totalPrice - a.totalPrice)
    .slice(0, 5);
  
  console.log('📊 Sold Items Summary:');
  console.log('Total Quantity Sold:', totalQuantitySold);
  console.log('Total Revenue:', totalRevenue.toLocaleString('id-ID'));
  console.log('Total Items:', totalItems);
  
  return {
    totalQuantitySold,
    totalRevenue,
    totalItems,
    averageQuantityPerItem,
    averageRevenuePerItem,
    salesByCategory,
    topSellingItems,
    topRevenueItems
  };
}

// Date filtering utilities
export function filterSalesByDate(sales: SalesData[], filter: 'today' | 'yesterday' | 'week' | '2weeks' | 'month' | 'year' | 'lastYear'): SalesData[] {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  let startDate: Date;
  let endDate: Date = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000); // End of today
  
  switch (filter) {
    case 'today':
      // Hari ini
      startDate = startOfToday;
      endDate = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
      break;
    case 'yesterday':
      // Kemarin
      startDate = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
      endDate = startOfToday;
      break;
    case 'week':
      // Minggu ini (7 hari terakhir)
      startDate = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '2weeks':
      // 2 minggu lalu (14 hari yang lalu sampai 7 hari yang lalu)
      startDate = new Date(startOfToday.getTime() - 14 * 24 * 60 * 60 * 1000);
      endDate = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      // 1 bulan terakhir
      startDate = new Date(startOfToday.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case 'year':
      // Tahun ini
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    case 'lastYear':
      // Tahun kemarin
      startDate = new Date(now.getFullYear() - 1, 0, 1);
      endDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      return sales;
  }
  
  return sales.filter(sale => {
    // Parse date dari format yang ada (6/29/2023, dll)
    const saleDate = parseDateEntry(sale.dateEntry);
    if (!saleDate) return false;
    
    // Debug logging untuk filter baru
    if (filter === 'today' || filter === 'yesterday') {
      console.log(`Filter ${filter}:`, {
        saleDate: saleDate.toDateString(),
        startDate: startDate.toDateString(),
        endDate: endDate.toDateString(),
        isInRange: saleDate >= startDate && saleDate < endDate
      });
    }
    
    return saleDate >= startDate && saleDate < endDate;
  });
}

function parseDateEntry(dateStr: string): Date | null {
  if (!dateStr) return null;
  
  // Handle various date formats
  // Format: "6/29/2023", "29/6/2023", etc.
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  
  let month: number, day: number, year: number;
  
  // Try MM/DD/YYYY format first
  if (parseInt(parts[0]) <= 12 && parseInt(parts[1]) <= 31) {
    month = parseInt(parts[0]) - 1; // JavaScript months are 0-indexed
    day = parseInt(parts[1]);
    year = parseInt(parts[2]);
  } else if (parseInt(parts[1]) <= 12 && parseInt(parts[0]) <= 31) {
    // Try DD/MM/YYYY format
    day = parseInt(parts[0]);
    month = parseInt(parts[1]) - 1;
    year = parseInt(parts[2]);
  } else {
    return null;
  }
  
  return new Date(year, month, day);
}

// Debt filtering utilities
export function filterDebtsByStatus(debts: DebtData[], filter: 'all' | 'pending' | 'paid' | 'nitip'): DebtData[] {
  if (filter === 'all') return debts;
  
  return debts.filter(debt => {
    const statusLower = debt.statusTagihan.toLowerCase();
    
    switch (filter) {
      case 'pending':
        return statusLower.includes('hutang') || debt.status === 'pending' || debt.status === 'overdue';
      case 'paid':
        return statusLower.includes('lunas') || debt.status === 'paid';
      case 'nitip':
        return statusLower.includes('nitip') || statusLower.includes('titip');
      default:
        return true;
    }
  });
}

// Get counts for each debt status
export function getDebtStatusCounts(debts: DebtData[]) {
  const counts = {
    all: debts.length,
    pending: 0,
    paid: 0,
    nitip: 0
  };
  
  debts.forEach(debt => {
    const statusLower = debt.statusTagihan.toLowerCase();
    
    if (statusLower.includes('hutang') || debt.status === 'pending' || debt.status === 'overdue') {
      counts.pending++;
    } else if (statusLower.includes('lunas') || debt.status === 'paid') {
      counts.paid++;
    } else if (statusLower.includes('nitip') || statusLower.includes('titip')) {
      counts.nitip++;
    }
  });
  
  return counts;
}

// Transaction filtering utilities
export function filterTransactionsByDate(transactions: TransactionData[], filter: 'today' | 'yesterday' | 'week' | '2weeks' | 'month' | 'year' | 'lastYear'): TransactionData[] {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  let startDate: Date;
  let endDate: Date = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000); // End of today
  
  switch (filter) {
    case 'today':
      startDate = startOfToday;
      endDate = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
      break;
    case 'yesterday':
      startDate = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
      endDate = startOfToday;
      break;
    case 'week':
      startDate = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '2weeks':
      startDate = new Date(startOfToday.getTime() - 14 * 24 * 60 * 60 * 1000);
      endDate = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(startOfToday.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    case 'lastYear':
      startDate = new Date(now.getFullYear() - 1, 0, 1);
      endDate = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);
      break;
    default:
      return transactions;
  }
  
  return transactions.filter(transaction => {
    if (!transaction.dateOfEntry) return false;
    
    try {
      // Parse Indonesian date format (DD/MM/YYYY)
      const [day, month, year] = transaction.dateOfEntry.split('/').map(num => parseInt(num));
      const transactionDate = new Date(year, month - 1, day); // month is 0-indexed
      
      const isInRange = transactionDate >= startDate && transactionDate < endDate;
      
      // Debug logging for first few transactions
      if (transactions.indexOf(transaction) < 3) {
        console.log(`🔍 Transaction filter debug:`, {
          dateOfEntry: transaction.dateOfEntry,
          parsedDate: transactionDate,
          startDate,
          endDate,
          filter,
          isInRange
        });
      }
      
      return isInRange;
    } catch (error) {
      console.warn('Invalid date format for transaction:', transaction.dateOfEntry);
      return false;
    }
  });
}

// Sold items filtering utilities
export function filterSoldItemsByDate(soldItems: SoldItemData[], filter: 'today' | 'yesterday' | 'week' | '2weeks' | 'month' | 'year' | 'lastYear'): SoldItemData[] {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  let startDate: Date;
  let endDate: Date = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000); // End of today
  
  switch (filter) {
    case 'today':
      startDate = startOfToday;
      endDate = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
      break;
    case 'yesterday':
      startDate = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
      endDate = startOfToday;
      break;
    case 'week':
      startDate = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '2weeks':
      startDate = new Date(startOfToday.getTime() - 14 * 24 * 60 * 60 * 1000);
      endDate = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(startOfToday.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    case 'lastYear':
      startDate = new Date(now.getFullYear() - 1, 0, 1);
      endDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      return soldItems;
  }
  
  return soldItems.filter(item => {
    // Parse sale date
    const saleDate = parseDateEntry(item.saleDate);
    if (!saleDate) return false;
    
    const isInRange = saleDate >= startDate && saleDate < endDate;
    return isInRange;
  });
}
