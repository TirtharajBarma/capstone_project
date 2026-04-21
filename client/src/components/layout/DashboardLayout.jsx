import React, { useState } from 'react';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="relative flex h-screen w-full bg-[#f8fafc] overflow-hidden font-geist">
      {/* Mobile Header with Hamburger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleSidebar}
            className="p-2 -ml-2 rounded-xl hover:bg-slate-50 text-slate-800 transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-600 text-2xl">pets</span>
            <span className="font-bold tracking-tight text-slate-900">BreedRec</span>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 pt-[60px] lg:pt-0 overflow-y-auto h-full px-2 lg:px-6">
        <div className="max-w-[1240px] w-full mx-auto pb-12">
          {children}
        </div>
      </main>

      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-20 lg:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={closeSidebar}
      />
    </div>
  );
};

export default DashboardLayout;
