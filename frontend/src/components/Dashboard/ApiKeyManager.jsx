"use client";
import React, { useState, useEffect } from 'react';
import API from '@/utils/api';

export default function ApiKeyManager() {
  
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [visibleKeys, setVisibleKeys] = useState({}); // Kaunsi key dikhni hai aur kaunsi hide (***)
  const [copiedId, setCopiedId] = useState(null);     // Copy hone par tick (✔️) dikhane ke liye

  // 2. LOGIC FUNCTIONS
  // 1. Database se keys fetch karna (Mount hone par)
  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
      const { data } = await API.get('/apikeys', config);
      setApiKeys(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching keys", err);
    }
  };

  // 1. Modal open karne ke liye
  const openModal = () => {
    setNewKeyName(`Device-${apiKeys.length + 1}`); // Default name set karein
    setIsModalOpen(true);
  };

  // 2. Asli generation function
  const handleGenerate = async () => {
    if (!newKeyName.trim()) return alert("Please enter a name");

    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
      const { data } = await API.post('/apikeys/generate', { name: newKeyName }, config);

      setApiKeys((prev) => [data, ...prev]);
      setIsModalOpen(false); // Modal band karein
      setNewKeyName(""); // Input clear karein
    } catch (err) {
      alert("Error generating key");
    }
  };

  // 3. Key Delete (Revoke) from DB
  const deleteKey = async (id) => {
    if (window.confirm("Are you sure? This key will stop working immediately!")) {
      try {
        const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
        await API.delete(`/apikeys/${id}`, config);
        setApiKeys(apiKeys.filter(k => k._id !== id));
      } catch (err) {
        alert("Error deleting key");
      }
    }
  };

  const toggleVisibility = (id) => {
    setVisibleKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (id, keyString) => {
    navigator.clipboard.writeText(keyString);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) return <div className="text-white text-center p-10">Loading Keys...</div>;


  // 3. UI RENDER
  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-[#0b1120]">

      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <svg className="w-7 h-7 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
            API Key Management
          </h2>
          <p className="text-slate-400 text-sm mt-1">Manage your Device API keys for Sentinel Cloud integrations.</p>
        </div>
        {/* --- MODAL POPUP --- */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-[#0F172A] border border-slate-700 p-6 rounded-2xl w-full max-w-md shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Create New API Key
              </h3>

              <p className="text-slate-400 text-sm mb-4">Give your device a name to identify it later.</p>

              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g. ESP32-Living-Room"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-all mb-6"
                autoFocus
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:bg-slate-800 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerate}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold transition-all"
                >
                  Generate Key
                </button>
              </div>
            </div>
          </div>
        )}
        <button
          onClick={openModal}
          className="bg-cyan-500/10 border border-cyan-600 text-cyan-500 px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
          Create New Key
        </button>
      </div>

      {/* --- KEYS LIST SECTION --- */}
      <div className="space-y-4">
        {apiKeys.length === 0 ? (
          <div className="text-center py-10 bg-[#0F172A]/50 rounded-xl border border-slate-800 border-dashed">
            <p className="text-slate-500 font-medium">No API keys found. Create one to get started.</p>
          </div>
        ) : (
          apiKeys.map((item) => (
            <div key={item._id} className="bg-[#0F172A] border border-slate-700/60 rounded-xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all hover:border-slate-600">

              {/* Left Side: Name aur Key */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-white font-bold text-base">{item.name}</h3>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">Created: {new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>

                <div className="flex items-center gap-3 font-mono text-sm">
                  <span className={`${visibleKeys[item._id] ? 'text-emerald-400' : 'text-slate-400'} tracking-wider`}>
                    {visibleKeys[item._id] ? item.key : 'sk-sentinel-************************'}
                  </span>
                </div>
              </div>

              {/* Right Side: Action Buttons */}
              <div className="flex items-center gap-2">

                {/* 1. Show/Hide Button */}
                <button
                  onClick={() => toggleVisibility(item._id)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors border border-slate-700"
                  title={visibleKeys[item._id] ? "Hide Key" : "View Key"}
                >
                  {visibleKeys[item._id] ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                  )}
                </button>

                {/* 2. Copy Button */}
                <button
                  onClick={() => copyToClipboard(item._id, item.key)}
                  className={`p-2 rounded-lg transition-colors border ${copiedId === item._id ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border-slate-700'}`}
                  title="Copy Key"
                >
                  {copiedId === item._id ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                  )}
                </button>

                {/* 3. Delete (Revoke) Button */}
                <button
                  onClick={() => deleteKey(item._id)}
                  className="p-2 bg-slate-800 hover:bg-rose-500 hover:text-white text-rose-400 rounded-lg transition-colors border border-slate-700 hover:border-rose-500 ml-2"
                  title="Revoke Key"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>

            </div>
          ))
        )}
      </div>

      <div className="mt-6 p-4 bg-cyan-900/10 border border-cyan-800/30 rounded-xl">
        <p className="text-xs text-cyan-500/80 font-medium">
          <strong className="text-cyan-400 uppercase tracking-widest mr-1">Security Tip:</strong>
          Do not share your API keys in public repositories. Sentinel Cloud uses these keys to process IoT logic.
        </p>
      </div>

    </div>
  );
}