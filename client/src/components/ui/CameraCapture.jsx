import React, { useRef, useState, useEffect, useCallback } from 'react';

const CameraCapture = ({ onCapture, onClose }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const isMounted = useRef(true);
  const [error, setError] = useState(null);
  const [isReady, setIsReady] = useState(false);

  // Robust function to stop all tracks and release camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach(track => {
        track.stop(); // This turns off the hardware camera light
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      // If a stream already exists, stop it first
      stopCamera();

      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      // If component unmounted during the async call, stop immediately
      if (!isMounted.current) {
        mediaStream.getTracks().forEach(track => track.stop());
        return;
      }

      streamRef.current = mediaStream;

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;

        // Wait for video to be ready before playing to avoid black screen
        videoRef.current.onloadedmetadata = async () => {
          if (!isMounted.current || !videoRef.current) return;
          try {
            await videoRef.current.play();
            setIsReady(true);
          } catch (playError) {
            console.error("Error playing video preview:", playError);
            // Retry play if interrupted
            if (playError.name !== 'AbortError') {
              setError("Could not start video preview.");
            }
          }
        };
      }
    } catch (err) {
      if (isMounted.current) {
        console.error("Error accessing camera:", err);
        let errorMessage = "Could not access camera.";
        if (err.name === 'NotAllowedError') {
          errorMessage = "Camera permission denied. Please allow access.";
        } else if (err.name === 'NotFoundError') {
          errorMessage = "No camera found on this device.";
        } else if (err.name === 'NotReadableError') {
          errorMessage = "Camera is currently in use by another app.";
        }
        setError(errorMessage);
      }
    }
  }, [stopCamera]);

  useEffect(() => {
    isMounted.current = true;
    startCamera();

    // Cleanup function
    return () => {
      isMounted.current = false;
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  const capturePhoto = () => {
    if (videoRef.current && isReady) {
      const video = videoRef.current;

      // Create canvas matching video dimensions
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      
      // Draw current video frame to canvas
      ctx.drawImage(video, 0, 0);

      // CRITICAL: Stop camera hardware IMMEDIATELY after capturing the frame
      // This ensures the green light goes off right away
      stopCamera();

      // Convert canvas to file
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
          onCapture(file);
        } else {
          setError("Failed to capture image.");
        }
      }, 'image/jpeg', 0.95);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-0 md:p-4 animate-fade-in">
      <div className="relative w-full h-full md:h-auto md:max-w-2xl overflow-hidden bg-white md:rounded-2xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4 shrink-0">
          <h3 className="text-lg font-bold text-gray-900">Take Photo</h3>
          <button 
            onClick={handleClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>
        
        {/* Camera Viewport */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
          {error ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center text-white">
              <span className="material-symbols-outlined text-4xl text-red-400">videocam_off</span>
              <p className="text-gray-300">{error}</p>
            </div>
          ) : (
            <>
              {/* Loading Spinner until video is ready */}
              {!isReady && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="w-10 h-10 border-4 border-white/20 border-t-white/80 rounded-full animate-spin"></div>
                </div>
              )}
              <video
                ref={videoRef}
                playsInline
                muted
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${isReady ? 'opacity-100' : 'opacity-0'}`}
              />
            </>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-8 bg-white px-6 py-6 shrink-0">
          <button 
            onClick={handleClose}
            className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          
          <button 
            onClick={capturePhoto}
            disabled={!!error || !isReady}
            className="group relative flex h-16 w-16 items-center justify-center rounded-full border-4 border-custom-teal bg-transparent transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="h-12 w-12 rounded-full bg-custom-teal transition-transform group-hover:scale-90"></div>
          </button>

          <div className="w-[46px]"></div> {/* Spacer for centering */}
        </div>
      </div>
    </div>
  );
};

export default CameraCapture;
