import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
    <div className="w-full max-w-2xl mx-auto">
      {showCamera && (
        <CameraCapture 
          onCapture={handleCameraCapture} 
          onClose={() => setShowCamera(false)} 
        />
      )}
      
      <div className="flex flex-col items-center gap-8 text-center">
        {/* Hero Text - Only show on default state */}
        {currentState === 'default' && (
          <div className="space-y-3 animate-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">
              Identify Cattle Breeds
            </h1>
            <p className="max-w-lg mx-auto text-base text-primary/60">
              Upload a photo of any cow or buffalo to instantly identify its breed using our AI-powered recognition system.
            </p>
          </div>
        )}

        {/* Upload Area */}
        {currentState === 'default' && (
          <div 
            className={`
              w-full transition-all duration-300 
              ${dragOver ? 'scale-[1.02]' : ''}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className={`
              relative rounded-3xl border-2 border-dashed p-12 text-center transition-all duration-300
              ${dragOver 
                ? 'border-primary bg-primary/5 scale-[1.01]' 
                : 'border-primary/15 hover:border-primary/25 bg-bg-card'
              }
            `}>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileSelect} 
              />
              
              <div className="flex flex-col items-center gap-5">
                {/* Icon */}
                <div className={`
                  w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300
                  ${dragOver ? 'bg-primary/10 scale-110' : 'bg-primary/5'}
                `}>
                  <svg className={`w-10 h-10 transition-colors duration-300 ${dragOver ? 'text-primary' : 'text-primary/40'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>

                <div className="space-y-2">
                  <p className="text-lg font-semibold text-primary">
                    {dragOver ? 'Drop your image here' : 'Drag & drop your image'}
                  </p>
                  <p className="text-sm text-primary/50">or click to browse • JPG, PNG up to 10MB</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm pt-2">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary text-white font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-primary/25"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Choose File
                  </button>
                  
                  <button 
                    onClick={() => setShowCamera(true)}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full border-2 border-primary/15 text-primary font-semibold hover:bg-primary/5 active:scale-[0.98] transition-all duration-200"
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
          </div>
        )}

        {/* Preview State */}
        {currentState === 'selected' && (
          <div className="w-full animate-in slide-in-from-bottom-4 duration-300">
            <div className="rounded-3xl border border-primary/10 bg-bg-card p-6 shadow-lg">
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Image Preview */}
                <div className="relative rounded-2xl overflow-hidden bg-primary/5 w-full sm:w-48 h-48 flex-shrink-0">
                  <img 
                    className="w-full h-full object-cover"
                    src={URL.createObjectURL(selectedImage)} 
                    alt="Preview" 
                  />
                  <button 
                    onClick={handleRemoveImage}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/90 shadow-lg hover:bg-white transition-colors"
                  >
                    <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Info & Action */}
                <div className="flex flex-col justify-between flex-grow">
                  <div>
                    <h3 className="text-lg font-semibold text-primary">Ready to Analyze</h3>
                    <p className="text-sm text-primary/50 mt-1 truncate">{selectedImage.name}</p>
                    <p className="text-sm text-primary/40">{(selectedImage.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button 
                      onClick={handleRemoveImage}
                      className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-primary/15 text-primary font-medium hover:bg-primary/5 transition-colors"
                    >
                      Change
                    </button>
                    <button 
                      onClick={handleAnalyze}
                      className="flex-[2] flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary text-white font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-primary/25"
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
          </div>
        )}

        {/* Beautiful Loading State */}
        {currentState === 'loading' && (
          <div className="w-full animate-in slide-in-from-bottom-4 duration-300">
            <div className="rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-stone-100 p-10 text-center shadow-lg flex flex-col items-center gap-8">
              <div className="relative w-24 h-24 flex items-center justify-center mx-auto mb-2">
                <div className="absolute inset-0 rounded-full border-4 border-amber-100"></div>
                <div className="absolute inset-0 rounded-full border-4 border-amber-400 border-t-transparent animate-spin" style={{ animationDuration: '1.2s' }}></div>
                <div className="absolute inset-3 rounded-full bg-gradient-to-br from-amber-100/60 to-white/80 animate-pulse" />
                <span className="material-symbols-outlined text-4xl text-amber-400 z-10">auto_awesome</span>
              </div>
              <h3 className="text-2xl font-bold text-stone-800 mb-1 tracking-tight">Analyzing Image...</h3>
              <p className="text-stone-500 mb-4">Our AI is identifying the breed. This usually takes a few seconds.</p>
              <div className="w-full max-w-xs mx-auto flex flex-col gap-2">
                <div className="h-3 w-full bg-amber-100 rounded-full overflow-hidden relative">
                  <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-amber-300/60 via-amber-400/80 to-amber-200/0 animate-[shimmer_2s_infinite]" style={{ left: 0 }} />
                  <div className="h-full bg-amber-400 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
                <div className="flex justify-between text-xs text-stone-400 font-medium mt-1">
                  <span>Uploading</span>
                  <span>Analyzing</span>
                  <span>Result</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {currentState === 'error' && (
          <div className="w-full animate-in slide-in-from-bottom-4 duration-300">
            <div className="rounded-3xl border-2 border-red-100 bg-red-50/50 p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-red-600 mb-2">Recognition Failed</h3>
              <p className="text-red-500/70 mb-6">{error || "Something went wrong. Please try again."}</p>
              <button 
                onClick={() => {
                  navigate('/');
                }}
                className="px-6 py-3 rounded-full bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;