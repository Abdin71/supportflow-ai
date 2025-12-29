#!/usr/bin/env node
/**
 * Test AI Processing Script
 * 
 * This script creates a test ticket and monitors the AI processing status.
 * Usage: node test-ai-processing.js
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');
try {
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} catch (error) {
  console.error('Error loading serviceAccountKey.json. Please ensure it exists in the backend directory.');
  console.error(error.message);
  process.exit(1);
}

const db = admin.firestore();

async function testAiProcessing() {
  console.log('🚀 Starting AI Processing Test...');

  // 1. Create a test ticket
  const ticketData = {
    subject: 'Test Ticket for AI Processing',
    description: 'I am unable to login to my account. I keep getting a "password incorrect" error even though I just reset it. Please help me access my dashboard.',
    userId: 'test-user-id',
    userEmail: 'test@example.com',
    userName: 'Test User',
    status: 'open',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    messageCount: 0,
    hasUnreadMessages: false,
    aiMetadata: {
      processingStatus: 'pending',
      startedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
  };

  try {
    const ticketRef = await db.collection('tickets').add(ticketData);
    console.log(`✅ Created test ticket with ID: ${ticketRef.id}`);
    console.log('👀 Watching for AI updates...');

    // 2. Listen for updates
    const unsubscribe = ticketRef.onSnapshot((doc) => {
      const data = doc.data();
      if (!data) return;

      const status = data.aiMetadata?.processingStatus;
      const category = data.category;
      const priority = data.priority;
      const tags = data.tags;

      console.log(`\n[${new Date().toISOString()}] Status: ${status}`);
      
      if (status === 'processing') {
        console.log('   AI is analyzing the ticket...');
      } else if (status === 'completed') {
        console.log('   ✅ AI Analysis Complete!');
        console.log('   ------------------------');
        console.log(`   Category: ${category}`);
        console.log(`   Priority: ${priority}`);
        console.log(`   Tags: ${tags ? tags.join(', ') : 'None'}`);
        console.log('   ------------------------');
        unsubscribe();
        process.exit(0);
      } else if (status === 'failed') {
        console.error('   ❌ AI Analysis Failed.');
        console.error(`   Error: ${data.aiMetadata?.error}`);
        unsubscribe();
        process.exit(1);
      }
    }, (error) => {
      console.error('Error listening to ticket updates:', error);
      process.exit(1);
    });

    // Timeout after 60 seconds
    setTimeout(() => {
      console.error('\n❌ Timeout: AI processing took too long (> 60s).');
      unsubscribe();
      process.exit(1);
    }, 60000);

  } catch (error) {
    console.error('Error creating test ticket:', error);
    process.exit(1);
  }
}

testAiProcessing();
