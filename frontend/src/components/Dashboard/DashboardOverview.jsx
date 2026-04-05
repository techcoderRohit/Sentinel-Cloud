"use client";

import React from 'react';

const stats = [
  { label: 'Active Devices', value: '1,204', change: '+12%', color: 'text-emerald-400' },
  { label: 'Messages (24h)', value: '8.4M', change: '+5.2%', color: 'text-cyan-400' },
  { label: 'Data Ingested', value: '42.1 GB', change: '-2.1%', color: 'text-slate-300' },
  { label: 'Error Rate', value: '0.01%', change: 'Stable', color: 'text-slate-300' },
];

const recentDevices = [
  { id: 'ESP32-Warehouse-A', status: 'Online', lastSeen: '2 secs ago', firmware: 'v1.2.4' },
  { id: 'RPI-Gateway-01', status: 'Online', lastSeen: '12 secs ago', firmware: 'v2.0.1' },
  { id: 'Arduino-Sensor-B', status: 'Offline', lastSeen: '4 hours ago', firmware: 'v1.1.0' },
  { id: 'ESP32-Warehouse-C', status: 'Online', lastSeen: '5 secs ago', firmware: 'v1.2.4' },
];

const DashboardOverview = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-[#0F172A] border border-slate-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-slate-400 text-sm font-medium mb-2">{stat.label}</h3>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold text-white">{stat.value}</span>
              <span className={`text-xs font-medium px-2 py-1 rounded bg-slate-800 ${stat.color}`}>{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#0F172A] border border-slate-800 rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">Recent Devices</h2>
          <button className="text-cyan-400 text-sm hover:text-cyan-300 transition-colors">View All →</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-[#111827] text-slate-500 font-medium border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Device ID</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Last Seen</th>
                <th className="px-6 py-4">Firmware</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {recentDevices.map((device, index) => (
                <tr key={index} className="hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4 font-mono text-slate-300">{device.id}</td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-2 ${device.status === 'Online' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      <div className={`w-2 h-2 rounded-full ${device.status === 'Online' ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-rose-400'}`}></div>
                      {device.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{device.lastSeen}</td>
                  <td className="px-6 py-4">{device.firmware}</td>
                  <td className="px-6 py-4 text-right">•••</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default DashboardOverview;