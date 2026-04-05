"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useDraggable } from '@dnd-kit/core';

export function DraggableWidget({ id, title, isEditing, onRemove, onResize, size, position, children }) {
  const { attributes, listeners, setNodeRef, isDragging, transform } = useDraggable({
    id,
    data: { type: 'canvas-widget' }
  });

  const [currentSize, setCurrentSize] = useState(size);
  const isResizing = useRef(false);

  useEffect(() => {
    if (!isResizing.current) {
      setCurrentSize(size);
    }
  }, [size]);

  const style = {
    position: 'absolute',
    left: `${position.x}px`,
    top: `${position.y}px`,
    width: `${currentSize.width}px`,
    height: `${currentSize.height}px`,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    zIndex: isDragging ? 50 : 10,
    boxShadow: isDragging ? '0 25px 50px rgba(0,0,0,0.6), 0 0 30px rgba(6,182,212,0.4)' : '0 10px 30px rgba(0,0,0,0.3)',
  };

  // 🌟 STICKY CURSOR BUG FIXED HERE USING POINTER EVENTS
  const handleResizeStart = (e) => {
    e.preventDefault();
    e.stopPropagation(); 
    isResizing.current = true;
    
    // Lock the body so text doesn't accidentally select while dragging
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'nwse-resize';

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = currentSize.width;
    const startHeight = currentSize.height;

    const handlePointerMove = (moveEvent) => {
      const newWidth = Math.max(150, startWidth + (moveEvent.clientX - startX));
      const newHeight = Math.max(120, startHeight + (moveEvent.clientY - startY));
      
      const newSize = { width: newWidth, height: newHeight };
      setCurrentSize(newSize);
      onResize(id, newSize); 
    };

    const handlePointerUp = () => {
      isResizing.current = false;
      // Reset everything back to normal
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };

    // Modern pointer events track mouse even if it leaves the browser window!
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp); // Failsafe
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`bg-gradient-to-br from-[#0F172A] to-[#0B1120] border ${isEditing ? 'border-dashed border-cyan-500 hover:border-cyan-300' : 'border-slate-700 hover:border-slate-600'} rounded-2xl flex flex-col transition-all duration-300 group`}
    >
      {isEditing && (
        <div className="bg-slate-800/80 backdrop-blur-sm px-3 py-2 flex justify-between items-center border-b border-slate-700/50 shrink-0 cursor-grab active:cursor-grabbing rounded-t-2xl" {...attributes} {...listeners}>
          <div className="flex items-center gap-2 text-slate-300 flex-1">
            <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16"></path></svg>
            <span className="text-[10px] font-bold uppercase tracking-widest">{title}</span>
          </div>
          <button 
            onPointerDown={(e) => { e.stopPropagation(); onRemove(id); }} 
            className="text-slate-400 hover:text-white hover:bg-rose-500 rounded-md p-1 ml-2 transition-all pointer-events-auto z-50 flex items-center justify-center w-6 h-6 shadow-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* Widget Content Area */}
      <div className="flex-1 w-full h-full relative overflow-hidden flex items-center justify-center p-1">
        {children}
      </div>

      {/* Resize Handle */}
      {isEditing && (
        <div
          onPointerDown={handleResizeStart}
          className="absolute bottom-0 right-0 w-10 h-10 cursor-nwse-resize flex items-end justify-end p-2 z-50 text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <svg className="w-5 h-5 drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 16l8-8m0 0v6m0-6H10"></path></svg>
        </div>
      )}
    </div>
  );
}