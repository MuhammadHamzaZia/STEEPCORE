import React, { useState, useEffect, useRef } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Check } from 'lucide-react';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export const EditableNode = ({ id, data, isConnectable }: NodeProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState((data.label as string) || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLabel((data.label as string) || '');
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
  const isPhase = type === 'phase';
  const isCompleted = Boolean(data.isCompleted);

  return (
    <div 
      className={cn(
        "relative transition-all text-center group flex flex-col items-center justify-center select-none cursor-pointer",
        isRoot 
          ? "min-w-[210px] max-w-[320px] px-5 py-4 rounded-xl"
          : "min-w-[180px] max-w-[270px] px-4 py-3 rounded-lg",
        isCompleted && "opacity-75"
      )}
      onDoubleClick={onDoubleClick}
    >
      {/* Background & Border matching STEEPCORE theme (#161b22 / #30363d) */}
      <div 
        className={cn(
          "absolute inset-0 bg-[#161b22] transition-colors rounded-[inherit]",
          isRoot 
            ? "border-2 border-[#388bfd] shadow-[0_0_16px_rgba(56,139,253,0.18)] group-hover:border-[#58a6ff]"
            : isPhase
            ? "border border-[#388bfd]/50 shadow-sm group-hover:border-[#58a6ff] group-hover:bg-[#1c2128]"
            : isCompleted
            ? "border border-[#238636]/60 shadow-xs group-hover:border-[#2ea043]"
            : "border border-[#30363d] shadow-sm group-hover:border-[#58a6ff] group-hover:bg-[#1c2128]"
        )} 
      />

      {/* Checkpoint Completed Badge */}
      {isCompleted && (
        <div className="absolute -top-1.5 -right-1.5 bg-[#238636] text-white rounded-full p-0.5 z-30 shadow-md border-2 border-[#0d1117] flex items-center justify-center">
          <Check size={10} strokeWidth={3} />
        </div>
      )}
      
      {/* Target Handles */}
      {!isRoot && (
        <Handle 
          type="target" 
          position={Position.Top} 
          id="top"
          isConnectable={isConnectable} 
          className="!bg-[#58a6ff] !w-2 !h-2 !border-2 !border-[#0d1117] z-20 hover:!scale-150 transition-transform"
        />
      )}
      
      <Handle 
        type="target" 
        position={Position.Left} 
        id="left"
        isConnectable={isConnectable} 
        className="!bg-[#58a6ff] !w-2 !h-2 !border-2 !border-[#0d1117] z-20 hover:!scale-150 transition-transform"
      />

      {/* Node Content */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center">
        {isRoot && (
          <div className="flex items-center justify-center gap-1.5 mb-1.5">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider bg-[#388bfd]/15 text-[#58a6ff] border border-[#388bfd]/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[#58a6ff] mr-1.5 animate-pulse" />
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
            className="nodrag w-full bg-[#0d1117] border border-[#58a6ff] rounded px-2 py-1 text-center text-[#e6edf3] outline-none text-xs"
          />
        ) : (
          <div 
            className={cn(
              "select-none break-words leading-snug",
              isRoot 
                ? "text-white font-semibold text-sm tracking-tight"
                : isPhase
                ? "text-[#e6edf3] font-semibold text-xs sm:text-[13px]"
                : "text-[#e6edf3] font-medium text-xs sm:text-[13px]"
            )}
          >
            {label}
          </div>
        )}
      </div>
      
      {/* Source Handles */}
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="bottom"
        isConnectable={isConnectable}
        className="!bg-[#58a6ff] !w-2 !h-2 !border-2 !border-[#0d1117] z-20 hover:!scale-150 transition-transform"
      />

      <Handle 
        type="source" 
        position={Position.Right} 
        id="right"
        isConnectable={isConnectable} 
        className="!bg-[#58a6ff] !w-2 !h-2 !border-2 !border-[#0d1117] z-20 hover:!scale-150 transition-transform"
      />
    </div>
  );
};
