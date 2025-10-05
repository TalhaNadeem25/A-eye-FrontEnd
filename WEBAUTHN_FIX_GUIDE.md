# 🔧 WebAuthn Configuration Fix

## 🚨 **Issue: `invalid_request` Error**

The biometric login is failing because the WebAuthn connection isn't configured in your Auth0 dashboard yet.

### **✅ Quick Fix Steps:**

#### **Step 1: Enable WebAuthn in Auth0 Dashboard**

1. **Go to Auth0 Dashboard**: https://manage.auth0.com
2. **Navigate to**: Authentication → Passwordless
3. **Click "Create Connection"** or find existing WebAuthn
4. **Select "WebAuthn"** as connection type
5. **Configure settings:**
   - **Name**: `webauthn` (exactly this name)
   - **Relying Party Name**: `Surveillance Dashboard`
   - **Relying Party ID**: `localhost` (for development)
   - **Attestation**: `Direct`
   - **User Verification**: `Required`

#### **Step 2: Enable WebAuthn for Your Application**

1. **Go to**: Applications → Your App → Connections
2. **Find "WebAuthn"** connection
3. **Toggle it ON** for your application
4. **Save changes**

#### **Step 3: Update Application Settings**

1. **Go to**: Applications → Your App → Settings
2. **Add to Allowed Callback URLs:**
   ```
   http://localhost:3005/api/auth/callback
   ```
3. **Add to Allowed Logout URLs:**
   ```
   http://localhost:3005
   ```
4. **Add to Allowed Web Origins:**
   ```
   http://localhost:3005
   ```

### **🔧 Alternative: Use Passwordless Connection**

If WebAuthn setup is complex, you can use Auth0's built-in passwordless authentication:

#### **Option 1: Magic Link (Email)**
```typescript
// In your biometric login function, change to:
window.location.href = `/api/auth/[...auth0]?action=login&connection=email`;
```

#### **Option 2: SMS**
```typescript
// For SMS authentication:
window.location.href = `/api/auth/[...auth0]?action=login&connection=sms`;
```

### **🚀 Updated Biometric Login (Fallback)**

Let me update your biometric login to handle the configuration better:
