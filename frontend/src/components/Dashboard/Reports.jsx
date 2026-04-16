"use client";
import React, { useState, useEffect } from 'react';
import API from '@/utils/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, Filter, Activity, Droplets } from 'lucide-react';

const Reports = () => {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [range, setRange] = useState('24H');
  const [analyticsData, setAnalyticsData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ranges = ['1H', '24H', '7D', '1M', '1Y'];

  // Fetch registered devices on mount
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await API.get('/devices');
        setDevices(response.data);
        if (response.data.length > 0) {
          setSelectedDevice(response.data[0].apiKey); // Default to first device
        }
      } catch (err) {
        console.error("Failed to fetch devices for analytics", err);
      }
    };
    fetchDevices();
  }, []);

  // Fetch Aggregated data whenever device or range changes
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!selectedDevice) return;
      setLoading(true);
      try {
        const response = await API.get(`/iot/analytics/${selectedDevice}?range=${range}`);
        
        // Format data for Recharts (handling potential nulls)
        const formattedData = response.data.map(item => ({
          time: item._id, // This is the formatted date string from MongoDB
          Temperature: item.avgTemp ? Number(item.avgTemp.toFixed(1)) : 0,
          Humidity: item.avgHum ? Number(item.avgHum.toFixed(1)) : 0,
        }));
        
        setAnalyticsData(formattedData);
      } catch (err) {
        console.error("Failed to fetch analytics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [selectedDevice, range]);

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0d1421] border border-gray-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="text-cyan-400" /> Advanced Analytics
          </h2>
          <p className="text-xs text-gray-400 mt-1">Generate visualizations from historical device data.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 bg-[#141c2d] px-3 py-2 rounded-lg border border-gray-800">
            <Filter size={14} className="text-gray-500" />
            <select 
              value={selectedDevice} 
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="bg-transparent border-none outline-none text-sm text-gray-300 min-w-[120px]"
            >
              <option value="" disabled>Select Device</option>
              {devices.map(dev => (
                <option key={dev._id || dev.apiKey} value={dev.apiKey}>{dev.deviceName || dev.name || dev.apiKey}</option>
              ))}
            </select>
          </div>

          <div className="flex bg-[#141c2d] p-1 rounded-lg border border-gray-800">
            {ranges.map(r => (
              <button 
                key={r}
                onClick={() => setRange(r)}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                  range === r 
                  ? 'bg-cyan-500 text-white shadow-lg' 
                  : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="h-[400px] flex items-center justify-center bg-[#0d1421] border border-gray-800 rounded-2xl w-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
        </div>
      ) : analyticsData.length === 0 ? (
        <div className="h-[400px] flex flex-col items-center justify-center bg-[#0d1421] border border-gray-800 rounded-2xl w-full text-gray-500">
          <Calendar size={48} className="mb-4 opacity-50" />
          <p>No historical data found for this period.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          
          {/* Line Chart - Temperature Trends */}
          <div className="bg-[#0d1421] border border-gray-800 rounded-2xl p-5 shadow-lg">
            <h3 className="text-sm font-bold text-gray-400 tracking-wider mb-6 flex items-center gap-2">
              <Activity className="text-emerald-400" size={16} /> TEMPERATURE TRENDS
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                  <XAxis dataKey="time" stroke="#4b5563" fontSize={10} tickMargin={10} />
                  <YAxis stroke="#4b5563" fontSize={10} tickFormatter={(val) => `${val}°C`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                    itemStyle={{ color: '#34d399' }}
                  />
                  <Legend iconType="circle" cursor="pointer" />
                  <Line 
                    type="monotone" 
                    name="Temperature (°C)"
                    dataKey="Temperature" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ r: 2, fill: '#10b981', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: '#fff', stroke: '#10b981' }}
                    animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart - Humidity Analysis */}
          <div className="bg-[#0d1421] border border-gray-800 rounded-2xl p-5 shadow-lg">
            <h3 className="text-sm font-bold text-gray-400 tracking-wider mb-6 flex items-center gap-2">
              <Droplets className="text-blue-400" size={16} /> HUMIDITY DISTRIBUTION
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }} barSize={16}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                  <XAxis dataKey="time" stroke="#4b5563" fontSize={10} tickMargin={10} />
                  <YAxis stroke="#4b5563" fontSize={10} tickFormatter={(val) => `${val}%`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                    itemStyle={{ color: '#60a5fa' }}
                    cursor={{ fill: '#1f2937', opacity: 0.4 }}
                  />
                  <Legend iconType="circle" />
                  <Bar 
                    name="Humidity (%)"
                    dataKey="Humidity" 
                    fill="#3b82f6" 
                    radius={[4, 4, 0, 0]}
                    animationDuration={1500}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default Reports;
