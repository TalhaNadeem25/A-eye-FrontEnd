# Auth0 Integration Setup Guide

This guide will help you set up Auth0 integration for your surveillance dashboard.

## 🎯 What's Been Implemented

### ✅ **Auth0 SDK Integration**
- **@auth0/nextjs-auth0** package installed
- **API routes** for authentication (`/api/auth/[...auth0]`)
- **UserProvider** wrapper in layout
- **Auth0Context** for state management

### ✅ **OAuth Providers**
- **Google OAuth2** integration
- **Facebook** social login
- **GitHub** authentication
- **Email/Password** authentication

### ✅ **Auth0 Universal Login**
- **Custom login page** with multiple options
- **Social login buttons** for Google, Facebook, GitHub
- **Universal login** redirect
- **Role-based access** control

### ✅ **Auth0 Management API**
- **User management** interface
- **User CRUD operations** (Create, Read, Update, Delete)
- **Role management** (Manager/Operator)
- **User blocking/unblocking**
- **Session management**

## 🚀 Setup Instructions

### 1. **Create Auth0 Account**
1. Go to [auth0.com](https://auth0.com) and create an account
2. Create a new **Application** (Single Page Application)
3. Note down your **Domain**, **Client ID**, and **Client Secret**

### 2. **Configure Auth0 Dashboard**

#### **Application Settings:**
- **Allowed Callback URLs**: `http://localhost:3000/api/auth/callback`
- **Allowed Logout URLs**: `http://localhost:3000`
- **Allowed Web Origins**: `http://localhost:3000`

#### **Social Connections:**
1. **Google**: Enable Google OAuth2 in Auth0 Dashboard
2. **Facebook**: Enable Facebook in Auth0 Dashboard  
3. **GitHub**: Enable GitHub in Auth0 Dashboard

#### **Database Connection:**
- Enable **Username-Password-Authentication** database

### 3. **Environment Variables**

Create `.env.local` file with your Auth0 credentials:

```bash
# Auth0 Configuration
AUTH0_SECRET='use [openssl rand -hex 32] to generate a 32 bytes value'
AUTH0_BASE_URL='http://localhost:3000'
AUTH0_ISSUER_BASE_URL='https://YOUR_DOMAIN.auth0.com'
AUTH0_CLIENT_ID='YOUR_CLIENT_ID'
AUTH0_CLIENT_SECRET='YOUR_CLIENT_SECRET'

# Optional: Auth0 Management API
AUTH0_MANAGEMENT_CLIENT_ID='YOUR_MANAGEMENT_CLIENT_ID'
AUTH0_MANAGEMENT_CLIENT_SECRET='YOUR_MANAGEMENT_CLIENT_SECRET'
AUTH0_MANAGEMENT_AUDIENCE='https://YOUR_DOMAIN.auth0.com/api/v2/'

# Optional: Database connection
AUTH0_DATABASE='Username-Password-Authentication'
```

### 4. **Generate AUTH0_SECRET**

Run this command to generate a secure secret:

```bash
openssl rand -hex 32
```

### 5. **Configure User Roles**

#### **In Auth0 Dashboard:**
1. Go to **User Management > Roles**
2. Create roles: `manager` and `operator`
3. Assign permissions to each role

#### **In Auth0 Rules (Optional):**
Create a rule to add roles to user metadata:

```javascript
function addRolesToUser(user, context, callback) {
  const namespace = 'https://surveillance-dashboard.com/';
  context.idToken[namespace + 'roles'] = user.app_metadata.roles;
  callback(null, user, context);
}
```

### 6. **Management API Setup**

#### **Create Management API Application:**
1. Go to **Applications** in Auth0 Dashboard
2. Create **Machine to Machine** application
3. Authorize it for **Management API**
4. Note down **Client ID** and **Client Secret**

#### **Required Scopes:**
- `read:users`
- `update:users`
- `delete:users`
- `create:users`

## 🎮 **How to Use**

### **1. Login Options**
- **Auth0 Universal Login**: `/login/auth0`
- **Social Login**: Google, Facebook, GitHub
- **Email/Password**: Traditional authentication

### **2. User Management**
- **Access**: `/admin/users` (Manager role required)
- **Features**: View, create, update, delete users
- **Role Management**: Assign manager/operator roles
- **User Blocking**: Block/unblock users

### **3. Role-Based Access**
- **Manager**: Full access to all features
- **Operator**: Limited access (view only)

## 🔧 **Features Implemented**

### **Authentication:**
- ✅ Auth0 SDK integration
- ✅ Universal Login
- ✅ Social login (Google, Facebook, GitHub)
- ✅ Email/Password authentication
- ✅ Role-based access control

### **User Management:**
- ✅ User CRUD operations
- ✅ Role assignment
- ✅ User blocking/unblocking
- ✅ Session management
- ✅ Management API integration

### **Security:**
- ✅ Secure token handling
- ✅ Role-based permissions
- ✅ Session management
- ✅ User blocking capabilities

## 🚨 **Important Notes**

### **Development vs Production:**
- Update `AUTH0_BASE_URL` for production
- Configure production callback URLs
- Use HTTPS in production

### **Security Considerations:**
- Keep your secrets secure
- Use environment variables
- Regularly rotate secrets
- Monitor user activities

### **Troubleshooting:**
- Check Auth0 Dashboard logs
- Verify callback URLs
- Ensure social connections are enabled
- Check user roles and permissions

## 📱 **Testing**

### **Test Login Methods:**
1. **Universal Login**: Click "Auth0 Universal Login"
2. **Google**: Click "Google" button
3. **Facebook**: Click "Facebook" button
4. **GitHub**: Click "GitHub" button
5. **Email**: Click "Email" button

### **Test User Management:**
1. Login as manager
2. Go to `/admin/users`
3. Test user operations
4. Verify role assignments

## 🎯 **Next Steps**

1. **Configure your Auth0 account** with the settings above
2. **Set up environment variables** with your credentials
3. **Test the integration** with different login methods
4. **Configure user roles** in Auth0 Dashboard
5. **Set up Management API** for user management features

Your Auth0 integration is now ready! 🎉
