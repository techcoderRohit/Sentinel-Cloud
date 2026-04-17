"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, ShieldBan, ShieldCheck, Trash2, Eye, X, Users, UserCheck, UserX, ChevronLeft, ChevronRight, Cpu } from 'lucide-react';
import { getAllUsers, blockUser, deleteUserAdmin } from '@/utils/adminAPI';
import toast from 'react-hot-toast';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState('');

  const fetchUsers = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const res = await getAllUsers({
        page,
        limit: 15,
        search,
        role: roleFilter,
        status: statusFilter
      });
      setUsers(res.data);
      setPagination(res.pagination);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, statusFilter]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchUsers(1);
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchUsers]);

  const handleBlock = async (userId) => {
    try {
      setActionLoading(userId);
      const res = await blockUser(userId);
      toast.success(res.message);
      fetchUsers(pagination.page);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user');
    } finally {
      setActionLoading('');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setActionLoading(deleteTarget._id);
      const res = await deleteUserAdmin(deleteTarget._id);
      toast.success(res.message);
      setShowDeleteModal(false);
      setDeleteTarget(null);
      fetchUsers(pagination.page);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    } finally {
      setActionLoading('');
    }
  };

  const getRoleBadge = (role) => {
    const styles = {
      admin: 'bg-red-500/10 text-red-400 border-red-500/20',
      user: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      guest: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    };
    return styles[role] || styles.user;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">User Management</h1>
          <p className="text-slate-400 mt-1">Manage all platform users</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg">
            <Users size={16} className="text-blue-400" />
            <span className="text-sm text-slate-300">{pagination.total} total users</span>
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
            placeholder="Search by name or email..."
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

        {/* Role Filter */}
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-sm text-slate-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-red-500/50"
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="guest">Guest</option>
          </select>
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-sm text-slate-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-red-500/50"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Users size={48} className="mb-3 opacity-50" />
            <p className="text-lg font-medium">No users found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-800/30">
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">User</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Role</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Status</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Devices</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Last Login</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Joined</th>
                  <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                          user.isBlocked ? 'bg-gradient-to-br from-red-800 to-red-900' : 'bg-gradient-to-br from-slate-600 to-slate-700'
                        }`}>
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{user.name}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getRoleBadge(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.isBlocked ? (
                        <span className="flex items-center gap-1.5 text-xs font-medium text-red-400">
                          <span className="w-2 h-2 rounded-full bg-red-500"></span>
                          Blocked
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-slate-300">
                        <Cpu size={14} className="text-slate-500" />
                        {user.deviceCount || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-slate-400">{formatDate(user.lastLogin)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-slate-500">{formatDate(user.createdAt)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {/* View Details */}
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>

                        {/* Block/Unblock */}
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => handleBlock(user._id)}
                            disabled={actionLoading === user._id}
                            className={`p-2 rounded-lg transition-all disabled:opacity-50 ${
                              user.isBlocked
                                ? 'text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10'
                                : 'text-slate-400 hover:text-amber-400 hover:bg-amber-500/10'
                            }`}
                            title={user.isBlocked ? 'Unblock User' : 'Block User'}
                          >
                            {user.isBlocked ? <ShieldCheck size={16} /> : <ShieldBan size={16} />}
                          </button>
                        )}

                        {/* Delete */}
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => { setDeleteTarget(user); setShowDeleteModal(true); }}
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                            title="Delete User"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
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
                onClick={() => fetchUsers(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg disabled:opacity-30 transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => fetchUsers(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg disabled:opacity-30 transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedUser(null)}>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-lg w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">User Details</h3>
              <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-white p-1">
                <X size={20} />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-800">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-2xl font-bold text-white">
                {selectedUser.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white">{selectedUser.name}</h4>
                <p className="text-sm text-slate-400">{selectedUser.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${getRoleBadge(selectedUser.role)}`}>
                    {selectedUser.role}
                  </span>
                  {selectedUser.isBlocked && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                      Blocked
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wider">Devices</p>
                <p className="text-xl font-bold text-white mt-1">{selectedUser.deviceCount || 0}</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wider">Status</p>
                <p className={`text-xl font-bold mt-1 ${selectedUser.isBlocked ? 'text-red-400' : 'text-emerald-400'}`}>
                  {selectedUser.isBlocked ? 'Blocked' : 'Active'}
                </p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wider">Last Login</p>
                <p className="text-sm text-white mt-1">{formatDate(selectedUser.lastLogin)}</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wider">Joined</p>
                <p className="text-sm text-white mt-1">{formatDate(selectedUser.createdAt)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6 pt-6 border-t border-slate-800">
              {selectedUser.role !== 'admin' && (
                <>
                  <button
                    onClick={() => { handleBlock(selectedUser._id); setSelectedUser(null); }}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                      selectedUser.isBlocked
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'
                    }`}
                  >
                    {selectedUser.isBlocked ? <ShieldCheck size={16} /> : <ShieldBan size={16} />}
                    {selectedUser.isBlocked ? 'Unblock' : 'Block'}
                  </button>
                  <button
                    onClick={() => { setDeleteTarget(selectedUser); setShowDeleteModal(true); setSelectedUser(null); }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg font-medium text-sm hover:bg-red-500/20 transition-all"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </>
              )}
              <button
                onClick={() => setSelectedUser(null)}
                className="flex-1 px-4 py-2.5 bg-slate-800 text-slate-300 rounded-lg font-medium text-sm hover:bg-slate-700 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deleteTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => { setShowDeleteModal(false); setDeleteTarget(null); }}>
          <div className="bg-slate-900 border border-red-500/20 rounded-2xl p-8 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                <Trash2 size={28} className="text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Delete User?</h3>
              <p className="text-sm text-slate-400 mb-2">
                Are you sure you want to delete <span className="text-white font-medium">{deleteTarget.name}</span>?
              </p>
              <p className="text-xs text-red-400 bg-red-500/5 border border-red-500/10 rounded-lg px-4 py-2 mb-6">
                This will permanently delete the user, their devices, API keys, and all sensor data. This action cannot be undone.
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
                  {actionLoading === deleteTarget._id ? 'Deleting...' : 'Delete User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
