import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import Navigation from './components/layout/Navigation';
import Dashboard from './components/layout/Dashboard';
import ResultsPanel from './components/layout/ResultsPanel';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HistoryPage from './pages/HistoryPage';
import AnalyticsPage from './pages/AnalyticsPage';
import { predictionAPI, breedsAPI, utils, handleAPIError } from './services/api';
import { useUserSync } from './hooks/useUserSync';
import './App.css';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [breedInfo, setBreedInfo] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [error, setError] = useState(null);
  const resultsRef = useRef(null);

  // User synchronization hook
  const { user, dbUser, isSignedIn } = useUserSync();

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
      const response = await predictionAPI.predict(file, undefined, user?.id);
      
      if (response.success) {
        setPrediction(response.data);
        
        // Count is updated on the server using X-Clerk-Id; no client-side increment
        
        // Prefer server-enriched breed info; fallback to breeds API if missing
        if (response.data.breedInfo) {
          setBreedInfo(response.data.breedInfo);
        } else if (response.data.breed) {
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

  // Auto-scroll to the results section when loading starts or results are ready
  useEffect(() => {
    if (resultsRef.current && (isLoading || prediction)) {
      // Delay slightly to ensure layout has rendered
      const t = setTimeout(() => {
        const el = resultsRef.current;
        const nav = document.querySelector('.navbar-sticky');
        const headerH = (nav && nav.offsetHeight) ? nav.offsetHeight : 0;
        // Tuneable offset so we scroll a bit less (and account for sticky header)
        const baseOffset = window.innerWidth < 768 ? 0.25 : 80; // mobile vs desktop
        const offset = headerH + baseOffset;
        const y = el.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
      }, 120);
      return () => clearTimeout(t);
    }
  }, [isLoading, prediction]);

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
                      <div ref={resultsRef} className="max-w-7xl mx-auto px-4 py-8" id="results-section">
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
            
            {/* Protected Routes - require authentication */}
            <Route path="/history" element={<HistoryPage />} />
            
            <Route path="/analytics" element={<AnalyticsPage />} />
            
            {/* Authentication Routes */}
            <Route 
              path="/login" 
              element={
                <SignedOut>
                  <LoginPage />
                </SignedOut>
              } 
            />
            
            <Route 
              path="/register" 
              element={
                <SignedOut>
                  <RegisterPage />
                </SignedOut>
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
