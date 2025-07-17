import React, { useState, useMemo } from 'react';
import type { TransactionData } from '../services/googleSheets';
import { formatCurrency } from '../services/googleSheets';
import { Clock, TrendingUp, TrendingDown, DollarSign, Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface TransactionTableProps {
  transactions: TransactionData[];
  isLoading: boolean;
  filterInfo?: string; // Optional filter info to display
}

export default function TransactionTable({ transactions, isLoading, filterInfo }: TransactionTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [goToPage, setGoToPage] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter dan sorting data transaksi
  const filteredAndSortedTransactions = useMemo(() => {
    if (!transactions.length) return [];
    
    let filtered = transactions;
    
    // Filter berdasarkan search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = transactions.filter(transaction => {
        const formattedPayout = formatCurrency(parsePayoutToNumber(transaction.payout)).toLowerCase();
        return transaction.playerName.toLowerCase().includes(searchLower) ||
          transaction.memberId.toLowerCase().includes(searchLower) ||
          transaction.nickGame.toLowerCase().includes(searchLower) ||
          transaction.room.toLowerCase().includes(searchLower) ||
          transaction.masukAkun.toLowerCase().includes(searchLower) ||
          transaction.payout.toLowerCase().includes(searchLower) ||
          formattedPayout.includes(searchLower) ||
          transaction.coin.toString().includes(searchLower);
      });
    }
    
    // Sort berdasarkan waktu input (date + time) terbaru
    return filtered.sort((a, b) => {
      // Combine date and time for proper sorting
      // Format dateOfEntry biasanya: DD/MM/YYYY atau MM/DD/YYYY
      // Format time biasanya: HH:mm:ss atau HH:mm
      
      try {
        // Parse date of entry - assuming DD/MM/YYYY format
        const parseDate = (dateStr: string): Date => {
          if (!dateStr) return new Date(0);
          
          // Try different date formats
          let parsedDate: Date;
          
          // Format: DD/MM/YYYY
          if (dateStr.includes('/')) {
            const parts = dateStr.split('/');
            if (parts.length === 3) {
              // Assume DD/MM/YYYY format first
              const day = parseInt(parts[0]);
              const month = parseInt(parts[1]) - 1; // Month is 0-indexed
              const year = parseInt(parts[2]);
              
              if (day <= 12 && parts[1].length <= 2) {
                // Could be MM/DD/YYYY if day <= 12
                parsedDate = new Date(year, parseInt(parts[0]) - 1, parseInt(parts[1]));
              } else {
                // Definitely DD/MM/YYYY
                parsedDate = new Date(year, month, day);
              }
            } else {
              parsedDate = new Date(dateStr);
            }
          } else {
            parsedDate = new Date(dateStr);
          }
          
          return isNaN(parsedDate.getTime()) ? new Date(0) : parsedDate;
        };
        
        const parseTime = (timeStr: string) => {
          if (!timeStr) return { hours: 0, minutes: 0, seconds: 0 };
          
          const timeParts = timeStr.split(':');
          return {
            hours: parseInt(timeParts[0]) || 0,
            minutes: parseInt(timeParts[1]) || 0,
            seconds: parseInt(timeParts[2]) || 0
          };
        };
        
        // Create full datetime for comparison
        const dateA = parseDate(a.dateOfEntry);
        const timeA = parseTime(a.time);
        dateA.setHours(timeA.hours, timeA.minutes, timeA.seconds);
        
        const dateB = parseDate(b.dateOfEntry);
        const timeB = parseTime(b.time);
        dateB.setHours(timeB.hours, timeB.minutes, timeB.seconds);
        
        // Sort by newest first (descending)
        return dateB.getTime() - dateA.getTime();
        
      } catch (error) {
        // Fallback to string comparison
        const aDateTime = `${a.dateOfEntry} ${a.time}`;
        const bDateTime = `${b.dateOfEntry} ${b.time}`;
        return bDateTime.localeCompare(aDateTime);
      }
    });
  }, [transactions, searchTerm]);

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredAndSortedTransactions.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Helper function to parse payout string to number for currency formatting
  const parsePayoutToNumber = (payoutStr: string): number => {
    if (!payoutStr) return 0;
    // Remove non-numeric characters except dots and commas
    const cleaned = payoutStr.replace(/[^0-9.,-]/g, '');
    // Use parseIndonesianNumber logic
    if (cleaned.includes('.') && cleaned.includes(',')) {
      // Format: 1.200.000,50 -> 1200000.50
      const beforeComma = cleaned.split(',')[0].replace(/\./g, '');
      const afterComma = cleaned.split(',')[1];
      return parseFloat(beforeComma + '.' + afterComma) || 0;
    } else if (cleaned.includes('.')) {
      const dotParts = cleaned.split('.');
      if (dotParts.length > 2 || (dotParts.length === 2 && dotParts[1].length === 3)) {
        // Thousands separator
        return parseFloat(cleaned.replace(/\./g, '')) || 0;
      }
    } else if (cleaned.includes(',')) {
      return parseFloat(cleaned.replace(/,/g, '.')) || 0;
    }
    return parseFloat(cleaned) || 0;
  };
  const formatTransactionDate = (dateString: string, timeString: string) => {
    if (!dateString) return 'N/A';
    try {
      // Format Indonesian date (DD/MM/YYYY) to proper date
      const [day, month, year] = dateString.split('/');
      const formattedDate = `${year}-${month}-${day}`;
      const date = new Date(formattedDate);
      return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }) + (timeString ? ` ${timeString}` : '');
    } catch {
      return `${dateString} ${timeString}`;
    }
  };

  // Get room/game type icon
  const getGameIcon = (room: string) => {
    const roomLower = room.toLowerCase();
    if (roomLower.includes('olympus')) {
      return <TrendingUp className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />;
    } else if (roomLower.includes('fafafa')) {
      return <TrendingDown className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
    }
    return <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
  };

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

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <DollarSign className="w-6 h-6 mr-2 text-green-600 dark:text-green-400" />
          <div>
            <div>Transaksi Masuk</div>
            {filterInfo && (
              <div className="text-sm font-normal text-gray-500 dark:text-gray-400">
                {filterInfo}
              </div>
            )}
          </div>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 font-normal">
          {totalPages > 1 && (
            <span className="mr-2">Halaman {currentPage} dari {totalPages} •</span>
          )}
          {filteredAndSortedTransactions.length} dari {transactions.length} records
        </div>
      </h2>

      {/* Search Box */}
      <div className="mb-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Cari nama player, member ID, nick game, room, payout (Rp), atau coin..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
        
        {/* Debug: Items per page control */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500 dark:text-gray-400">Per halaman:</span>
          <select 
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(parseInt(e.target.value));
              setCurrentPage(1); // Reset ke halaman 1 saat mengubah items per page
            }}
            className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Waktu Input (Terbaru)
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Player & Member ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Game Info
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Coin & Rate
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Payout
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Room
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {currentData.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {formatTransactionDate(transaction.dateOfEntry, transaction.time)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {transaction.day}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {transaction.playerName}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {transaction.memberId}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    {getGameIcon(transaction.room)}
                    <div className="ml-2">
                      <div className="font-medium">{transaction.nickGame}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">ID: {transaction.idGame}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    {transaction.coin} Coin
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {transaction.rateCoin}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                    {formatCurrency(parsePayoutToNumber(transaction.payout))}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {transaction.room}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    via {transaction.masukAkun}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination - Always show if there are transactions */}
      {filteredAndSortedTransactions.length > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Menampilkan {startIndex + 1} - {Math.min(endIndex, filteredAndSortedTransactions.length)} dari {filteredAndSortedTransactions.length} data transaksi
            {totalPages > 1 && <span className="ml-2 text-blue-600 dark:text-blue-400">(Halaman {currentPage} dari {totalPages})</span>}
          </div>
          
          {totalPages > 1 ? (
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Quick Jump to Page */}
              {totalPages > 5 && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Ke halaman:</span>
                  <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={goToPage}
                    onChange={(e) => setGoToPage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const page = parseInt(goToPage);
                        if (page >= 1 && page <= totalPages) {
                          setCurrentPage(page);
                          setGoToPage('');
                        }
                      }
                    }}
                    placeholder={currentPage.toString()}
                    className="w-16 px-2 py-1 text-center border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => {
                      const page = parseInt(goToPage);
                      if (page >= 1 && page <= totalPages) {
                        setCurrentPage(page);
                        setGoToPage('');
                      }
                    }}
                    disabled={!goToPage || parseInt(goToPage) < 1 || parseInt(goToPage) > totalPages}
                    className="px-2 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Go
                  </button>
                </div>
              )}
              
              {/* Navigation Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Prev
                </button>
                
                <div className="flex items-center space-x-1">
                  {getPaginationItems().map((item, index) => {
                    if (item === '...') {
                      return (
                        <span key={`ellipsis-${index}`} className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                          ...
                        </span>
                      );
                    }
                    
                    const page = item as number;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                          currentPage === page
                            ? 'bg-green-600 text-white shadow-md'
                            : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {filteredAndSortedTransactions.length <= itemsPerPage ? 'Semua data ditampilkan' : `Menampilkan ${itemsPerPage} data per halaman`}
            </div>
          )}
        </div>
      )}
      
      {filteredAndSortedTransactions.length === 0 && !isLoading && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm ? 'Tidak ada data transaksi game yang cocok dengan pencarian' : 'Tidak ada data transaksi game'}
          </p>
        </div>
      )}
    </div>
  );
}
