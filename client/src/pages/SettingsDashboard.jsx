import React, { useState } from 'react';
import { useUser, UserProfile } from '@clerk/clerk-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { toast } from 'react-hot-toast';

const SettingsDashboard = () => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('profile');
  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    newFeatures: false,
    marketing: false
  });

  const handleNotificationToggle = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    toast.success('Notification preferences updated', {
      style: {
        background: '#1e293b',
        color: '#fff',
        borderRadius: '12px',
        fontWeight: 500,
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
      }
    });
  };

  return (
    <DashboardLayout>
      <div className="flex-1 p-4 lg:p-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
          <header className="flex flex-col gap-5 rounded-[2rem] border border-slate-100 bg-white p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] lg:flex-row lg:items-end lg:justify-between lg:p-8">
            <div className="flex flex-col gap-2">
              <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-slate-400">Workspace settings</p>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">
                Settings
              </h1>
              <p className="max-w-2xl text-sm lg:text-base font-medium tracking-wide text-slate-500">
                Manage your account, notifications, and appearance from one place.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 shadow-sm">
                <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-slate-400">Member</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{user?.fullName || user?.firstName || 'Account holder'}</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 shadow-sm">
                <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-slate-400">Email</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{user?.primaryEmailAddress?.emailAddress || 'Not available'}</p>
              </div>
            </div>
          </header>

          <div className="grid gap-8 lg:grid-cols-[320px,1fr]">
            {/* Left Sidebar Nav */}
            <nav className="flex flex-row gap-3 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0 shrink-0">
              {[
                { id: 'profile', icon: 'person', label: 'My Profile', desc: 'Personal details' },
                { id: 'notifications', icon: 'notifications', label: 'Notifications', desc: 'Email preferences' },
                { id: 'appearance', icon: 'palette', label: 'Appearance', desc: 'Theme settings' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group flex min-w-[220px] items-start gap-4 rounded-2xl border p-4 text-left transition-all duration-200 lg:min-w-0 ${
                    activeTab === tab.id 
                      ? 'border-indigo-100 bg-indigo-50/80 shadow-[0_10px_30px_-20px_rgba(79,70,229,0.35)]' 
                      : 'border-slate-100 bg-white hover:-translate-y-0.5 hover:border-slate-200 hover:shadow-sm'
                  }`}
                >
                  <span className={`flex size-11 flex-none items-center justify-center rounded-xl ring-1 ring-slate-900/5 ${activeTab === tab.id ? 'bg-white text-indigo-600' : 'bg-slate-50 text-slate-400 group-hover:text-slate-600'}`}>
                    <span className="material-symbols-outlined text-[22px] leading-none">
                      {tab.icon}
                    </span>
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <span className={`text-[15px] font-bold tracking-tight ${activeTab === tab.id ? 'text-slate-900' : 'text-slate-700'}`}>
                      {tab.label}
                    </span>
                    <span className={`text-[12px] font-medium tracking-wide ${activeTab === tab.id ? 'text-indigo-600/80' : 'text-slate-500'}`}>
                      {tab.desc}
                    </span>
                  </div>
                </button>
              ))}
            </nav>

            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] min-h-[680px]">
              
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="h-full bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-6 lg:p-8">
                  <div className="mb-6 rounded-3xl border border-slate-100 bg-slate-50/80 p-5">
                    <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-slate-400">Profile manager</p>
                    <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-900">Personal details and security</h2>
                    <p className="mt-1 max-w-2xl text-sm font-medium text-slate-500">
                      Update your profile data, connected accounts, and password from the embedded account panel.
                    </p>
                  </div>

                  <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_18px_50px_-30px_rgba(15,23,42,0.35)]">
                    <UserProfile 
                      appearance={{
                        elements: {
                          rootBox: "w-full mx-auto shadow-none",
                          card: "shadow-none border-0 rounded-none",
                          navbar: "hidden",
                          pageScrollBox: "p-0",
                          cardBox: "w-full",
                        }
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="p-6 lg:p-8">
                  <div className="flex flex-col gap-8 max-w-3xl">
                    <div>
                      <h3 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">Email Notifications</h3>
                      <p className="text-slate-500 font-medium tracking-wide mb-6">Choose what updates you receive in your inbox.</p>
                      
                      <div className="flex flex-col gap-6">
                        {[
                          { key: 'emailUpdates', label: 'Analysis Results', desc: 'Get an email when a long-running analysis is complete' },
                          { key: 'newFeatures', label: 'Product Updates', desc: 'Be the first to know about new features and tools' },
                          { key: 'marketing', label: 'Tips & Tricks', desc: 'Weekly articles on dog breeds and training' }
                        ].map((item) => (
                          <div key={item.key} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-200 hover:shadow-md">
                            <div className="flex flex-col gap-1 pr-6">
                              <span className="text-[15px] font-bold text-slate-900 tracking-tight">{item.label}</span>
                              <span className="text-[13px] font-medium text-slate-500 tracking-wide">{item.desc}</span>
                            </div>
                            <button
                              onClick={() => handleNotificationToggle(item.key)}
                              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors active:scale-95 flex-shrink-0 ${
                                notifications[item.key] ? 'bg-emerald-500' : 'bg-slate-200'
                              }`}
                            >
                              <span 
                                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ring-1 ring-black/5 ${
                                  notifications[item.key] ? 'translate-x-6' : 'translate-x-1'
                                }`} 
                              />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Appearance Tab */}
              {activeTab === 'appearance' && (
                <div className="p-6 lg:p-8">
                  <div className="flex flex-col gap-8 max-w-3xl">
                    <div>
                      <h3 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">Theme Preferences</h3>
                      <p className="text-slate-500 font-medium tracking-wide mb-6">Customize the look and feel of your dashboard.</p>
                      
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {/* Light Theme */}
                        <div className="relative group cursor-pointer">
                          <input type="radio" name="theme" id="theme-light" className="peer sr-only" defaultChecked />
                          <label htmlFor="theme-light" className="block w-full rounded-[1.5rem] border-2 border-slate-200 bg-white p-2 transition-all cursor-pointer hover:-translate-y-0.5 hover:bg-slate-50 peer-checked:border-indigo-600 peer-checked:ring-4 peer-checked:ring-indigo-600/10">
                            <div className="mb-4 flex h-32 w-full flex-col gap-2 rounded-[1.15rem] border border-slate-200 bg-slate-50 p-3">
                              <div className="w-1/2 h-3 bg-white rounded-full shadow-sm"></div>
                              <div className="w-full h-12 bg-white rounded-lg shadow-sm border border-slate-100 flex items-center justify-center">
                                <span className="material-symbols-outlined text-slate-300">light_mode</span>
                              </div>
                            </div>
                            <div className="px-2 pb-2">
                              <span className="block text-sm font-bold text-slate-900 tracking-tight">Light</span>
                              <span className="block text-xs font-medium text-slate-500">Default elegant</span>
                            </div>
                          </label>
                          <div className="absolute top-4 right-4 size-5 rounded-full border-2 border-slate-300 bg-white shadow-sm peer-checked:border-indigo-600 peer-checked:bg-indigo-600 flex items-center justify-center opacity-0 group-hover:opacity-50 peer-checked:opacity-100 transition-opacity">
                            <span className="material-symbols-outlined text-white text-[12px]">check</span>
                          </div>
                        </div>

                        {/* Dark Theme (disabled state visually) */}
                        <div className="relative group cursor-not-allowed opacity-60">
                          <label className="block w-full rounded-[1.5rem] border-2 border-slate-200 bg-white p-2 cursor-not-allowed filter grayscale">
                            <div className="mb-4 flex h-32 w-full flex-col gap-2 rounded-[1.15rem] border border-slate-800 bg-slate-900 p-3">
                              <div className="w-1/2 h-3 bg-slate-800 rounded-full shadow-sm"></div>
                              <div className="w-full h-12 bg-slate-800 rounded-lg shadow-sm border border-slate-700 flex items-center justify-center">
                                <span className="material-symbols-outlined text-slate-600">dark_mode</span>
                              </div>
                            </div>
                            <div className="px-2 pb-2">
                              <span className="block text-sm font-bold text-slate-900 tracking-tight">Dark</span>
                              <span className="block text-xs font-medium text-slate-500">Coming soon</span>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsDashboard;
