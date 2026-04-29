"use client";
import React, { useState, useEffect } from 'react';
import API from '@/utils/api';
import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

import { Calendar, Filter, Activity, Droplets, Table as TableIcon, Clock } from 'lucide-react';


const FEED_COLORS = {
  temperature: '#10b981',
  Temperature: '#10b981',
  humidity: '#3b82f6',
  Humidity: '#3b82f6',
  motion: '#f59e0b',
  Motion: '#f59e0b',
};
const FALLBACK_COLORS = ['#8b5cf6', '#f43f5e', '#06b6d4', '#fbbf24', '#a3e635'];


const Reports = () => {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [range, setRange] = useState('24H');
  const [analyticsData, setAnalyticsData] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState('All');
  const [aiReport, setAiReport] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [availableFeeds, setAvailableFeeds] = useState([]);


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
        const feedQuery = selectedFeed !== 'All' ? `&feed=${selectedFeed}` : '';
        const analyticsRes = await API.get(`/iot/analytics/${selectedDevice}?range=${range}${feedQuery}`);

        const formattedData = analyticsRes.data.map(item => {
          const base = { time: item._id };
          if (!selectedFeed || selectedFeed === 'All') {
            base.Temperature = item.avgTemp ? Number(item.avgTemp.toFixed(1)) : 0;
            base.Humidity = item.avgHum ? Number(item.avgHum.toFixed(1)) : 0;
          } else {
            // For specific feed, we use a consistent key for the chart
            base[selectedFeed] = item.avgValue ? Number(item.avgValue.toFixed(1)) : 0;
          }
          return base;
        });
        setAnalyticsData(formattedData);


        // 2. Raw History for Table
        if (dev) {
          const historyRes = await API.get(`/iot/history/${dev._id}`);
          setHistoryData(historyRes.data);

          // 3. Extract Dynamic Feeds from payload keys
          if (historyRes.data.length > 0) {
            const firstPayload = historyRes.data[0].payload || {};
            const keys = Object.keys(firstPayload).filter(k =>
              typeof firstPayload[k] === 'number' || typeof firstPayload[k] === 'boolean'
            );
            setAvailableFeeds(keys);
            if (!keys.includes(selectedFeed) && selectedFeed !== 'All') {
              setSelectedFeed('All');
            }
          }
        }

      } catch (err) {
        console.error("Failed to fetch report data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedDevice, range, devices, selectedFeed]);


  const handleAiAnalysis = async () => {
    if (!selectedDevice) return;
    setAnalyzing(true);
    setAiReport(null);
    try {
      const query = selectedFeed !== 'All' ? `?feed=${selectedFeed}` : '';
      const response = await API.post(`/ai/analyze/${selectedDevice}${query}`);
      if (response.data.success) {
        setAiReport(response.data.report);
      }
    } catch (err) {
      console.error("AI Analysis failed", err);
      alert(err.response?.data?.message || "AI Analysis failed. Check console for details.");
    } finally {
      setAnalyzing(false);
    }
  };


  const getTimelineFeeds = () => {
    if (analyticsData.length === 0) return [];
    const sample = analyticsData[0];
    return Object.keys(sample).filter(k => k !== 'time');
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

          <div className="flex items-center gap-2 bg-[#141c2d] px-3 py-2 rounded-lg border border-gray-800">
            <Filter size={14} className="text-gray-500" />
            <select
              value={selectedFeed}
              onChange={(e) => setSelectedFeed(e.target.value)}
              className="bg-transparent border-none outline-none text-sm text-gray-300 min-w-[100px]"
            >
              <option value="All">All Feeds</option>
              {availableFeeds.map(f => (
                <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>
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

          <button
            onClick={handleAiAnalysis}
            disabled={analyzing}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg ${analyzing
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:scale-105 active:scale-95 shadow-purple-500/20'
              }`}
          >
            {analyzing ? (
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
            ) : (
              <Activity size={14} className="animate-pulse" />
            )}
            AI Anomaly
          </button>
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
          {/* AI Report Section */}
          {aiReport && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="bg-[#0f172a] border border-purple-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Activity size={120} className="text-purple-500" />
                </div>

                <div className="flex flex-col xl:flex-row gap-8 relative z-10">
                  {/* Health Score */}
                  <div className="flex flex-col items-center justify-center p-6 bg-[#1e293b]/50 rounded-2xl border border-white/5 min-w-[200px]">
                    <span className="text-xs font-black text-purple-400 uppercase tracking-[0.2em] mb-4">Health Score</span>
                    <div className="relative flex items-center justify-center">
                      <svg className="w-32 h-32 transform -rotate-90">
                        <circle cx="64" cy="64" r="58" fill="none" stroke="#1e293b" strokeWidth="8" />
                        <circle
                          cx="64" cy="64" r="58" fill="none"
                          stroke={aiReport.healthScore > 80 ? '#10b981' : aiReport.healthScore > 50 ? '#f59e0b' : '#ef4444'}
                          strokeWidth="8"
                          strokeDasharray={364.4}
                          strokeDashoffset={364.4 - (aiReport.healthScore / 100) * 364.4}
                          strokeLinecap="round"
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-4xl font-black text-white">{aiReport.healthScore}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">PTS</span>
                      </div>
                    </div>
                  </div>

                  {/* Summary and Insights */}
                  <div className="flex-1 space-y-6">
                    <div>
                      <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2 mb-2">
                        <span className="w-2 h-6 bg-purple-500 rounded-full"></span>
                        AI Intelligence Summary
                      </h3>
                      <p className="text-gray-400 leading-relaxed text-sm">{aiReport.summary}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-[#1e293b]/30 p-4 rounded-xl border border-white/5">
                        <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-3">Key Insights</h4>
                        <ul className="space-y-2">
                          {aiReport.insights.map((insight, idx) => (
                            <li key={idx} className="text-xs text-gray-400 flex items-start gap-2">
                              <span className="mt-1.5 w-1 h-1 rounded-full bg-emerald-500 shrink-0"></span>
                              {insight}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-[#1e293b]/30 p-4 rounded-xl border border-white/5">
                        <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-3">Detected Anomalies</h4>
                        {aiReport.anomalies.length > 0 ? (
                          <ul className="space-y-3">
                            {aiReport.anomalies.map((anomaly, idx) => (
                              <li key={idx} className="bg-rose-500/5 border border-rose-500/10 p-2.5 rounded-lg flex flex-col gap-1">
                                <div className="flex justify-between items-center">
                                  <span className="text-[10px] font-bold text-rose-500 uppercase">{anomaly.type}</span>
                                  <span className={`text-[8px] px-1.5 py-0.5 rounded uppercase font-black ${anomaly.severity === 'critical' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-black'
                                    }`}>{anomaly.severity}</span>
                                </div>
                                <p className="text-[11px] text-gray-300">{anomaly.message}</p>
                                <span className="text-[9px] text-gray-500 font-mono">{new Date(anomaly.timestamp).toLocaleString()}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="h-full flex items-center justify-center text-gray-600 italic text-[10px]">
                            No anomalies detected in the provided range.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Line Chart - Trends */}
            <div className="bg-[#0d1421] border border-gray-800 rounded-2xl p-5 shadow-lg">
              <h3 className="text-sm font-bold text-gray-400 tracking-wider mb-6 flex items-center gap-2 uppercase">
                <Activity className="text-emerald-400" size={16} />
                {selectedFeed === 'All' ? 'TEMPERATURE TRENDS' : `${selectedFeed} TRENDS`}
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                    <XAxis dataKey="time" stroke="#4b5563" fontSize={10} tickMargin={10} />
                    <YAxis stroke="#4b5563" fontSize={10} tickFormatter={(val) => `${val}${selectedFeed.toLowerCase() === 'humidity' ? '%' : (selectedFeed.toLowerCase() === 'temperature' || selectedFeed === 'All' ? '°C' : '')}`} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }} />
                    <Legend />

                    {selectedFeed === 'All' || selectedFeed.toLowerCase() === 'temperature' ? (
                      <Line type="monotone" name="Temp (°C)" dataKey={selectedFeed === 'All' ? "Temperature" : selectedFeed} stroke="#10b981" strokeWidth={3} dot={false} />
                    ) : null}
                    {selectedFeed === 'All' || selectedFeed.toLowerCase() === 'humidity' ? (
                      <Line type="monotone" name="Humidity (%)" dataKey={selectedFeed === 'All' ? "Humidity" : selectedFeed} stroke="#3b82f6" strokeWidth={3} dot={false} />
                    ) : null}
                    {selectedFeed !== 'All' && selectedFeed.toLowerCase() !== 'temperature' && selectedFeed.toLowerCase() !== 'humidity' && (
                      <Line type="monotone" name={selectedFeed.charAt(0).toUpperCase() + selectedFeed.slice(1)} dataKey={selectedFeed} stroke="#8b5cf6" strokeWidth={3} dot={false} />
                    )}

                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Timeline Chart — All Feeds */}
            <div className="bg-[#0d1421] border border-gray-800 rounded-2xl p-5 shadow-lg">
              <h3 className="text-sm font-bold text-gray-400 tracking-wider mb-6 flex items-center gap-2 uppercase">
                <Clock className="text-amber-400" size={16} />
                DATA FEED TIMELINE
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData}>
                    <defs>
                      {getTimelineFeeds().map((feed, idx) => {
                        const color = FEED_COLORS[feed] || FALLBACK_COLORS[idx % FALLBACK_COLORS.length];
                        return (
                          <linearGradient key={feed} id={`grad-${feed}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={color} stopOpacity={0.0} />
                          </linearGradient>
                        );
                      })}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                    <XAxis dataKey="time" stroke="#4b5563" fontSize={10} tickMargin={10} />
                    <YAxis stroke="#4b5563" fontSize={10} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #374151', borderRadius: '12px' }}
                      labelStyle={{ color: '#e2e8f0', fontWeight: 'bold', marginBottom: '4px' }}
                      itemStyle={{ color: '#94a3b8' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }} />
                    {getTimelineFeeds().map((feed, idx) => {
                      const color = FEED_COLORS[feed] || FALLBACK_COLORS[idx % FALLBACK_COLORS.length];
                      return (
                        <Area
                          key={feed}
                          type="monotone"
                          dataKey={feed}
                          name={feed.charAt(0).toUpperCase() + feed.slice(1)}
                          stroke={color}
                          strokeWidth={2}
                          fill={`url(#grad-${feed})`}
                          dot={false}
                          activeDot={{ r: 4, strokeWidth: 0 }}
                        />
                      );
                    })}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>


          <div className="grid grid-cols-1 gap-6">
            {/* Raw Feed Table */}
            <div className="bg-[#0d1421] border border-gray-800 rounded-2xl overflow-hidden shadow-lg flex flex-col">
              <div className="p-5 border-b border-gray-800 flex justify-between items-center">
                <h3 className="text-sm font-bold text-gray-400 tracking-wider flex items-center gap-2 uppercase">
                  <TableIcon className="text-cyan-400" size={16} /> RAW DATA FEED: {selectedFeed}
                </h3>
              </div>
              <div className="overflow-x-auto max-h-[400px]">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#141c2d] text-[10px] text-gray-500 font-black uppercase tracking-widest sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-4 border-b border-gray-800">Timestamp</th>
                      {selectedFeed === 'All' ? (
                        <>
                          <th className="px-6 py-4 border-b border-gray-800 text-center">Temp</th>
                          <th className="px-6 py-4 border-b border-gray-800 text-center">Hum</th>
                          <th className="px-6 py-4 border-b border-gray-800 text-center">Motion</th>
                          <th className="px-6 py-4 border-b border-gray-800 text-center">Status</th>
                        </>
                      ) : (
                        <th className="px-6 py-4 border-b border-gray-800 text-center">{selectedFeed}</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800 text-xs text-gray-400">
                    {historyData.map((row, i) => (
                      <tr key={i} className="hover:bg-cyan-500/5 transition-colors group">
                        <td className="px-6 py-4 font-mono group-hover:text-cyan-400">
                          {new Date(row.timestamp).toLocaleString()}
                        </td>
                        {selectedFeed === 'All' ? (
                          <>
                            <td className="px-6 py-4 text-center text-emerald-400 font-bold">{row.payload?.temperature}°C</td>
                            <td className="px-6 py-4 text-center text-blue-400 font-bold">{row.payload?.humidity}%</td>
                            <td className="px-6 py-4 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${row.payload?.motion ? 'bg-rose-500/20 text-rose-500' : 'bg-gray-800 text-gray-600'
                                }`}>
                                {row.payload?.motion ? 'Detected' : 'None'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="text-[10px] font-mono">{row.payload?.status}</span>
                            </td>
                          </>
                        ) : (
                          <td className="px-6 py-4 text-center text-cyan-400 font-black text-sm">
                            {row.payload?.[selectedFeed] ?? 'N/A'}
                            {selectedFeed === 'temperature' ? '°C' : selectedFeed === 'humidity' ? '%' : ''}
                          </td>
                        )}
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
