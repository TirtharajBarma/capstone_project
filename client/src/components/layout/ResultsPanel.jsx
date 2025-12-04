import React from 'react';
import { useNavigate } from 'react-router-dom';

import BreedMap from '../ui/BreedMap';
import { Modal, ModalHeader, ModalTitle, ModalFooter } from '../ui/Modal';
import Button from '../ui/Button';

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
  const [isFeedbackOpen, setIsFeedbackOpen] = React.useState(false);
  const [feedbackText, setFeedbackText] = React.useState('');

  if (!prediction) return null;

  // Normalize confidence score to handle both 0-1 decimal and 0-100 percentage inputs
  let confidenceVal = prediction.confidence;
  // If confidence is greater than 1, assume it's a percentage (e.g. 95) and convert to decimal (0.95)
  // But if it's exactly 1, it could be 100% or 1.0. We'll assume 1.0 is 100%.
  // Safest check: if it's > 1, it's definitely a percentage.
  if (confidenceVal > 1) {
    confidenceVal = confidenceVal / 100;
  }
  
  const confidencePercentage = Math.round(confidenceVal * 100);
  
  // Mock data for "Other Possibilities" if not provided
  const otherPossibilities = prediction.topPredictions && prediction.topPredictions.length > 1 
    ? prediction.topPredictions.slice(1, 3).map(p => ({ name: p.breed, confidence: Math.round(p.confidence * 100) }))
    : [
        { name: 'Red Sindhi', confidence: 6 },
        { name: 'Gir', confidence: 2 }
      ];

  return (
    <div className="layout-content-container flex flex-col mx-auto max-w-6xl w-full px-4 md:px-0 py-8 lg:py-12">
      <div className="flex flex-col gap-2 mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-primary/70 hover:text-primary transition-colors w-fit"
        >
          <span className="material-symbols-outlined text-xl">arrow_back</span>
          <span className="text-sm font-medium">Back</span>
        </button>
        <div className="flex flex-wrap justify-between gap-3">
          <h1 className="text-4xl font-bold tracking-tight text-text-light dark:text-text-dark">Recognition Results</h1>
        </div>
      </div>
      
      <div className="flex flex-col gap-8 lg:grid lg:grid-cols-2 lg:items-start">
        {/* Left Column */}
        <div className="contents lg:flex lg:flex-col lg:gap-8">
          {/* Image Card */}
          <div 
            className="order-1 lg:order-none w-full bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden rounded-2xl aspect-[4/3] shadow-sm" 
            style={{ backgroundImage: `url("${imageUrl}")` }}
            role="img"
            aria-label={`A photo of a ${prediction.breed}`}
          ></div>
          


          {/* Geographical Distribution Card */}
          <div className="order-3 lg:order-none bg-panel-light dark:bg-panel-dark p-6 rounded-2xl shadow-sm flex flex-col h-full">
            <h2 className="text-xl font-bold tracking-tight mb-4">Geographical Distribution</h2>
            <p className="mb-4 text-text-light/80 dark:text-text-dark/80">
              The {prediction.breed} breed is commonly found in the following regions.
            </p>
            <div className="aspect-[16/9] w-full bg-background-light dark:bg-background-dark rounded-xl overflow-hidden shadow-inner relative z-0">
               {breedInfo?.location ? (
                 <BreedMap 
                   lat={breedInfo.location.lat} 
                   lng={breedInfo.location.lng} 
                   breedName={prediction.breed}
                   region={breedInfo.location.region}
                 />
               ) : (
                 <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-400">
                   <p>Location data not available</p>
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="contents lg:flex lg:flex-col lg:gap-8 lg:mt-12">
          {/* Breed Identified Card */}
          <div className="order-2 lg:order-none bg-panel-light dark:bg-panel-dark p-6 rounded-2xl shadow-sm">
            <h2 className="text-xl font-bold tracking-tight mb-2">Breed Identified</h2>
            <h3 className="text-[#028174] text-4xl font-bold tracking-tight flex items-start gap-1" title="Click asterisk to read the disclaimer">
              {prediction.breed}
              <button 
                onClick={() => setIsDisclaimerOpen(true)}
                className="text-lg text-text-light/50 hover:text-[#028174] transition-colors cursor-pointer"
                aria-label="Disclaimer"
                title="Click to read the disclaimer"
              >
                *
              </button>
            </h3>
            <p className="mt-2 text-text-light/80 dark:text-text-dark/80 leading-relaxed">
              {breedInfo?.description || `Known for their distinctive features and characteristics typical of the ${prediction.breed} breed.`}
            </p>
            
            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-2">Confidence Score</h4>
              <div className="flex items-center gap-4">
                <div className="w-full bg-background-light dark:bg-background-dark rounded-full h-4 overflow-hidden">
                  <div 
                    className="bg-secondary h-4 rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${Math.min(confidencePercentage, 100)}%` }}
                  ></div>
                </div>
                <span className="text-lg font-bold text-secondary">{confidencePercentage}%</span>
              </div>
            </div>

            {/* Breed Details Section */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="bg-background-light dark:bg-background-dark p-4 rounded-xl">
                <h4 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">palette</span>
                  Physical Traits
                </h4>
                <ul className="text-sm space-y-1 text-text-light/80 dark:text-text-dark/80">
                  {breedInfo?.characteristics?.color && breedInfo.characteristics.color.length > 0 && (
                    <li><span className="font-medium">Color:</span> {breedInfo.characteristics.color.join(', ')}</li>
                  )}
                  {breedInfo?.characteristics?.horns && (
                    <li><span className="font-medium">Horns:</span> {breedInfo.characteristics.horns}</li>
                  )}
                  {breedInfo?.characteristics?.size && (
                    <li><span className="font-medium">Size:</span> {breedInfo.characteristics.size}</li>
                  )}
                </ul>
              </div>
              
              <div className="bg-background-light dark:bg-background-dark p-4 rounded-xl">
                <h4 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">psychology</span>
                  Key Characteristics
                </h4>
                <div className="flex flex-wrap gap-2">
                  {breedInfo?.traits && breedInfo.traits.length > 0 ? (
                    breedInfo.traits.map((trait, index) => (
                      <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {trait}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">No specific traits listed</span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-gray-300 dark:border-gray-700 pt-4">
              <details className="group">
                <summary className="font-semibold cursor-pointer flex justify-between items-center list-none">
                  Other potential matches
                  <span className="material-symbols-outlined transition-transform transform group-open:rotate-180">expand_more</span>
                </summary>
                <ul className="mt-3 space-y-2 text-sm text-text-light/80 dark:text-text-dark/80">
                  {otherPossibilities.map((item, index) => (
                    <li key={item.name || index} className="flex justify-between">
                      <span>{item.name}</span> 
                      <span>{item.confidence}%</span>
                    </li>
                  ))}
                </ul>
              </details>
            </div>
          </div>

          {/* Next Steps Card */}
          <div className="order-4 lg:order-none bg-panel-light dark:bg-panel-dark p-6 rounded-2xl shadow-sm">
            <h2 className="text-2xl font-bold tracking-tight mb-6">Next Steps</h2>
            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={() => navigate('/')}
                className="flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-12 px-4 bg-[#028174] text-white text-base font-bold leading-normal tracking-wide transition-colors hover:bg-[#028174]/80"
              >
                <span className="material-symbols-outlined">add_a_photo</span>
                <span>Recognize Another</span>
              </button>
              
              <button 
                onClick={onSave}
                disabled={isSaved || isSaving}
                className={`flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-12 px-4 bg-white border-2 border-gray-300 text-gray-800 text-base font-semibold leading-normal tracking-wide transition-all ${
                  isSaved || isSaving 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-gray-50 hover:border-[#028174]'
                }`}
              >
                <span className="material-symbols-outlined">{isSaved ? 'check' : 'save'}</span>
                <span>{isSaved ? 'Saved to History' : isSaving ? 'Saving...' : 'Save Result'}</span>
              </button>

              <button 
                onClick={() => navigate('/history')}
                className="flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-12 px-4 bg-white border-2 border-gray-300 text-gray-800 text-base font-semibold leading-normal tracking-wide transition-all hover:bg-gray-150 hover:border-[#028174]"
              >
                <span className="material-symbols-outlined">history</span>
                <span>View History</span>
              </button>
              
              <button 
                onClick={() => navigate('/dashboard')}
                className="flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-12 px-4 bg-white border-2 border-gray-300 text-gray-800 text-base font-semibold leading-normal tracking-wide transition-all hover:bg-gray-150 hover:border-[#028174]"
              >
                <span className="material-symbols-outlined">analytics</span>
                <span>Analytics</span>
              </button>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-300 dark:border-gray-700 text-center">
              <button 
                onClick={() => setIsFeedbackOpen(true)}
                className="text-sm text-[#028174] hover:underline bg-transparent border-none cursor-pointer"
              >
                Not the right breed? Help us improve.
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer Modal */}
      <Modal 
        isOpen={isDisclaimerOpen} 
        onClose={() => setIsDisclaimerOpen(false)}
        title="Disclaimer"
      >
        <div className="space-y-4">
          <p className="text-text-light/80">
            The identification result provided is generated by an AI model and may not be 100% accurate.
          </p>
          <p className="text-text-light/80">
            Results can be affected by various factors including:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-text-light/80">
            <li>Image quality and lighting conditions</li>
            <li>Angle and positioning of the animal</li>
            <li>Similar physical characteristics between breeds</li>
          </ul>
          <p className="text-sm text-text-light/60 mt-4">
            Please consult with a veterinary professional or breed expert for definitive identification.
          </p>
        </div>
        <ModalFooter>
          <Button onClick={() => setIsDisclaimerOpen(false)}>
            Understood
          </Button>
        </ModalFooter>
      </Modal>

      {/* Feedback Modal */}
      <Modal 
        isOpen={isFeedbackOpen} 
        onClose={() => setIsFeedbackOpen(false)}
        title="Help us improve"
      >
        <div className="space-y-4">
          <p className="text-text-light/80">
            We're sorry the result wasn't accurate. Please tell us what the correct breed is or why the result seems incorrect.
          </p>
          <textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="E.g., This looks more like a Jersey cow because..."
            className="w-full h-32 p-3 rounded-lg border border-gray-300 focus:border-[#028174] focus:ring-1 focus:ring-[#028174] outline-none resize-none"
          />
        </div>
        <ModalFooter>
          <Button 
            variant="ghost" 
            onClick={() => setIsFeedbackOpen(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => {
              // Here we would typically send this to the backend
              console.log('Feedback submitted:', feedbackText);
              setFeedbackText('');
              setIsFeedbackOpen(false);
              alert('Thank you for your feedback!');
            }}
            disabled={!feedbackText.trim()}
          >
            Submit Feedback
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default ResultsPanel;