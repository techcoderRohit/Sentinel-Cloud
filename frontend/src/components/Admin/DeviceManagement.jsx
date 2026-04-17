"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Trash2, Cpu, Wifi, WifiOff, X, ChevronLeft, ChevronRight, MapPin, Clock, User } from 'lucide-react';
import { getAllDevicesAdmin, deleteDeviceAdmin } from '@/utils/adminAPI';
import toast from 'react-hot-toast';

const DeviceManagement = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState('');

  const fetchDevices = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const res = await getAllDevicesAdmin({
        page,
        limit: 15,
        search,
        status: statusFilter,
        type: typeFilter
      });
      setDevices(res.data);
      setPagination(res.pagination);
    } catch (error) {
      toast.error('Failed to load devices');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, typeFilter]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchDevices(1);
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchDevices]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setActionLoading(deleteTarget._id);
      const res = await deleteDeviceAdmin(deleteTarget._id);
      toast.success(res.message);
      setShowDeleteModal(false);
      setDeleteTarget(null);
      fetchDevices(pagination.page);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete device');
    } finally {
      setActionLoading('');
    }
  };

  const getTypeBadge = (type) => {
    const styles = {
      Sensor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      Actuator: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
      Gateway: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    };
    return styles[type] || styles.Sensor;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const timeAgo = (dateStr) => {
    if (!dateStr) return 'Never';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Device Management</h1>
          <p className="text-slate-400 mt-1">Monitor and manage all platform devices</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg">
            <Cpu size={16} className="text-emerald-400" />
            <span className="text-sm text-slate-300">{pagination.total} total devices</span>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-4 bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-4">
        {/* Search */}
        <div className="flex-1 min-w-[250px] flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-3 focus-within:ring-2 focus-within:ring-red-500/50 transition">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search by device name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full py-2.5 bg-transparent text-white text-sm placeholder-slate-500 outline-none"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-slate-500 hover:text-white">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-sm text-slate-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-red-500/50"
          >
            <option value="">All Status</option>
            <option value="Online">Online</option>
            <option value="Offline">Offline</option>
          </select>
        </div>

        {/* Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-sm text-slate-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-red-500/50"
        >
          <option value="">All Types</option>
          <option value="Sensor">Sensor</option>
          <option value="Actuator">Actuator</option>
          <option value="Gateway">Gateway</option>
        </select>
      </div>

      {/* Devices Grid */}
      <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin"></div>
          </div>
        ) : devices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Cpu size={48} className="mb-3 opacity-50" />
            <p className="text-lg font-medium">No devices found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-800/30">
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Device</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Type</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Status</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Owner</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Location</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Last Active</th>
                  <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {devices.map((device) => (
                  <tr key={device._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                          device.status === 'Online'
                            ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30'
                            : 'bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-slate-700'
                        }`}>
                          <Cpu size={16} className={device.status === 'Online' ? 'text-emerald-400' : 'text-slate-500'} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{device.deviceName}</p>
                          <p className="text-xs text-slate-500 font-mono">{device.deviceId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getTypeBadge(device.deviceType)}`}>
                        {device.deviceType || 'Sensor'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        {device.status === 'Online' ? (
                          <>
                            <Wifi size={14} className="text-emerald-400" />
                            <span className="text-xs font-medium text-emerald-400">Online</span>
                          </>
                        ) : (
                          <>
                            <WifiOff size={14} className="text-slate-500" />
                            <span className="text-xs font-medium text-slate-500">Offline</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {device.owner ? (
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-slate-500" />
                          <div>
                            <p className="text-sm text-slate-300">{device.owner.name}</p>
                            <p className="text-xs text-slate-500">{device.owner.email}</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">Unknown</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-slate-400">
                        <MapPin size={14} className="text-slate-500" />
                        {device.location || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} className="text-slate-500" />
                        <span className="text-xs text-slate-400">{timeAgo(device.lastActive)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end">
                        <button
                          onClick={() => { setDeleteTarget(device); setShowDeleteModal(true); }}
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                          title="Delete Device"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800">
            <span className="text-sm text-slate-500">
              Page {pagination.page} of {pagination.pages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchDevices(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg disabled:opacity-30 transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => fetchDevices(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg disabled:opacity-30 transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deleteTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => { setShowDeleteModal(false); setDeleteTarget(null); }}>
          <div className="bg-slate-900 border border-red-500/20 rounded-2xl p-8 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                <Trash2 size={28} className="text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Delete Device?</h3>
              <p className="text-sm text-slate-400 mb-2">
                Are you sure you want to delete <span className="text-white font-medium">{deleteTarget.deviceName}</span>?
              </p>
              <p className="text-xs text-slate-500 font-mono mb-2">ID: {deleteTarget.deviceId}</p>
              <p className="text-xs text-red-400 bg-red-500/5 border border-red-500/10 rounded-lg px-4 py-2 mb-6">
                This will permanently delete the device and all associated sensor data. This action cannot be undone.
              </p>

              <div className="flex items-center gap-3 w-full">
                <button
                  onClick={() => { setShowDeleteModal(false); setDeleteTarget(null); }}
                  className="flex-1 px-4 py-2.5 bg-slate-800 text-slate-300 rounded-lg font-medium text-sm hover:bg-slate-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={actionLoading === deleteTarget._id}
                  className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg font-medium text-sm hover:bg-red-600 transition-all disabled:opacity-50"
                >
                  {actionLoading === deleteTarget._id ? 'Deleting...' : 'Delete Device'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceManagement;
