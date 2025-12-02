import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ResultsPanel from '../components/layout/ResultsPanel';

const ResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { prediction, imageUrl, breedInfo } = location.state || {};

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

  if (!prediction) return null;

  return (
    <div className="w-full max-w-6xl mx-auto animate-fade-in">
      <ResultsPanel 
        prediction={prediction} 
        imageUrl={imageUrl} 
        breedInfo={breedInfo}
        onSave={() => console.log('Save')}
        onShare={() => console.log('Share')}
        onDownload={() => console.log('Download')}
      />
    </div>
  );
};

export default ResultsPage;
