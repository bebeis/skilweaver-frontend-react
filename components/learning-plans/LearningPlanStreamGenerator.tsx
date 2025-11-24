/**
 * SSE 스트리밍 방식의 학습 플랜 생성 컴포넌트
 */

import React, { useEffect, useState } from 'react';
import { useLearningPlanStream } from '@hooks/useLearningPlanStream';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Label } from '@components/ui/label';
import { Progress } from '@components/ui/progress';
import { Alert, AlertDescription } from '@components/ui/alert';
import { CheckCircle2, XCircle, Loader2, Zap, Clock, ChevronRight, Maximize2 } from 'lucide-react';
import { Badge } from '@components/ui/badge';
import { PerformanceAnalytics } from './PerformanceAnalytics';
import { GOAPPathDAG } from './GOAPPathDAG';

interface LearningPlanStreamGeneratorProps {
  memberId: number;
  targetTechnology: string;
  prefersFastPlan?: boolean;
  onComplete?: (learningPlanId: number) => void;
}

export function LearningPlanStreamGenerator({
  memberId,
  targetTechnology: initialTargetTechnology,
  prefersFastPlan: initialPrefersFastPlan = false,
  onComplete,
}: LearningPlanStreamGeneratorProps) {
  const [expandDAG, setExpandDAG] = useState(false);

  const {
    isStreaming,
    isComplete,
    isError,
    events,
    result,
    errorMessage,
    currentAction,
    progress,
    executedPath,
    executionHistory,
    totalDuration,
    estimatedTimeRemaining,
    failedActions,
    startStream,
    stopStream,
    reset,
  } = useLearningPlanStream();

  const failedActionEntries = Array.from(failedActions.entries());

  // 컴포넌트 마운트 시 자동으로 스트리밍 시작
  useEffect(() => {
    if (initialTargetTechnology.trim()) {
      startStream(memberId, initialTargetTechnology, initialPrefersFastPlan);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleReset = () => {
    reset();
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-6 h-6 text-indigo-500" />
          AI 학습 플랜 생성기
        </CardTitle>
        <CardDescription>
          AI가 실시간으로 맞춤형 학습 플랜을 생성합니다
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 진행 상황 */}
        {isStreaming && (
          <div className="space-y-6">
            {/* 진행률 및 시간 정보 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">진행 상황</span>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-indigo-600">{progress}%</span>
                  {estimatedTimeRemaining !== null && estimatedTimeRemaining > 0 && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>약 {Math.ceil(estimatedTimeRemaining / 1000)}초</span>
                    </div>
                  )}
                </div>
              </div>
              <Progress value={progress} className="h-3" />
            </div>

            {/* 현재 작업 상태 */}
            <Alert className="border-indigo-200 bg-indigo-50">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <AlertDescription className="text-indigo-900">
                <div className="font-medium">{currentAction || '처리 중...'}</div>
                <div className="text-xs mt-1">{executedPath.length}개 단계 완료</div>
              </AlertDescription>
            </Alert>

            {/* GOAP 경로 DAG 시각화 */}
            {executionHistory.length > 0 && !expandDAG && (
              <div className="space-y-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExpandDAG(true)}
                  className="w-full"
                >
                  <Maximize2 className="w-4 h-4 mr-2" />
                  GOAP 경로 보기 (DAG)
                </Button>
              </div>
            )}

            {/* 실행 경로 타임라인 */}
            {executionHistory.length > 0 && !expandDAG && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">실행 경로</Label>
                <div className="space-y-2">
                  {executionHistory.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        {item.status === 'COMPLETED' ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.name}</p>
                          {item.duration !== null && (
                            <p className="text-xs text-muted-foreground">
                              {(item.duration / 1000).toFixed(1)}초
                            </p>
                          )}
                        </div>
                      </div>
                      {index < executionHistory.length - 1 && (
                        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 확대된 DAG */}
            {executionHistory.length > 0 && expandDAG && (
              <div className="space-y-3">
                <GOAPPathDAG
                  nodes={executionHistory.map((item) => ({
                    id: item.name,
                    name: item.name,
                    duration: item.duration,
                    status: item.status,
                    startedAt: item.startedAt,
                    completedAt: item.completedAt,
                  }))}
                  title="GOAP 실행 경로 (DAG)"
                  compact={false}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExpandDAG(false)}
                  className="w-full"
                >
                  타임라인 보기
                </Button>
              </div>
            )}

            {/* 누적 시간 표시 */}
            {totalDuration > 0 && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">누적 실행 시간</p>
                  <p className="text-sm font-medium">
                    {(totalDuration / 1000).toFixed(1)}초
                  </p>
                </div>
              </div>
            )}

            {/* 중단 버튼 */}
            <Button
              onClick={stopStream}
              variant="outline"
              className="w-full"
            >
              중단
            </Button>
          </div>
        )}

        {/* 완료 */}
        {isComplete && result && (
          <div className="space-y-6">
            <Alert className="border-green-500 bg-green-50">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-800">
                학습 플랜이 성공적으로 생성되었습니다! 🎉
              </AlertDescription>
            </Alert>

            {/* 통계 카드들 */}
            <div className="grid grid-cols-2 gap-3">
              {(result.curriculum || result.steps) && (
                <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-indigo-100">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-indigo-700">
                        {(result.curriculum?.length || result.steps?.length || 0)}
                      </p>
                      <p className="text-xs text-indigo-600 mt-1 font-medium">
                        학습 단계
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {result.generationTimeSeconds && (
                <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <p className="text-3xl font-bold text-amber-700">
                          {Math.round(result.generationTimeSeconds / 60)}
                        </p>
                      </div>
                      <p className="text-xs text-amber-600 mt-1 font-medium">
                        생성 소요 시간
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* 경로 타입 및 비용 */}
            {(result.path || result.estimatedCost) && (
              <div className="grid grid-cols-2 gap-3">
                {result.path && (
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">경로 타입</Label>
                    <Badge
                      variant={
                        result.path === 'QUICK'
                          ? 'default'
                          : result.path === 'STANDARD'
                            ? 'secondary'
                            : 'outline'
                      }
                      className="w-full justify-center py-2 text-xs font-medium"
                    >
                      {result.path === 'QUICK'
                        ? '빠른 경로'
                        : result.path === 'STANDARD'
                          ? '표준 경로'
                          : '상세 경로'}
                    </Badge>
                  </div>
                )}

                {result.estimatedCost && (
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">예상 비용</Label>
                    <div className="bg-slate-100 rounded-lg px-3 py-2 text-center">
                      <p className="text-sm font-bold text-slate-900">
                        ${result.estimatedCost.toFixed(4)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 최종 실행 경로 요약 */}
            {executionHistory.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs font-medium">생성 과정</Label>
                <div className="rounded-lg border border-slate-200 p-3 bg-slate-50">
                  <div className="flex flex-wrap gap-2">
                    {executionHistory.map((item, index) => (
                      <React.Fragment key={index}>
                        <Badge variant="outline" className="text-xs">
                          {item.name}
                          {item.duration && ` (${(item.duration / 1000).toFixed(1)}s)`}
                        </Badge>
                        {index < executionHistory.length - 1 && (
                          <span className="text-slate-400">→</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 성능 분석 대시보드 */}
            {executionHistory.length > 0 && totalDuration > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    성능 분석
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    액션별 성능 지표 및 병목 분석
                  </span>
                </div>
                <PerformanceAnalytics
                  metrics={executionHistory.map((item) => ({
                    actionName: item.name,
                    duration: item.duration || 0,
                    status: item.status,
                  }))}
                  totalDuration={totalDuration}
                />
              </div>
            )}

            {/* 액션 버튼 */}
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  if (onComplete && (result.learningPlanId || result.id)) {
                    onComplete(result.learningPlanId || result.id);
                  }
                }}
                disabled={!result.learningPlanId && !result.id}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              >
                <Zap className="w-4 h-4 mr-2" />
                플랜 확인하기
              </Button>
              <Button onClick={handleReset} variant="outline" className="flex-1">
                다시 생성
              </Button>
            </div>
          </div>
        )}

        {/* 오류 */}
        {isError && (
          <div className="space-y-6">
            <Alert variant="destructive" className="border-red-300 bg-red-50">
              <XCircle className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-red-900">
                <div className="font-semibold">{errorMessage || '알 수 없는 오류가 발생했습니다.'}</div>
                {failedActionEntries.length > 0 && (
                  <div className="text-xs mt-2">
                    실패한 단계: {failedActionEntries.map(([action]) => action).join(', ')}
                  </div>
                )}
              </AlertDescription>
            </Alert>

            {/* 실행된 단계 요약 */}
            {executionHistory.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs font-medium">실행 경로</Label>
                <div className="rounded-lg border border-red-200 p-3 bg-red-50">
                  <div className="space-y-2">
                    {executionHistory.map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center gap-2 text-xs"
                      >
                        {item.status === 'COMPLETED' ? (
                          <CheckCircle2 className="w-3 h-3 text-green-600 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-3 h-3 text-red-600 flex-shrink-0" />
                        )}
                        <span className="truncate">{item.name}</span>
                        {item.duration && (
                          <span className="text-muted-foreground ml-auto flex-shrink-0">
                            {(item.duration / 1000).toFixed(1)}s
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 누적 실행 시간 */}
            {totalDuration > 0 && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">오류 발생 전 실행 시간</p>
                  <p className="text-sm font-medium">
                    {(totalDuration / 1000).toFixed(1)}초
                  </p>
                </div>
              </div>
            )}

            {/* 액션 버튼 */}
            <div className="flex gap-2">
              <Button
                onClick={handleReset}
                variant="outline"
                className="flex-1"
              >
                처음부터 다시
              </Button>
              <Button
                onClick={() => {
                  // TODO: 마지막 실패한 지점부터 재개
                  handleReset();
                }}
                className="flex-1"
              >
                재시도
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

