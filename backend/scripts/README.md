# Backend Scripts

## Check User (Diagnostic Tool)

Diagnose issues with user accounts by checking their Firebase Auth and Firestore data.

### Usage

```bash
cd backend
npm run check-user user@example.com
```

### What it shows

- Firebase Auth status (exists, email verified, creation date)
- Firestore document fields (especially the `role` field)
- Diagnosis of any issues
- Specific fix commands for your situation

### Example Output

```
🔍 Checking user: user@example.com

📝 Firebase Authentication:
   ✅ User exists in Firebase Auth
   UID: abc123
   Email: user@example.com
   Display Name: John Doe
   Email Verified: true
   Created: 12/22/2025, 10:30:00 AM

📄 Firestore Document:
   ✅ Document exists

   Fields:
   - uid: abc123
   - email: user@example.com
   - displayName: John Doe
   - role: ⚠️  MISSING - THIS IS THE PROBLEM!
   - isActive: (missing)
   - createdAt: 12/22/2025, 10:30:00 AM

📊 Diagnosis:
   ❌ ISSUE: Role field is missing!
   🔧 Fix: Run the following command to add admin role:
      cd backend && npm run create-admin user@example.com YourPassword "John Doe"
```

---

## Create Admin User

This script creates an admin user with full permissions for accessing the admin dashboard.

### Prerequisites

- Firebase service account key file at `backend/serviceAccountKey.json`
- Node.js installed

### Usage

```bash
cd backend
node scripts/create-admin.js <email> <password> <displayName>
```

### Example

```bash
node scripts/create-admin.js admin@supportflow.com SecurePass123 "Admin User"
```

### What it does

1. Creates a new Firebase Authentication user
2. Creates a Firestore document in `users` collection with:
   - `role: 'admin'`
   - Full admin permissions
   - `isActive: true`
   - Auto-verified email

3. If the user already exists, it updates their role to admin

### After Creation

You can log in to the admin dashboard at:
- **URL**: http://localhost:3000/login (or http://localhost:3001 if port 3000 is in use)
- **Email**: The email you provided
- **Password**: The password you provided

### Troubleshooting

**Error: serviceAccountKey.json not found**
- Download your service account key from Firebase Console
- Go to Project Settings > Service Accounts > Generate New Private Key
- Save it as `backend/serviceAccountKey.json`

**Error: Email already exists**
- The script will automatically update the existing user to admin role
- No need to delete and recreate

**Error: Password too weak**
- Password must be at least 6 characters
- Use a strong password for production

### Security Note

⚠️ **Never commit `serviceAccountKey.json` to version control**

The `.gitignore` file is already configured to exclude this file, but always verify before pushing to GitHub.
