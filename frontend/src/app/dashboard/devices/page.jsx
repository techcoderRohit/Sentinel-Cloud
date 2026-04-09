"use client";
import React, { useEffect, useState } from 'react';
import API from '@/utils/api'; // Aapka axios instance

const DevicesMonitor = () => {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchStatus = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            const { data } = await API.get('/iot/monitor-all', config);
            setDevices(data);
            setLoading(false);
        } catch (err) {
            console.error("Monitoring error", err);
        }
    };

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 3000); // 3 sec auto-refresh
        return () => clearInterval(interval);
    }, []);

    const isOnline = (lastUsed) => {
        if (!lastUsed) return false;
        const diff = (new Date() - new Date(lastUsed)) / 1000;
        return diff < 60; // 60 seconds threshold
    };

    if (loading) return <div className="p-10 text-white">Loading Sentinel Nodes...</div>;

    return (
        <div className="p-6 bg-[#0B1120] min-h-screen">
            <h2 className="text-2xl font-bold text-white mb-6">Live Device Monitor</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {devices.map((device) => (
                    <div key={device._id} className="bg-[#151F32] border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
                        {/* Status Light */}
                        <div className={`absolute top-4 right-4 h-3 w-3 rounded-full ${isOnline(device.lastUsed) ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500'}`} />
                        
                        <h3 className="text-lg font-semibold text-slate-200 mb-1">{device.name}</h3>
                        <p className="text-xs text-slate-500 mb-4 font-mono">{device._id}</p>

                        {device.data ? (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-white/5">
                                    <span className="text-slate-400 text-sm">Temperature</span>
                                    <span className="text-cyan-400 text-xl font-bold">{device.data.temperature}°C</span>
                                </div>
                                <div className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-white/5">
                                    <span className="text-slate-400 text-sm">Humidity</span>
                                    <span className="text-blue-400 text-xl font-bold">{device.data.humidity}%</span>
                                </div>
                                <div className="text-[10px] text-slate-600 text-right">
                                    Last Sync: {new Date(device.lastUsed).toLocaleTimeString()}
                                </div>
                            </div>
                        ) : (
                            <div className="py-10 text-center text-slate-600 italic text-sm">
                                No data received yet
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DevicesMonitor;