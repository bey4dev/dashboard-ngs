// Google OAuth Configuration
export const GOOGLE_CONFIG = {
  // Client ID yang akan didapat dari Google Cloud Console
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  
  // Redirect URI - automatically detect environment
  redirectUri: (() => {
    // Use environment variable if set
    if (import.meta.env.VITE_GOOGLE_REDIRECT_URI) {
      return import.meta.env.VITE_GOOGLE_REDIRECT_URI;
    }
    
    // Auto-detect based on current URL
    const currentHost = window.location.origin;
    return `${currentHost}/auth/callback`;
  })(),
  
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
  const params = new URLSearchParams({
    client_id: GOOGLE_CONFIG.clientId,
    redirect_uri: GOOGLE_CONFIG.redirectUri,
    scope: GOOGLE_CONFIG.scopes.join(' '),
    response_type: GOOGLE_CONFIG.responseType,
    access_type: GOOGLE_CONFIG.accessType,
    prompt: 'consent'
  });
  
  return `${GOOGLE_CONFIG.authUrl}?${params.toString()}`;
};
