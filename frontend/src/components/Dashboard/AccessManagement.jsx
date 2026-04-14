import React, { useState, useEffect } from 'react';
import API from '@/utils/api';
import { Users, Plus, Edit, Trash2, Loader2, CheckSquare, Square, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AccessManagement() {
    const [guests, setGuests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        email: '',
        password: '',
        permissions: [],
        allowedDevices: []
    });

    const [availableDevices, setAvailableDevices] = useState([]);

    const PERMISSIONS = [
        { id: 'view_dashboard', label: 'View Dashboard', desc: 'Allows viewing real-time data but not controlling actuators.' },
        { id: 'control_devices', label: 'Control Devices', desc: 'Allows controlling actuators on the dashboard.' },
        { id: 'manage_devices', label: 'Manage Devices', desc: 'Allows adding, deleting devices and API keys.' },
        { id: 'edit_dashboard', label: 'Build Dashboard', desc: 'Allows modifying widget layouts on the Control Board.' }
    ];

    useEffect(() => {
        fetchGuests();
        fetchDevices();
    }, []);

    const fetchDevices = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            const { data } = await API.get('/apikeys', config);
            setAvailableDevices(data || []);
        } catch (err) {
            console.error("Fetch devices error:", err);
        }
    };

    const fetchGuests = async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            const { data } = await API.get('/guests', config);
            setGuests(data.data || []);
        } catch (err) {
            console.error("Fetch guests error:", err);
            toast.error("Failed to load guests");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAddModal = () => {
        setModalMode('add');
        setFormData({ id: '', name: '', email: '', password: '', permissions: [], allowedDevices: [] });
        setShowModal(true);
    };

    const handleOpenEditModal = (guest) => {
        setModalMode('edit');
        setFormData({ 
            id: guest._id, 
            name: guest.name, 
            email: guest.email, 
            password: '', 
            permissions: guest.permissions || [],
            allowedDevices: guest.allowedDevices || []
        });
        setShowModal(true);
    };

    const togglePermission = (id) => {
        setFormData(prev => {
            const perms = prev.permissions.includes(id)
                ? prev.permissions.filter(p => p !== id)
                : [...prev.permissions, id];
            return { ...prev, permissions: perms };
        });
    };

    const toggleDevice = (id) => {
        setFormData(prev => {
            const devs = prev.allowedDevices.includes(id)
                ? prev.allowedDevices.filter(d => d !== id)
                : [...prev.allowedDevices, id];
            return { ...prev, allowedDevices: devs };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            if (modalMode === 'add') {
                if (!formData.password) return toast.error("Password is required for new guest");
                await API.post('/guests', formData, config);
                toast.success("Guest added successfully");
            } else {
                await API.put(`/guests/${formData.id}`, { permissions: formData.permissions, allowedDevices: formData.allowedDevices }, config);
                toast.success("Guest access updated");
            }
            setShowModal(false);
            fetchGuests();
        } catch (err) {
            toast.error(err.response?.data?.message || "Operation failed");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to revoke access and delete this guest?")) return;
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            await API.delete(`/guests/${id}`, config);
            toast.success("Guest access revoked");
            fetchGuests();
        } catch (err) {
            toast.error("Failed to delete guest");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-[#0F172A] border border-slate-700/60 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <Users className="w-4 h-4 text-cyan-500" />
                            Guest Access Control
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">Manage users who can view or control your devices.</p>
                    </div>
                    <button
                        onClick={handleOpenAddModal}
                        className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-xl text-xs font-bold hover:bg-cyan-500/20 transition-all"
                    >
                        <Plus className="w-4 h-4" /> Add Guest
                    </button>
                </div>

                {guests.length === 0 ? (
                    <div className="text-center py-10 bg-slate-900/50 rounded-xl border border-dashed border-slate-700">
                        <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                        <p className="text-sm text-slate-400">No guest users found.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                    <th className="py-3 px-4">Name / Email</th>
                                    <th className="py-3 px-4">Permissions</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {guests.map((guest) => (
                                    <tr key={guest._id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="py-3 px-4">
                                            <div className="text-sm font-bold text-slate-200">{guest.name}</div>
                                            <div className="text-xs text-slate-500">{guest.email}</div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex flex-wrap gap-1">
                                                {guest.permissions?.length > 0 ? (
                                                    guest.permissions.map(p => (
                                                        <span key={p} className="text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-cyan-400 px-2 py-1 rounded-md border border-slate-700">
                                                            {p.replace('_', ' ')}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-slate-600">No permissions</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleOpenEditModal(guest)} className="p-1.5 text-slate-400 hover:text-cyan-400 bg-slate-800 rounded-lg transition-colors">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(guest._id)} className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-800 rounded-lg transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#0F172A] border border-slate-700 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl">
                        <div className="flex justify-between items-center p-4 border-b border-slate-800">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                                {modalMode === 'add' ? 'Add New Guest' : 'Edit Guest Permissions'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Left Side: Basic Info */}
                                <div className="space-y-4">
                                    {modalMode === 'add' && (
                                        <>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Name</label>
                                                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-cyan-500/50 text-sm" placeholder="Guest Name" />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Email</label>
                                                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-cyan-500/50 text-sm" placeholder="guest@example.com" />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Assign Password</label>
                                                <input required={modalMode==='add'} type="text" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-cyan-500/50 text-sm" placeholder="Shared password (min 6 chars)" />
                                            </div>
                                        </>
                                    )}
                                    
                                    {modalMode === 'edit' && (
                                        <div className="text-sm text-slate-300 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                                            Editing permissions for <span className="font-bold text-cyan-400 block text-lg mt-1">{formData.name}</span>
                                            <span className="text-xs text-slate-500 block mt-1">{formData.email}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Right Side: Permissions & Devices */}
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">Access Policies</label>
                                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                            {PERMISSIONS.map(perm => (
                                                <div key={perm.id} onClick={() => togglePermission(perm.id)} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${formData.permissions.includes(perm.id) ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-slate-900 border-slate-700 hover:border-slate-600'}`}>
                                                    <div className="mt-0.5">
                                                        {formData.permissions.includes(perm.id) ? <CheckSquare className="w-4 h-4 text-cyan-500" /> : <Square className="w-4 h-4 text-slate-500" />}
                                                    </div>
                                                    <div>
                                                        <div className={`text-sm font-bold ${formData.permissions.includes(perm.id) ? 'text-cyan-400' : 'text-slate-300'}`}>{perm.label}</div>
                                                        <div className="text-xs text-slate-500 mt-0.5">{perm.desc}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block border-t border-slate-800 pt-3">Allowed Devices</label>
                                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                            {availableDevices.length === 0 && (
                                                <div className="text-xs text-slate-500 italic p-2 rounded-xl bg-slate-800/30 border border-slate-700/50">No devices mapped to your account yet.</div>
                                            )}
                                            {availableDevices.map(dev => (
                                                <div key={dev._id} onClick={() => toggleDevice(dev._id)} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${formData.allowedDevices.includes(dev._id) ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-slate-900 border-slate-700 hover:border-slate-600'}`}>
                                                    <div className="flex items-center gap-3">
                                                        {formData.allowedDevices.includes(dev._id) ? <CheckSquare className="w-4 h-4 text-cyan-500" /> : <Square className="w-4 h-4 text-slate-500" />}
                                                        <div className={`text-sm font-bold ${formData.allowedDevices.includes(dev._id) ? 'text-cyan-400' : 'text-slate-300'}`}>{dev.name}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="pt-4 mt-6 border-t border-slate-800 flex items-center justify-end gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-white transition-colors">Cancel</button>
                                <button type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-sm rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg hover:shadow-cyan-500/25">
                                    <Save className="w-4 h-4" /> Save Configuration
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
