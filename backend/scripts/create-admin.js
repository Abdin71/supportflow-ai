#!/usr/bin/env node
/**
 * Create Admin User Script
 * 
 * This script creates an admin user with full permissions.
 * Usage: node create-admin.js <email> <password> <displayName>
 * Example: node create-admin.js admin@example.com MyPassword123 "Admin User"
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require(path.join(__dirname, '../serviceAccountKey.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const auth = admin.auth();

async function createAdminUser(email, password, displayName) {
  try {
    console.log('🔧 Creating admin user...');
    console.log(`   Email: ${email}`);
    console.log(`   Display Name: ${displayName}`);

    // Create Firebase Auth user
    const userRecord = await auth.createUser({
      email,
      password,
      displayName,
      emailVerified: true, // Auto-verify admin email
    });

    console.log(`✅ Firebase Auth user created: ${userRecord.uid}`);

    // Create Firestore document with admin role and permissions
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      displayName,
      photoURL: null,
      role: 'admin',
      permissions: {
        canViewAllTickets: true,
        canEditAllTickets: true,
        canDeleteTickets: true,
        canManageUsers: true,
        canAccessAnalytics: true,
        canManageSettings: true,
        canBulkOperations: true,
      },
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`✅ Firestore document created with admin role`);
    console.log('\n🎉 Admin user created successfully!');
    console.log('\nYou can now log in at:');
    console.log('   http://localhost:3000/login');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    
    // Handle specific errors
    if (error.code === 'auth/email-already-exists') {
      console.log('\n💡 User already exists. Updating to admin role...');
      
      try {
        const userRecord = await auth.getUserByEmail(email);
        await db.collection('users').doc(userRecord.uid).set({
          role: 'admin',
          permissions: {
            canViewAllTickets: true,
            canEditAllTickets: true,
            canDeleteTickets: true,
            canManageUsers: true,
            canAccessAnalytics: true,
            canManageSettings: true,
            canBulkOperations: true,
          },
          isActive: true,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        
        console.log(`✅ User ${email} updated to admin role`);
      } catch (updateError) {
        console.error('❌ Error updating user:', updateError.message);
      }
    }
    
    process.exit(1);
  }

  process.exit(0);
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length < 3) {
  console.log('Usage: node create-admin.js <email> <password> <displayName>');
  console.log('Example: node create-admin.js admin@example.com MyPassword123 "Admin User"');
  process.exit(1);
}

const [email, password, displayName] = args;

// Validate inputs
if (!email.includes('@')) {
  console.error('❌ Invalid email address');
  process.exit(1);
}

if (password.length < 6) {
  console.error('❌ Password must be at least 6 characters');
  process.exit(1);
}

// Create the admin user
createAdminUser(email, password, displayName);
