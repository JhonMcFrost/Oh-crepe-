# Firebase OAuth Setup Guide

## Overview
Firebase Authentication has been integrated into your Oh Crepe! application with Google and Facebook OAuth providers. The implementation uses a hybrid approach: Firebase handles authentication while your existing IndexedDB system manages user roles and data.

## Prerequisites
Before testing OAuth login, you need to:

1. **Create a Firebase Project**
2. **Configure OAuth Providers**
3. **Update Environment Variables**

---

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard:
   - Enter project name: "Oh Crepe" (or your preferred name)
   - Enable/disable Google Analytics (optional)
   - Click "Create project"

---

## Step 2: Add Web App to Firebase

1. In your Firebase project dashboard, click the **Web icon** (`</>`)
2. Register your app:
   - App nickname: "Oh Crepe Web"
   - Check "Also set up Firebase Hosting" (optional)
   - Click "Register app"
3. Copy the Firebase configuration object

---

## Step 3: Update Environment Configuration

1. Open `src/environments/environment.ts`
2. Replace the placeholder values with your Firebase config:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  appName: 'Oh Crêpe!',
  version: '1.0.0',
  firebase: {
    apiKey: "YOUR_ACTUAL_API_KEY",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
  }
};
```

---

## Step 4: Enable Google Authentication

1. In Firebase Console, go to **Authentication** (left sidebar)
2. Click **Get started** (if first time)
3. Go to **Sign-in method** tab
4. Click **Google**
5. Toggle **Enable**
6. Set project support email (your email)
7. Click **Save**

---

## Step 5: Enable Facebook Authentication

### 5.1: Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **My Apps** > **Create App**
3. Select app type: **Consumer**
4. Fill in app details:
   - App name: "Oh Crepe"
   - Contact email: your email
5. Click **Create App**

### 5.2: Add Facebook Login Product

1. In your Facebook app dashboard, find **Facebook Login**
2. Click **Set Up**
3. Select **Web** platform
4. Enter your site URL (for development): `http://localhost:4200`
5. Click **Save** and **Continue**

### 5.3: Get App Credentials

1. Go to **Settings** > **Basic**
2. Copy your:
   - **App ID**
   - **App Secret** (click Show)

### 5.4: Configure in Firebase

1. Back in Firebase Console > **Authentication** > **Sign-in method**
2. Click **Facebook**
3. Toggle **Enable**
4. Paste your Facebook **App ID** and **App Secret**
5. Copy the **OAuth redirect URI** shown
6. Click **Save**

### 5.5: Add OAuth Redirect in Facebook

1. Go back to Facebook App > **Facebook Login** > **Settings**
2. Find **Valid OAuth Redirect URIs**
3. Paste the redirect URI from Firebase
4. Click **Save Changes**

### 5.6: Make App Public (Optional for Testing)

1. In Facebook App dashboard, toggle the switch at top: **App Mode: Development** → **Live**
2. Note: You may need to complete app review for public use

---

## Step 6: Configure Authorized Domains

1. In Firebase Console > **Authentication** > **Settings** tab
2. Scroll to **Authorized domains**
3. Add your domains:
   - `localhost` (for development)
   - Your production domain (e.g., `oh-crepe.vercel.app`)

---

## Step 7: Test the Integration

1. Start your development server:
   ```bash
   npm start
   ```

2. Navigate to the login page: `http://localhost:4200/login`

3. Click **Continue with Google** or **Continue with Facebook**

4. Complete the OAuth flow in the popup

5. You should be:
   - Redirected to `/menu` (customer role)
   - Logged in with your OAuth account
   - User data stored in IndexedDB with default "customer" role

---

## How It Works

### Architecture

```
User clicks OAuth button
    ↓
Firebase Auth popup
    ↓
User authenticates with Google/Facebook
    ↓
Firebase returns user info
    ↓
FirebaseAuthService.syncWithLocalAuth()
    ↓
Check if user exists in IndexedDB
    ├─ Exists → Login existing user
    └─ New → Register as "customer" role
    ↓
Redirect to appropriate page
```

### Key Files

- **`firebase-auth.service.ts`**: Handles OAuth login and syncs with local auth
- **`auth.service.ts`**: Manages user sessions and role-based access
- **`app.config.ts`**: Firebase initialization and providers
- **`environment.ts`**: Firebase configuration

### User Data Flow

1. **OAuth Sign-In**: User info from Google/Facebook
2. **Local Storage**: User stored in IndexedDB with role
3. **Session Management**: `AuthService` manages authentication state
4. **Role Guards**: Routes protected based on user role

---

## Troubleshooting

### "Auth domain not authorized"
- Add your domain to Firebase > Authentication > Authorized domains

### "App ID is invalid" (Facebook)
- Check App ID matches in Firebase settings
- Ensure Facebook app is in "Live" mode for public testing

### "Popup closed by user"
- Normal if user closes popup without completing login
- No action needed

### "Firebase config not found"
- Verify you updated `environment.ts` with real credentials
- Check for typos in config object

### User not redirecting after login
- Check browser console for errors
- Verify `AuthService.setCurrentUser()` is called
- Check route guards are properly configured

---

## Production Deployment

When deploying to production:

1. Create `src/environments/environment.prod.ts` with production Firebase config
2. Update authorized domains in Firebase Console
3. Add production URLs to Facebook app settings
4. Update OAuth redirect URIs
5. Test OAuth flows on production domain

---

## Security Notes

- **Never commit** Firebase credentials to public repositories
- Use environment variables for sensitive data
- Enable **App Check** in Firebase for production
- Review Firebase Security Rules regularly
- Monitor authentication logs in Firebase Console

---

## User Role Management

By default, OAuth users are assigned the **"customer"** role. To assign different roles:

1. Use the Admin dashboard to change user roles after registration
2. Modify `FirebaseAuthService.syncWithLocalAuth()` to implement custom role logic
3. Add role selection during OAuth signup flow

---

## Next Steps

✅ Firebase OAuth is now integrated!

Consider adding:
- Email/password reset functionality
- Email verification for OAuth users
- Profile photo upload using Firebase Storage
- Multi-factor authentication
- Custom claims for role-based access

---

## Support Resources

- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Google Sign-In Guide](https://firebase.google.com/docs/auth/web/google-signin)
- [Facebook Login Guide](https://firebase.google.com/docs/auth/web/facebook-login)
- [Firebase Console](https://console.firebase.google.com/)
