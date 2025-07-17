import React, { useState, useMemo } from 'react';
import type { SalesData } from '../services/googleSheets';
import { formatCurrency } from '../services/googleSheets';
import { ShoppingCart, Package, Calendar, DollarSign, ChevronLeft, ChevronRight, Search } from 'lucide-react';

interface SalesTableProps {
  sales: SalesData[];
  isLoading: boolean;
}

const SalesTable: React.FC<SalesTableProps> = ({ sales, isLoading }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [goToPage, setGoToPage] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter dan sorting data penjualan
  const filteredAndSortedSales = useMemo(() => {
    if (!sales.length) return [];
    
    let filtered = sales;
    
    // Filter berdasarkan search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = sales.filter(sale => {
        return sale.dateEntry.toLowerCase().includes(searchLower) ||
          formatCurrency(sale.pembelianEmas).toLowerCase().includes(searchLower) ||
          formatCurrency(sale.penjualanEmas).toLowerCase().includes(searchLower) ||
          formatCurrency(sale.allProfit || sale.profit).toLowerCase().includes(searchLower);
      });
    }
    
    // Sort berdasarkan tanggal entry terbaru
    return filtered.sort((a, b) => {
      try {
        // Parse tanggal dengan format yang beragam
        const parseDate = (dateStr: string): Date => {
          if (!dateStr) return new Date(0);
          
          // Try different date formats
          let parsedDate: Date;
          
          // Format: MM/DD/YYYY atau DD/MM/YYYY
          if (dateStr.includes('/')) {
            const parts = dateStr.split('/');
            if (parts.length === 3) {
              // Coba MM/DD/YYYY terlebih dahulu
              parsedDate = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
              
              // Jika tidak valid, coba DD/MM/YYYY
              if (isNaN(parsedDate.getTime())) {
                parsedDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
              }
            } else {
              parsedDate = new Date(dateStr);
            }
          } else {
            parsedDate = new Date(dateStr);
          }
          
          return isNaN(parsedDate.getTime()) ? new Date(0) : parsedDate;
        };
        
        const dateA = parseDate(a.dateEntry);
        const dateB = parseDate(b.dateEntry);
        
        // Sort by newest first (descending)
        return dateB.getTime() - dateA.getTime();
        
      } catch (error) {
        // Fallback to string comparison
        return b.dateEntry.localeCompare(a.dateEntry);
      }
    });
  }, [sales, searchTerm]);

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedSales.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredAndSortedSales.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Generate pagination numbers with ellipsis
  const getPaginationItems = () => {
    const delta = 2; // Number of pages to show around current page
    const rangeWithDots = [];

    if (totalPages <= 7) {
      // If total pages is 7 or less, show all pages
      for (let i = 1; i <= totalPages; i++) {
        rangeWithDots.push(i);
      }
    } else {
      // Always show first page
      rangeWithDots.push(1);

      // Calculate start and end of middle range
      const start = Math.max(2, currentPage - delta);
      const end = Math.min(totalPages - 1, currentPage + delta);

      // Add dots if there's a gap after first page
      if (start > 2) {
        rangeWithDots.push('...');
      }

      // Add middle range
      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          rangeWithDots.push(i);
        }
      }

      // Add dots if there's a gap before last page
      if (end < totalPages - 1) {
        rangeWithDots.push('...');
      }

      // Always show last page (if more than 1 page)
      if (totalPages > 1) {
        rangeWithDots.push(totalPages);
      }
    }

    return rangeWithDots;
  };
  const handleGoToPage = () => {
    const pageNum = parseInt(goToPage);
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
      setGoToPage('');
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
            <ShoppingCart className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Rekap Transaksi Emas</h2>
        </div>
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!sales || sales.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
            <ShoppingCart className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Rekap Transaksi Emas</h2>
        </div>
        <div className="text-center text-gray-500 dark:text-gray-400">
          <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Tidak ada data transaksi emas tersedia</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
          <ShoppingCart className="w-6 h-6 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Rekap Transaksi Emas</h2>
      </div>
      
      {/* Search and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Cari transaksi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value={5}>5 per halaman</option>
            <option value={10}>10 per halaman</option>
            <option value={20}>20 per halaman</option>
            <option value={50}>50 per halaman</option>
            <option value={100}>100 per halaman</option>
          </select>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        Menampilkan {startIndex + 1}-{Math.min(endIndex, filteredAndSortedSales.length)} dari {filteredAndSortedSales.length} transaksi
        {searchTerm && (
          <span className="ml-2">
            (difilter dari {sales.length} total transaksi)
          </span>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Tanggal
                </div>
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Pembelian</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Persen</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Penjualan</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Profit
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((sale, index) => (
              <tr 
                key={`${sale.dateEntry}-${index}`} 
                className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <td className="py-3 px-4 text-gray-900 dark:text-white">{sale.dateEntry}</td>
                <td className="py-3 px-4 text-gray-900 dark:text-white">{formatCurrency(sale.pembelianEmas)}</td>
                <td className="py-3 px-4 text-gray-900 dark:text-white">{sale.percentEmas}%</td>
                <td className="py-3 px-4 text-gray-900 dark:text-white">{formatCurrency(sale.penjualanEmas)}</td>
                <td className="py-3 px-4">
                  <span className={`font-semibold ${
                    (sale.allProfit || sale.profit) >= 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {formatCurrency(sale.allProfit || sale.profit)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Pergi ke halaman:</span>
            <input
              type="number"
              min="1"
              max={totalPages}
              value={goToPage}
              onChange={(e) => setGoToPage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleGoToPage();
                }
              }}
              className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="1"
            />
            <button
              onClick={handleGoToPage}
              className="px-2 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
            >
              Go
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            
            <div className="flex items-center gap-1">
              {getPaginationItems().map((item, index) => (
                <React.Fragment key={index}>
                  {item === '...' ? (
                    <span className="px-2 py-1 text-gray-500 dark:text-gray-400">...</span>
                  ) : (
                    <button
                      onClick={() => setCurrentPage(Number(item))}
                      className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                        currentPage === item
                          ? 'bg-blue-600 text-white'
                          : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`}
                    >
                      {item}
                    </button>
                  )}
                </React.Fragment>
              ))}
            </div>
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesTable;
