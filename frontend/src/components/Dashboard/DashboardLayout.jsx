"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Home, LayoutDashboard, Cpu, GitBranch, Key, Settings, Bell, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';


const DashboardLayout = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuRef = useRef(null);

  // Bahar click karne par menu band karne ke liye
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const pathname = usePathname();

  const sidebarLinks = [
    { name: 'Home', icon: <Home size={20} />, path: "/dashboard" },
    { name: 'Control Board', icon: <LayoutDashboard size={20} />, path: "/dashboard/control-board" },
    { name: 'Devices', icon: <Cpu size={20} />, path: "/dashboard/devices" },
    { name: 'Data Routing', icon: <GitBranch size={20} />, path: "/dashboard/routing" },
    { name: 'API Keys', icon: <Key size={20} />, path: "/dashboard/apikeymanager" },
    { name: 'Settings', icon: <Settings size={20} />, path: "/dashboard/settings" },
  ];

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/auth/login";
  }

  return (
    <div className="min-h-screen bg-[#0B1120] flex text-slate-300 font-sans">
      <aside className="w-64 bg-[#0F172A] border-r border-slate-800 flex flex-col fixed h-full z-10">
        <div className="h-16 flex items-center justify-center px-6 border-b border-slate-800">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center mr-3">
            <span className="text-white font-bold">SC</span>
          </div>
          <Link href="/" className="text-xl font-bold text-white">
            Sentinel <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500">Cloud</span>
          </Link>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2">
          {sidebarLinks.map((item) => (
            <Link
              key={item.name}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${pathname === item.path ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm text-white">RM</div>
            <div className="flex flex-col">
              <span className="text-sm text-white font-medium">Developer</span>
              <span className="text-xs text-slate-500">Free Tier</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 ml-64 flex flex-col min-h-screen">
        <header className="h-16 bg-[#0B1120]/80 border-b border-slate-800 flex items-center justify-between px-8 sticky top-0 z-50">
          <h1 className="text-xl font-semibold tracking-tight text-white">IoT Monitoring Dashboard</h1>

          <div className="flex items-center gap-6">
            {/* Add Device Button */}
            <Link href="/dashboard/devices/addDevice">
              <button className="hidden md:block bg-linear-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600  px-4 py-2 font-bold transition-all">
                + Add Device
              </button>
            </Link>
            <div className="h-10 w-10 bg-cyan-500/20 border border-cyan-500/50 rounded-lg flex items-center justify-center text-cyan-400">
              <Bell size={20} />
            </div>

            {/* User Profile Dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-800 transition-all border border-transparent hover:border-slate-700"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg">
                  <User size={20} />
                </div>
              </button>

              {/* Dropdown Box */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-[#0F172A] border border-slate-800 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in duration-200">

                  {/* Option 1: Admin */}
                  <button className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-cyan-400 flex items-center gap-3 transition-colors">
                    <span className="text-lg">🛡️</span> Admin Panel
                  </button>

                  {/* Option 2: Guest User */}
                  <button className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-cyan-400 flex items-center gap-3 transition-colors">
                    <span className="text-lg">👥</span> Guest View
                  </button>

                  <div className="border-t border-slate-800 my-1"></div>

                  {/* Option 3: Logout */}
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-3 text-sm text-rose-400 hover:bg-rose-500/10 flex items-center gap-3 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>

                </div>
              )}
            </div>
          </div>
        </header>

        <div className="p-8 flex-1 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;