"use client";
import API from '@/utils/api';
import React, { useState, useEffect } from 'react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDraggable,
  useDroppable
} from '@dnd-kit/core';
import { DraggableWidget } from './DraggableWidget';
import io from 'socket.io-client';
import { useParams } from 'next/navigation';

const WIDGET_LIBRARY = [
  { type: 'switch', title: 'Relay Switch', defaultSize: { width: 220, height: 160 }, defaultData: { status: true } },
  { type: 'gauge', title: 'Gauge Meter', defaultSize: { width: 280, height: 280 }, defaultData: { value: 72, max: 100, unit: '°C' } },
  { type: 'text', title: 'Status Text', defaultSize: { width: 250, height: 150 }, defaultData: { value: 'SYSTEM OK', color: 'text-emerald-400' } },
  { type: 'slider', title: 'Controller', defaultSize: { width: 350, height: 180 }, defaultData: { value: 45, min: 0, max: 100 } },
  { type: 'lineChart', title: 'Power Chart', defaultSize: { width: 450, height: 300 }, defaultData: { current: 84.2 } },
  { type: 'actionButton', title: 'Trigger Button', defaultSize: { width: 200, height: 160 }, defaultData: { label: 'PULSE' } },
  { type: 'numericInput', title: 'Value Entry', defaultSize: { width: 200, height: 150 }, defaultData: { value: 20 } },
  { type: 'colorPicker', title: 'Color Hub', defaultSize: { width: 280, height: 220 }, defaultData: { color: '#06b6d4' } },
  { type: 'terminal', title: 'Device Console', defaultSize: { width: 500, height: 350 }, defaultData: { logs: [] } },
];

