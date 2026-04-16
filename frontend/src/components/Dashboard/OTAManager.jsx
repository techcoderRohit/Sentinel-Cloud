// "use client";
// import React, { useState, useEffect, useRef } from 'react';
// import { io } from 'socket.io-client';
// import API from '@/utils/api';
// import { deployOTA, getOTAHistory, getAllOTAHistory, getOTATemplates, deleteOTARecord } from '@/utils/dashboardAPI';
// import {
//   Upload, Shield, FileCode, Play, Loader2, CheckCircle, XCircle,
//   Clock, Trash2, RotateCcw, ChevronDown, ChevronUp, Filter,
//   Code, FileText, Zap, Wifi, Cpu, BookOpen, AlertCircle
// } from 'lucide-react';

// const OTAManager = () => {
//   // Device state
//   const [devices, setDevices] = useState([]);
//   const [selectedDevice, setSelectedDevice] = useState('');
//   const [selectedDeviceName, setSelectedDeviceName] = useState('');

//   // Editor state
//   const [filename, setFilename] = useState('main.py');
//   const [version, setVersion] = useState('v1.0');
//   const [description, setDescription] = useState('');
//   const [code, setCode] = useState('# Write your MicroPython code here\n# This will be deployed to the device via OTA\n\nimport time\n\nprint("Hello from Sentinel Cloud OTA!")\n');

//   // Deployment state
//   const [deploying, setDeploying] = useState(false);
//   const [deployStatus, setDeployStatus] = useState(null); // { status, message }
//   const [error, setError] = useState('');

//   // History & templates
//   const [history, setHistory] = useState([]);
//   const [templates, setTemplates] = useState([]);
//   const [showTemplates, setShowTemplates] = useState(false);
//   const [loadingHistory, setLoadingHistory] = useState(false);

//   const socketRef = useRef(null);
//   const editorRef = useRef(null);

//   // Fetch devices
//   useEffect(() => {
//     const fetchDevices = async () => {
//       try {
//         const response = await API.get('/devices');
//         setDevices(response.data);
//         if (response.data.length > 0) {
//           setSelectedDevice(response.data[0].apiKey);
//           setSelectedDeviceName(response.data[0].deviceName || response.data[0].name || 'Device');
//         }
//       } catch (err) {
//         console.error("Failed to fetch devices", err);
//       }
//     };
//     fetchDevices();
//   }, []);

//   // Fetch templates
//   useEffect(() => {
//     const fetchTemplates = async () => {
//       try {
//         const data = await getOTATemplates();
//         if (data.success) setTemplates(data.templates);
//       } catch (err) {
//         console.error("Failed to fetch templates", err);
//       }
//     };
//     fetchTemplates();
//   }, []);

//   // Fetch history when device changes
//   useEffect(() => {
//     if (selectedDevice) fetchHistory();
//   }, [selectedDevice]);

//   // Socket.io for real-time OTA status updates
//   useEffect(() => {
//     const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5100');
//     socketRef.current = socket;

//     socket.on('ota_status_update', (data) => {
//       setDeployStatus({
//         status: data.status,
//         message: data.message || `Deployment ${data.status}`
//       });

//       // Refresh history on status update
//       if (selectedDevice) fetchHistory();
//     });

//     return () => socket.disconnect();
//   }, [selectedDevice]);

//   const fetchHistory = async () => {
//     setLoadingHistory(true);
//     try {
//       const data = await getOTAHistory(selectedDevice);
//       if (data.success) setHistory(data.deployments || []);
//     } catch (err) {
//       console.error("Failed to fetch history", err);
//     } finally {
//       setLoadingHistory(false);
//     }
//   };

//   const handleDeploy = async () => {
//     if (!selectedDevice || !code.trim() || !filename.trim()) {
//       setError('Please select a device, enter a filename, and write some code');
//       return;
//     }

//     setDeploying(true);
//     setError('');
//     setDeployStatus({ status: 'pending', message: 'Initiating OTA deployment...' });

//     try {
//       const data = await deployOTA({
//         deviceApiKey: selectedDevice,
//         filename: filename.trim(),
//         code,
//         version,
//         description
//       });

//       if (data.success) {
//         setDeployStatus({ status: 'deployed', message: `Code pushed to ${selectedDeviceName}. Waiting for device acknowledgment...` });
//         fetchHistory();
//       } else {
//         setError(data.message || 'Deployment failed');
//         setDeployStatus(null);
//       }
//     } catch (err) {
//       const msg = err.response?.data?.message || 'OTA deployment failed';
//       setError(msg);
//       setDeployStatus({ status: 'failed', message: msg });
//     } finally {
//       setDeploying(false);
//     }
//   };

