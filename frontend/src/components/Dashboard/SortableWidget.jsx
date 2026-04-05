"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function SortableWidget({ id, title, isEditing, onRemove, onResize, size, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    data: { type: 'canvas-widget' }
  });

  const [currentSize, setCurrentSize] = useState(size);
  const isResizing = useRef(false);

  // Sync size state when saved
  useEffect(() => {
    if (!isResizing.current) {
      setCurrentSize(size);
    }
  }, [size]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isResizing.current ? 'none' : transition,
    width: `${currentSize.width}px`,
    height: `${currentSize.height}px`,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleResizeStart = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent drag while resizing
    isResizing.current = true;

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = currentSize.width;
    const startHeight = currentSize.height;

    const handleMouseMove = (moveEvent) => {
      // Minimum size limit
      const newWidth = Math.max(200, startWidth + (moveEvent.clientX - startX));
      const newHeight = Math.max(150, startHeight + (moveEvent.clientY - startY));
      setCurrentSize({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = (upEvent) => {
      isResizing.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      
      const finalWidth = Math.max(200, startWidth + (upEvent.clientX - startX));
      const finalHeight = Math.max(150, startHeight + (upEvent.clientY - startY));
      onResize(id, { width: finalWidth, height: finalHeight }); // Save config
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`bg-[#0F172A] border ${isEditing ? 'border-dashed border-cyan-500/80 hover:border-cyan-400' : 'border-slate-800'} rounded-xl shadow-lg flex flex-col overflow-hidden group`}
    >
      {/* Edit Mode Header (Drag Handle) */}
      {isEditing && (
        <div className="bg-slate-800/90 px-4 py-2 flex justify-between items-center border-b border-slate-700/50 shrink-0">
          <div {...attributes} {...listeners} className="flex items-center gap-2 text-slate-400 cursor-grab active:cursor-grabbing flex-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16"></path></svg>
            <span className="text-xs font-semibold uppercase tracking-wider truncate">{title}</span>
          </div>
          <button onClick={() => onRemove(id)} className="text-slate-400 hover:text-white p-1 rounded hover:bg-rose-500 transition-colors z-10 ml-2 font-bold leading-none w-6 h-6 flex items-center justify-center">
            ✕
          </button>
        </div>
      )}

      {/* Widget Content */}
      <div className={`p-4 flex-1 flex flex-col ${!isEditing && 'pt-6'} overflow-hidden relative`}>
        {!isEditing && <h3 className="text-slate-400 text-sm font-medium mb-3 shrink-0">{title}</h3>}
        <div className="flex-1 flex items-center justify-center w-full h-full">
          {children}
        </div>
      </div>

      {/* Canva-Style Free Resize Handle */}
      {isEditing && (
        <div
          onPointerDown={handleResizeStart}
          className="absolute bottom-0 right-0 w-8 h-8 cursor-nwse-resize flex items-end justify-end p-1.5 z-50 text-slate-500 hover:text-cyan-400 bg-slate-800/80 rounded-tl-xl transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16l8-8m0 0v6m0-6H10"></path></svg>
        </div>
      )}
    </div>
  );
}