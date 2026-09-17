import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  User,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (name: string, email: string, pass: string, role: UserRole, agency?: string) => Promise<void>;
  signInWithGoogle: (preferredRole?: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  quickLoginAs: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Known predefined credentials for instant multi-role demonstration
export const DEMO_ACCOUNTS: Record<UserRole, { name: string; email: string; pass: string; agency: string }> = {
  citizen: {
    name: 'Aarav Sharma',
    email: 'aarav.sharma@example.in',
    pass: 'RoadSetu@2026',
    agency: '',
  },
  authority: {
    name: 'Eng. Rajesh Kulkarni',
    email: 'rajesh.kulkarni@bmc.gov.in',
    pass: 'RoadSetu@2026',
    agency: 'Brihanmumbai Municipal Corporation (BMC)',
  },
  contractor: {
    name: 'Ramesh Patel',
    email: 'ramesh.patel@infratech.in',
    pass: 'RoadSetu@2026',
    agency: 'InfraTech RoadWorks Pvt Ltd',
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper to fetch or create user document in Firestore
  const loadProfile = async (firebaseUser: User, fallbackRole?: UserRole) => {
    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const data = userDocSnap.data() as UserProfile;
        setUserProfile(data);
      } else {
        // Create initial profile in Firestore
        const now = new Date().toISOString();
        const role: UserRole = fallbackRole || 'citizen';
        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Civic User',
          email: firebaseUser.email || '',
          role,
          createdAt: now,
          updatedAt: now,
        };
        await setDoc(userDocRef, newProfile);
        setUserProfile(newProfile);
      }
    } catch (err) {
      console.warn('Profile read note:', err);
      // Fallback in-memory profile so UI never breaks
      setUserProfile({
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Citizen',
        email: firebaseUser.email || '',
        role: fallbackRole || 'citizen',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setCurrentUser(firebaseUser);
      if (firebaseUser) {
        await loadProfile(firebaseUser);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      await loadProfile(cred.user);
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.message?.includes('invalid-credential')) {
        throw new Error('Incorrect email or password, or no account exists with this email yet. If you are a new user, please click "Sign Up" below.');
      } else if (err.code === 'auth/wrong-password') {
        throw new Error('Incorrect password. Please verify and try again.');
      } else if (err.code === 'auth/operation-not-allowed') {
        throw new Error('Email/Password provider is not active in this Firebase project. You can use Google Sign-In or 1-Click Role Testing.');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    name: string,
    email: string,
    pass: string,
    role: UserRole,
    agency?: string
  ) => {
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(cred.user, { displayName: name });

      const now = new Date().toISOString();
      const newProfile: UserProfile = {
        uid: cred.user.uid,
        name,
        email,
        role,
        agencyOrCompany: agency,
        createdAt: now,
        updatedAt: now,
      };

      try {
        await setDoc(doc(db, 'users', cred.user.uid), newProfile);
      } catch (firestoreErr) {
        console.warn('Profile write note:', firestoreErr);
      }
      setUserProfile(newProfile);
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        throw new Error('An account already exists with this email. Please switch to "Sign In".');
      } else if (err.code === 'auth/weak-password') {
        throw new Error('Password should be at least 6 characters.');
      } else if (err.code === 'auth/operation-not-allowed') {
        throw new Error('Email/Password provider is not active in this Firebase project. Please use Google Sign-In or 1-Click Role Testing.');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async (preferredRole: UserRole = 'citizen') => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const cred = await signInWithPopup(auth, provider);
      await loadProfile(cred.user, preferredRole);
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        return;
      }
      console.warn('Google sign-in issue:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  // Helper for 1-click role testing
  const quickLoginAs = async (role: UserRole) => {
    const account = DEMO_ACCOUNTS[role];
    try {
      const cred = await signInWithEmailAndPassword(auth, account.email, account.pass);
      await loadProfile(cred.user, role);
    } catch (err: any) {
      // If account doesn't exist yet, attempt automatic creation
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.message?.includes('invalid-credential')) {
        try {
          const cred = await createUserWithEmailAndPassword(auth, account.email, account.pass);
          await updateProfile(cred.user, { displayName: account.name });
          const now = new Date().toISOString();
          const profile: UserProfile = {
            uid: cred.user.uid,
            name: account.name,
            email: account.email,
            role,
            agencyOrCompany: account.agency,
            createdAt: now,
            updatedAt: now,
          };
          try {
            await setDoc(doc(db, 'users', cred.user.uid), profile);
          } catch {}
          setUserProfile(profile);
          return;
        } catch (createErr: any) {
          console.warn('Quick account creation notice:', createErr?.code || createErr);
        }
      }

      // Safe fallback profile for immediate multi-role evaluation
      const now = new Date().toISOString();
      const fallbackUid = `demo_${role}_user`;
      const fallbackProfile: UserProfile = {
        uid: fallbackUid,
        name: account.name,
        email: account.email,
        role,
        agencyOrCompany: account.agency,
        createdAt: now,
        updatedAt: now,
      };
      setUserProfile(fallbackProfile);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        quickLoginAs,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
