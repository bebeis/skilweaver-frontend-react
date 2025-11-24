/**
 * 실행된 GOAP 경로를 DAG (Directed Acyclic Graph) 형태로 시각화
 * 액션 간의 의존성과 실행 순서를 그래프로 표현
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Badge } from '@components/ui/badge';
import { ArrowRight, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export interface DAGNode {
  id: string;
  name: string;
  duration: number | null; // ms
  status: 'COMPLETED' | 'FAILED' | 'EXECUTING';
  startedAt?: number;
  completedAt?: number;
}

interface GOAPPathDAGProps {
  nodes: DAGNode[];
  title?: string;
  compact?: boolean;
}

export function GOAPPathDAG({
  nodes,
  title = 'GOAP 실행 경로',
  compact = false,
}: GOAPPathDAGProps) {
  if (nodes.length === 0) {
    return null;
  }

  const totalDuration = nodes.reduce(
    (sum, node) => sum + (node.duration || 0),
    0
  );

  // 최대 너비 계산 (반응형)
  const maxDuration = Math.max(...nodes.map((n) => n.duration || 0), 1);

  return (
    <Card className={compact ? 'border-slate-200' : 'border-indigo-200'}>
      <CardHeader className={compact ? 'pb-2' : 'pb-4'}>
        <CardTitle className={compact ? 'text-sm' : 'text-base'}>
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* SVG DAG 시각화 */}
        <div className="relative overflow-x-auto pb-4">
          <svg
            className="w-full h-auto"
            viewBox={`0 0 ${Math.max(800, nodes.length * 150)} 300`}
            preserveAspectRatio="xMidYMid meet"
            style={{ minWidth: `${Math.max(400, nodes.length * 120)}px` }}
          >
            {/* 배경 그리드 */}
            <defs>
              <pattern
                id="grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="rgba(0,0,0,0.03)"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* 노드들 간 연결선 */}
            {nodes.map((node, index) => {
              if (index === nodes.length - 1) return null;

              const x1 = 80 + index * 130;
              const y1 = 150;
              const x2 = 80 + (index + 1) * 130;
              const y2 = 150;

              return (
                <g key={`line-${index}`}>
                  {/* 연결선 */}
                  <line
                    x1={x1 + 40}
                    y1={y1}
                    x2={x2 - 40}
                    y2={y2}
                    stroke="#cbd5e1"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                  />
                  {/* 화살표 정의 */}
                  <defs>
                    <marker
                      id="arrowhead"
                      markerWidth="10"
                      markerHeight="10"
                      refX="9"
                      refY="3"
                      orient="auto"
                    >
                      <polygon points="0 0, 10 3, 0 6" fill="#cbd5e1" />
                    </marker>
                  </defs>
                </g>
              );
            })}

            {/* 노드들 */}
            {nodes.map((node, index) => {
              const x = 80 + index * 130;
              const y = 150;

              const isCompleted = node.status === 'COMPLETED';
              const isFailed = node.status === 'FAILED';
              const isExecuting = node.status === 'EXECUTING';

              const bgColor = isCompleted
                ? '#dcfce7'
                : isFailed
                  ? '#fee2e2'
                  : isExecuting
                    ? '#fef3c7'
                    : '#f1f5f9';

              const borderColor = isCompleted
                ? '#16a34a'
                : isFailed
                  ? '#dc2626'
                  : isExecuting
                    ? '#eab308'
                    : '#94a3b8';

              const textColor = isCompleted
                ? '#166534'
                : isFailed
                  ? '#7f1d1d'
                  : isExecuting
                    ? '#78350f'
                    : '#475569';

              return (
                <g key={`node-${index}`}>
                  {/* 노드 배경 */}
                  <rect
                    x={x - 35}
                    y={y - 35}
                    width="70"
                    height="70"
                    rx="8"
                    fill={bgColor}
                    stroke={borderColor}
                    strokeWidth="2"
                  />

                  {/* 상태 아이콘 */}
                  <g
                    x={x - 20}
                    y={y - 20}
                    width="40"
                    height="40"
                    textAnchor="middle"
                  >
                    {isCompleted ? (
                      <text
                        x={x}
                        y={y - 8}
                        fontSize="24"
                        textAnchor="middle"
                        fill="#16a34a"
                      >
                        ✓
                      </text>
                    ) : isFailed ? (
                      <text
                        x={x}
                        y={y - 8}
                        fontSize="24"
                        textAnchor="middle"
                        fill="#dc2626"
                      >
                        ✕
                      </text>
                    ) : isExecuting ? (
                      <text
                        x={x}
                        y={y - 8}
                        fontSize="20"
                        textAnchor="middle"
                        fill="#eab308"
                      >
                        ⚡
                      </text>
                    ) : (
                      <circle
                        cx={x}
                        cy={y - 8}
                        r="8"
                        fill="#cbd5e1"
                      />
                    )}
                  </g>

                  {/* 노드 텍스트 */}
                  <text
                    x={x}
                    y={y + 12}
                    fontSize="11"
                    fontWeight="600"
                    textAnchor="middle"
                    fill={textColor}
                    className="pointer-events-none"
                  >
                    {node.name.length > 12
                      ? `${node.name.substring(0, 12)}...`
                      : node.name}
                  </text>

                  {/* 지속 시간 */}
                  {node.duration && (
                    <text
                      x={x}
                      y={y + 25}
                      fontSize="10"
                      textAnchor="middle"
                      fill="#64748b"
                      className="pointer-events-none"
                    >
                      {(node.duration / 1000).toFixed(2)}s
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* 노드 상세 정보 */}
        {!compact && (
          <div className="space-y-2 pt-4 border-t border-slate-200">
            <h4 className="text-xs font-semibold text-slate-700">단계 상세</h4>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {nodes.map((node, index) => (
                <div
                  key={`detail-${index}`}
                  className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 text-xs"
                >
                  {/* 상태 아이콘 */}
                  <div className="flex-shrink-0">
                    {node.status === 'COMPLETED' ? (
                      <CheckCircle2 className="w-3 h-3 text-green-600" />
                    ) : node.status === 'FAILED' ? (
                      <AlertCircle className="w-3 h-3 text-red-600" />
                    ) : (
                      <Clock className="w-3 h-3 text-amber-600 animate-spin" />
                    )}
                  </div>

                  {/* 정보 */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">
                      {index + 1}. {node.name}
                    </p>
                    {node.duration && (
                      <p className="text-slate-600">
                        {(node.duration / 1000).toFixed(2)}s
                      </p>
                    )}
                  </div>

                  {/* 상태 배지 */}
                  <Badge
                    variant={
                      node.status === 'COMPLETED'
                        ? 'default'
                        : node.status === 'FAILED'
                          ? 'destructive'
                          : 'secondary'
                    }
                    className="flex-shrink-0 text-xs"
                  >
                    {node.status === 'COMPLETED'
                      ? '완료'
                      : node.status === 'FAILED'
                        ? '실패'
                        : '실행'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 요약 정보 */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-indigo-50 border border-indigo-200 text-xs">
          <span className="text-slate-700">
            {nodes.filter((n) => n.status === 'COMPLETED').length} / {nodes.length} 단계 완료
          </span>
          {totalDuration > 0 && (
            <span className="font-medium text-indigo-700">
              총 {(totalDuration / 1000).toFixed(2)}초
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
