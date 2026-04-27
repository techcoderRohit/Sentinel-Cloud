"use client";
import React, { useState, useEffect } from 'react';
import API from '@/utils/api';
import {
  Settings as SettingsIcon,
  Bell,
  User,
  Mail,
  Lock,
  Shield,
  Trash2,
  Save,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  Calendar,
  BadgeCheck,
  LogOut,
  ChevronRight,
  Camera,
  ImagePlus,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function Settings() {
  const router = useRouter();

  // Profile state
  const [profile, setProfile] = useState({ name: '', email: '', role: '', createdAt: '', profilePicture: '', telegramChatId: '', phoneNumber: '' });
  const [profileForm, setProfileForm] = useState({ name: '', email: '', telegramChatId: '', phoneNumber: '' });
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileEdited, setProfileEdited] = useState(false);

  // Profile picture state
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = React.useRef(null);

  // Password state
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });

  // Delete account state
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [showDeleteZone, setShowDeleteZone] = useState(false);

  // Active section for mobile
  const [activeSection, setActiveSection] = useState('profile');

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    // Track if profile form has been edited
    setProfileEdited(
      profileForm.name !== profile.name || 
      profileForm.email !== profile.email ||
      profileForm.telegramChatId !== (profile.telegramChatId || '') ||
      profileForm.phoneNumber !== (profile.phoneNumber || '')
    );
  }, [profileForm, profile]);

  const fetchProfile = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
      const { data } = await API.get('/user/profile', config);
      setProfile(data);
      setProfileForm({ 
        name: data.name, 
        email: data.email, 
        telegramChatId: data.telegramChatId || '', 
        phoneNumber: data.phoneNumber || '' 
      });
    } catch (err) {
      console.error("Profile fetch error:", err);
      toast.error("Failed to load profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim() || !profileForm.email.trim()) {
      return toast.error("Name and email cannot be empty");
    }
    setProfileSaving(true);
    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
      const { data } = await API.put('/user/profile', profileForm, config);
      setProfile(prev => ({ 
        ...prev, 
        name: data.name, 
        email: data.email, 
        telegramChatId: data.telegramChatId,
        phoneNumber: data.phoneNumber 
      }));
      toast.success(data.message || "Profile updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return toast.error("File size must be under 5MB");
    }

    // Show preview immediately
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    setAvatarUploading(true);

    try {
      const formData = new FormData();
      formData.append('profilePicture', file);

      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      };
      const { data } = await API.post('/user/profile-picture', formData, config);
      setProfile(prev => ({ ...prev, profilePicture: data.profilePicture }));
      setAvatarPreview(null);
      toast.success(data.message || "Profile picture updated!");
    } catch (err) {
      setAvatarPreview(null);
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setAvatarUploading(false);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAvatarRemove = async () => {
    setAvatarUploading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
      await API.delete('/user/profile-picture', config);
      setProfile(prev => ({ ...prev, profilePicture: '' }));
      setAvatarPreview(null);
      toast.success("Profile picture removed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Remove failed");
    } finally {
      setAvatarUploading(false);
    }
  };

  const getAvatarUrl = () => {
    if (avatarPreview) return avatarPreview;
    if (profile.profilePicture) return `http://localhost:5000/uploads/avatars/${profile.profilePicture}`;
    return null;
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmNewPassword } = passwordForm;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return toast.error("Please fill all password fields");
    }
    if (newPassword.length < 6) {
      return toast.error("New password must be at least 6 characters");
    }
    if (newPassword !== confirmNewPassword) {
      return toast.error("New passwords do not match");
    }

    setPasswordSaving(true);
    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
      const { data } = await API.put('/user/change-password', passwordForm, config);
      toast.success(data.message || "Password changed successfully");
      setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || "Password change failed");
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      return toast.error('Type "DELETE" to confirm');
    }
    if (!deletePassword) {
      return toast.error("Enter your password to confirm");
    }

    setDeleting(true);
    try {
      const config = {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        data: { password: deletePassword }
      };
      await API.delete('/user/delete-account', config);
      toast.success("Account deleted. Goodbye!");
      localStorage.removeItem('token');
      router.push('/auth/login');
    } catch (err) {
      toast.error(err.response?.data?.message || "Deletion failed");
    } finally {
      setDeleting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success("Logged out successfully");
    router.push('/auth/login');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '--';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const getPasswordStrength = (password) => {
    if (!password) return { label: '', color: '', width: '0%' };
    if (password.length < 6) return { label: 'Weak', color: 'text-red-400', barColor: 'bg-red-500', width: '25%' };
    if (password.length < 10) return { label: 'Fair', color: 'text-amber-400', barColor: 'bg-amber-500', width: '50%' };
    if (/[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) {
      return { label: 'Strong', color: 'text-emerald-400', barColor: 'bg-emerald-500', width: '100%' };
    }
    return { label: 'Good', color: 'text-cyan-400', barColor: 'bg-cyan-500', width: '75%' };
  };

  const strength = getPasswordStrength(passwordForm.newPassword);

  const sidebarItems = [
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
    { id: 'security', label: 'Security', icon: <Lock className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'danger', label: 'Danger Zone', icon: <AlertTriangle className="w-4 h-4" /> },
  ];

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
          <p className="text-slate-400 font-medium text-sm tracking-wider uppercase">Loading Settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">

      {/* ===== HEADER ===== */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <SettingsIcon className="w-7 h-7 text-cyan-500" />
            Account Settings
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Manage your profile, security, and account preferences.
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-5 py-2.5 bg-rose-500/10 border border-rose-600/40 text-rose-400 rounded-xl font-bold text-sm hover:bg-rose-500/20 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">

        {/* ===== SETTINGS SIDEBAR ===== */}
        <div className="lg:w-64 shrink-0">
          <div className="bg-[#0F172A] border border-slate-700/60 rounded-2xl p-3 lg:sticky lg:top-24">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all mb-1 ${
                  activeSection === item.id
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  {item.label}
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${activeSection === item.id ? 'rotate-90' : ''}`} />
              </button>
            ))}
          </div>
        </div>

        {/* ===== SETTINGS CONTENT ===== */}
        <div className="flex-1 space-y-6">

          {/* ========== PROFILE SECTION ========== */}
          {activeSection === 'profile' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Profile Card */}
              <div className="bg-[#0F172A] border border-slate-700/60 rounded-2xl overflow-hidden">
                {/* Profile Header Banner */}
                <div className="h-28 bg-gradient-to-r from-cyan-600/20 via-blue-600/20 to-purple-600/20 relative">
                  <div className="absolute -bottom-12 left-6">
                    {/* Avatar with edit overlay */}
                    <div className="relative group">
                      {/* Hidden file input */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                        onChange={handleAvatarUpload}
                        className="hidden"
                        id="avatar-upload"
                      />

                      {/* Avatar Display */}
                      <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-[#0F172A] shadow-xl shadow-cyan-500/20 relative">
                        {getAvatarUrl() ? (
                          <img
                            src={getAvatarUrl()}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-3xl font-black">
                            {profile.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                        )}

                        {/* Upload overlay on hover */}
                        {!avatarUploading && (
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer"
                          >
                            <Camera className="w-6 h-6 text-white" />
                          </div>
                        )}

                        {/* Loading spinner during upload */}
                        {avatarUploading && (
                          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                          </div>
                        )}
                      </div>

                      {/* Remove button (shows when there's a picture) */}
                      {(profile.profilePicture || avatarPreview) && !avatarUploading && (
                        <button
                          onClick={handleAvatarRemove}
                          className="absolute -top-1 -right-1 w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-rose-600 shadow-lg"
                          title="Remove picture"
                        >
                          <X className="w-3.5 h-3.5 text-white" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-16 px-6 pb-6">
                  {/* Upload hint */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-xl font-bold text-white">{profile.name}</h3>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${
                          profile.role === 'admin'
                            ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                            : 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
                        }`}>
                          {profile.role}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500">{profile.email}</p>
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={avatarUploading}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all disabled:opacity-40"
                    >
                      <ImagePlus className="w-3.5 h-3.5" />
                      {profile.profilePicture ? 'Change Photo' : 'Upload Photo'}
                    </button>
                  </div>

                  <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Joined {formatDate(profile.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <BadgeCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-500">Active Account</span>
                    </div>
                  </div>

                  {/* File size hint */}
                  <p className="text-[10px] text-slate-600 mt-3">Hover over avatar to change. Supports JPG, PNG, WebP, GIF. Max 5MB.</p>
                </div>
              </div>

              {/* Edit Profile Form */}
              <div className="bg-[#0F172A] border border-slate-700/60 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                  <User className="w-4 h-4 text-cyan-500" />
                  Edit Profile
                </h3>

                <form onSubmit={handleProfileUpdate} className="space-y-5">
                  {/* Name Field */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Full Name</label>
                    <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl px-4 focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/20 transition-all">
                      <User className="w-4 h-4 text-slate-600 shrink-0" />
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        className="w-full px-3 py-3 bg-transparent text-white outline-none placeholder-slate-600 text-sm"
                        placeholder="Enter your name"
                      />
                    </div>
                  </div>

                  {/* Email Field */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Email Address</label>
                    <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl px-4 focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/20 transition-all">
                      <Mail className="w-4 h-4 text-slate-600 shrink-0" />
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        className="w-full px-3 py-3 bg-transparent text-white outline-none placeholder-slate-600 text-sm"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex items-center justify-between pt-2">
                    {profileEdited && (
                      <span className="text-xs text-amber-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Unsaved changes
                      </span>
                    )}
                    <button
                      type="submit"
                      disabled={!profileEdited || profileSaving}
                      className="ml-auto flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-sm rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {profileSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      {profileSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ========== SECURITY SECTION ========== */}
          {activeSection === 'security' && (
            <div className="animate-in fade-in duration-300">
              <div className="bg-[#0F172A] border border-slate-700/60 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-cyan-500" />
                  Change Password
                </h3>

                <form onSubmit={handlePasswordChange} className="space-y-5">
                  {/* Current Password */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Current Password</label>
                    <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl px-4 focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/20 transition-all">
                      <Lock className="w-4 h-4 text-slate-600 shrink-0" />
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        className="w-full px-3 py-3 bg-transparent text-white outline-none placeholder-slate-600 text-sm"
                        placeholder="Enter current password"
                      />
                      <button type="button" onClick={() => setShowPasswords(p => ({ ...p, current: !p.current }))} className="text-slate-600 hover:text-slate-400 transition-colors">
                        {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="h-px bg-slate-800"></div>

                  {/* New Password */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">New Password</label>
                    <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl px-4 focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/20 transition-all">
                      <Lock className="w-4 h-4 text-slate-600 shrink-0" />
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="w-full px-3 py-3 bg-transparent text-white outline-none placeholder-slate-600 text-sm"
                        placeholder="Enter new password (min 6 chars)"
                      />
                      <button type="button" onClick={() => setShowPasswords(p => ({ ...p, new: !p.new }))} className="text-slate-600 hover:text-slate-400 transition-colors">
                        {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {/* Password Strength Meter */}
                    {passwordForm.newPassword && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Strength</span>
                          <span className={`text-[10px] font-bold uppercase tracking-widest ${strength.color}`}>{strength.label}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${strength.barColor}`}
                            style={{ width: strength.width }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Confirm New Password</label>
                    <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl px-4 focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/20 transition-all">
                      <Lock className="w-4 h-4 text-slate-600 shrink-0" />
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordForm.confirmNewPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })}
                        className="w-full px-3 py-3 bg-transparent text-white outline-none placeholder-slate-600 text-sm"
                        placeholder="Confirm new password"
                      />
                      <button type="button" onClick={() => setShowPasswords(p => ({ ...p, confirm: !p.confirm }))} className="text-slate-600 hover:text-slate-400 transition-colors">
                        {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {/* Match indicator */}
                    {passwordForm.confirmNewPassword && (
                      <div className="flex items-center gap-1.5 mt-2">
                        {passwordForm.newPassword === passwordForm.confirmNewPassword ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Passwords match</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                            <span className="text-[10px] text-red-400 font-bold uppercase tracking-widest">Passwords do not match</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Change Password Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={passwordSaving || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmNewPassword}
                      className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-sm rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {passwordSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Lock className="w-4 h-4" />
                      )}
                      {passwordSaving ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>

                {/* Security Tips */}
                <div className="mt-8 p-4 bg-cyan-900/10 border border-cyan-800/30 rounded-xl">
                  <p className="text-xs text-cyan-500/80 font-medium">
                    <strong className="text-cyan-400 uppercase tracking-widest mr-1">Security Tip:</strong>
                    Use a strong password with a mix of uppercase, lowercase, numbers, and special characters. Never reuse passwords across platforms.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ========== NOTIFICATIONS SECTION ========== */}
          {activeSection === 'notifications' && (
            <div className="animate-in fade-in duration-300">
              <div className="bg-[#0F172A] border border-slate-700/60 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-cyan-500" />
                  Notification Preferences
                </h3>
                <p className="text-xs text-slate-500 mb-6">Configure how you receive alerts when anomalies are detected in your IoT devices.</p>

                <div className="space-y-4">
                  {/* Browser Push Toggle */}
                  <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-700 rounded-xl">
                    <div>
                      <h4 className="text-sm font-medium text-white">Browser Push Notifications</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Get native browser alerts for critical events</p>
                    </div>
                    <button
                      onClick={() => {
                        if ('Notification' in window) {
                          if (Notification.permission === 'default') {
                            Notification.requestPermission().then(p => {
                              if (p === 'granted') toast.success('Browser notifications enabled!');
                            });
                          } else if (Notification.permission === 'granted') {
                            toast.success('Browser notifications are already enabled');
                          } else {
                            toast.error('Notifications blocked. Enable in browser settings.');
                          }
                        }
                      }}
                      className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-lg text-xs font-bold hover:bg-cyan-500/20 transition-all"
                    >
                      {typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted' ? '✓ Enabled' : 'Enable'}
                    </button>
                  </div>

                  {/* Telegram Setup */}
                  <div className="p-4 bg-slate-900 border border-slate-700 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-sm font-medium text-white">Telegram Alerts</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Receive critical alerts via Telegram bot</p>
                      </div>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                        profile.telegramChatId ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-slate-500 bg-slate-800 border-slate-700'
                      }`}>
                        {profile.telegramChatId ? 'Connected' : 'Not Set'}
                      </span>
                    </div>

                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 mt-2">
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        <strong className="text-cyan-400">Setup Steps:</strong><br />
                        1. Open Telegram and search for <strong>@BotFather</strong><br />
                        2. Send <code className="bg-slate-700 px-1 rounded text-cyan-300">/newbot</code> and follow instructions<br />
                        3. Copy the bot token to your backend <code className="bg-slate-700 px-1 rounded text-cyan-300">.env</code> file<br />
                        4. Start a chat with your bot, then get your Chat ID from <strong>@userinfobot</strong><br />
                        5. Save your Chat ID below
                      </p>
                    </div>

                    <div className="mt-3">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Telegram Chat ID</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={profileForm.telegramChatId}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, telegramChatId: e.target.value }))}
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-cyan-500/50 text-sm font-mono"
                          placeholder="e.g. 123456789"
                        />
                        <button
                          onClick={handleProfileUpdate}
                          disabled={profileSaving}
                          className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-xs rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all disabled:opacity-50"
                        >
                          {profileSaving ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Email Alerts Info */}
                  <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-700 rounded-xl">
                    <div>
                      <h4 className="text-sm font-medium text-white">Email Alerts</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Critical alerts sent to <span className="text-cyan-400">{profile.email}</span></p>
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded border text-emerald-400 bg-emerald-500/10 border-emerald-500/20">
                      Auto-enabled
                    </span>
                  </div>

                  {/* Alert Thresholds Info */}
                  <div className="p-4 bg-cyan-900/10 border border-cyan-800/30 rounded-xl">
                    <p className="text-xs text-cyan-500/80 font-medium">
                      <strong className="text-cyan-400 uppercase tracking-widest mr-1">Default Thresholds:</strong>
                      Temperature Warning: 35°C / Critical: 45°C &nbsp;|&nbsp; Humidity Warning: 85% / Critical: 95%
                    </p>
                    <p className="text-[10px] text-slate-600 mt-1">Alerts fire automatically when sensor data breaches these thresholds.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========== DANGER ZONE ========== */}
          {activeSection === 'danger' && (
            <div className="animate-in fade-in duration-300">
              <div className="bg-[#0F172A] border border-rose-900/40 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Danger Zone
                </h3>
                <p className="text-xs text-slate-500 mb-6">
                  These actions are irreversible. Please proceed with extreme caution.
                </p>

                {/* Delete Account Toggle */}
                <div className="bg-rose-950/20 border border-rose-900/30 rounded-xl p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-bold text-sm flex items-center gap-2">
                        <Trash2 className="w-4 h-4 text-rose-400" />
                        Delete Account
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Permanently delete your account, all devices, API keys, and sensor data.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowDeleteZone(!showDeleteZone)}
                      className={`px-4 py-2 rounded-lg font-bold text-xs transition-all border ${
                        showDeleteZone
                          ? 'bg-slate-800 text-slate-400 border-slate-700'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                      }`}
                    >
                      {showDeleteZone ? 'Cancel' : 'Delete My Account'}
                    </button>
                  </div>

                  {/* Expanded Delete Confirmation */}
                  {showDeleteZone && (
                    <div className="mt-5 pt-5 border-t border-rose-900/30 space-y-4 animate-in slide-in-from-top-2 duration-300">
                      <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-4">
                        <p className="text-xs text-rose-300 font-medium leading-relaxed">
                          <strong className="text-rose-400">⚠️ Warning:</strong> This action cannot be undone. All your data including devices, 
                          API keys, dashboards, and sensor history will be permanently removed from Sentinel Cloud.
                        </p>
                      </div>

                      {/* Confirmation Text */}
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">
                          Type <span className="text-rose-400">DELETE</span> to confirm
                        </label>
                        <input
                          type="text"
                          value={deleteConfirmText}
                          onChange={(e) => setDeleteConfirmText(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-rose-500/50 transition-all text-sm font-mono"
                          placeholder='Type "DELETE"'
                        />
                      </div>

                      {/* Password Confirmation */}
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Enter Your Password</label>
                        <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl px-4 focus-within:border-rose-500/50 transition-all">
                          <Lock className="w-4 h-4 text-slate-600 shrink-0" />
                          <input
                            type="password"
                            value={deletePassword}
                            onChange={(e) => setDeletePassword(e.target.value)}
                            className="w-full px-3 py-3 bg-transparent text-white outline-none placeholder-slate-600 text-sm"
                            placeholder="Confirm your password"
                          />
                        </div>
                      </div>

                      {/* Final Delete Button */}
                      <button
                        onClick={handleDeleteAccount}
                        disabled={deleting || deleteConfirmText !== 'DELETE' || !deletePassword}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {deleting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                        {deleting ? 'Deleting Account...' : 'Permanently Delete My Account'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
