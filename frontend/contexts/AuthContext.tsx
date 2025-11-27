'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { apiRequest } from '@/lib/utils';

interface UserProfile {
  role: 'customer' | 'bank' | 'admin';
  name: string;
  email: string;
  bank_name?: string;
  current_credit_score?: number;
  total_debt?: number;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, userData: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (user: User) => {
    try {
      const profile = await apiRequest('/auth/me');
      setUserProfile(profile);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      setUserProfile(null);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Fetch user profile when auth state changes
        await fetchUserProfile(user);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // Fetch user profile after successful login
    await fetchUserProfile(userCredential.user);
  };

  const register = async (email: string, password: string, userData: any) => {
    // 1. Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // 2. Wait a moment for the user to be available
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 3. Register user in backend
    const backendData: any = {
      name: userData.name,
      email: userData.email,
      role: userData.role,
    };

    if (userData.role === 'customer') {
      backendData.income = parseFloat(userData.income);
      backendData.age = parseInt(userData.age);
      backendData.months_employed = parseInt(userData.monthsEmployed);
    } else if (userData.role === 'bank') {
      backendData.bank_name = userData.bankName;
    }

    await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(backendData),
    });

    // 4. Fetch the user profile after registration
    await fetchUserProfile(userCredential.user);
  };

  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
  };

  const refreshUserProfile = async () => {
    if (user) {
      await fetchUserProfile(user);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userProfile, 
      loading, 
      login, 
      register, 
      logout,
      refreshUserProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}