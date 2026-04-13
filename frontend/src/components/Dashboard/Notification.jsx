'use client';
import { useState, useEffect } from 'react';
import API from '@/utils/api';
export default function NotificationBell({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Axios automatically JSON response ko parse kar deta hai, 
        // toh .json() karne ki zaroorat nahi padti.
        const response = await API.get(`/notifications/${userId}`);
        
        // Axios mein actual response data 'response.data' ke andar hota hai
        if (response.data.success) {
          setNotifications(response.data.data);
        }
      } catch (error) {
        console.error('Alerts fetch karne mein error:', error);
      }
    };

    if (userId) {
      fetchNotifications();
    }
  }, [userId]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
        </svg>
        
        {/* Red Badge for Unread Count */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 w-80 mt-2 bg-white rounded-lg shadow-xl overflow-hidden z-50 border border-gray-100">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-700">Notifications</h3>
            <span className="text-xs text-blue-600 cursor-pointer hover:underline">Mark all as read</span>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">Koi naya alert nahi hai</div>
            ) : (
              notifications.map((alert) => (
                <div 
                  key={alert._id} 
                  className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition ${alert.isRead ? 'opacity-60' : 'bg-blue-50/30'}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-800">{alert.title}</span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${
                      alert.type === 'critical' ? 'bg-red-100 text-red-600' : 
                      alert.type === 'warning' ? 'bg-yellow-100 text-yellow-600' : 
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {alert.type}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">{alert.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}