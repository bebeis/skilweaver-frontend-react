/**
 * 학습 플랜 생성 성능 분석 대시보드
 * 액션별 실행 시간, 병목 지점, 통계 정보를 시각화
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Badge } from '@components/ui/badge';
import { AlertCircle, TrendingUp, Clock, Zap } from 'lucide-react';

export interface PerformanceMetrics {
  actionName: string;
  duration: number; // ms
  status: 'COMPLETED' | 'FAILED';
}

interface PerformanceAnalyticsProps {
  metrics: PerformanceMetrics[];
  totalDuration: number;
}

export function PerformanceAnalytics({
  metrics,
  totalDuration,
}: PerformanceAnalyticsProps) {
  if (metrics.length === 0) {
    return null;
  }

  // 통계 계산
  const completedMetrics = metrics.filter((m) => m.status === 'COMPLETED');
  const failedMetrics = metrics.filter((m) => m.status === 'FAILED');

  const avgDuration =
    completedMetrics.length > 0
      ? completedMetrics.reduce((sum, m) => sum + m.duration, 0) /
        completedMetrics.length
      : 0;

  const maxDuration = Math.max(...metrics.map((m) => m.duration), 0);
  const minDuration = Math.min(
    ...completedMetrics.map((m) => m.duration),
    Infinity
  );

  // 병목 지점 (상위 3개)
  const bottlenecks = metrics
    .filter((m) => m.status === 'COMPLETED')
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 3);

  const maxWidth = bottlenecks[0]?.duration || 1;

  return (
    <div className="space-y-6">
      {/* 통계 카드들 */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-indigo-100">
          <CardContent className="pt-4">
            <div className="text-center">
              <Clock className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-indigo-700">
                {(totalDuration / 1000).toFixed(2)}s
              </p>
              <p className="text-xs text-indigo-600 mt-1">전체 소요 시간</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100">
          <CardContent className="pt-4">
            <div className="text-center">
              <Zap className="w-4 h-4 text-amber-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-amber-700">
                {(avgDuration / 1000).toFixed(2)}s
              </p>
              <p className="text-xs text-amber-600 mt-1">평균 액션 시간</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-700">
                {completedMetrics.length}
              </p>
              <p className="text-xs text-green-600 mt-1">완료된 액션</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-700">
                {failedMetrics.length}
              </p>
              <p className="text-xs text-red-600 mt-1">실패한 액션</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 병목 지점 분석 */}
      {bottlenecks.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              병목 지점 분석
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {bottlenecks.map((metric, index) => {
              const percentage = (metric.duration / maxWidth) * 100;
              const isSignificant = percentage > 50;

              return (
                <div key={`${metric.actionName}-${index}`} className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium flex-1 truncate">
                      {index + 1}. {metric.actionName}
                    </span>
                    <Badge
                      variant={isSignificant ? 'destructive' : 'secondary'}
                      className="flex-shrink-0 text-xs"
                    >
                      {(metric.duration / 1000).toFixed(2)}s
                    </Badge>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isSignificant ? 'bg-red-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  {isSignificant && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      최적화 권장
                    </p>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* 모든 액션 상세 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">액션별 상세</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {metrics.map((metric, index) => {
            const percentage = (metric.duration / totalDuration) * 100;

            return (
              <div key={`${metric.actionName}-${index}`} className="space-y-1">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="truncate font-medium">{metric.actionName}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-muted-foreground">
                      {(metric.duration / 1000).toFixed(2)}s
                    </span>
                    <Badge
                      variant={metric.status === 'COMPLETED' ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {metric.status === 'COMPLETED' ? '✓' : '✕'}
                    </Badge>
                  </div>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      metric.status === 'COMPLETED' ? 'bg-blue-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* 요약 통계 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">요약</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">최소 실행 시간:</span>
            <span className="font-medium">
              {minDuration === Infinity ? '-' : `${(minDuration / 1000).toFixed(2)}s`}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">최대 실행 시간:</span>
            <span className="font-medium">{(maxDuration / 1000).toFixed(2)}s</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">성공률:</span>
            <span className="font-medium">
              {((completedMetrics.length / metrics.length) * 100).toFixed(0)}%
            </span>
          </div>
          <div className="flex justify-between pt-2 border-t border-gray-200">
            <span className="text-muted-foreground">총 액션 수:</span>
            <span className="font-medium">{metrics.length}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
