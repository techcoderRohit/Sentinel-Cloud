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

const WIDGET_LIBRARY = [
  { type: 'switch', title: 'Relay Switch', defaultSize: { width: 220, height: 160 }, defaultData: { status: true } },
  { type: 'gauge', title: 'Gauge Meter', defaultSize: { width: 280, height: 280 }, defaultData: { value: 72, max: 100, unit: '°C' } },
  { type: 'text', title: 'Status Text', defaultSize: { width: 250, height: 150 }, defaultData: { value: 'SYSTEM OK', color: 'text-emerald-400' } },
  { type: 'slider', title: 'Controller', defaultSize: { width: 350, height: 180 }, defaultData: { value: 45, min: 0, max: 100 } },
  { type: 'lineChart', title: 'Power Chart', defaultSize: { width: 450, height: 300 }, defaultData: { current: 84.2 } },
];

const getDynamicColor = (val, max) => {
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

const renderWidgetUI = (widget, isEditing = false, isPreview = false, updateData = null) => {
  const isInteractive = !isEditing && !isPreview;
  const data = widget.data || widget.defaultData;

  if (isPreview) {
    switch (widget.type) {
      case 'switch': return <div className="w-10 h-5 bg-slate-800 rounded-full border border-slate-600 flex items-center px-1"><div className="w-3 h-3 bg-cyan-500 rounded-full translate-x-4 shadow-[0_0_5px_cyan]"></div></div>;
      case 'gauge': return <svg className="h-full w-auto" viewBox="0 0 36 36"><circle cx="18" cy="18" r="15" fill="none" stroke="#1e293b" strokeWidth="4" /><circle cx="18" cy="18" r="15" fill="none" stroke="#06b6d4" strokeWidth="4" strokeDasharray="94.2" strokeDashoffset="24" /></svg>;
      case 'text': return <span className="text-emerald-400 font-black tracking-widest text-sm">SYS OK</span>;
      case 'slider': return <div className="w-3/4 h-2 bg-slate-800 rounded-full border border-slate-600"><div className="w-2/3 h-full bg-cyan-500 rounded-full relative"><div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full border-2 border-cyan-500"></div></div></div>;
      case 'lineChart': return <svg className="w-full h-full p-2" viewBox="0 0 100 50" preserveAspectRatio="none"><path d="M0,40 Q25,10 50,30 T100,20" fill="none" stroke="#06b6d4" strokeWidth="4" className="drop-shadow-[0_0_5px_cyan]" /></svg>;
      default: return null;
    }
  }

  const pointerClass = isInteractive ? 'pointer-events-auto' : 'pointer-events-none';

  switch (widget.type) {
    case 'switch':
      return (
        <div className={`widget-box flex flex-col items-center justify-center ${pointerClass}`}>
          <label className={`relative flex items-center justify-center ${isInteractive ? 'cursor-pointer group' : 'cursor-default'}`}>
            <input type="checkbox" className="sr-only" checked={data.status} onChange={(e) => isInteractive && updateData(widget.id, { ...data, status: e.target.checked })} disabled={!isInteractive} />
            <div style={{ width: 'clamp(80px, 45cqmin, 160px)', height: 'clamp(40px, 22cqmin, 80px)' }} className={`relative rounded-full border-2 transition-all duration-300 ${data.status ? 'bg-slate-900 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.2)]' : 'bg-slate-800 border-slate-700 shadow-inner'}`}>
              <div style={{
                width: 'clamp(32px, 18cqmin, 68px)', height: 'clamp(32px, 18cqmin, 68px)',
                left: data.status ? 'calc(100% - clamp(32px, 18cqmin, 68px) - 2px)' : '2px',
                top: '50%', transform: 'translateY(-50%)',
                backgroundColor: data.status ? '#06b6d4' : '#64748b',
                boxShadow: data.status ? '0 0 15px rgba(6,182,212,0.8), inset 0 0 5px #fff' : 'inset 0 -2px 5px rgba(0,0,0,0.5)'
              }} className="absolute transition-all duration-400 ease-spring rounded-full"></div>
            </div>
          </label>
          <span style={{ fontSize: 'clamp(0.7rem, 6cqmin, 1.5rem)', marginTop: 'clamp(10px, 5cqmin, 24px)' }} className={`font-bold uppercase tracking-widest transition-colors duration-300 ${data.status ? 'text-cyan-400 drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]' : 'text-slate-500'}`}>
            {data.status ? 'System Online' : 'System Offline'}
          </span>
        </div>
      );

    case 'gauge':
      const r = 15, c = 2 * Math.PI * r, offset = c - (data.value / data.max) * c;
      const colors = getDynamicColor(data.value, data.max);
      return (
        <div className={`widget-box flex flex-col items-center justify-center p-[2cqmin] ${pointerClass}`}>
          <div style={{ width: 'clamp(120px, 85cqmin, 300px)', height: 'clamp(120px, 85cqmin, 300px)' }} className="relative flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90 drop-shadow-xl" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15" fill="none" className="stroke-slate-800/80" strokeWidth="4" />
              <circle cx="18" cy="18" r="15" fill="none" stroke={colors.stroke} style={{ filter: `drop-shadow(0 0 8px ${colors.shadow})` }} className="transition-all duration-700 ease-out" strokeWidth="3.5" strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span style={{ fontSize: 'clamp(2.5rem, 24cqmin, 6rem)' }} className="font-black text-white leading-none tracking-tighter drop-shadow-lg">{data.value}</span>
              <span style={{ fontSize: 'clamp(0.7rem, 8cqmin, 1.5rem)', color: colors.stroke }} className="font-bold uppercase tracking-widest mt-1 transition-colors duration-700">{data.unit}</span>
            </div>
          </div>
        </div>
      );

    case 'text':
      return (
        <div className="widget-box flex items-center justify-center p-4">
          <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-4 shadow-inner flex items-center justify-center w-full h-full">
            <span style={{ fontSize: 'clamp(1.5rem, 16cqmin, 5rem)' }} className={`font-black tracking-widest ${data.color} animate-pulse truncate drop-shadow-[0_0_15px_rgba(52,211,153,0.4)]`}>{data.value}</span>
          </div>
        </div>
      );

    case 'slider':
      const sliderColors = getDynamicColor(data.value, data.max);
      return (
        <div className="widget-box flex flex-col items-center justify-center px-[8cqmin]" style={{ '--thumb-color': sliderColors.stroke, '--thumb-shadow': sliderColors.shadow }}>
          <div className="flex items-baseline mb-[4cqmin]">
            <span style={{ fontSize: 'clamp(3rem, 25cqmin, 7rem)', color: sliderColors.stroke }} className="font-black leading-none tracking-tighter drop-shadow-md transition-colors duration-300">{data.value}</span>
            <span style={{ fontSize: 'clamp(1.2rem, 10cqmin, 2.5rem)' }} className="text-slate-500 ml-2 font-bold">%</span>
          </div>
          <input type="range" min={data.min} max={data.max} value={data.value} onChange={(e) => isInteractive && updateData(widget.id, { ...data, value: parseInt(e.target.value) })} className={`w-full fluid-slider bg-slate-900 border-2 border-slate-700 rounded-full appearance-none outline-none shadow-inner ${isInteractive ? 'cursor-pointer hover:border-slate-500 transition-colors' : ''}`} style={{ height: 'clamp(10px, 4cqmin, 24px)' }} />
        </div>
      );

    case 'lineChart':
      return (
        <div className={`widget-box flex flex-col relative p-4 sm:p-6 ${pointerClass} overflow-hidden rounded-xl bg-slate-900/30`}>
          <div className="absolute inset-0 animated-grid opacity-30 pointer-events-none z-0"></div>

          <div className="flex justify-between items-end mb-2 shrink-0 z-20">
            <span style={{ fontSize: 'clamp(1.5rem, 12cqmin, 3.5rem)' }} className="text-white font-black tracking-tight drop-shadow-md flex items-baseline gap-1">
              {data.current} <span style={{ fontSize: 'clamp(0.8rem, 6cqmin, 2rem)' }} className="text-cyan-500 font-bold">kW</span>
            </span>
            <span style={{ fontSize: 'clamp(0.6rem, 5cqmin, 1rem)' }} className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/30 shadow-[0_0_10px_rgba(52,211,153,0.2)] flex items-center gap-1.5 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> LIVE
            </span>
          </div>

          <div className="flex-1 w-full relative mt-2 min-h-0 z-10">
            <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="chartGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#06b6d4" stopOpacity="0.6" /><stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" /></linearGradient>
              </defs>
              <path d="M 0 80 C 20 60, 40 90, 60 50 C 80 10, 90 40, 100 20 L 100 100 L 0 100 Z" fill="url(#chartGrad)" />
              <path d="M 0 80 C 20 60, 40 90, 60 50 C 80 10, 90 40, 100 20" fill="none" stroke="#06b6d4" strokeWidth="4" strokeLinecap="round" className="drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
            </svg>
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute bg-slate-900 border-2 border-cyan-500 rounded-full" style={{ width: 'clamp(8px, 3cqmin, 16px)', height: 'clamp(8px, 3cqmin, 16px)', left: '20%', bottom: '40%', transform: 'translate(-50%, 50%)' }}></div>
              <div className="absolute bg-white rounded-full shadow-[0_0_8px_#fff]" style={{ width: 'clamp(10px, 4cqmin, 18px)', height: 'clamp(10px, 4cqmin, 18px)', left: '60%', bottom: '50%', transform: 'translate(-50%, 50%)' }}></div>
              <div className="absolute bg-cyan-400 border-2 border-white rounded-full shadow-[0_0_15px_#06b6d4] animate-pulse" style={{ width: 'clamp(12px, 5cqmin, 24px)', height: 'clamp(12px, 5cqmin, 24px)', left: '100%', bottom: '80%', transform: 'translate(-50%, 50%)' }}></div>
            </div>
          </div>

          <div className="flex justify-between mt-3 font-mono font-bold uppercase tracking-widest shrink-0 text-slate-500 z-20" style={{ fontSize: 'clamp(0.6rem, 4.5cqmin, 1.2rem)' }}>
            <span>08:00</span><span>10:00</span><span>12:00</span><span className="text-cyan-400">Now</span>
          </div>
        </div>
      );
    default: return null;
  }
};

const ControlBoard = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeDragItem, setActiveDragItem] = useState(null);
  const [canvasWidgets, setCanvasWidgets] = useState([]);

  const { setNodeRef: setCanvasDropRef } = useDroppable({ id: 'main-canvas' });
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
  const FetchDashboard = async () => {
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        const res = await API.get('/dashboard/get-layout', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // Agar backend se widgets milte hain toh state update karein
        if (res.data && res.data.widgets) {
          setCanvasWidgets(res.data.widgets);
        }
      } catch (error) {
        console.error("Dashboard load karne mein error:", error.response?.data || error.message);
      }
    }
  };

  FetchDashboard();
}, []); // Component load par sirf ek baar chalega


