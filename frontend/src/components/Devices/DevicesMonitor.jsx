// "use client";
// import React, { useEffect, useState } from 'react';
// import API from '@/utils/api';
// import DeviceChart from './DeviceChart'; // Jo upar banaya
// import { Activity, Thermometer, Droplets, RefreshCw } from 'lucide-react'; // Icons ke liye

// const DevicesMonitor = () => {
//     const [devices, setDevices] = useState([]);
//     const [history, setHistory] = useState({}); // Stores history for each device
//     const [loading, setLoading] = useState(true);

//     const fetchData = async () => {
//         try {
//             const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
//             // 1. Fetch current status
//             const { data: statusData } = await API.get('/iot/monitor-all', config);
//             setDevices(statusData);

//             // 2. Fetch history for each device for the charts
//             statusData.forEach(async (dev) => {
//                 const { data: histData } = await API.get(`/iot/history/${dev._id}`, config);
//                 setHistory(prev => ({ ...prev, [dev._id]: histData }));
//             });

//             setLoading(false);
//         } catch (err) {
//             console.error("Fetch error", err);
//         }
//     };

//     useEffect(() => {
//         fetchData();
//         const interval = setInterval(fetchData, 10000); // Har 10 sec mein update
//         return () => clearInterval(interval);
//     }, []);

//     const isOnline = (lastUsed) => {
//         if (!lastUsed) return false;
//         return (new Date() - new Date(lastUsed)) / 1000 < 60;
//     };

//     return (
//         <div className="p-8 bg-[#0B1120] min-h-screen text-slate-300">
//             <div className="flex justify-between items-center mb-8">
//                 <div>
//                     <h1 className="text-3xl font-bold text-white tracking-tight">Live Data Monitoring</h1>

//                 </div>
//                 <button onClick={fetchData} className="p-2 hover:rotate-180 transition-all duration-500">
//                     <RefreshCw size={20} className="text-cyan-500" />
//                 </button>
//             </div>

//             <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
//                 {devices.map((device) => (
//                     <div key={device._id} className="bg-[#111827] border border-slate-800 rounded-3xl p-6 hover:border-cyan-500/50 transition-colors group">
//                         <div className="flex justify-between items-start mb-6">
//                             <div className="flex items-center gap-3">
//                                 <div className="p-2 bg-cyan-500/10 rounded-lg">
//                                     <Activity size={20} className="text-cyan-400" />
//                                 </div>
//                                 <div>
//                                     <h3 className="font-bold text-slate-100">{device.name}</h3>
//                                     <span className="text-[10px] text-slate-500 uppercase tracking-widest">ID: {device._id.slice(-6)}</span>
//                                 </div>
//                             </div>
//                             <div className={`px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-2 ${isOnline(device.lastUsed) ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
//                                 <span className={`h-1.5 w-1.5 rounded-full ${isOnline(device.lastUsed) ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
//                                 {isOnline(device.lastUsed) ? 'ONLINE' : 'OFFLINE'}
//                             </div>
//                         </div>

//                         {device.data ? (
//                             <>
//                                 <div className="grid grid-cols-2 gap-4 mb-6">
//                                     <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
//                                         <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
//                                             <Thermometer size={14} /> Temp
//                                         </div>
//                                         <div className="text-2xl font-bold text-white">{device.data.temperature}°C</div>
//                                     </div>
//                                     <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
//                                         <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
//                                             <Droplets size={14} /> Hum
//                                         </div>
//                                         <div className="text-2xl font-bold text-white">{device.data.humidity}%</div>
//                                     </div>
//                                 </div>
//                                 <h4 className="text-[10px] font-bold text-slate-600 mb-2 uppercase tracking-widest">24h Activity</h4>
//                                 <DeviceChart data={history[device._id]} />
//                             </>
//                         ) : (
//                             <div className="h-40 flex items-center justify-center text-slate-600 italic">No telemetry data received</div>
//                         )}
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// };

// export default DevicesMonitor;



