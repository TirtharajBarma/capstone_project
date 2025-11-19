import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { userAPI, historyAPI, handleAPIError } from '../services/api';
import { formatDate, formatDateTime } from '../utils/date';

const HistoryPage = () => {
  const { isSignedIn, user } = useUser();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        if (isSignedIn && user?.id) {
          // User stats (returns { totalPredictions, lastActive, memberSince, role })
          const res = await userAPI.getStats(user.id);
          setStats(res?.data || res);
        }
        // Show some recent predictions (global) for context
        const recentRes = await historyAPI.getRecent(10);
        setRecent(recentRes?.data || recentRes || []);
      } catch (e) {
        const info = handleAPIError(e);
        setError(info.message);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [isSignedIn, user?.id]);

  if (!isSignedIn) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="card p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Please log in to view History</h2>
          <p className="text-gray-600">Your personal prediction history appears once you're signed in.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="card p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Your History</h2>
        {loading ? (
          <p className="text-gray-600">Loading…</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500">Total Searches</div>
              <div className="text-3xl font-bold text-gray-900">{stats?.totalPredictions ?? 0}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg min-w-0">
              <div className="text-sm text-gray-500">Member Since</div>
              <div className="text-base md:text-lg font-semibold text-gray-900 break-words">{formatDate(stats?.memberSince)}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg min-w-0">
              <div className="text-sm text-gray-500">Last Active</div>
              <div className="text-base md:text-lg font-semibold text-gray-900 tabular-nums break-words">{formatDateTime(stats?.lastActive)}</div>
            </div>
          </div>
        )}
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Predictions (global)</h3>
        {recent && recent.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {/* Header */}
            <div className="hidden md:grid grid-cols-12 py-2 text-xs text-gray-500">
              <div className="col-span-6">Breed</div>
              <div className="col-span-2 text-right">Confidence</div>
              <div className="col-span-4 text-right">Time</div>
            </div>
            {recent.map((r, idx) => (
              <div key={idx} className="py-3 grid grid-cols-12 items-center text-sm">
                <div className="col-span-6 text-gray-700 truncate">{r.predictedBreed || r.breed}</div>
                <div className="col-span-2 text-right text-gray-700 font-medium">{Math.round((r.confidence || 0) * 100)}%</div>
                <div className="col-span-4 text-right text-gray-400 whitespace-nowrap">{r.createdAt ? formatDateTime(r.createdAt) : '-'}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No recent predictions.</p>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
