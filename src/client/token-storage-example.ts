class TokenStorageLocalStorage {
    static setToken(token: string) {
      localStorage.setItem('accessToken', token);
    }
  
    static getToken(): string | null {
      return localStorage.getItem('accessToken');
    }
  
    static removeToken() {
      localStorage.removeItem('accessToken');
    }
  
    static isAuthenticated(): boolean {
      return !!this.getToken();
    }
  }
// API client with automatic token handling
class AuthenticatedApiClient {
    private baseURL: string;
    private tokenStorage: any;
  
    constructor(baseURL: string, tokenStorage: any = TokenStorageLocalStorage) {
      this.baseURL = baseURL;
      this.tokenStorage = tokenStorage;
    }
  
    // Login and store token
    async login(email: string, password: string) {
      const response = await fetch(`${this.baseURL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Important for httpOnly cookies
      });
  
      if (response.ok) {
        const data = await response.json();
        this.tokenStorage.setToken(data.accessToken);
        return data;
      } else {
        throw new Error('Login failed');
      }
    }
  
    // Make authenticated request
    async authenticatedRequest(endpoint: string, options: RequestInit = {}) {
      const token = this.tokenStorage.getToken();
      
      if (!token) {
        throw new Error('No authentication token available');
      }
  
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers,
        },
      });
  
      // Handle token expiry
      if (response.status === 401) {
        const errorData = await response.json();
        if (errorData.message === 'Token expired') {
          this.tokenStorage.removeToken();
          // Redirect to login or trigger re-authentication
          throw new Error('Token expired. Please login again.');
        }
      }
  
      return response;
    }
  
    // Get protected profile
    async getProfile() {
      const response = await this.authenticatedRequest('/api/protected/profile');
      return response.json();
    }
  
    // Verify token
    async verifyToken() {
      const token = this.tokenStorage.getToken();
      if (!token) return null;
  
      const response = await fetch(`${this.baseURL}/api/auth/internal/verify-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });
  
      if (response.ok) {
        return response.json();
      } else {
        this.tokenStorage.removeToken();
        return null;
      }
    }
  
    // Logout
    async logout() {
      try {
        await fetch(`${this.baseURL}/api/auth/logout`, {
          method: 'POST',
          credentials: 'include', // Important for httpOnly cookies
        });
      } finally {
        this.tokenStorage.removeToken();
      }
    }
  
    // Check if authenticated
    isAuthenticated() {
      return this.tokenStorage.isAuthenticated();
    }
  }
  
  // Usage Example:
  
  // Initialize the API client
  const apiClient = new AuthenticatedApiClient('http://localhost:4000', TokenStorageLocalStorage);
  
  // Example login
  async function exampleLogin() {
    try {
      const result = await apiClient.login('user@example.com', 'password123');
      console.log('Login successful:', result);
      
      // Token is now stored and can be used for authenticated requests
    } catch (error) {
      console.error('Login failed:', error);
    }
  }
  
  // Example authenticated request
  async function exampleProtectedRequest() {
    try {
      const profile = await apiClient.getProfile();
      console.log('User profile:', profile);
    } catch (error) {
      console.error('Protected request failed:', error);
    }
  }
  
  // Example token verification
  async function exampleVerifyToken() {
    const verification = await apiClient.verifyToken();
    if (verification) {
      console.log('Token is valid:', verification);
    } else {
      console.log('Token is invalid or expired');
    }
  }
  
  // Example logout
  async function exampleLogout() {
    await apiClient.logout();
    console.log('Logged out successfully');
  }
  
  export {
    TokenStorageLocalStorage,
    //TokenStorageSessionStorage,
    //TokenStorageMemory,
    AuthenticatedApiClient,
    apiClient,
    exampleLogin,
    exampleProtectedRequest,
    exampleVerifyToken,
    exampleLogout
  };