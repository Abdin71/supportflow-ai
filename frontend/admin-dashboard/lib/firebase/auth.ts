import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, getDocFromServer } from 'firebase/firestore';
import { auth, db } from './config';
import type { User, UserRole } from './types';

export const mapFirebaseUserToUser = async (firebaseUser: FirebaseUser): Promise<User | null> => {
  try {
    // Force fetch from server to avoid stale cache issues
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    let userDoc;
    
    try {
      userDoc = await getDocFromServer(userDocRef);
    } catch (e) {
      console.warn('Server fetch failed, falling back to default fetch', e);
      userDoc = await getDoc(userDocRef);
    }

    if (!userDoc.exists()) {
      return null;
    }

    const userData = userDoc.data();
    
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      role: userData.role as UserRole,
      permissions: userData.permissions,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
      lastLoginAt: userData.lastLoginAt,
      isActive: userData.isActive,
      department: userData.department,
      teamId: userData.teamId,
    };
  } catch (error) {
    console.error('Error mapping firebase user:', error);
    return null;
  }
};

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  firebaseSignOut,
  onAuthStateChanged
};
