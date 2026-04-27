"use client";
import API from '@/utils/api';
import React, { useState, useEffect } from 'react';

export default function AlertSimulatorPage() {
    const [devices, setDevices] = useState([]);
    const [selectedDevice, setSelectedDevice] = useState('');
    const [temp, setTemp] = useState(25);
    const [humidity, setHumidity] = useState(50);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    useEffect(() => {
        const fetchDevices = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await API.get('/iot/monitor-all', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (Array.isArray(res.data)) setDevices(res.data);
            } catch (e) {
                console.error("Fetch devices failed", e);
            }
        };
        fetchDevices();
    }, []);

    const handleSimulate = async () => {
        if (!selectedDevice) return alert("Select a device");
        setLoading(true);
        setResult(null);
        try {
            const token = localStorage.getItem('token');
            const res = await API.post('/iot/simulate', {
                deviceId: selectedDevice,
                payload: { temperature: parseFloat(temp), humidity: parseFloat(humidity) }
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setResult(res.data);
        } catch (e) {
            setResult({ success: false, message: e.response?.data?.message || "Simulation failed" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto space-y-8">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
                <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Alert Simulator</h1>
                <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-8">Test your Telegram notifications without hardware</p>

                <div className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Target Device</label>
                        <select 
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500"
                            value={selectedDevice}
                            onChange={(e) => setSelectedDevice(e.target.value)}
                        >
                            <option value="">Select a device to simulate</option>
                            {devices.map(d => (
                                <option key={d._id} value={d.deviceId}>{d.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Simulated Temperature (°C)</label>
                            <input 
                                type="number"
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500"
                                value={temp}
                                onChange={(e) => setTemp(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Simulated Humidity (%)</label>
                            <input 
                                type="number"
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500"
                                value={humidity}
                                onChange={(e) => setHumidity(e.target.value)}
                            />
                        </div>
                    </div>

                    <button 
                        onClick={handleSimulate}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black py-4 rounded-xl hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-sm shadow-xl shadow-cyan-500/20 disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : 'Inject Test Data'}
                    </button>
                </div>

                {result && (
                    <div className={`mt-8 p-4 rounded-xl border ${result.success ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'}`}>
                        <p className={`text-xs font-bold uppercase tracking-widest ${result.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {result.success ? `Success: ${result.anomaliesTriggered} triggers met` : `Error: ${result.message}`}
                        </p>
                        {result.success && result.anomaliesTriggered > 0 && (
                            <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold">Check your Telegram for notifications!</p>
                        )}
                    </div>
                )}
            </div>

            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6">
                <h3 className="text-amber-500 font-bold text-xs uppercase tracking-widest mb-2">Testing Instructions</h3>
                <ol className="text-slate-400 text-[11px] space-y-2 list-decimal list-inside font-medium uppercase tracking-tight">
                    <li>Create a trigger in the <span className="text-white">Control Board</span> (e.g., Temp &gt; 40).</li>
                    <li>Open this simulator and select that device.</li>
                    <li>Enter a value that meets the trigger (e.g., 45).</li>
                    <li>Click "Inject" and verify your Telegram alert arrives.</li>
                </ol>
            </div>
        </div>
    );
}
