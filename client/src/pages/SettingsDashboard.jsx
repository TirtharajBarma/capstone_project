import React from 'react';
import Sidebar from '../components/layout/Sidebar';

const SettingsDashboard = () => {
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-white">
      <div className="flex h-full min-w-0">
        <Sidebar />
        
        <main className="flex flex-1 flex-col lg:ml-64 w-full">
          <div className="flex flex-1 flex-col p-4 md:p-8">
            <div className="flex flex-col gap-6">
              {/* Page Heading */}
              <div className="flex flex-wrap justify-between gap-3">
                <div className="flex min-w-72 flex-col gap-2">
                  <p className="text-gray-800 text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
                    Settings
                  </p>
                  <p className="text-gray-600 text-base font-normal leading-normal">
                    Manage your account preferences.
                  </p>
                </div>
              </div>

              {/* Placeholder Content */}
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-green-600 text-3xl">settings</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Settings</h2>
                <p className="text-gray-600">Customize your preferences here...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsDashboard;
