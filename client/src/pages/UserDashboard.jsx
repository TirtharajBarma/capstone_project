import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import CameraCapture from '../components/ui/CameraCapture';
import Sidebar from '../components/layout/Sidebar';

const UserDashboard = ({ onImageUpload }) => {
  const { user } = useUser();
  const [dragOver, setDragOver] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    if (imageFile && onImageUpload) {
      onImageUpload(imageFile);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && onImageUpload) {
      onImageUpload(file);
    }
  };

  const handleCameraCapture = (file) => {
    if (onImageUpload) {
      onImageUpload(file);
    }
    setShowCamera(false);
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-white">
      {showCamera && (
        <CameraCapture 
          onCapture={handleCameraCapture} 
          onClose={() => setShowCamera(false)} 
        />
      )}
      
      <div className="flex h-full min-w-0">
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex flex-1 flex-col lg:ml-64 w-full">
          <div className="flex flex-1 flex-col p-4 md:p-8">
            <div className="flex flex-col gap-6">
              {/* Breadcrumbs */}
              <div className="flex flex-wrap gap-2">
                <Link className="text-green-700 text-base font-medium leading-normal hover:text-green-800" to="/">Home</Link>
                <span className="text-gray-500 text-base font-medium leading-normal">/</span>
                <span className="text-gray-800 text-base font-medium leading-normal">Dashboard</span>
              </div>

              {/* Page Heading */}
              <div className="flex flex-wrap justify-between gap-3">
                <div className="flex min-w-72 flex-col gap-2">
                  <p className="text-gray-800 text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
                    Welcome back, {user?.firstName || 'User'}!
                  </p>
                  <p className="text-green-700 text-base font-normal leading-normal">
                    Instantly identify cattle breeds by uploading an image.
                  </p>
                </div>
              </div>

              {/* Image Upload Area */}
              <div 
                className={`flex flex-col items-center gap-6 rounded-xl border-2 border-dashed px-6 py-14 bg-gray-50 transition-colors ${
                  dragOver ? 'border-green-600 bg-green-50' : 'border-gray-300'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="flex max-w-[480px] flex-col items-center gap-2">
                  <p className="text-gray-800 text-lg font-bold leading-tight tracking-[-0.015em] max-w-[480px] text-center">
                    Drag & Drop your image here
                  </p>
                  <p className="text-gray-600 text-sm font-normal leading-normal max-w-[480px] text-center">
                    Supports: JPG, PNG, WEBP
                  </p>
                </div>
                
                <div className="flex gap-4">
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    className="hidden"
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-green-600 text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-green-700 transition-colors"
                  >
                    <span className="truncate">Browse Files</span>
                  </button>
                  
                  <button 
                    onClick={() => setShowCamera(true)}
                    className="flex items-center justify-center rounded-lg h-10 px-4 border border-green-600 text-green-600 hover:bg-green-50 transition-colors"
                  >
                    <span className="material-symbols-outlined">photo_camera</span>
                  </button>
                </div>
              </div>

              {/* Section: At a Glance */}
              <div className="flex flex-col">
                <h2 className="text-gray-800 text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3 pt-5">At a Glance</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Stat Card: Total Analyses */}
                  <div className="flex flex-col gap-4 p-6 rounded-xl bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center size-12 rounded-full bg-green-100">
                        <span className="material-symbols-outlined text-green-600 text-3xl">analytics</span>
                      </div>
                      <div className="flex flex-col">
                        <p className="text-sm font-medium text-gray-600">Total Analyses</p>
                        <p className="text-3xl font-bold text-gray-800">1,204</p>
                      </div>
                    </div>
                  </div>
                  {/* Stat Card: Unique Breeds */}
                  <div className="flex flex-col gap-4 p-6 rounded-xl bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center size-12 rounded-full bg-green-100">
                        <span className="material-symbols-outlined text-green-600 text-3xl">cruelty_free</span>
                      </div>
                      <div className="flex flex-col">
                        <p className="text-sm font-medium text-gray-600">Unique Breeds</p>
                        <p className="text-3xl font-bold text-gray-800">32</p>
                      </div>
                    </div>
                  </div>
                  {/* Stat Card: Accuracy Rate */}
                  <div className="flex flex-col gap-4 p-6 rounded-xl bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center size-12 rounded-full bg-green-100">
                        <span className="material-symbols-outlined text-green-600 text-3xl">verified</span>
                      </div>
                      <div className="flex flex-col">
                        <p className="text-sm font-medium text-gray-600">Accuracy Rate</p>
                        <p className="text-3xl font-bold text-gray-800">94.6%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: Recent Recognitions */}
              <div className="flex flex-col">
                <h2 className="text-gray-800 text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3 pt-5">Recent Recognitions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Recognition Card 1 */}
                  <div className="flex flex-col gap-3 p-4 rounded-xl bg-gray-50">
                    <div className="bg-center bg-no-repeat aspect-[4/3] bg-cover rounded-lg" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBlUETouC4Oh6Ya585AHr0f5jkBRtAr60sONWX63uc2EPZMBA9YdXbZRl1PXc8nLEruUrGbhBO10yM9pkKCy3BqDEW6j4Fhu5x08UJzDB7Nw1MiM4s0St9qA26CuP0LXiY9Gf_e4KgON90_ClR2T1aRafXCoSuUI0qOqzPUke5hdVWhoVMoasyOKu_W3lMnOM6fmJlxOjNW6bz6DLrDNjPrVWWfFcRTQFFTT3AEYODGrPWGSrdqdzjf3XOiVZlvb9ZbXjS5I5ZxWGxz")' }}></div>
                    <div className="flex flex-col">
                      <h3 className="text-base font-bold text-gray-800">Holstein Friesian</h3>
                      <p className="text-sm text-gray-600">2 hours ago</p>
                    </div>
                  </div>
                  {/* Recognition Card 2 */}
                  <div className="flex flex-col gap-3 p-4 rounded-xl bg-gray-50">
                    <div className="bg-center bg-no-repeat aspect-[4/3] bg-cover rounded-lg" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAoacR1GQ7CJC_T9qDcTFiVVNQ1BIrrzINFwBCXn7J0cmEsz5Q7eCoUFQnnWc2zchHFicDnTccpC_o7neYOGJcQNqhxnslmJCd_RNTneyKQeXShOS5fRQKH0kjp_qWL_MFpFEhvdd3SX3CxALqFZy1T60Bn_n4ODSm6TbSVAVEkG4W6SMrMl4vtRWg9fZwGgRYNM5dp93JXWSA2BDHMjoNMTIysmYCFJXI9uoQOMv91i1PrLowPIsbPdIgSgbItxPIbt3dBI2-KTfiF")' }}></div>
                    <div className="flex flex-col">
                      <h3 className="text-base font-bold text-gray-800">Murrah Buffalo</h3>
                      <p className="text-sm text-gray-600">5 hours ago</p>
                    </div>
                  </div>
                  {/* Recognition Card 3 */}
                  <div className="flex flex-col gap-3 p-4 rounded-xl bg-gray-50">
                    <div className="bg-center bg-no-repeat aspect-[4/3] bg-cover rounded-lg" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAt3yrnmAY4MmyRebZMrj_6PkmXFOjXUtq0EfBKQpH6JZ4Ky6I0cPriW7KzwzwpNvhcUV9zxj5i827d360FlRqQGxesiaeWjeq7ueylqNUhh7O3CFWrLdrMf-KxGaHfVFenIGvygvbLJVW7s4dOAeXDAGEoMMFrGRp7Y-Cy--FTRW4iWEyNOG6ZlCiqBzoMKZP3yGpJjlKlKECq891MS9KPDlETNWZcScQgCZM7PkUNIMPYe9zV2Ot0bwB5d802GFbamElYC-ZVwLYp")' }}></div>
                    <div className="flex flex-col">
                      <h3 className="text-base font-bold text-gray-800">Gir Cow</h3>
                      <p className="text-sm text-gray-600">Yesterday</p>
                    </div>
                  </div>
                  {/* Recognition Card 4 */}
                  <div className="flex flex-col gap-3 p-4 rounded-xl bg-gray-50">
                    <div className="bg-center bg-no-repeat aspect-[4/3] bg-cover rounded-lg" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCmm1sfTCiW3-dvsjLP8v6euMgziepOA9Mh1ebcUYZsG5mesJUcrL2TgR8_Vhex39DrcYRmnEU7Nb59g2eNdWcpIHy6E9O3b_OPgryzrq0-K7SlHDzTKDQ9VvzLi2Ykajn3EKKfLof4r24M6uhinS7hrxFxwq8NNDX6OZ2tHWYmObF1RMrZjQUqPex2wfCiXO5mDgoswDddG96oBpQHl4cx3gcEDjkchmieSLG26Wdj5tRmFKPX2EdYZ9YBqrvTPciGqOmumf-Le49t")' }}></div>
                    <div className="flex flex-col">
                      <h3 className="text-base font-bold text-gray-800">Sahiwal</h3>
                      <p className="text-sm text-gray-600">2 days ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <footer className="mt-auto p-8 border-t border-gray-200">
            <div className="flex justify-center items-center gap-6">
              <a className="text-sm text-gray-600 hover:text-green-600" href="#">About</a>
              <a className="text-sm text-gray-600 hover:text-green-600" href="#">Contact</a>
              <a className="text-sm text-gray-600 hover:text-green-600" href="#">Terms of Service</a>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;
