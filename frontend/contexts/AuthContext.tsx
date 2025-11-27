"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { apiRequest } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface UserProfile {
  role: "customer" | "bank" | "admin";
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
  loginWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create Google Auth Provider instance
const googleProvider = new GoogleAuthProvider();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Updated fetchUserProfile to include the token
  const fetchUserProfile = async (user: User) => {
    try {
      const token = await user.getIdToken();
      const profile = await apiRequest("/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUserProfile(profile);
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      setUserProfile(null);
      throw error; // Re-throw to handle in loginWithGoogle
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
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    // Fetch user profile after successful login
    await fetchUserProfile(userCredential.user);
  };

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      try {
        // Try to fetch user profile first
        await fetchUserProfile(user);
        // If successful, user exists - redirect to dashboard
        router.push("/dashboard");
      } catch (error) {
        // If fetching profile fails, user doesn't exist in backend
        console.log(
          "User profile not found, redirecting to profile completion..."
        );
        // Redirect to profile completion page instead of auto-registering
        router.push("/google-register");
      }
    } catch (error) {
      console.error("Google sign-in failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, userData: any) => {
    // 1. Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // 2. Wait for the user to be available
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 3. Register user in backend - simplified since role is always customer
    const backendData = {
      name: userData.name,
      email: userData.email,
      role: "customer", // Explicitly set to customer
      income: userData.income ? parseFloat(userData.income) : 0,
      date_of_birth: userData.date_of_birth,
      employment_start_date: userData.employment_start_date,
    };

    const token = await userCredential.user.getIdToken();

    await apiRequest("/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
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
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        login,
        register,
        logout,
        refreshUserProfile,
        loginWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}