//   const handleRedeploy = (deployment) => {
//     setCode(deployment.code);
//     setFilename(deployment.filename);
//     setVersion(deployment.version);
//     setDescription(`Re-deploy of ${deployment.filename} ${deployment.version}`);
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   };

//   const handleDeleteRecord = async (id) => {
//     try {
//       await deleteOTARecord(id);
//       setHistory(prev => prev.filter(h => h._id !== id));
//     } catch (err) {
//       console.error("Delete failed", err);
//     }
//   };

//   const handleLoadTemplate = (template) => {
//     setCode(template.code);
//     setFilename(template.filename);
//     setDescription(template.description);
//     setShowTemplates(false);
//   };

//   const handleDeviceChange = (e) => {
//     const apiKey = e.target.value;
//     setSelectedDevice(apiKey);
//     const dev = devices.find(d => d.apiKey === apiKey);
//     setSelectedDeviceName(dev?.deviceName || dev?.name || 'Device');
//     setDeployStatus(null);
//     setError('');
//   };

//   const lineCount = code.split('\n').length;
//   const fileSize = new Blob([code]).size;

//   return (
//     <div className="p-6 space-y-6 animate-in fade-in duration-500">

//       {/* ===== HEADER ===== */}
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-[#0d1421] via-[#15120d] to-[#0d1421] border border-amber-500/20 p-6 rounded-2xl relative overflow-hidden">
//         <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
//         <div className="absolute bottom-0 left-0 w-40 h-40 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />

//         <div className="relative z-10">
//           <h2 className="text-xl font-bold text-white flex items-center gap-3">
//             <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
//               <Upload className="text-amber-400" size={22} />
//             </div>
//             OTA Manager
//             <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 font-bold uppercase tracking-wider">
//               Text-Based
//             </span>
//           </h2>
//           <p className="text-xs text-gray-400 mt-2 max-w-md">
//             Deploy MicroPython code to your ESP32 devices remotely via Wi-Fi. Write, paste, or load templates — then push to device in one click.
//           </p>
//         </div>

//         <div className="flex flex-wrap items-center gap-3 relative z-10">
//           <div className="flex items-center gap-2 bg-[#141c2d] px-3 py-2.5 rounded-xl border border-gray-800">
//             <Filter size={14} className="text-gray-500" />
//             <select
//               value={selectedDevice}
//               onChange={handleDeviceChange}
//               className="bg-transparent border-none outline-none text-sm text-gray-300 min-w-[140px]"
//             >
//               <option value="" disabled>Select Device</option>
//               {devices.map(dev => (
//                 <option key={dev._id || dev.apiKey} value={dev.apiKey}>
//                   {dev.deviceName || dev.name || dev.apiKey}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <button
//             onClick={() => setShowTemplates(!showTemplates)}
//             className="flex items-center gap-2 px-4 py-2.5 bg-[#141c2d] border border-gray-800 text-gray-300 rounded-xl text-sm font-medium hover:border-amber-500/30 hover:text-amber-400 transition-all"
//           >
//             <BookOpen size={16} />
//             Templates
//           </button>
//         </div>
//       </div>

//       {/* ===== TEMPLATE LIBRARY ===== */}
//       {showTemplates && (
//         <div className="bg-[#0d1421] border border-gray-800 rounded-2xl p-5">
//           <h3 className="text-sm font-bold text-gray-400 tracking-wider mb-4 flex items-center gap-2">
//             <BookOpen size={16} className="text-amber-400" />
//             CODE TEMPLATES
//           </h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
//             {templates.map(template => (
//               <button
//                 key={template.id}
//                 onClick={() => handleLoadTemplate(template)}
//                 className="p-4 bg-[#141c2d] border border-gray-800 rounded-xl text-left hover:border-amber-500/30 hover:bg-amber-500/5 transition-all group"
//               >
//                 <div className="flex items-center gap-2 mb-2">
//                   <FileCode size={16} className="text-amber-400 group-hover:scale-110 transition-transform" />
//                   <span className="text-sm font-bold text-white">{template.name}</span>
//                 </div>
//                 <p className="text-xs text-gray-500 leading-relaxed">{template.description}</p>
//                 <div className="flex items-center gap-2 mt-2">
//                   <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded font-mono">{template.filename}</span>
//                 </div>
//               </button>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* ===== ERROR STATE ===== */}
//       {error && (
//         <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-start gap-3">
//           <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={18} />
//           <p className="text-sm text-red-300 font-medium">{error}</p>
//         </div>
//       )}

//       {/* ===== DEPLOYMENT STATUS ===== */}
//       {deployStatus && (
//         <DeployStatusBar status={deployStatus.status} message={deployStatus.message} />
//       )}

//       {/* ===== CODE EDITOR + CONTROLS ===== */}
//       <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
//         {/* Editor (3/4 width) */}
//         <div className="lg:col-span-3 bg-[#0d1421] border border-gray-800 rounded-2xl overflow-hidden">
//           {/* Editor Header */}
//           <div className="bg-[#141c2d] px-5 py-3 border-b border-gray-800 flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <div className="flex gap-1.5">
//                 <div className="w-3 h-3 rounded-full bg-red-500/60"></div>
//                 <div className="w-3 h-3 rounded-full bg-amber-500/60"></div>
//                 <div className="w-3 h-3 rounded-full bg-emerald-500/60"></div>
//               </div>
//               <span className="text-xs text-gray-500 font-mono">{filename}</span>
//             </div>
//             <div className="flex items-center gap-3 text-[10px] text-gray-600 font-mono">
//               <span>{lineCount} lines</span>
//               <span>{fileSize} bytes</span>
//               <span>MicroPython</span>
//             </div>
//           </div>

//           {/* Code Area with Line Numbers */}
//           <div className="flex">
//             {/* Line Numbers */}
//             <div className="bg-[#0a0f1a] px-3 py-4 text-right select-none border-r border-gray-800/50 min-w-[50px]">
//               {Array.from({ length: lineCount }, (_, i) => (
//                 <div key={i} className="text-[11px] text-gray-700 font-mono leading-[22px]">{i + 1}</div>
//               ))}
//             </div>
//             {/* Textarea */}
//             <textarea
//               ref={editorRef}
//               value={code}
//               onChange={(e) => setCode(e.target.value)}
//               className="flex-1 bg-transparent text-gray-300 font-mono text-[13px] leading-[22px] p-4 outline-none resize-none min-h-[350px]"
//               spellCheck={false}
//               placeholder="# Write your MicroPython code here..."
//             />
//           </div>
//         </div>

//         {/* Controls Panel (1/4 width) */}
//         <div className="space-y-4">
//           {/* Filename */}
//           <div className="bg-[#0d1421] border border-gray-800 rounded-2xl p-4">
//             <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Filename</label>
//             <input
//               type="text"
//               value={filename}
//               onChange={(e) => setFilename(e.target.value)}
//               className="w-full bg-[#141c2d] border border-gray-800 rounded-lg px-3 py-2 text-sm text-white font-mono outline-none focus:border-amber-500/50"
//               placeholder="main.py"
//             />
//           </div>

//           {/* Version */}
//           <div className="bg-[#0d1421] border border-gray-800 rounded-2xl p-4">
//             <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Version Tag</label>
//             <input
//               type="text"
//               value={version}
//               onChange={(e) => setVersion(e.target.value)}
//               className="w-full bg-[#141c2d] border border-gray-800 rounded-lg px-3 py-2 text-sm text-white font-mono outline-none focus:border-amber-500/50"
//               placeholder="v1.0"
//             />
//           </div>

//           {/* Description */}
//           <div className="bg-[#0d1421] border border-gray-800 rounded-2xl p-4">
//             <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Update Notes</label>
//             <textarea
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//               className="w-full bg-[#141c2d] border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-300 outline-none resize-none h-20 focus:border-amber-500/50"
//               placeholder="What changed in this update?"
//             />
//           </div>

//           {/* Deploy Button */}
//           <button
//             onClick={handleDeploy}
//             disabled={deploying || !selectedDevice || !code.trim()}
//             className={`w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl font-bold text-sm transition-all ${
//               deploying
//                 ? 'bg-amber-500/20 text-amber-300 cursor-wait'
//                 : 'bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-500 hover:to-orange-500 hover:shadow-lg hover:shadow-amber-500/25 active:scale-95'
//             } disabled:opacity-40`}
//           >
//             {deploying ? (
//               <>
//                 <Loader2 size={18} className="animate-spin" />
//                 Deploying...
//               </>
//             ) : (
//               <>
//                 <Zap size={18} />
//                 Deploy to Device
//               </>
//             )}
//           </button>

//           {/* File Info */}
//           <div className="bg-[#0d1421] border border-gray-800 rounded-2xl p-4">
//             <p className="text-[10px] text-gray-600 leading-relaxed">
//               <strong className="text-amber-400/60">Target:</strong> {selectedDeviceName || 'No device selected'}<br />
//               <strong className="text-amber-400/60">File:</strong> {filename} ({fileSize} bytes)<br />
//               <strong className="text-amber-400/60">Method:</strong> MQTT over Wi-Fi
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* ===== DEPLOYMENT HISTORY ===== */}
//       <div className="bg-[#0d1421] border border-gray-800 rounded-2xl p-6">
//         <h3 className="text-sm font-bold text-gray-400 tracking-wider mb-5 flex items-center gap-2">
//           <Clock className="text-gray-500" size={16} />
//           DEPLOYMENT HISTORY
//           {history.length > 0 && (
//             <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full ml-2">{history.length}</span>
//           )}
//         </h3>

