"use client";
import React, { useState, useEffect } from 'react';
import API from '@/utils/api';
import { useRouter } from 'next/navigation';

export default function BoardGallery() {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      const { data } = await API.get('/dashboard/all');
      if (data.success) {
        setBoards(data.boards);
      }
    } catch (err) {
      console.error("Error fetching boards:", err);
    } finally {
      setLoading(false);
    }
  };

  const createBoard = async () => {
    if (!newName) return;
    try {
      const { data } = await API.post('/dashboard/create', { name: newName });
      if (data.success) {
        fetchBoards();
        setIsCreating(false);
        setNewName("");
        router.push(`/dashboard/control-board/${data.board._id}`);
      }
    } catch (err) {
      alert("Failed to create board");
    }
  };

  const deleteBoard = async (id, e) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this board?")) return;
    try {
      await API.delete(`/dashboard/${id}`);
      fetchBoards();
    } catch (err) {
      alert("Delete failed");
    }
  };

  return (
    <div className="p-8 min-h-screen bg-[#090e17] text-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Sentinel Boards
            </h1>
            <p className="text-slate-500 font-medium mt-2">Manage and monitor multiple workspaces</p>
          </div>
          <button 
            onClick={() => setIsCreating(true)}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center gap-2"
          >
             <span className="text-xl">+</span> Create New Board
          </button>
        </div>

        {isCreating && (
          <div className="mb-10 bg-[#0F172A] border border-cyan-500/30 p-6 rounded-2xl animate-in fade-in slide-in-from-top-4">
            <h3 className="text-lg font-bold mb-4 text-cyan-400 uppercase tracking-widest text-xs">New Workspace Identity</h3>
            <div className="flex gap-4">
              <input 
                autoFocus
                type="text" 
                placeholder="Board Name (e.g. Server Room A)" 
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-cyan-500 transition-colors"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && createBoard()}
              />
              <button onClick={createBoard} className="bg-emerald-500 px-8 py-3 rounded-xl font-bold hover:bg-emerald-400 transition-all">Launch</button>
              <button onClick={() => setIsCreating(false)} className="bg-slate-800 px-8 py-3 rounded-xl font-bold hover:bg-slate-700 transition-all text-slate-400">Cancel</button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-48 bg-slate-800/20 rounded-2xl animate-pulse border border-slate-800"></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map(board => (
              <div 
                key={board._id}
                onClick={() => router.push(`/dashboard/control-board/${board._id}`)}
                className="group relative bg-gradient-to-br from-[#0F172A] to-[#111827] border border-slate-800 rounded-2xl p-6 cursor-pointer hover:border-cyan-500/50 transition-all hover:shadow-[0_0_40px_rgba(6,182,212,0.1)] overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => deleteBoard(board._id, e)} className="text-slate-500 hover:text-rose-500 transition-colors">✕</button>
                </div>
                
                <div className="w-12 h-12 bg-slate-800 rounded-xl mb-6 flex items-center justify-center border border-slate-700 group-hover:bg-cyan-500/10 group-hover:border-cyan-500 transition-all">
                  <svg className="w-6 h-6 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                </div>
                
                <h3 className="text-xl font-bold mb-2 group-hover:text-cyan-400 transition-colors uppercase tracking-tight">{board.name}</h3>
                <p className="text-slate-500 text-sm mb-4">{board.description || 'No description provided'}</p>
                
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-auto">
                   <span>{new Date(board.createdAt).toLocaleDateString()}</span>
                   <span className="text-cyan-500 underline opacity-0 group-hover:opacity-100 transition-opacity">Enter Board →</span>
                </div>
              </div>
            ))}

            {boards.length === 0 && !loading && (
              <div className="col-span-full py-20 bg-slate-800/10 rounded-3xl border border-dashed border-slate-800 flex flex-col items-center justify-center">
                <p className="text-slate-500 font-medium mb-4">No boards created yet</p>
                <button onClick={() => setIsCreating(true)} className="text-cyan-400 font-bold underline">Create your first dashboard</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
