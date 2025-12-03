import React from 'react';
import { useNavigate } from 'react-router-dom';

const ResultsPanel = ({ 
  prediction, 
  breedInfo, 
  imageUrl, 
  onSave,
  isSaved = false,
  isSaving = false
}) => {
  const navigate = useNavigate();

  if (!prediction) return null;

  const confidencePercentage = Math.round(prediction.confidence * 100);
  
  // Mock data for "Other Possibilities" if not provided
  const otherPossibilities = prediction.topPredictions && prediction.topPredictions.length > 1 
    ? prediction.topPredictions.slice(1, 3).map(p => ({ name: p.breed, confidence: Math.round(p.confidence * 100) }))
    : [
        { name: 'Red Sindhi', confidence: 6 },
        { name: 'Gir', confidence: 2 }
      ];

  return (
    <div className="flex flex-col flex-1 px-4 py-8 md:py-12">
      <div className="flex flex-wrap justify-between gap-4">
        <p className="text-gray-900 text-4xl font-black leading-tight tracking-[-0.033em] min-w-72">Recognition Results</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mt-8">
        {/* Left Column: Uploaded Image */}
        <div className="flex flex-col">
          <h2 className="text-gray-900 text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3 pt-5">Your Image</h2>
          <div className="w-full grow aspect-w-4 aspect-h-3 rounded-xl overflow-hidden shadow-lg border border-gray-200 bg-gray-50">
            <img 
              src={imageUrl} 
              alt="Uploaded cattle" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>
        
        {/* Right Column: Results Panel */}
        <div className="flex flex-col">
          <h2 className="text-gray-900 text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3 pt-5">Top Match</h2>
          <div className="flex flex-col gap-6 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-primary">{prediction.breed}</h3>
              <div className="flex items-center gap-2">
                <span className="text-secondary text-lg material-symbols-outlined">verified</span>
                <p className="text-3xl font-black text-secondary">{confidencePercentage}%</p>
              </div>
            </div>
            <p className="text-text-neutral text-sm leading-relaxed">
              {breedInfo?.description || `Our model is ${confidencePercentage}% confident that the animal in your image is a ${prediction.breed}.`}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-secondary h-2.5 rounded-full" style={{ width: `${confidencePercentage}%` }}></div>
            </div>
          </div>
          
          <div className="mt-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Other Possibilities</h3>
            <div className="space-y-3">
              {otherPossibilities.map((item, index) => (
                <div key={item.name || index} className="flex justify-between items-center p-4 bg-white rounded-lg border border-gray-200">
                  <span className="font-medium text-gray-700">{item.name}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-text-neutral">{item.confidence}%</span>
                    {index === 0 && (
                      <div className="w-24 bg-gray-200 rounded-full h-1.5">
                        <div className="bg-text-neutral/50 h-1.5 rounded-full" style={{ width: `${item.confidence}%` }}></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-10 pt-6 border-t border-gray-200">
            <button 
              onClick={onSave}
              disabled={isSaved || isSaving}
              className={`w-full sm:w-auto flex-1 flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 text-base font-bold leading-normal tracking-[0.015em] transition-colors ${
                isSaved 
                  ? 'bg-green-500 text-white cursor-not-allowed' 
                  : isSaving
                  ? 'bg-gray-400 text-white cursor-wait'
                  : 'bg-primary text-white hover:bg-opacity-90'
              }`}
            >
              <span className="truncate">
                {isSaved ? '✓ Saved' : isSaving ? 'Saving...' : 'Save Result'}
              </span>
            </button>
            <button 
              onClick={() => navigate('/')}
              className="w-full sm:w-auto flex-1 flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-primary/10 text-primary text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/20 transition-colors whitespace-nowrap"
            >
              <span>Try Another Image</span>
            </button>
            <a className="w-full sm:w-auto text-center px-6 py-3 text-sm font-medium text-text-neutral hover:text-primary transition-colors" href="/history">
              View History
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPanel;