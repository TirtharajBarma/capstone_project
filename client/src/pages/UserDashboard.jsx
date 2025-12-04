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
          <div className="flex flex-wrap gap-2">
            <Link className="text-primary text-base font-medium leading-normal hover:opacity-80" to="/">Home</Link>
            <span className="text-primary/50 text-base font-medium leading-normal">/</span>
            <span className="text-primary text-base font-medium leading-normal">Dashboard</span>
          </div>

          {/* Page Heading */}
          <div className="flex flex-wrap justify-between gap-3">
            <div className="flex min-w-72 flex-col gap-2">
              <p className="text-primary text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
                Welcome back, {user?.firstName || 'User'}!
              </p>
              <p className="text-primary text-base font-normal leading-normal">
                Instantly identify cattle breeds by uploading an image.
              </p>
            </div>
          </div>

          {/* Image Upload Area */}
          <div 
            className={`flex flex-col items-center gap-6 rounded-xl border-2 border-dashed px-6 py-14 bg-bg-card transition-colors ${
              dragOver ? 'border-primary bg-bg-card-subtle' : 'border-primary/20'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex max-w-[480px] flex-col items-center gap-2">
              <p className="text-primary text-lg font-bold leading-tight tracking-[-0.015em] max-w-[480px] text-center">
                Drag & Drop your image here
              </p>
              <p className="text-primary/70 text-sm font-normal leading-normal max-w-[480px] text-center">
                Supports: JPG, PNG, WEBP
              </p>
            </div>
            
            <div className="flex gap-4">
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:opacity-90 transition-colors"
              >
                <span className="truncate">Browse Files</span>
              </button>
              
              <button 
                onClick={() => setShowCamera(true)}
                className="flex items-center justify-center rounded-lg h-10 px-4 border border-primary text-primary hover:bg-bg-card-subtle transition-colors"
              >
                <span className="material-symbols-outlined">photo_camera</span>
              </button>
            </div>
          </div>

          {/* Section: At a Glance */}
          <div className="flex flex-col">
            <h2 className="text-primary text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3 pt-5">At a Glance</h2>
            {loadingAnalytics ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex flex-col gap-4 p-6 rounded-xl bg-bg-card animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="size-12 rounded-full bg-bg-card-subtle"></div>
                      <div className="flex flex-col gap-2 flex-1">
                        <div className="h-4 bg-bg-card-subtle rounded w-24"></div>
                        <div className="h-8 bg-bg-card-subtle rounded w-16"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Stat Card: Total Analyses */}
                <div className="flex flex-col gap-4 p-6 rounded-xl bg-bg-card">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center size-12 rounded-full bg-bg-card-subtle">
                      <span className="material-symbols-outlined text-primary text-3xl">analytics</span>
                    </div>
                    <div className="flex flex-col">
                      <p className="text-sm font-medium text-primary/70">Total Analyses</p>
                      <p className="text-3xl font-bold text-primary">
                        {analytics?.totalAnalyses?.toLocaleString() || '0'}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Stat Card: Unique Breeds */}
                <div className="flex flex-col gap-4 p-6 rounded-xl bg-bg-card">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center size-12 rounded-full bg-bg-card-subtle">
                      <span className="material-symbols-outlined text-primary text-3xl">cruelty_free</span>
                    </div>
                    <div className="flex flex-col">
                      <p className="text-sm font-medium text-primary/70">Unique Breeds</p>
                      <p className="text-3xl font-bold text-primary">
                        {analytics?.uniqueBreeds || '0'}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Stat Card: Accuracy Rate */}
                <div className="flex flex-col gap-4 p-6 rounded-xl bg-bg-card">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center size-12 rounded-full bg-bg-card-subtle">
                      <span className="material-symbols-outlined text-primary text-3xl">verified</span>
                    </div>
                    <div className="flex flex-col">
                      <p className="text-sm font-medium text-primary/70">Accuracy Rate</p>
                      <p className="text-3xl font-bold text-primary">
                        {analytics?.accuracyRate ? `${analytics.accuracyRate.toFixed(1)}%` : '0%'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section: Recent Recognitions */}
          <div className="flex flex-col">
            <h2 className="text-primary text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3 pt-5">Recent Recognitions</h2>
            {loadingAnalytics ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex flex-col gap-3 p-4 rounded-xl bg-bg-card animate-pulse">
                    <div className="aspect-[4/3] bg-bg-card-subtle rounded-lg"></div>
                    <div className="h-4 bg-bg-card-subtle rounded w-3/4"></div>
                    <div className="h-3 bg-bg-card-subtle rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : analytics?.recentRecognitions && analytics.recentRecognitions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {analytics.recentRecognitions.map((recognition, index) => (
                  <div 
                    key={index} 
                    className="flex flex-col gap-3 p-4 rounded-xl bg-bg-card cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => {
                      // Navigate to results page with the prediction data
                      // Note: We might need to reconstruct the full prediction object if it's not fully stored in recentRecognitions
                      // For now, we'll pass what we have and let ResultsPage handle it or fetch if needed
                      // Assuming recognition object has enough info or we might need to fetch by ID if available
                      // But based on the schema, it seems we might just have basic info.
                      // Let's try to pass it as 'prediction' state.
                      
                      // Construct a minimal prediction object
                      const predictionData = {
                        breed: recognition.breed,
                        confidence: recognition.confidence || 0.95, // Fallback if not saved
                        // We might not have the full topPredictions list here, so we might need to mock or omit
                      };
                      
                      navigate('/results', { 
                        state: { 
                          prediction: predictionData,
                          imageUrl: recognition.breedImage,
                          saved: true // It's from history, so it's saved
                        } 
                      });
                    }}
                  >
                    <div 
                      className="bg-center bg-no-repeat aspect-[4/3] bg-cover rounded-lg" 
                      style={{ 
                        backgroundImage: `url("${recognition.breedImage || 'https://via.placeholder.com/400x300?text=' + encodeURIComponent(recognition.breed)}")` 
                      }}
                    ></div>
                    <div className="flex flex-col">
                      <h3 className="text-base font-bold text-primary">{recognition.breed}</h3>
                      <p className="text-sm text-primary/70">
                        {formatRelativeTime(recognition.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-bg-card rounded-xl">
                <p className="text-primary/50">No recent recognitions yet. Upload an image to get started!</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="mt-auto p-8 border-t border-primary/10">
        <div className="flex justify-center items-center gap-6">
          <a className="text-sm text-primary/70 hover:text-primary" href="#">About</a>
          <a className="text-sm text-primary/70 hover:text-primary" href="#">Contact</a>
          <a className="text-sm text-primary/70 hover:text-primary" href="#">Terms of Service</a>
        </div>
      </footer>
    </DashboardLayout>
  );
};

export default UserDashboard;
