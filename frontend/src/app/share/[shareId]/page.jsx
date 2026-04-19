"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import API from '@/utils/api';
import ControlBoard from '@/components/Dashboard/ControlBoard';
import { Loader2, Globe, ShieldCheck } from 'lucide-react';

export default function PublicSharePage() {
    const { shareId } = useParams();
    const [board, setBoard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPublicBoard = async () => {
            try {
                const res = await API.get(`/dashboard/shared/${shareId}`);
                if (res.data.success) {
                    setBoard(res.data.board);
                }
            } catch (err) {
                setError(err.response?.data?.message || "Dashboard not found or link expired.");
            } finally {
                setLoading(false);
            }
        };
        if (shareId) fetchPublicBoard();
    }, [shareId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#090e17] flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-cyan-500" size={48} />
                <p className="text-slate-400 font-bold tracking-widest uppercase text-xs">Decrypting Workspace...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#090e17] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mb-6 border border-rose-500/20">
                    <ShieldCheck className="text-rose-500" size={32} />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Access Restricted</h1>
                <p className="text-slate-500 max-w-md mx-auto">{error}</p>
                <button 
                   onClick={() => window.location.href = '/'}
                   className="mt-8 bg-slate-800 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-700 transition-all"
                >
                    Back to Portal
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#090e17] text-slate-300">
            {/* PUBLIC HEADER */}
            <header className="bg-[#0F172A]/80 backdrop-blur-md border-b border-white/5 py-4 px-8 flex justify-between items-center sticky top-0 z-[100]">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                        <Globe className="text-slate-900" size={20} />
                    </div>
                    <div>
                        <h1 className="text-sm font-black text-white uppercase tracking-tight leading-none">{board.name}</h1>
                        <p className="text-[10px] text-cyan-500 font-bold uppercase tracking-widest mt-1">Status: Public Live View</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-900/50 px-4 py-2 rounded-full border border-slate-800">
                     <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Encrypted Socket Active
                </div>
            </header>

            <main className="p-8">
                {/* 
                    Pass boardId to ControlBoard. 
                    We need to modify ControlBoard to accept readOnly prop.
                */}
                <ControlBoard boardId={board._id} readOnly={true} />
            </main>
        </div>
    );
}
