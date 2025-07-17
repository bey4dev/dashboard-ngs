// Helper function untuk get redirect URI
const getRedirectUri = (): string => {
  // Use environment variable if set and valid
  const envRedirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI;
  if (envRedirectUri && !envRedirectUri.includes('your-vercel-domain')) {
    return envRedirectUri;
  }
  
  // Auto-detect based on current URL (only if window is available)
  if (typeof window !== 'undefined') {
    const currentHost = window.location.origin;
    return `${currentHost}/auth/callback`;
  }
  
  // Fallback untuk development
  return 'http://localhost:5173/auth/callback';
};

// Google OAuth Configuration
export const GOOGLE_CONFIG = {
  // Client ID yang akan didapat dari Google Cloud Console
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  
  // Redirect URI - get dynamically
  get redirectUri() {
    return getRedirectUri();
  },
  
  // Scopes yang diperlukan
  scopes: [
    'openid',
    'profile', 
    'email',
    'https://www.googleapis.com/auth/spreadsheets.readonly' // Akses Google Sheets
  ],
  
  // OAuth2 endpoints
  authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenUrl: 'https://oauth2.googleapis.com/token',
  
  // Response type
  responseType: 'code',
  
  // Access type
  accessType: 'offline',
  
  // Private mode - hanya Google OAuth real
  isDemoMode: false,
  
  // Allowed email domains untuk private access (opsional)
  allowedDomains: [] as string[], // Tambahkan domain yang diizinkan, contoh: ['gmail.com', 'yourdomain.com']
  
  // Allowed specific emails untuk private access
  allowedEmails: [
    'bey.gyandev@gmail.com',
    'nogoginistore@gmail.com', 
    'project.titan00@gmail.com'
  ] as string[]
} as const;

// Helper function untuk membuat Google OAuth URL
export const createGoogleAuthUrl = (): string => {
  const redirectUri = GOOGLE_CONFIG.redirectUri;
  
  // Debug logging
  console.log('🔍 OAuth Debug Info:', {
    clientId: GOOGLE_CONFIG.clientId?.substring(0, 20) + '...',
    redirectUri: redirectUri,
    currentOrigin: typeof window !== 'undefined' ? window.location.origin : 'N/A',
    envRedirectUri: import.meta.env.VITE_GOOGLE_REDIRECT_URI
  });
  
  const params = new URLSearchParams({
    client_id: GOOGLE_CONFIG.clientId,
    redirect_uri: redirectUri,
    scope: GOOGLE_CONFIG.scopes.join(' '),
    response_type: GOOGLE_CONFIG.responseType,
    access_type: GOOGLE_CONFIG.accessType,
    prompt: 'consent'
  });
  
  const authUrl = `${GOOGLE_CONFIG.authUrl}?${params.toString()}`;
  console.log('🔗 Generated Auth URL:', authUrl);
  
  return authUrl;
};
