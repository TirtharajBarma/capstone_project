import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUser, SignInButton } from '@clerk/clerk-react';
import ResultsPanel from '../components/layout/ResultsPanel';
import { predictionAPI, breedsAPI, handleAPIError } from '../services/api';
import { Modal } from '../components/ui';

const ResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isSignedIn, isLoaded } = useUser();
  
  // Store prediction data in state to persist across Clerk auth changes
  const [predictionState, setPredictionState] = useState(() => {
    const state = location.state || {};
    return {
      prediction: state.prediction || null,
      imageUrl: state.imageUrl || null,
      breedInfo: state.breedInfo || null,
      saved: state.saved || false,
      unsavedPredictionData: state.unsavedPredictionData || null
    };
  });
  
  const { prediction, imageUrl, breedInfo, saved, unsavedPredictionData } = predictionState;
  
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(saved || false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const pendingSaveRef = useRef(false);
  const hasCheckedPrediction = useRef(false);
  const saveAttemptedRef = useRef(false);

  // Helper to convert Blob URL to Base64
  const blobUrlToBase64 = async (url) => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Helper to convert Base64 to Blob
  const base64ToBlob = async (base64) => {
    const res = await fetch(base64);
    return await res.blob();
  };

  // Only redirect if we've confirmed there's no prediction (and not during initial render)
  useEffect(() => {
    // Wait for Clerk to load and give time for state to be set
    if (isLoaded && !hasCheckedPrediction.current) {
      hasCheckedPrediction.current = true;
      // Try to hydrate from sessionStorage if we lost state during auth
      if (!prediction) {
        try {
          const stored = sessionStorage.getItem('pendingPrediction');
          if (stored) {
            const parsed = JSON.parse(stored);
            
            // Restore image from Base64 if available
            let restoredImageUrl = parsed.imageUrl;
            if (parsed.imageBase64) {
              // Convert Base64 back to Blob URL for display
              fetch(parsed.imageBase64)
                .then(res => res.blob())
                .then(blob => {
                  const newUrl = URL.createObjectURL(blob);
                  setPredictionState(prev => ({ ...prev, imageUrl: newUrl }));
                });
            }

            setPredictionState(prev => ({
              ...prev,
              prediction: parsed.prediction || null,
              imageUrl: restoredImageUrl || null,
              breedInfo: parsed.breedInfo || null,
              saved: false,
              unsavedPredictionData: parsed.unsavedPredictionData || null
            }));
          }
        } catch (e) {
          console.error('Error hydrating from sessionStorage:', e);
        }
      }
    }
  }, [isLoaded, prediction]);

  // Fetch breed info if missing (e.g. when navigating from history)
  useEffect(() => {
    const fetchBreedDetails = async () => {
      if (prediction && prediction.breed && !breedInfo) {
        try {
          console.log('Fetching missing breed info for:', prediction.breed);
          const response = await breedsAPI.getByName(prediction.breed);
          if (response.success) {
            setPredictionState(prev => ({
              ...prev,
              breedInfo: response.data
            }));
          }
        } catch (error) {
          console.error('Failed to fetch breed details:', error);
        }
      }
    };

    fetchBreedDetails();
  }, [prediction, breedInfo]);

  // Auto-save after user signs in (if they clicked save before signing in)
  useEffect(() => {
    // DISABLED: Dashboard now handles all post-login saves
    // This prevents duplicate saves when Clerk redirects to /dashboard
  }, [isSignedIn, isLoaded, user?.id]);

  // Cleanup blob URL on unmount - DISABLED to prevent revoking URL passed from App.jsx
  // App.jsx manages the lifecycle of the initial image URL
  // If we hydrate from Base64, we might leak one URL per session restore, which is acceptable
  /*
  useEffect(() => {
    return () => {
      if (imageUrl && imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);
  */

  // Actual save function
  const performSaveWithData = async (dataToSave) => {
    if (!dataToSave || !user?.id) {
      console.error('Missing data for save:', { dataToSave, userId: user?.id });
      alert('Unable to save. Missing prediction data.');
      saveAttemptedRef.current = false;
      return;
    }

    try {
      setIsSaving(true);
      
      let finalDataToSave = { ...dataToSave };

      // Check if we need to upload the image first
      // If imageUrl is a blob URL, we need to upload it
      if (imageUrl && imageUrl.startsWith('blob:')) {
        try {
          // Fetch the blob
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          
          // Create a File object (optional, but good for name)
          const file = new File([blob], "prediction-image.jpg", { type: blob.type });
          
          // Upload to Cloudinary
          console.log('Uploading image to Cloudinary...');
          const uploadResult = await predictionAPI.uploadImage(file);
          console.log('Upload result:', uploadResult);
          
          if (uploadResult.success) {
            // Update the data with Cloudinary URL
            finalDataToSave.imageUrl = uploadResult.data.url;
            finalDataToSave.imageMetadata = {
              ...finalDataToSave.imageMetadata,
              width: uploadResult.data.width,
              height: uploadResult.data.height,
              format: uploadResult.data.format
            };
            console.log('Updated prediction data with image URL:', finalDataToSave.imageUrl);
            
            // Also update local state to use the new URL (optional, but good practice)
            // But be careful not to revoke the blob URL yet if it's used elsewhere
          }
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          // Fallback: try to save without uploading (will likely fail or save without image)
          // Or throw error to stop saving
          throw new Error('Failed to upload image. Please try again.');
        }
      }

      // Clear sessionStorage immediately to prevent any duplicate attempts
      try {
        sessionStorage.removeItem('pendingPrediction');
      } catch {}
      
      console.log('Saving prediction to DB...', finalDataToSave);
      const response = await predictionAPI.savePrediction(finalDataToSave, user.id);

      if (response.success) {
        setIsSaved(true);
        // Navigate to dashboard after successful save
        navigate('/dashboard', { replace: true });
      } else {
        saveAttemptedRef.current = false;
      }
    } catch (error) {
      console.error('Save error:', error);
      const errorInfo = handleAPIError(error);
      alert(errorInfo.message);
      saveAttemptedRef.current = false;
    } finally {
      setIsSaving(false);
    }
  };

  // Wrapper for backward compatibility
  const performSave = () => performSaveWithData(unsavedPredictionData);

  const handleSaveResult = async () => {
    // If not signed in, persist pending prediction and show login
    if (!isSignedIn) {
      pendingSaveRef.current = true;
      
      let imageBase64 = null;
      if (predictionState.imageUrl && predictionState.imageUrl.startsWith('blob:')) {
        try {
          imageBase64 = await blobUrlToBase64(predictionState.imageUrl);
        } catch (e) {
          console.error('Failed to convert blob to base64:', e);
        }
      }

      const dataToStore = {
        prediction: predictionState.prediction,
        imageUrl: predictionState.imageUrl, // Keep original URL for reference (though it may expire)
        imageBase64: imageBase64, // Store actual data
        breedInfo: predictionState.breedInfo,
        unsavedPredictionData: {
          ...predictionState.unsavedPredictionData,
          searchTimestamp: Date.now() // Unique timestamp for this search session
        }
      };
      
      try {
        sessionStorage.setItem('pendingPrediction', JSON.stringify(dataToStore));
        // Clear the completed flag since this is a NEW search/save attempt
        sessionStorage.removeItem('pendingSaveCompleted');
        sessionStorage.removeItem('pendingSaveInProgress');
      } catch (e) {
        console.error('Failed to store to sessionStorage:', e);
      }
      
      setShowLoginModal(true);
      return;
    }

    // If already saved, do nothing
    if (isSaved) {
      return;
    }

    await performSave();
  };

  if (!prediction) return null;

  return (
    <>
      <div className="w-full max-w-6xl mx-auto animate-fade-in">
        <ResultsPanel 
          prediction={prediction} 
          imageUrl={imageUrl} 
          breedInfo={breedInfo}
          onSave={handleSaveResult}
          onShare={() => {}}
          onDownload={() => {}}
          isSaved={isSaved}
          isSaving={isSaving}
        />
      </div>

      {/* Login Modal */}
      <Modal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)}>
        <div className="text-center p-4">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-amber-600 text-3xl">lock</span>
          </div>
          <h2 className="text-2xl font-bold text-primary mb-3">Login Required</h2>
          <p className="text-primary/70 mb-6 leading-relaxed">
            Please sign in to save your prediction results to your history.
          </p>
          <SignInButton mode="modal">
            <button className="w-full bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-colors">
              Sign In to Save
            </button>
          </SignInButton>
          <button 
            onClick={() => setShowLoginModal(false)}
            className="w-full mt-3 text-primary/50 hover:text-primary py-2 text-sm"
          >
            Cancel
          </button>
        </div>
      </Modal>
    </>
  );
};

export default ResultsPage;
