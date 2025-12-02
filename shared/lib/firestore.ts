import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  DocumentData,
  QueryConstraint,
  onSnapshot,
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

export interface Message {
  id?: string;
  text: string;
  userId: string;
  userName?: string;
  createdAt: Date | Timestamp;
  updatedAt?: Date | Timestamp;
}

export interface Todo {
  id?: string;
  title: string;
  description?: string;
  completed: boolean;
  userId: string;
  createdAt: Date | Timestamp;
}

/**
 * Create a new document in a collection
 */
export const createDocument = async <T extends DocumentData>(
  collectionName: string,
  data: T
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp(),
    });
    console.log('Document created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error creating document:', message);
    throw error;
  }
};

/**
 * Set a document with a specific ID
 */
export const setDocument = async <T extends DocumentData>(
  collectionName: string,
  docId: string,
  data: T,
  merge: boolean = false
): Promise<void> => {
  try {
    await setDoc(doc(db, collectionName, docId), data, { merge });
    console.log('Document set successfully:', docId);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error setting document:', message);
    throw error;
  }
};

/**
 * Get a single document by ID
 */
export const getDocument = async <T = DocumentData>(
  collectionName: string,
  docId: string
): Promise<T | null> => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    } else {
      console.log('No document found with ID:', docId);
      return null;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error getting document:', message);
    throw error;
  }
};

/**
 * Get all documents from a collection with optional filters
 */
export const getDocuments = async <T = DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<T[]> => {
  try {
    const q = query(collection(db, collectionName), ...constraints);
    const querySnapshot = await getDocs(q);
    
    const documents = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];
    
    console.log(`Retrieved ${documents.length} documents from ${collectionName}`);
    return documents;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error getting documents:', message);
    throw error;
  }
};

/**
 * Update a document
 */
export const updateDocument = async <T extends DocumentData>(
  collectionName: string,
  docId: string,
  data: Partial<T>
): Promise<void> => {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
    console.log('Document updated successfully:', docId);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error updating document:', message);
    throw error;
  }
};

/**
 * Delete a document
 */
export const deleteDocument = async (
  collectionName: string,
  docId: string
): Promise<void> => {
  try {
    await deleteDoc(doc(db, collectionName, docId));
    console.log('Document deleted successfully:', docId);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error deleting document:', message);
    throw error;
  }
};

/**
 * Subscribe to real-time updates for a document
 */
export const subscribeToDocument = <T = DocumentData>(
  collectionName: string,
  docId: string,
  callback: (data: T | null) => void
): (() => void) => {
  const docRef = doc(db, collectionName, docId);
  
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback({ id: docSnap.id, ...docSnap.data() } as T);
    } else {
      callback(null);
    }
  });
};

/**
 * Subscribe to real-time updates for a collection
 */
export const subscribeToCollection = <T = DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[] = [],
  callback: (data: T[]) => void
): (() => void) => {
  const q = query(collection(db, collectionName), ...constraints);
  
  return onSnapshot(q, (querySnapshot) => {
    const documents = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];
    callback(documents);
  });
};

/**
 * Batch write operations
 */
export const batchWrite = async (
  operations: Array<{
    type: 'set' | 'update' | 'delete';
    collectionName: string;
    docId: string;
    data?: DocumentData;
  }>
): Promise<void> => {
  try {
    const batch = writeBatch(db);
    
    operations.forEach(op => {
      const docRef = doc(db, op.collectionName, op.docId);
      
      switch (op.type) {
        case 'set':
          if (op.data) batch.set(docRef, op.data);
          break;
        case 'update':
          if (op.data) batch.update(docRef, op.data);
          break;
        case 'delete':
          batch.delete(docRef);
          break;
      }
    });
    
    await batch.commit();
    console.log(`Batch write completed: ${operations.length} operations`);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in batch write:', message);
    throw error;
  }
};

// Example specific collection helpers

export const messagesAPI = {
  create: (text: string, userId: string, userName?: string) =>
    createDocument<Omit<Message, 'id'>>('messages', {
      text,
      userId,
      userName,
      createdAt: Timestamp.now(),
    }),
    
  getAll: () =>
    getDocuments<Message>('messages', [
      orderBy('createdAt', 'desc'),
      limit(50),
    ]),
    
  getByUser: (userId: string) =>
    getDocuments<Message>('messages', [
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
    ]),
    
  subscribe: (callback: (messages: Message[]) => void) =>
    subscribeToCollection<Message>(
      'messages',
      [orderBy('createdAt', 'desc'), limit(50)],
      callback
    ),
    
  delete: (messageId: string) => deleteDocument('messages', messageId),
};

export const todosAPI = {
  create: (title: string, userId: string, description?: string) =>
    createDocument<Omit<Todo, 'id'>>('todos', {
      title,
      description,
      completed: false,
      userId,
      createdAt: Timestamp.now(),
    }),
    
  getByUser: (userId: string) =>
    getDocuments<Todo>('todos', [
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
    ]),
    
  update: (todoId: string, data: Partial<Todo>) =>
    updateDocument('todos', todoId, data),
    
  toggleComplete: async (todoId: string, completed: boolean) =>
    updateDocument('todos', todoId, { completed }),
    
  delete: (todoId: string) => deleteDocument('todos', todoId),
    
  subscribe: (userId: string, callback: (todos: Todo[]) => void) =>
    subscribeToCollection<Todo>(
      'todos',
      [where('userId', '==', userId), orderBy('createdAt', 'desc')],
      callback
    ),
};
