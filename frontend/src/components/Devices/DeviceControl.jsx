"use client";
import React, { useState, useEffect } from 'react';
import API from '@/utils/api';
import { Loader2 } from 'lucide-react'; // Make sure lucide-react is installed

export default function DeviceControl() {
  const [devices, setDevices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Initial state fixed to match backend keys
  const initialFormState = { 
    deviceName: '', 
    deviceId: '', 
    deviceType: 'Sensor', 
    location: '' 
  };
  const [formData, setFormData] = useState(initialFormState);

  // 1. Devices Fetch logic
  const fetchDevices = async () => {
    try {
      const res = await API.get("/devices/my-devices");
      if (res.data.success) {
        setDevices(res.data.data);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  // 2. Handle Input Changes (Zaruri fix)
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Add Device Logic
  const handleAddDevice = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("/devices/register", formData);

      if (res.data.success) {
        await fetchDevices(); 
        setShowModal(false);
        setFormData(initialFormState); 
        alert("Device Registered Successfully!");
      }
    } catch (err) {
      console.log("Error Details:", err.response?.data);
      const errorMsg = err.response?.data?.message || "Registration Failed";
      alert(`Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  // Close modal and reset form
  const handleCancel = () => {
    setShowModal(false);
    setFormData(initialFormState);
  };

  return (
    <div className="min-h-screen bg-[#0b1120] p-6 text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold font-sans">My Devices ({devices.length})</h2>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 hover:scale-95 px-5 py-2 rounded-lg font-semibold transition-all"
        >
          + Add Device
        </button>
      </div>

      {/* Devices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {devices.length > 0 ? (
          devices.map((device) => (
            <div key={device._id} className="bg-[#1e293b] p-5 rounded-xl border border-slate-700 hover:border-blue-500 transition-colors shadow-lg">
              <h3 className="font-bold text-white text-lg">{device.deviceName}</h3>
              <p className="text-sm text-slate-400">{device.deviceType} • {device.location}</p>
              <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">{device.deviceId}</p>
              <div className="mt-4 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full animate-pulse ${device.status === 'Online' ? 'bg-green-400' : 'bg-red-400'}`}></span>
                <span className="text-xs text-green-400 font-medium">{device.status || 'Online'}</span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-slate-500 col-span-3 text-center py-10">No devices found. Add your first device!</p>
        )}
      </div>

      {/* Modal Form Overlay */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/60 backdrop-blur-sm px-4 py-8">
          <div className="w-full max-w-md p-8 bg-slate-900 rounded-xl shadow-2xl border border-slate-800">
            <h1 className="text-2xl font-bold mb-6 text-cyan-400 text-center">Register Device</h1>

            <form onSubmit={handleAddDevice} className="space-y-4">
              <div>
                <label className="text-slate-400 text-sm">Device Name</label>
                <div className='bg-slate-800 border border-slate-700 rounded-lg mt-1 px-2 focus-within:ring-2 focus-within:ring-cyan-500 transition duration-200'>
                  <input
                    name='deviceName'
                    placeholder="e.g. Hall Temperature"
                    value={formData.deviceName}
                    required
                    onChange={handleChange}
                    className="w-full px-4 py-2 text-white bg-transparent outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 text-sm">Device ID (Unique)</label>
                <div className='bg-slate-800 border border-slate-700 rounded-lg mt-1 px-2 focus-within:ring-2 focus-within:ring-cyan-500 transition duration-200'>
                  <input
                    name='deviceId'
                    placeholder="e.g. DHT-101"
                    value={formData.deviceId}
                    required
                    onChange={handleChange}
                    className="w-full px-4 py-2 text-white bg-transparent outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 text-sm">Device Type</label>
                <div className='bg-slate-800 border border-slate-700 rounded-lg mt-1 px-2 focus-within:ring-2 focus-within:ring-cyan-500 transition duration-200'>
                  <select
                    name="deviceType"
                    value={formData.deviceType}
                    className="w-full px-4 py-2 bg-slate-800 text-white rounded outline-none text-sm"
                    onChange={handleChange}
                  >
                    <option value="Sensor">Sensor</option>
                    <option value="Actuator">Actuator</option>
                    <option value="Gateway">Gateway</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 text-sm">Location</label>
                <div className='bg-slate-800 border border-slate-700 rounded-lg mt-1 px-2 focus-within:ring-2 focus-within:ring-cyan-500 transition duration-200'>
                  <input
                    name='location'
                    placeholder="e.g. Room 101"
                    value={formData.location}
                    required
                    onChange={handleChange}
                    className="w-full px-4 py-2 text-white bg-transparent outline-none text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 bg-slate-700 text-slate-200 font-bold rounded-lg hover:bg-slate-600 transition duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] flex items-center justify-center px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-lg hover:from-cyan-400 hover:to-blue-500 transition duration-300 shadow-lg disabled:opacity-50"
                >
                  {loading ? <Loader2 className='animate-spin' size={20} /> : "Register Device"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}