import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { name: 'Analytics', path: '/analytics', icon: 'bar_chart' },
    { name: 'History', path: '/history', icon: 'history' },
    { name: 'Settings', path: '/settings', icon: 'settings' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="hidden lg:flex flex-col h-screen min-h-[700px] justify-between bg-gray-50 p-4 w-64 fixed top-0 left-0 z-20 border-r border-gray-200">
      <div className="flex flex-col gap-8">
        {/* Logo Section */}
        <div className="flex items-center gap-3 px-2">
          <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 bg-primary/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-2xl">pets</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-gray-800 text-lg font-bold leading-normal">BreedRec</h1>
            <p className="text-gray-600 text-sm font-normal leading-normal">Analytics Suite</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex flex-col gap-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span 
                className={`material-symbols-outlined ${isActive(item.path) ? 'text-green-700' : 'text-gray-700'}`}
                style={isActive(item.path) ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.icon}
              </span>
              <p className={`text-sm font-medium ${isActive(item.path) ? 'font-bold' : ''}`}>
                {item.name}
              </p>
            </Link>
          ))}
        </nav>
      </div>

      {/* User Profile Section */}
      <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-white border border-gray-200">
        <UserButton 
          appearance={{
            elements: {
              avatarBox: "w-10 h-10"
            }
          }}
        />
        <div className="flex flex-col flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">Account</p>
          <p className="text-xs text-gray-500 truncate">Manage profile</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
