import React, { useState, useRef, useEffect } from 'react';
import { Bell, User } from 'lucide-react';
import API from '@/utils/api';
import SettingsModal from './SettingsModal';


const Topbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const menuRef = useRef(null);
  const notifRef = useRef(null);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setIsMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(event.target)) setIsNotifOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const fetchNotifications = async () => {
    try {
      const response = await API.get("/notifications/");
      console.log(response.data);
      if (response.data.success) {
        setNotifications(response.data.data);
      }
    } catch (error) {
      console.error('Alerts fetch error:', error);
    }
  };

  useEffect(() => {

    fetchNotifications();
    //Har 30 seconds mein refresh karne ke liye(real-time feel)
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/auth/login";
  };

  return (
    <header className="h-16 bg-[#0B1120]/80 border-b border-slate-800 flex items-center justify-between px-8 sticky top-0 z-50">
      <h1 className="text-xl font-semibold tracking-tight text-white">IoT Monitoring Dashboard</h1>

      <div className="flex items-center gap-6">
        {/* <Link href="/dashboard/devices/addDevice">
          <button className="hidden md:block bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 px-4 py-2 font-bold transition-all">
            + Add Device
          </button>
        </Link>
         */}

        {/* Notification Bell with Dropdown */}
        <div className="relative">
          {/* Aapka existing Bell container, bas onClick aur cursor-pointer add kiya hai */}
          <div
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="h-10 w-10 bg-cyan-500/20 border border-cyan-500/50 rounded-lg flex items-center justify-center text-cyan-400 cursor-pointer relative transition hover:bg-cyan-500/30"
          >
            <Bell size={20} />

            {/* Red Badge for Unread Count (Absolute position to stick to the corner) */}
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 border-2 border-[#0f172a] rounded-full">
                {unreadCount}
              </span>
            )}
          </div>

          {/* Dropdown Menu (Aapke UI ke hisaab se dark theme) */}
          {isNotifOpen && (
            <div className="absolute right-0 w-80 mt-3 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl overflow-hidden z-50">
              <div className="bg-slate-900/50 px-4 py-3 border-b border-slate-700 flex justify-between items-center">
                <h3 className="text-sm font-semibold text-slate-200">Alerts</h3>
                <span className="text-xs text-cyan-400 cursor-pointer hover:underline">Mark all as read</span>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-sm text-slate-400 text-center">Koi naya alert nahi hai</div>
                ) : (
                  notifications.map((alert) => (
                    <div
                      key={alert._id}
                      className={`px-4 py-3 border-b border-slate-700/50 hover:bg-slate-700/30 transition ${alert.isRead ? 'opacity-50' : 'bg-slate-800'}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-200">{alert.title}</span>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${alert.type === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                          alert.type === 'warning' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                            'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                          }`}>
                          {alert.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{alert.message}</p>
                    </div>
                  ))
                )}
              </div>
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