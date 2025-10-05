# 🚀 Production Auth0 Configuration Guide

## 🎯 **Auth0 Production Setup**

You need to update your Auth0 configuration for production deployment. Here's the complete setup guide:

### **✅ Step 1: Update Environment Variables**

Create a `.env.local` file with your production settings:

```bash
# Production Auth0 Configuration
AUTH0_SECRET='your-32-character-secret-key'
AUTH0_BASE_URL='https://yourdomain.com'
AUTH0_ISSUER_BASE_URL='https://dev-lff8lsy17l7njekf.us.auth0.com'
AUTH0_CLIENT_ID='cIABDPcYiagEVK3TD2nP7OBUu8MwhJPx'
AUTH0_CLIENT_SECRET='your-client-secret'

# Optional: Auth0 Management API
AUTH0_MANAGEMENT_CLIENT_ID='your-management-client-id'
AUTH0_MANAGEMENT_CLIENT_SECRET='your-management-client-secret'
AUTH0_MANAGEMENT_AUDIENCE='https://dev-lff8lsy17l7njekf.us.auth0.com/api/v2/'
```

### **🔧 Step 2: Update Auth0 Dashboard Settings**

#### **Go to Auth0 Dashboard → Applications → Your App → Settings**

#### **Update Allowed URLs:**

1. **Allowed Callback URLs:**
   ```
   https://yourdomain.com/api/auth/callback
   http://localhost:3000/api/auth/callback
   ```

2. **Allowed Logout URLs:**
   ```
   https://yourdomain.com
   http://localhost:3000
   ```

3. **Allowed Web Origins:**
   ```
   https://yourdomain.com
   http://localhost:3000
   ```

4. **Allowed Origins (CORS):**
   ```
   https://yourdomain.com
   http://localhost:3000
   ```

### **🌐 Step 3: Domain-Specific Configuration**

#### **For Different Domains:**

**If deploying to Vercel:**
```bash
AUTH0_BASE_URL='https://your-app.vercel.app'
```

**If deploying to Netlify:**
```bash
AUTH0_BASE_URL='https://your-app.netlify.app'
```

**If using custom domain:**
```bash
AUTH0_BASE_URL='https://yourdomain.com'
```

### **🔐 Step 4: Generate Production Secret**

Generate a secure secret for production:

```bash
# Generate a 32-character secret
openssl rand -hex 32
```

Or use an online generator and update your `AUTH0_SECRET`.

### **📱 Step 5: Update Next.js Configuration**

Update your `next.config.js` for production:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production configuration
  env: {
    AUTH0_BASE_URL: process.env.AUTH0_BASE_URL,
    AUTH0_ISSUER_BASE_URL: process.env.AUTH0_ISSUER_BASE_URL,
    AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
    AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET,
  },
  // Other configurations...
}

module.exports = nextConfig
```

### **🚀 Step 6: Deployment Checklist**

#### **Before Deploying:**

1. **✅ Update all URLs** in Auth0 dashboard
2. **✅ Set production environment variables**
3. **✅ Generate secure AUTH0_SECRET**
4. **✅ Test authentication locally** with production URLs
5. **✅ Verify all callback URLs** are correct

#### **After Deploying:**

1. **✅ Test login** on production domain
2. **✅ Test logout** functionality
3. **✅ Test passwordless authentication**
4. **✅ Verify role-based access** works
5. **✅ Check console** for any errors

### **🔧 Common Production Issues:**

#### **Issue 1: "Auth0 configuration missing"**
- **Solution**: Check environment variables are set correctly
- **Check**: `AUTH0_BASE_URL` matches your domain

#### **Issue 2: "Invalid redirect URI"**
- **Solution**: Add production URL to Auth0 dashboard
- **Check**: Allowed Callback URLs include your domain

#### **Issue 3: "CORS error"**
- **Solution**: Add domain to Allowed Web Origins
- **Check**: Allowed Origins (CORS) includes your domain

### **📱 Testing Production Auth:**

#### **1. Test Login:**
- Visit: `https://yourdomain.com/login`
- Click "Passwordless Email Login"
- Should redirect to Auth0 with correct domain

#### **2. Test Signup:**
- Visit: `https://yourdomain.com/signup`
- Click "Passwordless Email Signup"
- Should work with production domain

#### **3. Test Dashboard:**
- After login, should redirect to dashboard
- Role-based features should work
- No console errors

### **🎯 Quick Fix for Your Current Issue:**

#### **Immediate Steps:**

1. **Update Auth0 Dashboard:**
   - Go to Applications → Your App → Settings
   - Add your production domain to all URL fields
   - Save changes

2. **Update Environment Variables:**
   - Set `AUTH0_BASE_URL` to your production domain
   - Ensure all Auth0 credentials are correct

3. **Redeploy:**
   - Deploy with updated environment variables
   - Test authentication on production domain

### **📁 Files to Update:**

- `.env.local` - Production environment variables
- `next.config.js` - Production configuration
- **Auth0 Dashboard** - Production URLs

**Your Auth0 configuration should work in production after these updates!** 🎉🚀✨
