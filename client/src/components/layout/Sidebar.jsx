import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { name: 'Analytics', path: '/analytics', icon: 'bar_chart' },
    { name: 'History', path: '/history', icon: 'history' },
    { name: 'Settings', path: '/settings', icon: 'settings' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <div className={`
        fixed top-0 left-0 z-40 h-screen w-64 bg-bg-card border-r border-primary/10 p-4 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen overflow-y-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col gap-8">
          {/* Logo Section */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 bg-primary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-2xl">pets</span>
              </div>
              <div className="flex flex-col">
                <h1 className="text-primary text-lg font-bold leading-normal">BreedRec</h1>
                <p className="text-primary/70 text-sm font-normal leading-normal">Analytics Suite</p>
              </div>
            </div>
            {/* Mobile Close Button */}
            <button 
              onClick={onClose}
              className="lg:hidden p-1 rounded-md hover:bg-bg-card-subtle text-primary/70"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex flex-col gap-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => onClose && onClose()} // Close sidebar on navigation (mobile)
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-bg-card-subtle text-primary'
                    : 'text-primary/70 hover:bg-bg-card-subtle'
                }`}
              >
                <span 
                  className={`material-symbols-outlined ${isActive(item.path) ? 'text-primary' : 'text-primary/70'}`}
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
        <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-bg-card-subtle border border-primary/10">
          <UserButton 
            appearance={{
              elements: {
                avatarBox: "w-10 h-10"
              }
            }}
          />
          <div className="flex flex-col flex-1 min-w-0">
            <p className="text-sm font-medium text-primary truncate">Account</p>
            <p className="text-xs text-primary/70 truncate">Manage profile</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
