import React, { useState, useMemo } from 'react';
import type { DebtData } from '../services/googleSheets';
import { formatCurrency } from '../services/googleSheets';
import { Clock, CheckCircle, AlertTriangle, User, Search, ChevronLeft, ChevronRight } from 'lucide-react';

// Fungsi untuk mendapatkan item pagination dengan ellipsis
const getPaginationItems = (currentPage: number, totalPages: number): (number | string)[] => {
  const delta = 2; // Jumlah halaman yang ditampilkan di sekitar halaman aktif
  const items: (number | string)[] = [];

  if (totalPages <= 7) {
    // Jika total halaman <= 7, tampilkan semua
    for (let i = 1; i <= totalPages; i++) {
      items.push(i);
    }
  } else {
    // Selalu tampilkan halaman pertama
    items.push(1);

    if (currentPage - delta > 2) {
      items.push('...');
    }

    // Tampilkan halaman di sekitar halaman aktif
    const start = Math.max(2, currentPage - delta);
    const end = Math.min(totalPages - 1, currentPage + delta);

    for (let i = start; i <= end; i++) {
      items.push(i);
    }

    if (currentPage + delta < totalPages - 1) {
      items.push('...');
    }

    // Selalu tampilkan halaman terakhir (jika tidak sama dengan halaman pertama)
    if (totalPages > 1) {
      items.push(totalPages);
    }
  }

  return items;
};

interface DebtTableProps {
  debts: DebtData[];
  isLoading: boolean;
}

const DebtTable: React.FC<DebtTableProps> = ({ debts, isLoading }) => {
  // State untuk pagination dan search
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;

  // Filter dan sort data
  const filteredAndSortedDebts = useMemo(() => {
    // Filter berdasarkan search term
    let filtered = debts.filter(debt => 
      debt.playerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      debt.statusTagihan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      debt.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      debt.memberId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formatCurrency(debt.sisaPembayaran).toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort by input time (most recent first)
    return filtered.sort((a, b) => {
      const dateA = new Date(a.inputTime.replace(/(\d{2})\/(\d{2})\/(\d{4}) (\d{2})\.(\d{2})\.(\d{2})/, '$3-$2-$1T$4:$5:$6'));
      const dateB = new Date(b.inputTime.replace(/(\d{2})\/(\d{2})\/(\d{4}) (\d{2})\.(\d{2})\.(\d{2})/, '$3-$2-$1T$4:$5:$6'));
      return dateB.getTime() - dateA.getTime();
    });
  }, [debts, searchTerm]);

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedDebts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredAndSortedDebts.slice(startIndex, endIndex);

  // Reset to first page when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const getSisaPembayaranColor = (debt: DebtData) => {
    const statusLower = debt.statusTagihan.toLowerCase();
    if (statusLower.includes('hutang') || debt.status === 'pending' || debt.status === 'overdue') {
      return 'text-red-600 dark:text-red-400 font-semibold'; // Hutang - merah
    } else if (statusLower.includes('nitip') || statusLower.includes('titip') || debt.status === 'nitip') {
      return 'text-green-600 dark:text-green-400 font-semibold'; // Nitip - hijau  
    } else if (statusLower.includes('lunas') || debt.status === 'paid') {
      return 'text-gray-500 dark:text-gray-400'; // Lunas - abu-abu
    } else {
      return 'text-gray-900 dark:text-white'; // Default
    }
  };

  const formatInputTime = (inputTime: string) => {
    // Format dari "15/07/2025 15.13.18" ke format yang lebih readable
    try {
      const parts = inputTime.split(' ');
      if (parts.length === 2) {
        const [datePart, timePart] = parts;
        const [day, month, year] = datePart.split('/');
        const [hour, minute] = timePart.split('.');
        return `${day}/${month}/${year} ${hour}:${minute}`;
      }
      return inputTime;
    } catch {
      return inputTime;
    }
  };
  const getStatusIcon = (debt: DebtData) => {
    const statusLower = debt.statusTagihan.toLowerCase();
    if (statusLower.includes('lunas') || statusLower.includes('paid')) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    } else if (statusLower.includes('hutang')) {
      return <AlertTriangle className="w-5 h-5 text-red-500" />;
    } else if (statusLower.includes('nitip') || statusLower.includes('titip')) {
      return <User className="w-5 h-5 text-blue-500" />;
    } else {
      return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (debt: DebtData) => {
    const statusLower = debt.statusTagihan.toLowerCase();
    if (statusLower.includes('lunas') || statusLower.includes('paid')) {
      return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
    } else if (statusLower.includes('hutang')) {
      return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
    } else if (statusLower.includes('nitip') || statusLower.includes('titip')) {
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
    } else {
      return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Data Hutang Piutang</h2>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
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
          <User className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" />
          Data Hutang Piutang
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 font-normal">
          {filteredAndSortedDebts.length} dari {debts.length} records
        </div>
      </h2>

      {/* Search Box */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Cari nama player, member ID, status, atau jumlah..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Player
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Member ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Waktu Input
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Sisa Pembayaran
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {currentData.map((debt) => (
              <tr key={debt.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {debt.playerName}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {debt.memberId}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {formatInputTime(debt.inputTime)}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className={`text-sm ${getSisaPembayaranColor(debt)}`}>
                    {debt.sisaPembayaran < 0 ? 
                      `-${formatCurrency(Math.abs(debt.sisaPembayaran))}` : 
                      formatCurrency(debt.sisaPembayaran)
                    }
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(debt)}`}>
                    {getStatusIcon(debt)}
                    <span className="ml-1">{debt.statusTagihan}</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Menampilkan {startIndex + 1} - {Math.min(endIndex, filteredAndSortedDebts.length)} dari {filteredAndSortedDebts.length} data
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </button>
            
            <div className="flex items-center space-x-1">
              {getPaginationItems(currentPage, totalPages).map((page, index) => (
                page === '...' ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page as number)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    {page}
                  </button>
                )
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      )}
      
      {filteredAndSortedDebts.length === 0 && !isLoading && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm ? 'Tidak ada data yang cocok dengan pencarian' : 'Tidak ada data hutang piutang'}
          </p>
        </div>
      )}
    </div>
  );
};

export default DebtTable;
