/**
 * SSE 스트리밍 방식의 학습 플랜 생성 컴포넌트
 */

import React, { useState } from 'react';
import { useLearningPlanStream } from '@hooks/useLearningPlanStream';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import { Progress } from '@components/ui/progress';
import { Alert, AlertDescription } from '@components/ui/alert';
import { CheckCircle2, XCircle, Loader2, Zap, Clock } from 'lucide-react';
import { Switch } from '@components/ui/switch';

interface LearningPlanStreamGeneratorProps {
  memberId: number;
  onComplete?: (learningPlanId: number) => void;
}

export function LearningPlanStreamGenerator({
  memberId,
  onComplete,
}: LearningPlanStreamGeneratorProps) {
  const [targetTechnology, setTargetTechnology] = useState('');
  const [prefersFastPlan, setPrefersFastPlan] = useState(false);

  const {
    isStreaming,
    isComplete,
    isError,
    events,
    result,
    errorMessage,
    currentAction,
    progress,
    startStream,
    stopStream,
    reset,
  } = useLearningPlanStream();

  const handleGenerate = () => {
    if (!targetTechnology.trim()) {
      alert('학습할 기술을 입력해주세요.');
      return;
    }
    startStream(memberId, targetTechnology, prefersFastPlan);
  };

  const handleReset = () => {
    reset();
    setTargetTechnology('');
    setPrefersFastPlan(false);
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
        {/* 입력 폼 */}
        {!isStreaming && !isComplete && !isError && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="target-tech">학습할 기술</Label>
              <Input
                id="target-tech"
                placeholder="예: Kotlin Coroutines, React Hooks, Docker"
                value={targetTechnology}
                onChange={(e) => setTargetTechnology(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleGenerate();
                  }
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="fast-plan" className="text-sm font-medium">
                  빠른 플랜 생성
                </Label>
                <p className="text-sm text-muted-foreground">
                  핵심 내용만 간략하게 생성합니다
                </p>
              </div>
              <Switch
                id="fast-plan"
                checked={prefersFastPlan}
                onCheckedChange={setPrefersFastPlan}
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!targetTechnology.trim()}
              className="w-full"
              size="lg"
            >
              <Zap className="w-4 h-4 mr-2" />
              플랜 생성 시작
            </Button>
          </div>
        )}

        {/* 진행 상황 */}
        {isStreaming && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">진행 상황</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <Alert>
              <Loader2 className="w-4 h-4 animate-spin" />
              <AlertDescription>
                {currentAction || '처리 중...'}
              </AlertDescription>
            </Alert>

            {/* 이벤트 로그 */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">실시간 로그</Label>
              <div className="bg-muted rounded-lg p-4 space-y-2 max-h-64 overflow-y-auto">
                {events.map((event, index) => (
                  <div
                    key={index}
                    className="text-xs flex items-start gap-2 font-mono"
                  >
                    <span className="text-muted-foreground">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="flex-1">{event.message}</span>
                  </div>
                ))}
              </div>
            </div>

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
          <div className="space-y-4">
            <Alert className="border-green-500 bg-green-50">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-800">
                학습 플랜이 성공적으로 생성되었습니다!
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-indigo-600">
                      {result.curriculum.length}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      학습 단계
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <p className="text-3xl font-bold text-indigo-600">
                        {Math.round(result.generationTimeSeconds / 60)}
                      </p>
                      <span className="text-sm text-muted-foreground">분</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      생성 소요 시간
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">경로 타입</Label>
              <div className="bg-muted rounded-lg px-4 py-2">
                <p className="text-sm font-medium">{result.path}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">예상 비용</Label>
              <div className="bg-muted rounded-lg px-4 py-2">
                <p className="text-sm font-medium">
                  ${result.estimatedCost.toFixed(4)}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  // TODO: 학습 플랜 상세 페이지로 이동
                  if (onComplete) {
                    onComplete(0); // learningPlanId 받아와야 함
                  }
                }}
                className="flex-1"
              >
                플랜 확인하기
              </Button>
              <Button onClick={handleReset} variant="outline">
                다시 생성
              </Button>
            </div>
          </div>
        )}

        {/* 오류 */}
        {isError && (
          <div className="space-y-4">
            <Alert variant="destructive">
              <XCircle className="w-4 h-4" />
              <AlertDescription>
                {errorMessage || '알 수 없는 오류가 발생했습니다.'}
              </AlertDescription>
            </Alert>

            <Button onClick={handleReset} variant="outline" className="w-full">
              다시 시도
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