const ICON_LIST = ['Activity', 'Thermometer', 'Droplets', 'Zap', 'Cpu', 'Wind', 'Sun', 'Battery', 'Flame', 'Waves', 'Wifi', 'Lightbulb', 'Power', 'Settings', 'Bell'];
const THEME_COLORS = [
  { name: 'Cyan', hex: '#06b6d4' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Rose', hex: '#f43f5e' },
  { name: 'Amber', hex: '#f59e0b' },
  { name: 'Violet', hex: '#8b5cf6' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'White', hex: '#ffffff' }
];

const getDynamicColor = (val, max, customColor = null) => {
  if (customColor) return { stroke: customColor, shadow: `${customColor}99` };
  const percent = val / max;
  if (percent > 0.8) return { stroke: '#f43f5e', shadow: 'rgba(244,63,94,0.6)' };
  if (percent > 0.5) return { stroke: '#eab308', shadow: 'rgba(234,179,8,0.6)' };
  return { stroke: '#06b6d4', shadow: 'rgba(6,182,212,0.6)' };
};

const WidgetStyles = () => (
  <style dangerouslySetInnerHTML={{
    __html: `
    .widget-box { container-type: size; width: 100%; height: 100%; }
    
    .fluid-slider::-webkit-slider-thumb {
      -webkit-appearance: none; appearance: none;
      width: clamp(32px, 15cqmin, 50px); 
      height: clamp(32px, 15cqmin, 50px);
      border-radius: 50%; background: var(--thumb-color, #06b6d4); cursor: pointer;
      box-shadow: 0 0 15px var(--thumb-shadow, rgba(6,182,212,0.8)); border: 3px solid #fff;
      transition: background 0.3s, box-shadow 0.3s, transform 0.1s;
    }
    .fluid-slider::-webkit-slider-thumb:hover { transform: scale(1.15); }
    
    .fluid-slider::-moz-range-thumb {
      width: clamp(32px, 15cqmin, 50px); 
      height: clamp(32px, 15cqmin, 50px);
      border-radius: 50%; background: var(--thumb-color, #06b6d4); cursor: pointer;
      box-shadow: 0 0 15px var(--thumb-shadow, rgba(6,182,212,0.8)); border: 3px solid #fff;
      transition: background 0.3s, box-shadow 0.3s, transform 0.1s;
    }
    .fluid-slider::-moz-range-thumb:hover { transform: scale(1.15); }

    .animated-grid {
      background-size: 20px 20px;
      background-image: linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
      animation: panGrid 20s linear infinite;
    }
    @keyframes panGrid { 0% { background-position: 0 0; } 100% { background-position: -100px 0; } }
  `}} />
);

const renderWidgetUI = (widget, isEditing = false, isPreview = false, updateData = null, readOnly = false) => {
  const isInteractive = !isEditing && !isPreview && !readOnly;
  const data = widget.data || widget.defaultData;
  const custom = widget.customSettings || {};

  if (isPreview) {
    switch (widget.type) {
      case 'switch': return <div className="w-10 h-5 bg-slate-800 rounded-full border border-slate-600 flex items-center px-1"><div className="w-3 h-3 bg-cyan-500 rounded-full translate-x-4 shadow-[0_0_5px_cyan]"></div></div>;
      case 'gauge': return <svg className="h-full w-auto" viewBox="0 0 36 36"><circle cx="18" cy="18" r="15" fill="none" stroke="#1e293b" strokeWidth="4" /><circle cx="18" cy="18" r="15" fill="none" stroke="#06b6d4" strokeWidth="4" strokeDasharray="94.2" strokeDashoffset="24" /></svg>;
      case 'text': return <span className="text-emerald-400 font-black tracking-widest text-sm">SYS OK</span>;
      case 'slider': return <div className="w-3/4 h-2 bg-slate-800 rounded-full border border-slate-600"><div className="w-2/3 h-full bg-cyan-500 rounded-full relative"><div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full border-2 border-cyan-500"></div></div></div>;
      case 'lineChart': return <svg className="w-full h-full p-2" viewBox="0 0 100 50" preserveAspectRatio="none"><path d="M0,40 Q25,10 50,30 T100,20" fill="none" stroke="#06b6d4" strokeWidth="4" className="drop-shadow-[0_0_5px_cyan]" /></svg>;
      case 'terminal': return <div className="w-full h-full bg-slate-900 border border-slate-700 rounded p-2 flex flex-col font-mono text-[8px]"><div className="text-cyan-500 mb-1">PRO_SENTINEL_v2.0</div><div className="text-slate-500"> system ready...</div><div className="text-slate-500"> waiting_for_command_</div></div>;
      default: return null;
    }
  }

  const pointerClass = isInteractive ? 'pointer-events-auto' : 'pointer-events-none';
  const themeColor = custom.color || '#06b6d4';

  switch (widget.type) {
    case 'switch':
      return (
        <div className={`widget-box flex flex-col items-center justify-center ${pointerClass}`}>
          <label className={`relative flex items-center justify-center ${isInteractive ? 'cursor-pointer group' : 'cursor-default'}`}>
            <input type="checkbox" className="sr-only" checked={data.status} onChange={(e) => isInteractive && updateData(widget.id, { ...data, status: e.target.checked }, true)} disabled={!isInteractive} />
            <div style={{ width: 'clamp(80px, 45cqmin, 160px)', height: 'clamp(40px, 22cqmin, 80px)' }} className={`relative rounded-full border-2 transition-all duration-300 ${data.status ? 'bg-slate-900 border-cyan-500/50' : 'bg-slate-800 border-slate-700 shadow-inner'}`} style={{ borderColor: data.status ? themeColor : undefined }}>
              <div style={{
                width: 'clamp(32px, 18cqmin, 68px)', height: 'clamp(32px, 18cqmin, 68px)',
                left: data.status ? 'calc(100% - clamp(32px, 18cqmin, 68px) - 2px)' : '2px',
                top: '50%', transform: 'translateY(-50%)',
                backgroundColor: data.status ? themeColor : '#64748b',
                boxShadow: data.status ? `0 0 15px ${themeColor}, inset 0 0 5px #fff` : 'inset 0 -2px 5px rgba(0,0,0,0.5)'
              }} className="absolute transition-all duration-400 ease-spring rounded-full"></div>
            </div>
          </label>
          <span style={{ fontSize: 'clamp(0.7rem, 6cqmin, 1.5rem)', marginTop: 'clamp(10px, 5cqmin, 24px)', color: data.status ? themeColor : undefined }} className={`font-bold uppercase tracking-widest transition-colors duration-300 ${data.status ? '' : 'text-slate-500'}`}>
            {data.status ? (custom.title || 'System Online') : 'Disabled'}
          </span>
        </div>
      );

    case 'gauge':
      const r = 15, c = 2 * Math.PI * r, offset = c - (data.value / (data.max || 100)) * c;
      const colors = getDynamicColor(data.value, data.max || 100, custom.color);
      return (
        <div className={`widget-box flex flex-col items-center justify-center p-[2cqmin] ${pointerClass}`}>
          <div style={{ width: 'clamp(120px, 85cqmin, 300px)', height: 'clamp(120px, 85cqmin, 300px)' }} className="relative flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90 drop-shadow-xl" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15" fill="none" className="stroke-slate-800/80" strokeWidth="4" />
              <circle cx="18" cy="18" r="15" fill="none" stroke={colors.stroke} style={{ filter: `drop-shadow(0 0 8px ${colors.shadow})` }} className="transition-all duration-700 ease-out" strokeWidth="3.5" strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span style={{ fontSize: 'clamp(2.5rem, 24cqmin, 6rem)' }} className="font-black text-white leading-none tracking-tighter drop-shadow-lg">{data.value}</span>
              <span style={{ fontSize: 'clamp(0.7rem, 8cqmin, 1.5rem)', color: colors.stroke }} className="font-bold uppercase tracking-widest mt-1 transition-colors duration-700">{custom.unit || data.unit}</span>
            </div>
          </div>
        </div>
      );

    case 'text':
      return (
        <div className="widget-box flex items-center justify-center p-4">
          <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-4 shadow-inner flex items-center justify-center w-full h-full">
            <span style={{ fontSize: 'clamp(1.5rem, 16cqmin, 5rem)', color: themeColor }} className={`font-black tracking-widest animate-pulse truncate drop-shadow-[0_0_15px_rgba(52,211,153,0.4)]`}>{data.value}</span>
          </div>
        </div>
      );

    case 'slider':
      const sliderColors = getDynamicColor(data.value, data.max || 100, custom.color);
      return (
        <div className="widget-box flex flex-col items-center justify-center px-[8cqmin]" style={{ '--thumb-color': sliderColors.stroke, '--thumb-shadow': sliderColors.shadow }}>
          <div className="flex items-baseline mb-[4cqmin]">
            <span style={{ fontSize: 'clamp(3rem, 25cqmin, 7rem)', color: sliderColors.stroke }} className="font-black leading-none tracking-tighter drop-shadow-md transition-colors duration-300">{data.value}</span>
            <span style={{ fontSize: 'clamp(1.2rem, 10cqmin, 2.5rem)' }} className="text-slate-500 ml-2 font-bold">{custom.unit || '%'}</span>
          </div>
          <input type="range" min={data.min || 0} max={data.max || 100} value={data.value} onChange={(e) => isInteractive && updateData(widget.id, { ...data, value: parseInt(e.target.value) }, true)} className={`w-full fluid-slider bg-slate-900 border-2 border-slate-700 rounded-full appearance-none outline-none shadow-inner ${isInteractive ? 'cursor-pointer hover:border-slate-500 transition-colors' : ''}`} style={{ height: 'clamp(10px, 4cqmin, 24px)' }} />
        </div>
      );

    case 'actionButton':
      return (
        <div className={`widget-box flex items-center justify-center p-4 ${pointerClass}`}>
          <button
            onClick={() => isInteractive && updateData(widget.id, { ...data }, true)}
            style={{ backgroundColor: themeColor, boxShadow: `0 10px 30px ${themeColor}66` }}
            className="w-full h-full rounded-2xl text-slate-900 font-black tracking-widest uppercase transition-all active:scale-95 flex flex-col items-center justify-center gap-2"
          >
            <span style={{ fontSize: 'clamp(1rem, 8cqmin, 2rem)' }}>{data.label || 'TRIGGER'}</span>
            <div className="w-8 h-1 bg-white/40 rounded-full"></div>
          </button>
        </div>
      );

    case 'numericInput':
      return (
        <div className={`widget-box flex flex-col items-center justify-center p-4 ${pointerClass}`}>
          <div className="relative w-full max-w-[180px]">
            <input
              type="number"
              value={data.value}
              onChange={(e) => isInteractive && updateData(widget.id, { ...data, value: e.target.value }, true)}
              className="w-full bg-slate-900 border-2 border-slate-700 rounded-2xl px-4 py-3 text-center text-2xl font-black text-cyan-400 outline-none focus:border-cyan-500 transition-all shadow-inner"
            />
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-800 px-2 py-0.5 rounded text-[10px] font-bold text-slate-500 uppercase tracking-widest border border-slate-700">VALUE</div>
          </div>
        </div>
      );

    case 'colorPicker':
      return (
        <div className={`widget-box flex flex-col items-center justify-center p-4 ${pointerClass}`}>
          <div className="bg-slate-900/50 p-4 rounded-3xl border border-slate-700/50 shadow-2xl flex flex-col items-center gap-4">
            <input
              type="color"
              value={data.color || themeColor}
              onChange={(e) => isInteractive && updateData(widget.id, { ...data, color: e.target.value }, true)}
              className="w-20 h-20 rounded-full overflow-hidden cursor-pointer border-4 border-white shadow-xl hover:scale-110 transition-transform"
            />
            <div className="font-mono text-xs font-bold text-slate-400 uppercase tracking-widest">{data.color || themeColor}</div>
          </div>
        </div>
      );

    case 'lineChart':
      const chartColor = custom.color || '#06b6d4';
      return (
        <div className={`widget-box flex flex-col relative p-4 sm:p-6 ${pointerClass} overflow-hidden rounded-xl bg-slate-900/30`}>
          <div className="absolute inset-0 animated-grid opacity-30 pointer-events-none z-0"></div>

          <div className="flex justify-between items-end mb-2 shrink-0 z-20">
            <span style={{ fontSize: 'clamp(1.5rem, 12cqmin, 3.5rem)' }} className="text-white font-black tracking-tight drop-shadow-md flex items-baseline gap-1">
              {data.current} <span style={{ fontSize: 'clamp(0.8rem, 6cqmin, 2rem)', color: chartColor }} className="font-bold">{custom.unit || 'units'}</span>
            </span>
            <span style={{ fontSize: 'clamp(0.6rem, 5cqmin, 1rem)', color: chartColor }} className="font-bold bg-white/5 px-2 py-1 rounded-md border border-white/10 shadow-[0_0_10px_rgba(6,182,212,0.1)] flex items-center gap-1.5 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: chartColor }}></span> LIVE
            </span>
          </div>

          <div className="flex-1 w-full relative mt-2 min-h-0 z-10">
            <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
              <defs>
                <linearGradient id={`chartGrad-${widget.id}`} x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor={chartColor} stopOpacity="0.6" /><stop offset="100%" stopColor={chartColor} stopOpacity="0.0" /></linearGradient>
              </defs>
              <path d="M 0 80 C 20 60, 40 90, 60 50 C 80 10, 90 40, 100 20 L 100 100 L 0 100 Z" fill={`url(#chartGrad-${widget.id})`} />
              <path d="M 0 80 C 20 60, 40 90, 60 50 C 80 10, 90 40, 100 20" fill="none" stroke={chartColor} strokeWidth="4" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 10px ${chartColor})` }} />
            </svg>
          </div>
          <div className="flex justify-between mt-3 font-mono font-bold uppercase tracking-widest shrink-0 text-slate-500 z-20" style={{ fontSize: 'clamp(0.6rem, 4.5cqmin, 1.2rem)' }}>
            <span>08:00</span><span>10:00</span><span>12:00</span><span style={{ color: chartColor }}>Now</span>
          </div>
        </div>
      );
    case 'terminal':
      const logs = data.logs || [];
      return (
        <div className={`widget-box flex flex-col bg-slate-900/80 border-2 border-slate-700 rounded-2xl overflow-hidden font-mono ${pointerClass}`}>
          {/* Terminal Header */}
          <div className="bg-slate-800 px-4 py-2 flex items-center justify-between border-b border-slate-700 shrink-0">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
            </div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">REPL v1.0</span>
          </div>

          {/* Log Area */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-1 custom-scrollbar scroll-smooth" id={`terminal-logs-${widget.id}`}>
            <div className="text-cyan-500 text-[10px] mb-2 font-black tracking-widest">--- SENTINEL REMOTE REPL ---</div>
            {logs.map((log, idx) => (
              <div key={idx} className="text-[12px] leading-snug break-all" style={{ color: log.color || '#94a3b8' }}>
                <span className="opacity-50 mr-2">[{log.time}]</span>
                {log.text}
              </div>
            ))}
            {logs.length === 0 && <div className="text-slate-600 text-[10px] italic">Waiting for hardware response...</div>}
          </div>

          {/* Input Area */}
          <div className="p-3 bg-slate-900 border-t border-slate-800 shrink-0">
            <div className="flex items-center gap-2 bg-slate-950/50 rounded-lg px-3 py-2 border border-slate-800 focus-within:border-cyan-500/50 transition-all">
              <span className="text-cyan-500 font-bold"></span>
              <input
                type="text"
                placeholder="Type command..."
                className="bg-transparent border-none outline-none text-[13px] text-slate-200 w-full placeholder:text-slate-700"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    const cmd = e.target.value.trim();
                    // Send to backend
                    API.post('/terminal', {
                      command: cmd,
                      deviceId: widget.mapping?.feedId?.split('/')[0]
                    }, {
                      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    }).then(res => {
                      if (res.data.output === "CLEAR_TERMINAL") {
                        updateData(widget.id, { ...data, logs: [] });
                      } else {
                        // Optimistically show command line
                        updateData(widget.id, {
                          ...data,
                          logs: [...logs, { text: `> ${cmd}`, time: new Date().toLocaleTimeString(), color: '#60a5fa' }]
                        });
                      }
                    });
                    e.target.value = '';
                  }
                }}
              />
            </div>
          </div>
        </div>
      );
    default: return null;
  }
};

const ControlBoard = ({ boardId: propBoardId, readOnly = false }) => {
  const params = useParams() || {};
  const boardId = propBoardId || params.id;

  const [isEditing, setIsEditing] = useState(false);
  const [activeDragItem, setActiveDragItem] = useState(null);
  const [canvasWidgets, setCanvasWidgets] = useState([]);
  const [boardInfo, setBoardInfo] = useState({ name: 'Loading...', description: '' });
  const [devices, setDevices] = useState([]);
  const [selectedWidgetForSettings, setSelectedWidgetForSettings] = useState(null);
  const [isOwner, setIsOwner] = useState(false);

  // Share modal state
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareLoading, setShareLoading] = useState(false);
  const [shareMsg, setShareMsg] = useState(null); // { type: 'success'|'error', text: string }
  const [sharedUsers, setSharedUsers] = useState([]);
  const [sharedUsersLoading, setSharedUsersLoading] = useState(false);

  // Trigger system state
  const [showTriggersModal, setShowTriggersModal] = useState(false);
  const [triggers, setTriggers] = useState([]);
  const [triggerLoading, setTriggerLoading] = useState(false);
  const [newTrigger, setNewTrigger] = useState({ deviceId: '', feed: 'temperature', condition: 'greater_than', threshold: 0, alertType: 'warning' });


  const { setNodeRef: setCanvasDropRef } = useDroppable({ id: 'main-canvas' });
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  // 1. Fetch Board Layout & Devices
  useEffect(() => {
    const FetchInitialData = async () => {
      const token = localStorage.getItem('token');
      if (!token || !boardId) return;

      try {
        // Fetch specific board
        const boardRes = await API.get(`/dashboard/${boardId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (boardRes.data.success) {
          setCanvasWidgets(boardRes.data.board.widgets || []);
          setBoardInfo({ name: boardRes.data.board.name, description: boardRes.data.board.description });
          setIsOwner(boardRes.data.isOwner ?? true);
        }

        // Fetch user devices for the mapping dropdown
        const devRes = await API.get('/iot/monitor-all', {
          headers: { Authorization: `Bearer ${token}` }
        });
        // The endpoint returns a direct array, not wrapped in {success, devices}
        if (Array.isArray(devRes.data)) {
          setDevices(devRes.data);
        }
      } catch (error) {
        console.error("Dashboard load error:", error);
      }
    };
    FetchInitialData();
  }, [boardId]);

  // 2. Socket.io Live Updates
  useEffect(() => {
    if (!boardId) return;

    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
      transports: ['websocket'],
      auth: { token: localStorage.getItem('token') }
    });

    socket.on('telemetry_update', (newData) => {
      setCanvasWidgets(prev => prev.map(w => {
        // Feed ID format: "device_id/field_name"
        if (w.mapping && w.mapping.feedId) {
          const [deviceId, field] = w.mapping.feedId.split('/');

          if (deviceId === newData.deviceId) {
            const newValue = newData.payload[field];

            if (newValue !== undefined) {
              if (w.type === 'gauge' || w.type === 'slider') {
                return { ...w, data: { ...w.data, value: newValue } };
              }
              if (w.type === 'text') {
                return { ...w, data: { ...w.data, value: newValue } };
              }
              if (w.type === 'lineChart') {
                return { ...w, data: { ...w.data, current: newValue } };
              }
            }
          }
        }
        return w;
      }));
    });

    socket.on('repl_output', (res) => {
      setCanvasWidgets(prev => prev.map(w => {
        if (w.type === 'terminal' && w.mapping?.feedId?.startsWith(res.deviceId)) {
          const currentLogs = w.data?.logs || [];
          const newLog = {
            text: res.output,
            time: new Date().toLocaleTimeString(),
            color: res.color
          };
          return {
            ...w,
            data: {
              ...w.data,
              logs: [...currentLogs, newLog].slice(-100) // Keep last 100 lines
            }
          };
        }
        return w;
      }));
    });

    return () => socket.disconnect();
  }, [boardId]);

  const dispatchCommand = async (widget, newValue) => {
    if (!widget.mapping?.feedId) return;
    console.log("🔍 Dispatching for Feed:", widget.mapping.feedId);
    try {
      const [deviceId, field] = widget.mapping.feedId.split('/');
      // Mapping from human-friendly feedId to DB IDs? 
      const deviceObj = devices.find(d => d.deviceId === deviceId);
      if (!deviceObj) {
        console.warn(`⚠️ Device [${deviceId}] not found in dashboard state. Check your Feed Identifier spelling!`);
        return;
      }

      const token = localStorage.getItem('token');
      await API.post(`/iot/command`, {
        deviceId: deviceObj._id,
        field,
        value: newValue
      }, { headers: { Authorization: `Bearer ${token}` } });

      console.log(`🚀 Command Dispatch Triggered: ${field} -> ${newValue}`);
    } catch (e) {
      console.error("Command Dispatch Failed", e);
    }
  };

  const updateWidgetData = (id, newData, forceCommand = false) => {
    setCanvasWidgets(prev => prev.map(w => {
      if (w.id === id) {
        // Trigger MQTT command if interactive
        if (forceCommand) {
          // Determine what exactly changed
          const widgetType = w.type;
          let valToDispatch = null;
          if (widgetType === 'switch') valToDispatch = newData.status;
          if (widgetType === 'slider' || widgetType === 'numericInput') valToDispatch = newData.value;
          if (widgetType === 'colorPicker') valToDispatch = newData.color;
          if (widgetType === 'actionButton') valToDispatch = true; // Pulse trigger

          if (valToDispatch !== null) dispatchCommand(w, valToDispatch);
        }
        return { ...w, data: newData };
      }
      return w;
    }));
  };

  const saveDashboardToDB = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !boardId) return;

      const response = await API.put(`/dashboard/${boardId}/layout`,
        { widgets: canvasWidgets, name: boardInfo.name },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert("Board updated successfully!");
        setIsEditing(false);
      }
    } catch (error) {
      alert("Saving failed: " + (error.response?.data?.message || "Error"));
    }
  };

  const fetchSharedUsers = async () => {
    setSharedUsersLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await API.get(`/dashboard/${boardId}/shared-users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) setSharedUsers(res.data.sharedUsers);
    } catch (e) {
      console.error('Failed to fetch shared users', e);
    } finally {
      setSharedUsersLoading(false);
    }
  };

  const handleShareWithUser = async () => {
    if (!shareEmail.trim()) return;
    setShareLoading(true);
    setShareMsg(null);
    try {
      const token = localStorage.getItem('token');
      const res = await API.post(`/dashboard/${boardId}/share-with-user`,
        { email: shareEmail.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShareMsg({ type: 'success', text: res.data.message });
      setShareEmail('');
      fetchSharedUsers();
    } catch (e) {
      setShareMsg({ type: 'error', text: e.response?.data?.message || 'Sharing failed' });
    } finally {
      setShareLoading(false);
    }
  };

  const handleRevokeUser = async (email) => {
    try {
      const token = localStorage.getItem('token');
      await API.delete(`/dashboard/${boardId}/revoke-user`,
        { data: { email }, headers: { Authorization: `Bearer ${token}` } }
      );
      fetchSharedUsers();
    } catch (e) {
      alert('Revoke failed: ' + (e.response?.data?.message || 'Error'));
    }
  };

  const fetchTriggers = async () => {
    setTriggerLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await API.get('/triggers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) setTriggers(res.data.data);
    } catch (e) {
      console.error('Failed to fetch triggers', e);
    } finally {
      setTriggerLoading(false);
    }
  };

  const handleCreateTrigger = async () => {
    if (!newTrigger.deviceId || !newTrigger.feed) {
        alert("Please select a device and feed");
        return;
    }
    try {
      const token = localStorage.getItem('token');
      await API.post('/triggers', newTrigger, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTriggers();
      setNewTrigger({ ...newTrigger, threshold: 0 });
    } catch (e) {
      alert('Failed to create trigger');
    }
  };

  const handleDeleteTrigger = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await API.delete(`/triggers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTriggers();
    } catch (e) {
      alert('Failed to delete trigger');
    }
  };

  const handleDragStart = (e) => setActiveDragItem(e.active);

  // 🌟 THE BULLETPROOF SNAP-BACK FIX 🌟
  const handleDragEnd = (e) => {
    setActiveDragItem(null);
    const { active } = e;

    if (!active) return;

    const canvasElement = document.getElementById('main-canvas');
    if (!canvasElement) return;

    const canvasRect = canvasElement.getBoundingClientRect();
    const translated = active.rect.current.translated;

    // Agar widget hawa mein hai hi nahi, toh return kar jao
    if (!translated) return;

    // EXACT PIXEL CALCULATION: Jaha mouse chhoda hai, waha lock karo
    const dropX = translated.left - canvasRect.left + canvasElement.scrollLeft;
    const dropY = translated.top - canvasRect.top + canvasElement.scrollTop;

    if (active.data.current?.type === 'canvas-widget') {
      // ✅ FIX: Delta hata diya hai, ab purane widgets bhi absolute location par lock honge
      setCanvasWidgets(prev => prev.map(w => {
        if (w.id === active.id) {
          return { ...w, position: { x: Math.max(0, dropX), y: Math.max(0, dropY) } };
        }
        return w;
      }));
    }
    else if (active.data.current?.type === 'template') {
      // Naye widgets ke liye bhi absolute drop location
      const template = active.data.current.templateData;
      setCanvasWidgets(prev => [
        ...prev,
        {
          id: `w_${Date.now()}`,
          type: template.type,
          title: template.title,
          size: template.defaultSize,
          position: { x: Math.max(0, dropX), y: Math.max(0, dropY) },
          data: { ...template.defaultData }
        }
      ]);
    }
  };

  const removeWidget = (id) => setCanvasWidgets(prev => prev.filter(w => w.id !== id));
  const resizeWidget = (id, newSize) => setCanvasWidgets(prev => prev.map(w => w.id === id ? { ...w, size: newSize } : w));

  return (
    <div className="w-full h-full flex flex-col space-y-6 relative">
      <WidgetStyles />

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gradient-to-r from-[#0F172A] to-[#1e293b] p-5 rounded-2xl border border-slate-700/50 shadow-lg z-20">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <button onClick={() => window.location.href = '/dashboard/control-board'} className="text-slate-500 hover:text-white transition-colors">←</button>
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight uppercase">{boardInfo.name}</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
            <p className="text-cyan-500/80 font-bold text-[10px] uppercase tracking-widest">Live Dynamic Workspace</p>
          </div>
        </div>
        {!readOnly && (
          <div className="flex items-center gap-5 mt-4 sm:mt-0">
            <div className={`flex items-center gap-3 px-5 py-2.5 rounded-xl border-2 transition-colors ${isEditing ? 'bg-cyan-900/30 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.2)]' : 'bg-[#111827] border-slate-700'}`}>
              <span className={`text-xs font-bold tracking-widest ${isEditing ? 'text-cyan-400' : 'text-slate-400'}`}>BUILD MODE</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={isEditing} onChange={() => setIsEditing(!isEditing)} />
                <div className="w-12 h-6 bg-slate-800 border border-slate-600 rounded-full peer peer-checked:after:translate-x-6 peer-checked:bg-cyan-500 peer-checked:border-cyan-400 after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-4 after:w-4 transition-all"></div>
              </label>
            </div>
            <div className="flex gap-3">
              {isOwner && (
                <button
                  onClick={() => { setShowShareModal(true); setShareMsg(null); fetchSharedUsers(); }}
                  className="bg-slate-800 text-cyan-400 border border-slate-700 px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-700 transition-all flex items-center gap-2 uppercase tracking-widest"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                  Share Board
                </button>
              )}
              {isOwner && (
                <button
                  onClick={() => { setShowTriggersModal(true); fetchTriggers(); }}
                  className="bg-slate-800 text-amber-400 border border-slate-700 px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-700 transition-all flex items-center gap-2 uppercase tracking-widest"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                  Alerts
                </button>
              )}
              {isEditing && (
                <button onClick={saveDashboardToDB} className="bg-cyan-500 text-slate-900 px-6 py-2.5 rounded-xl font-bold text-xs hover:scale-105 transition-all tracking-widest shadow-[0_0_20px_rgba(6,182,212,0.4)] uppercase">Push Updates</button>
              )}
            </div>
          </div>
        )}
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-6 min-h-[750px] overflow-hidden">

          {/* SIDEBAR */}
          {isEditing && (
            <div className="w-64 bg-[#0F172A]/90 backdrop-blur-md border border-slate-700/50 rounded-2xl p-5 flex flex-col shadow-2xl z-20 overflow-y-auto">
              <h3 className="text-slate-400 font-bold mb-4 uppercase tracking-widest text-[10px] border-b border-slate-800 pb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                Component Library
              </h3>
              <div className="space-y-4">
                {WIDGET_LIBRARY.map(t => <DraggableSidebarItem key={t.type} template={t} />)}
              </div>
            </div>
          )}

          {/* MAIN CANVAS */}
          <div
            id="main-canvas"
            ref={setCanvasDropRef}
            className={`flex-1 relative overflow-auto bg-[#090e17] rounded-2xl shadow-inner ${isEditing ? 'border-2 border-dashed border-cyan-800/40' : 'border border-slate-800/30'}`}
          >
            {isEditing && <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(#06b6d4 1.5px, transparent 1.5px)', backgroundSize: '40px 40px' }}></div>}

            {canvasWidgets.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 pointer-events-none">
                <div className="w-24 h-24 bg-slate-800/30 rounded-full flex items-center justify-center mb-6 border border-slate-700/50">
                  <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                </div>
                <p className="text-xl font-bold text-slate-400 tracking-tight">Empty Workspace</p>
                {isEditing && <p className="text-xs mt-2 text-cyan-500/80 font-medium uppercase tracking-widest">Drag widgets here</p>}
              </div>
            )}

            {canvasWidgets.map(w => (
              <DraggableWidget
                key={w.id}
                id={w.id}
                title={w.customSettings?.title || w.title}
                icon={w.customSettings?.icon || 'Activity'}
                size={w.size}
                position={w.position}
                isEditing={isEditing}
                onRemove={removeWidget}
                onResize={resizeWidget}
                onSettings={() => setSelectedWidgetForSettings(w)}
                mappedDevice={w.mapping?.feedId || 'No Feed'}
              >
                {renderWidgetUI(w, isEditing, false, updateWidgetData, readOnly)}
              </DraggableWidget>
            ))}
          </div>
        </div>

        {/* WIDGET SETTINGS MODAL */}
        {selectedWidgetForSettings && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-[#0F172A] border border-slate-700 rounded-3xl w-full max-w-lg p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
              <h3 className="text-xl font-bold mb-6 text-white uppercase tracking-tight flex items-center gap-3">
                <span className="w-2 h-8 bg-cyan-500 rounded-full"></span>
                Widget Lab Configuration
              </h3>

              <div className="space-y-6">
                {/* 1. Naming & Units */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Display Name</label>
                    <input
                      type="text"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-cyan-500 text-sm"
                      value={selectedWidgetForSettings.customSettings?.title || ''}
                      onChange={(e) => {
                        setCanvasWidgets(prev => prev.map(w => w.id === selectedWidgetForSettings.id ? { ...w, customSettings: { ...w.customSettings, title: e.target.value } } : w));
                        setSelectedWidgetForSettings(prev => ({ ...prev, customSettings: { ...prev.customSettings, title: e.target.value } }));
                      }}
                      placeholder="e.g. Living Room Temp"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Unit Label</label>
                    <input
                      type="text"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-cyan-500 text-sm"
                      value={selectedWidgetForSettings.customSettings?.unit || ''}
                      onChange={(e) => {
                        setCanvasWidgets(prev => prev.map(w => w.id === selectedWidgetForSettings.id ? { ...w, customSettings: { ...w.customSettings, unit: e.target.value } } : w));
                        setSelectedWidgetForSettings(prev => ({ ...prev, customSettings: { ...prev.customSettings, unit: e.target.value } }));
                      }}
                      placeholder="e.g. °C, %, kW"
                    />
                  </div>
                </div>

                {/* 2. Theme Color */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Theme Color</label>
                  <div className="flex flex-wrap gap-3">
                    {THEME_COLORS.map(c => (
                      <button
                        key={c.hex}
                        onClick={() => {
                          setCanvasWidgets(prev => prev.map(w => w.id === selectedWidgetForSettings.id ? { ...w, customSettings: { ...w.customSettings, color: c.hex } } : w));
                          setSelectedWidgetForSettings(prev => ({ ...prev, customSettings: { ...prev.customSettings, color: c.hex } }));
                        }}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${selectedWidgetForSettings.customSettings?.color === c.hex ? 'border-white scale-125' : 'border-transparent'}`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>

                {/* 3. Icon Selection */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Widget Icon</label>
                  <div className="flex flex-wrap gap-2.5 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                    {ICON_LIST.map(iconName => {
                      const Icon = require('lucide-react')[iconName] || require('lucide-react').Activity;
                      return (
                        <button
                          key={iconName}
                          onClick={() => {
                            setCanvasWidgets(prev => prev.map(w => w.id === selectedWidgetForSettings.id ? { ...w, customSettings: { ...w.customSettings, icon: iconName } } : w));
                            setSelectedWidgetForSettings(prev => ({ ...prev, customSettings: { ...prev.customSettings, icon: iconName } }));
                          }}
                          className={`p-2 rounded-lg border transition-all ${selectedWidgetForSettings.customSettings?.icon === iconName ? 'bg-cyan-500 text-slate-900 border-white' : 'bg-slate-800 text-slate-500 border-slate-700'}`}
                        >
                          <Icon size={16} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Data Routing */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Feed Identifier (Routing)</label>
                  <input
                    type="text"
                    placeholder="e.g. my_esp8266/temperature"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-cyan-500 text-sm font-mono"
                    value={selectedWidgetForSettings.mapping?.feedId || ''}
                    onChange={(e) => {
                      setCanvasWidgets(prev => prev.map(w => w.id === selectedWidgetForSettings.id ? { ...w, mapping: { ...w.mapping, feedId: e.target.value } } : w));
                      setSelectedWidgetForSettings(prev => ({ ...prev, mapping: { ...prev.mapping, feedId: e.target.value } }));
                    }}
                  />
                </div>

                <div className="pt-4 flex gap-4">
                  <button onClick={() => setSelectedWidgetForSettings(null)} className="flex-1 bg-cyan-500 text-slate-900 font-bold py-3.5 rounded-2xl hover:bg-cyan-400 transition-all uppercase tracking-widest text-xs">Save Settings</button>
                  <button onClick={() => setSelectedWidgetForSettings(null)} className="px-6 py-3.5 bg-slate-800 text-slate-400 rounded-2xl font-bold hover:bg-slate-700 transition-all uppercase tracking-widest text-xs">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DRAG OVERLAY (dropAnimation null ensures NO visual snap back) */}
        <DragOverlay dropAnimation={null}>
          {activeDragItem && activeDragItem.data.current?.type === 'template' ? (
            <div className="bg-[#0F172A] border border-cyan-500 rounded-xl p-3 shadow-[0_0_40px_rgba(6,182,212,0.6)] w-48 z-50">
              <div className="h-16 w-full flex items-center justify-center overflow-hidden pointer-events-none">
                {renderWidgetUI(activeDragItem.data.current.templateData, true, true)}
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* ===== TRIGGERS / NOTIFICATION MODAL ===== */}
      {showTriggersModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-700 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                    <span className="w-2 h-6 bg-amber-500 rounded-full"></span>
                    Notification Triggers
                </h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Configure Telegram Alerts</p>
              </div>
              <button onClick={() => setShowTriggersModal(false)} className="text-slate-500 hover:text-white transition-colors text-2xl">×</button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {/* Add New Trigger Section */}
              <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Create New Alert</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Source Device</label>
                    <select 
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-amber-500 text-sm text-white"
                      value={newTrigger.deviceId}
                      onChange={(e) => setNewTrigger({...newTrigger, deviceId: e.target.value})}
                    >
                      <option value="">Select Device</option>
                      {devices.map(d => (
                        <option key={d._id} value={d.deviceId}>{d.deviceName || d.deviceId}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Sensor Feed</label>
                    <input 
                      type="text"
                      placeholder="e.g. temperature"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-amber-500 text-sm"
                      value={newTrigger.feed}
                      onChange={(e) => setNewTrigger({...newTrigger, feed: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Condition</label>
                    <select 
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-amber-500 text-sm text-white"
                      value={newTrigger.condition}
                      onChange={(e) => setNewTrigger({...newTrigger, condition: e.target.value})}
                    >
                      <option value="greater_than">Greater Than (&gt;)</option>
                      <option value="less_than">Less Than (&lt;)</option>
                      <option value="equal_to">Equal To (=)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Threshold Value</label>
                    <input 
                      type="number"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-amber-500 text-sm"
                      value={newTrigger.threshold}
                      onChange={(e) => {
                        const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                        setNewTrigger({...newTrigger, threshold: val});
                      }}
                    />
                  </div>
                </div>
                <button 
                  onClick={handleCreateTrigger}
                  className="w-full mt-6 bg-amber-500 text-slate-900 font-bold py-4 rounded-xl hover:bg-amber-400 transition-all uppercase tracking-widest text-xs shadow-lg shadow-amber-500/20"
                >
                  Enable This Alert
                </button>
              </div>

              {/* Active Triggers List */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Active Alerts ({triggers.length})</h4>
                <div className="space-y-3">
                  {triggerLoading ? (
                    <div className="text-center py-10 text-slate-600 animate-pulse font-mono text-xs">Loading triggers...</div>
                  ) : triggers.length === 0 ? (
                    <div className="text-center py-10 bg-slate-900/30 rounded-2xl border border-dashed border-slate-800 text-slate-600 text-xs uppercase tracking-widest">No alerts configured</div>
                  ) : triggers.map(t => (
                    <div key={t._id} className="flex items-center justify-between bg-slate-900/80 border border-slate-800 rounded-2xl p-4 group hover:border-amber-500/30 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500">
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        </div>
                        <div>
                          <p className="text-white font-bold text-sm uppercase tracking-tight">{t.feed} <span className="text-amber-500">{t.condition.replace('_', ' ')}</span> {t.threshold}</p>
                          <p className="text-[10px] text-slate-500 font-medium">DEVICE: {t.deviceId}</p>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteTrigger(t._id)} className="p-2 text-slate-600 hover:text-rose-500 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-8 py-5 bg-slate-900/80 border-t border-slate-800 flex items-center justify-center">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Requires Telegram Chat ID in User Profile</p>
            </div>
          </div>
        </div>
      )}

      {/* ===== SHARE BOARD MODAL ===== */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-700 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-cyan-500/10 border border-cyan-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm uppercase tracking-wider">Share Board</h3>
                  <p className="text-slate-500 text-[10px] mt-0.5">{boardInfo.name}</p>
                </div>
              </div>
              <button
                onClick={() => { setShowShareModal(false); setShareMsg(null); setShareEmail(''); }}
                className="w-8 h-8 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-all"
              >✕</button>
            </div>

            <div className="p-6 space-y-5">
              {/* Email Input */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Share with registered user</label>
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center bg-slate-900 border border-slate-700 rounded-xl px-4 focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/20 transition-all">
                    <svg className="w-4 h-4 text-slate-600 shrink-0 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path></svg>
                    <input
                      type="email"
                      value={shareEmail}
                      onChange={(e) => setShareEmail(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleShareWithUser()}
                      placeholder="Enter user email address"
                      className="w-full py-3 bg-transparent text-white outline-none placeholder-slate-600 text-sm"
                    />
                  </div>
                  <button
                    onClick={handleShareWithUser}
                    disabled={shareLoading || !shareEmail.trim()}
                    className="px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-xs rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {shareLoading ? '...' : 'Invite'}
                  </button>
                </div>
                {/* Feedback message */}
                {shareMsg && (
                  <div className={`mt-2 flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg border ${shareMsg.type === 'success' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-rose-400 bg-rose-500/10 border-rose-500/20'}`}>
                    <span>{shareMsg.type === 'success' ? '✓' : '✕'}</span>
                    {shareMsg.text}
                  </div>
                )}
              </div>

              {/* Shared Users List */}
              <div>
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">People with access</h4>
                {sharedUsersLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <div className="w-5 h-5 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
                  </div>
                ) : sharedUsers.length === 0 ? (
                  <div className="py-5 text-center bg-slate-900/40 rounded-xl border border-slate-800">
                    <p className="text-slate-600 text-xs font-medium">No one else has access yet</p>
                    <p className="text-slate-700 text-[10px] mt-1">Enter an email above to invite</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {sharedUsers.map(u => (
                      <div key={u._id} className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-black">
                            {u.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="text-white text-xs font-bold">{u.name}</p>
                            <p className="text-slate-500 text-[10px]">{u.email}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRevokeUser(u.email)}
                          className="text-[10px] font-bold text-rose-400 hover:text-rose-300 border border-rose-500/20 hover:border-rose-500/40 bg-rose-500/5 hover:bg-rose-500/10 px-2.5 py-1 rounded-lg transition-all uppercase tracking-wide"
                        >Revoke</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <p className="text-[10px] text-slate-600 text-center border-t border-slate-800 pt-4">
                Shared users can view and interact with this board in read-only mode
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function DraggableSidebarItem({ template }) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: `template-${template.type}`,
    data: { type: 'template', templateData: template }
  });
  return (
    <div ref={setNodeRef} {...listeners} {...attributes} className="bg-[#111827]/80 border border-slate-700/50 rounded-xl p-4 cursor-grab hover:border-cyan-500 hover:bg-[#111827] transition-all group shadow-sm hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]">
      <div className="h-14 w-full flex items-center justify-center overflow-hidden mb-3 pointer-events-none">
        {renderWidgetUI(template, true, true)}
      </div>
      <span className="block text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest group-hover:text-cyan-400 transition-colors pointer-events-none">{template.title}</span>
    </div>
  );
}

export default ControlBoard;