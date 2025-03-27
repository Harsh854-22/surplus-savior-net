
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import { UserRole } from '@/types';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Check, UtensilsCrossed, Users, UserCog } from 'lucide-react';

export const RegisterForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !role || password !== confirmPassword) return;
    
    setIsSubmitting(true);
    
    try {
      await signUp(email, password, role);
      // Navigation is handled in the Auth context
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextStep = () => {
    if (step === 1 && role) {
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const roleOptions: { role: UserRole; title: string; description: string; icon: JSX.Element }[] = [
    {
      role: 'hotel',
      title: 'Hotel / Restaurant',
      description: 'List surplus food from your establishment',
      icon: <UtensilsCrossed className="h-6 w-6 text-primary" />,
    },
    {
      role: 'ngo',
      title: 'NGO / Charity',
      description: 'Collect and distribute food to those in need',
      icon: <Users className="h-6 w-6 text-primary" />,
    },
    {
      role: 'volunteer',
      title: 'Volunteer',
      description: 'Help with food collection and delivery',
      icon: <UserCog className="h-6 w-6 text-primary" />,
    },
  ];

  return (
    <div className="w-full max-w-md px-8 py-10 glassmorphism rounded-lg shadow-sm transition-all duration-300">
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Create Account</h1>
          <p className="text-sm text-muted-foreground">
            Join our platform to reduce food waste and help those in need
          </p>
        </div>
        
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <p className="text-sm font-medium text-center mb-4">I am a:</p>
            
            <div className="grid gap-4">
              {roleOptions.map((option) => (
                <Card 
                  key={option.role}
                  className={`cursor-pointer transition-all border ${
                    role === option.role 
                      ? 'border-primary bg-primary/5' 
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => setRole(option.role)}
                >
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        {option.icon}
                        <CardTitle className="text-base ml-2">{option.title}</CardTitle>
                      </div>
                      
                      {role === option.role && (
                        <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <CardDescription>{option.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Button 
              className="w-full mt-4" 
              onClick={handleNextStep}
              disabled={!role}
            >
              Continue
            </Button>
          </div>
        )}
        
        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
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
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {password && confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-destructive mt-1">Passwords do not match</p>
              )}
            </div>
            
            <div className="flex gap-3 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={handlePrevStep}
              >
                Back
              </Button>
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={
                  isSubmitting || 
                  !email || 
                  !password || 
                  !confirmPassword || 
                  password !== confirmPassword
                }
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="loading-dot"></div>
                    <div className="loading-dot"></div>
                    <div className="loading-dot"></div>
                  </div>
                ) : 'Create Account'}
              </Button>
            </div>
          </form>
        )}
        
        <div className="text-center text-sm">
          <span className="text-muted-foreground">Already have an account? </span>
          <Link to="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
