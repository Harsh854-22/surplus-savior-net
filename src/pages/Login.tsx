
import React from 'react';
import { LoginForm } from '@/components/auth/LoginForm';

const Login = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-muted/30">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Surplus Savior</h1>
          <p className="text-muted-foreground">Fighting food waste in Koparkhairne</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;
