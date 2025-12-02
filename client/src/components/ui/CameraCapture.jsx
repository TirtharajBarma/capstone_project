import React, { useRef, useState, useEffect } from 'react';

const CameraCapture = ({ onCapture, onClose }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const isMounted = useRef(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    isMounted.current = true;
    startCamera();

    // Stop camera when tab/window loses visibility (helps desktop cases)
    const onVisibilityChange = () => {
      if (document.hidden) {
        stopCamera();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    // Stop camera on page unload
    const onBeforeUnload = () => stopCamera();
    window.addEventListener('beforeunload', onBeforeUnload);

    return () => {
      isMounted.current = false;
      stopCamera();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (!isMounted.current) {
        // Component unmounted while waiting for permission/stream
        mediaStream.getTracks().forEach(track => track.stop());
        return;
      }

      streamRef.current = mediaStream;
      if (videoRef.current) {
        const videoEl = videoRef.current;
        videoEl.srcObject = mediaStream;
        // Some desktop browsers require muted + explicit play after canplay
        const tryPlay = async () => {
          try {
            await videoEl.play();
          } catch (playError) {
            console.error("Error playing video:", playError);
          }
        };
        if (videoEl.readyState >= 2) {
          tryPlay();
        } else {
          const onCanPlay = () => {
            videoEl.removeEventListener('canplay', onCanPlay);
            tryPlay();
          };
          videoEl.addEventListener('canplay', onCanPlay);
        }
      }
    } catch (err) {
      if (isMounted.current) {
        console.error("Error accessing camera:", err);
        setError("Could not access camera. Please ensure you have granted permission.");
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0);
      
      canvas.toBlob((blob) => {
        const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
        stopCamera();
        onCapture(file);
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
            <video 
              ref={videoRef} 
              autoPlay
              playsInline
              muted
              className="absolute inset-0 h-full w-full object-cover"
            />
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
            disabled={!!error}
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
