# Firebase Authentication Setup Guide

This guide explains how to set up Google/Firebase authentication for the PayPerCrawl website.

## Prerequisites

- A Firebase project (create one at [Firebase Console](https://console.firebase.google.com/))
- Google Cloud Console access (for OAuth setup)

## Setup Steps

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name (e.g., "paypercrawl-auth")
4. Choose whether to enable Google Analytics
5. Click "Create project"

### 2. Enable Authentication

1. In your Firebase project, click "Authentication" in the left sidebar
2. Click "Get started" if it's your first time
3. Go to the "Sign-in method" tab
4. Click on "Google" provider
5. Toggle "Enable" to ON
6. Set your project support email
7. Add your domain(s) to "Authorized domains":
   - `localhost` (for development)
   - `paypercrawl.tech` (for production)
   - Any other domains you'll use
8. Click "Save"

### 3. Get Firebase Configuration

1. In Firebase Console, click the gear icon (Project settings)
2. Scroll down to "Your apps" section
3. Click the web icon `</>` to add a web app
4. Enter app nickname (e.g., "PayPerCrawl Web")
5. Check "Set up Firebase Hosting" if you plan to use it
6. Click "Register app"
7. Copy the configuration object - you'll need these values:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### 4. Configure Environment Variables

1. Copy `.env.example` to `.env`
2. Update the Firebase environment variables with your config:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### 5. Set Up OAuth Consent Screen (if needed)

If you encounter OAuth consent screen errors:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Navigate to "APIs & Services" > "OAuth consent screen"
4. Choose "External" for user type
5. Fill in required fields:
   - App name: "PayPerCrawl"
   - User support email: your email
   - Developer contact: your email
6. Add authorized domains in "Authorized domains" section
7. Save and continue through the steps

### 6. Testing

1. Start your development server: `npm run dev`
2. Navigate to the waitlist page
3. Try signing in with Google
4. Check that the authentication flow works correctly

## How It Works

### Authentication Flow

1. **User clicks "Sign in with Google"** on waitlist or navigation
2. **Firebase handles Google OAuth** - opens Google sign-in popup
3. **Backend validates user** - checks if user exists in waitlist
4. **Status check** - returns appropriate response:
   - `200`: User approved, set invite token cookie, redirect to dashboard
   - `404`: User not on waitlist, redirect to waitlist signup
   - `403`: User pending approval, show pending message
5. **Error handling** - Firebase sign-out on backend rejection

### API Endpoints

- `POST /api/auth/google` - Validates Google-authenticated users
- `GET /api/waitlist/check` - Check user waitlist status (returns 404/403 status codes)
- `POST /api/waitlist/validate` - Validate invite tokens

### Status Codes

- `200` - Success, user authenticated and approved
- `403` - User is on waitlist but pending approval
- `404` - User not found on waitlist
- `400` - Bad request (missing email/name)
- `500` - Server error

## Features

### Enhanced UI

- **Status banners** - Show contextual messages for pending/rejected users
- **Google sign-in integration** - Seamless OAuth flow
- **Automatic redirects** - Smart routing based on user status
- **Enhanced styling** - Custom CSS classes for auth components

### Security

- **Restricted access** - Only approved waitlist users can access dashboard
- **Token-based sessions** - Secure invite token system
- **Firebase sign-out** - Automatic sign-out on authentication failures
- **CORS handling** - Proper cross-origin request handling

## Troubleshooting

### Common Issues

1. **"Invalid OAuth client"**: Check authorized domains in Firebase
2. **"This app isn't verified"**: Set up OAuth consent screen in Google Cloud Console
3. **"Firebase not initialized"**: Check environment variables are set correctly
4. **CORS errors**: Ensure domains are added to Firebase authorized domains

### Environment Variables

Make sure all required Firebase environment variables are set:
- All variables must start with `NEXT_PUBLIC_` for client-side access
- Variables are loaded at build time, restart dev server after changes
- Check `.env.example` for required format

### Database Schema

The waitlist system uses these database fields:
- `email` - User's Google account email
- `status` - `pending`, `invited`, `accepted`, `rejected`
- `inviteToken` - Unique token for dashboard access
- `name` - User's display name

## Next Steps

1. Set up production Firebase project for live environment
2. Configure production domain in Firebase authorized domains
3. Update production environment variables
4. Test authentication flow in production
5. Monitor authentication metrics in Firebase Console

For support, contact the development team or check the Firebase documentation.