
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { auth } from '@/lib/firebase';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: User['role']) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up authentication state listener
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const user = await auth.signIn(email, password);
      setUser(user);
      toast({
        title: "Sign in successful",
        description: `Welcome back, ${user.name || email}!`,
      });
      
      // Redirect based on role and profile completion
      if (!user.profileComplete) {
        navigate('/profile/setup');
      } else {
        navigate(`/${user.role}/dashboard`);
      }
    } catch (error) {
      toast({
        title: "Sign in failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      });
      console.error("Sign in error:", error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, role: User['role']) => {
    setLoading(true);
    try {
      const user = await auth.signUp(email, password, role);
      setUser(user);
      toast({
        title: "Sign up successful",
        description: "Welcome! Let's set up your profile.",
      });
      navigate('/profile/setup');
    } catch (error) {
      toast({
        title: "Sign up failed",
        description: "Could not create your account. Please try again.",
        variant: "destructive",
      });
      console.error("Sign up error:", error);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await auth.signOut();
      setUser(null);
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Sign out failed",
        description: "Could not sign you out. Please try again.",
        variant: "destructive",
      });
      console.error("Sign out error:", error);
    }
  };

  const updateUserProfile = async (updates: Partial<User>) => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Update the user profile in the database
      const updatedUser = await auth.signIn(user.email, "password"); // Mock update
      setUser({ ...user, ...updates });
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Could not update your profile. Please try again.",
        variant: "destructive",
      });
      console.error("Profile update error:", error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
