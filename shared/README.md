# Shared Module

This directory contains shared utilities, configurations, and types used across the SupportFlow AI application.

## Structure

- **`config/`** - Firebase configuration and initialization
- **`lib/`** - Shared utility functions (auth, firestore, cloud functions)
- **`types/`** - TypeScript type definitions

## Usage

Import shared utilities in your frontend or backend code:

```typescript
import { auth, db } from '@supportflow-ai/shared';
import { signUpWithEmail, signInWithEmail } from '@supportflow-ai/shared';
import type { Ticket, User } from '@supportflow-ai/shared';
```

## Environment Variables

Copy `.env.example` to `.env.local` in your project root and fill in your Firebase credentials:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```
