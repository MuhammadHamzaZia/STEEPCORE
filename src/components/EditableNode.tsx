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
  const isRoot = type === 'role' || id === 'root-start' || id === 'root' || data.isRoot;

  let textClass = 'text-slate-100 font-medium text-xs sm:text-[13px] leading-snug';
  let containerClass = 'min-w-[180px] max-w-[260px] px-5 py-3.5 rounded-xl';
  let bgElement = <div className="absolute inset-0 bg-[#161b22] border border-slate-700/80 rounded-xl shadow-md transition-all group-hover:border-sky-500/60 group-hover:bg-[#1b222d]" />;

  if (isRoot) {
    // Flowchart: Root / Starting Point - Unmistakable Glowing Anchor Card
    containerClass = 'min-w-[220px] max-w-[340px] px-6 py-4 rounded-2xl shadow-xl';
    textClass = 'text-white font-bold text-sm sm:text-base tracking-tight leading-snug';
    bgElement = (
      <div className="absolute inset-0 bg-gradient-to-b from-[#102b47] to-[#0a1828] border-2 border-sky-400 rounded-2xl shadow-[0_0_25px_rgba(56,189,248,0.35)] transition-all group-hover:border-sky-300 group-hover:shadow-[0_0_35px_rgba(56,189,248,0.5)]" />
    );
  } else if (type === 'phase') {
    // Flowchart: Process / Milestone Stage
    containerClass = 'min-w-[200px] max-w-[280px] px-6 py-4 rounded-xl';
    textClass = 'text-sky-100 font-semibold text-sm leading-snug';
    bgElement = (
      <div className="absolute inset-0 bg-[#0d1728]/95 backdrop-blur-md border-2 border-sky-500/40 rounded-xl shadow-lg transition-all group-hover:border-sky-400 group-hover:shadow-[0_0_20px_rgba(56,189,248,0.2)]" />
    );
  } else if (type === 'topic') {
    // Flowchart: Topic / Learning Module
    containerClass = 'min-w-[180px] max-w-[260px] px-5 py-3.5 rounded-xl';
    textClass = 'text-slate-100 text-xs sm:text-[13px] font-medium leading-snug';
    bgElement = (
      <div className="absolute inset-0 bg-[#161b22] border border-[#30363d] rounded-xl shadow-md transition-all group-hover:border-sky-500/60 group-hover:bg-[#1b222d]" />
    );
  } else if (type === 'concept') {
    // Flowchart: Course/Module - Hexagon / Accent Rectangle
    containerClass = 'min-w-[170px] max-w-[250px] px-5 py-3.5 rounded-xl';
    textClass = 'text-amber-200 text-xs font-semibold leading-snug';
    bgElement = <div className="absolute inset-0 bg-[#141008] border border-amber-500/40 border-l-4 border-l-amber-500 rounded-xl transition-all group-hover:border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]" />;
  } else if (type === 'decision') {
    // Flowchart: Decision - Diamond
    containerClass = 'min-w-[120px] min-h-[120px] max-w-[200px] px-6 py-6';
    textClass = 'text-purple-300 text-[11px] font-bold uppercase tracking-wider';
    bgElement = <div className="absolute inset-0 bg-[#0a121e]/90 backdrop-blur-xl border border-purple-500/30 rotate-45 rounded shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-colors group-hover:border-purple-400 scale-75" />;
  } else if (type === 'database') {
    // Flowchart: Database - Cylinder representation
    containerClass = 'min-w-[170px] max-w-[240px] px-5 py-4 rounded-xl';
    textClass = 'text-emerald-300 text-xs font-semibold';
    bgElement = <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-sm border-2 border-emerald-500/30 rounded-xl transition-colors group-hover:border-emerald-500/60 shadow-[0_4px_0_rgba(16,185,129,0.2)] border-b-6" />;
  }
  return (
    <div 
      className={cn(
        "relative transition-all text-center group flex flex-col items-center justify-center", 
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
      
      {!isRoot && (
        <Handle 
          type="target" 
          position={Position.Top} 
          id="top"
          isConnectable={isConnectable} 
          className="!bg-sky-400 !w-2.5 !h-2.5 !border-2 !border-[#0d1117] z-20 hover:!scale-125 transition-transform"
        />
      )}
      
      <Handle 
        type="target" 
        position={Position.Left} 
        id="left"
        isConnectable={isConnectable} 
        className="!bg-sky-400 !w-2.5 !h-2.5 !border-2 !border-[#0d1117] z-20 hover:!scale-125 transition-transform"
      />

      <div className="relative z-10 w-full flex flex-col items-center justify-center">
        {isRoot && (
          <div className="flex items-center justify-center gap-1.5 mb-1.5">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-500/25 text-sky-200 border border-sky-400/50 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse mr-1.5" />
              Starting Point
            </span>
          </div>
        )}

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
        id="bottom"
        isConnectable={isConnectable}
        className="!bg-sky-400 !w-2.5 !h-2.5 !border-2 !border-[#0d1117] z-20 hover:!scale-125 transition-transform"
      />

      <Handle 
        type="source" 
        position={Position.Right} 
        id="right"
        isConnectable={isConnectable} 
        className="!bg-sky-400 !w-2.5 !h-2.5 !border-2 !border-[#0d1117] z-20 hover:!scale-125 transition-transform"
      />
    </div>
  );
};
