# 📧 Email Passwordless Authentication Setup

## 🎯 **Configure Email Passwordless in Auth0**

Based on your Auth0 dashboard, you have **SMS** and **Email** passwordless connections available. Let's configure the Email connection for passwordless authentication.

### **✅ Step-by-Step Setup:**

#### **Step 1: Configure Email Connection**

1. **Go to Auth0 Dashboard** → Authentication → Passwordless
2. **Click "Configure"** next to the **Email** option
3. **Configure Email Settings:**
   - **From Name**: `Surveillance Dashboard`
   - **From Email**: Use Auth0's email service or your SMTP
   - **Subject**: `Your magic link for Surveillance Dashboard`
   - **Template**: Customize the email template

#### **Step 2: Enable Email Connection for Your App**

1. **Go to**: Applications → Your App → Connections
2. **Find "Email"** in the passwordless connections
3. **Toggle it ON** for your application
4. **Save changes**

#### **Step 3: Test Email Configuration**

1. **Go to**: Authentication → Passwordless → Email
2. **Click "Try"** to test the email connection
3. **Enter a test email** and send a test magic link
4. **Verify** the email is received

### **🎮 How It Works:**

#### **Email Passwordless Login:**
1. **User clicks "Passwordless Email Login"**
2. **Redirects to Auth0** with email connection
3. **User enters email** on Auth0 page
4. **Auth0 sends magic link** to email
5. **User clicks link** to authenticate
6. **Redirects back** logged in

#### **Email Passwordless Signup:**
1. **User clicks "Passwordless Email Signup"**
2. **Redirects to Auth0** with email signup
3. **User enters email** on Auth0 page
4. **Auth0 sends magic link** to email
5. **User clicks link** to complete signup
6. **Account created** and logged in

### **📱 Benefits:**

#### **✅ Enhanced Security:**
- **No passwords required** - just email verification
- **Magic link authentication** via email
- **Secure one-time links** that expire
- **Professional passwordless** experience

#### **✅ Better User Experience:**
- **Faster login** with email magic links
- **No password management** needed
- **Email-based authentication** is familiar
- **Works on any device** with email access

### **🔧 Alternative: SMS Passwordless**

If you prefer SMS over email:

#### **Update Login Button:**
```typescript
// Change connection from 'email' to 'sms'
window.location.href = `/api/auth/[...auth0]?action=login&connection=sms`;
```

#### **SMS Configuration:**
1. **Go to**: Authentication → Passwordless → SMS
2. **Configure SMS provider** (Twilio, etc.)
3. **Enable for your application**
4. **Test SMS delivery**

### **📱 How to Test:**

#### **1. Configure Email Connection:**
- **Follow Step 1** above to configure email
- **Test email delivery** with Auth0's test feature
- **Verify** magic links work

#### **2. Test Passwordless Login:**
- **Visit**: `http://localhost:3005/login`
- **Click "Passwordless Email Login"**
- **Should redirect** to Auth0 email page
- **Enter email** and check for magic link

#### **3. Test Passwordless Signup:**
- **Visit**: `http://localhost:3005/signup`
- **Click "Passwordless Email Signup"**
- **Should redirect** to Auth0 signup page
- **Enter email** and receive magic link

### **🎯 What You Get:**

**Your surveillance dashboard will have:**
1. **Working passwordless authentication** via email
2. **No more `invalid_request` errors**
3. **Professional email magic link** authentication
4. **Enhanced security** without passwords
5. **Better user experience** for your security app

### **📁 Files Updated:**
- `app/components/CustomLoginForm.tsx` - Updated to use email connection
- `app/components/CustomSignupForm.tsx` - Updated to use email connection
- `EMAIL_PASSWORDLESS_SETUP.md` - This setup guide

**Configure the Email connection in Auth0 and test the passwordless authentication!** 🎉📧✨
