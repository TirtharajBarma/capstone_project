import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUser, SignInButton } from '@clerk/clerk-react';
import ResultsPanel from '../components/layout/ResultsPanel';
import { predictionAPI, handleAPIError } from '../services/api';
import { Modal } from '../components/ui';

const ResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isSignedIn } = useUser();
  const { prediction, imageUrl, breedInfo, saved, unsavedPredictionData } = location.state || {};
  
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(saved || false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    if (!prediction) {
      navigate('/');
    }
  }, [prediction, navigate]);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (imageUrl && imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  const handleSaveResult = async () => {
    // If not signed in, show login modal
    if (!isSignedIn) {
      setShowLoginModal(true);
      return;
    }

    // If already saved, do nothing
    if (isSaved) {
      return;
    }

    try {
      setIsSaving(true);

      // Save the prediction
      const response = await predictionAPI.savePrediction(unsavedPredictionData, user.id);

      if (response.success) {
        setIsSaved(true);
        // Show success message or update UI
        // Result saved successfully
      }
    } catch (error) {
      // console.error('Save error:', error);
      const errorInfo = handleAPIError(error);
      alert(errorInfo.message);
    } finally {
      setIsSaving(false);
    }
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
        <div className="text-center p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h2>
          <p className="text-gray-600 mb-6">
            Please sign in to save your prediction results to your history.
          </p>
          <SignInButton mode="modal">
            <button className="w-full bg-amber-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-600 transition-colors">
              Sign In
            </button>
          </SignInButton>
        </div>
      </Modal>
    </>
  );
};

export default ResultsPage;
