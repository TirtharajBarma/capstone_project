import React from 'react';
import { SignUp } from '@clerk/clerk-react';

const RegisterPage = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md">
        <SignUp 
          fallbackRedirectUrl="/dashboard"
          signInUrl="/login"
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-none bg-transparent"
            }
          }}
        />
      </div>
    </div>
  );
};

export default RegisterPage;