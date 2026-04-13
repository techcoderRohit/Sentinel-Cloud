"use client";
import React, { useState, useEffect } from 'react';
import API from '@/utils/api';
import { Loader2 } from 'lucide-react';

// Helper component for Status Badge
const StatusBadge = ({ status }) => {
  const isOnline = status === 'Online';
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
      isOnline ? 'bg-green-500/10 text-green-400' : 'bg-slate-700 text-slate-400'
    }`}>
      {status || 'Offline'}
    </span>
  );
};

// Main Device Card Component
const DeviceCard = ({ device }) => {
  // Toggle state handle karne ke liye local state
  const [isOn, setIsOn] = useState(false);
  const isOnline = device.status === 'Online';

  // Toggle function
  const handleToggle = async () => {
    if (!isOnline) return; // Agar offline hai toh toggle nahi hoga
    
    const newState = !isOn;
    setIsOn(newState);

    // Future implementation: Backend API call to control hardware
    /*
    try {
      await API.post(`/devices/control/${device.deviceId}`, { state: newState });
    } catch (err) {
      setIsOn(!newState); // Revert if API fails
      console.error("Toggle failed", err);
    }
    */
  };

  const getBatteryColor = (level) => {
    if (level > 60) return 'bg-green-500';
    if (level > 20) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className={`bg-[#1e293b] rounded-xl p-5 border flex flex-col relative overflow-hidden transition-all duration-300 shadow-lg ${
      isOn && isOnline ? 'border-blue-500/50 ring-1 ring-blue-500/20' : 'border-slate-700/50'
    }`}>
      
      {/* Header: Type & Toggle */}
      <div className="flex justify-between items-start mb-3">
        <span className="text-[10px] font-bold tracking-wider text-indigo-400 uppercase">
          {device.deviceType}
        </span>
        
        {/* Toggle Switch */}
        <button 
          onClick={handleToggle}
          disabled={!isOnline}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-all focus:outline-none ${
            isOn && isOnline ? 'bg-blue-500' : 'bg-slate-600'
          } ${!isOnline ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:scale-110 active:scale-95'}`}
        >
          <span 
            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
              isOn && isOnline ? 'translate-x-4.5' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Title & Node ID */}
      <div className="mb-5">
        <h3 className="text-base font-bold text-slate-100 leading-tight">{device.deviceName}</h3>
        <p className="text-xs text-slate-400 mt-1 font-mono uppercase tracking-tight">{device.deviceId}</p>
      </div>

      {/* Details List */}
      <div className="space-y-3 mb-5 flex-1">
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-400">Status</span>
          <StatusBadge status={device.status} />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-400">Location</span>
          <span className="text-xs font-semibold text-slate-200">{device.location}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-400">Live Reading</span>
          <span className={`text-xs font-bold ${isOn && isOnline ? 'text-blue-400' : 'text-slate-500'}`}>
            {isOn && isOnline ? (device.lastReading || '24°C') : '--'}
          </span>
        </div>
        
        <div className="pt-1">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs text-slate-400">Battery</span>
            <span className="text-xs font-semibold text-slate-300">{device.battery || 85}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-700/50 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${getBatteryColor(device.battery || 85)}`} 
              style={{ width: `${device.battery || 85}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Bottom Online/Offline Banner */}
      <div className={`-mx-5 -mb-5 px-5 py-3 border-t transition-colors ${
        isOn && isOnline ? 'bg-blue-500/5 border-blue-500/20' : 'bg-[#151f32] border-slate-700/50'
      } flex items-center`}>
        <span className={`w-2 h-2 rounded-full mr-2.5 ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`}></span>
        <span className="text-xs font-medium text-slate-400">
          {isOnline ? (isOn ? 'Active — Receiving data' : 'Online — Standby') : 'Offline'}
        </span>
      </div>
    </div>
  );
};

export default function DeviceControl() {
  const [devices, setDevices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const initialFormState = { 
    deviceName: '', 
    deviceId: '', 
    deviceType: 'Sensor', 
    location: '' 
  };
  const [formData, setFormData] = useState(initialFormState);

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
      const errorMsg = err.response?.data?.message || "Registration Failed";
      alert(`Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1120] p-6 text-slate-200">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Devices</h2>
          <p className="text-sm text-slate-400">Manage your connected IoT nodes</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20 active:scale-95"
        >
          + Add Device
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {devices.length > 0 ? (
          devices.map((device) => (
            <DeviceCard key={device._id} device={device} />
          ))
        ) : (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-800 rounded-3xl">
            <p className="text-slate-500">No active devices found.</p>
          </div>
        )}
      </div>

      {/* Modal logic is preserved from your previous code */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/70 backdrop-blur-md p-4">
          <div className="w-full max-w-md p-8 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl">
            <h1 className="text-2xl font-bold mb-6 text-cyan-500 text-center">Add IoT Device</h1>
            <form onSubmit={handleAddDevice} className="space-y-4">
               {/* Form fields remain same as your original snippet */}
               <div>
                <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Device Name</label>
                <input
                  name='deviceName'
                  value={formData.deviceName}
                  onChange={handleChange}
                  className="w-full mt-1.5 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white outline-none focus:border-cyan-500 transition-colors"
                  placeholder="e.g. Smart Light"
                  required
                />
              </div>
              <div>
                <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Device ID</label>
                <input
                  name='deviceId'
                  value={formData.deviceId}
                  onChange={handleChange}
                  className="w-full mt-1.5 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white outline-none focus:border-cyan-500 transition-colors"
                  placeholder="e.g. ESP32_01"
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
                    placeholder="Bedroom"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 text-slate-400 font-bold hover:text-white transition-colors">Cancel</button>
                <button type="submit" disabled={loading} className="flex-[2] bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 py-3 rounded-xl font-bold text-white transition-all flex justify-center items-center">
                  {loading ? <Loader2 className="animate-spin" /> : "Register"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}