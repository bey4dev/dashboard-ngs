import { GOOGLE_CONFIG, createGoogleAuthUrl } from '../config/googleAuth';

// Interface untuk user data
export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture: string;
  verified_email: boolean;
}

// Interface untuk token data
export interface GoogleTokens {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
  id_token: string;
}

class GoogleAuthService {
  private static instance: GoogleAuthService;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private userInfo: GoogleUser | null = null;
  private tokenExpiry: number | null = null;

  private constructor() {
    // Load saved tokens from localStorage on initialization
    this.loadTokensFromStorage();
  }

  public static getInstance(): GoogleAuthService {
    if (!GoogleAuthService.instance) {
      GoogleAuthService.instance = new GoogleAuthService();
    }
    return GoogleAuthService.instance;
  }

  // Start Google OAuth flow
  public initiateLogin(): void {
    // Validate required config
    if (!GOOGLE_CONFIG.clientId) {
      console.error('❌ Google Client ID not configured!');
      throw new Error('Google Client ID tidak dikonfigurasi. Silakan setup Google Cloud Console terlebih dahulu.');
    }

    // Real Google OAuth only
    const authUrl = createGoogleAuthUrl();
    
    // Redirect to Google OAuth
    window.location.href = authUrl;
  }

  // Handle OAuth callback
  public async handleCallback(code: string): Promise<GoogleUser> {
    try {
      // Exchange authorization code for tokens
      const tokens = await this.exchangeCodeForTokens(code);
      
      // Store tokens
      this.storeTokens(tokens);
      
      // Get user info
      const userInfo = await this.getUserInfo(tokens.access_token);
      
      // Check if user is authorized for private access
      if (!this.isUserAuthorized(userInfo)) {
        console.error('❌ User not authorized for private access:', userInfo.email);
        throw new Error('Akses ditolak. Akun Anda tidak memiliki izin untuk mengakses aplikasi ini.');
      }
      
      this.userInfo = userInfo;
      
      // Save to localStorage
      this.saveTokensToStorage();
      
      return userInfo;
    } catch (error) {
      console.error('❌ Error handling OAuth callback:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        clientId: GOOGLE_CONFIG.clientId?.substring(0, 20) + '...',
        redirectUri: GOOGLE_CONFIG.redirectUri
      });
      throw new Error('Authentication failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  // Exchange authorization code for access tokens
  private async exchangeCodeForTokens(code: string): Promise<GoogleTokens> {
    const clientSecret = import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '';
    
    const requestBody = new URLSearchParams({
      client_id: GOOGLE_CONFIG.clientId,
      client_secret: clientSecret,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: GOOGLE_CONFIG.redirectUri,
    });
    
    const response = await fetch(GOOGLE_CONFIG.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: requestBody,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Token exchange failed:');
      console.error('  - Status:', response.status, response.statusText);
      console.error('  - Error response:', errorText);
      
      // Try to parse error details
      try {
        const errorData = JSON.parse(errorText);
        console.error('  - Parsed error:', errorData);
        throw new Error(`Token exchange failed: ${errorData.error_description || errorData.error || response.statusText}`);
      } catch (parseError) {
        throw new Error(`Token exchange failed: ${response.statusText} - ${errorText}`);
      }
    }

    const tokenData = await response.json();
    
    return tokenData;
  }

  // Get user information from Google
  private async getUserInfo(accessToken: string): Promise<GoogleUser> {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get user info: ${response.statusText}`);
    }

    return await response.json();
  }

  // Store tokens in memory
  private storeTokens(tokens: GoogleTokens): void {
    this.accessToken = tokens.access_token;
    this.refreshToken = tokens.refresh_token || null;
    this.tokenExpiry = Date.now() + (tokens.expires_in * 1000);
  }

  // Save tokens to localStorage
  private saveTokensToStorage(): void {
    const tokenData = {
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
      tokenExpiry: this.tokenExpiry,
      userInfo: this.userInfo,
    };
    
    localStorage.setItem('google_auth_tokens', JSON.stringify(tokenData));
  }

  // Load tokens from localStorage
  private loadTokensFromStorage(): void {
    console.log('📂 Loading tokens from localStorage...');
    
    try {
      const stored = localStorage.getItem('google_auth_tokens');
      if (stored) {
        console.log('📄 Found stored tokens');
        const tokenData = JSON.parse(stored);
        this.accessToken = tokenData.accessToken;
        this.refreshToken = tokenData.refreshToken;
        this.tokenExpiry = tokenData.tokenExpiry;
        this.userInfo = tokenData.userInfo;
        
        console.log('✅ Tokens loaded successfully');
        console.log('👤 User:', this.userInfo?.name);
        console.log('⏰ Token expires at:', new Date(this.tokenExpiry || 0).toLocaleString());
      } else {
        console.log('📭 No stored tokens found');
      }
    } catch (error) {
      console.error('❌ Error loading tokens from storage:', error);
      this.clearTokens();
    }
  }

  // Check if user is authenticated
  public isAuthenticated(): boolean {
    const hasToken = !!(this.accessToken && this.tokenExpiry);
    const notExpired = this.tokenExpiry ? Date.now() < this.tokenExpiry : false;
    const isAuth = hasToken && notExpired;
    
    console.log('🔍 Auth check:', {
      hasToken,
      notExpired,
      isAuthenticated: isAuth,
      user: this.userInfo?.name || 'None'
    });
    
    return isAuth;
  }

  // Get current user info
  public getCurrentUser(): GoogleUser | null {
    return this.userInfo;
  }

  // Get access token for API calls
  public getAccessToken(): string | null {
    if (this.isAuthenticated()) {
      return this.accessToken;
    }
    return null;
  }

  // Refresh access token
  public async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(GOOGLE_CONFIG.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: GOOGLE_CONFIG.clientId,
          client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '',
          refresh_token: this.refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.statusText}`);
      }

      const tokens = await response.json();
      this.accessToken = tokens.access_token;
      this.tokenExpiry = Date.now() + (tokens.expires_in * 1000);
      
      this.saveTokensToStorage();
    } catch (error) {
      console.error('Error refreshing token:', error);
      this.clearTokens();
      throw error;
    }
  }

  // Logout user
  public logout(): void {
    console.log('🚪 Logging out user...');
    this.clearTokens();
    localStorage.removeItem('google_auth_tokens');
    console.log('✅ Logout complete');
  }

  // Clear all tokens and user info
  private clearTokens(): void {
    console.log('🗑️ Clearing tokens and user info...');
    this.accessToken = null;
    this.refreshToken = null;
    this.userInfo = null;
    this.tokenExpiry = null;
  }

  // Get authenticated fetch function for API calls
  public async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    let token = this.getAccessToken();
    
    if (!token) {
      // Try to refresh token
      if (this.refreshToken) {
        await this.refreshAccessToken();
        token = this.getAccessToken();
      }
      
      if (!token) {
        throw new Error('User not authenticated');
      }
    }

    const headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // If token expired, try to refresh and retry
    if (response.status === 401 && this.refreshToken) {
      try {
        await this.refreshAccessToken();
        const newToken = this.getAccessToken();
        
        if (newToken) {
          return await fetch(url, {
            ...options,
            headers: {
              ...options.headers,
              Authorization: `Bearer ${newToken}`,
            },
          });
        }
      } catch (error) {
        console.error('Failed to refresh token:', error);
      }
    }

    return response;
  }

  // Check if user is authorized for private access
  private isUserAuthorized(userInfo: GoogleUser): boolean {
    const email = userInfo.email;
    const emailDomain = email.split('@')[1];
    
    console.log('🔐 Checking authorization for:', email);
    console.log('🔐 Email domain:', emailDomain);
    
    // Check if specific email is in allowed list
    if (GOOGLE_CONFIG.allowedEmails.length > 0) {
      const isEmailAllowed = GOOGLE_CONFIG.allowedEmails.includes(email);
      console.log('🔐 Email whitelist check:', isEmailAllowed);
      if (isEmailAllowed) return true;
    }
    
    // Check if domain is in allowed list
    if (GOOGLE_CONFIG.allowedDomains.length > 0) {
      const isDomainAllowed = GOOGLE_CONFIG.allowedDomains.includes(emailDomain);
      console.log('🔐 Domain whitelist check:', isDomainAllowed);
      if (isDomainAllowed) return true;
    }
    
    // If no restrictions are set, allow all verified emails
    if (GOOGLE_CONFIG.allowedEmails.length === 0 && GOOGLE_CONFIG.allowedDomains.length === 0) {
      console.log('🔐 No restrictions set, allowing verified email');
      return userInfo.verified_email;
    }
    
    // Otherwise, deny access
    console.log('❌ User not authorized');
    return false;
  }
}

export default GoogleAuthService;
