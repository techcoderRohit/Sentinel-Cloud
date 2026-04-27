"use client";
import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import {
  Cpu,
  Activity,
  Database,
  ShieldCheck,
  Bell,
  Terminal as TerminalIcon
} from 'lucide-react';
import API from '../../utils/api';

const DashboardOverview = () => {
  const [liveNodes, setLiveNodes] = useState({});
  const [devices, setDevices] = useState([]);
  const [totalDataPoints, setTotalDataPoints] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all registered devices
    const fetchDevices = async () => {
      try {
        const response = await API.get('/devices/my-devices');
        if (response.data.success) {
          setDevices(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching devices:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();

    // 1. Backend Server URL (Make sure your Node.js server is running on 5000)
    const socket = io('http://localhost:5000');

    socket.on('connect', () => {
      setConnectionStatus('Online');
      console.log("Connected to Backend Bridge");
    });

    // 2. Receiving data from Backend
    socket.on('telemetry_update', (data) => {
      // Data format expected from Backend: 
      // { apiKey: '...', deviceName: '...', payload: { temperature: 25, humidity: 60 } }

      setLiveNodes(prev => ({
        ...prev,
        [data.apiKey]: {
          name: data.deviceName || 'Unknown Device',
          apiKey: data.apiKey,
          val: `${data.payload.temperature ?? '--'}°C / ${data.payload.humidity ?? '--'}%`,
          time: new Date().toLocaleTimeString(),
          status: 'Online'
        }
      }));

      setTotalDataPoints(prev => prev + 1);
    });

    socket.on('disconnect', () => setConnectionStatus('Offline'));

    return () => socket.disconnect();
  }, []);

  const liveNodeList = Object.values(liveNodes);

  // Stats Logic
  const stats = [
    { label: 'Total Devices', value: devices.length, sub: 'Registered', icon: <Cpu className="text-blue-400" />, color: 'bg-blue-500/10' },
    { label: 'Live Nodes', value: liveNodeList.filter(n => n.status === 'Online').length.toString().padStart(2, '0'), sub: 'Streaming Now', icon: <Activity className="text-emerald-400" />, color: 'bg-emerald-500/10' },
    { label: 'Data Points', value: totalDataPoints.toLocaleString(), sub: 'Total Logs', icon: <Database className="text-purple-400" />, color: 'bg-purple-500/10' },
    { label: 'Backend Status', value: connectionStatus, sub: 'Socket.io', icon: <ShieldCheck className={connectionStatus === 'Online' ? "text-cyan-400" : "text-red-400"} />, color: 'bg-cyan-500/10' },
  ];

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500 bg-[#0b1120] min-h-screen text-white">
      {/* Stats Cards Row */}
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
        {/* Device Monitoring Table */}
        <div className="lg:col-span-2 bg-[#0d1421] border border-gray-800 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-gray-800 flex justify-between items-center">
            <h3 className="text-sm font-bold text-gray-400 tracking-wider">REGISTERED DEVICES</h3>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded border border-emerald-500/20 uppercase font-black animate-pulse">
              {connectionStatus === 'Online' ? 'Real-Time Sync' : 'Reconnecting...'}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#141c2d] text-[10px] text-gray-500 font-black uppercase tracking-[0.1em]">
                <tr>
                  <th className="px-6 py-4">Device Name</th>
                  <th className="px-6 py-4">Device ID</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-10 text-center text-gray-500">
                      Loading devices...
                    </td>
                  </tr>
                ) : devices.length > 0 ? devices.map((device, i) => {
                  const isLive = liveNodes[device.apiKey];
                  
                  // Calculate if device was recently active (within last 60 seconds)
                  const lastActiveDate = new Date(device.lastActive);
                  const isRecentlyActive = (new Date() - lastActiveDate) < 60000; 

                  const currentStatus = (isLive || isRecentlyActive) ? 'Online' : 'Offline';

                  return (
                    <DeviceRow 
                      key={device._id || i} 
                      name={device.deviceName} 
                      deviceId={device.deviceId} 
                      location={device.location || 'N/A'} 
                      status={currentStatus} 
                    />
                  );
                }) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-10 text-center text-gray-500">
                      No registered devices found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alert Log */}
        <div className="bg-[#0d1421] border border-gray-800 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-gray-400 tracking-wider mb-6 flex items-center justify-between">
            SYSTEM LOGS
            <span className="text-cyan-400 text-xs cursor-pointer hover:underline" onClick={() => setTotalDataPoints(0)}>Reset Counter</span>
          </h3>
          <div className="space-y-4">
            <AlertItem
              type={connectionStatus === 'Online' ? "success" : "warning"}
              text={connectionStatus === 'Online' ? "WebSocket Pipeline Active" : "Searching for Server..."}
              time="System"
            />
            {liveNodeList.length > 0 && (
              <AlertItem type="info" text={`Receiving data from ${liveNodeList.length} device(s)`} time="Live" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Sub-Components ---
const DeviceRow = ({ name, deviceId, location, status }) => (
  <tr className="hover:bg-gray-800/20 transition-all group">
    <td className="px-6 py-4 font-bold text-white">{name}</td>
    <td className="px-6 py-4 font-mono text-xs text-gray-400">{deviceId}</td>
    <td className="px-6 py-4 text-gray-400">{location}</td>
    <td className="px-6 py-4">
      <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase ${status === 'Online' ? 'text-emerald-400' : 'text-red-500'}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${status === 'Online' ? 'bg-emerald-400' : 'bg-red-500'} ${status === 'Online' ? 'animate-pulse' : ''}`} />
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
