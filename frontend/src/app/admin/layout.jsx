"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AdminSidebar from '@/components/Admin/AdminSidebar';
import AdminTopbar from '@/components/Admin/AdminTopbar';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

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

  if (!authorized) return null; // Or a loading spinner

  return (
    <div className="min-h-screen bg-[#0B1120] flex text-slate-300 font-sans">
      <AdminSidebar />
      <main className="flex-1 ml-64 flex flex-col min-h-screen relative">
        <AdminTopbar />
        <div className="p-8 flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
