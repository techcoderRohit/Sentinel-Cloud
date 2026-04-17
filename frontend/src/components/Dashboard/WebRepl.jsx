// "use client"
// import { useState, useEffect, useRef } from 'react'
// import API from '@/utils/api';

// const WebRepl = () => {
//   const [history, setHistory] = useState([
//     { type: 'system', color: '#22d3ee', text: 'Sentinel Cloud Web REPL v2.4.1' }, // Cyan-400
//     { type: 'info', color: '#4ade80', text: 'Type "help" for available commands.' }, // Green-400
//     { type: 'out', color: '#94a3b8', text: '> Connected to sentinel.cloud.io:8883' }
//   ]);
//   const [input, setInput] = useState('');
//   const scrollRef = useRef(null);

//   useEffect(() => {
//     if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
//   }, [history]);

//   useEffect(()=> {
//     const socket = io('http://localhost:5000');

//     socket.emit('attach device', {deviceId : 'ESP32_Sensor_Node'});

//     socket.on('terminal_output_raw',({deviceId,data})=>{
//       setHistory(prev => [...prev, {
//         type : 'response',
//         text: data.output,
//         color: data.color || '#94a3b8'
//       }]);
//     });
//   })
//   const executeCommand = async (commandText) => {
//     const cmd = commandText.trim();
//     if (!cmd) return;

//     // 1. Local Clear Logic (Faster UX)
//     if (cmd.toLowerCase() === 'clear') {
//       setHistory([]);
//       setInput('');
//       return;
//     }

//     // 2. User command update
//     setHistory(prev => [...prev, { type: 'user', text: `$ ${cmd}`, color: '#ffffff' }]);
//     setInput('');
    
//     try {
//       // 3. Backend Call
//       const response = await API.post('/terminal', { command: cmd });
      
//       // Check if backend specifically asks to clear
//       if (response.data.output === 'CLEAR_TERMINAL') {
//         setHistory([]);
//       } else {
//         // 4. Update with Dynamic Color from Backend
//         setHistory(prev => [...prev, { 
//           type: 'response', 
//           text: response.data.output,
//           color: response.data.color || '#94a3b8' // Fallback color
//         }]);
//       }
//     } catch (error) {
//       setHistory(prev => [...prev, { type: 'error', text: 'Error: Connection failed', color: '#f87171' }]);
//     }
//   };

//   return (
//     <div className="bg-[#0b1120] min-h-screen p-4 text-slate-300 font-mono">
//       <div className="max-w-5xl mx-auto rounded-2xl overflow-hidden border border-slate-700 shadow-2xl bg-[#0d1117]">
        
//         {/* Terminal Header */}
//         <div className="bg-[#161b22] px-5 py-3 flex items-center gap-4 border-b border-slate-700">
//           <div className="flex gap-2">
//             <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
//             <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
//             <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
//           </div>
//           <span className="text-xs font-semibold text-slate-400 tracking-wider">admin@sentinel.cloud.io — ssh</span>
//         </div>

//         {/* Terminal Body */}
//         <div className="relative">
//           <div ref={scrollRef} className="h-[450px] p-6 overflow-y-auto custom-scrollbar text-[15px] leading-relaxed">
//             {history.map((line, i) => (
//               <div key={i} className="mb-1 whitespace-pre-wrap transition-all duration-200" style={{ color: line.color }}>
//                 {line.text}
//               </div>
//             ))}
//           </div>
          
//           {/* Input Bar */}
//           <div className="bg-[#0d1117] flex items-center px-6 w-full py-4 border-t border-slate-700">
//             <span className="text-cyan-400 mr-2 font-bold">$</span>
//             <input
//               className="bg-transparent border-none outline-none flex-1 text-white placeholder-slate-600"
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               onKeyDown={(e) => e.key === 'Enter' && executeCommand(input)}
//               placeholder="Type a command... (try: help)"
//               autoFocus
//             />
//             <button 
//               onClick={() => executeCommand(input)}
//               className="bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg transition active:scale-95"
//             >
//               Run ↵
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Quick Commands Section */}
//       <div className='max-w-5xl mx-auto mt-8 px-4'>
//         <p className="text-xs uppercase tracking-widest font-bold text-slate-500 mb-4">Quick actions:</p>
//         <div className="flex flex-wrap gap-4">
//           {[
//             { label: 'help', cmd: 'help' },
//             { label: 'list', cmd: 'list' },
//             { label: 'status NODE-02', cmd: 'status NODE-02' },
//             { label: 'ping NODE-01', cmd: 'ping NODE-01' },
//             { label: 'Clear', cmd: 'clear' }
//           ].map((item) => (
//             <button
//               key={item.label}
//               onClick={() => executeCommand(item.cmd)}
//               className="bg-[#1c2128] hover:bg-[#2d333b] hover:border-cyan-500/50 w-[180px] border border-slate-700 text-cyan-400 px-4 py-3 rounded-xl text-sm font-medium transition-all active:scale-95 shadow-md"
//             >
//               {item.label}
//             </button>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default WebRepl;


"use client";
import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const WebRepl = ({ deviceId = "ESP32_Sensor_Node" }) => {
  const [history, setHistory] = useState([
    { type: 'system', color: '#22d3ee', text: 'Sentinel Cloud Web REPL v2.4.1' },
    { type: 'info', color: '#4ade80', text: 'Connected to hardware via MQTT Bridge.' }
  ]);
  const [input, setInput] = useState('');
  const socketRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    // 1. Socket Connection (Using your Local Server IP)
    socketRef.current = io('http://172.18.85.133:5000');

    socketRef.current.on('connect', () => {
        console.log("Connected to Backend Socket");
        // 2. Attach to Device immediately on connection
        socketRef.current.emit('attach_device', { deviceId });
    });

    // 3. Listen for System Messages (like "Attached to device")
    socketRef.current.on('terminal_output', (data) => {
      setHistory(prev => [...prev, data]);
    });

    // 4. Listen for RAW Hardware Output
    socketRef.current.on('terminal_output_raw', (res) => {
      // res format: { deviceId, data: { output, color } }
      if (res.deviceId === deviceId) {
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
  }, [deviceId]);

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
        socketRef.current.emit('terminal_command', { deviceId, command: cmd });
    }
    
    setInput('');
  };

  return (
    <div className="bg-[#0b1120] min-h-screen p-4 text-slate-300 font-mono">
      <div className="max-w-5xl mx-auto rounded-2xl overflow-hidden border border-slate-700 shadow-2xl bg-[#0d1117]">
        
        {/* Terminal Header */}
        <div className="bg-[#161b22] px-5 py-3 flex items-center gap-4 border-b border-slate-700">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
            <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
          </div>
          <span className="text-xs font-semibold text-slate-400">sentinel@device:{deviceId} — repl</span>
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
              placeholder="Type command (e.g., led_on, status)..."
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
        {['help', 'status', 'led_on', 'led_off', 'clear'].map(cmd => (
          <button 
            key={cmd}
            onClick={() => executeCommand(cmd)}
            className="px-4 py-2 bg-[#1c2128] border border-slate-700 rounded-xl text-xs text-cyan-400 hover:border-cyan-500 hover:bg-slate-800 transition-all active:scale-95"
          >
            {cmd.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
};

export default WebRepl;