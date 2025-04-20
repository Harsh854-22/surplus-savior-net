
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          // Fetch user profile data
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (!profile) {
            setUser(null);
            setLoading(false);
            return;
          }

          // Initialize location data with default values
          let locationData = { lat: 0, lng: 0 };
          
          // Fetch role-specific profile which contains location data
          try {
            if (profile.role === 'hotel') {
              const { data: hotelProfile } = await supabase
                .from('hotel_profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
                
              if (hotelProfile && hotelProfile.location) {
                locationData = extractLocationData(hotelProfile.location);
              }
            } 
            else if (profile.role === 'ngo') {
              const { data: ngoProfile } = await supabase
                .from('ngo_profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
                
              if (ngoProfile && ngoProfile.location) {
                locationData = extractLocationData(ngoProfile.location);
              }
            }
            else if (profile.role === 'volunteer') {
              const { data: volunteerProfile } = await supabase
                .from('volunteer_profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
                
              if (volunteerProfile && volunteerProfile.location) {
                locationData = extractLocationData(volunteerProfile.location);
              }
            }
          } catch (error) {
            console.error("Error fetching role-specific profile:", error);
          }

          // Make sure we're creating a valid User object with all required properties
          setUser({
            id: session.user.id,
            email: session.user.email!,
            name: profile?.name || '',
            role: profile?.role as User['role'],
            phone: profile?.phone || '',
            address: profile?.address || '',
            profileComplete: profile?.profile_complete || false,
            createdAt: session.user.created_at ? new Date(session.user.created_at).getTime() : Date.now(),
            location: locationData
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    // Helper function to extract location data safely
    const extractLocationData = (locationData: any): { lat: number, lng: number } => {
      try {
        // If location is stored as a string, parse it
        if (typeof locationData === 'string') {
          const parsedLocation = JSON.parse(locationData);
          return {
            lat: parsedLocation.lat || 0,
            lng: parsedLocation.lng || 0
          };
        } 
        // If location is already an object
        else if (typeof locationData === 'object' && locationData) {
          return {
            lat: locationData.lat || 0,
            lng: locationData.lng || 0
          };
        }
      } catch (e) {
        console.error("Error parsing location data:", e);
      }
      
      // Default fallback
      return { lat: 0, lng: 0 };
    };

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Sign in successful",
        description: "Welcome back!",
      });
      
      // Navigation will be handled by the auth state change listener
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message,
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
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: role,
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Sign up successful",
        description: "Welcome! Let's set up your profile.",
      });
      navigate('/profile/setup');
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
      console.error("Sign up error:", error);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive",
      });
      console.error("Sign out error:", error);
    }
  };

  const updateUserProfile = async (updates: Partial<User>) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: updates.name,
          phone: updates.phone,
          address: updates.address,
          profile_complete: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      setUser({ ...user, ...updates });
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });

      // Redirect based on role
      navigate(`/${user.role}/dashboard`);
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
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
