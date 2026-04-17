"use client";
import React, { useState, useEffect } from 'react';
import API from '@/utils/api';
import {
  GitBranch,
  Activity,
  Cpu,
  ArrowRight,
  Cloud,
  Database,
  Wifi,
  WifiOff,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Zap,
  Clock,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';

export default function DataRouting() {
  const [apiKeys, setApiKeys] = useState([]);
  const [deviceDataMap, setDeviceDataMap] = useState({});
  const [stats, setStats] = useState({ totalDevices: 0, totalDataPoints: 0, activeDevices: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedDevice, setExpandedDevice] = useState(null);
  const [historyMap, setHistoryMap] = useState({});

  // Fetch all data on mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Fetch API keys, stats, and monitor data in parallel
      const [keysRes, statsRes, monitorRes] = await Promise.all([
        API.get('/apikeys', config),
        API.get('/iot/dashboard-stats', config),
        API.get('/iot/monitor-all', config)
      ]);

      setApiKeys(keysRes.data);
      setStats(statsRes.data);

      // Map monitor data by apiKey ID
      const dataMap = {};
      monitorRes.data.forEach(device => {
        dataMap[device._id] = device;
      });
      setDeviceDataMap(dataMap);
    } catch (err) {
      console.error("Data routing fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    setTimeout(() => setRefreshing(false), 600);
  };

  const toggleExpand = async (keyId) => {
    if (expandedDevice === keyId) {
      setExpandedDevice(null);
      return;
    }
    setExpandedDevice(keyId);

    // Fetch history for this device if not already fetched
    if (!historyMap[keyId]) {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await API.get(`/iot/history/${keyId}`, config);
        setHistoryMap(prev => ({ ...prev, [keyId]: res.data }));
      } catch (err) {
        console.error("History fetch failed:", err);
        setHistoryMap(prev => ({ ...prev, [keyId]: [] }));
      }
    }
  };

  const isDeviceOnline = (device) => {
    if (!device?.lastUsed) return false;
    const tenMinsAgo = Date.now() - 10 * 60 * 1000;
    return new Date(device.lastUsed).getTime() > tenMinsAgo;
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return 'Never';
    const diff = Date.now() - new Date(dateStr).getTime();
    const secs = Math.floor(diff / 1000);
    if (secs < 60) return `${secs}s ago`;
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
          <p className="text-slate-400 font-medium text-sm tracking-wider uppercase">Loading Data Routes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">

      {/* ===== HEADER ===== */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <GitBranch className="w-7 h-7 text-cyan-500" />
            Data Routing
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Visualize how sensor data flows from your devices to Sentinel Cloud.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500/10 border border-cyan-600 text-cyan-400 rounded-xl font-bold text-sm hover:bg-cyan-500/20 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Syncing...' : 'Refresh Routes'}
        </button>
      </div>

      {/* ===== PIPELINE OVERVIEW CARDS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1 - Source */}
        <div className="bg-[#0F172A] border border-slate-700/60 rounded-2xl p-5 relative overflow-hidden group hover:border-cyan-800/60 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
              <Cpu className="w-5 h-5 text-cyan-400" />
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Source Nodes</span>
          </div>
          <h3 className="text-3xl font-black text-white">{stats.totalDevices}</h3>
          <p className="text-xs text-slate-500 mt-1">Provisioned Devices</p>
        </div>

        {/* Card 2 - Active Pipelines */}
        <div className="bg-[#0F172A] border border-slate-700/60 rounded-2xl p-5 relative overflow-hidden group hover:border-emerald-800/60 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <Zap className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Pipelines</span>
          </div>
          <h3 className="text-3xl font-black text-white">{stats.activeDevices}</h3>
          <p className="text-xs text-slate-500 mt-1">Streaming in Real-Time</p>
        </div>

        {/* Card 3 - Data Throughput */}
        <div className="bg-[#0F172A] border border-slate-700/60 rounded-2xl p-5 relative overflow-hidden group hover:border-purple-800/60 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-purple-500/10 rounded-xl border border-purple-500/20">
              <Database className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Data Points</span>
          </div>
          <h3 className="text-3xl font-black text-white">{stats.totalDataPoints?.toLocaleString()}</h3>
          <p className="text-xs text-slate-500 mt-1">Total Records Stored</p>
        </div>
      </div>

      {/* ===== DATA FLOW VISUALIZER ===== */}
      <div className="bg-[#0F172A] border border-slate-700/60 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-slate-400 tracking-wider uppercase mb-6 flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-500" />
          Data Pipeline Overview
        </h3>

        {/* Flow Diagram */}
        <div className="flex items-center justify-center gap-3 py-6 overflow-x-auto">
          {/* Step 1 - Device */}
          <div className="flex flex-col items-center gap-2 min-w-[120px]">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center shadow-lg shadow-cyan-500/10">
              <Cpu className="w-7 h-7 text-cyan-400" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">IoT Device</span>
            <span className="text-[9px] text-slate-600">ESP32 / Arduino</span>
          </div>

          {/* Arrow 1 */}
          <div className="flex flex-col items-center gap-1 min-w-[80px]">
            <div className="flex items-center gap-1">
              <div className="w-12 h-[2px] bg-gradient-to-r from-cyan-500 to-cyan-500/30"></div>
              <ArrowRight className="w-4 h-4 text-cyan-500" />
            </div>
            <span className="text-[8px] text-cyan-500/60 font-bold uppercase tracking-widest">HTTP POST</span>
          </div>

          {/* Step 2 - API Gateway */}
          <div className="flex flex-col items-center gap-2 min-w-[120px]">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/10">
              <Zap className="w-7 h-7 text-amber-400" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">API Gateway</span>
            <span className="text-[9px] text-slate-600">x-api-key Auth</span>
          </div>

          {/* Arrow 2 */}
          <div className="flex flex-col items-center gap-1 min-w-[80px]">
            <div className="flex items-center gap-1">
              <div className="w-12 h-[2px] bg-gradient-to-r from-amber-500 to-amber-500/30"></div>
              <ArrowRight className="w-4 h-4 text-amber-500" />
            </div>
            <span className="text-[8px] text-amber-500/60 font-bold uppercase tracking-widest">Validated</span>
          </div>

          {/* Step 3 - Cloud */}
          <div className="flex flex-col items-center gap-2 min-w-[120px]">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <Cloud className="w-7 h-7 text-emerald-400" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sentinel Cloud</span>
            <span className="text-[9px] text-slate-600">Express + Node.js</span>
          </div>

          {/* Arrow 3 */}
          <div className="flex flex-col items-center gap-1 min-w-[80px]">
            <div className="flex items-center gap-1">
              <div className="w-12 h-[2px] bg-gradient-to-r from-emerald-500 to-emerald-500/30"></div>
              <ArrowRight className="w-4 h-4 text-emerald-500" />
            </div>
            <span className="text-[8px] text-emerald-500/60 font-bold uppercase tracking-widest">Stored</span>
          </div>

          {/* Step 4 - Database */}
          <div className="flex flex-col items-center gap-2 min-w-[120px]">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 border border-purple-500/30 flex items-center justify-center shadow-lg shadow-purple-500/10">
              <Database className="w-7 h-7 text-purple-400" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">MongoDB Atlas</span>
            <span className="text-[9px] text-slate-600">Persistent Store</span>
          </div>
        </div>
      </div>

      {/* ===== DEVICE ROUTE TABLE ===== */}
      <div className="bg-[#0F172A] border border-slate-700/60 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-400 tracking-wider uppercase flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-500" />
            Device Route Map
          </h3>
          <span className="text-[10px] bg-cyan-500/10 text-cyan-500 px-3 py-1 rounded-lg border border-cyan-500/20 font-bold uppercase tracking-widest">
            {apiKeys.length} Routes Active
          </span>
        </div>

        {apiKeys.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-800/50 border border-slate-700 flex items-center justify-center">
              <GitBranch className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-slate-400 font-medium">No data routes configured yet.</p>
            <p className="text-slate-600 text-sm mt-1">Generate an API Key and connect a device to create a route.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {apiKeys.map((key) => {
              const deviceData = deviceDataMap[key._id];
              const online = isDeviceOnline(key);
              const history = historyMap[key._id];
              const isExpanded = expandedDevice === key._id;

              return (
                <div key={key._id} className="transition-all">
                  {/* Main Row */}
                  <div
                    onClick={() => toggleExpand(key._id)}
                    className="flex items-center px-6 py-4 hover:bg-slate-800/20 cursor-pointer transition-all group"
                  >
                    {/* Status Indicator */}
                    <div className="mr-4">
                      {online ? (
                        <div className="relative">
                          <Wifi className="w-5 h-5 text-emerald-400" />
                          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span>
                        </div>
                      ) : (
                        <WifiOff className="w-5 h-5 text-slate-600" />
                      )}
                    </div>

                    {/* Device Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-white font-bold text-sm truncate">{key.name}</h4>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${online
                          ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                          : 'text-slate-500 bg-slate-800 border-slate-700'
                          }`}>
                          {online ? 'Streaming' : 'Idle'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-mono mt-0.5 truncate">
                        {key.key?.substring(0, 20)}...
                      </p>
                    </div>

                    {/* Data Preview */}
                    <div className="hidden md:flex items-center gap-6 mr-6">
                      {deviceData?.data ? (
                        <>
                          <div className="text-center">
                            <p className="text-[9px] text-slate-600 uppercase tracking-widest font-bold">Temp</p>
                            <p className="text-sm font-bold text-cyan-400">{deviceData.data.temperature ?? '--'}°C</p>
                          </div>
                          <div className="text-center">
                            <p className="text-[9px] text-slate-600 uppercase tracking-widest font-bold">Humidity</p>
                            <p className="text-sm font-bold text-blue-400">{deviceData.data.humidity ?? '--'}%</p>
                          </div>
                          <div className="text-center">
                            <p className="text-[9px] text-slate-600 uppercase tracking-widest font-bold">Status</p>
                            <p className="text-sm font-bold text-emerald-400">{deviceData.data.status ?? '--'}</p>
                          </div>
                        </>
                      ) : (
                        <span className="text-xs text-slate-600 italic">No data received</span>
                      )}
                    </div>

                    {/* Last Active */}
                    <div className="hidden sm:flex items-center gap-2 mr-4">
                      <Clock className="w-3.5 h-3.5 text-slate-600" />
                      <span className="text-xs text-slate-500 font-medium">{formatTimeAgo(key.lastUsed)}</span>
                    </div>

                    {/* Expand Arrow */}
                    <div className="text-slate-600 group-hover:text-slate-400 transition-colors">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>

                  {/* Expanded Detail Panel */}
                  {isExpanded && (
                    <div className="px-6 pb-5 bg-[#0a0f1a] border-t border-slate-800/40 animate-in slide-in-from-top-2 duration-300">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">

                        {/* Route Path Visualization */}
                        <div className="bg-[#0F172A] rounded-xl p-4 border border-slate-800">
                          <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Route Path</h5>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                              <div className="flex-1 flex items-center gap-2">
                                <span className="text-xs text-white font-bold">POST</span>
                                <code className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded font-mono">/api/iot/update</code>
                              </div>
                            </div>
                            <div className="ml-2 border-l-2 border-dashed border-slate-700 h-3"></div>
                            <div className="flex items-center gap-3">
                              <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                              <div className="flex-1">
                                <span className="text-xs text-slate-400">API Key Validated</span>
                                <span className="text-[10px] text-slate-600 ml-2 font-mono">x-api-key: {key.key?.substring(0, 16)}...</span>
                              </div>
                            </div>
                            <div className="ml-2 border-l-2 border-dashed border-slate-700 h-3"></div>
                            <div className="flex items-center gap-3">
                              {deviceData?.data ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                              ) : (
                                <XCircle className="w-4 h-4 text-slate-600 shrink-0" />
                              )}
                              <span className="text-xs text-slate-400">
                                {deviceData?.data ? 'Data stored in MongoDB' : 'Awaiting first data payload'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Recent Data Log */}
                        <div className="bg-[#0F172A] rounded-xl p-4 border border-slate-800">
                          <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Recent Data Log</h5>
                          {!history ? (
                            <div className="flex items-center justify-center py-6">
                              <Loader2 className="w-5 h-5 text-cyan-500 animate-spin" />
                            </div>
                          ) : history.length === 0 ? (
                            <div className="text-center py-6">
                              <AlertTriangle className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                              <p className="text-xs text-slate-600">No data records yet</p>
                            </div>
                          ) : (
                            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                              {history.slice(-8).reverse().map((record, i) => (
                                <div key={i} className="flex items-center justify-between bg-slate-900/60 rounded-lg px-3 py-2 border border-slate-800/50">
                                  <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
                                    <span className="text-xs text-white font-medium">
                                      {record.payload?.temperature ?? '--'}°C / {record.payload?.humidity ?? '--'}%
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-slate-600 font-mono">
                                    {new Date(record.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ===== INTEGRATION GUIDE FOOTER ===== */}
      <div className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border border-cyan-800/30 rounded-2xl p-5">
        <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-2">Quick Integration</h4>
        <div className="bg-[#0a0f1a] rounded-xl p-4 border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto">
          <pre className="whitespace-pre">{`// ESP32 / Arduino - Send data to Sentinel Cloud
#include <HTTPClient.h>

HTTPClient http;
http.begin("http://<YOUR_IP>:5000/api/iot/update");
http.addHeader("Content-Type", "application/json");
http.addHeader("x-api-key", "sk-sentinel-your-key-here");

String payload = "{\\"temperature\\": 28.5, \\"humidity\\": 65, \\"status\\": \\"Online\\"}";
int httpCode = http.POST(payload);`}</pre>
        </div>
      </div>
    </div>
  );
}