"use client";
import React, { useEffect, useState } from 'react';
import API from '@/utils/api';
import { io } from 'socket.io-client';
import DeviceChart from './DeviceChart';
import { Activity, Thermometer, Droplets, RefreshCw, Loader2, Trash2 } from 'lucide-react';

const DevicesMonitor = () => {
    const [devices, setDevices] = useState([]);
    const [history, setHistory] = useState({});
    const [loading, setLoading] = useState(true);

    // --- DELETE DEVICE STATES ---
    const [deleteTarget, setDeleteTarget] = useState(null); // device to delete
    const [deleteLoading, setDeleteLoading] = useState(false);

    // --- ADD DEVICE MODAL STATES ---
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const initialFormState = { 
        deviceName: '', 
        deviceId: '', 
        deviceType: 'Sensor', 
        location: '' 
    };
    const [formData, setFormData] = useState(initialFormState);

    const fetchData = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            const { data: statusData } = await API.get('/iot/monitor-all', config);
            setDevices(statusData);

            statusData.forEach(async (dev) => {
                const { data: histData } = await API.get(`/iot/history/${dev._id}`, config);
                setHistory(prev => ({ ...prev, [dev._id]: histData }));
            });
            setLoading(false);
        } catch (err) { console.error("Fetch error", err); }
    };

    useEffect(() => {
        fetchData();
        const socket = io('http://localhost:5000');
        
        socket.on('telemetry_update', (newData) => {
            setDevices(prev => prev.map(dev => 
                dev._id === newData.apiKey 
                ? { ...dev, data: newData.payload, lastUsed: new Date() } 
                : dev
            ));
        });

        const interval = setInterval(fetchData, 30000);
        return () => {
            clearInterval(interval);
            socket.disconnect();
        };
    }, []);

    // --- FORM HANDLERS ---
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddDevice = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await API.post("/devices/register", {
                deviceName: formData.deviceName,
                deviceId: formData.deviceId ,
                type: formData.deviceType,
                location : formData.location
            });
            if (res.data.success) {
                await fetchData(); // List refresh karein
                setShowModal(false);
                setFormData(initialFormState);
                alert("Device Registered Successfully!");
            }
        } catch (err) {
            alert(`Error: ${err.response?.data?.message || "Registration Failed"}`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteDevice = async () => {
        if (!deleteTarget) return;
        setDeleteLoading(true);
        try {
            await API.delete(`/devices/${deleteTarget._id}`);
            setDevices(prev => prev.filter(d => d._id !== deleteTarget._id));
            setDeleteTarget(null);
        } catch (err) {
            alert(`Error: ${err.response?.data?.message || 'Delete failed'}`);
        } finally {
            setDeleteLoading(false);
        }
    };

    const isOnline = (lastUsed) => {
        if (!lastUsed) return false;
        return (new Date() - new Date(lastUsed)) / 1000 < 60;
    };

    if (loading) return <div className="p-6 text-white">Loading Sentinel Cloud...</div>;

    return (
        <div className="p-8 bg-[#0B1120] min-h-screen text-slate-300">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Sentinel Live Monitor</h1>
                    <p className="text-sm text-slate-400">Manage and observe your IoT nodes in real-time</p>
                </div>

                <div className="flex gap-4">
                    <button 
                        onClick={() => setShowModal(true)}
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-600 hover:to-blue-600 px-6 py-2.5 font-bold transition-all shadow-lg shadow-blue-900/20 active:scale-95"
                    >
                        + Add Device
                    </button>
                    <button onClick={fetchData} className="p-2 hover:bg-slate-800 rounded-full transition-all border border-slate-700">
                        <RefreshCw size={20} className="text-cyan-500" />
                    </button>
                </div>
            </div>

            {/* Devices Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {devices.map((device) => (
                    <div key={device._id} className="bg-[#111827] border border-slate-800 rounded-3xl p-6 hover:border-cyan-500/50 transition-all group">
                        {/* Card Header */}
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <Activity size={20} className="text-cyan-400" />
                                <div>
                                    <h3 className="font-bold text-slate-100">{device.name || device.deviceName}</h3>
                                    <span className="text-[10px] text-slate-500 font-mono">ID: {device.deviceId || device._id.slice(-6)}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`px-3 py-1 rounded-full text-[6px] font-bold ${isOnline(device.lastUsed) ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                    {isOnline(device.lastUsed) ? '● ONLINE' : '○ OFFLINE'}
                                </div>
                                {/* Delete Button */}
                                <button
                                    onClick={() => setDeleteTarget(device)}
                                    className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                                    title="Delete device"
                                >
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        </div>

                        {device.data ? (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                                        <p className="text-slate-500 text-xs flex items-center gap-1"><Thermometer size={12}/> Temp</p>
                                        <p className="text-2xl font-bold text-white">{device.data.temperature}°C</p>
                                    </div>
                                    <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                                        <p className="text-slate-500 text-xs flex items-center gap-1"><Droplets size={12}/> Hum</p>
                                        <p className="text-2xl font-bold text-white">{device.data.humidity}%</p>
                                    </div>
                                </div>
                                <DeviceChart data={history[device._id] || []} />
                            </div>
                        ) : (
                            <div className="h-40 flex flex-col items-center justify-center text-slate-600 border border-dashed border-slate-800 rounded-2xl">
                                <p className="text-xs">Waiting for telemetry...</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* --- ADD DEVICE MODAL --- */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/70 backdrop-blur-md p-4">
                    <div className="w-full max-w-md p-8 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl">
                        <h2 className="text-2xl font-bold mb-6 text-cyan-500 text-center">Register New Device</h2>
                        <form onSubmit={handleAddDevice} className="space-y-4">
                            <div>
                                <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Device Name</label>
                                <input
                                    name='deviceName'
                                    value={formData.deviceName}
                                    onChange={handleChange}
                                    className="w-full mt-1.5 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white outline-none focus:border-cyan-500 transition-colors"
                                    placeholder="e.g. Living Room ESP32"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Device ID / API Key</label>
                                <input
                                    name='deviceId'
                                    value={formData.deviceId}
                                    onChange={handleChange}
                                    className="w-full mt-1.5 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white outline-none focus:border-cyan-500 transition-colors"
                                    placeholder="Unique hardware ID"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Type</label>
                                    <select
                                        name="deviceType"
                                        value={formData.deviceType}
                                        onChange={handleChange}
                                        className="w-full mt-1.5 px-4 py-3 bg-slate-800/50 border border-slate-700 focus:border-cyan-500 rounded-xl text-white outline-none"
                                    >
                                        <option value="Sensor">Sensor</option>
                                        <option value="Actuator">Actuator</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Location</label>
                                    <input
                                        name='location'
                                        value={formData.location}
                                        onChange={handleChange}
                                        className="w-full mt-1.5 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white outline-none focus:border-cyan-500 transition-colors"
                                        placeholder="e.g. Kitchen"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button 
                                    type="button" 
                                    onClick={() => setShowModal(false)} 
                                    className="flex-1 py-3 text-slate-400 font-bold hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={submitting} 
                                    className="flex-[2] bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 py-3 rounded-xl font-bold text-white transition-all flex justify-center items-center"
                                >
                                    {submitting ? <Loader2 className="animate-spin" /> : "Register Device"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- DELETE CONFIRM MODAL --- */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/70 backdrop-blur-md p-4">
                    <div className="w-full max-w-sm p-8 bg-slate-900 rounded-2xl border border-red-500/20 shadow-2xl text-center">
                        <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                            <Trash2 size={26} className="text-red-500" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Delete Device?</h2>
                        <p className="text-slate-400 text-sm mb-1">
                            Are you sure you want to delete <span className="text-white font-semibold">{deleteTarget.name || deleteTarget.deviceName}</span>?
                        </p>
                        <p className="text-xs text-red-500 bg-red-500/5 border border-red-500/10 rounded-lg px-4 py-2 mb-6">
                            This will permanently delete the device and all its sensor data.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-medium hover:bg-slate-700 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteDevice}
                                disabled={deleteLoading}
                                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {deleteLoading ? <Loader2 size={16} className="animate-spin" /> : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DevicesMonitor;