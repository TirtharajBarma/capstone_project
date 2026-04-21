import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { historyAPI, handleAPIError } from '../services/api';

const HistoryDashboard = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');

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

  const fetchHistory = async (pageNum = 1) => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const params = {
        page: pageNum,
        limit: 12,
        sortOrder,
      };

      if (searchQuery.trim()) {
        params.breed = searchQuery.trim();
      }

      const response = await historyAPI.getHistory(params);
      
      if (response.success) {
        const predictions = response.data.predictions || [];
        setHistory(predictions);
        setTotalPages(response.data.pagination?.totalPages || (predictions.length === 12 ? pageNum + 1 : pageNum));
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
      const errorInfo = handleAPIError(error);
      console.error(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(1);
    setPage(1);
  }, [user?.id, searchQuery, sortOrder]);

  const goToPage = (nextPage) => {
    if (nextPage < 1 || nextPage === page) {
      return;
    }

    setPage(nextPage);
    fetchHistory(nextPage);
  };

  const handlePredictionClick = (prediction) => {
    navigate('/results', {
      state: {
        prediction: {
          breed: prediction.predictedBreed,
          confidence: normalizeConfidence(prediction.confidencePercentage),
        },
        imageUrl: prediction.imageUrl,
        saved: true
      }
    });
  };

  if (loading && page === 1) {
    return (
      <DashboardLayout>
        <div className="flex-1 p-4 lg:p-8">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
            <header className="flex flex-col gap-1 py-2 border-b border-slate-100 pb-6">
              <div className="h-9 w-48 bg-slate-200 animate-pulse rounded-lg"></div>
              <div className="h-5 w-64 bg-slate-100 animate-pulse rounded-md mt-1"></div>
            </header>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100">
                  <div className="aspect-square w-full rounded-xl bg-slate-100 animate-pulse"></div>
                  <div className="h-5 w-3/4 bg-slate-200 animate-pulse rounded"></div>
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-1/3 bg-slate-100 animate-pulse rounded"></div>
                    <div className="h-6 w-16 bg-emerald-50 animate-pulse rounded-md"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex-1 p-4 lg:p-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
          {/* Page Heading */}
          <header className="flex flex-col gap-1 py-2 border-b border-slate-100 pb-6">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Recognition History
            </h1>
            <p className="text-slate-500 font-medium tracking-wide">
              Browse through all your past dog breed analyses
            </p>
          </header>

          <div className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] lg:flex-row lg:items-center lg:justify-between">
            <label className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500 transition-colors focus-within:border-indigo-300 focus-within:bg-white lg:max-w-xl">
              <span className="material-symbols-outlined text-[20px]">search</span>
              <input
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search breed name"
                className="w-full bg-transparent text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
            </label>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                <span className="material-symbols-outlined text-[18px]">tune</span>
                Filters
              </div>
              <select
                value={sortOrder}
                onChange={(e) => {
                  setSortOrder(e.target.value);
                  setPage(1);
                }}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="desc">Newest first</option>
                <option value="asc">Oldest first</option>
              </select>
            </div>
          </div>

          <p className="text-[13px] font-medium text-slate-500">
            Showing page {page} of {totalPages}
          </p>
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
              <div className="size-20 rounded-full bg-slate-50 flex items-center justify-center ring-1 ring-slate-100 mb-4">
                <span className="material-symbols-outlined text-[32px] text-slate-300">history</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">No History Yet</h3>
              <p className="mt-2 font-medium text-slate-500 max-w-md">
                You haven't analyzed any dogs yet. Go to the dashboard to track your first breed!
              </p>
              <button 
                onClick={() => navigate('/dashboard')}
                className="mt-6 px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-600/20 hover:bg-indigo-700 active:scale-[0.98] transition-all"
              >
                Scan a Dog
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pt-2">
                {history.map((prediction) => (
                  <div 
                    key={prediction._id}
                    onClick={() => handlePredictionClick(prediction)}
                    className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="relative aspect-square w-full overflow-hidden bg-slate-100 p-2">
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <img 
                        src={prediction.imageUrl || `https://via.placeholder.com/400x300?text=${encodeURIComponent(prediction.predictedBreed)}`}
                        alt={prediction.predictedBreed}
                        className="h-full w-full rounded-xl object-cover ring-1 ring-slate-900/5 transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-col p-5 gap-3">
                      <h3 className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">
                        {prediction.predictedBreed}
                      </h3>
                      <div className="flex items-center justify-between pt-1">
                        <p className="text-[13px] font-medium text-slate-500 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                          {new Date(prediction.createdAt).toLocaleDateString(undefined, { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[13px] font-semibold bg-emerald-50 text-emerald-700">
                          {Math.round(normalizeConfidence(prediction.confidencePercentage))}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] sm:flex-row">
                <p className="text-sm font-medium text-slate-500">
                  Page {page} of {totalPages}
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => goToPage(page - 1)}
                    disabled={page <= 1 || loading}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                    Prev
                  </button>
                  <button
                    onClick={() => goToPage(page + 1)}
                    disabled={page >= totalPages || loading}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-slate-900/10 transition-all hover:bg-slate-800 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40"
                  >
                    Next
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HistoryDashboard;
