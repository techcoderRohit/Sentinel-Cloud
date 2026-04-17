"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Cpu, Activity, ArrowLeft, Shield } from 'lucide-react';

const AdminSidebar = () => {
  const pathname = usePathname();

  const sidebarLinks = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: "/admin" },
    { name: 'User Management', icon: <Users size={20} />, path: "/admin/users" },
    { name: 'Device Management', icon: <Cpu size={20} />, path: "/admin/devices" },
    { name: 'System Health', icon: <Activity size={20} />, path: "/admin/system" },
  ];

  return (
    <aside className="w-64 bg-[#0F172A] border-r border-slate-800 flex flex-col fixed h-full z-10">
      <div className="h-16 flex items-center justify-center px-6 border-b border-slate-800">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center mr-3 shadow-lg shadow-red-500/20">
          <Shield className="text-white" size={20} />
        </div>
        <Link href="/admin" className="text-xl font-bold text-white">
          Sentinel <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Admin</span>
        </Link>
      </div>

      {/* Admin Badge */}
      <div className="px-4 py-3 mx-4 mt-4 mb-2 bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
          <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">Admin Panel</span>
        </div>
      </div>

      <nav className="flex-1 py-4 px-4 space-y-2">
        {sidebarLinks.map((item) => (
          <Link
            key={item.name}
            href={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              pathname === item.path 
              ? 'bg-red-500/10 text-red-400 border border-red-500/20 shadow-lg shadow-red-500/5' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>

      {/* Back to User Panel */}
      <div className="p-4 border-t border-slate-800">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800/50 transition-all"
        >
          <ArrowLeft size={20} />
          <span className="font-medium text-sm">Back to User Panel</span>
        </Link>
      </div>
    </aside>
  );
};

export default AdminSidebar;
