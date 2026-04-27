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

  const features = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: 'Capture or Upload',
      desc: 'Drop an image or take a fresh photo. Our pre-processing ensures the subject is primed for analysis.'
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      title: 'Deep Analysis',
      desc: 'The image passes through our Convolutional Neural Network, identifying unique physical traits instantly.'
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: 'Detailed Insights',
      desc: 'Review confidence scores, read historical breed context, and track all your past scans in the dashboard.'
    }
  ];

  const stats = [
    { label: 'Breeds Supported', value: '120+' },
    { label: 'Accuracy Rate', value: '98%' },
    { label: 'Analysis Time', value: '< 2s' },
    { label: 'Happy Users', value: '10k+' }
  ];

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary overflow-hidden relative">
      {/* Background texture */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grain" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <circle cx="25" cy="25" r="1" fill="currentColor"/>
              <circle cx="75" cy="75" r="1" fill="currentColor"/>
              <circle cx="50" cy="10" r="0.5" fill="currentColor"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grain)"/>
        </svg>
      </div>

      {/* Decorative blobs */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/5 blur-[120px] pointer-events-none" />

      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto h-20 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <div className="size-10 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-xl font-normal tracking-tight">Cattle ID</span>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-4"
          >
            {!userId && (
              <button 
                onClick={() => navigate('/login')}
                className="px-5 py-2.5 text-sm font-medium text-text-secondary hover:text-primary transition-colors"
              >
                Sign In
              </button>
            )}
            <button 
              onClick={handleGetStarted}
              className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-medium shadow-md shadow-primary/20 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98] transition-colors duration-200"
            >
              {userId ? 'Dashboard' : 'Get Started'}
            </button>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-40 pb-20 lg:pt-52 lg:pb-32 px-6">
        <div className="relative mx-auto max-w-5xl flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-secondary/20 bg-secondary/5 text-secondary text-sm font-medium mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
              Powered by Advanced ML
            </span>
            
            <h1 className="text-5xl lg:text-7xl font-normal tracking-tight text-text-primary leading-[1.1] mb-8">
              Identify Any Cattle Breed <br className="hidden lg:block"/>
              With <span className="text-primary">Precision</span>
            </h1>
            
            <p className="text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed mb-12">
              Upload a photo and instantly discover the breed heritage. 
              Our neural network is trained on over 120 distinct breeds, delivering rapid and reliable results in seconds.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <button 
              onClick={handleGetStarted}
              className="group relative w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-primary text-white font-medium shadow-lg shadow-primary/20 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] transition-colors duration-300 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Analyzing
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </button>
            
            <a 
              href="#how-it-works"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white border border-text-muted/20 text-text-secondary font-medium hover:border-secondary hover:text-secondary transition-colors active:scale-[0.98] shadow-sm"
            >
              How it works
            </a>
          </motion.div>
        </div>
      </main>

      {/* Stats Section */}
      <section className="border-y border-text-muted/10 bg-white/50">
        <div className="mx-auto max-w-6xl px-6 py-12 lg:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {stats.map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="flex flex-col items-center justify-center gap-2"
              >
                <span className="text-3xl lg:text-4xl font-normal text-primary">{stat.value}</span>
                <span className="text-sm font-medium text-text-muted">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="how-it-works" className="relative py-24 lg:py-32 px-6">
        <div className="mx-auto max-w-6xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16 lg:mb-24"
          >
            <h2 className="text-3xl lg:text-5xl font-normal tracking-tight text-text-primary mb-6">
              Intelligence in every pixel
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              A powerful interface wrapped around state-of-the-art machine learning models.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                whileHover={{ y: -4 }}
                className="group relative p-8 rounded-3xl bg-white border border-text-muted/10 shadow-sm hover:shadow-xl hover:shadow-text-primary/5 transition-colors duration-300"
              >
                <div className="size-14 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6 group-hover:bg-secondary group-hover:text-white transition-colors duration-300">
                  <div className="text-secondary group-hover:text-white transition-colors duration-300">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-normal tracking-tight text-text-primary mb-3">
                  {feature.title}
                </h3>
                <p className="text-[15px] text-text-secondary leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-text-muted/10 bg-white/30 py-10 px-6">
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-normal tracking-tight">Cattle ID</span>
          </div>
          <p className="text-sm text-text-muted">
            &copy; {new Date().getFullYear()} Cattle ID. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;