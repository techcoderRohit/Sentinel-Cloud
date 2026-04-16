import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bell, User, Flame, AlertTriangle, Info, Trash2, Check, CheckCheck, Volume2, VolumeX } from 'lucide-react';
import { io } from 'socket.io-client';
import API from '@/utils/api';
import { markNotificationRead, markAllNotificationsRead, deleteNotification } from '@/utils/dashboardAPI';
import SettingsModal from './SettingsModal';
import Link from 'next/link';


const Topbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [hasNewAlert, setHasNewAlert] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const menuRef = useRef(null);
  const notifRef = useRef(null);
  const socketRef = useRef(null);
  const audioRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setIsMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(event.target)) setIsNotifOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      const response = await API.get("/notifications/");
      if (response.data.success) {
        setNotifications(response.data.data);
      }
    } catch (error) {
      console.error('Alerts fetch error:', error);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Socket.io real-time notification listener
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5100');
    socketRef.current = socket;

    socket.on('new_notification', (notification) => {
      // Add to top of list
      setNotifications(prev => [notification, ...prev]);
      setHasNewAlert(true);

      // Play sound for critical alerts
      if (notification.type === 'critical' && soundEnabled) {
        playAlertSound();
      }

      // Browser push notification
      sendBrowserNotification(notification);

      // Auto-clear the "new" animation after 3 seconds
      setTimeout(() => setHasNewAlert(false), 3000);
    });

    return () => socket.disconnect();
  }, [soundEnabled]);

  // Request browser notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Play alert sound
  const playAlertSound = () => {
    try {
      // Create a simple beep using Web Audio API
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
    } catch (e) {
      // Audio not available, skip silently
    }
  };

  // Send browser push notification
  const sendBrowserNotification = (notification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const icon = notification.type === 'critical' ? '🔥' : notification.type === 'warning' ? '⚠️' : 'ℹ️';
      new Notification(`${icon} ${notification.title}`, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification._id, // Prevent duplicate notifications
        requireInteraction: notification.type === 'critical'
      });
    }
  };

  // Mark single as read
  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Mark all read error:', err);
    }
  };

  // Delete notification
  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error('Delete notification error:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const hasCritical = notifications.some(n => !n.isRead && n.type === 'critical');

  // Time ago formatter
  const timeAgo = (dateStr) => {
    const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  // Severity config
  const getSeverityConfig = (type) => {
    switch (type) {
      case 'critical':
        return {
          icon: <Flame size={14} className="text-red-400" />,
          badge: 'bg-red-500/20 text-red-400 border-red-500/30',
          border: 'border-l-red-500',
          bg: 'bg-red-500/5'
        };
      case 'warning':
        return {
          icon: <AlertTriangle size={14} className="text-amber-400" />,
          badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
          border: 'border-l-amber-500',
          bg: 'bg-amber-500/5'
        };
      default:
        return {
          icon: <Info size={14} className="text-cyan-400" />,
          badge: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
          border: 'border-l-cyan-500',
          bg: 'bg-cyan-500/5'
        };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/auth/login";
  };

  return (
    <header className="h-16 bg-[#0B1120]/80 border-b border-slate-800 flex items-center justify-between px-8 sticky top-0 z-50 backdrop-blur-sm">
      <h1 className="text-xl font-semibold tracking-tight text-white">IoT Monitoring Dashboard</h1>

      <div className="flex items-center gap-6">

        {/* Notification Bell with Dropdown */}
        <div className="relative" ref={notifRef}>
          <div
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className={`h-10 w-10 rounded-lg flex items-center justify-center cursor-pointer relative transition-all ${
              hasCritical
                ? 'bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30'
                : 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/30'
            }`}
          >
            {hasCritical ? <Flame size={20} className="animate-pulse" /> : <Bell size={20} />}

            {/* Unread Badge */}
            {unreadCount > 0 && (
              <span className={`absolute -top-1.5 -right-1.5 inline-flex items-center justify-center min-w-[20px] h-5 text-[10px] font-bold text-white border-2 border-[#0f172a] rounded-full px-1 ${
                hasCritical ? 'bg-red-500' : 'bg-cyan-500'
              }`}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}

            {/* Ping animation for new alerts */}
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
              {/* Header */}
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
                      <CheckCheck size={14} />
                      Read all
                    </button>
                  )}
                </div>
              </div>

              {/* Notification List */}
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
                        className={`px-4 py-3 border-b border-slate-800/50 border-l-2 ${config.border} hover:bg-slate-800/20 transition-all group ${
                          alert.isRead ? 'opacity-50' : config.bg
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="mt-0.5 shrink-0">{config.icon}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-sm font-semibold text-slate-200 truncate">{alert.title}</span>
                              </div>
                              <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{alert.message}</p>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded border ${config.badge}`}>
                                  {alert.type}
                                </span>
                                <span className="text-[10px] text-slate-600">{timeAgo(alert.createdAt)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Action buttons on hover */}
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

              {/* Footer */}
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

        {/* Profile Dropdown */}
        <div className="relative" ref={menuRef}>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center gap-2 p-1 rounded-full border border-transparent hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg"><User size={20} /></div>
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 mt-3 w-48 bg-[#0F172A] border border-slate-800 rounded-xl shadow-2xl py-2 z-50">
              <button
                onClick={() => {
                  setIsSettingsOpen(true);
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
              >
                Account Settings
              </button>

              {/* Modal Render */}
              <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                
              />
              <button className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">Admin Panel</button>
              <Link href="/guest-view">
                <button className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">Guest View</button>
              </Link>
              <div className="border-t border-slate-800 my-1"></div>
              <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/10">Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;