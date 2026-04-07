"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import API from '@/utils/api';
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function AddDevicePage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        deviceName: "",
        deviceId: "",
        deviceType: "Sensor",
        location: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {

            const res = await API.post("/devices", formData);

            if (res.data.success) {
                // Redirect to device list
                router.push("/devices");
                toast.success("Device registered successfully")
            }
        } catch (err) {
            // 🔹 Axios error handle karne ka sahi tarika
            setError(err.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-[#0b1120] px-4 py-8">
            <div className="w-full max-w-md p-8 bg-slate-900 rounded-xl shadow-2xl border border-slate-800">
                <h1 className="text-3xl font-bold mb-8 text-cyan-400 text-center">Add New Device</h1>

                {error && (
                    <p className="text-red-400 bg-red-900/20 p-2 rounded mb-4 text-sm border border-red-500">
                        {error}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="text-slate-300 mb-2">Device Name</label>
                        <div className=' bg-slate-800 border border-slate-700 rounded-lg mt-1 mb-2 px-2 focus-within:ring-2 focus-within:ring-cyan-500 transition duration-200 '>
                            <input
                                name='deviceName'
                                placeholder="e.g. Living Room Sensor"
                                value={formData.deviceName}
                                required
                                onChange={handleChange}
                                className="w-full px-4 py-2 text-white bg-transparent placeholder-slate-400 outline-none"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-slate-300 mb-2">Device ID</label>
                        <div className=' bg-slate-800 border border-slate-700 rounded-lg mt-1 mb-2 px-2 focus-within:ring-2 focus-within:ring-cyan-500 transition duration-200 '>
                            <input
                                name='deviceId'
                                placeholder="e.g. DHTT-001"
                                value={formData.deviceId}
                                required
                                onChange={handleChange}
                                className="w-full px-4 py-2 text-white bg-transparent placeholder-slate-400 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-gray-300 text-sm">Device Type</label>
                        <div className=' bg-slate-800 border border-slate-700 rounded-lg mt-1 mb-2 px-2 focus-within:ring-2 focus-within:ring-cyan-500 transition duration-200 '>
                            <select
                                name="deviceType"
                                value={formData.deviceType}
                                className="w-full px-4 py-2 bg-slate-800 text-white rounded outline-none"
                                onChange={handleChange}
                            >
                                <option className="text-white bg-slate-800" value="Sensor">Sensor</option>
                                <option className="text-white bg-slate-800" value="Actuator">Actuator</option>
                                <option className="text-white bg-slate-800" value="Gateway">Gateway</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-slate-300 mb-2">Location</label>
                        <div className=' bg-slate-800 border border-slate-700 rounded-lg mt-1 mb-2 px-2 focus-within:ring-2 focus-within:ring-cyan-500 transition duration-200 '>
                            <input
                                name='location'
                                placeholder="e.g. lucknow"
                                value={formData.location}
                                required
                                onChange={handleChange}
                                className="w-full px-4 py-2 text-white bg-transparent placeholder-slate-400 outline-none"
                            />
                        </div>
                    </div>

                    <button
                        className="w-full flex items-center justify-center px-4 py-2 bg-linear-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-lg hover:from-cyan-400 hover:to-blue-400 transition duration-300 shadow-2xl disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className='animate-spin mr-2' size={20} /> : "Add Device"}
                    </button>
                </form>
            </div>
        </div>
    );
}