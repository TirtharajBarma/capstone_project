import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Camera, Home, History, BarChart3, Menu, X } from 'lucide-react';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/clerk-react';

const Navigation = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/history', label: 'History', icon: History },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar-sticky">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">BreedVision</h1>
              <p className="text-xs text-gray-600">AI-Powered Recognition</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2 ${
                    isActive(item.path)
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="flex items-center space-x-2 text-gray-700 transition duration-200 px-3 py-2 text-sm font-medium hover:text-indigo-600">
                  <span>Login</span>
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="btn-primary text-sm">
                  <span>Sign Up</span>
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10",
                    userButtonPopoverCard: "shadow-2xl",
                    userButtonPopoverActions: "bg-white"
                  }
                }}
              />
            </SignedIn>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-xl text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-all duration-200 transform active:scale-95"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white shadow-lg animate-fade-in">
            <div className="px-4 pt-4 pb-6 space-y-2">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 transform hover:scale-105 ${
                      isActive(item.path)
                        ? 'bg-gray-900 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-50 active:bg-gray-100'
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              
              <div className="border-t border-gray-100 pt-4 mt-4 space-y-2">
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 active:bg-gray-100 rounded-xl transition-all duration-200 transform hover:scale-105 w-full text-left">
                      <span className="font-medium">Login</span>
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="flex items-center space-x-3 px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 active:bg-gray-700 shadow-md transition-all duration-200 transform hover:scale-105 w-full text-left">
                      <span className="font-medium">Sign Up</span>
                    </button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <div className="flex items-center space-x-3 px-4 py-3">
                    <UserButton 
                      appearance={{
                        elements: {
                          avatarBox: "w-8 h-8"
                        }
                      }}
                    />
                    <span className="font-medium text-gray-700">My Account</span>
                  </div>
                </SignedIn>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;