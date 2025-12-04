import React from 'react';
import { UserProfile } from '@clerk/clerk-react';
import DashboardLayout from '../components/layout/DashboardLayout';

const SettingsDashboard = () => {
  return (
    <DashboardLayout>
      <div className="flex-1 p-6 lg:p-10">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
          {/* Page Heading */}
          <div>
            <p className="text-5xl font-black leading-tight tracking-[-0.033em] text-primary">Account Settings</p>
          </div>

          {/* Settings Content */}
          <div className="flex justify-center">
            <UserProfile 
              appearance={{
                elements: {
                  rootBox: "w-full max-w-4xl",
                  card: "shadow-none border border-primary/10 rounded-xl w-full",
                  navbar: "hidden",
                  navbarMobileMenuButton: "hidden",
                  headerTitle: "text-2xl font-bold text-primary",
                  headerSubtitle: "text-primary/70",
                  formButtonPrimary: "bg-primary hover:bg-primary-dark text-white",
                  formFieldInput: "rounded-lg border-primary/20 focus:ring-primary focus:border-primary",
                }
              }}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsDashboard;
