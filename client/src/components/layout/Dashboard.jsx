import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, ImageIcon, ArrowRight, X, Zap, CheckCircle, Heart } from 'lucide-react';

const Dashboard = ({ onImageUpload, isLoading = false }) => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

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
    if (onImageUpload) {
      onImageUpload(file);
    }
  };

  const handleCameraClick = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment' // Use back camera on mobile
        } 
      });
      setStream(mediaStream);
      setShowCamera(true);
      
      // Set video stream
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (error) {
      console.error('Error accessing camera:', error);
      // Fallback to file input on error
      if (cameraInputRef.current) {
        cameraInputRef.current.click();
      }
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
        handleImageSelection(file);
        closeCamera();
      }, 'image/jpeg', 0.8);
    }
  };

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const supportedBreeds = [
    'Gir', 'Holstein Friesian', 'Sahiwal', 'Red Sindhi',
    'Murrah', 'Jaffarabadi', 'Surti', 'Mehsana'
  ];

  // Cleanup camera stream when component unmounts
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="min-h-screen bg-white">
      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Take Picture</h3>
              <button 
                onClick={closeCamera}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-64 bg-gray-900 rounded-lg object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>
            
            <div className="flex gap-3 mt-4">
              <button
                onClick={capturePhoto}
                className="btn-primary flex-1 hover:shadow-lg hover:scale-105 transition-transform"
              >
                <Camera className="w-4 h-4" />
                <span>Capture</span>
              </button>
              <button
                onClick={closeCamera}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gray-900 rounded-xl flex items-center justify-center mx-auto mb-4 animate-fade-in">
            <Camera className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 animate-fade-in">
            BreedVision AI
          </h1>
          <p className="text-lg text-gray-600 mb-4 max-w-2xl mx-auto animate-fade-in">
            Advanced cattle and buffalo breed recognition powered by artificial intelligence
          </p>
          
          <div className="flex flex-wrap justify-center items-center gap-4 text-sm text-gray-500 animate-fade-in">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
              Instant Recognition
            </span>
            <span>•</span>
            <span>95%+ Accuracy</span>
            <span>•</span>
            <span>11+ Breeds Supported</span>
          </div>
        </div>

        <div className="mt-4 grid lg:grid-cols-5 gap-6">
          {/* Upload Section */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 shadow-md rounded-xl p-8 animate-fade-in h-full">
              {/* Upload Area */}
              <div
                className={`upload-area ${dragOver ? 'drag-over' : ''} ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleUploadClick}
              >
                <div className="w-16 h-16 bg-gray-900 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <ImageIcon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Drop your image here
                </h3>
                <p className="text-gray-600 mb-1">
                  or click to browse files
                </p>
                <p className="text-sm text-gray-500 mb-2">
                  Supports JPEG, PNG up to 5MB
                </p>
                <p className="text-sm text-indigo-600 font-medium">
                  Get instant breed identification in seconds.
                </p>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isLoading}
                />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <button
                  onClick={handleUploadClick}
                  disabled={isLoading}
                  className="btn-primary hover:shadow-lg hover:scale-105 transition-transform"
                >
                  <Upload className="w-5 h-5" />
                  <span>Upload Photo</span>
                </button>
                
                <button
                  onClick={handleCameraClick}
                  disabled={isLoading}
                  className="btn-secondary hover:shadow-lg hover:scale-105 transition-transform"
                >
                  <Camera className="w-5 h-5" />
                  <span>Take Picture</span>
                </button>
              </div>

              {/* Camera input for mobile devices - fallback */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Info Section */}
          <div className="lg:col-span-2 space-y-6 flex flex-col">
            {/* Stats */}
            <div className="bg-gradient-to-br from-gray-50 to-indigo-50 shadow-md rounded-xl p-4 animate-fade-in">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                AI Recognition Stats
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-white shadow-sm rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">11+</div>
                  <div className="text-gray-600 text-sm">Breeds Supported</div>
                </div>
                <div className="text-center p-3 bg-white shadow-sm rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">95%</div>
                  <div className="text-gray-600 text-sm">Accuracy Rate</div>
                </div>
              </div>
            </div>

            {/* Supported Breeds */}
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 shadow-md rounded-xl p-4 animate-fade-in flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Supported Breeds
              </h3>
              <div className="grid grid-cols-1 gap-1.5">
                {supportedBreeds.map((breed) => (
                  <div key={breed} className="flex items-center space-x-2">
                    <ArrowRight className="w-3 h-3 text-indigo-500" />
                    <span className="text-gray-700 text-sm">{breed}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Result Preview Section - Full Width */}
        <div className="mt-12">
          <div className="bg-gradient-to-br from-gray-50 to-indigo-50 border border-gray-200 shadow-lg rounded-xl p-8 animate-fade-in">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">Result Preview</h3>
            {selectedImage ? (
              <div className="flex items-center justify-center space-x-6">
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-gray-600" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-gray-900 mb-1">
                    {selectedImage.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {(selectedImage.size / 1024 / 1024).toFixed(2)} MB • Ready for analysis
                  </p>
                </div>
                <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg">Your result will appear here.</p>
                <p className="text-gray-400 text-sm mt-1">Upload an image to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;