"use client"
import { useEffect, useState } from "react";
import API from '@/utils/api';

export default function DeviceListPage() {
    //state to store devices
    const [devices, setDevices] = useState([]);
    //loading state
    const [loading, setloading] = useState(true);
    //error state
    const [error, setError] = useState('');


    //fetch devices from backend
    useEffect(() => {
        const fetchDevices = async () => {
            try {
                //get token from local storage
                const token = localStorage.getItem('token');
                const res = await API.get('/devices');
                setDevices(res.data.data);
            }
            catch (error) {
                setError(error.response?.data?.message || "Error fetching Devices");
            }
            finally {
                setloading(false);
            }
        };
        fetchDevices();
    }, []);

    return (
        <div className="p-10 min-h-screen bg-[#0b1120]">
            <h1 className="text-3xl font-bold mb-4 text-center text-white ">My Devices</h1>
            {loading && <p className="text-cyan-400">Loading devices...</p>}
            {error && <p className="text-red-500 font-semibold bg-red-100 p-2 rounded">{error}</p>}
            {!loading && !error && devices.length === 0 && <p>No devices found.</p>}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {devices.map((device) => (
                    <div key={device._id} className="border border-slate-800 bg-slate-900 p-4 rounded-xl shadow-lg text-white">
                        <h2 className="font-semibold text-lg text-cyan-400">{device.deviceName}</h2>
                        <p className="text-sm text-slate-400">ID: {device.deviceId}</p>

                        <p className="mt-2">
                            Status:
                            <span className={device.status === "online" ? "text-green-400" : "text-red-400"}>
                                {" "}{device.status}
                            </span>
                        </p>

                        <div className="flex justify-between mt-3 text-sm border-t border-gray-700 pt-2">
                            <span>Type: {device.deviceType}</span>
                            <span className={device.anomalyDetected ? "text-yellow-400" : "text-green-400"}>
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
