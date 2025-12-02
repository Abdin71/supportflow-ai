import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

// Example HTTP function with CORS support
export const helloWorld = functions.https.onRequest((request, response) => {
  // Set CORS headers
  response.set("Access-Control-Allow-Origin", "*");
  response.set("Access-Control-Allow-Methods", "GET, POST");
  
  response.json({
    message: "Hello from Firebase Cloud Functions!",
    timestamp: new Date().toISOString(),
  });
});

// Example callable function
export const addMessage = functions.https.onCall(async (data, context) => {
  const text = data.text;
  
  if (!text) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with a text argument."
    );
  }

  const messageRef = await admin.firestore()
    .collection("messages")
    .add({
      text: text,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      userId: context.auth?.uid || "anonymous",
    });

  return {
    id: messageRef.id,
    message: "Message added successfully",
  };
});

// Example Firestore trigger
export const onMessageCreate = functions.firestore
  .document("messages/{messageId}")
  .onCreate(async (snap, context) => {
    const data = snap.data();
    console.log("New message created:", data);

    // You can perform additional operations here
    // For example, send a notification, update analytics, etc.
    
    return null;
  });

// Example scheduled function (runs every day at midnight)
export const dailyCleanup = functions.pubsub
  .schedule("0 0 * * *")
  .timeZone("America/New_York")
  .onRun(async (context) => {
    console.log("Running daily cleanup...");
    
    // Add your cleanup logic here
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);

    const snapshot = await admin.firestore()
      .collection("messages")
      .where("createdAt", "<", cutoffDate)
      .get();

    const batch = admin.firestore().batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`Deleted ${snapshot.size} old messages`);
    
    return null;
  });
