import React, { useState, useRef } from 'react';
import CameraCapture from '../ui/CameraCapture';

const Dashboard = ({ onImageUpload, isLoading, error }) => {
  const [dragOver, setDragOver] = useState(false);
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
  };

  // Determine current state
  let currentState = 'default';
  if (isLoading) currentState = 'loading';
  else if (error) currentState = 'error';
  else if (selectedImage) currentState = 'selected';

  return (
    <div className="w-full max-w-4xl">
      {showCamera && (
        <CameraCapture 
          onCapture={handleCameraCapture} 
          onClose={() => setShowCamera(false)} 
        />
      )}
      <div className="flex flex-col items-center gap-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-4xl font-black tracking-tighter text-custom-text sm:text-5xl md:text-6xl">
            Instantly Identify Cow & Buffalo Breeds
          </h1>
          <p className="max-w-2xl text-base font-normal text-gray-600 sm:text-lg">
            Our advanced recognition tool helps you discover the breed of cattle with a single photo. Simple, fast, and accurate—empowering farmers and enthusiasts alike.
          </p>
        </div>

        {/* State: Default (Upload) */}
        {currentState === 'default' && (
          <div 
            className={`w-full max-w-2xl transition-all duration-200 ${dragOver ? 'scale-[1.02] ring-2 ring-primary' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center gap-6 rounded-xl border-2 border-dashed border-gray-300 bg-white/50 px-6 py-10 shadow-sm">
              <span className="material-symbols-outlined text-5xl text-gray-400">upload_file</span>
              <div className="flex flex-col items-center gap-2">
                <p className="text-lg font-bold text-custom-text">Drag & Drop an Image Here</p>
                <p className="text-sm text-gray-500">Supported formats: JPG, PNG. Max file size: 10MB.</p>
              </div>
              <div className="flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileSelect} 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg bg-primary px-6 text-sm font-bold text-white shadow-sm hover:bg-opacity-90 sm:w-auto"
                >
                  <span className="truncate">Choose File</span>
                </button>
                
                <span className="hidden text-sm text-gray-500 sm:block">or</span>
                
                <button 
                  onClick={() => setShowCamera(true)}
                  className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg bg-gray-100 px-6 text-sm font-bold text-custom-text hover:bg-gray-200 sm:w-auto"
                >
                  <span className="material-symbols-outlined text-xl">photo_camera</span>
                  <span>Use Camera</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* State: Selected (Preview) */}
        {currentState === 'selected' && (
          <div className="w-full max-w-2xl flex flex-col gap-6">
            <div className="flex flex-col">
              <h3 className="px-1 pb-2 pt-0 text-lg font-bold tracking-tight text-custom-text text-left">Image Preview</h3>
              <div className="flex flex-col items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:flex-row">
                <div className="aspect-video w-full max-w-xs flex-shrink-0 overflow-hidden rounded-md bg-gray-100 sm:w-40">
                  <img 
                    className="h-full w-full object-cover" 
                    src={URL.createObjectURL(selectedImage)} 
                    alt="Preview" 
                  />
                </div>
                <div className="flex flex-grow flex-col text-center sm:text-left">
                  <p className="font-semibold text-custom-text truncate max-w-[200px]">{selectedImage.name}</p>
                  <p className="text-sm text-gray-500">{(selectedImage.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
                <button 
                  onClick={handleRemoveImage}
                  className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg bg-gray-100 px-4 text-sm font-medium text-custom-text hover:bg-gray-200 sm:w-auto"
                >
                  <span className="material-symbols-outlined text-xl">delete</span>
                  <span className="truncate">Remove</span>
                </button>
              </div>
            </div>
            <div className="flex justify-center">
                <button 
                  onClick={handleAnalyze}
                  className="flex h-12 min-w-[84px] w-full max-w-md cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-primary px-6 text-base font-bold tracking-wide text-white shadow-md hover:bg-opacity-90"
                >
                  <span className="truncate">Analyze Breed</span>
                </button>
              </div>
          </div>
        )}

        {/* State: Loading */}
        {currentState === 'loading' && (
          <div className="w-full max-w-2xl flex flex-col gap-6">
            <div className="flex flex-col items-center gap-6 rounded-xl border border-gray-200 bg-white px-6 py-14 text-center shadow-sm">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <div className="flex max-w-md flex-col items-center gap-2">
                <p className="text-lg font-bold text-custom-text">Analyzing Image...</p>
                <p className="text-sm text-gray-500">Please wait while we identify the breed. This may take a moment.</p>
              </div>
              <div className="mt-4 w-full max-w-sm rounded-full bg-gray-200 h-2.5">
                <div className="bg-primary h-2.5 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* State: Error */}
        {currentState === 'error' && (
          <div className="w-full max-w-2xl flex flex-col gap-4">
            <div className="flex flex-col items-center gap-6 rounded-xl border-2 border-dashed border-custom-error/50 bg-custom-error/5 px-6 py-14 text-center shadow-sm">
              <span className="material-symbols-outlined text-5xl text-custom-error">error</span>
              <div className="flex max-w-md flex-col items-center gap-2">
                <p className="text-lg font-bold text-custom-text">Upload Failed</p>
                <p className="text-sm text-gray-600">{error || "The selected file is not a supported format. Please upload a JPG or PNG file under 10MB."}</p>
              </div>
              <button 
                onClick={() => setSelectedImage(null)}
                className="flex h-10 min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg bg-custom-error px-4 text-sm font-bold text-white hover:bg-custom-error/90"
              >
                <span className="truncate">Try Again</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
