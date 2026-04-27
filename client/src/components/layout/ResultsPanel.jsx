import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import BreedMap from '../ui/BreedMap';
import { Modal } from '../ui/Modal';

const ResultsPanel = ({ 
  prediction, 
  breedInfo, 
  imageUrl, 
  onSave,
  isSaved = false,
  isSaving = false
}) => {
  const navigate = useNavigate();
  const [isDisclaimerOpen, setIsDisclaimerOpen] = React.useState(false);

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

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
      return;
    }

    navigate('/');
  };

  if (!prediction) return null;

  const confidencePercentage = Math.round(normalizeConfidence(prediction.confidence));
  
  const otherPossibilities = prediction.topPredictions && prediction.topPredictions.length > 1 
    ? prediction.topPredictions.slice(1, 3).map(p => ({ 
        name: p.breed, 
        confidence: Math.round(normalizeConfidence(p.confidence)) 
      }))
    : [];

  return (
    <div className="flex flex-col mx-auto max-w-6xl w-full px-4 lg:px-8 py-8 lg:py-12 gap-8 pt-32 lg:pt-36">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-text-muted/10 pb-6 mb-2">
        <div className="flex flex-col gap-1">
          <button 
            onClick={handleBack}
            className="group flex w-fit items-center gap-2 text-[13px] font-medium text-text-muted hover:text-primary transition-colors uppercase tracking-widest mb-2"
          >
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-3xl lg:text-4xl font-normal tracking-tight text-text-primary">
            Analysis Complete
          </h1>
        </div>
        
        <div className="hidden lg:flex items-center gap-3">
          <button 
            onClick={() => navigate('/')}
            className="flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl px-5 py-2.5 bg-white border border-text-muted/20 text-text-secondary text-sm font-medium transition-all shadow-sm hover:border-secondary hover:text-secondary active:scale-[0.98]"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            New Scan
          </button>
          <button 
            onClick={onSave}
            disabled={isSaved || isSaving}
            className={`flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl px-6 py-2.5 text-sm font-medium transition-all shadow-md active:scale-[0.98] ${
              isSaved 
                ? 'bg-secondary text-white shadow-secondary/20 opacity-100' 
                : isSaving 
                  ? 'bg-primary/70 text-white cursor-wait' 
                  : 'bg-primary text-white shadow-primary/20 hover:bg-primary/90'
            }`}
          >
            {isSaved ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : isSaving ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            )}
            {isSaved ? 'Saved to History' : isSaving ? 'Saving...' : 'Save Result'}
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Column: Image and Map */}
        <div className="flex flex-col gap-8">
          <div className="group relative w-full aspect-[4/3] rounded-3xl overflow-hidden bg-bg-card-subtle border border-text-muted/10 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-t from-text-primary/40 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <motion.img 
              src={imageUrl} 
              alt={prediction.breed}
              className="w-full h-full object-cover"
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <div className="flex flex-col gap-4 p-6 rounded-3xl bg-white border border-text-muted/10 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-normal tracking-tight text-text-primary">Geographical Origin</h2>
              <svg className="w-6 h-6 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="aspect-[16/9] w-full bg-bg-card-subtle rounded-2xl overflow-hidden ring-1 ring-text-muted/10 relative">
               {breedInfo?.location ? (
                 <BreedMap 
                   lat={breedInfo.location.lat} 
                   lng={breedInfo.location.lng} 
                   breedName={prediction.breed}
                   region={breedInfo.location.region}
                 />
               ) : (
                 <div className="w-full h-full flex flex-col items-center justify-center text-text-muted gap-2">
                   <svg className="w-8 h-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                   </svg>
                   <p className="font-medium text-sm">Location data unavailable</p>
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* Right Column: Breed Details */}
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-6 p-8 rounded-3xl bg-white border border-text-muted/10 shadow-lg relative overflow-hidden">
            
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <svg className="w-24 h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>

            <div className="relative z-10 flex flex-col items-start">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-[13px] font-medium bg-secondary/10 text-secondary mb-4 ring-1 ring-secondary/10">
                Primary Match
              </span>
              <h2 className="text-4xl font-normal tracking-tight text-text-primary mb-2 flex items-center justify-between w-full">
                {prediction.breed}
                <button 
                  onClick={() => setIsDisclaimerOpen(true)}
                  className="flex items-center justify-center size-8 rounded-full bg-bg-card-subtle text-text-muted hover:text-primary hover:bg-secondary/10 transition-colors"
                  title="Disclaimer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </h2>
              <p className="text-base text-text-secondary leading-relaxed max-w-lg">
                {breedInfo?.description || `Typical characteristics of the ${prediction.breed} breed.`}
              </p>
            </div>
            
            <div className="relative z-10 flex flex-col gap-3 p-5 rounded-2xl bg-bg-card-subtle border border-text-muted/10">
              <div className="flex items-center justify-between w-full">
                <span className="text-[13px] font-medium text-text-secondary uppercase tracking-wide">Confidence Score</span>
                <span className="text-lg font-semibold text-primary">{confidencePercentage}%</span>
              </div>
              <div className="w-full bg-text-muted/10 rounded-full h-3 overflow-hidden shadow-inner">
                <motion.div 
                  className="bg-gradient-to-r from-primary to-accent h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(confidencePercentage, 100)}%` }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                />
              </div>
            </div>

            {(breedInfo?.characteristics || breedInfo?.traits) && (
              <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                {breedInfo?.characteristics && (
                  <div className="flex flex-col gap-3 p-5 rounded-2xl bg-bg-card-subtle border border-text-muted/10">
                    <span className="flex items-center gap-2 text-[14px] font-medium text-text-primary tracking-tight">
                      <svg className="w-4 h-4 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                      </svg>
                      Physical Traits
                    </span>
                    <ul className="flex flex-col gap-2 text-[13px] font-normal text-text-secondary">
                      {breedInfo.characteristics.color && (
                        <li className="flex justify-between border-b border-text-muted/10 pb-1.5">
                          <span className="text-text-muted">Color</span> 
                          <span className="text-text-primary text-right">{[].concat(breedInfo.characteristics.color).join(', ')}</span>
                        </li>
                      )}
                      {breedInfo.characteristics.horns && (
                        <li className="flex justify-between border-b border-text-muted/10 pb-1.5">
                          <span className="text-text-muted">Horns</span> 
                          <span className="text-text-primary text-right">{breedInfo.characteristics.horns}</span>
                        </li>
                      )}
                      {breedInfo.characteristics.size && (
                        <li className="flex justify-between">
                          <span className="text-text-muted">Size</span> 
                          <span className="text-text-primary text-right">{breedInfo.characteristics.size}</span>
                        </li>
                      )}
                    </ul>
                  </div>
                )}
                {breedInfo?.traits && breedInfo.traits.length > 0 && (
                  <div className="flex flex-col gap-3 p-5 rounded-2xl bg-bg-card-subtle border border-text-muted/10 overflow-hidden">
                    <span className="flex items-center gap-2 text-[14px] font-medium text-text-primary tracking-tight">
                      <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      Key Details
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {breedInfo.traits.map((trait, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded-lg text-[12px] font-medium bg-white border border-text-muted/10 text-text-secondary shadow-sm">
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {otherPossibilities.length > 0 && (
              <div className="relative z-10 pt-6 border-t border-text-muted/10 flex flex-col gap-4">
                <span className="text-[13px] font-medium text-text-secondary uppercase tracking-wide">Other Possibilities</span>
                <div className="flex flex-col gap-3">
                  {otherPossibilities.map((item, index) => (
                    <div key={index} className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-[14px] font-medium">
                        <span className="text-text-secondary">{item.name}</span> 
                        <span className="text-text-muted">{item.confidence}%</span>
                      </div>
                      <div className="w-full bg-text-muted/10 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-text-muted/30 h-full rounded-full" 
                          style={{ width: `${item.confidence}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="flex flex-col lg:hidden gap-3 w-full">
            <button 
              onClick={onSave}
              disabled={isSaved || isSaving}
              className={`flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl px-6 py-4 text-base font-medium transition-all shadow-md active:scale-[0.98] ${
                isSaved 
                  ? 'bg-secondary text-white shadow-secondary/20 opacity-100' 
                  : 'bg-primary text-white shadow-primary/20'
              }`}
            >
              {isSaved ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              )}
              {isSaved ? 'Saved to History' : isSaving ? 'Saving...' : 'Save Result'}
            </button>
            <button 
              onClick={() => navigate('/')}
              className="flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl px-6 py-4 bg-white border border-text-muted/20 text-text-secondary text-base font-medium transition-all shadow-sm hover:border-secondary hover:text-secondary"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              New Scan
            </button>
          </div>
        </div>
      </div>

      <Modal 
        isOpen={isDisclaimerOpen} 
        onClose={() => setIsDisclaimerOpen(false)}
        title="Analysis Disclaimer"
      >
        <div className="p-6 bg-white rounded-3xl max-w-md w-full flex flex-col gap-6 shadow-2xl">
          <div className="size-12 rounded-xl bg-secondary/10 border border-secondary/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-normal tracking-tight text-text-primary">AI Confidence Note</h3>
            <p className="text-[15px] text-text-secondary leading-relaxed">
              These results are generated by a neural network and may not be absolute. Lighting, angle, and mixed heritage can affect the outcome. For definitive identification, consult a veterinary specialist.
            </p>
          </div>
          <button 
            onClick={() => setIsDisclaimerOpen(false)}
            className="w-full py-3 bg-primary text-white rounded-xl font-medium tracking-wide hover:bg-primary/90 transition-colors"
          >
            I Understand
          </button>
        </div>
      </Modal>

    </div>
  );
};

export default ResultsPanel;
