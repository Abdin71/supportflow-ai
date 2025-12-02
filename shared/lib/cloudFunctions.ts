import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

/**
 * Interface for the addMessage function response
 */
interface AddMessageResponse {
  id: string;
  message: string;
}

/**
 * Interface for the addMessage function request
 */
interface AddMessageRequest {
  text: string;
}

/**
 * Call the helloWorld HTTP function
 * Note: This is an HTTP function, so you'll need to call it via fetch
 */
export const callHelloWorld = async (): Promise<unknown> => {
  try {
    // Replace with your actual Firebase Functions URL after deployment
    const functionUrl = 'https://YOUR_REGION-YOUR_PROJECT_ID.cloudfunctions.net/helloWorld';
    
    const response = await fetch(functionUrl);
    const data = await response.json();
    
    console.log('Hello World response:', data);
    return data;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error calling helloWorld:', message);
    throw error;
  }
};

/**
 * Call the addMessage callable function
 */
export const callAddMessage = async (text: string): Promise<AddMessageResponse> => {
  try {
    const addMessage = httpsCallable<AddMessageRequest, AddMessageResponse>(
      functions, 
      'addMessage'
    );
    
    const result = await addMessage({ text });
    console.log('Message added:', result.data);
    return result.data;
  } catch (error) {
    console.error('Error calling addMessage:', error);
    throw error;
  }
};

/**
 * Example: Call a cloud function to process user data
 */
export const processUserData = async (userId: string, data: Record<string, unknown>): Promise<unknown> => {
  try {
    const processData = httpsCallable(functions, 'processUserData');
    const result = await processData({ userId, data });
    
    console.log('Data processed:', result.data);
    return result.data;
  } catch (error) {
    console.error('Error processing user data:', error);
    throw error;
  }
};

/**
 * Example: Call a cloud function to send notifications
 */
export const sendNotification = async (
  userId: string,
  title: string,
  body: string
): Promise<unknown> => {
  try {
    const sendNotif = httpsCallable(functions, 'sendNotification');
    const result = await sendNotif({ userId, title, body });
    
    console.log('Notification sent:', result.data);
    return result.data;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

/**
 * Example: Call a cloud function to generate analytics
 */
export const generateAnalytics = async (
  startDate: Date,
  endDate: Date
): Promise<unknown> => {
  try {
    const getAnalytics = httpsCallable(functions, 'generateAnalytics');
    const result = await getAnalytics({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
    
    console.log('Analytics generated:', result.data);
    return result.data;
  } catch (error) {
    console.error('Error generating analytics:', error);
    throw error;
  }
};

/**
 * Generic function to call any cloud function
 */
export const callCloudFunction = async <T = unknown, R = unknown>(
  functionName: string,
  data?: T
): Promise<R> => {
  try {
    const cloudFunction = httpsCallable<T, R>(functions, functionName);
    const result = await cloudFunction(data);
    
    console.log(`Cloud function ${functionName} called successfully`);
    return result.data;
  } catch (error) {
    console.error(`Error calling cloud function ${functionName}:`, error);
    throw error;
  }
};

/**
 * Helper to handle cloud function errors
 */
export const handleCloudFunctionError = (error: unknown): string => {
  // Type guard for error object
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const errorCode = (error as { code: string }).code;
    
    if (errorCode === 'functions/cancelled') {
      return 'The operation was cancelled';
    } else if (errorCode === 'functions/invalid-argument') {
      return 'Invalid arguments provided to the function';
    } else if (errorCode === 'functions/deadline-exceeded') {
      return 'The operation timed out';
    } else if (errorCode === 'functions/not-found') {
      return 'The function was not found. Make sure you have deployed your Cloud Functions by running: cd functions && npm run deploy';
    } else if (errorCode === 'functions/permission-denied') {
      return 'You do not have permission to perform this action';
    } else if (errorCode === 'functions/resource-exhausted') {
      return 'Resource quota exceeded';
    } else if (errorCode === 'functions/unauthenticated') {
      return 'You must be authenticated to perform this action';
    } else if (errorCode === 'functions/unavailable') {
      return 'The service is currently unavailable';
    } else if (errorCode === 'functions/internal') {
      return 'An internal error occurred. This usually means the Cloud Function hasn\'t been deployed yet. Run: cd functions && npm run deploy';
    }
  }
  
  // Check for message property
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return (error as { message: string }).message;
  }
  
  return 'An unknown error occurred';
};
