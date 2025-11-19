import React from 'react';
import { 
  CheckCircle, 
  Info, 
  MapPin, 
  TrendingUp,
  Clock,
  Download,
  Share2,
  Bookmark,
  Award
} from 'lucide-react';

const ResultsPanel = ({ 
  prediction, 
  breedInfo, 
  imageUrl, 
  onSave, 
  onShare, 
  onDownload
}) => {
  if (!prediction) return null;

  const confidencePercentage = Math.round(prediction.confidence * 100);
  const confidenceColor = confidencePercentage >= 90 ? 'text-green-600' : 
                         confidencePercentage >= 70 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="space-y-6">
      
      {/* Main Result Card */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Prediction Complete</h2>
              <p className="text-gray-600 text-sm">AI analysis finished</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${confidenceColor}`}>
              {confidencePercentage}%
            </div>
            <div className="text-sm text-gray-500">Confidence</div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Image Preview */}
          {imageUrl && (
            <div className="space-y-4">
              <div className="relative group bg-white rounded-lg border border-gray-200 overflow-hidden flex items-center justify-center">
                {/* Container uses max height and object-contain to avoid cropping */}
                <img
                  src={imageUrl}
                  alt="Uploaded"
                  className="max-h-[480px] w-full object-contain"
                />
                <div className="absolute bottom-3 left-3 right-3 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 gap-2">
                  <button onClick={onDownload} className="btn-secondary text-sm px-3 py-2">
                    <Download className="w-4 h-4" />
                  </button>
                  <button onClick={onShare} className="btn-secondary text-sm px-3 py-2">
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button onClick={onSave} className="btn-secondary text-sm px-3 py-2">
                    <Bookmark className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Prediction Details */}
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Identified Breed</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Breed Name:</span>
                  <span className="font-semibold text-lg text-gray-900">{prediction.breed}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Species:</span>
                  <span className="capitalize font-medium text-gray-900">{prediction.species}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Confidence:</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          confidencePercentage >= 90 ? 'bg-green-500' :
                          confidencePercentage >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${confidencePercentage}%` }}
                      ></div>
                    </div>
                    <span className={`font-bold ${confidenceColor}`}>
                      {confidencePercentage}%
                    </span>
                  </div>
                </div>
                {prediction.inferenceTime && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Processing Time:</span>
                    <span className="flex items-center space-x-1 text-gray-600">
                      <Clock className="w-3 h-3" />
                      <span>{prediction.inferenceTime}ms</span>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Top Predictions */}
            {prediction.topPredictions && prediction.topPredictions.length > 1 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Alternative Predictions</h4>
                <div className="space-y-2">
                  {prediction.topPredictions.slice(1, 4).map((pred, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{pred.breed}</span>
                      <span className="text-gray-500">{Math.round(pred.confidence * 100)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-200">
          <button onClick={onSave} className="btn-primary">
            <Bookmark className="w-4 h-4" />
            <span>Save Result</span>
          </button>
          <button onClick={onShare} className="btn-secondary">
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
          <button onClick={onDownload} className="btn-secondary">
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Breed Information Card */}
      {breedInfo && (
        <div className="card p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
              <Info className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Breed Information</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Origin</h4>
                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{breedInfo.origin}</span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {breedInfo.description}
                </p>
              </div>

              {breedInfo.milkYield && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Milk Production</h4>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-gray-600">
                      {breedInfo.milkYield.average} {breedInfo.milkYield.unit}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Characteristics */}
            <div className="space-y-4">
              {breedInfo.traits && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Key Traits</h4>
                  <div className="flex flex-wrap gap-2">
                    {breedInfo.traits.map((trait, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {breedInfo.characteristics && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Characteristics</h4>
                  
                  {breedInfo.characteristics.size && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Size:</span>
                      <span className="capitalize font-medium text-gray-900">{breedInfo.characteristics.size}</span>
                    </div>
                  )}
                  
                  {breedInfo.characteristics.color && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Color:</span>
                      <span className="font-medium text-gray-900">
                        {breedInfo.characteristics.color.join(', ')}
                      </span>
                    </div>
                  )}
                  
                  {breedInfo.characteristics.horns && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Horns:</span>
                      <span className="capitalize font-medium text-gray-900">{breedInfo.characteristics.horns}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsPanel;