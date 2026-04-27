"use client";
import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { getDevices } from '@/utils/dashboardAPI';

const WebRepl = ({ deviceId = "ESP32_Sensor_Node" }) => {
  const [history, setHistory] = useState([
    { type: 'system', color: '#22d3ee', text: 'Sentinel Cloud Web REPL v2.6.0' },
    { type: 'info', color: '#4ade80', text: 'Bridge Active: Dashboard ↔ MQTT ↔ ESP32' },
    { type: 'info', color: '#94a3b8', text: 'Select a device to begin communication.' }
  ]);
  const [input, setInput] = useState('');
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(deviceId);
  const socketRef = useRef(null);
  const scrollRef = useRef(null);

  // Fetch devices on mount
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const res = await getDevices();
        const deviceList = res.data || [];
        setDevices(deviceList);
        // If current selectedDeviceId is not in the list, and list is not empty, pick first
        if (deviceList.length > 0 && (!selectedDeviceId || selectedDeviceId === "ESP32_Sensor_Node")) {
          setSelectedDeviceId(deviceList[0].deviceId);
        }
      } catch (err) {
        console.error("Failed to fetch devices:", err);
      }
    };
    fetchDevices();
  }, []);

  useEffect(() => {
    if (!selectedDeviceId) return;

    // 1. Socket Connection
    socketRef.current = io(`http://${window.location.hostname}:5000`);

    socketRef.current.on('connect', () => {
        console.log(`Connected to Backend Socket for ${selectedDeviceId}`);
        // 2. Attach to Device
        socketRef.current.emit('attach_device', { deviceId: selectedDeviceId });
    });

    // 3. Listen for System Messages
    socketRef.current.on('terminal_output', (data) => {
      setHistory(prev => [...prev, data]);
    });

    // 4. Listen for RAW Hardware Output
    socketRef.current.on('terminal_output_raw', (res) => {
      if (res.deviceId === selectedDeviceId) {
        const incomingData = res.data;
        setHistory(prev => [...prev, { 
          type: 'response', 
          text: incomingData.output || (typeof incomingData === 'string' ? incomingData : "No output"), 
          color: incomingData.color || '#94a3b8' 
        }]);
      }
    });

    return () => {
        if(socketRef.current) socketRef.current.disconnect();
    };
  }, [selectedDeviceId]);

  // Auto-scroll logic
  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  // Command execution logic
  const executeCommand = (cmdText = input) => {
    const cmd = cmdText.trim();
    if (!cmd) return;

    if (cmd.toLowerCase() === 'clear') {
      setHistory([]);
      setInput('');
      return;
    }

    // Add user command to local history UI
    setHistory(prev => [...prev, { type: 'user', text: `$ ${cmd}`, color: '#ffffff' }]);
    
    // Emit command to SocketHandler (Backend)
    if (socketRef.current) {
        socketRef.current.emit('terminal_command', { deviceId: selectedDeviceId, command: cmd });
    }
    
    setInput('');
  };

  return (
    <div className="bg-[#0b1120] min-h-screen p-4 text-slate-300 font-mono">
      <div className="max-w-5xl mx-auto rounded-2xl overflow-hidden border border-slate-700 shadow-2xl bg-[#0d1117]">
        
        {/* Terminal Header */}
        <div className="bg-[#161b22] px-5 py-3 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
              <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
            </div>
            <span className="text-xs font-semibold text-slate-400">sentinel@device:<span className='text-cyan-400'>{selectedDeviceId}</span> — repl</span>
          </div>

          {/* Device Selector */}
          <div className="flex items-center gap-3">
            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Target Device:</label>
            <select 
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              className="bg-[#0d1117] border border-slate-700 text-cyan-400 text-xs rounded-lg px-3 py-1 outline-none focus:border-cyan-500 transition-all cursor-pointer hover:bg-slate-800 shadow-inner"
            >
              {devices.length > 0 ? devices.map(d => (
                <option key={d.deviceId} value={d.deviceId}>{d.deviceName || d.deviceId}</option>
              )) : (
                <option value={selectedDeviceId}>{selectedDeviceId}</option>
              )}
            </select>
          </div>
        </div>

        {/* Terminal Body */}
        <div className="relative">
          <div ref={scrollRef} className="h-[450px] p-6 overflow-y-auto text-[14px] leading-relaxed custom-scrollbar">
            {history.length > 0 ? history.map((line, i) => (
              <div key={i} className="mb-1 whitespace-pre-wrap transition-opacity duration-300" style={{ color: line.color }}>
                {line.text}
              </div>
            )) : (
                <div className="text-slate-600 italic">Terminal cleared. Type a command to begin.</div>
            )}
          </div>
          
          {/* Input Bar */}
          <div className="bg-[#0d1117] flex items-center px-6 py-4 border-t border-slate-700">
            <span className="text-cyan-400 mr-2 font-bold">$</span>
            <input
              className="bg-transparent border-none outline-none flex-1 text-white placeholder-slate-600"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && executeCommand()}
              placeholder="Enter MicroPython code (e.g. print('Hi'), led.on())..."
              autoFocus
            />
            <button 
              onClick={() => executeCommand()}
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-1 rounded text-xs font-bold transition active:scale-95 shadow-lg"
            >
              RUN ↵
            </button>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons (Updated to Auto-Run) */}
      <div className='max-w-5xl mx-auto mt-6 flex gap-3 flex-wrap'>
        <p className="w-full text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Quick Commands</p>
        {['help', 'status', "print('Hello World')", 'machine.reset()', 'gc.collect()', 'clear'].map(cmd => (
          <button 
            key={cmd}
            onClick={() => executeCommand(cmd)}
            className="px-4 py-2 bg-[#1c2128] border border-slate-700 rounded-xl text-[10px] text-cyan-400 hover:border-cyan-500 hover:bg-slate-800 transition-all active:scale-95 font-mono"
          >
            {cmd}
          </button>
        ))}
      </div>
    </div>
  );
};

export default WebRepl;