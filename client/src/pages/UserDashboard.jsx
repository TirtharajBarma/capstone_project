import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import CameraCapture from '../components/ui/CameraCapture';
import Sidebar from '../components/layout/Sidebar';
import { userAPI, handleAPIError } from '../services/api';
import { formatRelativeTime } from '../utils/date';

const UserDashboard = ({ onImageUpload }) => {
  const { user } = useUser();
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
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-white">
      {showCamera && (
        <CameraCapture 
          onCapture={handleCameraCapture} 
          onClose={() => setShowCamera(false)} 
        />
      )}
      
      <div className="flex h-full min-w-0">
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex flex-1 flex-col lg:ml-64 w-full">
          <div className="flex flex-1 flex-col p-4 md:p-8">
            <div className="flex flex-col gap-6">
              {/* Breadcrumbs */}
              <div className="flex flex-wrap gap-2">
                <Link className="text-green-700 text-base font-medium leading-normal hover:text-green-800" to="/">Home</Link>
                <span className="text-gray-500 text-base font-medium leading-normal">/</span>
                <span className="text-gray-800 text-base font-medium leading-normal">Dashboard</span>
              </div>

              {/* Page Heading */}
              <div className="flex flex-wrap justify-between gap-3">
                <div className="flex min-w-72 flex-col gap-2">
                  <p className="text-gray-800 text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
                    Welcome back, {user?.firstName || 'User'}!
                  </p>
                  <p className="text-green-700 text-base font-normal leading-normal">
                    Instantly identify cattle breeds by uploading an image.
                  </p>
                </div>
              </div>

              {/* Image Upload Area */}
              <div 
                className={`flex flex-col items-center gap-6 rounded-xl border-2 border-dashed px-6 py-14 bg-gray-50 transition-colors ${
                  dragOver ? 'border-green-600 bg-green-50' : 'border-gray-300'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="flex max-w-[480px] flex-col items-center gap-2">
                  <p className="text-gray-800 text-lg font-bold leading-tight tracking-[-0.015em] max-w-[480px] text-center">
                    Drag & Drop your image here
                  </p>
                  <p className="text-gray-600 text-sm font-normal leading-normal max-w-[480px] text-center">
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
                    className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-green-600 text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-green-700 transition-colors"
                  >
                    <span className="truncate">Browse Files</span>
                  </button>
                  
                  <button 
                    onClick={() => setShowCamera(true)}
                    className="flex items-center justify-center rounded-lg h-10 px-4 border border-green-600 text-green-600 hover:bg-green-50 transition-colors"
                  >
                    <span className="material-symbols-outlined">photo_camera</span>
                  </button>
                </div>
              </div>

              {/* Section: At a Glance */}
              <div className="flex flex-col">
                <h2 className="text-gray-800 text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3 pt-5">At a Glance</h2>
                {loadingAnalytics ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex flex-col gap-4 p-6 rounded-xl bg-gray-50 animate-pulse">
                        <div className="flex items-center gap-4">
                          <div className="size-12 rounded-full bg-gray-200"></div>
                          <div className="flex flex-col gap-2 flex-1">
                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                            <div className="h-8 bg-gray-200 rounded w-16"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Stat Card: Total Analyses */}
                    <div className="flex flex-col gap-4 p-6 rounded-xl bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center size-12 rounded-full bg-green-100">
                          <span className="material-symbols-outlined text-green-600 text-3xl">analytics</span>
                        </div>
                        <div className="flex flex-col">
                          <p className="text-sm font-medium text-gray-600">Total Analyses</p>
                          <p className="text-3xl font-bold text-gray-800">
                            {analytics?.totalAnalyses?.toLocaleString() || '0'}
                          </p>
                        </div>
                      </div>
                    </div>
                    {/* Stat Card: Unique Breeds */}
                    <div className="flex flex-col gap-4 p-6 rounded-xl bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center size-12 rounded-full bg-green-100">
                          <span className="material-symbols-outlined text-green-600 text-3xl">cruelty_free</span>
                        </div>
                        <div className="flex flex-col">
                          <p className="text-sm font-medium text-gray-600">Unique Breeds</p>
                          <p className="text-3xl font-bold text-gray-800">
                            {analytics?.uniqueBreeds || '0'}
                          </p>
                        </div>
                      </div>
                    </div>
                    {/* Stat Card: Accuracy Rate */}
                    <div className="flex flex-col gap-4 p-6 rounded-xl bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center size-12 rounded-full bg-green-100">
                          <span className="material-symbols-outlined text-green-600 text-3xl">verified</span>
                        </div>
                        <div className="flex flex-col">
                          <p className="text-sm font-medium text-gray-600">Accuracy Rate</p>
                          <p className="text-3xl font-bold text-gray-800">
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
                <h2 className="text-gray-800 text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3 pt-5">Recent Recognitions</h2>
                {loadingAnalytics ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex flex-col gap-3 p-4 rounded-xl bg-gray-50 animate-pulse">
                        <div className="aspect-[4/3] bg-gray-200 rounded-lg"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : analytics?.recentRecognitions && analytics.recentRecognitions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {analytics.recentRecognitions.map((recognition, index) => (
                      <div key={index} className="flex flex-col gap-3 p-4 rounded-xl bg-gray-50">
                        <div 
                          className="bg-center bg-no-repeat aspect-[4/3] bg-cover rounded-lg" 
                          style={{ 
                            backgroundImage: `url("${recognition.breedImage || 'https://via.placeholder.com/400x300?text=' + encodeURIComponent(recognition.breed)}")` 
                          }}
                        ></div>
                        <div className="flex flex-col">
                          <h3 className="text-base font-bold text-gray-800">{recognition.breed}</h3>
                          <p className="text-sm text-gray-600">
                            {formatRelativeTime(recognition.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <p className="text-gray-500">No recent recognitions yet. Upload an image to get started!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <footer className="mt-auto p-8 border-t border-gray-200">
            <div className="flex justify-center items-center gap-6">
              <a className="text-sm text-gray-600 hover:text-green-600" href="#">About</a>
              <a className="text-sm text-gray-600 hover:text-green-600" href="#">Contact</a>
              <a className="text-sm text-gray-600 hover:text-green-600" href="#">Terms of Service</a>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;