const saveDashboardToDB = async () => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      alert("Please login first!");
      return;
    }

    // Backend route POST hai, isliye yahan .post use karein
    const response = await API.post('/dashboard/save-layout', 
      { widgets: canvasWidgets }, // Request Body
      {
        headers: {
          Authorization: `Bearer ${token}` // Token-based Access
        }
      }
    );

    if (response.data.success) {
      alert("Layout saved permanently!");
      setIsEditing(false); 
    }
  } catch (error) {
    console.error("Saving failed:", error.response?.data || error.message);
    alert("Saving failed: " + (error.response?.data?.message || "Internal Server Error"));
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

  const updateWidgetData = (id, newData) => setCanvasWidgets(prev => prev.map(w => w.id === id ? { ...w, data: newData } : w));
  const removeWidget = (id) => setCanvasWidgets(prev => prev.filter(w => w.id !== id));
  const resizeWidget = (id, newSize) => setCanvasWidgets(prev => prev.map(w => w.id === id ? { ...w, size: newSize } : w));

  return (
    <div className="w-full h-full flex flex-col space-y-6 relative">
      <WidgetStyles />

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gradient-to-r from-[#0F172A] to-[#1e293b] p-5 rounded-2xl border border-slate-700/50 shadow-lg z-20">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight">Sentinel Board</h2>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <p className="text-emerald-500/80 font-bold text-[10px] uppercase tracking-widest">Freeform Dashboard Mode</p>
          </div>
        </div>
        <div className="flex items-center gap-5 mt-4 sm:mt-0">
          <div className={`flex items-center gap-3 px-5 py-2.5 rounded-xl border-2 transition-colors ${isEditing ? 'bg-cyan-900/30 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.2)]' : 'bg-[#111827] border-slate-700'}`}>
            <span className={`text-xs font-bold uppercase tracking-widest ${isEditing ? 'text-cyan-400' : 'text-slate-400'}`}>Build Mode</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={isEditing} onChange={() => setIsEditing(!isEditing)} />
              <div className="w-12 h-6 bg-slate-800 border border-slate-600 rounded-full peer peer-checked:after:translate-x-6 peer-checked:bg-cyan-500 peer-checked:border-cyan-400 after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-4 after:w-4 transition-all"></div>
            </label>
          </div>
          {isEditing && (
            <button onClick={saveDashboardToDB} className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] hover:scale-105 transition-all uppercase tracking-widest">Save Layout</button>
          )}
        </div>
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
              <DraggableWidget key={w.id} id={w.id} title={w.title} size={w.size} position={w.position} isEditing={isEditing} onRemove={removeWidget} onResize={resizeWidget}>
                {renderWidgetUI(w, isEditing, false, updateWidgetData)}
              </DraggableWidget>
            ))}
          </div>
        </div>

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