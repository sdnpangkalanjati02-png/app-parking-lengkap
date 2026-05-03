/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
} from 'firebase/auth';
import { 
  doc, 
  onSnapshot, 
  setDoc, 
  deleteDoc,
  collection
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  users: User[];
  isLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Sync with Firestore profile
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        
        // Listen for profile changes
        const unsubProfile = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setUser({ ...docSnap.data(), id: docSnap.id } as User);
          } else {
            // Initial profile creation for new users
            const newUser: User = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'Anonymous',
              username: firebaseUser.email?.split('@')[0] || 'user',
              role: 'karyawan', // Default role
            };
            setDoc(userDocRef, newUser).catch(e => handleFirestoreError(e, OperationType.WRITE, `users/${firebaseUser.uid}`));
            setUser(newUser);
          }
          setIsLoading(false);
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
          setIsLoading(false);
        });

        // Sync all users (if admin)
        const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
          setUsers(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as User)));
        }, (error) => {
          // Silent fail for non-admins as they won't have permission to list
          console.warn("User list access restricted");
        });

        return () => {
          unsubProfile();
          unsubUsers();
        };
      } else {
        setUser(null);
        setUsers([]);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const updateUser = async (updatedUser: User) => {
    try {
      const { id, ...data } = updatedUser;
      await setDoc(doc(db, 'users', id), data, { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${updatedUser.id}`);
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'users', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `users/${id}`);
    }
  };

  return (
    <AuthContext.Provider value={{ user, users, isLoading, loginWithGoogle, logout, updateUser, deleteUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
