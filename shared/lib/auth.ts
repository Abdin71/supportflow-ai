import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from './firebase';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

/**
 * Sign up a new user with email and password
 */
export const signUpWithEmail = async (
  email: string, 
  password: string, 
  displayName?: string
): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update display name if provided
    if (displayName) {
      await updateProfile(user, { displayName });
    }

    console.log('User created successfully:', user.uid);
    return user;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error signing up:', message);
    throw error;
  }
};

/**
 * Sign in an existing user with email and password
 */
export const signInWithEmail = async (
  email: string, 
  password: string
): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('User signed in successfully:', userCredential.user.uid);
    return userCredential.user;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error signing in:', message);
    throw error;
  }
};

/**
 * Sign out the current user
 */
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
    console.log('User signed out successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error signing out:', message);
    throw error;
  }
};

/**
 * Send password reset email
 */
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log('Password reset email sent to:', email);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error sending password reset email:', message);
    throw error;
  }
};

/**
 * Subscribe to auth state changes
 */
export const subscribeToAuthChanges = (
  callback: (user: User | null) => void
): (() => void) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Get current user
 */
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  displayName?: string,
  photoURL?: string
): Promise<void> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No user is currently signed in');
  }

  try {
    await updateProfile(user, {
      ...(displayName && { displayName }),
      ...(photoURL && { photoURL }),
    });
    console.log('Profile updated successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error updating profile:', message);
    throw error;
  }
};
