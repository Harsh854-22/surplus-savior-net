
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) return;
    
    setIsSubmitting(true);
    
    try {
      await signIn(email, password);
      // Navigation is handled in the Auth context
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // For demo purposes, let's add quick login buttons
  const loginAs = async (role: 'hotel' | 'ngo' | 'volunteer' | 'admin') => {
    setIsSubmitting(true);
    
    try {
      const email = `${role}@example.com`;
      const password = 'password123';
      
      await signIn(email, password);
    } catch (error) {
      console.error('Quick login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md px-8 py-10 glassmorphism rounded-lg shadow-sm">
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Sign In</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email and password to access your account
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Button 
                variant="link" 
                className="p-0 h-auto text-xs"
                onClick={() => navigate('/reset-password')}
                type="button"
              >
                Forgot password?
              </Button>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
              </div>
            ) : 'Sign In'}
          </Button>
        </form>
        
        <div className="text-center text-sm">
          <span className="text-muted-foreground">Don't have an account? </span>
          <Link to="/register" className="text-primary hover:underline">
            Sign up
          </Link>
        </div>
        
        {/* Quick login section for demo purposes */}
        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center mb-3">
            Demo Quick Access
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => loginAs('hotel')}
              disabled={isSubmitting}
            >
              Login as Hotel
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => loginAs('ngo')}
              disabled={isSubmitting}
            >
              Login as NGO
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => loginAs('volunteer')}
              disabled={isSubmitting}
            >
              Login as Volunteer
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => loginAs('admin')}
              disabled={isSubmitting}
            >
              Login as Admin
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
