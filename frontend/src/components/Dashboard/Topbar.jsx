"use client"
import { useState, useEffect, useRef } from 'react'
import API from '@/utils/api';
import { io } from 'socket.io-client';
import { deployOTA, getOTAHistory, getOTATemplates, deleteOTARecord } from '@/utils/dashboardAPI';
import {
  Terminal, Upload, FileCode, Play, Loader2, CheckCircle, XCircle,
  Clock, Trash2, RotateCcw, BookOpen, Zap, Wifi, AlertCircle, Filter
} from 'lucide-react';

const WebRepl = () => {
  // === TAB STATE ===
  const [activeTab, setActiveTab] = useState('terminal'); // 'terminal' | 'ota'

  // === TERMINAL STATE ===
  const [history, setHistory] = useState([
    { type: 'system', color: '#22d3ee', text: 'Sentinel Cloud Web REPL v2.4.1' },
    { type: 'info', color: '#4ade80', text: 'Type "help" for available commands.' },
    { type: 'out', color: '#94a3b8', text: '> Select a device to connect.' }
  ]);
  const [input, setInput] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [devices, setDevices] = useState([]);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const socketRef = useRef(null);

  // === OTA STATE ===
  const [filename, setFilename] = useState('main.py');
  const [version, setVersion] = useState('v1.0');
  const [otaDescription, setOtaDescription] = useState('');
  const [code, setCode] = useState('# Write your MicroPython code here\n# This will be deployed to the device via OTA\n\nimport time\n\nprint("Hello from Sentinel Cloud OTA!")\n');
  const [deploying, setDeploying] = useState(false);
  const [deployStatus, setDeployStatus] = useState(null);
  const [otaError, setOtaError] = useState('');
  const [otaHistory, setOtaHistory] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showHistory, setShowHistory] = useState(true);

  // Fetch devices
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await API.get('/devices');
        setDevices(response.data);
      } catch (err) {
        console.error("Failed to fetch devices:", err);
      }
    };
    fetchDevices();
  }, []);

  // Fetch templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const data = await getOTATemplates();
        if (data.success) setTemplates(data.templates);
      } catch (err) {
        console.error("Failed to fetch OTA templates", err);
      }
    };
    fetchTemplates();
  }, []);

  // Fetch OTA history when device changes
  useEffect(() => {
    if (deviceId) fetchOtaHistory();
  }, [deviceId]);

  // Initialize WebSockets
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5100');
    socketRef.current = socket;

    socket.on('connect', () => {
      setHistory(prev => [...prev, { type: 'system', color: '#4ade80', text: '> Connected to Sentinel Cloud WebSocket Server' }]);
    });

    socket.on('disconnect', () => {
      setHistory(prev => [...prev, { type: 'system', color: '#f87171', text: '> Disconnected from WebSocket Server' }]);
    });

    socket.on('terminal_output', (data) => {
      setHistory(prev => [...prev, {
        type: data.type || 'response',
        text: data.text,
        color: data.color || '#94a3b8'
      }]);
    });

    socket.on('terminal_output_raw', (data) => {
      if (data.deviceId === deviceId) {
        setHistory(prev => [...prev, {
          type: 'response',
          text: data.data.output,
          color: data.data.color || '#94a3b8'
        }]);
      }
    });

    // OTA status updates
    socket.on('ota_status_update', (data) => {
      setDeployStatus({
        status: data.status,
        message: data.message || `Deployment ${data.status}`
      });
      if (deviceId) fetchOtaHistory();
    });

    return () => {
      socket.disconnect();
    };
  }, [deviceId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [history]);

  const handleDeviceChange = (e) => {
    const newDeviceId = e.target.value;
    setDeviceId(newDeviceId);
    setDeployStatus(null);
    setOtaError('');
    if (newDeviceId && socketRef.current) {
      socketRef.current.emit('attach_device', { deviceId: newDeviceId });
    }
  };

  // === TERMINAL FUNCTIONS ===
  const executeCommand = async (commandText) => {
    const cmd = commandText.trim();
    if (!cmd) return;
    if (cmd.toLowerCase() === 'clear') {
      setHistory([]);
      setInput('');
      return;
    }
    setHistory(prev => [...prev, { type: 'user', text: `$ ${cmd}`, color: '#ffffff' }]);
    setInput('');
    if (!deviceId) {
      setHistory(prev => [...prev, { type: 'error', text: 'Error: Please select a device first', color: '#f87171' }]);
      return;
    }
    if (socketRef.current) {
      socketRef.current.emit('terminal_command', { deviceId, command: cmd });
    }
  };

  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      if (deviceId && socketRef.current) {
        socketRef.current.emit('update_code', { deviceId, filename: file.name, content });
        setHistory(prev => [...prev, { type: 'system', color: '#fbbf24', text: `> Uploading ${file.name} to device...` }]);
      } else {
        setHistory(prev => [...prev, { type: 'error', text: 'Error: Please select a device to upload code', color: '#f87171' }]);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // === OTA FUNCTIONS ===
  const fetchOtaHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await getOTAHistory(deviceId);
      if (data.success) setOtaHistory(data.deployments || []);
    } catch (err) {
      console.error("Failed to fetch OTA history", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleDeploy = async () => {
    if (!deviceId || !code.trim() || !filename.trim()) {
      setOtaError('Please select a device, enter a filename, and write some code');
      return;
    }
    setDeploying(true);
    setOtaError('');
    setDeployStatus({ status: 'pending', message: 'Initiating OTA deployment...' });

    try {
      const data = await deployOTA({
        deviceApiKey: deviceId,
        filename: filename.trim(),
        code,
        version,
        description: otaDescription
      });
      if (data.success) {
        const devName = devices.find(d => d.apiKey === deviceId)?.deviceName || 'device';
        setDeployStatus({ status: 'deployed', message: `Code pushed to ${devName}. Waiting for acknowledgment...` });
        // Also log in terminal
        setHistory(prev => [...prev, { type: 'system', color: '#fbbf24', text: `> [OTA] Deployed ${filename} (${version}) to ${devName}` }]);
        fetchOtaHistory();
      } else {
        setOtaError(data.message || 'Deployment failed');
        setDeployStatus(null);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'OTA deployment failed';
      setOtaError(msg);
      setDeployStatus({ status: 'failed', message: msg });
    } finally {
      setDeploying(false);
    }
  };

  const handleRedeploy = (dep) => {
    setCode(dep.code);
    setFilename(dep.filename);
    setVersion(dep.version);
    setOtaDescription(`Re-deploy of ${dep.filename} ${dep.version}`);
  };

  const handleDeleteRecord = async (id) => {
    try {
      await deleteOTARecord(id);
      setOtaHistory(prev => prev.filter(h => h._id !== id));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleLoadTemplate = (template) => {
    setCode(template.code);
    setFilename(template.filename);
    setOtaDescription(template.description);
    setShowTemplates(false);
  };

  const lineCount = code.split('\n').length;
  const fileSize = new Blob([code]).size;
  const selectedDeviceName = devices.find(d => d.apiKey === deviceId)?.deviceName || devices.find(d => d.apiKey === deviceId)?.name || '';

  return (
    <div className="bg-[#0b1120] min-h-screen p-4 text-slate-300 font-mono">
      <div className="max-w-6xl mx-auto">

        {/* ===== HEADER WITH TABS ===== */}
        <div className="rounded-t-2xl overflow-hidden border border-b-0 border-slate-700 bg-[#0d1117]">
          {/* Top bar */}
          <div className="bg-[#161b22] px-5 py-3 flex items-center justify-between border-b border-slate-700">
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
              </div>
              <span className="text-xs font-semibold text-slate-400 tracking-wider">
                admin@sentinel.cloud.io — {activeTab === 'terminal' ? 'WebREPL' : 'OTA Manager'}
              </span>
            </div>

            <div className="flex gap-3 items-center">
              <select
                value={deviceId}
                onChange={handleDeviceChange}
                className="bg-[#0d1117] border border-slate-700 text-slate-300 text-xs rounded-md px-2 py-1 outline-none focus:border-cyan-500"
              >
                <option value="">-- Select Device --</option>
                {devices.map(dev => (
                  <option key={dev._id || dev.apiKey} value={dev.apiKey || dev.id}>{dev.deviceName || dev.name || dev.apiKey}</option>
                ))}
              </select>

              {activeTab === 'terminal' && (
                <button
                  onClick={handleFileUploadClick}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-1.5 rounded-md flex items-center gap-2 transition"
                >
                  <Upload className="w-3 h-3" />
                  Upload .py
                </button>
              )}
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".py" className="hidden" />
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-[#0d1117] border-b border-slate-700">
            <button
              onClick={() => setActiveTab('terminal')}
              className={`flex items-center gap-2 px-6 py-2.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
                activeTab === 'terminal'
                  ? 'text-cyan-400 border-cyan-400 bg-cyan-500/5'
                  : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-slate-800/30'
              }`}
            >
              <Terminal size={14} />
              Terminal
            </button>
            <button
              onClick={() => setActiveTab('ota')}
              className={`flex items-center gap-2 px-6 py-2.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
                activeTab === 'ota'
                  ? 'text-amber-400 border-amber-400 bg-amber-500/5'
                  : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-slate-800/30'
              }`}
            >
              <Upload size={14} />
              OTA Manager
            </button>
          </div>
        </div>

        {/* ===== TERMINAL TAB ===== */}
        {activeTab === 'terminal' && (
          <div className="border border-t-0 border-slate-700 rounded-b-2xl overflow-hidden bg-[#0d1117]">
            <div className="relative">
              <div ref={scrollRef} className="h-[450px] p-6 overflow-y-auto custom-scrollbar text-[15px] leading-relaxed">
                {history.map((line, i) => (
                  <div key={i} className="mb-1 whitespace-pre-wrap transition-all duration-200" style={{ color: line.color }}>
                    {line.text}
                  </div>
                ))}
              </div>

              {/* Input Bar */}
              <div className="bg-[#0d1117] flex items-center px-6 w-full py-4 border-t border-slate-700">
                <span className="text-cyan-400 mr-2 font-bold">$</span>
                <input
                  className="bg-transparent border-none outline-none flex-1 text-white placeholder-slate-600 disabled:opacity-50"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && executeCommand(input)}
                  placeholder={deviceId ? "Type a Python command... (try: print('Hello World!'))" : "Please select a device to type command"}
                  autoFocus
                  disabled={!deviceId}
                />
                <button
                  onClick={() => executeCommand(input)}
                  className="bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg transition active:scale-95 disabled:opacity-50"
                  disabled={!deviceId}
                >
                  Run ↵
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== OTA MANAGER TAB ===== */}
        {activeTab === 'ota' && (
          <div className="border border-t-0 border-slate-700 rounded-b-2xl overflow-hidden bg-[#0d1117]">

            {/* Deploy Status Bar */}
            {deployStatus && (
              <div className={`flex items-center gap-3 px-5 py-3 border-b border-slate-800 ${
                deployStatus.status === 'acknowledged' ? 'bg-emerald-500/5' :
                deployStatus.status === 'failed' ? 'bg-red-500/5' :
                deployStatus.status === 'deployed' ? 'bg-blue-500/5' : 'bg-slate-800/30'
              }`}>
                {deployStatus.status === 'pending' && <Loader2 size={14} className="text-slate-400 animate-spin" />}
                {deployStatus.status === 'deployed' && <Wifi size={14} className="text-blue-400 animate-pulse" />}
                {deployStatus.status === 'acknowledged' && <CheckCircle size={14} className="text-emerald-400" />}
                {deployStatus.status === 'failed' && <XCircle size={14} className="text-red-400" />}
                <span className={`text-xs font-medium ${
                  deployStatus.status === 'acknowledged' ? 'text-emerald-300' :
                  deployStatus.status === 'failed' ? 'text-red-300' :
                  deployStatus.status === 'deployed' ? 'text-blue-300' : 'text-slate-400'
                }`}>{deployStatus.message}</span>
              </div>
            )}

            {/* Error */}
            {otaError && (
              <div className="flex items-center gap-2 px-5 py-2.5 bg-red-500/5 border-b border-red-500/20">
                <AlertCircle size={14} className="text-red-400" />
                <span className="text-xs text-red-300">{otaError}</span>
              </div>
            )}

            {/* OTA Controls Bar */}
            <div className="flex flex-wrap items-center gap-3 px-5 py-3 bg-[#141c2d] border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 uppercase font-bold">File:</span>
                <input
                  type="text"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  className="bg-[#0d1117] border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono w-28 outline-none focus:border-amber-500/50"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Ver:</span>
                <input
                  type="text"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  className="bg-[#0d1117] border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono w-16 outline-none focus:border-amber-500/50"
                />
              </div>
              <div className="flex items-center gap-2 flex-1 min-w-[150px]">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Notes:</span>
                <input
                  type="text"
                  value={otaDescription}
                  onChange={(e) => setOtaDescription(e.target.value)}
                  className="bg-[#0d1117] border border-slate-700 rounded px-2 py-1 text-xs text-slate-300 flex-1 outline-none focus:border-amber-500/50"
                  placeholder="Update notes..."
                />
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => setShowTemplates(!showTemplates)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all ${
                    showTemplates
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-amber-400 hover:border-amber-500/30'
                  }`}
                >
                  <BookOpen size={12} />
                  Templates
                </button>

                <button
                  onClick={handleDeploy}
                  disabled={deploying || !deviceId || !code.trim()}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded font-bold text-xs transition-all ${
                    deploying
                      ? 'bg-amber-500/20 text-amber-300 cursor-wait'
                      : 'bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-500 hover:to-orange-500 active:scale-95'
                  } disabled:opacity-40`}
                >
                  {deploying ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
                  {deploying ? 'Deploying...' : 'Deploy'}
                </button>
              </div>
            </div>

            {/* Template Library (Collapsible) */}
            {showTemplates && (
              <div className="px-5 py-3 bg-[#0a0f1a] border-b border-slate-800">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                  {templates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => handleLoadTemplate(template)}
                      className="p-2.5 bg-[#141c2d] border border-slate-800 rounded-lg text-left hover:border-amber-500/30 hover:bg-amber-500/5 transition-all group"
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <FileCode size={12} className="text-amber-400" />
                        <span className="text-[11px] font-bold text-white truncate">{template.name}</span>
                      </div>
                      <p className="text-[10px] text-slate-600 leading-tight truncate">{template.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Code Editor with Line Numbers */}
            <div className="flex">
              {/* Line Numbers */}
              <div className="bg-[#0a0f1a] px-3 py-4 text-right select-none border-r border-slate-800/50 min-w-[45px]">
                {Array.from({ length: lineCount }, (_, i) => (
                  <div key={i} className="text-[11px] text-slate-700 leading-[20px]">{i + 1}</div>
                ))}
              </div>
              {/* Textarea */}
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="flex-1 bg-transparent text-slate-300 font-mono text-[13px] leading-[20px] p-4 outline-none resize-none min-h-[300px]"
                spellCheck={false}
                placeholder="# Write your MicroPython code here..."
              />
            </div>

            {/* Editor Footer */}
            <div className="flex items-center justify-between px-5 py-2 bg-[#141c2d] border-t border-slate-800 text-[10px] text-slate-600">
              <div className="flex items-center gap-4">
                <span>MicroPython</span>
                <span>{lineCount} lines</span>
                <span>{fileSize} bytes</span>
                <span>Target: {selectedDeviceName || 'None'}</span>
              </div>
              <span>MQTT over Wi-Fi</span>
            </div>
          </div>
        )}

        {/* ===== QUICK ACTIONS (Terminal) / HISTORY (OTA) ===== */}
        {activeTab === 'terminal' && (
          <div className="mt-8 px-4">
            <p className="text-xs uppercase tracking-widest font-bold text-slate-500 mb-4">Quick actions:</p>
            <div className="flex flex-wrap gap-4">
              {[
                { label: 'Sys Info', cmd: 'import sys; print(sys.implementation)' },
                { label: 'List Files', cmd: 'import os; print(os.listdir())' },
                { label: 'Free RAM', cmd: 'import gc; print("Free:", gc.mem_free(), "bytes")' },
                { label: 'Clear', cmd: 'clear' }
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => executeCommand(item.cmd)}
                  className="bg-[#1c2128] hover:bg-[#2d333b] hover:border-cyan-500/50 w-[180px] border border-slate-700 text-cyan-400 px-4 py-3 rounded-xl text-sm font-medium transition-all active:scale-95 shadow-md"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'ota' && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4 px-1">
              <p className="text-xs uppercase tracking-widest font-bold text-slate-500 flex items-center gap-2">
                <Clock size={14} />
                Deployment History
                {otaHistory.length > 0 && (
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full normal-case tracking-normal">{otaHistory.length}</span>
                )}
              </p>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="text-[10px] text-slate-500 hover:text-amber-400 font-bold uppercase tracking-wider transition-all"
              >
                {showHistory ? 'Hide' : 'Show'}
              </button>
            </div>

            {showHistory && (
              <div className="bg-[#0d1117] border border-slate-700 rounded-2xl overflow-hidden">
                {loadingHistory ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 size={18} className="text-slate-600 animate-spin" />
                  </div>
                ) : otaHistory.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-[#141c2d] text-[10px] text-slate-500 font-black uppercase tracking-[0.1em]">
                        <tr>
                          <th className="px-4 py-2.5">File</th>
                          <th className="px-4 py-2.5">Ver</th>
                          <th className="px-4 py-2.5">Size</th>
                          <th className="px-4 py-2.5">Status</th>
                          <th className="px-4 py-2.5">Time</th>
                          <th className="px-4 py-2.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50 text-xs">
                        {otaHistory.map(dep => (
                          <tr key={dep._id} className="hover:bg-slate-800/20 transition-all">
                            <td className="px-4 py-2.5">
                              <span className="text-white font-mono flex items-center gap-1.5">
                                <FileCode size={12} className="text-amber-400" />
                                {dep.filename}
                              </span>
                            </td>
                            <td className="px-4 py-2.5">
                              <span className="text-slate-400 font-mono bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">{dep.version}</span>
                            </td>
                            <td className="px-4 py-2.5 text-slate-500">{dep.fileSize}B</td>
                            <td className="px-4 py-2.5">
                              <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full border ${
                                dep.status === 'acknowledged' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                dep.status === 'failed' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                dep.status === 'deployed' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                'bg-slate-500/10 text-slate-400 border-slate-500/20'
                              }`}>
                                {dep.status === 'acknowledged' && <CheckCircle size={10} />}
                                {dep.status === 'failed' && <XCircle size={10} />}
                                {dep.status === 'deployed' && <Wifi size={10} />}
                                {dep.status === 'pending' && <Clock size={10} />}
                                {dep.status}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-slate-600 text-[10px]">
                              {new Date(dep.deployedAt).toLocaleString()}
                            </td>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-1 justify-end">
                                <button
                                  onClick={() => handleRedeploy(dep)}
                                  className="p-1 text-slate-600 hover:text-amber-400 rounded hover:bg-amber-500/10 transition-all"
                                  title="Re-deploy"
                                >
                                  <RotateCcw size={12} />
                                </button>
                                <button
                                  onClick={() => handleDeleteRecord(dep._id)}
                                  className="p-1 text-slate-600 hover:text-red-400 rounded hover:bg-red-500/10 transition-all"
                                  title="Delete"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-slate-600">
                    <Upload size={28} className="mb-2 text-slate-700" />
                    <p className="text-xs text-slate-500">No deployments yet</p>
                    <p className="text-[10px] text-slate-600 mt-0.5">Deploy code using the editor above</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WebRepl;