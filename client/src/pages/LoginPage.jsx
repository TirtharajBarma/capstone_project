import React from 'react';
import { SignIn } from '@clerk/clerk-react';

const LoginPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 relative overflow-hidden font-sans">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] mix-blend-multiply pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 blur-[120px] mix-blend-multiply pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10 flex flex-col items-center clerk-settings-wrapper justify-center">
        <SignIn 
          routing="path" 
          path="/login" 
          signUpUrl="/register"
          appearance={{
            elements: {
              rootBox: "w-full shadow-2xl shadow-indigo-900/5",
              card: "shadow-none border border-slate-200 rounded-3xl overflow-hidden w-full",
              headerTitle: "text-2xl font-bold tracking-tight text-slate-900",
              headerSubtitle: "text-slate-500 font-medium tracking-wide",
              socialButtonsBlockButton: "border border-slate-200 hover:bg-slate-50/80 transition-all rounded-xl mb-3 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]",
              socialButtonsBlockButtonText: "font-semibold tracking-wide text-slate-700",
              formButtonPrimary: "bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold tracking-wide py-3 rounded-xl transition-all shadow-md shadow-indigo-600/20 active:scale-[0.98]",
              formFieldInput: "rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all py-2.5",
              formFieldLabel: "text-[13px] font-bold tracking-tight text-slate-700",
              dividerLine: "bg-slate-200",
              dividerText: "text-slate-400 font-medium",
              footerActionText: "text-slate-500 font-medium",
              footerActionLink: "text-indigo-600 font-bold tracking-tight hover:text-indigo-700 hover:underline"
            }
          }}
        />
      </div>
    </div>
  );
};

export default LoginPage;
