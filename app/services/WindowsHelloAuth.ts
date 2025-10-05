// Windows Hello Authentication Service using WebAuthn API
export interface WindowsHelloUser {
  id: string;
  name: string;
  email: string;
  role: 'manager' | 'operator';
  credentialId: string;
  publicKey: string;
  createdAt: Date;
  lastUsed: Date;
}

class WindowsHelloAuthService {
  private users: WindowsHelloUser[] = [
    {
      id: 'wh-001',
      name: 'John Manager',
      email: 'manager@demo.com',
      role: 'manager',
      credentialId: '',
      publicKey: '',
      createdAt: new Date(),
      lastUsed: new Date()
    },
    {
      id: 'wh-002',
      name: 'Sarah Operator', 
      email: 'operator@demo.com',
      role: 'operator',
      credentialId: '',
      publicKey: '',
      createdAt: new Date(),
      lastUsed: new Date()
    }
  ];

  // Check if Windows Hello is supported
  isSupported(): boolean {
    return typeof window !== 'undefined' && 
           'navigator' in window && 
           'credentials' in navigator &&
           'create' in navigator.credentials &&
           'get' in navigator.credentials;
  }

  // Check if Windows Hello is available
  async isAvailable(): Promise<boolean> {
    if (!this.isSupported()) return false;
    
    try {
      // Check for Windows Hello specifically
      const isWindows = navigator.userAgent.includes('Windows');
      if (!isWindows) return false;
      
      // For demo purposes, assume Windows Hello is available on Windows
      // In a real app, you'd check for actual Windows Hello configuration
      return true;
    } catch (error) {
      console.log('Windows Hello not available:', error);
      return false;
    }
  }

  // Register Windows Hello credential
  async register(userId: string, userName: string): Promise<boolean> {
    if (!this.isSupported()) {
      throw new Error('WebAuthn not supported');
    }

    try {
      // Generate challenge
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      // Create credential options for Windows Hello
      const credentialOptions: CredentialCreationOptions = {
        publicKey: {
          challenge: challenge,
          rp: {
            name: 'Surveillance Dashboard',
            id: window.location.hostname,
          },
          user: {
            id: new TextEncoder().encode(userId),
            name: userName,
            displayName: userName,
          },
          pubKeyCredParams: [
            { type: 'public-key', alg: -7 }, // ES256
            { type: 'public-key', alg: -257 }, // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform', // Windows Hello
            userVerification: 'required',
            residentKey: 'preferred',
          },
          timeout: 60000,
          attestation: 'direct',
        },
      };

      // Create the credential using Windows Hello
      const credential = await navigator.credentials.create(credentialOptions) as PublicKeyCredential;
      
      if (credential) {
        // Store the credential
        const user = this.users.find(u => u.id === userId);
        if (user) {
          user.credentialId = credential.id;
          user.publicKey = 'demo-public-key'; // Simplified for demo purposes
          user.lastUsed = new Date();
        }
        
        // Save to localStorage
        localStorage.setItem('windows_hello_users', JSON.stringify(this.users));
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Windows Hello registration failed:', error);
      return false;
    }
  }

  // Authenticate using Windows Hello
  async authenticate(): Promise<WindowsHelloUser | null> {
    if (!this.isSupported()) {
      throw new Error('WebAuthn not supported');
    }

    try {
      // Load stored users
      const stored = localStorage.getItem('windows_hello_users');
      if (stored) {
        this.users = JSON.parse(stored);
      }

      // Generate challenge
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      // Create assertion options for Windows Hello
      const assertionOptions: CredentialRequestOptions = {
        publicKey: {
          challenge: challenge,
          timeout: 60000,
          userVerification: 'required',
          // Force platform authenticator (Windows Hello)
          allowCredentials: [],
          // Remove mediation to force direct Windows Hello
        },
      };

      // Get the credential using Windows Hello
      const credential = await navigator.credentials.get(assertionOptions) as PublicKeyCredential;
      
      if (credential) {
        // For demo purposes, return a mock user if authentication succeeds
        // In a real app, you'd verify the credential against your server
        const mockUser: WindowsHelloUser = {
          id: 'wh-demo',
          name: 'Windows Hello User',
          email: 'windows@demo.com',
          role: 'manager',
          credentialId: credential.id,
          publicKey: 'demo-key',
          createdAt: new Date(),
          lastUsed: new Date()
        };
        
        // Store the credential for future use
        this.users.push(mockUser);
        localStorage.setItem('windows_hello_users', JSON.stringify(this.users));
        
        return mockUser;
      }
      
      return null;
    } catch (error) {
      console.error('Windows Hello authentication failed:', error);
      throw error; // Re-throw to show proper error message
    }
  }

  // Get user by email
  getUserByEmail(email: string): WindowsHelloUser | null {
    return this.users.find(user => user.email === email) || null;
  }

  // Check if user has Windows Hello enabled
  hasWindowsHelloEnabled(email: string): boolean {
    const user = this.getUserByEmail(email);
    return user?.credentialId ? true : false;
  }

  // Get Windows Hello status
  getStatus(): { supported: boolean; available: boolean; registered: boolean } {
    const registered = this.users.some(user => user.credentialId);
    return {
      supported: this.isSupported(),
      available: false, // Will be set by async check
      registered: registered
    };
  }

  // Simulate Windows Hello prompt (for demo purposes)
  async simulateWindowsHelloPrompt(): Promise<WindowsHelloUser | null> {
    // This simulates the Windows Hello prompt
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate 90% success rate
        if (Math.random() > 0.1) {
          // Return a mock user
          const mockUser: WindowsHelloUser = {
            id: 'wh-demo',
            name: 'Windows Hello User',
            email: 'windows@demo.com',
            role: 'manager',
            credentialId: 'demo-credential',
            publicKey: 'demo-key',
            createdAt: new Date(),
            lastUsed: new Date()
          };
          resolve(mockUser);
        } else {
          resolve(null);
        }
      }, 2000);
    });
  }

  // Alternative method to trigger Windows Hello directly
  async authenticateWithWindowsHello(): Promise<WindowsHelloUser | null> {
    try {
      // Try a simpler approach that should trigger Windows Hello directly
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: challenge,
          timeout: 30000,
          userVerification: 'required',
        }
      }) as PublicKeyCredential;

      if (credential) {
        const mockUser: WindowsHelloUser = {
          id: 'wh-demo',
          name: 'Windows Hello User',
          email: 'windows@demo.com',
          role: 'manager',
          credentialId: credential.id,
          publicKey: 'demo-key',
          createdAt: new Date(),
          lastUsed: new Date()
        };
        
        return mockUser;
      }
      
      return null;
    } catch (error) {
      console.error('Windows Hello authentication failed:', error);
      return null;
    }
  }
}

export const windowsHelloAuth = new WindowsHelloAuthService();
