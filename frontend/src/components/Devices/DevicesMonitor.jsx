"use client";
import React, { useEffect, useState } from 'react';
import API from '@/utils/api';
import DeviceChart from './DeviceChart'; // Jo upar banaya
import { Activity, Thermometer, Droplets, RefreshCw } from 'lucide-react'; // Icons ke liye

const DevicesMonitor = () => {
    const [devices, setDevices] = useState([]);
    const [history, setHistory] = useState({}); // Stores history for each device
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            // 1. Fetch current status
            const { data: statusData } = await API.get('/iot/monitor-all', config);
            setDevices(statusData);

            // 2. Fetch history for each device for the charts
            statusData.forEach(async (dev) => {
                const { data: histData } = await API.get(`/iot/history/${dev._id}`, config);
                setHistory(prev => ({ ...prev, [dev._id]: histData }));
            });

            setLoading(false);
        } catch (err) {
            console.error("Fetch error", err);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000); // Har 10 sec mein update
        return () => clearInterval(interval);
    }, []);

    const isOnline = (lastUsed) => {
        if (!lastUsed) return false;
        return (new Date() - new Date(lastUsed)) / 1000 < 60;
    };

    return (
        <div className="p-8 bg-[#0B1120] min-h-screen text-slate-300">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Live Data Monitoring</h1>

                </div>
                <button onClick={fetchData} className="p-2 hover:rotate-180 transition-all duration-500">
                    <RefreshCw size={20} className="text-cyan-500" />
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {devices.map((device) => (
                    <div key={device._id} className="bg-[#111827] border border-slate-800 rounded-3xl p-6 hover:border-cyan-500/50 transition-colors group">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-cyan-500/10 rounded-lg">
                                    <Activity size={20} className="text-cyan-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-100">{device.name}</h3>
                                    <span className="text-[10px] text-slate-500 uppercase tracking-widest">ID: {device._id.slice(-6)}</span>
                                </div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-2 ${isOnline(device.lastUsed) ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${isOnline(device.lastUsed) ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                                {isOnline(device.lastUsed) ? 'ONLINE' : 'OFFLINE'}
                            </div>
                        </div>

                        {device.data ? (
                            <>
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                                        <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                                            <Thermometer size={14} /> Temp
                                        </div>
                                        <div className="text-2xl font-bold text-white">{device.data.temperature}°C</div>
                                    </div>
                                    <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                                        <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                                            <Droplets size={14} /> Hum
                                        </div>
                                        <div className="text-2xl font-bold text-white">{device.data.humidity}%</div>
                                    </div>
                                </div>
                                <h4 className="text-[10px] font-bold text-slate-600 mb-2 uppercase tracking-widest">24h Activity</h4>
                                <DeviceChart data={history[device._id]} />
                            </>
                        ) : (
                            <div className="h-40 flex items-center justify-center text-slate-600 italic">No telemetry data received</div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DevicesMonitor;