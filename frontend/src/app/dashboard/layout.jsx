// import React, { Children } from 'react';
// import DashboardLayout from '@/components/Dashboard/DashboardLayout';

// export default function DashboardRootLayout({ children }) {
//   return <DashboardLayout>
//         {children}
//       </DashboardLayout>
// }

"use client";
import React from 'react';
import Sidebar from '@/components/Dashboard/Sidebar';
import Navbar from '@/components/Dashboard/Topbar';   // Sahi path check karein

const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#0B1120] flex text-slate-300 font-sans">
      {/* Sidebar Component */}
      <Sidebar />

      <main className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Navbar Component */}
        <Navbar />

        {/* Content Area */}
        <div className="p-8 flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;