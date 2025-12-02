import React from 'react';
import { SignIn } from '@clerk/clerk-react';

const LoginPage = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md">
        <SignIn 
          redirectUrl="/dashboard"
          afterSignInUrl="/dashboard"
          routing="path"
          path="/login"
          signUpUrl="/register"
        />
      </div>
    </div>
  );
};

export default LoginPage;