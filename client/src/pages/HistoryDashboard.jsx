import React, { useState } from 'react';
import Sidebar from '../components/layout/Sidebar';

const HistoryDashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock data - replace with actual API call
  const historyItems = [
    {
      id: 1,
      breed: 'Gir Cow',
      date: 'June 15, 2024, 10:32 AM',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA2KkUDp82RLtnk0tW8YaYW8OybpxRn7UB8xT9c6Pb5qtkW7q7ARL46XuNcWFt0MvYGyrPNho-9JRHkZGX71O5l8BChvjjiTJNLh3xxqUyS9eEbkztK3QxXqwpPJ74p0Xky70-LT7e20Wht-hcTyhOmRbOV60G1JNgoO4GWGXZFr2LtyW-1ni3PHItbN5hM3Q8PWhtWEAAikRx4sV5PX3xLBlJEM9z_WIYAF5Wy3koqDPPa8MlQSK80gudw032-0YzmBOzAnzqXqYkm'
    },
    {
      id: 2,
      breed: 'Murrah Buffalo',
      date: 'June 14, 2024, 3:15 PM',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDHN4oqY1bD82l1_OXiqf8Zgp-RDVg3vlDH8XTlEyQ89XU81hwO2wqhNHaHUGb4Vx2QCiNocBEIUBKG3f6DQ0mK9T39fEjWlvuHhSBjfV7SpyzK66WKKXR9cWBwJXulLcmZ7zOY9LwoR5T5h9lxV-YXZ9HdiyzyOvEaWzYdlZAjCD-BUbbi_yjyhbWOlQhSyMBRBdcSucplK_78QOCTXbTo-zjUZjT5jUvoKx5QcBiCKJdIGxRcDhBQexsKRm4u3ak4yG2_fzydeQLd'
    },
    {
      id: 3,
      breed: 'Sahiwal Cow',
      date: 'June 12, 2024, 9:01 AM',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9aIcIK8LF_AfuFnfOF80WiWtW981SoX6U7R6-HVnJxuEd25inQaa-9S-6StmHPcFpLHYWKp-vfJnMKB8MdQwL4di83u7sq71gHZsPeMX-eckUX3uXKrtbkVA6XiI2L44nfR4UoPg4sUCYIsF11zWpsZsGWi-L0viKRCZ825QLU1bt0gcDt6uTZ-PCx9KFVX-Vki4ftXYbpmtcQfza3mVo7mQfo5LjTX8P8bjpcg_cqfhgI1A0RY87AUpvDr-Phqg3O0ITtnPusImP'
    },
    {
      id: 4,
      breed: 'Red Sindhi Cow',
      date: 'June 11, 2024, 6:48 PM',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAn8CrcBEuGuNhyCDElD3pTT79vDrM_-dxAMWc9ufKR8R8tTJyltahZS0XB5Y8NUpUfFPdvAX8FaUyW7At8_uXS_4wJINQ6A1tEww9mc_JbiunWPQjm5Wt0VjBhVV-fYC3z5g63Cb76TjT_CZi6qMUoo5kxaC-joMlDHANPSsgtXWk5mL5q1ZgmZqeyGoTLg04kIuafxUD2ACeIyGKsdVkGmb5VozfcVF_hML0nOBQEMQylnCHIJOqbCCzXjIF_uTLh_OQB5LWgFquM'
    },
    {
      id: 5,
      breed: 'Surti Buffalo',
      date: 'June 10, 2024, 11:20 AM',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA73Kg9l_cpIp38MWTTxS-8Hr5h3iNcdWZ4WUiytLtIIsHocGJnQaqtPXk1uHMmJaNwJ_f905BddjORIg2lTYjBH0yBsOsJol825Xa54so-3VMk4kzojEiW5Wm1CP8uPqXZkGen6JpxPvmCNwK-eeMnCGzhQQpibySq8klysaHv3l1CeVMHdUvW_oudVEStFeCBwTWWkbsPG3DnXMEYdKdtpSqeuFFcGQN6NJ_ACJhBmsVlIy3D0qaB2Msv2fIHKbHvZ7MRL5eSFlV7'
    }
  ];

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
                  <button className="flex h-14 shrink-0 items-center justify-center gap-x-2 rounded-lg border border-gray-200 bg-gray-50 px-5 hover:bg-gray-100 transition-colors">
                    <p className="text-base font-medium leading-normal text-gray-700">Sort by: Newest</p>
                    <span className="material-symbols-outlined text-xl text-gray-600">expand_more</span>
                  </button>
                  <button className="flex h-14 shrink-0 items-center justify-center gap-x-2 rounded-lg border border-gray-200 bg-gray-50 px-5 hover:bg-gray-100 transition-colors">
                    <p className="text-base font-medium leading-normal text-gray-700">All</p>
                    <span className="material-symbols-outlined text-xl text-gray-600">expand_more</span>
                  </button>
                  <button className="flex h-14 shrink-0 items-center justify-center gap-x-2 rounded-lg border border-gray-200 bg-gray-50 px-5 hover:bg-gray-100 transition-colors">
                    <p className="text-base font-medium leading-normal text-gray-700">Cow</p>
                  </button>
                  <button className="flex h-14 shrink-0 items-center justify-center gap-x-2 rounded-lg border border-gray-200 bg-gray-50 px-5 hover:bg-gray-100 transition-colors">
                    <p className="text-base font-medium leading-normal text-gray-700">Buffalo</p>
                  </button>
                </div>
              </div>

              {/* History List */}
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
                      </div>
                    </div>
                    <div className="shrink-0 text-gray-500">
                      <span className="material-symbols-outlined flex size-8 items-center justify-center text-3xl">chevron_right</span>
                    </div>
                  </div>
                ))}

                {/* Empty State (uncomment when no data) */}
                {/* {historyItems.length === 0 && (
                  <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center mt-4">
                    <span className="material-symbols-outlined text-6xl text-gray-400">history_toggle_off</span>
                    <h3 className="text-xl font-bold text-gray-800">No History Yet</h3>
                    <p className="text-gray-600 max-w-xs">Your past breed recognitions will appear here once you make a submission.</p>
                    <button className="mt-4 flex h-12 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-green-600 px-6 text-white transition hover:bg-green-700">
                      <p className="text-sm font-bold leading-normal">Recognize Your First Animal</p>
                      <span className="material-symbols-outlined text-xl">arrow_forward</span>
                    </button>
                  </div>
                )} */}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-center gap-5 pt-8">
                <button className="flex h-12 w-12 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:bg-green-50 hover:border-green-600">
                  <span className="material-symbols-outlined text-2xl">chevron_left</span>
                </button>
                <span className="text-base font-medium text-gray-700">Page 1 of 10</span>
                <button className="flex h-12 w-12 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 transition hover:bg-green-50 hover:border-green-600">
                  <span className="material-symbols-outlined text-2xl">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HistoryDashboard;
