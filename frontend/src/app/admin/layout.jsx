"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AdminSidebar from '@/components/Admin/AdminSidebar';
import AdminTopbar from '@/components/Admin/AdminTopbar';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');

    if (!token) {
      router.replace('/auth/login');
      return;
    }

    if (role !== 'admin') {
      router.replace('/dashboard');
      return;
    }

    setAuthorized(true);
  }, [router]);

  // Close sidebar on path change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  if (!authorized) return null; // Or a loading spinner

  return (
    <div className="min-h-screen bg-[#0B1120] flex text-slate-300 font-sans overflow-x-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Admin Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 transition-transform duration-300 lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <AdminSidebar />
      </div>

      <main className="flex-1 lg:ml-64 flex flex-col min-h-screen relative">
        <AdminTopbar onMenuClick={() => setIsSidebarOpen(true)} />
        <div className="p-4 md:p-8 flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
