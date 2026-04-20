"use client";
import React, { useState, useEffect } from 'react';
import API from '@/utils/api';
import { triggerAIAnalysis, getAIReports, deleteAIReport } from '@/utils/dashboardAPI';
import {
  Brain, Sparkles, Activity, ShieldCheck, AlertTriangle, AlertCircle,
  CheckCircle, Zap, Lightbulb, Clock, Trash2, ChevronDown, ChevronUp,
  Filter, Play, Loader2, FileText, TrendingUp, Thermometer, Droplets
} from 'lucide-react';

const AIInsights = () => {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [selectedDeviceName, setSelectedDeviceName] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [currentReport, setCurrentReport] = useState(null);
  const [pastReports, setPastReports] = useState([]);
  const [expandedReport, setExpandedReport] = useState(null);
  const [error, setError] = useState('');
  const [loadingReports, setLoadingReports] = useState(false);

  // Fetch devices on mount
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await API.get('/devices');
        if (response.data.success && Array.isArray(response.data.data)) {
          const deviceList = response.data.data;
          setDevices(deviceList);
          if (deviceList.length > 0) {
            setSelectedDevice(deviceList[0].apiKey);
            setSelectedDeviceName(deviceList[0].deviceName || deviceList[0].name || 'Device');
          }
        } else if (Array.isArray(response.data)) {
           // Fallback if backend directly returns array
           setDevices(response.data);
           if (response.data.length > 0) {
             setSelectedDevice(response.data[0].apiKey);
             setSelectedDeviceName(response.data[0].deviceName || response.data[0].name || 'Device');
           }
        }
      } catch (err) {
        console.error("Failed to fetch devices", err);
        setDevices([]);
      }
    };
    fetchDevices();
  }, []);

  // Fetch past AI reports when device changes
  useEffect(() => {
    if (selectedDevice) {
      fetchPastReports();
    }
  }, [selectedDevice]);

  const fetchPastReports = async () => {
    setLoadingReports(true);
    try {
      const data = await getAIReports(selectedDevice);
      setPastReports(data.reports || []);
    } catch (err) {
      console.error("Failed to fetch past reports", err);
    } finally {
      setLoadingReports(false);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedDevice) return;
    setAnalyzing(true);
    setError('');
    setCurrentReport(null);

    try {
      const data = await triggerAIAnalysis(selectedDevice);
      if (data.success) {
        setCurrentReport(data.report);
        fetchPastReports(); // Refresh past reports
      } else {
        setError(data.message || 'Analysis failed');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'AI Analysis failed. Check your Gemini API key in .env';
      setError(msg);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDeleteReport = async (reportId) => {
    try {
      await deleteAIReport(reportId);
      setPastReports(prev => prev.filter(r => r._id !== reportId));
      if (currentReport && currentReport._id === reportId) {
        setCurrentReport(null);
      }
    } catch (err) {
      console.error("Failed to delete report", err);
    }
  };

  const handleDeviceChange = (e) => {
    const apiKey = e.target.value;
    setSelectedDevice(apiKey);
    const dev = devices.find(d => d.apiKey === apiKey);
    setSelectedDeviceName(dev?.deviceName || dev?.name || 'Device');
    setCurrentReport(null);
    setError('');
  };

  // Which report to display in the main view
  const displayReport = currentReport;

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">

      {/* ===== HEADER ===== */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-[#0d1421] via-[#12101f] to-[#0d1421] border border-purple-500/20 p-6 rounded-2xl relative overflow-hidden">
        {/* Glow Effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-violet-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-xl border border-purple-500/20">
              <Brain className="text-purple-400" size={22} />
            </div>
            AI Anomaly Detection
            <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30 font-bold uppercase tracking-wider">
              AI Lite
            </span>
          </h2>
          <p className="text-xs text-gray-400 mt-2 max-w-md">
            Powered by Google Gemini — Analyze sensor data, detect anomalies, and get plain-English insights automatically.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          {/* Device Selector */}
          <div className="flex items-center gap-2 bg-[#141c2d] px-3 py-2.5 rounded-xl border border-gray-800">
            <Filter size={14} className="text-gray-500" />
            <select
              value={selectedDevice}
              onChange={handleDeviceChange}
              className="bg-transparent border-none outline-none text-sm text-gray-300 min-w-[140px]"
            >
              <option value="" disabled>Select Device</option>
              {devices.map(dev => (
                <option key={dev._id || dev.apiKey} value={dev.apiKey}>
                  {dev.deviceName || dev.name || dev.apiKey}
                </option>
              ))}
            </select>
          </div>

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={analyzing || !selectedDevice}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${analyzing
                ? 'bg-purple-500/20 text-purple-300 cursor-wait'
                : 'bg-gradient-to-r from-purple-600 to-violet-600 text-white hover:from-purple-500 hover:to-violet-500 hover:shadow-lg hover:shadow-purple-500/25 active:scale-95'
              }`}
          >
            {analyzing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Run AI Analysis
              </>
            )}
          </button>
        </div>
      </div>

      {/* ===== ERROR STATE ===== */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={18} />
          <div>
            <p className="text-sm text-red-300 font-medium">{error}</p>
            <p className="text-xs text-red-400/60 mt-1">Make sure your Gemini API key is configured in backend/.env</p>
          </div>
        </div>
      )}

      {/* ===== ANALYZING ANIMATION ===== */}
      {analyzing && (
        <div className="bg-[#0d1421] border border-purple-500/20 rounded-2xl p-12 flex flex-col items-center justify-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
            <Brain className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-purple-400" size={28} />
          </div>
          <p className="text-sm text-gray-400 font-medium">Gemini is analyzing your sensor data...</p>
          <p className="text-xs text-gray-600">This may take a few seconds</p>
        </div>
      )}

      {/* ===== MAIN RESULTS ===== */}
      {displayReport && !analyzing && (
        <>
          {/* Top Row: Health Score + Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Health Score Gauge */}
            <div className="bg-[#0d1421] border border-gray-800 rounded-2xl p-6 flex flex-col items-center justify-center">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Device Health Score</p>
              <HealthGauge score={displayReport.healthScore} />
              <p className="text-xs text-gray-500 mt-4">
                Based on {displayReport.dataPointsAnalyzed || '—'} data points
              </p>
              <p className="text-[10px] text-gray-600 mt-1">
                {displayReport.dataRange?.from && displayReport.dataRange?.to
                  ? `${new Date(displayReport.dataRange.from).toLocaleDateString()} — ${new Date(displayReport.dataRange.to).toLocaleDateString()}`
                  : ''}
              </p>
            </div>

            {/* AI Summary */}
            <div className="lg:col-span-2 bg-[#0d1421] border border-gray-800 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-gray-400 tracking-wider mb-4 flex items-center gap-2">
                <FileText className="text-purple-400" size={16} />
                AI SUMMARY
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                {displayReport.summary}
              </p>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-3 mt-5">
                <QuickStat
                  icon={<AlertTriangle size={14} />}
                  label="Anomalies"
                  value={displayReport.anomalies?.length || 0}
                  color={displayReport.anomalies?.length > 0 ? 'amber' : 'emerald'}
                />
                <QuickStat
                  icon={<Lightbulb size={14} />}
                  label="Insights"
                  value={displayReport.insights?.length || 0}
                  color="blue"
                />
                <QuickStat
                  icon={<Activity size={14} />}
                  label="Health"
                  value={`${displayReport.healthScore}%`}
                  color={displayReport.healthScore >= 80 ? 'emerald' : displayReport.healthScore >= 50 ? 'amber' : 'red'}
                />
              </div>
            </div>
          </div>

          {/* Bottom Row: Anomalies + Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Anomaly Timeline */}
            <div className="bg-[#0d1421] border border-gray-800 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-gray-400 tracking-wider mb-5 flex items-center gap-2">
                <AlertTriangle className="text-amber-400" size={16} />
                ANOMALY DETECTION
              </h3>
              {displayReport.anomalies && displayReport.anomalies.length > 0 ? (
                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar">
                  {displayReport.anomalies.map((anomaly, i) => (
                    <AnomalyCard key={i} anomaly={anomaly} index={i} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-gray-600">
                  <CheckCircle size={40} className="mb-3 text-emerald-500/40" />
                  <p className="text-sm font-medium text-emerald-400">No Anomalies Detected</p>
                  <p className="text-xs text-gray-500 mt-1">All sensor readings are within normal parameters</p>
                </div>
              )}
            </div>

            {/* Actionable Insights */}
            <div className="bg-[#0d1421] border border-gray-800 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-gray-400 tracking-wider mb-5 flex items-center gap-2">
                <Lightbulb className="text-blue-400" size={16} />
                ACTIONABLE INSIGHTS
              </h3>
              {displayReport.insights && displayReport.insights.length > 0 ? (
                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar">
                  {displayReport.insights.map((insight, i) => (
                    <InsightCard key={i} insight={insight} index={i} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-10">No insights generated</p>
              )}
            </div>
          </div>
        </>
      )}

      {/* ===== EMPTY STATE (no report yet) ===== */}
      {!displayReport && !analyzing && !error && (
        <div className="bg-[#0d1421] border border-gray-800 border-dashed rounded-2xl p-16 flex flex-col items-center justify-center">
          <div className="p-4 bg-purple-500/5 rounded-2xl border border-purple-500/10 mb-5">
            <Brain size={48} className="text-purple-500/30" />
          </div>
          <h3 className="text-lg font-bold text-gray-400">No Analysis Yet</h3>
          <p className="text-xs text-gray-600 mt-2 max-w-sm text-center">
            Select a device and click "Run AI Analysis" to get anomaly detection, health scores, and plain-English insights powered by Google Gemini.
          </p>
        </div>
      )}

      {/* ===== PAST REPORTS ===== */}
      <div className="bg-[#0d1421] border border-gray-800 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-gray-400 tracking-wider mb-5 flex items-center gap-2">
          <Clock className="text-gray-500" size={16} />
          PAST AI REPORTS
          {pastReports.length > 0 && (
            <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full ml-2">{pastReports.length}</span>
          )}
        </h3>

        {loadingReports ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={20} className="text-gray-600 animate-spin" />
          </div>
        ) : pastReports.length > 0 ? (
          <div className="space-y-2">
            {pastReports.map((report) => (
              <PastReportRow
                key={report._id}
                report={report}
                expanded={expandedReport === report._id}
                onToggle={() => setExpandedReport(expandedReport === report._id ? null : report._id)}
                onDelete={() => handleDeleteReport(report._id)}
                onView={() => setCurrentReport(report)}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-600 text-center py-6">No past reports for this device. Run your first analysis above!</p>
        )}
      </div>
    </div>
  );
};

// ============================================================
// HEALTH GAUGE — Circular score indicator
// ============================================================
const HealthGauge = ({ score }) => {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s) => {
    if (s >= 80) return { stroke: '#10b981', text: 'text-emerald-400', label: 'Healthy', bg: 'text-emerald-500/20' };
    if (s >= 50) return { stroke: '#f59e0b', text: 'text-amber-400', label: 'Needs Attention', bg: 'text-amber-500/20' };
    return { stroke: '#ef4444', text: 'text-red-400', label: 'Critical', bg: 'text-red-500/20' };
  };

  const color = getColor(score);

  return (
    <div className="relative flex items-center justify-center">
      <svg width="150" height="150" className="-rotate-90">
        <circle cx="75" cy="75" r={radius} stroke="#1f2937" strokeWidth="8" fill="none" />
        <circle
          cx="75" cy="75" r={radius}
          stroke={color.stroke}
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`text-3xl font-black ${color.text}`}>{score}</span>
        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{color.label}</span>
      </div>
    </div>
  );
};

// ============================================================
// QUICK STAT BADGE
// ============================================================
const QuickStat = ({ icon, label, value, color }) => {
  const colors = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  };
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold ${colors[color]}`}>
      {icon}
      <span>{label}:</span>
      <span>{value}</span>
    </div>
  );
};

// ============================================================
// ANOMALY CARD
// ============================================================
const AnomalyCard = ({ anomaly, index }) => {
  const severityConfig = {
    critical: {
      border: 'border-red-500/30',
      bg: 'bg-red-500/5',
      badge: 'bg-red-500/20 text-red-400 border-red-500/30',
      icon: <AlertCircle size={16} className="text-red-400" />
    },
    warning: {
      border: 'border-amber-500/30',
      bg: 'bg-amber-500/5',
      badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      icon: <AlertTriangle size={16} className="text-amber-400" />
    },
    normal: {
      border: 'border-blue-500/30',
      bg: 'bg-blue-500/5',
      badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      icon: <Activity size={16} className="text-blue-400" />
    },
  };

  const config = severityConfig[anomaly.severity] || severityConfig.normal;

  const typeIcons = {
    temperature_spike: <Thermometer size={14} className="text-red-400" />,
    temperature_drop: <Thermometer size={14} className="text-blue-400" />,
    humidity_spike: <Droplets size={14} className="text-blue-400" />,
    humidity_drop: <Droplets size={14} className="text-amber-400" />,
    threshold_breach: <Zap size={14} className="text-red-400" />,
    erratic_readings: <TrendingUp size={14} className="text-amber-400" />,
  };

  return (
    <div className={`p-4 rounded-xl border ${config.border} ${config.bg} transition-all hover:scale-[1.01]`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">{config.icon}</div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${config.badge}`}>
                {anomaly.severity}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-gray-500">
                {typeIcons[anomaly.type]}
                {anomaly.type?.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">{anomaly.message}</p>
            {anomaly.timestamp && (
              <p className="text-[10px] text-gray-600 mt-1.5 flex items-center gap-1">
                <Clock size={10} />
                {anomaly.timestamp}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// INSIGHT CARD
// ============================================================
const InsightCard = ({ insight, index }) => {
  const accentColors = [
    'border-blue-500/20 bg-blue-500/5',
    'border-violet-500/20 bg-violet-500/5',
    'border-cyan-500/20 bg-cyan-500/5',
    'border-emerald-500/20 bg-emerald-500/5',
    'border-amber-500/20 bg-amber-500/5',
  ];

  const iconColors = [
    'text-blue-400', 'text-violet-400', 'text-cyan-400', 'text-emerald-400', 'text-amber-400'
  ];

  return (
    <div className={`p-4 rounded-xl border ${accentColors[index % accentColors.length]} transition-all hover:scale-[1.01]`}>
      <div className="flex items-start gap-3">
        <Lightbulb size={16} className={`${iconColors[index % iconColors.length]} shrink-0 mt-0.5`} />
        <p className="text-sm text-gray-300 leading-relaxed">{insight}</p>
      </div>
    </div>
  );
};

// ============================================================
// PAST REPORT ROW (Accordion)
// ============================================================
const PastReportRow = ({ report, expanded, onToggle, onDelete, onView }) => {
  const scoreColor = report.healthScore >= 80
    ? 'text-emerald-400'
    : report.healthScore >= 50
      ? 'text-amber-400'
      : 'text-red-400';

  const anomalyCount = report.anomalies?.length || 0;

  return (
    <div className="border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-all">
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-800/20 transition-all"
        onClick={onToggle}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Brain size={14} className="text-purple-400" />
            <span className="text-xs text-gray-400 font-medium">
              {new Date(report.createdAt).toLocaleString()}
            </span>
          </div>
          <span className={`text-xs font-bold ${scoreColor}`}>
            Health: {report.healthScore}%
          </span>
          {anomalyCount > 0 && (
            <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20 font-bold">
              {anomalyCount} anomal{anomalyCount === 1 ? 'y' : 'ies'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onView(); }}
            className="text-[10px] text-purple-400 hover:text-purple-300 font-bold uppercase tracking-wider px-2 py-1 rounded hover:bg-purple-500/10 transition-all"
          >
            View
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="text-gray-600 hover:text-red-400 p-1 rounded hover:bg-red-500/10 transition-all"
          >
            <Trash2 size={14} />
          </button>
          {expanded ? <ChevronUp size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-500" />}
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-800/50 pt-3">
          <p className="text-xs text-gray-400 leading-relaxed">{report.summary}</p>
          {report.anomalies && report.anomalies.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {report.anomalies.map((a, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className={`w-1.5 h-1.5 rounded-full ${a.severity === 'critical' ? 'bg-red-400' : a.severity === 'warning' ? 'bg-amber-400' : 'bg-blue-400'
                    }`} />
                  <span className="text-gray-500">{a.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIInsights;
