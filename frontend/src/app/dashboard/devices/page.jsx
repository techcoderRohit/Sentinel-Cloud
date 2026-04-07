"use client"
import { useEffect, useState } from "react";
import API from '@/utils/api';

export default function DeviceListPage() {
    const [devices, setDevices] = useState([]);
    const [loading, setloading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDevices = async () => {
            try {
                // 1. Get token from local storage
                const token = localStorage.getItem('token');

                if (!token) {
                    setError("Please login to see your devices.");
                    setloading(false);
                    return;
                }

                // 2. Pass token in Headers (Sabse important step)
                const res = await API.get('/devices', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                // Check karein ki data res.data.data mein hai ya sirf res.data mein
                // Backend ke response structure ke hisab se set karein
                const deviceData = res.data.data || res.data;
                setDevices(Array.isArray(deviceData) ? deviceData : []);

            }
            catch (error) {
                console.error("Fetch Error:", error);
                setError(error.response?.data?.message || "Error fetching Devices");
            }
            finally {
                setloading(false);
            }
        };
        fetchDevices();
    }, []);

    return (
        <div className="min-h-screen bg-[#0b1120]">
            <h1 className="text-3xl font-bold mb-4 text-center text-white ">My Devices</h1>

            {loading && <p className="text-cyan-400 text-center">Loading devices...</p>}

            {error && (
                <div className="max-w-md mx-auto mb-4">
                    <p className="text-red-500 font-semibold bg-red-100/10 p-3 border border-red-500 rounded-xl text-center">
                        {error}
                    </p>
                </div>
            )}

            {!loading && !error && devices.length === 0 && (
                <p className="text-white text-center">No devices found.</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {devices.map((device) => (
                    <div key={device._id} className="border border-slate-800 bg-slate-900 p-4 rounded-xl shadow-lg text-white">
                        <h2 className="font-semibold text-lg text-cyan-400">{device.deviceName}</h2>
                        <p className="text-sm text-slate-400">ID: {device.deviceId}</p>

                        <p className="mt-2">
                            Status:
                            <span className={device.status === "Online" ? "text-emerald-400" : "text-rose-400"}>
                                {" "}{device.status}
                            </span>
                        </p>

                        <div className="flex justify-between mt-3 text-sm border-t border-gray-700 pt-2">
                            <span>Type: {device.deviceType}</span>
                            <span className={device.anomalyDetected ? "text-yellow-400" : "text-emerald-400"}>
                                {device.anomalyDetected ? "⚠️ Anomaly" : "✅ Normal"}
                            </span>
                        </div>

                        <p className="text-xs text-gray-500 mt-2">
                            Last Active: {new Date(device.updatedAt || device.lastActive).toLocaleString()}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}