//         {loadingHistory ? (
//           <div className="flex items-center justify-center py-8">
//             <Loader2 size={20} className="text-gray-600 animate-spin" />
//           </div>
//         ) : history.length > 0 ? (
//           <div className="overflow-x-auto">
//             <table className="w-full text-left">
//               <thead className="bg-[#141c2d] text-[10px] text-gray-500 font-black uppercase tracking-[0.1em]">
//                 <tr>
//                   <th className="px-4 py-3">File</th>
//                   <th className="px-4 py-3">Version</th>
//                   <th className="px-4 py-3">Device</th>
//                   <th className="px-4 py-3">Size</th>
//                   <th className="px-4 py-3">Status</th>
//                   <th className="px-4 py-3">Deployed</th>
//                   <th className="px-4 py-3 text-right">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-800/50 text-sm">
//                 {history.map(dep => (
//                   <tr key={dep._id} className="hover:bg-gray-800/20 transition-all">
//                     <td className="px-4 py-3">
//                       <div className="flex items-center gap-2">
//                         <FileCode size={14} className="text-amber-400" />
//                         <span className="text-white font-mono text-xs">{dep.filename}</span>
//                       </div>
//                     </td>
//                     <td className="px-4 py-3">
//                       <span className="text-xs text-gray-400 font-mono bg-gray-800 px-2 py-0.5 rounded">{dep.version}</span>
//                     </td>
//                     <td className="px-4 py-3 text-xs text-gray-400">{dep.deviceName}</td>
//                     <td className="px-4 py-3 text-xs text-gray-500">{dep.fileSize}B</td>
//                     <td className="px-4 py-3">
//                       <StatusBadge status={dep.status} />
//                     </td>
//                     <td className="px-4 py-3 text-xs text-gray-500">
//                       {new Date(dep.deployedAt).toLocaleString()}
//                     </td>
//                     <td className="px-4 py-3">
//                       <div className="flex items-center gap-1 justify-end">
//                         <button
//                           onClick={() => handleRedeploy(dep)}
//                           className="p-1.5 text-gray-600 hover:text-amber-400 rounded hover:bg-amber-500/10 transition-all"
//                           title="Re-deploy this code"
//                         >
//                           <RotateCcw size={14} />
//                         </button>
//                         <button
//                           onClick={() => handleDeleteRecord(dep._id)}
//                           className="p-1.5 text-gray-600 hover:text-red-400 rounded hover:bg-red-500/10 transition-all"
//                           title="Delete record"
//                         >
//                           <Trash2 size={14} />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         ) : (
//           <div className="flex flex-col items-center justify-center py-10 text-gray-600">
//             <Upload size={40} className="mb-3 text-gray-700" />
//             <p className="text-sm font-medium text-gray-500">No deployments yet</p>
//             <p className="text-xs text-gray-600 mt-1">Deploy your first update using the editor above</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// // ============================================================
// // STATUS BADGE
// // ============================================================
// const StatusBadge = ({ status }) => {
//   const config = {
//     pending: { icon: <Clock size={12} />, text: 'Pending', class: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
//     deployed: { icon: <Wifi size={12} />, text: 'Deployed', class: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
//     acknowledged: { icon: <CheckCircle size={12} />, text: 'Acknowledged', class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
//     failed: { icon: <XCircle size={12} />, text: 'Failed', class: 'bg-red-500/10 text-red-400 border-red-500/20' },
//   };
//   const c = config[status] || config.pending;
//   return (
//     <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${c.class}`}>
//       {c.icon} {c.text}
//     </span>
//   );
// };

// // ============================================================
// // DEPLOY STATUS BAR
// // ============================================================
// const DeployStatusBar = ({ status, message }) => {
//   const config = {
//     pending: { bg: 'bg-gray-500/10 border-gray-500/20', icon: <Loader2 size={16} className="text-gray-400 animate-spin" />, color: 'text-gray-300' },
//     deployed: { bg: 'bg-blue-500/10 border-blue-500/20', icon: <Wifi size={16} className="text-blue-400 animate-pulse" />, color: 'text-blue-300' },
//     acknowledged: { bg: 'bg-emerald-500/10 border-emerald-500/20', icon: <CheckCircle size={16} className="text-emerald-400" />, color: 'text-emerald-300' },
//     failed: { bg: 'bg-red-500/10 border-red-500/20', icon: <XCircle size={16} className="text-red-400" />, color: 'text-red-300' },
//   };
//   const c = config[status] || config.pending;
//   return (
//     <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl border ${c.bg}`}>
//       {c.icon}
//       <p className={`text-sm font-medium ${c.color}`}>{message}</p>
//     </div>
//   );
// };

// export default OTAManager;
