import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutDashboard, Cpu, GitBranch, Key, Settings, Terminal, LineChart, Brain, Upload } from 'lucide-react';

const Sidebar = () => {
  const pathname = usePathname();

  const sidebarLinks = [
    { name: 'Home', icon: <Home size={20} />, path: "/dashboard" },
    { name: 'Control Board', icon: <LayoutDashboard size={20} />, path: "/dashboard/control-board" },
    { name: 'Devices', icon: <Cpu size={20} />, path: "/dashboard/devices" },
    { name: 'Web Repl Console', icon: <Terminal size={20} />, path: "/dashboard/webRepl"},
    { name: 'Reports & Analytics', icon: <LineChart size={20} />, path: "/dashboard/reports" },
    { name: 'AI Insights', icon: <Brain size={20} />, path: "/dashboard/ai-insights" },
    { name: 'API Keys', icon: <Key size={20} />, path: "/dashboard/apikeymanager" },
    { name: 'Data Routing', icon: <GitBranch size={20} />, path: "/dashboard/routing" },
    { name: 'Settings', icon: <Settings size={20} />, path: "/dashboard/settings" },
  ];

  return (
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
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              pathname === item.path 
              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
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
  );
};

export default Sidebar;