import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';

const Navigation = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="flex justify-center w-full px-4 md:px-10 lg:px-20 xl:px-40">
      <header className="w-full max-w-6xl flex items-center justify-between whitespace-nowrap border-b border-solid border-primary/10 py-4 bg-bg-card">
        <div className="flex items-center gap-4 text-primary">
          <div className="size-6">
            <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M16 8v-2c0-1.103-.897-2-2-2h-4c-1.103 0-2 .897-2 2v2h-2.586l-2.707 2.707a1 1 0 0 0 .707 1.707h2.586v3.586a1 1 0 0 0 1.707.707l2.707-2.707v-2.586h2v2.586l2.707 2.707a1 1 0 0 0 1.707-.707v-3.586h2.586a1 1 0 0 0 .707-1.707l-2.707-2.707h-2.586zm-6-2h4v2h-4v-2zm-3.414 4h10.828l1.293 1.293h-13.414l1.293-1.293zm3.414 3.414v3.293l-1.293 1.293h-1.414v-4.586h2.707zm4 0h2.707v4.586h-1.414l-1.293-1.293v-3.293z"></path></svg>
          </div>
          <Link to="/" className="text-xl font-bold leading-tight tracking-[-0.015em] text-primary">Breed Recognizer</Link>
        </div>

        <div className="flex flex-1 justify-end gap-8 items-center">
          {!isHomePage && (
            <div className="hidden md:flex items-center gap-9">
              <Link to="/" className="text-sm font-medium leading-normal text-primary/70 hover:text-primary">Home</Link>
              <Link to="/history" className="text-sm font-medium leading-normal text-primary/70 hover:text-primary">History</Link>
              <Link to="/about" className="text-sm font-medium leading-normal text-primary/70 hover:text-primary">About</Link>
            </div>
          )}
          
          <SignedIn>
            <Link to="/dashboard" className="hidden md:block text-sm font-medium leading-normal text-primary/70 hover:text-primary mr-4">
              Dashboard
            </Link>
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10"
                }
              }}
            />
          </SignedIn>
          <SignedOut>
            <Link
              to="/login"
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-opacity-90 transition-colors"
            >
              <span className="truncate">My Account</span>
            </Link>
          </SignedOut>
        </div>
      </header>
    </div>
  );
};

export default Navigation;