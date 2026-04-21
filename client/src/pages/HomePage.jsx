import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { motion } from 'framer-motion';

const HomePage = () => {
  const navigate = useNavigate();
  const { isLoaded, userId } = useAuth();

  const handleGetStarted = () => {
    if (userId) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 overflow-hidden font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navbar background blur layer */}
      <div className="fixed top-0 inset-x-0 h-20 bg-white/70 backdrop-blur-md z-40 border-b border-white shadow-[0_4px_30px_-5px_rgba(0,0,0,0.05)] border-b border-slate-200/50" />
      
      {/* Clean Navbar */}
      <nav className="fixed top-0 inset-x-0 h-20 px-6 lg:px-12 flex items-center justify-between z-50">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/20 ring-1 ring-indigo-500/50">
            <span className="material-symbols-outlined text-white text-[24px]">pets</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">Breed AI</span>
        </div>
        <div className="flex items-center gap-4">
          {!userId && (
            <button 
              onClick={() => navigate('/login')}
              className="px-5 py-2.5 text-sm font-semibold tracking-wide text-slate-600 hover:text-slate-900 transition-colors"
            >
              Sign In
            </button>
          )}
          <button 
            onClick={handleGetStarted}
            className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold tracking-wide shadow-md shadow-slate-900/10 hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 active:scale-[0.98] transition-all duration-200"
          >
            {userId ? 'Dashboard' : 'Get Started'}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-40 pb-20 lg:pt-52 lg:pb-32 px-6 overflow-hidden">
        {/* Decorative background blurs using purely CSS, no SVGs */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-400/20 blur-[120px] mix-blend-multiply pointer-events-none" />
        <div className="absolute top-[20%] right-[-10%] w-[30%] h-[40%] rounded-full bg-emerald-400/20 blur-[120px] mix-blend-multiply pointer-events-none" />
        
        <div className="relative mx-auto max-w-5xl flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-200/50 bg-white/50 backdrop-blur text-sm font-semibold tracking-wide text-indigo-700 shadow-sm mb-8 ring-1 ring-inset ring-indigo-100">
              <span className="flex size-2 rounded-full bg-indigo-500 relative">
                <span className="absolute inset-0 rounded-full bg-indigo-500 animate-ping opacity-75"></span>
              </span>
              Powered by Advanced ML
            </span>
            
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tighter text-slate-900 leading-[1.1] mb-8">
              Identify Any Dog Breed <br className="hidden lg:block"/>
              With <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400">Pinpoint Accuracy</span>
            </h1>
            
            <p className="text-lg lg:text-xl font-medium tracking-wide text-slate-500 max-w-2xl mx-auto leading-relaxed mb-12">
              Upload a photo and instantly discover the breed heritage. 
              Our neural network is trained on over 120 distinct breeds, delivering rapid and reliable results in seconds.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <button 
              onClick={handleGetStarted}
              className="w-full sm:w-auto group relative flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-indigo-600 text-white font-bold tracking-wide hover:bg-indigo-700 transition-all active:scale-[0.98] shadow-xl shadow-indigo-600/20 overflow-hidden ring-1 ring-inset ring-white/10"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[200%] group-hover:animate-[shimmer_1.5s_infinite]" />
              <span className="relative z-10 flex items-center gap-2">
                Start Analyzing
                <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">arrow_forward</span>
              </span>
            </button>
            <a 
              href="#how-it-works"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold tracking-wide hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]"
            >
              <span className="absolute inset-0 bg-transparent" />
              How it works
            </a>
          </motion.div>
        </div>
      </main>

      {/* Social Proof / Stats Section */}
      <section className="border-y border-slate-200/60 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-12 lg:py-16">
          <p className="text-center text-sm font-bold tracking-widest text-slate-400 uppercase mb-8">
            Trusted Analysis & Recognition
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
              { label: 'Breeds Supported', value: '120+' },
              { label: 'Accuracy Rate', value: '98%' },
              { label: 'Analysis Time', value: '< 2s' },
              { label: 'Happy Users', value: '10k+' }
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center justify-center gap-2">
                <span className="text-3xl lg:text-4xl font-black tracking-tighter text-slate-900">{stat.value}</span>
                <span className="text-sm font-semibold tracking-wide text-slate-500">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section id="how-it-works" className="relative py-24 lg:py-32 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16 lg:mb-24">
            <h2 className="text-3xl lg:text-5xl font-bold tracking-tight text-slate-900 mb-6">
              Intelligence in every pixel
            </h2>
            <p className="text-lg font-medium text-slate-500 max-w-2xl mx-auto">
              A minimalist, powerful interface wrapped around state-of-the-art machine learning models.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: 'photo_camera',
                title: 'Capture or Upload',
                desc: 'Drop an image or take a fresh photo. Our pre-processing ensures the subject is primed for analysis.'
              },
              {
                icon: 'memory',
                title: 'Deep Analysis',
                desc: 'The image passes through our Convolutional Neural Network, identifying unique physical traits instantly.'
              },
              {
                icon: 'analytics',
                title: 'Detailed Insights',
                desc: 'Review confidence scores, read historical breed context, and track all your past scans in the dashboard.'
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -4 }}
                className="group relative flex flex-col p-8 rounded-3xl bg-white border border-slate-100 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-xl hover:shadow-indigo-900/5 transition-all duration-300"
              >
                <div className="size-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6 ring-1 ring-indigo-500/10 group-hover:bg-indigo-600 transition-colors">
                  <span className="material-symbols-outlined text-[28px] text-indigo-600 group-hover:text-white transition-colors">{feature.icon}</span>
                </div>
                <h3 className="text-xl font-bold tracking-tight text-slate-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-[15px] font-medium tracking-wide text-slate-500 leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 bg-white py-10 px-6">
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-slate-900 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[16px]">pets</span>
            </div>
            <span className="font-bold tracking-tight text-slate-900">Breed AI</span>
          </div>
          <p className="text-sm font-medium text-slate-400">
            © {new Date().getFullYear()} Breed AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
