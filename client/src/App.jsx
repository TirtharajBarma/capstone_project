import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { SignedOut, useAuth } from '@clerk/clerk-react';
import Navigation from './components/layout/Navigation';
import HomePage from './pages/HomePage';
import UserDashboard from './pages/UserDashboard';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import HistoryDashboard from './pages/HistoryDashboard';
import SettingsDashboard from './pages/SettingsDashboard';
import ResultsPage from './pages/ResultsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import { predictionAPI, breedsAPI, utils, handleAPIError, setClerkTokenGetter } from './services/api';
import { useUserSync } from './hooks/useUserSync';
import './App.css';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const currentImageUrlRef = useRef(null);
  const { getToken } = useAuth();

  // User synchronization hook
  const { user } = useUserSync();

  // Set Clerk token getter for API client
  useEffect(() => {
    setClerkTokenGetter(getToken);
  }, [getToken]);

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (currentImageUrlRef.current) {
        URL.revokeObjectURL(currentImageUrlRef.current);
      }
    };
  }, []);

  const handleImageUpload = async (file) => {
    try {
      // Validate file
      utils.validateImageFile(file);
      
      setIsLoading(true);
      setError(null);
      
      // Cleanup previous image URL if it exists
      if (currentImageUrlRef.current) {
        URL.revokeObjectURL(currentImageUrlRef.current);
        currentImageUrlRef.current = null;
      }

      // Create new image URL for preview
      const imgUrl = utils.createImageURL(file);
      currentImageUrlRef.current = imgUrl;

      // Determine if user is authenticated
      const isAuthenticated = !!user?.id;
      
      // Always set saveToDb to false to ensure we upload image to Cloudinary first
      // The user must explicitly click "Save" on the results page
      const saveToDb = false; 

      console.log('Making prediction request...', { isAuthenticated, saveToDb });

      // Make prediction
      const response = await predictionAPI.predict(file, undefined, user?.id, saveToDb);
      
      if (response.success) {
        let breedInfo = response.data.breedInfo;
        
        // Prefer server-enriched breed info; fallback to breeds API if missing
        if (!breedInfo && response.data.breed) {
          try {
            const breedResponse = await breedsAPI.getByName(
              response.data.breed,
              response.data.species
            );
            if (breedResponse.success) {
              breedInfo = breedResponse.data;
            }
          } catch (breedError) {
            console.warn('Could not fetch breed information:', breedError);
          }
        }

        // Navigate to results page
        navigate('/results', { 
          state: { 
            prediction: response.data, 
            imageUrl: imgUrl, 
            breedInfo: breedInfo,
            saved: response.data.saved || false,
            unsavedPredictionData: response.data.unsavedPredictionData || null
          } 
        });
      } else {
        throw new Error(response.message || 'Prediction failed');
      }
    } catch (error) {
      console.error('Prediction error:', error);
      const errorInfo = handleAPIError(error);
      setError(errorInfo.message);

      // Cleanup URL on error since we won't navigate
      if (currentImageUrlRef.current) {
        URL.revokeObjectURL(currentImageUrlRef.current);
        currentImageUrlRef.current = null;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const authenticatedRoutes = ['/dashboard', '/analytics', '/history', '/settings'];
  const isAuthenticatedRoute = authenticatedRoutes.includes(location.pathname);

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-white">
      {!isAuthenticatedRoute && <Navigation />}
      
      <main className={!isAuthenticatedRoute ? "flex h-full min-h-screen grow items-center justify-center px-4 py-2 sm:px-6 lg:px-8" : ""}>
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/" 
            element={
              <HomePage
                onImageUpload={handleImageUpload}
                isLoading={isLoading}
                error={error}
              />
            } 
          />
          
          <Route path="/results" element={<ResultsPage />} />
          
          {/* Protected Routes - require authentication */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <UserDashboard
                  onImageUpload={handleImageUpload}
                />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/analytics" 
            element={
              <ProtectedRoute>
                <AnalyticsDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/history" 
            element={
              <ProtectedRoute>
                <HistoryDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <SettingsDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Authentication Routes */}
          <Route 
            path="/login/*" 
            element={
              <SignedOut>
                <LoginPage />
              </SignedOut>
            } 
          />
          
          <Route 
            path="/register/*" 
            element={
              <SignedOut>
                <RegisterPage />
              </SignedOut>
            } 
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
