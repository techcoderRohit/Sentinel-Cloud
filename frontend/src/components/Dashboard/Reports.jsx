"use client";
import React, { useState, useEffect } from 'react';
import API from '@/utils/api';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Calendar, Filter, Activity, Droplets, Table as TableIcon, PieChart as PieIcon } from 'lucide-react';

const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

const Reports = () => {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [range, setRange] = useState('24H');
  const [analyticsData, setAnalyticsData] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ranges = ['1H', '24H', '7D', '1M', '1Y'];

  // Fetch registered devices on mount
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await API.get('/devices');
        if (response.data.success && Array.isArray(response.data.data)) {
          const deviceList = response.data.data;
          setDevices(deviceList);
          if (deviceList.length > 0) {
            setSelectedDevice(deviceList[0].apiKey);
          }
        }
      } catch (err) {
        console.error("Failed to fetch devices", err);
      }
    };
    fetchDevices();
  }, []);

  // Fetch Aggregated + History data whenever device or range changes
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedDevice) return;
      setLoading(true);
      try {
        const dev = devices.find(d => d.apiKey === selectedDevice);
        
        // 1. Analytics for Charts
        const analyticsRes = await API.get(`/iot/analytics/${selectedDevice}?range=${range}`);
        const formattedData = analyticsRes.data.map(item => ({
          time: item._id,
          Temperature: item.avgTemp ? Number(item.avgTemp.toFixed(1)) : 0,
          Humidity: item.avgHum ? Number(item.avgHum.toFixed(1)) : 0,
        }));
        setAnalyticsData(formattedData);

        // 2. Raw History for Table
        if (dev) {
          const historyRes = await API.get(`/iot/history/${dev._id}`);
          setHistoryData(historyRes.data);
        }

      } catch (err) {
        console.error("Failed to fetch report data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedDevice, range, devices]);

  const getPieData = () => {
    if (analyticsData.length === 0) return [];
    let ranges = { 'Normal': 0, 'Hot': 0, 'Cold': 0 };
    analyticsData.forEach(d => {
      if (d.Temperature > 30) ranges['Hot']++;
      else if (d.Temperature < 15) ranges['Cold']++;
      else ranges['Normal']++;
    });
    return Object.keys(ranges).map(key => ({ name: key, value: ranges[key] })).filter(v => v.value > 0);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      
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
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${range === r
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
        <div className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Line Chart - Temperature Trends */}
            <div className="bg-[#0d1421] border border-gray-800 rounded-2xl p-5 shadow-lg">
              <h3 className="text-sm font-bold text-gray-400 tracking-wider mb-6 flex items-center gap-2">
                <Activity className="text-emerald-400" size={16} /> TEMPERATURE TRENDS
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                    <XAxis dataKey="time" stroke="#4b5563" fontSize={10} tickMargin={10} />
                    <YAxis stroke="#4b5563" fontSize={10} tickFormatter={(val) => `${val}°C`} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }} />
                    <Legend />
                    <Line type="monotone" name="Temp (°C)" dataKey="Temperature" stroke="#10b981" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart - Distribution */}
            <div className="bg-[#0d1421] border border-gray-800 rounded-2xl p-5 shadow-lg">
              <h3 className="text-sm font-bold text-gray-400 tracking-wider mb-6 flex items-center gap-2">
                <PieIcon className="text-amber-400" size={16} /> THERMAL DISTRIBUTION
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={getPieData()} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {getPieData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Bar Chart - Humidity Analysis */}
            <div className="bg-[#0d1421] border border-gray-800 rounded-2xl p-5 shadow-lg">
              <h3 className="text-sm font-bold text-gray-400 tracking-wider mb-6 flex items-center gap-2">
                <Droplets className="text-blue-400" size={16} /> HUMIDITY DISTRIBUTION
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData} barSize={20}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                    <XAxis dataKey="time" stroke="#4b5563" fontSize={10} tickMargin={10} />
                    <YAxis stroke="#4b5563" fontSize={10} tickFormatter={(val) => `${val}%`} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }} />
                    <Bar name="Humidity (%)" dataKey="Humidity" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Raw Feed Table */}
            <div className="bg-[#0d1421] border border-gray-800 rounded-2xl overflow-hidden shadow-lg flex flex-col">
              <div className="p-5 border-b border-gray-800">
                <h3 className="text-sm font-bold text-gray-400 tracking-wider flex items-center gap-2">
                  <TableIcon className="text-cyan-400" size={16} /> RAW DATA FEED
                </h3>
              </div>
              <div className="overflow-x-auto max-h-[300px]">
                <table className="w-full text-left">
                  <thead className="bg-[#141c2d] text-[10px] text-gray-500 font-black uppercase tracking-widest sticky top-0">
                    <tr>
                      <th className="px-6 py-3">Timestamp</th>
                      <th className="px-6 py-3 text-center">Temp</th>
                      <th className="px-6 py-3 text-center">Hum</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800 text-xs">
                    {historyData.map((row, i) => (
                      <tr key={i} className="hover:bg-gray-800/20 transition-all">
                        <td className="px-6 py-3 text-gray-400 font-mono">{new Date(row.timestamp).toLocaleString()}</td>
                        <td className="px-6 py-3 text-center text-emerald-400 font-bold">{row.payload?.temperature}°C</td>
                        <td className="px-6 py-3 text-center text-blue-400 font-bold">{row.payload?.humidity}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
