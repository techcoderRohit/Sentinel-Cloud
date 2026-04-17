"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Shield, Clock } from 'lucide-react';

const AdminTopbar = () => {
  const router = useRouter();
  const [adminName, setAdminName] = useState('Admin');
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user?.name) setAdminName(user.name);
    } catch (e) {}

    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');
    router.push('/auth/login');
  };

  return (
    <header className="h-16 bg-[#0b1120]/80 backdrop-blur-xl border-b border-slate-800 flex items-center justify-between px-8 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/10 border border-cyan-400/20 rounded-full">
          <Shield size={14} className="text-cyan-400" />
          <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Administrator</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Live Clock */}
        <div className="flex items-center gap-2 text-slate-400">
          <Clock size={16} />
          <span className="text-sm font-mono">{currentTime}</span>
        </div>

        {/* Admin Info */}
        <div className="flex items-center gap-3 pl-6 border-l border-slate-700">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-cyan-400 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-cyan-400/20">
            {adminName.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-white font-medium">{adminName}</span>
            <span className="text-xs text-cyan-400">Admin</span>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-cyan-400 hover:bg-cyan-400/10 rounded-lg transition-all duration-200"
          title="Logout"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default AdminTopbar;
