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
        fixed top-0 left-0 z-40 h-screen w-[292px] border-r border-slate-800/5 bg-[linear-gradient(180deg,#0f172a_0%,#111827_100%)] py-6 px-4 flex flex-col justify-between transition-transform duration-300 ease-out lg:translate-x-0 lg:static lg:h-screen overflow-y-auto shadow-2xl shadow-slate-900/20 lg:shadow-none backdrop-blur-xl
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col gap-8">
          {/* Logo Section */}
          <div className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 px-3 py-3 shadow-[0_20px_50px_-35px_rgba(0,0,0,0.8)] backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-2xl bg-gradient-to-br from-indigo-400 to-cyan-300 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-white/20">
                <span className="material-symbols-outlined text-[24px]">pets</span>
              </div>
              <div className="flex flex-col">
                <h1 className="text-white text-lg font-bold tracking-tight">BreedRec</h1>
                <p className="text-slate-400 text-[11px] font-semibold tracking-[0.18em] uppercase">Analytics Suite</p>
              </div>
            </div>
            {/* Mobile Close Button */}
            <button 
              onClick={onClose}
              className="lg:hidden p-2 -mr-2 rounded-xl hover:bg-white/10 text-slate-300 transition-colors active:scale-95"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex flex-col gap-2 px-1.5">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => onClose && onClose()} 
                className={`group relative flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 border ${
                  isActive(item.path)
                    ? 'bg-white text-slate-950 border-white/15 shadow-[0_20px_40px_-25px_rgba(0,0,0,0.6)]' 
                    : 'border-transparent text-slate-300 hover:bg-white/5 hover:text-white hover:border-white/5 active:scale-[0.99]'
                }`}
              >
                {isActive(item.path) && (
                  <span className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.45)]" />
                )}
                <span className={`flex size-10 flex-none items-center justify-center rounded-xl ${isActive(item.path) ? 'bg-slate-900/5' : 'bg-white/5'} ring-1 ring-white/5`}>
                  <span 
                    className={`material-symbols-outlined text-[20px] leading-none transition-transform duration-200 group-hover:scale-110 ${isActive(item.path) ? 'text-cyan-500' : 'text-slate-400 group-hover:text-white'}`}
                    style={isActive(item.path) ? { fontVariationSettings: "'FILL' 1" } : {}}
                  >
                    {item.icon}
                  </span>
                </span>
                <div className="flex flex-col">
                  <p className={`text-[14px] font-medium tracking-tight ${isActive(item.path) ? 'font-semibold' : ''}`}>
                    {item.name}
                  </p>
                  <span className={`text-[11px] font-medium tracking-wide ${isActive(item.path) ? 'text-slate-500' : 'text-slate-500 group-hover:text-slate-300'}`}>
                    {item.path === '/dashboard' && 'Overview and uploads'}
                    {item.path === '/analytics' && 'Performance patterns'}
                    {item.path === '/history' && 'Saved recognition log'}
                    {item.path === '/settings' && 'Profile and preferences'}
                  </span>
                </div>
              </Link>
            ))}
          </nav>
        </div>

        {/* User Profile Section */}
        <div className="mt-8 px-1.5">
          <div className="rounded-3xl border border-white/10 bg-white/5 px-3 py-3 shadow-[0_20px_50px_-35px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5">
            <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] uppercase text-slate-400">
              <span className="size-2 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.6)]" />
              Account
            </div>
            <div className="flex items-center gap-3">
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10 shadow-sm ring-1 ring-white/10"
                }
              }}
            />
              <div className="flex flex-col flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate tracking-tight">Manage profile</p>
                <p className="text-[12px] font-medium text-slate-400 truncate tracking-wide">View account and sign out</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
