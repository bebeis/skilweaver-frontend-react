import React, { useState, useRef, useCallback } from 'react';
import { cn } from './utils';

interface HighlightStyle {
  top: number;
  left: number;
  width: number;
  height: number;
  opacity: number;
}

export function useFluidHighlight<T extends HTMLElement = HTMLElement>() {
  const containerRef = useRef<T>(null);
  const [highlightStyle, setHighlightStyle] = useState<HighlightStyle>({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    opacity: 0,
  });

  const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (!containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const itemRect = e.currentTarget.getBoundingClientRect();

    setHighlightStyle({
      top: itemRect.top - containerRect.top,
      left: itemRect.left - containerRect.left,
      width: itemRect.width,
      height: itemRect.height,
      opacity: 1,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHighlightStyle((prev) => ({ ...prev, opacity: 0 }));
  }, []);

  return {
    containerRef,
    highlightStyle,
    handleMouseEnter,
    handleMouseLeave,
  };
}

interface LiquidHighlightProps {
  style: HighlightStyle;
  className?: string;
  duration?: number;
}

export function LiquidHighlight({ style, className, duration = 500 }: LiquidHighlightProps) {
  return (
    <div
      className={cn(
        "absolute rounded-xl transition-all ease-[cubic-bezier(0.32,0.72,0,1)] pointer-events-none z-0 overflow-hidden",
        className
      )}
      style={{
        top: style.top,
        left: style.left,
        width: style.width,
        height: style.height,
        opacity: style.opacity,
        transitionDuration: `${duration}ms`,
        // Glass Base: 투명도 높은 유리 질감
        background: 'rgba(255, 255, 255, 0.02)',
        boxShadow: `
          inset 0 0 0 1px rgba(255, 255, 255, 0.15),
          inset 0 0 15px rgba(255, 255, 255, 0.05),
          0 8px 20px -4px rgba(0, 0, 0, 0.2)
        `,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      {/* Internal Fluid Animation: 물방울 내부에서 회전하는 빛의 흐름 */}
      <div 
        className="absolute inset-[-100%] top-[-50%] left-[-50%] w-[200%] h-[200%] opacity-40 blur-[30px]"
        style={{
          background: `conic-gradient(from 0deg at 50% 50%, 
            transparent 0deg,
            hsl(var(--primary)) 60deg,
            #8b5cf6 120deg, 
            #3b82f6 180deg,
            #06b6d4 240deg,
            #d946ef 300deg,
            transparent 360deg
          )`,
          animation: 'spin 8s linear infinite'
        }}
      />
      
      {/* Surface Reflection: 유리 표면의 맺힌 광택 */}
      <div 
        className="absolute inset-0 z-10 mix-blend-overlay opacity-80"
        style={{
          background: 'linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.7) 45%, rgba(255,255,255,0.0) 50%, transparent 60%)',
        }}
      />

      {/* Edge Highlight: 물방울 경계의 밝은 빛 */}
      <div className="absolute inset-0 border border-white/20 rounded-xl" />
    </div>
  );
}

