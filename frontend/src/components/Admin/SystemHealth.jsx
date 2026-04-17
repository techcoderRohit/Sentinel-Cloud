"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Activity, Server, Database, Cpu, HardDrive, Clock, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { getSystemHealth } from '@/utils/adminAPI';
import toast from 'react-hot-toast';

const SystemHealth = () => {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchHealth = useCallback(async (showToast = false) => {
    try {
      if (!healthData) setLoading(true);
      const res = await getSystemHealth();
      setHealthData(res.data);
      setLastUpdated(new Date().toLocaleTimeString());
      if (showToast) toast.success('System health updated');
    } catch (error) {
      toast.error('Failed to update system health');
    } finally {
      setLoading(false);
    }
  }, [healthData]);

  useEffect(() => {
    fetchHealth();
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => fetchHealth(), 10000); // 10 seconds
    }
    return () => clearInterval(interval);
  }, [fetchHealth, autoRefresh]);

  if (loading && !healthData) {
    return (
      <div className="flex items-center justify-center py-40">
        <div className="w-10 h-10 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const getStatusColor = (status, type = 'text') => {
    if (status) {
      return type === 'bg' ? 'bg-emerald-500/10' : 'text-emerald-400';
    }
    return type === 'bg' ? 'bg-red-500/10' : 'text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">System Health</h1>
          <p className="text-slate-400 mt-1">Real-time platform infrastructure monitoring</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Clock size={14} />
            Last updated: {lastUpdated}
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-red-500 focus:ring-red-500 focus:ring-offset-slate-900"
              />
              Auto-refresh (10s)
            </label>
            <button
              onClick={() => fetchHealth(true)}
              className="p-2 ml-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <RefreshCw size={14} className={loading && healthData ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {healthData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Main Server Status */}
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl overflow-hidden p-6 hover:border-slate-700 hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Server className="text-red-400" />
                Backend Server
              </h3>
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(true, 'bg')} ${getStatusColor(true)} border border-emerald-500/20`}>
                <CheckCircle2 size={12} />
                Operational
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-slate-800">
                <span className="text-sm text-slate-400">Environment</span>
                <span className="text-sm font-medium text-white px-2 py-1 bg-slate-800 rounded">Production</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-800">
                <span className="text-sm text-slate-400">Uptime</span>
                <span className="text-sm font-medium text-white">{healthData.server?.uptimeFormatted}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-800">
                <span className="text-sm text-slate-400">Node JS Version</span>
                <span className="text-sm font-medium text-white">{healthData.server?.nodeVersion}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-800">
                <span className="text-sm text-slate-400">Platform</span>
                <span className="text-sm font-medium text-white capitalize">{healthData.server?.platform}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-slate-400">Process ID (PID)</span>
                <span className="text-sm font-medium text-white font-mono">{healthData.server?.pid}</span>
              </div>
            </div>
          </div>

          {/* Database Status */}
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl overflow-hidden p-6 hover:border-slate-700 hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Database className="text-blue-400" />
                Database (MongoDB)
              </h3>
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(healthData.database?.isConnected, 'bg')} ${getStatusColor(healthData.database?.isConnected)} border ${healthData.database?.isConnected ? 'border-emerald-500/20' : 'border-red-500/20'}`}>
                {healthData.database?.isConnected ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                {healthData.database?.status}
              </div>
            </div>

            <div className="space-y-4">
               <div className="flex items-center justify-between py-2 border-b border-slate-800">
                <span className="text-sm text-slate-400">Connection State</span>
                <span className={`text-sm font-medium ${getStatusColor(healthData.database?.isConnected)}`}>
                  {healthData.database?.isConnected ? 'Connected & Healthy' : 'Connection Error'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-800">
                <span className="text-sm text-slate-400">Host</span>
                <span className="text-sm font-medium text-white font-mono">{healthData.database?.host}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-slate-400">Database Name</span>
                <span className="text-sm font-medium text-slate-300">{healthData.database?.name}</span>
              </div>
            </div>
          </div>

          {/* Memory Usage */}
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl overflow-hidden p-6 hover:border-slate-700 hover:shadow-lg transition md:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Cpu className="text-purple-400" />
                Memory Usage
              </h3>
            </div>

            <div className="mb-6">
               <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-300">Heap Usage ({healthData.memory?.heapUsedPercentage}%)</span>
                <span className="text-sm text-slate-400">{healthData.memory?.heapUsed} / {healthData.memory?.heapTotal}</span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${
                    parseFloat(healthData.memory?.heapUsedPercentage) > 80 ? 'bg-red-500' :
                    parseFloat(healthData.memory?.heapUsedPercentage) > 60 ? 'bg-amber-500' :
                    'bg-emerald-500'
                  }`}
                  style={{ width: `${healthData.memory?.heapUsedPercentage}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-800/50 border border-slate-800 rounded-lg p-4">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">RSS</p>
                <p className="text-xl font-bold text-white">{healthData.memory?.rss}</p>
              </div>
              <div className="bg-slate-800/50 border border-slate-800 rounded-lg p-4">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Heap Total</p>
                <p className="text-xl font-bold text-white">{healthData.memory?.heapTotal}</p>
              </div>
              <div className="bg-slate-800/50 border border-slate-800 rounded-lg p-4">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Heap Used</p>
                <p className="text-xl font-bold text-white">{healthData.memory?.heapUsed}</p>
              </div>
              <div className="bg-slate-800/50 border border-slate-800 rounded-lg p-4">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">External</p>
                <p className="text-xl font-bold text-white">{healthData.memory?.external}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemHealth;
