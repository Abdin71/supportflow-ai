# Firebase Authentication Setup Guide

This dashboard is ready for Firebase Authentication integration. Follow these steps to connect Firebase:

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the setup wizard
3. Enable Google Analytics (optional)

## 2. Enable Authentication Methods

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable **Email/Password** authentication
3. (Optional) Enable other providers like Google, GitHub, etc.

## 3. Install Firebase SDK

\`\`\`bash
npm install firebase firebase-admin
\`\`\`

## 4. Create Firebase Config File

Create `lib/firebase.ts`:

\`\`\`typescript
import { initializeApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
export const auth = getAuth(app)
\`\`\`

## 5. Add Environment Variables

Add to your `.env.local`:

\`\`\`bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
\`\`\`

## 6. Update Auth Context

In `lib/auth-context.tsx`, uncomment the Firebase integration code:

\`\`\`typescript
import { auth } from "@/lib/firebase"
import { 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged 
} from "firebase/auth"

// Replace mock auth with real Firebase calls
\`\`\`

## 7. Update Middleware (Optional)

For server-side authentication checks, update `middleware.ts` with Firebase Admin SDK.

## 8. Add Password Reset

Create a password reset page at `app/forgot-password/page.tsx`:

\`\`\`typescript
import { sendPasswordResetEmail } from "firebase/auth"
// Implementation here
\`\`\`

## Features Included

- Email/Password authentication
- Protected routes
- User profile management
- Logout functionality
- Ready for OAuth providers (Google, GitHub, etc.)
- Role-based access control structure

## Next Steps

1. Set up Firestore rules for ticket data
2. Add email verification flow
3. Implement password reset
4. Add OAuth providers
5. Set up Firebase Admin for server-side operations
