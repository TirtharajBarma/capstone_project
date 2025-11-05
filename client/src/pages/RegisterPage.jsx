import React from 'react';
import { SignUp } from '@clerk/clerk-react';

const RegisterPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Join BreedVision
          </h2>
          <p className="text-gray-600">
            Create your account to start identifying livestock breeds with AI
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg rounded-xl sm:px-10">
          <SignUp 
            appearance={{
              elements: {
                formButtonPrimary: 'bg-gray-900 hover:bg-gray-800 text-white',
                footerActionLink: 'text-indigo-600 hover:text-indigo-500'
              }
            }}
            redirectUrl="/"
            signInUrl="/login"
          />
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;