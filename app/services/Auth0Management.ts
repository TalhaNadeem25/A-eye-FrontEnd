// Auth0 Management API Service
export interface Auth0User {
  user_id: string;
  email: string;
  name: string;
  picture?: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
  logins_count: number;
  blocked: boolean;
  email_verified: boolean;
  app_metadata?: {
    roles?: string[];
  };
  user_metadata?: {
    [key: string]: any;
  };
}

export interface Auth0UserList {
  users: Auth0User[];
  total: number;
  start: number;
  limit: number;
}

class Auth0ManagementService {
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  // Get access token for Management API
  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await fetch('/api/auth0/management-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get management token');
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // 1 minute buffer

      return this.accessToken;
    } catch (error) {
      console.error('Error getting Auth0 management token:', error);
      throw error;
    }
  }

  // Get all users
  async getUsers(page: number = 0, perPage: number = 50): Promise<Auth0UserList> {
    try {
      const token = await this.getAccessToken();
      const start = page * perPage;

      const response = await fetch(
        `${process.env.AUTH0_ISSUER_BASE_URL}/api/v2/users?page=${page}&per_page=${perPage}&include_totals=true`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  // Get user by ID
  async getUser(userId: string): Promise<Auth0User> {
    try {
      const token = await this.getAccessToken();

      const response = await fetch(
        `${process.env.AUTH0_ISSUER_BASE_URL}/api/v2/users/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch user: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  // Update user
  async updateUser(userId: string, updates: Partial<Auth0User>): Promise<Auth0User> {
    try {
      const token = await this.getAccessToken();

      const response = await fetch(
        `${process.env.AUTH0_ISSUER_BASE_URL}/api/v2/users/${userId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update user: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Create user
  async createUser(userData: {
    email: string;
    password: string;
    name: string;
    app_metadata?: {
      roles?: string[];
    };
  }): Promise<Auth0User> {
    try {
      const token = await this.getAccessToken();

      const response = await fetch(
        `${process.env.AUTH0_ISSUER_BASE_URL}/api/v2/users`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            connection: process.env.AUTH0_DATABASE || 'Username-Password-Authentication',
            email: userData.email,
            password: userData.password,
            name: userData.name,
            app_metadata: userData.app_metadata,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to create user: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Delete user
  async deleteUser(userId: string): Promise<void> {
    try {
      const token = await this.getAccessToken();

      const response = await fetch(
        `${process.env.AUTH0_ISSUER_BASE_URL}/api/v2/users/${userId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete user: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Block/Unblock user
  async blockUser(userId: string, blocked: boolean): Promise<Auth0User> {
    return this.updateUser(userId, { blocked });
  }

  // Update user roles
  async updateUserRoles(userId: string, roles: string[]): Promise<Auth0User> {
    return this.updateUser(userId, {
      app_metadata: {
        roles: roles,
      },
    });
  }

  // Get user sessions (if available)
  async getUserSessions(userId: string): Promise<any[]> {
    try {
      const token = await this.getAccessToken();

      const response = await fetch(
        `${process.env.AUTH0_ISSUER_BASE_URL}/api/v2/users/${userId}/sessions`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch user sessions: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user sessions:', error);
      throw error;
    }
  }
}

export const auth0Management = new Auth0ManagementService();
