
import React from 'react';
import { RegisterForm } from '@/components/auth/RegisterForm';

const Register = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-muted/30">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <RegisterForm />
      </div>
    </div>
  );
};

export default Register;
