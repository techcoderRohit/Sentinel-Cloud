"use client";
import React, { useState, useEffect } from 'react';
import { Mail, Clock, Send, CheckCircle, AlertCircle, User, MessageSquare, ChevronRight, Search } from 'lucide-react';
import { getAllContacts, replyToContact } from '@/utils/adminAPI';
import toast from 'react-hot-toast';

const ContactQueries = () => {
    const [queries, setQueries] = useState([]);
    const [selectedQuery, setSelectedQuery] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchQueries();
    }, []);

    const fetchQueries = async () => {
        try {
            setLoading(true);
            const res = await getAllContacts();
            setQueries(res.data);
            if (res.data.length > 0 && !selectedQuery) {
                setSelectedQuery(res.data[0]);
            }
        } catch (error) {
            toast.error('Failed to load queries');
        } finally {
            setLoading(false);
        }
    };

    const handleSendReply = async () => {
        if (!replyText.trim()) return toast.error('Please enter a reply');
        try {
            setSending(true);
            const res = await replyToContact(selectedQuery._id, replyText);
            toast.success(res.message);
            setReplyText('');
            fetchQueries();
            // Update local state for selected query
            setSelectedQuery({
                ...selectedQuery,
                status: 'resolved',
                adminReply: replyText,
                repliedAt: new Date()
            });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send reply');
        } finally {
            setSending(false);
        }
    };

    const filteredQueries = queries.filter(q => 
        q.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.subject.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-140px)] flex gap-6 bg-[#0b1120] text-white">
            {/* Left Side: List of Queries */}
            <div className="w-1/3 flex flex-col bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-4 border-b border-slate-800 bg-slate-800/30">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search queries..." 
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-cyan-500 outline-none transition"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {filteredQueries.length === 0 ? (
                        <div className="p-10 text-center text-slate-500">
                            <Mail className="mx-auto mb-3 opacity-20" size={48} />
                            <p>No queries found</p>
                        </div>
                    ) : (
                        filteredQueries.map((query) => (
                            <div 
                                key={query._id}
                                onClick={() => setSelectedQuery(query)}
                                className={`p-4 border-b border-slate-800 cursor-pointer transition-all hover:bg-slate-800/40 ${selectedQuery?._id === query._id ? 'bg-cyan-500/10 border-l-4 border-l-cyan-500' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-semibold text-sm truncate pr-2">{query.name}</span>
                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${query.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                                        {query.status}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400 truncate mb-2">{query.subject}</p>
                                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                    <Clock size={12} />
                                    {new Date(query.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Right Side: Query Details & Reply */}
            <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-2xl flex flex-col shadow-xl">
                {selectedQuery ? (
                    <>
                        <div className="p-6 border-b border-slate-800 bg-slate-800/30 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <MessageSquare className="text-cyan-400" size={20} />
                                    {selectedQuery.subject}
                                </h3>
                                <p className="text-sm text-slate-400 mt-1">From: {selectedQuery.name} ({selectedQuery.email})</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-500">Submitted on</p>
                                <p className="text-sm font-mono text-slate-300">{new Date(selectedQuery.createdAt).toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                            <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700 shadow-inner">
                                <p className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <User size={14} />
                                    User Message
                                </p>
                                <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">
                                    {selectedQuery.message}
                                </p>
                            </div>

                            {selectedQuery.status === 'resolved' && (
                                <div className="bg-emerald-500/5 p-5 rounded-2xl border border-emerald-500/20 shadow-inner">
                                    <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <CheckCircle size={14} />
                                        Admin Response
                                    </p>
                                    <p className="text-emerald-50/80 leading-relaxed whitespace-pre-wrap italic">
                                        {selectedQuery.adminReply}
                                    </p>
                                    <p className="text-[10px] text-emerald-500/60 mt-4 text-right italic">
                                        Replied on {new Date(selectedQuery.repliedAt).toLocaleString()}
                                    </p>
                                </div>
                            )}

                            {selectedQuery.status === 'pending' && (
                                <div className="space-y-4 pt-4 border-t border-slate-800">
                                    <p className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                                        <Send size={16} className="text-cyan-400" />
                                        Send Reply via Email
                                    </p>
                                    <textarea 
                                        className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 text-sm text-white focus:ring-2 focus:ring-cyan-500 outline-none transition min-h-[150px] shadow-lg"
                                        placeholder="Type your professional response here..."
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                    ></textarea>
                                    <button 
                                        onClick={handleSendReply}
                                        disabled={sending}
                                        className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-bold transition shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                                    >
                                        {sending ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                <Send size={18} />
                                                Send Reply & Resolve
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500">
                        <AlertCircle size={64} className="opacity-10 mb-4" />
                        <p className="text-xl">Select a query to view details</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContactQueries;
