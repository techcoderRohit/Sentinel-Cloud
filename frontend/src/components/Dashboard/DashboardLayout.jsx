import React from 'react';
import Link from 'next/link';

const sidebarLinks = [
  { name: 'Home', icon: '🏠', path: "/", active: true },
  { name: 'Devices', icon: '📱', path: "/devices", active: false },
  { name: 'Data Routing', icon: '🔀', active: false },
  { name: 'API Keys', icon: '🔑', active: false },
  { name: 'Settings', icon: '⚙️', active: false }, ,

]

const DashboardLayout = ({ children }) => {
  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/auth/login"
  }
  return (
    <div className="min-h-screen bg-[#0B1120] flex text-slate-300 font-sans">

      {/* Sidebar */}
      <aside className="w-64 bg-[#0F172A] border-r border-slate-800 flex flex-col fixed h-full z-10">
        {/* Brand */}
        <div className="h-16 flex items-center justify-center px-6 border-b border-slate-800">
          <div className="w-8 h-8 rounded bg-linear-to-br from-cyan-400 to-blue-500 flex items-center justify-center mr-3">
            <span className="text-white font-bold">SC</span>
          </div>
          <Link href="/" className="text-xl font-bold text-white">
            Sentinel <span className=" text-transparent bg-clip-text bg-linear-to-r from-cyan-500 to-blue-500">Cloud</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-4 space-y-2">
          {sidebarLinks.map((item) => (
            <a
              key={item.name}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${item.active
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </a>
          ))}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm text-white">
              US
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-white font-medium">Developer</span>
              <span className="text-xs text-slate-500">Free Tier</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-16 bg-[#0B1120]/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-8 sticky top-0 z-0">
          <h1 className="text-xl font-semibold text-white">IoT Monitoring Dashboard</h1>
          <div className='flex gap-4'>
            <Link href="/devices/addDevice">
              <button className="bg-linear-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600  px-4 py-2 font-bold transition-all">
                + Add Device
              </button>
            </Link>

            <button
              onClick={logout}
              className="bg-linear-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600  px-4 py-2 font-bold transition-all">
              Logout
            </button>

          </div>
        </header>

        {/* Page Content */}
        <div className="p-8 flex-1 overflow-y-auto">
          {children}
        </div>
      </main>

    </div>
  );
};

export default DashboardLayout;