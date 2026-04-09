"use client";
import React from 'react';
import {
  Cpu,
  Activity,
  Database,
  ShieldCheck,
  Bell,
  Terminal as TerminalIcon
} from 'lucide-react';

const DashboardOverview = () => {
  // 1. Stats Data (Future: Fetch from MongoDB/Express API)
  const stats = [
    { label: 'Total Devices', value: '12', sub: 'Provisioned', icon: <Cpu className="text-blue-400" />, color: 'bg-blue-500/10' },
    { label: 'Live Nodes', value: '05', sub: 'Active Now', icon: <Activity className="text-emerald-400" />, color: 'bg-emerald-500/10' },
    { label: 'Data Points', value: '14,204', sub: 'Total Logs', icon: <Database className="text-purple-400" />, color: 'bg-purple-500/10' },
    { label: 'System Health', value: '99.9%', sub: 'Backend Up', icon: <ShieldCheck className="text-cyan-400" />, color: 'bg-cyan-500/10' },
  ];

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">

      {/* A. Header Section
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome Back,     <span className="text-cyan-400">Rohit</span>
          </h1>

        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-xs font-bold hover:bg-gray-700 transition-all">
            <TerminalIcon size={14} /> Developer Mode
          </button>

        </div>
      </div>*/}

      {/* B. Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-[#0d1421] border border-gray-800 p-5 rounded-2xl flex items-center gap-4 hover:border-gray-600 transition-all group">
            <div className={`p-3 rounded-xl ${stat.color} group-hover:scale-110 transition-transform`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-xl font-bold text-white mt-1">{stat.value}</h3>
              <p className="text-[10px] text-gray-600 font-medium mt-1">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* C. Device Monitoring Table (2/3 Width) */}
        <div className="lg:col-span-2 bg-[#0d1421] border border-gray-800 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-gray-800 flex justify-between items-center">
            <h3 className="text-sm font-bold text-gray-400 tracking-wider">LIVE STREAMING NODES</h3>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded border border-emerald-500/20 uppercase font-black">Real-Time Sync</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#141c2d] text-[10px] text-gray-500 font-black uppercase tracking-[0.1em]">
                <tr>
                  <th className="px-6 py-4">Device Name</th>
                  <th className="px-6 py-4">API Key</th>
                  <th className="px-6 py-4 text-center">Temp/Hum</th>
                  <th className="px-6 py-4">Last Seen</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50 text-sm">
                <DeviceRow name="ESP32-Room1" apiKey="sk-sent...7c" val="28°C / 55%" time="2s ago" status="Online" />
                <DeviceRow name="Warehouse-Gate" apiKey="sk-sent...b2" val="--" time="4h ago" status="Offline" />
                <DeviceRow name="DHT-Sensor-X" apiKey="sk-sent...p9" val="24°C / 60%" time="15s ago" status="Online" />
              </tbody>
            </table>
          </div>
        </div>

        {/* D. Alert Log Container (1/3 Width) */}
        <div className="bg-[#0d1421] border border-gray-800 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-gray-400 tracking-wider mb-6 flex items-center justify-between">
            SYSTEM ALERTS
            <span className="text-cyan-400 text-xs cursor-pointer hover:underline">Clear</span>
          </h3>
          <div className="space-y-4">
            <AlertItem type="warning" text="Room 1 Temp exceeded 40°C" time="14:20" />
            <AlertItem type="success" text="New Device Registered: Warehouse-Gate" time="12:05" />
            <AlertItem type="info" text="API Key sk-sent...7c refreshed" time="10:45" />
          </div>

          {/* Storage Summary - Minimalistic */}
          <div className="mt-8 pt-6 border-t border-gray-800">
            <div className="flex justify-between text-[10px] font-bold text-gray-500 mb-2 uppercase">
              <span>Cloud Storage (Free Tier)</span>
              <span>1.2MB / 100MB</span>
            </div>
            <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-500 w-[12%]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Helper Components ---
const DeviceRow = ({ name, apiKey, val, time, status }) => (
  <tr className="hover:bg-gray-800/20 transition-all group">
    <td className="px-6 py-4 font-bold text-white">{name}</td>
    <td className="px-6 py-4 font-mono text-xs text-gray-600">{apiKey}</td>
    <td className="px-6 py-4 text-center font-bold text-cyan-400">{val}</td>
    <td className="px-6 py-4 text-xs text-gray-500">{time}</td>
    <td className="px-6 py-4">
      <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase ${status === 'Online' ? 'text-emerald-400' : 'text-red-500'}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${status === 'Online' ? 'bg-emerald-400' : 'bg-red-500'} animate-pulse`} />
        {status}
      </span>
    </td>
  </tr>
);

const AlertItem = ({ type, text, time }) => {
  const colors = {
    warning: 'border-yellow-500/50 text-yellow-500',
    success: 'border-emerald-500/50 text-emerald-500',
    info: 'border-cyan-500/50 text-cyan-400',
  };
  return (
    <div className={`p-3 rounded-xl border bg-gray-900/40 ${colors[type]}`}>
      <p className="text-xs font-medium leading-relaxed">{text}</p>
      <span className="text-[9px] opacity-60 font-bold mt-1 block uppercase">{time}</span>
    </div>
  );
};

export default DashboardOverview;