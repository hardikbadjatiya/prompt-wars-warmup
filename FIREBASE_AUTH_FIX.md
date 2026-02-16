# 🔧 Firebase Authentication Fix Guide

## Error: `auth/popup-closed-by-user`

This error occurs when Firebase blocks the OAuth popup. Here's how to fix it:

---

## ✅ **Step 1: Add Authorized Domain**

1. Go to **Firebase Console**: https://console.firebase.google.com
2. Select project: **`area-control-game`**
3. Click **Authentication** (🔐 icon in left sidebar)
4. Click **Settings** tab (⚙️ at top)
5. Scroll down to **Authorized domains** section
6. Click **Add domain** button
7. Paste this domain (without `https://`):
   ```
   area-control-loop-73167659125.us-central1.run.app
   ```
8. Click **Add**

**Screenshot locations:**
- Authentication → Settings → Authorized domains (scroll down)

---

## ✅ **Step 2: Enable Google Sign-In Provider**

1. Still in **Firebase Console** → **Authentication**
2. Click **Sign-in method** tab
3. Find **Google** in the list
4. If it shows "Disabled":
   - Click on **Google**
   - Toggle **Enable** switch
   - Add **Project support email** (your email: hardikbadjatiya@gmail.com)
   - Click **Save**

---

## ✅ **Step 3: Configure OAuth Consent Screen (if needed)**

1. Go to **Google Cloud Console**: https://console.cloud.google.com
2. Select project: **`area-control-game`**
3. Navigate to **APIs & Services** → **OAuth consent screen**
4. If not configured:
   - Select **External** user type
   - Click **Create**
   - Fill in:
     - App name: `Area Control Loop`
     - User support email: `hardikbadjatiya@gmail.com`
     - Developer contact: `hardikbadjatiya@gmail.com`
   - Click **Save and Continue**
   - Skip scopes (click **Save and Continue**)
   - Add test users (your email)
   - Click **Save and Continue**

---

## ✅ **Step 4: Fix Permissions (Already Done)**

Run this to ensure public access:
```bash
./fix_permissions.sh
```

---

## ✅ **Step 5: Test the Fix**

1. Visit: https://area-control-loop-73167659125.us-central1.run.app
2. Open DevTools Console (F12)
3. Click **"Sign in with Google"**
4. **Expected behavior**:
   - Google OAuth popup appears
   - You select your Google account
   - Popup closes automatically
   - You're logged in!

---

## 🔍 **Troubleshooting**

### **If popup still closes immediately:**

Check the browser console for errors:
- `auth/unauthorized-domain` → Domain not added (Step 1)
- `auth/popup-blocked` → Browser blocked popup (allow popups)
- `auth/internal-error` → CSP issue (should be fixed now)

### **If you see "This app isn't verified":**

This is normal for apps in development. Click **"Advanced"** → **"Go to Area Control Loop (unsafe)"**

---

## 📝 **Current Configuration**

Your Firebase config in `.env`:
```
VITE_FIREBASE_API_KEY=AIzaSyBSk4dVrT7OxuGhcHs-j6cA6Yvmrecq5H8
VITE_FIREBASE_AUTH_DOMAIN=area-control-game.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=area-control-game
```

Your Cloud Run URL:
```
https://area-control-loop-73167659125.us-central1.run.app
```

**These must match in Firebase Console!**

---

## ⏱️ **Expected Timeline**

- Adding authorized domain: **30 seconds**
- Enabling Google sign-in: **30 seconds**
- OAuth consent screen: **2 minutes** (if needed)
- **Total: ~3 minutes**

---

## ✅ **Verification**

After completing the steps, you should see:

**Firebase Console → Authentication → Settings → Authorized domains:**
- ✅ `localhost`
- ✅ `area-control-game.firebaseapp.com`
- ✅ `area-control-loop-73167659125.us-central1.run.app` ← **NEW**

**Firebase Console → Authentication → Sign-in method:**
- ✅ Google: **Enabled**

---

**Once these are configured, the login will work immediately!** 🎉
