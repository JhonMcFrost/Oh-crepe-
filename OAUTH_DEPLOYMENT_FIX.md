# OAuth Deployment Fix - Required Steps

## Problem
OAuth works on localhost but fails on deployed website.

## Root Causes
1. ❌ Firebase configuration missing in production environment file (FIXED ✅)
2. ❌ Deployed domain not added to Firebase authorized domains
3. ❌ OAuth providers might not have production redirect URIs configured

---

## ✅ Step 1: Add Your Deployed Domain to Firebase Console

### Go to Firebase Console:
1. Visit: https://console.firebase.google.com/project/oh-crepe-89d9b/authentication/settings
2. Scroll to **Authorized domains** section
3. Click **Add domain**
4. Add your deployed domain (e.g., `your-app.vercel.app` or `your-app.firebase.app` or your custom domain)
5. Click **Add**

**Important**: Do NOT include `http://` or `https://` - just the domain name.

Examples:
- ✅ `oh-crepe.vercel.app`
- ✅ `oh-crepe-89d9b.web.app`
- ✅ `oh-crepe-89d9b.firebaseapp.com`
- ❌ `https://oh-crepe.vercel.app` (wrong - don't include protocol)

---

## ✅ Step 2: Verify OAuth Providers Are Enabled

### Google Sign-In:
1. Go to: https://console.firebase.google.com/project/oh-crepe-89d9b/authentication/providers
2. Find **Google** provider
3. Make sure it's **Enabled** (toggle should be ON)
4. Verify **support email** is set
5. Click **Save** if you made changes

### Facebook Sign-In (if using):
1. In the same providers page, find **Facebook**
2. Make sure it's **Enabled**
3. You need:
   - Facebook App ID
   - Facebook App Secret
4. In your Facebook App settings (https://developers.facebook.com/apps/):
   - Add your deployed domain to **App Domains**
   - Add Firebase OAuth redirect URI to **Valid OAuth Redirect URIs**:
     ```
     https://oh-crepe-89d9b.firebaseapp.com/__/auth/handler
     ```

---

## ✅ Step 3: Check Browser Console for Specific Errors

When OAuth fails, open browser DevTools (F12) and check Console tab for errors:

### Common Error Messages:

**Error: `auth/unauthorized-domain`**
- **Fix**: Add your deployed domain to Firebase authorized domains (Step 1)

**Error: `auth/operation-not-allowed`**
- **Fix**: Enable the OAuth provider in Firebase Console (Step 2)

**Error: `auth/popup-blocked`**
- **Fix**: User needs to allow popups for your domain

**Error: `auth/cancelled-popup-request`**
- **Fix**: User closed the popup or multiple OAuth buttons clicked

**Error: `auth/network-request-failed`**
- **Fix**: Check internet connection or Firebase service status

---

## ✅ Step 4: Test OAuth Flow

After completing steps 1-3:

1. Clear browser cache and cookies
2. Visit your deployed website
3. Click "Continue with Google"
4. Check if popup opens
5. Select Google account
6. Verify redirect back to your app
7. Check if user is logged in

---

## ✅ Step 5: Verify Redirect URL Pattern

Firebase automatically handles OAuth redirects using this pattern:
```
https://[YOUR-PROJECT-ID].firebaseapp.com/__/auth/handler
```

For your project:
```
https://oh-crepe-89d9b.firebaseapp.com/__/auth/handler
```

This should work automatically, but if using custom domain, ensure DNS is properly configured.

---

## What Was Fixed in Code

✅ **environment.prod.ts** - Added missing Firebase configuration:
```typescript
firebase: {
  apiKey: "AIzaSyB7YMT6pVyQQI84UF7Xw1_JcDwsF5bv4fM",
  authDomain: "oh-crepe-89d9b.firebaseapp.com",
  projectId: "oh-crepe-89d9b",
  storageBucket: "oh-crepe-89d9b.firebasestorage.app",
  messagingSenderId: "327943898410",
  appId: "1:327943898410:web:a9ee1286a0eb71474c8a53"
}
```

---

## Quick Troubleshooting Checklist

- [ ] Firebase config exists in `environment.prod.ts` ✅ (FIXED)
- [ ] Deployed domain added to Firebase authorized domains (YOU MUST DO THIS)
- [ ] Google OAuth provider is enabled in Firebase Console
- [ ] Support email is set for Google OAuth
- [ ] App rebuilt with `npm run build` after environment changes
- [ ] Browser cache cleared before testing
- [ ] Browser console checked for specific error messages
- [ ] Popups are allowed for your domain

---

## What's Your Deployed URL?

Please provide your deployed URL so I can verify:
- Vercel: `https://[project-name].vercel.app`
- Firebase Hosting: `https://oh-crepe-89d9b.web.app` or `https://oh-crepe-89d9b.firebaseapp.com`
- Netlify: `https://[project-name].netlify.app`
- Custom domain: `https://your-domain.com`

Once you provide it, add it to Firebase authorized domains!

---

## Need to Rebuild and Redeploy

After fixing the environment file, you MUST rebuild and redeploy:

```bash
# Build for production
npm run build

# Deploy (example for Firebase Hosting)
firebase deploy

# Or for Vercel
vercel --prod
```

---

## Still Not Working?

If OAuth still fails after completing all steps above:

1. Share the **exact error message** from browser console
2. Share your **deployed URL**
3. Confirm which OAuth provider you're testing (Google or Facebook)
4. Share screenshot of Firebase Console > Authentication > Settings > Authorized domains
