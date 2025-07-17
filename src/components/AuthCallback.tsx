import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const AuthCallback: React.FC = () => {
  const { handleAuthCallback, isAuthenticated } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success'>('loading');
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    // If user is already authenticated, redirect immediately
    if (isAuthenticated) {
      console.log('✅ User already authenticated, redirecting...');
      window.location.href = '/';
      return;
    }

    const processCallback = async () => {
      try {
        setProgress(10);
        
        // Get authorization code from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        
        setProgress(25);

        if (error) {
          throw new Error(`OAuth error: ${error}`);
        }

        if (!code) {
          throw new Error('No authorization code received');
        }

        setProgress(50);
        console.log('🔄 Processing auth code...');

        // Handle the callback
        await handleAuthCallback(code);
        
        setProgress(75);
        console.log('✅ Auth callback successful');
        
        setStatus('success');
        setProgress(100);

        // Clear URL parameters and redirect immediately
        const cleanUrl = window.location.origin + '/';
        window.history.replaceState({}, document.title, cleanUrl);
        
        // Immediate redirect
        setTimeout(() => {
          window.location.href = '/';
        }, 500); // Reduced time for faster redirect

      } catch (error) {
        console.error('❌ Auth callback error:', error);
        
        // Instead of showing error, just clean up and redirect to home
        // The home page will show login if needed
        console.log('🔄 Cleaning up after auth error and redirecting...');
        
        setTimeout(() => {
          // Clean up any auth-related data and URL parameters
          localStorage.removeItem('google_auth_tokens');
          sessionStorage.clear();
          
          const cleanUrl = window.location.origin + '/';
          window.history.replaceState({}, document.title, cleanUrl);
          window.location.href = '/';
        }, 1000); // Quick redirect without showing error
      }
    };

    processCallback();
  }, [handleAuthCallback, isAuthenticated]);

  // Don't render anything if user is already authenticated
  if (isAuthenticated) {
    return null;
  }

  const ModernLoader = () => (
    <div className="relative">
      {/* Outer ring */}
      <div className="w-20 h-20 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-pulse"></div>
      
      {/* Middle ring */}
      <div className="absolute top-2 left-2 w-16 h-16 border-4 border-blue-400 dark:border-blue-600 rounded-full animate-spin border-t-transparent"></div>
      
      {/* Inner ring */}
      <div className="absolute top-4 left-4 w-12 h-12 border-4 border-blue-600 dark:border-blue-400 rounded-full animate-spin border-t-transparent border-r-transparent" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
      
      {/* Center dot */}
      <div className="absolute top-8 left-8 w-4 h-4 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce"></div>
    </div>
  );

  const SuccessAnimation = () => (
    <div className="relative">
      {/* Success circle with animation */}
      <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center transform transition-all duration-500 scale-100 animate-pulse">
        <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      {/* Success particles */}
      <div className="absolute -top-1 -left-1 w-22 h-22">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-green-400 dark:bg-green-300 rounded-full animate-ping"
            style={{
              top: `${50 + 40 * Math.cos((i * Math.PI) / 4)}%`,
              left: `${50 + 40 * Math.sin((i * Math.PI) / 4)}%`,
              animationDelay: `${i * 0.1}s`,
              animationDuration: '1s'
            }}
          />
        ))}
      </div>
    </div>
  );

  const ProgressBar = ({ progress }: { progress: number }) => (
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-6">
      <div 
        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <ModernLoader />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Memproses Autentikasi
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Memverifikasi kredensial Google Anda...
            </p>
            <ProgressBar progress={progress} />
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              {progress < 25 ? 'Menghubungi server Google...' :
               progress < 50 ? 'Memvalidasi kode otorisasi...' :
               progress < 75 ? 'Mengambil informasi pengguna...' :
               'Menyelesaikan proses...'}
            </p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <SuccessAnimation />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Login Berhasil!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Selamat datang di Dashboard Nogogini
            </p>
            <div className="inline-flex items-center text-sm text-green-600 dark:text-green-400">
              <span>Mengalihkan ke dashboard...</span>
              <div className="ml-2 animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 dark:border-green-400"></div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="relative max-w-md w-full">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-gray-200/50 dark:border-gray-700/50">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
