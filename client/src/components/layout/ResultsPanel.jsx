import React from 'react';
import { useNavigate } from 'react-router-dom';
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
      <div className="flex items-center justify-between border-b border-slate-100 pb-6 mb-2">
        <div className="flex flex-col gap-1">
          <button 
            onClick={handleBack}
            className="group flex w-fit items-center gap-2 text-[13px] font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest mb-2"
          >
            <span className="material-symbols-outlined text-[16px] transition-transform group-hover:-translate-x-1">arrow_back</span>
            Back
          </button>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">
            Analysis Complete
          </h1>
        </div>
        
        <div className="hidden lg:flex items-center gap-3">
          <button 
            onClick={() => navigate('/')}
            className="flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-bold tracking-wide transition-all shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[20px]">add_a_photo</span>
            New Scan
          </button>
          <button 
            onClick={onSave}
            disabled={isSaved || isSaving}
            className={`flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl px-6 py-2.5 text-sm font-bold tracking-wide transition-all shadow-md active:scale-[0.98] ${
              isSaved 
                ? 'bg-emerald-500 text-white shadow-emerald-500/20 opacity-100' 
                : isSaving 
                  ? 'bg-indigo-400 text-white cursor-wait' 
                  : 'bg-indigo-600 text-white shadow-indigo-600/20 hover:bg-indigo-700'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {isSaved ? 'check_circle' : isSaving ? 'sync' : 'bookmark'}
            </span>
            {isSaved ? 'Saved to History' : isSaving ? 'Saving...' : 'Save Result'}
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Column: Image and Map */}
        <div className="flex flex-col gap-8">
          <div className="group relative w-full aspect-[4/3] rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)]">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <img 
              src={imageUrl} 
              alt={prediction.breed}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          <div className="flex flex-col gap-4 p-6 rounded-3xl bg-white border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight text-slate-900">Geographical Origin</h2>
              <span className="material-symbols-outlined text-slate-300 text-[24px]">public</span>
            </div>
            <div className="aspect-[16/9] w-full bg-slate-50 rounded-2xl overflow-hidden ring-1 ring-inset ring-slate-900/5 relative">
               {breedInfo?.location ? (
                 <BreedMap 
                   lat={breedInfo.location.lat} 
                   lng={breedInfo.location.lng} 
                   breedName={prediction.breed}
                   region={breedInfo.location.region}
                 />
               ) : (
                 <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                   <span className="material-symbols-outlined text-[32px] opacity-50">map</span>
                   <p className="font-medium text-sm">Location data unavailable</p>
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* Right Column: Breed Details */}
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-6 p-8 rounded-3xl bg-white border border-slate-100 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] relative overflow-hidden">
            
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <span className="material-symbols-outlined text-[100px]">verified</span>
            </div>

            <div className="relative z-10 flex flex-col items-start">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-[13px] font-bold bg-indigo-50 text-indigo-600 mb-4 ring-1 ring-inset ring-indigo-500/10">
                Primary Match
              </span>
              <h2 className="text-4xl font-black tracking-tighter text-slate-900 mb-2 flex items-center justify-between w-full">
                {prediction.breed}
                <button 
                  onClick={() => setIsDisclaimerOpen(true)}
                  className="flex items-center justify-center size-8 rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  title="Disclaimer"
                >
                  <span className="material-symbols-outlined text-[18px]">info</span>
                </button>
              </h2>
              <p className="text-base font-medium text-slate-500 leading-relaxed max-w-lg">
                {breedInfo?.description || `Typical characteristics of the ${prediction.breed} breed.`}
              </p>
            </div>
            
            <div className="relative z-10 flex flex-col gap-3 p-5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-between w-full">
                <span className="text-[13px] font-bold tracking-tight text-slate-700 uppercase">Confidence Score</span>
                <span className="text-lg font-black text-indigo-600">{confidencePercentage}%</span>
              </div>
              <div className="w-full bg-slate-200/60 rounded-full h-3 overflow-hidden shadow-inner">
                <div 
                  className="bg-indigo-600 h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden" 
                  style={{ width: `${Math.min(confidencePercentage, 100)}%` }}
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-[200%] animate-[shimmer_2s_infinite]" />
                </div>
              </div>
            </div>

            {(breedInfo?.characteristics || breedInfo?.traits) && (
              <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                {breedInfo?.characteristics && (
                  <div className="flex flex-col gap-3 p-5 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="flex items-center gap-2 text-[14px] font-bold text-slate-900 tracking-tight">
                      <span className="material-symbols-outlined text-[18px] text-emerald-500">category</span>
                      Physical Traits
                    </span>
                    <ul className="flex flex-col gap-2 text-[13px] font-medium text-slate-600">
                      {breedInfo.characteristics.color && (
                        <li className="flex justify-between border-b border-slate-200/60 pb-1.5">
                          <span className="text-slate-400">Color</span> 
                          <span className="text-slate-900 text-right">{[].concat(breedInfo.characteristics.color).join(', ')}</span>
                        </li>
                      )}
                      {breedInfo.characteristics.horns && (
                        <li className="flex justify-between border-b border-slate-200/60 pb-1.5">
                          <span className="text-slate-400">Horns</span> 
                          <span className="text-slate-900 text-right">{breedInfo.characteristics.horns}</span>
                        </li>
                      )}
                      {breedInfo.characteristics.size && (
                        <li className="flex justify-between">
                          <span className="text-slate-400">Size</span> 
                          <span className="text-slate-900 text-right">{breedInfo.characteristics.size}</span>
                        </li>
                      )}
                    </ul>
                  </div>
                )}
                {breedInfo?.traits && breedInfo.traits.length > 0 && (
                  <div className="flex flex-col gap-3 p-5 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden">
                    <span className="flex items-center gap-2 text-[14px] font-bold text-slate-900 tracking-tight">
                      <span className="material-symbols-outlined text-[18px] text-amber-500">psychology</span>
                      Key Details
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {breedInfo.traits.map((trait, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded-lg text-[12px] font-semibold bg-white border border-slate-200 text-slate-700 shadow-sm">
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {otherPossibilities.length > 0 && (
              <div className="relative z-10 pt-6 border-t border-slate-100 flex flex-col gap-4">
                <span className="text-[13px] font-bold tracking-tight text-slate-700 uppercase">Other Possibilities</span>
                <div className="flex flex-col gap-3">
                  {otherPossibilities.map((item, index) => (
                    <div key={index} className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-[14px] font-semibold">
                        <span className="text-slate-700">{item.name}</span> 
                        <span className="text-slate-500">{item.confidence}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-slate-300 h-full rounded-full" 
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
              className={`flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl px-6 py-4 text-base font-bold tracking-wide transition-all shadow-md active:scale-[0.98] ${
                isSaved 
                  ? 'bg-emerald-500 text-white shadow-emerald-500/20 opacity-100' 
                  : 'bg-indigo-600 text-white shadow-indigo-600/20'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {isSaved ? 'check_circle' : 'bookmark'}
              </span>
              {isSaved ? 'Saved to History' : isSaving ? 'Saving...' : 'Save Result'}
            </button>
            <button 
              onClick={() => navigate('/')}
              className="flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl px-6 py-4 bg-white border border-slate-200 text-slate-700 text-base font-bold tracking-wide transition-all shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]"
            >
              <span className="material-symbols-outlined text-[20px]">add_a_photo</span>
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
          <div className="size-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px] text-indigo-600">info</span>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-bold tracking-tight text-slate-900">AI Confidence Note</h3>
            <p className="text-[15px] font-medium text-slate-500 leading-relaxed">
              These results are generated by a neural network and may not be absolute. Lighting, angle, and mixed heritage can affect the outcome. For definitive identification, consult a veterinary specialist.
            </p>
          </div>
          <button 
            onClick={() => setIsDisclaimerOpen(false)}
            className="w-full py-3 bg-slate-900 text-white rounded-xl font-semibold tracking-wide hover:bg-slate-800 transition-colors"
          >
            I Understand
          </button>
        </div>
      </Modal>

    </div>
  );
};

export default ResultsPanel;
