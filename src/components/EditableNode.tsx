import React, { useState, useEffect, useRef } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export const EditableNode = ({ id, data, isConnectable }: NodeProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label as string);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLabel(data.label as string);
  }, [data.label]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const onDoubleClick = () => {
    setIsEditing(true);
  };

  const onBlur = () => {
    setIsEditing(false);
    if (typeof data.onLabelChange === 'function') {
      data.onLabelChange(id, label);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      if (typeof data.onLabelChange === 'function') {
        data.onLabelChange(id, label);
      }
    }
  };

  const type = data.type as string;
  let textClass = 'text-white font-medium';
  let containerClass = 'min-w-[150px] max-w-[250px] px-6 py-4 rounded-xl';
  let bgElement = <div className="absolute inset-0 bg-[#0a121e]/80 backdrop-blur-xl border border-white/10 rounded-xl" />;

  if (type === 'role') {
    // Flowchart: Terminator (Start/End) - Pill shape
    containerClass = 'min-w-[180px] max-w-[250px] px-8 py-4';
    textClass = 'text-sky-400 font-bold text-sm tracking-tighter uppercase';
    bgElement = <div className="absolute inset-0 bg-sky-500/20 border-2 border-sky-500 rounded-full shadow-[0_0_30px_rgba(14,165,233,0.4)]" />;
  } else if (type === 'phase') {
    // Flowchart: Process - Rectangle
    containerClass = 'min-w-[160px] max-w-[250px] px-6 py-4';
    textClass = 'text-white font-semibold text-sm';
    bgElement = <div className="absolute inset-0 bg-[#0a121e]/90 backdrop-blur-xl border-2 border-white/20 rounded-sm shadow-2xl transition-colors group-hover:border-sky-500/50" />;
  } else if (type === 'topic') {
    // Flowchart: Data/IO - Parallelogram
    containerClass = 'min-w-[150px] max-w-[220px] px-8 py-3';
    textClass = 'text-slate-200 text-xs font-medium';
    bgElement = <div className="absolute inset-0 bg-white/5 border border-white/20 -skew-x-12 transition-colors group-hover:border-sky-500/50" />;
  } else if (type === 'concept') {
    // Flowchart: Course/Module - Hexagon / Accent Rectangle
    containerClass = 'min-w-[160px] max-w-[240px] px-6 py-3';
    textClass = 'text-amber-300 text-[11px] font-bold uppercase tracking-wider';
    bgElement = <div className="absolute inset-0 bg-[#120f08]/90 backdrop-blur-sm border border-amber-500/30 border-l-4 border-l-amber-500 rounded-md transition-colors group-hover:border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]" />;
  } else if (type === 'decision') {
    // Flowchart: Decision - Diamond
    containerClass = 'min-w-[120px] min-h-[120px] max-w-[200px] px-6 py-6';
    textClass = 'text-purple-300 text-[11px] font-bold uppercase tracking-wider';
    bgElement = <div className="absolute inset-0 bg-[#0a121e]/90 backdrop-blur-xl border border-purple-500/30 rotate-45 rounded shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-colors group-hover:border-purple-400 scale-75" />;
  } else if (type === 'database') {
    // Flowchart: Database - Cylinder representation
    containerClass = 'min-w-[160px] max-w-[220px] px-6 py-5';
    textClass = 'text-emerald-300 text-xs font-semibold';
    bgElement = <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-sm border-2 border-emerald-500/30 rounded-xl transition-colors group-hover:border-emerald-500/60 shadow-[0_4px_0_rgba(16,185,129,0.2)] border-b-8" />;
  }
  return (
    <div 
      className={cn(
        "relative transition-all text-center group flex items-center justify-center", 
        containerClass,
        data.isCompleted ? "opacity-60 grayscale-[0.5]" : ""
      )}
      onDoubleClick={onDoubleClick}
    >
      {bgElement}
      {data.isCompleted && (
        <div className="absolute -top-2 -right-2 bg-emerald-500 text-white rounded-full p-1 z-30 shadow-lg border-2 border-[#0d1117]">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
      )}
      
      {type !== 'role' && (
        <Handle 
          type="target" 
          position={Position.Top} 
          isConnectable={isConnectable} 
          className="!bg-sky-500/50 !w-2 !h-2 !border-0 z-20"
        />
      )}
      
      <div className="relative z-10 w-full flex items-center justify-center gap-2">
        {isEditing ? (
          <input
            ref={inputRef}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            className="nodrag w-full bg-[#0a121e] border border-sky-500/50 rounded px-2 py-1 text-center text-white outline-none focus:ring-1 focus:ring-sky-500 text-xs"
          />
        ) : (
          <div className={cn("select-none break-words", textClass)}>
            {label}
          </div>
        )}
      </div>
      
      <Handle 
        type="source" 
        position={Position.Bottom} 
        isConnectable={isConnectable}
        className="!bg-sky-500/50 !w-2 !h-2 !border-0 z-20"
      />
    </div>
  );
};
