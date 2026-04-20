"use client";
import React, { useState, useEffect } from 'react';
import { X, Send, BellRing, Smartphone } from 'lucide-react';
import API from '@/utils/api';
import toast from 'react-hot-toast';

const SettingsModal = ({ isOpen, onClose, currentUser }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    telegramChatId: '',
    phoneNumber: ''
  });

  // Jab modal khule toh existing data fill ho jaye
  useEffect(() => {
    if (currentUser) {
      setFormData({
        telegramChatId: currentUser.telegramChatId || '',
        phoneNumber: currentUser.phoneNumber || ''
      });
    }
  }, [currentUser, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await API.put('/user/profile', formData);
      if (response.data.success) {
        toast.success("Settings saved successfully! 🚀");
        onClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-[#0F172A] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BellRing className="text-cyan-400" size={24} /> Notification Settings
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Telegram Field */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Telegram Chat ID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Send size={18} />
                </div>
                <input
                  type="text"
                  placeholder="e.g. 123456789"
                  className="w-full bg-[#0B1120] border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all outline-none"
                  value={formData.telegramChatId}
                  onChange={(e) => setFormData({...formData, telegramChatId: e.target.value})}
                />
              </div>
              <p className="mt-2 text-[11px] text-slate-500 leading-relaxed">
                Wanna get alerts on Telegram? Get your ID from <a href="https://t.me/userinfobot" target="_blank" className="text-cyan-500 hover:underline">@userinfobot</a> and paste here.
              </p>
            </div>

            {/* Phone Number Field */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Phone Number (SMS)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Smartphone size={18} />
                </div>
                <input
                  type="text"
                  placeholder="+91 0000000000"
                  className="w-full bg-[#0B1120] border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all outline-none"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Save Configuration"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;