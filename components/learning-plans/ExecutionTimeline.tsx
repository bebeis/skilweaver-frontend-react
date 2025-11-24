/**
 * GOAP 액션 실행 경로를 타임라인으로 시각화하는 컴포넌트
 * EXECUTING 상태에서 COMPLETED 상태로의 전환을 애니메이션으로 표현
 */

import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, AlertCircle, Zap, RotateCw } from 'lucide-react';
import { Card } from '@components/ui/card';

export interface TimelineItem {
  name: string;
  duration: number | null; // ms
  status: 'COMPLETED' | 'EXECUTING' | 'PENDING' | 'FAILED';
  completedAt?: number;
  startedAt?: number;
}

interface ExecutionTimelineProps {
  items: TimelineItem[];
  currentActionIndex?: number;
  compact?: boolean;
  onRetry?: (actionName: string) => void;
}

export function ExecutionTimeline({
  items,
  currentActionIndex,
  compact = false,
  onRetry,
}: ExecutionTimelineProps) {
  const [animatingIndices, setAnimatingIndices] = useState<Set<number>>(new Set());

  // EXECUTING 상태인 항목에 애니메이션 추가
  useEffect(() => {
    const executingIndices = new Set<number>();
    items.forEach((item, index) => {
      if (item.status === 'EXECUTING') {
        executingIndices.add(index);
      }
    });
    setAnimatingIndices(executingIndices);
  }, [items]);

  if (items.length === 0) {
    return null;
  }

  const totalDuration = items.reduce(
    (sum, item) => sum + (item.duration || 0),
    0
  );

  return (
    <div className={compact ? 'space-y-2' : 'space-y-4'}>
      {/* 헤더 */}
      {!compact && (
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">실행 경로</h3>
          <span className="text-xs text-muted-foreground">
            {items.filter((i) => i.status === 'COMPLETED').length} / {items.length}
          </span>
        </div>
      )}

      {/* 타임라인 */}
      <div className="space-y-2">
        {items.map((item, index) => {
          const isCompleted = item.status === 'COMPLETED';
          const isFailed = item.status === 'FAILED';
          const isExecuting = item.status === 'EXECUTING';
          const isPending = item.status === 'PENDING';
          const isAnimating = animatingIndices.has(index);

          const durationPercent = totalDuration > 0
            ? (item.duration || 0) / totalDuration * 100
            : 0;

          return (
            <div
              key={`${item.name}-${index}`}
              className={`space-y-1 transition-all duration-300 ${
                isAnimating ? 'scale-105 opacity-100' : 'scale-100 opacity-100'
              }`}
            >
              {/* 액션 항목 */}
              <div
                className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                  isExecuting ? 'bg-amber-50' : isFailed ? 'bg-red-50' : ''
                }`}
              >
                {/* 상태 아이콘 */}
                <div className="w-5 h-5 flex-shrink-0 relative">
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 animate-in fade-in duration-500" />
                  ) : isFailed ? (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  ) : isExecuting ? (
                    <div className="relative">
                      <Zap className="w-5 h-5 text-amber-600 animate-spin" />
                    </div>
                  ) : (
                    <Circle className="w-5 h-5 text-gray-300" />
                  )}
                </div>

                {/* 액션 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`text-sm font-medium truncate transition-colors ${
                        isPending
                          ? 'text-muted-foreground'
                          : isExecuting
                            ? 'text-amber-700 font-semibold'
                            : isFailed
                              ? 'text-red-700'
                              : 'text-green-700'
                      }`}
                    >
                      {item.name}
                    </p>

                    {/* 소요 시간 또는 상태 */}
                    {isExecuting ? (
                      <span className="text-xs text-amber-600 font-medium animate-pulse flex-shrink-0">
                        실행 중...
                      </span>
                    ) : item.duration !== null ? (
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {(item.duration / 1000).toFixed(2)}s
                      </span>
                    ) : null}
                  </div>

                  {/* 진행률 바 - COMPLETED와 EXECUTING 상태만 표시 */}
                  {(isCompleted || isExecuting) && item.duration !== null && (
                    <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCompleted
                            ? 'bg-green-500'
                            : isExecuting
                              ? 'bg-amber-500 animate-pulse'
                              : 'bg-gray-300'
                        }`}
                        style={{ width: `${durationPercent}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* 재시도 버튼 */}
                {isFailed && onRetry && (
                  <button
                    onClick={() => onRetry(item.name)}
                    className="flex-shrink-0 p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                    title="재시도"
                  >
                    <RotateCw className="w-4 h-4 text-red-600" />
                  </button>
                )}
              </div>

              {/* 연결선 */}
              {index < items.length - 1 && (
                <div
                  className={`ml-2.5 h-2 border-l transition-colors ${
                    isExecuting || isFailed ? 'border-amber-300' : 'border-gray-200'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* 합계 */}
      {totalDuration > 0 && (
        <div className="pt-2 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">총 소요 시간</span>
            <span className="font-semibold text-gray-900">
              {(totalDuration / 1000).toFixed(2)}s
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
