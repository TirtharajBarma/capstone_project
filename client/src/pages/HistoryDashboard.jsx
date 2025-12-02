import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import Sidebar from '../components/layout/Sidebar';
import { historyAPI, handleAPIError } from '../services/api';
import { formatDateTime } from '../utils/date';

const HistoryDashboard = () => {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        
        const params = {
          clerkId: user.id,
          page: pagination.currentPage,
          limit: 20,
          sortOrder: sortOrder
        };

        if (searchQuery.trim()) {
          params.breed = searchQuery.trim();
        }
        
        if (speciesFilter) {
          params.species = speciesFilter;
        }

        const response = await historyAPI.getHistory(params);

        if (response.success) {
          const predictions = response.data.predictions || [];
          
          setHistoryItems(predictions.map(pred => ({
            id: pred._id,
            breed: pred.predictedBreed,
            date: formatDateTime(pred.createdAt),
            image: pred.imageUrl || `https://via.placeholder.com/400x300?text=${encodeURIComponent(pred.predictedBreed)}`,
            confidence: pred.confidencePercentage,
            species: pred.species
          })));

          setPagination(response.data.pagination);
        }
      } catch (error) {
        console.error('Failed to fetch history:', error);
        const errorInfo = handleAPIError(error);
        console.error(errorInfo.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user?.id, searchQuery, pagination.currentPage, speciesFilter, sortOrder]);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (pagination.currentPage !== 1) {
      setPagination(prev => ({ ...prev, currentPage: 1 }));
    }
  }, [searchQuery, speciesFilter, sortOrder]);

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-gray-50">
      <div className="flex h-full min-w-0">
        <Sidebar />
        
        {/* Main Content */}
        <main className="flex flex-1 flex-col lg:ml-64 w-full">
          <div className="flex-1 p-6 lg:p-10">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
              {/* Page Heading */}
              <div>
                <p className="text-5xl font-black leading-tight tracking-[-0.033em] text-gray-800">Submission History</p>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 lg:flex-row lg:items-center shadow-sm">
                {/* Search Bar */}
                <div className="flex-grow">
                  <label className="flex h-14 w-full flex-col">
                    <div className="flex h-full w-full flex-1 items-stretch rounded-lg">
                      <div className="flex items-center justify-center rounded-l-lg border-y border-l border-gray-200 bg-gray-50 pl-4 text-gray-500">
                        <span className="material-symbols-outlined text-2xl">search</span>
                      </div>
                      <input 
                        className="form-input h-full w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg border border-gray-200 bg-gray-50 px-4 text-base font-normal leading-normal text-gray-800 placeholder:text-gray-500 focus:border-green-600 focus:outline-0 focus:ring-0" 
                        placeholder="Search by breed..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </label>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                  <select 
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="flex h-14 shrink-0 items-center justify-center gap-x-2 rounded-lg border border-gray-200 bg-gray-50 px-5 hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <option value="desc">Sort by: Newest</option>
                    <option value="asc">Sort by: Oldest</option>
                  </select>
                  
                  <button 
                    onClick={() => setSpeciesFilter('')}
                    className={`flex h-14 shrink-0 items-center justify-center gap-x-2 rounded-lg border px-5 transition-colors ${
                      speciesFilter === '' 
                        ? 'border-green-600 bg-green-50 text-green-700' 
                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <p className="text-base font-medium leading-normal">All</p>
                  </button>
                  
                  <button 
                    onClick={() => setSpeciesFilter('cattle')}
                    className={`flex h-14 shrink-0 items-center justify-center gap-x-2 rounded-lg border px-5 transition-colors ${
                      speciesFilter === 'cattle' 
                        ? 'border-green-600 bg-green-50 text-green-700' 
                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <p className="text-base font-medium leading-normal">Cattle</p>
                  </button>
                  
                  <button 
                    onClick={() => setSpeciesFilter('buffalo')}
                    className={`flex h-14 shrink-0 items-center justify-center gap-x-2 rounded-lg border px-5 transition-colors ${
                      speciesFilter === 'buffalo' 
                        ? 'border-green-600 bg-green-50 text-green-700' 
                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <p className="text-base font-medium leading-normal">Buffalo</p>
                  </button>
                </div>
              </div>

              {/* History List */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-gray-600">Loading history...</div>
                </div>
              ) : historyItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center mt-4">
                  <span className="material-symbols-outlined text-6xl text-gray-400">history_toggle_off</span>
                  <h3 className="text-xl font-bold text-gray-800">No History Yet</h3>
                  <p className="text-gray-600 max-w-xs">
                    {searchQuery 
                      ? `No results found for "${searchQuery}"`
                      : 'Your past breed recognitions will appear here once you make a submission.'}
                  </p>
                  {!searchQuery && (
                    <a href="/dashboard" className="mt-4 flex h-12 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-green-600 px-6 text-white transition hover:bg-green-700">
                      <p className="text-sm font-bold leading-normal">Recognize Your First Animal</p>
                      <span className="material-symbols-outlined text-xl">arrow_forward</span>
                    </a>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-3">
                    {historyItems.map((item) => (
                      <div 
                        key={item.id}
                        className="flex cursor-pointer items-center gap-6 rounded-lg border border-transparent bg-white p-6 min-h-[100px] justify-between transition-all hover:border-green-500 hover:shadow-md"
                      >
                        <div className="flex items-center gap-6">
                          <div 
                            className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg size-20"
                            style={{ backgroundImage: `url("${item.image}")` }}
                          />
                          <div className="flex flex-col justify-center">
                            <p className="text-lg font-semibold leading-normal line-clamp-1 text-gray-800">{item.breed}</p>
                            <p className="text-base font-normal leading-normal text-gray-600 line-clamp-2 mt-1">{item.date}</p>
                            <p className="text-sm text-green-600 mt-1">Confidence: {item.confidence}%</p>
                          </div>
                        </div>
                        <div className="shrink-0 text-gray-500">
                          <span className="material-symbols-outlined flex size-8 items-center justify-center text-3xl">chevron_right</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-4 mt-6">
                      <button 
                        onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                        disabled={!pagination.hasPrevPage}
                        className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <span className="text-gray-600">
                        Page {pagination.currentPage} of {pagination.totalPages}
                      </span>
                      <button 
                        onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                        disabled={!pagination.hasNextPage}
                        className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HistoryDashboard;
