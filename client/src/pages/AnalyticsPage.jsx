import React, { useEffect, useMemo, useState } from 'react';
import { useUser, SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react';
import { userAPI, historyAPI, handleAPIError } from '../services/api';
import { formatDate, formatDateTime } from '../utils/date';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Filler, Tooltip, Legend);

const StatCard = ({ label, value }) => (
  <div className="p-4 bg-gray-50 rounded-lg text-center min-w-0">
    <div className="text-sm text-gray-500">{label}</div>
    <div className="text-xl md:text-2xl font-bold text-gray-900 tabular-nums break-words">{value}</div>
  </div>
);

const AnalyticsPage = () => {
  const { isSignedIn, user } = useUser();
  const [userStats, setUserStats] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [globalStats, setGlobalStats] = useState(null);
  const [error, setError] = useState(null);
  const [userDaily, setUserDaily] = useState([]);

  useEffect(() => {
    const run = async () => {
      try {
        setError(null);
        if (isSignedIn && user?.id) {
          const res = await userAPI.getStats(user.id);
          setUserStats(res?.data || res);
          // also fetch profile to get Mongo _id for per-user history
          const prof = await userAPI.getProfile(user.id);
          const profileData = prof?.data || prof;
          setUserProfile(profileData);

          // fetch last 30 days of this user's predictions (up to 500 for safety)
          const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
          if (profileData?._id) {
            const hist = await historyAPI.getHistory({ userId: profileData._id, startDate: since, limit: 500, sortOrder: 'asc' });
            const items = (hist?.data?.predictions || hist?.data || hist || []).map((p) => p.createdAt || p.timestamp || p.created_at);
            setUserDaily(items);
          }
        }
        const g = await historyAPI.getStats();
        setGlobalStats(g?.data || g);
      } catch (e) {
        const info = handleAPIError(e);
        setError(info.message);
      }
    };
    run();
  }, [isSignedIn, user?.id]);

  const chartData = useMemo(() => {
    const days = (globalStats?.dailyStats || []).map((d) => ({
      label: d._id, // YYYY-MM-DD
      count: d.count,
    }));
    const labels = days.map((d) => {
      const [y, m, day] = d.label.split('-');
      return `${day}/${m}`; // compact dd/mm
    });
    const data = days.map((d) => d.count);
    return {
      labels,
      datasets: [
        {
          label: 'Predictions (30d)',
          data,
          borderColor: 'rgba(59,130,246,0.9)',
          backgroundColor: 'rgba(59,130,246,0.15)',
          tension: 0.35,
          fill: true,
          pointRadius: 2,
        },
      ],
    };
  }, [globalStats]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: (ctx) => `${ctx.parsed.y} predictions`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        title: {
          display: true,
          text: 'Date (dd/mm)',
          color: '#6b7280',
          font: { size: 12, weight: '500' },
        },
      },
      y: {
        beginAtZero: true,
        grid: { color: '#eee' },
        ticks: { precision: 0, stepSize: 1 },
        title: {
          display: true,
          text: 'Predictions per day',
          color: '#6b7280',
          font: { size: 12, weight: '500' },
        },
      },
    },
  }), []);

  // Build a 14-day personal trend (dd/mm labels)
  const userTrendData = useMemo(() => {
    const days = [];
    const counts = {};
    const today = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const key = `${yyyy}-${mm}-${dd}`;
      days.push({ key, label: `${dd}/${mm}` });
      counts[key] = 0;
    }
    userDaily.forEach((ts) => {
      const d = new Date(ts);
      if (Number.isNaN(d.getTime())) return;
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const key = `${yyyy}-${mm}-${dd}`;
      if (key in counts) counts[key] += 1;
    });
    return {
      labels: days.map((d) => d.label),
      datasets: [
        {
          label: 'Your predictions (14d)'
          , data: days.map((d) => counts[d.key])
          , borderColor: 'rgba(245,158,11,0.9)'
          , backgroundColor: 'rgba(245,158,11,0.15)'
          , tension: 0.35
          , fill: true
          , pointRadius: 2
        }
      ]
    };
  }, [userDaily]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Analytics</h2>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="btn-primary text-sm">Login to see your analytics</button>
            </SignInButton>
          </SignedOut>
        </div>
        {error && <p className="text-red-600 mt-2">{error}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Activity</h3>
          {isSignedIn ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <StatCard label="Total Searches" value={userStats?.totalPredictions ?? 0} />
              <StatCard label="Member Since" value={formatDate(userStats?.memberSince)} />
              <div className="p-4 bg-gray-50 rounded-lg text-center min-w-0">
                <div className="text-sm text-gray-500">Last Active</div>
                <div className="text-base md:text-lg font-bold text-gray-900 tabular-nums break-words">
                  {formatDateTime(userStats?.lastActive)}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">Login to see your personal analytics.</p>
          )}
          {isSignedIn && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Your Trend (last 14 days)</h4>
              <div className="bg-white rounded-lg border border-gray-200 p-3" style={{ height: 220 }}>
                <Line data={userTrendData} options={chartOptions} />
              </div>
            </div>
          )}
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Global Usage</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
            <StatCard label="Total Predictions (all-time)" value={globalStats?.totalPredictions ?? 0} />
            <StatCard label="Avg Confidence" value={`${globalStats?.avgConfidence ?? 0}%`} />
            <StatCard label="Unique Breeds" value={globalStats?.uniqueBreedsCount ?? 0} />
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3" style={{ height: 220 }}>
            <Line data={chartData} options={chartOptions} />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Global daily prediction counts for the last 30 days. Y‑axis is “predictions per day”, X‑axis is date (dd/mm). “Total Predictions (all‑time)” is aggregated across the entire dataset.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
