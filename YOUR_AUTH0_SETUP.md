# Your Auth0 Setup Guide

## 🎯 **Your Auth0 Credentials**
- **Domain**: `dev-lff8lsy17l7njekf.us.auth0.com`
- **Client ID**: `cIABDPcYiagEVK3TD2nP7OBUu8MwhJPx`
- **Client Secret**: `4pTRplzsvTAkLCY-V0_TNzLSMsVA-rjL8i9ZDeWJDgqdOAAzraPVLPk48t_igv81`

## 🚀 **Step 1: Create Environment File**

Create a file named `.env.local` in your project root with this content:

```bash
# Auth0 Configuration
AUTH0_SECRET='a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6'
AUTH0_BASE_URL='http://localhost:3000'
AUTH0_ISSUER_BASE_URL='https://dev-lff8lsy17l7njekf.us.auth0.com'
AUTH0_CLIENT_ID='cIABDPcYiagEVK3TD2nP7OBUu8MwhJPx'
AUTH0_CLIENT_SECRET='4pTRplzsvTAkLCY-V0_TNzLSMsVA-rjL8i9ZDeWJDgqdOAAzraPVLPk48t_igv81'

# Optional: Auth0 Management API (for user management features)
AUTH0_MANAGEMENT_CLIENT_ID='YOUR_MANAGEMENT_CLIENT_ID'
AUTH0_MANAGEMENT_CLIENT_SECRET='YOUR_MANAGEMENT_CLIENT_SECRET'
AUTH0_MANAGEMENT_AUDIENCE='https://dev-lff8lsy17l7njekf.us.auth0.com/api/v2/'

# Optional: Database connection
AUTH0_DATABASE='Username-Password-Authentication'
```

## 🔧 **Step 2: Configure Auth0 Dashboard**

### **Application Settings:**
1. Go to [Auth0 Dashboard](https://manage.auth0.com)
2. Navigate to **Applications** > **Your App**
3. Go to **Settings** tab
4. Update these URLs:

**Allowed Callback URLs:**
```
http://localhost:3000/api/auth/callback
```

**Allowed Logout URLs:**
```
http://localhost:3000
```

**Allowed Web Origins:**
```
http://localhost:3000
```

### **Social Connections (Optional):**
1. Go to **Authentication** > **Social**
2. Enable **Google** (if you want Google login)
3. Enable **Facebook** (if you want Facebook login)
4. Enable **GitHub** (if you want GitHub login)

### **Database Connection:**
1. Go to **Authentication** > **Database**
2. Ensure **Username-Password-Authentication** is enabled

## 🎮 **Step 3: Test Your Integration**

### **Start Your App:**
```bash
npm run dev
```

### **Test Login:**
1. Go to: `http://localhost:3000/login/auth0`
2. Click **"Auth0 Universal Login"**
3. You should be redirected to your Auth0 login page
4. Create a test account or use existing credentials

### **Test User Management (Optional):**
1. Login as a user
2. Go to: `http://localhost:3000/admin/users`
3. You'll need to set up Management API for this to work

## 🔐 **Step 4: Set Up User Roles (Optional)**

### **Create Roles in Auth0:**
1. Go to **User Management** > **Roles**
2. Create role: `manager`
3. Create role: `operator`

### **Assign Roles to Users:**
1. Go to **User Management** > **Users**
2. Click on a user
3. Go to **Roles** tab
4. Assign `manager` or `operator` role

## 🚨 **Important Security Notes**

### **Environment Variables:**
- Keep your `.env.local` file secure
- Never commit it to version control
- The file is already in `.gitignore`

### **Production Setup:**
- Update `AUTH0_BASE_URL` to your production domain
- Configure production callback URLs in Auth0 Dashboard
- Use HTTPS in production

## 🎯 **What You Can Do Now**

### **✅ Authentication Features:**
- **Auth0 Universal Login** - Professional hosted login
- **Social Login** - Google, Facebook, GitHub (if enabled)
- **Email/Password** - Traditional authentication
- **Role-based Access** - Manager vs Operator permissions

### **✅ User Management (if Management API is set up):**
- **View all users** from Auth0
- **Create new users** with roles
- **Update user information**
- **Block/unblock users**
- **Delete users**

## 🔧 **Troubleshooting**

### **Common Issues:**
1. **"Invalid callback URL"** - Check your Auth0 Dashboard settings
2. **"Social login not working"** - Enable social connections in Auth0
3. **"User management not working"** - Set up Management API credentials

### **Debug Steps:**
1. Check Auth0 Dashboard logs
2. Verify callback URLs match exactly
3. Ensure social connections are enabled
4. Check user roles and permissions

## 🎉 **You're Ready!**

Your Auth0 integration is now configured with your credentials! 

**Next Steps:**
1. Create the `.env.local` file with the content above
2. Configure your Auth0 Dashboard settings
3. Test the login functionality
4. Set up user roles if needed

Your surveillance dashboard now has enterprise-grade authentication! 🔐✨
