"use client"
import React, { useState, useEffect } from 'react';
import API from '@/utils/api';
import { Loader2, Power, Thermometer, Droplets, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

export default function GuestView() {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        fetchProfileAndDevices();
        const interval = setInterval(fetchProfileAndDevices, 20000);
        return () => clearInterval(interval);
    }, []);

    const fetchProfileAndDevices = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const opts = { headers: { Authorization: `Bearer ${token}` } };
            
            // If profile isn't loaded yet, fetch it
            if (!profile) {
                const profRes = await API.get('/user/profile', opts);
                setProfile(profRes.data);
            }

            const res = await API.get('/iot/monitor-all', opts);
            setDevices(res.data);
        } catch (err) {
            console.error("Failed to load guest data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (deviceId, currentStatus) => {
        if (profile?.role === 'guest' && !profile?.permissions?.includes('control_devices')) {
            return toast.error("You don't have permission to control devices.");
        }

        const newStatus = !currentStatus;

        // Optimistic UI update
        setDevices(prev => prev.map(d => d._id === deviceId ? { ...d, data: { ...d.data, status: newStatus } } : d));

        try {
            const token = localStorage.getItem('token');
            await API.post(`/iot/control/${deviceId}`, { status: newStatus }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Command sent successfully");
        } catch (err) {
            console.error("Control failed:", err);
            toast.error(err.response?.data?.message || "Failed to control device");
            // Revert on failure
            setDevices(prev => prev.map(d => d._id === deviceId ? { ...d, data: { ...d.data, status: currentStatus } } : d));
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-[#0F172A] border border-slate-700/60 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[100px] pointer-events-none rounded-full"></div>
                
                <div className="mb-8">
                    <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight">
                        Systems Overview
                    </h2>
                    <p className="text-slate-400 text-sm mt-2 max-w-2xl">
                        Monitor live telemetry and control permitted devices assigned to your workspace.
                    </p>
                </div>

                {devices.length === 0 ? (
                    <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-dashed border-slate-700/80">
                        <Activity className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-300">No Devices Access</h3>
                        <p className="text-sm text-slate-500 mt-2">You currently don't have access to monitor any systems.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {devices.map((device) => {
                            const isOnline = device.lastUsed ? ((new Date() - new Date(device.lastUsed)) / 1000 < 60) : false;
                            const status = device.data?.status || false;
                            const hasControlPerms = profile?.role !== 'guest' || profile?.permissions?.includes('control_devices');

                            return (
                                <div key={device._id} className="bg-[#111827] border border-slate-800 rounded-2xl p-5 hover:border-slate-600 transition-colors shadow-lg relative group">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="text-lg font-bold text-white tracking-tight">{device.name}</h3>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                                    {isOnline ? 'Online' : 'Offline'}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <button 
                                            onClick={() => handleToggle(device._id, status)}
                                            disabled={!hasControlPerms}
                                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${!hasControlPerms ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105 active:scale-95'} ${status ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]' : 'bg-slate-800 text-slate-500 border border-slate-700 hover:border-slate-500'}`}
                                            title={hasControlPerms ? "Toggle Power" : "Control Permission Required"}
                                        >
                                            <Power className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3 flex items-center gap-3">
                                            <div className="bg-rose-500/10 p-2 rounded-lg text-rose-400">
                                                <Thermometer className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Temp</div>
                                                <div className="text-lg font-black text-rose-100">{device.data?.temperature || '--'}°</div>
                                            </div>
                                        </div>

                                        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3 flex items-center gap-3">
                                            <div className="bg-blue-500/10 p-2 rounded-lg text-blue-400">
                                                <Droplets className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Humidity</div>
                                                <div className="text-lg font-black text-blue-100">{device.data?.humidity || '--'}%</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
