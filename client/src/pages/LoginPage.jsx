import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md">
        <SignIn 
          fallbackRedirectUrl="/dashboard"
          signUpUrl="/register"
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

export default LoginPage;