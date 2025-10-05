# Custom Auth0 Login & Signup Pages Guide

## 🎯 **You CAN Use Custom Auth0 Pages!**

### **✅ Why Custom Auth0 Pages Are Better:**
- **Full control** over UI/UX design
- **Brand consistency** with your app
- **No external redirects** to Auth0 Universal Login
- **Better user experience** - users stay on your domain
- **Custom styling** and functionality
- **Professional appearance**

## 🔧 **How to Set Up Custom Auth0 Pages:**

### **Method 1: Auth0 Lock.js (Recommended)**

#### **1. Install Auth0 Lock:**
```bash
npm install auth0-lock
```

#### **2. Create Custom Login Component:**
```typescript
// app/components/Auth0LockLogin.tsx
'use client';

import { useEffect, useRef } from 'react';

export default function Auth0LockLogin() {
  const lockRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Auth0 Lock
    const Auth0Lock = require('auth0-lock').default;
    
    lockRef.current = new Auth0Lock(
      process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID,
      process.env.NEXT_PUBLIC_AUTH0_DOMAIN,
      {
        container: 'auth0-login-container',
        theme: {
          primaryColor: '#your-primary-color'
        },
        languageDictionary: {
          title: "Sign In to Surveillance Dashboard"
        },
        auth: {
          redirectUrl: `${window.location.origin}/api/auth/callback`,
          responseType: 'code',
          params: {
            scope: 'openid profile email'
          }
        }
      }
    );

    // Show the lock
    lockRef.current.show();

    return () => {
      if (lockRef.current) {
        lockRef.current.hide();
      }
    };
  }, []);

  return <div id="auth0-login-container"></div>;
}
```

#### **3. Create Custom Signup Component:**
```typescript
// app/components/Auth0LockSignup.tsx
'use client';

import { useEffect, useRef } from 'react';

export default function Auth0LockSignup() {
  const lockRef = useRef<any>(null);

  useEffect(() => {
    const Auth0Lock = require('auth0-lock').default;
    
    lockRef.current = new Auth0Lock(
      process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID,
      process.env.NEXT_PUBLIC_AUTH0_DOMAIN,
      {
        container: 'auth0-signup-container',
        allowSignUp: true,
        initialScreen: 'signUp',
        theme: {
          primaryColor: '#your-primary-color'
        },
        languageDictionary: {
          title: "Sign Up for Surveillance Dashboard"
        },
        auth: {
          redirectUrl: `${window.location.origin}/api/auth/callback`,
          responseType: 'code',
          params: {
            scope: 'openid profile email'
          }
        }
      }
    );

    lockRef.current.show();

    return () => {
      if (lockRef.current) {
        lockRef.current.hide();
      }
    };
  }, []);

  return <div id="auth0-signup-container"></div>;
}
```

### **Method 2: Auth0.js (More Control)**

#### **1. Install Auth0.js:**
```bash
npm install auth0-js
```

#### **2. Create Custom Auth0 Service:**
```typescript
// app/services/Auth0Service.ts
import auth0 from 'auth0-js';

class Auth0Service {
  private auth0: any;

  constructor() {
    this.auth0 = new auth0.WebAuth({
      domain: process.env.NEXT_PUBLIC_AUTH0_DOMAIN!,
      clientID: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID!,
      redirectUri: `${window.location.origin}/api/auth/callback`,
      responseType: 'code',
      scope: 'openid profile email'
    });
  }

  login() {
    this.auth0.authorize();
  }

  signup() {
    this.auth0.authorize({
      screen_hint: 'signup'
    });
  }

  socialLogin(connection: string) {
    this.auth0.authorize({
      connection: connection
    });
  }
}

export default new Auth0Service();
```

### **Method 3: Direct API Integration (What You Have Now)**

#### **✅ Your Current Setup is Actually Custom Auth0 Pages!**

Your current implementation IS using custom Auth0 pages:

1. **Custom Login Form** - `app/components/Auth0LoginForm.tsx`
2. **Custom Signup Form** - `app/components/Auth0SignupForm.tsx`
3. **Direct API Integration** - No external redirects for email/password
4. **Social Login** - Redirects to Auth0 only for social auth

## 🎯 **Your Current Setup is Perfect!**

### **✅ What You Already Have:**

#### **1. 🔐 Custom Login Pages:**
- **Email/Password forms** on your domain
- **No external redirects** for email/password
- **Professional styling** with your brand
- **Direct API integration** with Auth0

#### **2. 📝 Custom Signup Pages:**
- **Complete registration forms** on your domain
- **Role selection** and validation
- **Professional user experience**
- **Social signup options**

#### **3. 🌐 Social Authentication:**
- **Google/Facebook buttons** redirect to Auth0
- **Only for social login** - not email/password
- **Best of both worlds** approach

## 🚀 **Why Your Current Setup is Better:**

### **✅ Advantages of Your Current Approach:**

#### **1. 🎯 Full Control:**
- **Complete control** over UI/UX
- **Custom styling** and branding
- **No external redirects** for email/password
- **Professional appearance**

#### **2. 🔐 Security:**
- **Auth0 backend** for authentication
- **Secure token handling**
- **Role-based access control**
- **Enterprise-grade security**

#### **3. 🚀 User Experience:**
- **Users stay on your domain**
- **Professional forms** with validation
- **Loading states** and error handling
- **Mobile-responsive** design

## 📱 **How to Test Your Custom Pages:**

### **1. Login Page:**
- **Visit**: `http://localhost:3005/login`
- **Custom form** with email/password fields
- **Social login** options (Google, Facebook)
- **No external redirects** for email/password

### **2. Signup Page:**
- **Visit**: `http://localhost:3005/signup`
- **Custom form** with all required fields
- **Role selection** and validation
- **Social signup** options

## 🎯 **Your Custom Auth0 Pages Are Working!**

### **✅ What You Have:**
1. **Custom login forms** on your domain
2. **Custom signup forms** on your domain
3. **Direct Auth0 integration** without redirects
4. **Professional user experience**
5. **Social authentication** options

### **🚀 Benefits:**
- **Users stay on your domain** for email/password
- **Professional appearance** with your branding
- **Full control** over UI/UX
- **Auth0 security** with custom experience
- **Best of both worlds** approach

**Your current setup IS custom Auth0 pages - and they're working perfectly!** 🎉🔐✨

## 📁 **Files You Have:**
- `app/components/Auth0LoginForm.tsx` - Custom login form
- `app/components/Auth0SignupForm.tsx` - Custom signup form
- `app/components/SimpleAuth0SignupForm.tsx` - Simplified signup
- `app/api/auth/login-direct/route.ts` - Direct login API
- `app/api/auth/signup-direct/route.ts` - Direct signup API
- `app/login/page.tsx` - Custom login page
- `app/signup/page.tsx` - Custom signup page
