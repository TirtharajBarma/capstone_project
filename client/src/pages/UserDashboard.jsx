import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import CameraCapture from '../components/ui/CameraCapture';
import DashboardLayout from '../components/layout/DashboardLayout';
import { userAPI, handleAPIError, predictionAPI } from '../services/api';
import { formatRelativeTime } from '../utils/date';

const UserDashboard = ({ onImageUpload }) => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [dragOver, setDragOver] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const fileInputRef = useRef(null);

  const normalizeConfidence = (value) => {
    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
      return 0;
    }

    if (numericValue <= 1) {
      return numericValue * 100;
    }

    if (numericValue > 100) {
      return Math.min(numericValue / 100, 100);
    }

    return numericValue;
  };

  const getRecognitionSubtitle = (recognition) => {
    if (recognition?.createdAt) {
      return `Saved ${formatRelativeTime(recognition.createdAt)}`;
    }

    return 'Saved recognition from your analysis history';
  };

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user?.id) return;
      
      try {
        setLoadingAnalytics(true);
        const response = await userAPI.getAnalytics(user.id);
        
        if (response.success) {
          setAnalytics(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
        const errorInfo = handleAPIError(error);
        console.error(errorInfo.message);
      } finally {
        setLoadingAnalytics(false);
      }
    };

    fetchAnalytics();
  }, [user?.id]);

  // Check for pending prediction save after sign-in (Clerk may redirect here)
  useEffect(() => {
    const checkPendingSave = async () => {
      if (!user?.id) return;
      
      try {
        const stored = sessionStorage.getItem('pendingPrediction');
        const saveFlag = sessionStorage.getItem('pendingSaveInProgress');
        const completedFlag = sessionStorage.getItem('pendingSaveCompleted');
        
        if (completedFlag === 'true') {
          sessionStorage.removeItem('pendingPrediction');
          sessionStorage.removeItem('pendingSaveInProgress');
          sessionStorage.removeItem('pendingSaveCompleted');
          return;
        }
        
        if (saveFlag === 'true') return;
        if (!stored) return;
        
        const parsed = JSON.parse(stored);
        
        if (parsed?.unsavedPredictionData) {
          // Set flag to prevent duplicate saves
          sessionStorage.setItem('pendingSaveInProgress', 'true');
          
          const resp = await predictionAPI.savePrediction(parsed.unsavedPredictionData, user.id);
          
          if (resp.success) {
            sessionStorage.removeItem('pendingPrediction');
            sessionStorage.removeItem('pendingSaveInProgress');
            sessionStorage.setItem('pendingSaveCompleted', 'true');
            // Refresh analytics to show new prediction - but DON'T reload
            // Just refetch analytics
            try {
              const response = await userAPI.getAnalytics(user.id);
              if (response.success) {
                setAnalytics(response.data);
              }
            } catch (e) {
              console.error('Failed to refresh analytics:', e);
            }
          } else {
            sessionStorage.removeItem('pendingSaveInProgress');
          }
        }
      } catch (e) {
        console.error('Error in pending save:', e);
        sessionStorage.removeItem('pendingSaveInProgress');
      }
    };
    
    // Small delay to ensure Clerk auth is fully loaded
    const timer = setTimeout(checkPendingSave, 500);
    return () => clearTimeout(timer);
  }, [user?.id]);

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
    if (imageFile && onImageUpload) {
      onImageUpload(imageFile);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && onImageUpload) {
      onImageUpload(file);
    }
  };

  const handleCameraCapture = (file) => {
    if (onImageUpload) {
      onImageUpload(file);
    }
    setShowCamera(false);
  };

  return (
    <DashboardLayout>
      {showCamera && (
        <CameraCapture 
          onCapture={handleCameraCapture} 
          onClose={() => setShowCamera(false)} 
        />
      )}
      
      <div className="flex flex-1 flex-col p-4 md:p-8">
        <div className="flex flex-col gap-6">
          {/* Breadcrumbs */}
          <div className="flex flex-wrap gap-2 pt-2 pb-1">
            <Link className="text-slate-500 text-sm font-medium hover:text-slate-900 transition-colors" to="/">Home</Link>
            <span className="text-slate-300 text-sm font-medium">/</span>
            <span className="text-slate-900 text-sm font-medium">Dashboard</span>
          </div>

          {/* Page Heading */}
          <div className="flex flex-wrap justify-between gap-3 mb-2">
            <div className="flex min-w-72 flex-col gap-1.5">
              <p className="text-slate-900 text-3xl font-bold tracking-tight">
                Welcome back, {user?.firstName || 'User'}!
              </p>
              <p className="text-slate-500 text-base font-medium tracking-wide">
                Instantly identify cattle breeds by uploading an image.
              </p>
            </div>
          </div>

          {/* Image Upload Area */}
          <div 
            className={`cursor-pointer group flex flex-col items-center gap-6 rounded-2xl border-2 border-dashed px-6 py-14 transition-all duration-200 mt-2 ${
              dragOver 
                ? 'border-indigo-500 bg-indigo-50/50 scale-[1.02] shadow-sm' 
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50 shadow-sm hover:shadow'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex size-14 items-center justify-center rounded-full bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-indigo-600 transition-colors shadow-sm ring-1 ring-slate-900/5">
              <span className="material-symbols-outlined text-2xl">cloud_upload</span>
            </div>
            <div className="flex max-w-[480px] flex-col items-center gap-2">
              <p className="text-slate-900 text-lg font-semibold tracking-tight max-w-[480px] text-center">
                Drag & Drop your image here
              </p>
              <p className="text-slate-500 text-sm font-medium tracking-wide max-w-[480px] text-center">
                Supports: JPG, PNG, WEBP up to 10MB
              </p>
            </div>
            
            <div className="flex gap-3 mt-2" onClick={(e) => e.stopPropagation()}>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center rounded-xl h-11 px-5 bg-slate-900 text-white text-sm font-medium shadow-sm hover:bg-slate-800 transition-all active:scale-[0.97]"
              >
                Browse Files
              </button>
              
              <button 
                onClick={() => setShowCamera(true)}
                className="flex items-center justify-center rounded-xl h-11 px-4 border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-sm transition-all active:scale-[0.97]"
                aria-label="Use Camera"
              >
                <span className="material-symbols-outlined text-[20px]">photo_camera</span>
              </button>
            </div>
          </div>

          {/* Section: At a Glance */}
          <div className="flex flex-col mt-8">
            <h2 className="text-slate-900 text-xl font-semibold tracking-tight pb-6">At a Glance</h2>
            {loadingAnalytics ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex flex-col p-6 rounded-2xl bg-white border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="size-12 rounded-xl bg-slate-100"></div>
                      <div className="flex flex-col gap-2 flex-1">
                        <div className="h-4 bg-slate-100 rounded w-24"></div>
                        <div className="h-7 bg-slate-100 rounded w-16"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Stat Card: Total Analyses */}
                <div className="flex flex-col p-6 rounded-2xl bg-white border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all hover:shadow-md hover:-translate-y-0.5 duration-300 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 -mr-6 -mt-6 size-24 rounded-full bg-slate-50 opacity-50 group-hover:bg-indigo-50 transition-colors"></div>
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-slate-50 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors ring-1 ring-slate-900/5">
                      <span className="material-symbols-outlined text-[24px]">analytics</span>
                    </div>
                    <div className="flex flex-col flex-1">
                      <p className="text-sm font-medium text-slate-500 tracking-wide uppercase text-[11px]">Total Analyses</p>
                      <p className="text-3xl font-bold tracking-tight text-slate-900 mt-1">
                        {analytics?.totalAnalyses?.toLocaleString() || '0'}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Stat Card: Unique Breeds */}
                <div className="flex flex-col p-6 rounded-2xl bg-white border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all hover:shadow-md hover:-translate-y-0.5 duration-300 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 -mr-6 -mt-6 size-24 rounded-full bg-slate-50 opacity-50 group-hover:bg-emerald-50 transition-colors"></div>
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-slate-50 text-slate-500 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors ring-1 ring-slate-900/5">
                      <span className="material-symbols-outlined text-[24px]">cruelty_free</span>
                    </div>
                    <div className="flex flex-col flex-1">
                      <p className="text-sm font-medium text-slate-500 tracking-wide uppercase text-[11px]">Unique Breeds</p>
                      <p className="text-3xl font-bold tracking-tight text-slate-900 mt-1">
                        {analytics?.uniqueBreeds || '0'}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Stat Card: Accuracy Rate */}
                <div className="flex flex-col p-6 rounded-2xl bg-white border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all hover:shadow-md hover:-translate-y-0.5 duration-300 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 -mr-6 -mt-6 size-24 rounded-full bg-slate-50 opacity-50 group-hover:bg-amber-50 transition-colors"></div>
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-slate-50 text-slate-500 group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors ring-1 ring-slate-900/5">
                      <span className="material-symbols-outlined text-[24px]">verified</span>
                    </div>
                    <div className="flex flex-col flex-1">
                      <p className="text-sm font-medium text-slate-500 tracking-wide uppercase text-[11px]">Avg. Confidence</p>
                      <p className="text-3xl font-bold tracking-tight text-slate-900 mt-1">
                        {analytics?.accuracyRate ? `${analytics.accuracyRate.toFixed(1)}%` : '0%'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section: Recent Recognitions */}
          <div className="flex flex-col mt-8">
            <h2 className="text-slate-900 text-xl font-semibold tracking-tight pb-6">Recent Recognitions</h2>
            {loadingAnalytics ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex flex-col gap-3 p-4 rounded-2xl bg-white border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] animate-pulse">
                    <div className="aspect-[4/3] bg-slate-100 rounded-xl"></div>
                    <div className="h-4 bg-slate-100 rounded w-3/4 mt-1"></div>
                    <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : analytics?.recentRecognitions && analytics.recentRecognitions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {analytics.recentRecognitions.map((recognition, index) => (
                  <div 
                    key={index} 
                    className="group flex flex-col p-4 rounded-2xl bg-white border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                    onClick={() => {
                      const predictionData = {
                        breed: recognition.breed,
                        confidence: recognition.confidence || 0.95,
                      };
                      
                      navigate('/results', { 
                        state: { 
                          prediction: predictionData,
                          imageUrl: recognition.breedImage,
                          saved: true
                        } 
                      });
                    }}
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-100 mb-4 ring-1 ring-slate-900/5">
                      <div 
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-500 group-hover:scale-105" 
                        style={{ 
                          backgroundImage: `url("${recognition.breedImage || 'https://via.placeholder.com/400x300?text=' + encodeURIComponent(recognition.breed)}")` 
                        }}
                      ></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      {/* Optional confidence badge on image */}
                      {recognition.confidence && (
                        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-[11px] font-bold text-slate-800 shadow-sm">
                              {Math.round(normalizeConfidence(recognition.confidence))}%
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col px-1">
                      <h3 className="text-base font-bold text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">{recognition.breed}</h3>
                        <p className="text-[13px] font-medium text-slate-500 tracking-wide mt-0.5">
                          {getRecognitionSubtitle(recognition)}
                        </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white border border-slate-100 border-dashed rounded-2xl">
                <div className="flex size-12 items-center justify-center rounded-full bg-slate-50 mx-auto mb-4">
                  <span className="material-symbols-outlined text-slate-400 text-[24px]">image</span>
                </div>
                <p className="text-slate-500 font-medium">No recent recognitions yet.</p>
                <p className="text-slate-400 text-sm mt-1">Upload an image to get started.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="mt-auto py-8">
        <div className="flex justify-center items-center gap-8">
          <a className="text-sm font-medium tracking-wide text-slate-400 hover:text-slate-900 transition-colors" href="#">About</a>
          <a className="text-sm font-medium tracking-wide text-slate-400 hover:text-slate-900 transition-colors" href="#">Contact</a>
          <a className="text-sm font-medium tracking-wide text-slate-400 hover:text-slate-900 transition-colors" href="#">Terms of Service</a>
        </div>
      </footer>
    </DashboardLayout>
  );
};

export default UserDashboard;
