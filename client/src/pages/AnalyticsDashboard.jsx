import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip, AreaChart, Area } from 'recharts';
import { historyAPI, handleAPIError } from '../services/api';

const AnalyticsDashboard = () => {
  const { user } = useUser();
  const [dateRange, setDateRange] = useState('30'); // days
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    accuracy: 0,
    accuracyChange: 0,
    mostCommonBreed: '',
    breedPercentage: 0,
    submissionsChange: 0
  });
  
  const [breedData, setBreedData] = useState([]);
  const [accuracyData, setAccuracyData] = useState([]);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);

        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(dateRange));

        // Fetch stats from backend with date filter (auth via Clerk token)
        const statsResponse = await historyAPI.getStats({ 
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        });
        
        if (statsResponse.success) {
          const data = statsResponse.data;
          
          // Set main stats
          setStats({
            totalSubmissions: data.totalPredictions || 0,
            accuracy: data.avgConfidence || 0,
            accuracyChange: 0, // TODO: Calculate from historical data
            mostCommonBreed: data.topBreeds?.[0]?._id || 'N/A',
            breedPercentage: data.topBreeds?.[0] ? Math.round((data.topBreeds[0].count / data.totalPredictions) * 100) : 0,
            submissionsChange: 0 // TODO: Calculate from historical data
          });

          // Transform breed distribution for chart
          if (data.topBreeds && data.topBreeds.length > 0) {
            setBreedData(data.topBreeds.slice(0, 7).map(breed => ({
              name: breed._id.substring(0, 10), // Truncate long names
              value: breed.count
            })));
          }

          // Use backend-provided daily accuracy
          if (data.dailyAccuracy && data.dailyAccuracy.length > 0) {
            setAccuracyData(data.dailyAccuracy.map(d => ({
              name: d.date,
              accuracy: d.accuracy
            })));
          } else {
            setAccuracyData([]);
          }
        }

        // Fetch recent submissions (auth via Clerk token)
        const historyResponse = await historyAPI.getHistory({ 
          page: 1, 
          limit: 4 
        });

        if (historyResponse.success) {
          const predictions = historyResponse.data.predictions || [];
          setRecentSubmissions(predictions.map(pred => ({
            id: pred._id,
            breed: pred.predictedBreed,
            confidence: `${pred.confidencePercentage}%`,
            status: 'Successful',
            date: new Date(pred.createdAt).toISOString().split('T')[0],
            image: pred.imageUrl || `https://via.placeholder.com/400x300?text=${encodeURIComponent(pred.predictedBreed)}`
          })));
        }

      } catch (error) {
        console.error('Failed to fetch analytics:', error);
        const errorInfo = handleAPIError(error);
        console.error(errorInfo.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user?.id, dateRange]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-primary/70">Loading analytics...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex-1 p-6 lg:p-10">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
          {/* Page Heading */}
          <header className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-primary text-5xl font-black leading-tight tracking-tighter">Breed Analytics</h1>
            <select 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="flex min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-12 px-5 bg-bg-card text-primary text-base font-semibold leading-normal tracking-wide border border-primary/20 hover:bg-bg-card-subtle transition-colors"
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
              <option value="365">Last Year</option>
            </select>
          </header>

          {/* Stats Cards */}
          <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="flex flex-col gap-3 rounded-xl p-6 bg-bg-card border border-primary/10 shadow-sm">
              <p className="text-primary/70 text-base font-medium leading-normal">Total Submissions</p>
              <p className="text-primary tracking-tight text-4xl font-bold leading-tight">{stats.totalSubmissions.toLocaleString()}</p>
              <p className="text-primary text-sm font-medium leading-normal flex items-center gap-1">
                <span className="material-symbols-outlined text-base">trending_up</span>
                +{stats.submissionsChange}%
              </p>
            </div>
            <div className="flex flex-col gap-3 rounded-xl p-6 bg-bg-card border border-primary/10 shadow-sm">
              <p className="text-primary/70 text-base font-medium leading-normal">Overall Accuracy</p>
              <p className="text-primary tracking-tight text-4xl font-bold leading-tight">{stats.accuracy}%</p>
              <p className="text-primary text-sm font-medium leading-normal flex items-center gap-1">
                <span className="material-symbols-outlined text-base">trending_up</span>
                +{stats.accuracyChange}%
              </p>
            </div>
            <div className="flex flex-col gap-3 rounded-xl p-6 bg-bg-card border border-primary/10 shadow-sm">
              <p className="text-primary/70 text-base font-medium leading-normal">Most Common Breed</p>
              <p className="text-primary tracking-tight text-4xl font-bold leading-tight truncate">{stats.mostCommonBreed}</p>
              <p className="text-primary/70 text-sm font-normal leading-normal">{stats.breedPercentage}% of submissions</p>
            </div>
          </section>

          {/* Charts */}
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Bar Chart */}
            <div className="flex flex-col gap-4 rounded-xl border border-primary/10 p-6 bg-bg-card shadow-sm">
              <div className="flex flex-col gap-1">
                <p className="text-primary text-xl font-bold leading-normal">Distribution of Recognized Breeds</p>
                <p className="text-primary/70 text-sm">Top 7 breeds from last 30 days</p>
              </div>
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer>
                  <BarChart data={breedData}>
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }} 
                      dy={10} 
                    />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }} 
                      contentStyle={{ 
                        borderRadius: '8px', 
                        border: 'none', 
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        backgroundColor: '#fff',
                        color: '#1f2937'
                      }}
                      itemStyle={{ color: '#1f2937' }}
                      labelStyle={{ color: '#1f2937', fontWeight: 600 }}
                    />
                    <Bar 
                      dataKey="value" 
                      fill="var(--color-bg-card-subtle)"
                      radius={[10, 10, 0, 0]}
                      barSize={40} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Area Chart */}
            <div className="flex flex-col gap-4 rounded-xl border border-primary/10 p-6 bg-bg-card shadow-sm">
              <div className="flex flex-col gap-1">
                <p className="text-primary text-xl font-bold leading-normal">Recognition Accuracy Over Time</p>
                <p className="text-primary/70 text-sm">Average accuracy trend for last 30 days</p>
              </div>
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer>
                  <AreaChart data={accuracyData}>
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={false}
                      height={30}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '8px', 
                        border: 'none',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        backgroundColor: '#fff',
                        color: '#1f2937'
                      }}
                      itemStyle={{ color: '#1f2937' }}
                      labelStyle={{ color: '#1f2937', fontWeight: 600 }}
                    />
                    <Area 
                      type="natural" 
                      dataKey="accuracy" 
                      stroke="var(--color-primary)"
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-between px-4">
                <p className="text-primary/70 text-xs font-semibold leading-normal tracking-wide">Week 1</p>
                <p className="text-primary/70 text-xs font-semibold leading-normal tracking-wide">Week 2</p>
                <p className="text-primary/70 text-xs font-semibold leading-normal tracking-wide">Week 3</p>
                <p className="text-primary/70 text-xs font-semibold leading-normal tracking-wide">Week 4</p>
              </div>
            </div>
          </section>

          {/* Recent Submissions Header */}
          <h2 className="text-primary text-3xl font-bold leading-tight tracking-tight pt-5">Recent Submissions</h2>

          {/* Recent Submissions Table */}
          <section className="overflow-x-auto rounded-xl border border-primary/10 bg-bg-card shadow-sm">
            <table className="w-full text-left text-sm text-primary">
              <thead className="bg-bg-card-subtle text-xs uppercase tracking-wider text-primary/70">
                <tr>
                  <th className="px-6 py-4" scope="col">Image</th>
                  <th className="px-6 py-4" scope="col">Detected Breed</th>
                  <th className="px-6 py-4" scope="col">Confidence</th>
                  <th className="px-6 py-4" scope="col">Status</th>
                  <th className="px-6 py-4" scope="col">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentSubmissions.map((submission) => (
                  <tr key={submission.id} className="border-b border-primary/10 last:border-0 hover:bg-bg-card-subtle transition-colors">
                    <td className="p-4">
                      <div 
                        className="aspect-video w-24 rounded bg-cover bg-center"
                        style={{ backgroundImage: `url('${submission.image}')` }}
                      />
                    </td>
                    <td className={`px-6 py-4 font-medium ${submission.breed === 'Unknown' ? 'text-primary/50 italic' : 'text-primary'}`}>
                      {submission.breed}
                    </td>
                    <td className="px-6 py-4 text-primary/70">{submission.confidence}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                        submission.status === 'Successful' 
                          ? 'bg-bg-card-subtle text-primary' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {submission.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-primary/70">{submission.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsDashboard;
