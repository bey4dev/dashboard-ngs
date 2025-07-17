import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Chrome, Database, TrendingUp, Lock } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth();

  const handleGoogleLogin = () => {
    if (!isLoading) {
      try {
        login();
      } catch (error) {
        console.error('❌ Login error:', error);
        
        // Show user-friendly error message
        if (error instanceof Error) {
          if (error.message.includes('tidak dikonfigurasi')) {
            alert('Google OAuth belum dikonfigurasi. Silakan hubungi administrator.');
          } else if (error.message.includes('Akses ditolak')) {
            alert('Akses ditolak. Akun Anda tidak memiliki izin untuk mengakses aplikasi ini.');
          } else {
            alert('Terjadi kesalahan saat login. Silakan coba lagi.');
          }
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard Nogogini
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Masuk dengan akun Google untuk mengakses dashboard
          </p>
        </div>

        {/* Features Preview */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
            Fitur Dashboard
          </h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <Database className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-gray-700 dark:text-gray-300">Kelola Data Transaksi</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-gray-700 dark:text-gray-300">Analisis Penjualan Emas</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-gray-700 dark:text-gray-300">Akses Aman dengan Google</span>
            </div>
          </div>
        </div>

        {/* Login Button */}
        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="group relative w-full flex justify-center items-center space-x-3 py-4 px-6 border border-transparent text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <Chrome className="w-5 h-5" />
                <span>Masuk dengan Google</span>
              </>
            )}
          </button>
        </div>

        {/* Security Notice */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Akses Terbatas
              </h4>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                Dashboard ini hanya dapat diakses oleh akun Google yang telah diotorisasi.
              </p>
            </div>
          </div>
        </div>

        {/* Additional Security Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Keamanan Data
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Data Anda aman. Kami hanya mengakses informasi profil dan Google Sheets yang diperlukan untuk dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* Authorized Users Info */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-green-800 dark:text-green-200">
                Email yang Diotorisasi
              </h4>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                Akses terbatas untuk: bey.gyandev@gmail.com, nogoginistore@gmail.com, project.titan00@gmail.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
