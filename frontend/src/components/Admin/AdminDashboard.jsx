"use client";
import React, { useState, useEffect } from 'react';
import { Users, Cpu, Activity, ShieldAlert, TrendingUp, UserPlus, HardDrive, Clock } from 'lucide-react';
import { getAdminStats, getActivityLog } from '@/utils/adminAPI';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, activityRes] = await Promise.all([
        getAdminStats(),
        getActivityLog()
      ]);
      setStats(statsRes.data);
      setActivity(activityRes.data);
    } catch (error) {
      toast.error('Failed to load admin dashboard');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.users?.total || 0,
      subtitle: `+${stats?.users?.newThisWeek || 0} this week`,
      icon: <Users size={24} />,
      gradient: 'from-blue-500 to-blue-600',
      shadowColor: 'shadow-blue-500/20',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-400'
    },
    {
      title: 'Total Devices',
      value: stats?.devices?.total || 0,
      subtitle: `${stats?.devices?.online || 0} online`,
      icon: <Cpu size={24} />,
      gradient: 'from-emerald-500 to-emerald-600',
      shadowColor: 'shadow-emerald-500/20',
      bgColor: 'bg-emerald-500/10',
      textColor: 'text-emerald-400'
    },
    {
      title: 'Active Users',
      value: stats?.users?.active || 0,
      subtitle: `${stats?.users?.guests || 0} guests`,
      icon: <Activity size={24} />,
      gradient: 'from-violet-500 to-violet-600',
      shadowColor: 'shadow-violet-500/20',
      bgColor: 'bg-violet-500/10',
      textColor: 'text-violet-400'
    },
    {
      title: 'Blocked Users',
      value: stats?.users?.blocked || 0,
      subtitle: 'Restricted accounts',
      icon: <ShieldAlert size={24} />,
      gradient: 'from-red-500 to-red-600',
      shadowColor: 'shadow-red-500/20',
      bgColor: 'bg-red-500/10',
      textColor: 'text-red-400'
    }
  ];

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-slate-400 mt-1">Platform overview and analytics</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className={`relative overflow-hidden bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all duration-300 group`}
          >
            {/* Background glow */}
            <div className={`absolute top-0 right-0 w-32 h-32 ${card.bgColor} rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity`}></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white shadow-lg ${card.shadowColor}`}>
                  {card.icon}
                </div>
                <TrendingUp size={16} className={card.textColor} />
              </div>
              <h3 className="text-sm font-medium text-slate-400">{card.title}</h3>
              <p className="text-3xl font-bold text-white mt-1">{card.value.toLocaleString()}</p>
              <p className={`text-xs ${card.textColor} mt-2 font-medium`}>{card.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registration Trend */}
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-400" />
            User Registration Trend
          </h3>
          <div className="space-y-3">
            {stats?.registrationTrend?.map((day, i) => {
              const maxCount = Math.max(...(stats.registrationTrend?.map(d => d.count) || [1]), 1);
              const percentage = (day.count / maxCount) * 100;
              return (
                <div key={i} className="flex items-center gap-4">
                  <span className="text-xs text-slate-500 w-20 font-mono">{day.date.slice(5)}</span>
                  <div className="flex-1 h-7 bg-slate-800 rounded-lg overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg transition-all duration-1000 flex items-center justify-end pr-2"
                      style={{ width: `${Math.max(percentage, 8)}%` }}
                    >
                      <span className="text-[10px] text-white font-bold">{day.count}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Device Distribution */}
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <HardDrive size={20} className="text-emerald-400" />
            Device Status & Distribution
          </h3>

          {/* Online vs Offline */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Device Status</span>
              <span className="text-sm text-slate-500">{stats?.devices?.total || 0} total</span>
            </div>
            <div className="flex h-8 rounded-lg overflow-hidden bg-slate-800">
              {stats?.devices?.total > 0 && (
                <>
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-emerald-400 flex items-center justify-center transition-all duration-1000"
                    style={{ width: `${(stats.devices.online / stats.devices.total) * 100}%` }}
                  >
                    <span className="text-[10px] text-white font-bold">{stats.devices.online} Online</span>
                  </div>
                  <div
                    className="bg-gradient-to-r from-slate-600 to-slate-500 flex items-center justify-center transition-all duration-1000"
                    style={{ width: `${(stats.devices.offline / stats.devices.total) * 100}%` }}
                  >
                    <span className="text-[10px] text-white font-bold">{stats.devices.offline} Offline</span>
                  </div>
                </>
              )}
              {(!stats?.devices?.total || stats.devices.total === 0) && (
                <div className="w-full flex items-center justify-center">
                  <span className="text-xs text-slate-500">No devices registered</span>
                </div>
              )}
            </div>
          </div>

          {/* Device Type Distribution */}
          <div className="space-y-3">
            <span className="text-sm text-slate-400">By Type</span>
            {stats?.deviceTypeDistribution?.length > 0 ? (
              stats.deviceTypeDistribution.map((item, i) => {
                const colors = ['from-violet-500 to-purple-500', 'from-amber-500 to-orange-500', 'from-cyan-500 to-blue-500'];
                const total = stats.devices.total || 1;
                return (
                  <div key={i} className="flex items-center gap-4">
                    <span className="text-xs text-slate-400 w-20">{item.type}</span>
                    <div className="flex-1 h-6 bg-slate-800 rounded-md overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${colors[i % colors.length]} rounded-md flex items-center justify-end pr-2 transition-all duration-1000`}
                        style={{ width: `${Math.max((item.count / total) * 100, 10)}%` }}
                      >
                        <span className="text-[10px] text-white font-bold">{item.count}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-500">No device type data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Activity Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Logins */}
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock size={20} className="text-amber-400" />
            Recent Logins
          </h3>
          <div className="space-y-1 max-h-[320px] overflow-y-auto custom-scrollbar">
            {activity?.recentLogins?.length > 0 ? (
              activity.recentLogins.slice(0, 10).map((user, i) => (
                <div key={i} className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-xs text-white font-bold">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">{formatDate(user.lastLogin)}</p>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      user.role === 'admin' ? 'bg-red-500/10 text-red-400' :
                      user.role === 'guest' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-blue-500/10 text-blue-400'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">No login activity</p>
            )}
          </div>
        </div>

        {/* Recent Registrations */}
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <UserPlus size={20} className="text-emerald-400" />
            Recent Registrations
          </h3>
          <div className="space-y-1 max-h-[320px] overflow-y-auto custom-scrollbar">
            {activity?.recentRegistrations?.length > 0 ? (
              activity.recentRegistrations.slice(0, 10).map((user, i) => (
                <div key={i} className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-700 flex items-center justify-center text-xs text-white font-bold">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">{formatDate(user.createdAt)}</p>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      user.role === 'admin' ? 'bg-red-500/10 text-red-400' :
                      user.role === 'guest' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-blue-500/10 text-blue-400'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">No registrations yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Data Points Summary */}
      <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Activity size={20} className="text-cyan-400" />
              Platform Data Summary
            </h3>
            <p className="text-slate-400 text-sm mt-1">Total sensor data points collected across all devices</p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              {(stats?.dataPoints || 0).toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 mt-1">Total Data Points</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
