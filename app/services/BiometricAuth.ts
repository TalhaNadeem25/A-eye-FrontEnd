// Biometric Authentication Service using WebAuthn API
export interface BiometricCredential {
  id: string;
  publicKey: string;
  userId: string;
  userHandle: string;
  counter: number;
  createdAt: Date;
  lastUsed: Date;
}

export interface BiometricUser {
  id: string;
  name: string;
  email: string;
  role: 'manager' | 'operator';
  biometricEnabled: boolean;
}

class BiometricAuthService {
  private credentials: BiometricCredential[] = [];
  private users: BiometricUser[] = [
    {
      id: 'bio-001',
      name: 'John Manager',
      email: 'manager@demo.com',
      role: 'manager',
      biometricEnabled: true
    },
    {
      id: 'bio-002', 
      name: 'Sarah Operator',
      email: 'operator@demo.com',
      role: 'operator',
      biometricEnabled: true
    }
  ];

  // Check if WebAuthn is supported
  isSupported(): boolean {
    return typeof window !== 'undefined' && 
           'navigator' in window && 
           'credentials' in navigator &&
           'create' in navigator.credentials &&
           'get' in navigator.credentials;
  }

  // Check if biometric authentication is available
  async isAvailable(): Promise<boolean> {
    if (!this.isSupported()) return false;
    
    try {
      // Check for platform authenticators (Windows Hello, Touch ID, etc.)
      const isWindows = navigator.userAgent.includes('Windows');
      const hasTouchID = navigator.userAgent.includes('Macintosh');
      const hasAndroid = navigator.userAgent.includes('Android');
      
      // Basic platform detection for biometric support
      return isWindows || hasTouchID || hasAndroid;
    } catch (error) {
      console.log('Biometric authentication not available:', error);
      return false;
    }
  }

  // Register a new biometric credential
  async register(userId: string, userName: string): Promise<boolean> {
    if (!this.isSupported()) {
      throw new Error('WebAuthn not supported');
    }

    try {
      // Generate a challenge
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      // Create credential options
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
            authenticatorAttachment: 'platform', // Built-in authenticators (Windows Hello, Touch ID)
            userVerification: 'required',
            residentKey: 'preferred',
          },
          timeout: 60000,
          attestation: 'direct',
        },
      };

      // Create the credential
      const credential = await navigator.credentials.create(credentialOptions) as PublicKeyCredential;
      
      if (credential) {
        // Store the credential
        const credentialData: BiometricCredential = {
          id: credential.id,
          publicKey: 'demo-public-key', // Simplified for demo purposes
          userId: userId,
          userHandle: userName,
          counter: 0,
          createdAt: new Date(),
          lastUsed: new Date(),
        };

        this.credentials.push(credentialData);
        localStorage.setItem('biometric_credentials', JSON.stringify(this.credentials));
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Biometric registration failed:', error);
      return false;
    }
  }

  // Authenticate using biometric credential
  async authenticate(): Promise<BiometricUser | null> {
    if (!this.isSupported()) {
      throw new Error('WebAuthn not supported');
    }

    try {
      // Load stored credentials
      const stored = localStorage.getItem('biometric_credentials');
      if (stored) {
        this.credentials = JSON.parse(stored);
      }

      if (this.credentials.length === 0) {
        return null;
      }

      // Generate challenge
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      // Create assertion options
      const assertionOptions: CredentialRequestOptions = {
        publicKey: {
          challenge: challenge,
          timeout: 60000,
          userVerification: 'required',
          allowCredentials: this.credentials.map(cred => ({
            type: 'public-key',
            id: new TextEncoder().encode(cred.id),
          })),
        },
      };

      // Get the credential
      const credential = await navigator.credentials.get(assertionOptions) as PublicKeyCredential;
      
      if (credential) {
        // Find the matching stored credential
        const storedCredential = this.credentials.find(cred => cred.id === credential.id);
        
        if (storedCredential) {
          // Update last used
          storedCredential.lastUsed = new Date();
          storedCredential.counter++;
          localStorage.setItem('biometric_credentials', JSON.stringify(this.credentials));
          
          // Find the user
          const user = this.users.find(u => u.id === storedCredential.userId);
          return user || null;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return null;
    }
  }

  // Get user by email for registration
  getUserByEmail(email: string): BiometricUser | null {
    return this.users.find(user => user.email === email) || null;
  }

  // Check if user has biometric enabled
  hasBiometricEnabled(email: string): boolean {
    const user = this.getUserByEmail(email);
    return user?.biometricEnabled || false;
  }

  // Enable biometric for user
  enableBiometric(email: string): void {
    const user = this.users.find(u => u.email === email);
    if (user) {
      user.biometricEnabled = true;
    }
  }

  // Get biometric status
  getBiometricStatus(): { supported: boolean; available: boolean; registered: boolean } {
    return {
      supported: this.isSupported(),
      available: false, // Will be set by async check
      registered: this.credentials.length > 0
    };
  }
}

export const biometricAuth = new BiometricAuthService();
