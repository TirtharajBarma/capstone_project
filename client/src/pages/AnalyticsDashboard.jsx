import React, { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip, AreaChart, Area } from 'recharts';

const AnalyticsDashboard = () => {
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
    // TODO: Replace with actual API calls
    // Simulating API data fetch
    setStats({
      totalSubmissions: 1482,
      accuracy: 92.3,
      accuracyChange: 1.2,
      mostCommonBreed: 'Holstein Friesian',
      breedPercentage: 28,
      submissionsChange: 12
    });

    setBreedData([
      { name: 'Holstein', value: 60 },
      { name: 'Jersey', value: 100 },
      { name: 'Angus', value: 80 },
      { name: 'Hereford', value: 75 },
      { name: 'Gir', value: 50 },
      { name: 'Sahiwal', value: 30 },
      { name: 'Murrah', value: 25 }
    ]);

    setAccuracyData([
      { name: 'Week 1', accuracy: 85 },
      { name: 'Week 1.5', accuracy: 92 },
      { name: 'Week 2', accuracy: 78 },
      { name: 'Week 2.5', accuracy: 88 },
      { name: 'Week 3', accuracy: 82 },
      { name: 'Week 3.5', accuracy: 91 },
      { name: 'Week 4', accuracy: 75 },
      { name: 'Week 4.5', accuracy: 95 },
      { name: 'Week 5', accuracy: 80 }
    ]);

    setRecentSubmissions([
      {
        id: 1,
        breed: 'Holstein Friesian',
        confidence: '98.2%',
        status: 'Successful',
        date: '2024-05-20',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDyQOwvP8PPl5DzcGlSWxiK5SK3ZFtLH9u3BiLy6P1XHllClsliVJCOtO-vhk5jmJXNWaE6RAnrVk6qqsRj146h5ObBIEnH0L3Oc_NBbg4WvFUYufmLkuJV3HVtpn5diara1VRmzkv_3_4eAl2n4b6i1SE8JO_RULVaAhCD8yYdiAYItNxjIw86APmv36BzWKy7LiCLp0tD0JrfK0iOYutWUZrueAnlKefetKKHDVeGdSBqci9Ewu5rOca-lPtQL9ZTOlHe8aUl6qbO'
      },
      {
        id: 2,
        breed: 'Jersey',
        confidence: '95.5%',
        status: 'Successful',
        date: '2024-05-20',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBdoE24RuAGKA9q21VB9xL_g3-b84TpsEcVJK9rG4YO6ZJieF0R000rrb-7pnJ-uHMXITAgL-JOKxZXi6QzhD11C08F_iW9K-cTees0diV1E0mRS6Tu_6dNTgHOQjALkesKa0jR_uE4Ch4RfPv0egpB5kSRK76I8XndLv7culPIAyzHUvLGioswcrvhp4oXlBRaEmSKfKRVXhofApv_U2AmVRv2g8LYXNlOObpvlaPDT2w69KFEkwz2gitB5x1dQZ3vF5VzONoVR3yd'
      },
      {
        id: 3,
        breed: 'Angus',
        confidence: '89.7%',
        status: 'Successful',
        date: '2024-05-19',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCzZz7SdcbBn-7kp31GsaWpR1g-OX8nCjpLyZBajrZTNtyYHngSBBRJyRUgeWpdAtYrfDq1KbDesz0UuYyZM8iFaphC90fcv8B7oMl8Casjv9-EX0QKqq3eh4LaHKs2nf4YDrTzl3SNgPkoTGqhhSzAwP0jiwr6Q8vVurjCSBqInY_sdqEa7gWPYdkLvm0oG96n4p1ET8gnIHURXQ264yvdff-eqd__PX-1xzy1JyCmoUClNl4baZWzMcLhyYe3yJ02BHC7-m3QTNa2'
      },
      {
        id: 4,
        breed: 'Unknown',
        confidence: '-',
        status: 'Failed',
        date: '2024-05-18',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBgP4PHiCvjRN435L3jR7h8jVrRu8KxqnQPw36S2EtXz33FcvvZScHqJh2_sr-MDQXixl-ISkrgnY0cPX21gyC6wEN1VD4Cv9kGaAm4L0BnsJOwSon93_u2RcHRErlDqMrLsC7aSkKENDM9-TzpYgJ3UlMaEgG9VmSwFkKha05wlrkNTn1ghQq2NweJaomDcvkhI6RDyKTMyPkMoTpkt8dvp5w0oBovH3pS8VbhUJiylOYNTugdpwNGr3y2wI3gJ-_wuxIsY0ep8J6s'
      }
    ]);

    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-gray-50">
        <div className="flex h-full min-w-0">
          <Sidebar />
          <main className="flex flex-1 flex-col lg:ml-64 w-full">
            <div className="flex items-center justify-center h-screen">
              <div className="text-gray-600">Loading analytics...</div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-gray-50">
      <div className="flex h-full min-w-0">
        <Sidebar />
        
        <main className="flex flex-1 flex-col lg:ml-64 w-full">
          <div className="flex-1 p-6 lg:p-10">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
              {/* Page Heading */}
              <header className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-gray-800 text-5xl font-black leading-tight tracking-tighter">Breed Analytics</h1>
                <button className="flex min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-12 px-5 bg-white text-gray-700 text-base font-semibold leading-normal tracking-wide border border-gray-200 hover:bg-gray-50 transition-colors">
                  <span className="material-symbols-outlined">calendar_today</span>
                  <span className="truncate">Last 30 Days</span>
                  <span className="material-symbols-outlined">expand_more</span>
                </button>
              </header>

              {/* Stats Cards */}
              <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="flex flex-col gap-3 rounded-xl p-6 bg-white border border-gray-200 shadow-sm">
                  <p className="text-gray-700 text-base font-medium leading-normal">Total Submissions</p>
                  <p className="text-gray-800 tracking-tight text-4xl font-bold leading-tight">{stats.totalSubmissions.toLocaleString()}</p>
                  <p className="text-green-600 text-sm font-medium leading-normal flex items-center gap-1">
                    <span className="material-symbols-outlined text-base">trending_up</span>
                    +{stats.submissionsChange}%
                  </p>
                </div>
                <div className="flex flex-col gap-3 rounded-xl p-6 bg-white border border-gray-200 shadow-sm">
                  <p className="text-gray-700 text-base font-medium leading-normal">Overall Accuracy</p>
                  <p className="text-gray-800 tracking-tight text-4xl font-bold leading-tight">{stats.accuracy}%</p>
                  <p className="text-green-600 text-sm font-medium leading-normal flex items-center gap-1">
                    <span className="material-symbols-outlined text-base">trending_up</span>
                    +{stats.accuracyChange}%
                  </p>
                </div>
                <div className="flex flex-col gap-3 rounded-xl p-6 bg-white border border-gray-200 shadow-sm">
                  <p className="text-gray-700 text-base font-medium leading-normal">Most Common Breed</p>
                  <p className="text-gray-800 tracking-tight text-4xl font-bold leading-tight truncate">{stats.mostCommonBreed}</p>
                  <p className="text-gray-600 text-sm font-normal leading-normal">{stats.breedPercentage}% of submissions</p>
                </div>
              </section>

              {/* Charts */}
              <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Bar Chart */}
                <div className="flex flex-col gap-4 rounded-xl border border-gray-200 p-6 bg-white shadow-sm">
                  <div className="flex flex-col gap-1">
                    <p className="text-gray-800 text-xl font-bold leading-normal">Distribution of Recognized Breeds</p>
                    <p className="text-gray-600 text-sm">Top 7 breeds from last 30 days</p>
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
                          fill="#dcfce7"
                          radius={[10, 10, 0, 0]}
                          barSize={40} 
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Area Chart */}
                <div className="flex flex-col gap-4 rounded-xl border border-gray-200 p-6 bg-white shadow-sm">
                  <div className="flex flex-col gap-1">
                    <p className="text-gray-800 text-xl font-bold leading-normal">Recognition Accuracy Over Time</p>
                    <p className="text-gray-600 text-sm">Average accuracy trend for last 30 days</p>
                  </div>
                  <div style={{ width: '100%', height: 280 }}>
                    <ResponsiveContainer>
                      <AreaChart data={accuracyData}>
                        <defs>
                          <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
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
                          stroke="#16a34a"
                          strokeWidth={3}
                          fillOpacity={1} 
                          fill="url(#colorGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-between px-4">
                    <p className="text-gray-600 text-xs font-semibold leading-normal tracking-wide">Week 1</p>
                    <p className="text-gray-600 text-xs font-semibold leading-normal tracking-wide">Week 2</p>
                    <p className="text-gray-600 text-xs font-semibold leading-normal tracking-wide">Week 3</p>
                    <p className="text-gray-600 text-xs font-semibold leading-normal tracking-wide">Week 4</p>
                  </div>
                </div>
              </section>

              {/* Recent Submissions Header */}
              <h2 className="text-gray-800 text-3xl font-bold leading-tight tracking-tight pt-5">Recent Submissions</h2>

              {/* Recent Submissions Header */}
              <h2 className="text-gray-800 text-3xl font-bold leading-tight tracking-tight pt-5">Recent Submissions</h2>

              {/* Recent Submissions Table */}
              <section className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                <table className="w-full text-left text-sm text-gray-800">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-600">
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
                      <tr key={submission.id} className="border-b border-gray-200 last:border-0 hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                          <div 
                            className="aspect-video w-24 rounded bg-cover bg-center"
                            style={{ backgroundImage: `url('${submission.image}')` }}
                          />
                        </td>
                        <td className={`px-6 py-4 font-medium ${submission.breed === 'Unknown' ? 'text-gray-500 italic' : 'text-gray-800'}`}>
                          {submission.breed}
                        </td>
                        <td className="px-6 py-4 text-gray-700">{submission.confidence}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                            submission.status === 'Successful' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {submission.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{submission.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
