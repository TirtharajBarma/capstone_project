import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/layout/Navigation';
import Dashboard from './components/layout/Dashboard';
import ResultsPanel from './components/layout/ResultsPanel';
import { predictionAPI, breedsAPI, utils, handleAPIError } from './services/api';
import './App.css';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [breedInfo, setBreedInfo] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [error, setError] = useState(null);

  const handleImageUpload = async (file) => {
    try {
      // Validate file
      utils.validateImageFile(file);
      
      setIsLoading(true);
      setError(null);
      setPrediction(null);
      setBreedInfo(null);
      
      // Create image URL for preview
      const imgUrl = utils.createImageURL(file);
      setImageUrl(imgUrl);

      // Make prediction
      const response = await predictionAPI.predict(file);
      
      if (response.success) {
        setPrediction(response.data);
        
        // Get breed information if available
        if (response.data.breed) {
          try {
            const breedResponse = await breedsAPI.getByName(
              response.data.breed, 
              response.data.species
            );
            if (breedResponse.success) {
              setBreedInfo(breedResponse.data);
            }
          } catch (breedError) {
            console.warn('Could not fetch breed information:', breedError);
          }
        }
      } else {
        throw new Error(response.message || 'Prediction failed');
      }
    } catch (error) {
      console.error('Prediction error:', error);
      const errorInfo = handleAPIError(error);
      setError(errorInfo.message);
      
      // Clean up image URL on error
      if (imageUrl) {
        utils.revokeImageURL(imageUrl);
        setImageUrl(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveResult = async () => {
    if (prediction) {
      try {
        console.log('Saving result:', prediction);
      } catch (error) {
        console.error('Save error:', error);
      }
    }
  };

  const handleShareResult = async () => {
    if (prediction) {
      try {
        if (navigator.share) {
          await navigator.share({
            title: `BreedVision AI - ${prediction.breed} Recognition`,
            text: `I identified a ${prediction.breed} with ${Math.round(prediction.confidence * 100)}% confidence using BreedVision AI!`,
            url: window.location.href,
          });
        } else {
          const text = `I identified a ${prediction.breed} with ${Math.round(prediction.confidence * 100)}% confidence using BreedVision AI!`;
          await navigator.clipboard.writeText(text);
        }
      } catch (error) {
        console.error('Share error:', error);
      }
    }
  };

  const handleDownloadResult = () => {
    if (imageUrl && prediction) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `${prediction.breed}_prediction.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Clean up image URL when component unmounts
  useEffect(() => {
    return () => {
      if (imageUrl) {
        utils.revokeImageURL(imageUrl);
      }
    };
  }, [imageUrl]);

  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Navigation />
        
        <main>
          <Routes>
            <Route 
              path="/" 
              element={
                <>
                  {error && (
                    <div className="max-w-7xl mx-auto px-4 pt-6">
                      <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                        <p className="font-medium">Error</p>
                        <p className="text-sm">{error}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="relative">
                    <Dashboard
                      onImageUpload={handleImageUpload}
                      isLoading={isLoading}
                    />
                    
                    {(prediction || isLoading) && (
                      <div className="max-w-7xl mx-auto px-4 py-8">
                        {isLoading ? (
                          <div className="card p-12 text-center">
                            <div className="loading-dots mx-auto mb-4">
                              <div></div>
                              <div></div>
                              <div></div>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Processing Image...</h3>
                            <p className="text-gray-600">Our AI is analyzing the breed</p>
                          </div>
                        ) : (
                          <ResultsPanel
                            prediction={prediction}
                            breedInfo={breedInfo}
                            imageUrl={imageUrl}
                            onSave={handleSaveResult}
                            onShare={handleShareResult}
                            onDownload={handleDownloadResult}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </>
              } 
            />
            
            <Route 
              path="/history" 
              element={
                <div className="max-w-7xl mx-auto px-4 py-12">
                  <div className="card p-12 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">History</h2>
                    <p className="text-gray-600">Coming soon - View your prediction history</p>
                  </div>
                </div>
              } 
            />
            
            <Route 
              path="/analytics" 
              element={
                <div className="max-w-7xl mx-auto px-4 py-12">
                  <div className="card p-12 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Analytics</h2>
                    <p className="text-gray-600">Coming soon - View statistics and insights</p>
                  </div>
                </div>
              } 
            />
            
            <Route 
              path="/login" 
              element={
                <div className="max-w-md mx-auto px-4 py-12">
                  <div className="card p-8 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Login</h2>
                    <p className="text-gray-600">Authentication coming soon</p>
                  </div>
                </div>
              } 
            />
            
            <Route 
              path="/signup" 
              element={
                <div className="max-w-md mx-auto px-4 py-12">
                  <div className="card p-8 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign Up</h2>
                    <p className="text-gray-600">Registration coming soon</p>
                  </div>
                </div>
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
