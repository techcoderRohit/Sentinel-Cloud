"use client"
import React, { useState, useRef, useEffect } from 'react';
import { Bell, Flame, AlertTriangle, Info, Trash2, Check, CheckCheck, Volume2, VolumeX, LogOut, ChevronDown } from 'lucide-react';
import { io } from 'socket.io-client';
import API from '@/utils/api';
import { markNotificationRead, markAllNotificationsRead, deleteNotification } from '@/utils/dashboardAPI';

import Link from 'next/link';

const Topbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [hasNewAlert, setHasNewAlert] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const menuRef = useRef(null);
  const notifRef = useRef(null);
  const socketRef = useRef(null);

  // ── Fetch logged-in user profile ──
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get('/user/profile');
        setUserProfile(res.data);
      } catch (err) {
        console.error('Profile fetch error:', err);
      }
    };
    fetchProfile();
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setIsMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(event.target)) setIsNotifOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await API.get("/notifications/");
      if (response.data.success) setNotifications(response.data.data);
    } catch (error) {
      console.error('Alerts fetch error:', error);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  // Socket.io real-time notification listener
  useEffect(() => {
    const socket = io('http://localhost:5000');
    socketRef.current = socket;

    socket.on('new_notification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setHasNewAlert(true);
      if (notification.type === 'critical' && soundEnabled) playAlertSound();
      sendBrowserNotification(notification);
      setTimeout(() => setHasNewAlert(false), 3000);
    });

    return () => socket.disconnect();
  }, [soundEnabled]);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const playAlertSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.15;
      oscillator.start();
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      oscillator.stop(ctx.currentTime + 0.5);
    } catch (e) { }
  };

  const sendBrowserNotification = (notification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const icon = notification.type === 'critical' ? '🔥' : notification.type === 'warning' ? '⚠️' : 'ℹ️';
      new Notification(`${icon} ${notification.title}`, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification._id,
        requireInteraction: notification.type === 'critical'
      });
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) { console.error('Mark read error:', err); }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) { console.error('Mark all read error:', err); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) { console.error('Delete notification error:', err); }
  };

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/auth/login";
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const hasCritical = notifications.some(n => !n.isRead && n.type === 'critical');

  const timeAgo = (dateStr) => {
    const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getSeverityConfig = (type) => {
    switch (type) {
      case 'critical': return { icon: <Flame size={14} className="text-red-400" />, badge: 'bg-red-500/20 text-red-400 border-red-500/30', border: 'border-l-red-500', bg: 'bg-red-500/5' };
      case 'warning': return { icon: <AlertTriangle size={14} className="text-amber-400" />, badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30', border: 'border-l-amber-500', bg: 'bg-amber-500/5' };
      default: return { icon: <Info size={14} className="text-cyan-400" />, badge: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30', border: 'border-l-cyan-500', bg: 'bg-cyan-500/5' };
    }
  };

  // First letter of logged-in user's name
  const userInitial = userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : '?';

  // Role badge style
  const roleBadge = userProfile?.role === 'admin'
    ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
    : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';

  return (
    <header className="h-16 bg-[#0B1120]/80 border-b border-slate-800 flex items-center justify-between px-8 sticky top-0 z-50 backdrop-blur-sm">
      <h1 className="text-xl font-semibold tracking-tight text-white flex items-center gap-2">
        Welcome back, <span className="text-cyan-400">{userProfile?.name?.split(' ')[0] || 'User'}</span> ✋🏼
      </h1>

      <div className="flex items-center gap-3">

        {/* ── Notification Bell ── */}
        <div className="relative" ref={notifRef}>
          <div
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className={`h-10 w-10 rounded-lg flex items-center justify-center cursor-pointer relative transition-all ${hasCritical
                ? 'bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30'
                : 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/30'
              }`}
          >
            {hasCritical ? <Flame size={20} className="animate-pulse" /> : <Bell size={20} />}

            {unreadCount > 0 && (
              <span className={`absolute -top-1.5 -right-1.5 inline-flex items-center justify-center min-w-[20px] h-5 text-[10px] font-bold text-white border-2 border-[#0f172a] rounded-full px-1 bg-red-500 animate-in zoom-in duration-300`}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}

            {hasNewAlert && (
              <span className="absolute -top-1 -right-1 h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            )}
          </div>

          {/* Notification Dropdown */}
          {isNotifOpen && (
            <div className="absolute right-0 w-96 mt-3 bg-[#0f172a] border border-slate-700 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50">
              <div className="bg-[#0d1421] px-5 py-3.5 border-b border-slate-700/50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">Alerts</h3>
                  {unreadCount > 0 && (
                    <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-500/20 font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="text-slate-500 hover:text-slate-300 p-1 rounded transition-all"
                    title={soundEnabled ? 'Mute alerts' : 'Unmute alerts'}
                  >
                    {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                  </button>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-all"
                    >
                      <CheckCheck size={14} /> Read all
                    </button>
                  )}
                </div>
              </div>

              <div className="max-h-[420px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-5 py-12 text-center">
                    <Bell size={32} className="text-slate-700 mx-auto mb-3" />
                    <p className="text-sm text-slate-500 font-medium">No alerts yet</p>
                    <p className="text-xs text-slate-600 mt-1">Anomaly alerts will appear here in real-time</p>
                  </div>
                ) : (
                  notifications.slice(0, 20).map((alert) => {
                    const config = getSeverityConfig(alert.type);
                    return (
                      <div
                        key={alert._id}
                        className={`px-4 py-3 border-b border-slate-800/50 border-l-2 ${config.border} hover:bg-slate-800/20 transition-all group ${alert.isRead ? 'opacity-50' : config.bg}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="mt-0.5 shrink-0">{config.icon}</div>
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-semibold text-slate-200 truncate block">{alert.title}</span>
                              <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{alert.message}</p>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded border ${config.badge}`}>{alert.type}</span>
                                <span className="text-[10px] text-slate-600">{timeAgo(alert.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            {!alert.isRead && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleMarkRead(alert._id); }}
                                className="p-1 text-slate-600 hover:text-cyan-400 rounded hover:bg-cyan-500/10 transition-all"
                                title="Mark as read"
                              >
                                <Check size={12} />
                              </button>
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(alert._id); }}
                              className="p-1 text-slate-600 hover:text-red-400 rounded hover:bg-red-500/10 transition-all"
                              title="Delete"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {notifications.length > 0 && (
                <div className="px-5 py-2.5 border-t border-slate-800 text-center">
                  <span className="text-[10px] text-slate-600 font-medium">
                    Showing latest {Math.min(notifications.length, 20)} of {notifications.length} alerts
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Profile Avatar + Logout ── */}
        <div className="relative flex items-center gap-2" ref={menuRef}>

          {/* Avatar Button — shows user's first initial */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-1.5 group"
            title={userProfile?.name || 'Profile'}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg ring-2 ring-transparent group-hover:ring-cyan-500/50 transition-all select-none">
              {userInitial}
            </div>
            <ChevronDown
              size={14}
              className={`text-gray-400 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Logout Button — always visible */}
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/40 transition-all text-xs font-semibold"
            title="Logout"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Logout</span>
          </button>

          {/* Profile Dropdown */}
          {isMenuOpen && (
            <div className="absolute right-0 top-12 w-72 bg-[#0F172A] border border-slate-700 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50">

              {/* Profile Card */}
              <div className="bg-gradient-to-br from-cyan-500/10 to-blue-600/10 px-5 py-4 border-b border-slate-700/50">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg select-none flex-shrink-0">
                    {userInitial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm truncate">{userProfile?.name || 'Loading...'}</p>
                    <p className="text-slate-400 text-xs truncate mt-0.5">{userProfile?.email || ''}</p>
                    {userProfile?.role && (
                      <span className={`inline-block mt-1.5 text-[10px] font-black uppercase px-2 py-0.5 rounded border ${roleBadge}`}>
                        {userProfile.role}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Meta info */}
              <div className="px-5 py-3 border-b border-slate-800 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-medium">Status</span>
                  <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                    Active
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-medium">Member since</span>
                  <span className="text-slate-300">
                    {userProfile?.createdAt
                      ? new Date(userProfile.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                      : '—'}
                  </span>
                </div>
              </div>

              {/* Menu actions */}
              <div className="py-2">
                <Link href="/dashboard/settings" onClick={() => setIsMenuOpen(false)}>
                  <button className="w-full text-left px-5 py-2.5 text-sm text-slate-300 hover:bg-slate-800/60 transition-all">
                    Account Settings
                  </button>
                </Link>
              </div>

            </div>
          )}

        </div>
      </div>
    </header>
  );
};

export default Topbar;