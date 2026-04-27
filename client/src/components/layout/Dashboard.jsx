import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import CameraCapture from '../ui/CameraCapture';

const Dashboard = ({ onImageUpload, isLoading, error }) => {
  const [dragOver, setDragOver] = useState(false);
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    if (imageFile) {
      handleImageSelection(imageFile);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageSelection(file);
    }
  };

  const handleImageSelection = (file) => {
    setSelectedImage(file);
  };

  const handleCameraCapture = (file) => {
    handleImageSelection(file);
    setShowCamera(false);
  };

  const handleAnalyze = () => {
    if (selectedImage && onImageUpload) {
      onImageUpload(selectedImage);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  let currentState = 'default';
  if (isLoading) currentState = 'loading';
  else if (error) currentState = 'error';
  else if (selectedImage) currentState = 'selected';

  return (
    <div className="w-full max-w-3xl mx-auto">
      <AnimatePresence mode="wait">
        {showCamera && (
          <CameraCapture 
            onCapture={handleCameraCapture} 
            onClose={() => setShowCamera(false)} 
          />
        )}
      </AnimatePresence>
      
      <div className="flex flex-col items-center gap-10 text-center">
        {/* Hero Text - Only show on default state */}
        <AnimatePresence mode="wait">
          {currentState === 'default' && (
            <motion.div 
              key="hero"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-4"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                AI-Powered Recognition
              </div>
              <h1 className="text-4xl md:text-5xl font-normal text-text-primary">
                Identify Cattle <span className="text-primary">Breeds</span>
              </h1>
              <p className="text-text-secondary max-w-md mx-auto text-base leading-relaxed">
                Upload a photo of any cow or buffalo. Our neural network identifies the breed instantly.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload Area */}
        <AnimatePresence mode="wait">
          {currentState === 'default' && (
            <motion.div 
              key="upload"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="w-full"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className={`
                relative overflow-hidden rounded-3xl border-2 border-dashed p-10 text-center transition-all duration-300 cursor-pointer group
                ${dragOver 
                  ? 'border-primary bg-primary/5 scale-[1.01]' 
                  : 'border-text-muted/20 hover:border-primary/30 bg-white hover:bg-bg-card-subtle'
                }
              `}>
                {/* Decorative corner accents */}
                <div className="absolute top-0 left-0 w-12 h-12 border-l-2 border-t-2 border-primary/20 rounded-tl-3xl -translate-x-2 -translate-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-0 right-0 w-12 h-12 border-r-2 border-b-2 border-primary/20 rounded-br-3xl translate-x-2 translate-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileSelect} 
                />
                
                <div className="flex flex-col items-center gap-6">
                  {/* Icon */}
                  <div className={`
                    relative w-24 h-24 rounded-2xl flex items-center justify-center transition-all duration-300
                    ${dragOver ? 'bg-primary/10 scale-110' : 'bg-bg-card-subtle group-hover:bg-secondary/10'}
                  `}>
                    <div className="absolute inset-0 rounded-2xl border border-text-muted/10" />
                    {dragOver ? (
                      <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    ) : (
                      <svg className="w-10 h-10 text-text-muted group-hover:text-secondary transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>

                  <div className="space-y-1">
                    <p className="text-lg font-semibold text-text-primary">
                      {dragOver ? 'Drop your image here' : 'Drag & drop your image'}
                    </p>
                    <p className="text-sm text-text-muted">or click to browse • JPG, PNG up to 10MB</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm pt-2">
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      Choose File
                    </button>
                    
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setShowCamera(true); }}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border-2 border-text-muted/20 text-text-secondary font-semibold hover:border-secondary hover:text-secondary active:scale-[0.98] transition-all duration-200"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Use Camera
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Preview State */}
        <AnimatePresence mode="wait">
          {currentState === 'selected' && (
            <motion.div 
              key="preview"
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="w-full"
            >
              <div className="rounded-3xl bg-white p-6 shadow-lg border border-text-muted/10">
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Image Preview */}
                  <div className="relative rounded-2xl overflow-hidden bg-bg-card-subtle w-full sm:w-48 h-48 flex-shrink-0 ring-1 ring-text-muted/10">
                    <img 
                      className="w-full h-full object-cover"
                      src={URL.createObjectURL(selectedImage)} 
                      alt="Preview" 
                    />
                    <button 
                      onClick={handleRemoveImage}
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/90 shadow-md hover:bg-white transition-colors border border-text-muted/10"
                    >
                      <svg className="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Info & Action */}
                  <div className="flex flex-col justify-between flex-grow">
                    <div>
                      <h3 className="text-lg font-semibold text-text-primary">Ready to Analyze</h3>
                      <p className="text-sm text-text-muted mt-1 truncate">{selectedImage.name}</p>
                      <p className="text-sm text-text-muted/70">{(selectedImage.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>

                    <div className="flex gap-3 mt-4">
                      <button 
                        onClick={handleRemoveImage}
                        className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-text-muted/20 text-text-secondary font-medium hover:border-primary/30 hover:text-primary transition-colors"
                      >
                        Change
                      </button>
                      <button 
                        onClick={handleAnalyze}
                        className="flex-[2] flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Analyze Breed
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        <AnimatePresence mode="wait">
          {currentState === 'loading' && (
            <motion.div 
              key="loading"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="w-full"
            >
              <div className="rounded-3xl border border-secondary/20 bg-gradient-to-br from-white via-bg-card-subtle to-white p-10 text-center shadow-lg">
                <div className="relative w-28 h-28 mx-auto mb-6">
                  {/* Outer ring */}
                  <div className="absolute inset-0 rounded-full border-4 border-secondary/10"></div>
                  {/* Spinning ring */}
                  <div className="absolute inset-0 rounded-full border-4 border-secondary border-t-transparent animate-spin" style={{ animationDuration: '1.5s' }}></div>
                  {/* Inner pulse */}
                  <div className="absolute inset-4 rounded-full bg-gradient-to-br from-secondary/10 to-accent/10 animate-pulse" />
                  {/* Icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-10 h-10 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-normal text-text-primary mb-2">Analyzing Image...</h3>
                <p className="text-text-secondary mb-6">Our AI is identifying the breed. This usually takes a few seconds.</p>
                
                {/* Progress steps */}
                <div className="w-full max-w-xs mx-auto">
                  <div className="flex justify-between text-xs font-medium text-text-muted mb-3">
                    <span className="text-primary">Uploading</span>
                    <span className="text-secondary">Processing</span>
                    <span className="text-text-muted/50">Complete</span>
                  </div>
                  <div className="h-1.5 w-full bg-secondary/10 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-secondary to-accent rounded-full"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 2.5, ease: 'easeInOut' }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error State */}
        <AnimatePresence mode="wait">
          {currentState === 'error' && (
            <motion.div 
              key="error"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="w-full"
            >
              <div className="rounded-3xl border-2 border-red-200/50 bg-red-50/30 p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-red-600 mb-2">Recognition Failed</h3>
                <p className="text-red-500/70 mb-6">{error || "Something went wrong. Please try again."}</p>
                <button 
                  onClick={() => navigate('/')}
                  className="px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Dashboard;