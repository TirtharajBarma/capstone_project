import React from 'react';
import Dashboard from '../components/layout/Dashboard';

const HomePage = ({ onImageUpload, isLoading, error }) => {
  return (
    <div className="flex flex-col items-center w-full">
      <Dashboard
        onImageUpload={onImageUpload}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
};

export default HomePage;
