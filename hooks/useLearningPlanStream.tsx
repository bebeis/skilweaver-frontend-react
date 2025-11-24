/**
 * 학습 플랜 생성 SSE 스트리밍을 위한 React Hook
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  streamLearningPlanGeneration,
  SSEEvent,
  AgentCompletedEvent,
  PathUpdatedEvent,
  ActionExecutionDetail,
} from '@/lib/api/agent-runs';

export interface ExecutionPathItem {
  name: string;
  duration: number | null;
  status: 'PLANNED' | 'EXECUTING' | 'COMPLETED' | 'FAILED';
  startedAt?: number;
  completedAt?: number;
}

export interface UseLearningPlanStreamState {
  isStreaming: boolean;
  isComplete: boolean;
  isError: boolean;
  events: SSEEvent[];
  result: AgentCompletedEvent['result'] | null;
  errorMessage: string | null;
  currentAction: string | null;
  progress: number; // 0-100
  executedPath: string[]; // 실행된 액션 이름 배열
  executedActions: ActionExecutionDetail[]; // 상세 실행 정보
  executionHistory: ExecutionPathItem[]; // UI용 타임라인 데이터
  totalDuration: number; // 누적 실행 시간 (ms)
  estimatedTimeRemaining: number | null; // 예상 남은 시간 (ms)
  currentExecutingActionIndex: number; // 현재 실행 중인 액션 인덱스 (-1 = 없음)
  failedActions: Map<string, string>; // 실패한 액션 및 에러 메시지
}

export interface UseLearningPlanStreamReturn extends UseLearningPlanStreamState {
  startStream: (
    memberId: number,
    targetTechnology: string,
    prefersFastPlan?: boolean
  ) => void;
  stopStream: () => void;
  reset: () => void;
}

/**
 * 학습 플랜 생성 SSE 스트리밍 Hook
 * 
 * @example
 * ```tsx
 * function LearningPlanGenerator() {
 *   const {
 *     isStreaming,
 *     isComplete,
 *     events,
 *     result,
 *     currentAction,
 *     progress,
 *     startStream,
 *     stopStream,
 *   } = useLearningPlanStream();
 * 
 *   const handleGenerate = () => {
 *     startStream(1, 'Kotlin Coroutines', false);
 *   };
 * 
 *   return (
 *     <div>
 *       <button onClick={handleGenerate} disabled={isStreaming}>
 *         플랜 생성
 *       </button>
 *       {isStreaming && <p>진행 중: {currentAction} ({progress}%)</p>}
 *       {isComplete && <p>완료! 총 {result?.curriculum.length}개 단계</p>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useLearningPlanStream(): UseLearningPlanStreamReturn {
  const [state, setState] = useState<UseLearningPlanStreamState>({
    isStreaming: false,
    isComplete: false,
    isError: false,
    events: [],
    result: null,
    errorMessage: null,
    currentAction: null,
    progress: 0,
    executedPath: [],
    executedActions: [],
    executionHistory: [],
    totalDuration: 0,
    estimatedTimeRemaining: null,
    currentExecutingActionIndex: -1,
    failedActions: new Map(),
  });

  const eventSourceRef = useRef<EventSource | null>(null);
  const streamStartTimeRef = useRef<number>(0);
  const actionStartTimeRef = useRef<Map<string, number>>(new Map());

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const startStream = useCallback(
    (
      memberId: number,
      targetTechnology: string,
      prefersFastPlan: boolean = false
    ) => {
      // 이미 스트리밍 중이면 무시
      if (state.isStreaming) {
        return;
      }

      // 상태 초기화
      streamStartTimeRef.current = Date.now();
      actionStartTimeRef.current.clear();
      setState({
        isStreaming: true,
        isComplete: false,
        isError: false,
        events: [],
        result: null,
        errorMessage: null,
        currentAction: null,
        progress: 0,
        executedPath: [],
        executedActions: [],
        executionHistory: [],
        totalDuration: 0,
        estimatedTimeRemaining: null,
        currentExecutingActionIndex: -1,
        failedActions: new Map(),
      });

      // SSE 스트림 시작
      const eventSource = streamLearningPlanGeneration(
        memberId,
        targetTechnology,
        prefersFastPlan,
        {
          onAgentStarted: (data) => {
            setState((prev) => ({
              ...prev,
              events: [...prev.events, data],
              currentAction: '에이전트 시작',
              progress: 5,
            }));
          },

          onPlanningStarted: (data) => {
            setState((prev) => ({
              ...prev,
              events: [...prev.events, data],
              currentAction: 'GOAP 경로 계획 중',
              progress: 10,
            }));
          },

          onActionExecuted: (data) => {
            // 액션 시작 시간 기록
            actionStartTimeRef.current.set(data.actionName, Date.now());

            setState((prev) => {
              // 실행 중 상태로 현재 액션 추가
              const newExecutionHistory = [...prev.executionHistory];
              const existingIndex = newExecutionHistory.findIndex(
                (item) => item.name === data.actionName
              );

              if (existingIndex === -1) {
                // 새로운 액션
                newExecutionHistory.push({
                  name: data.actionName,
                  duration: null,
                  status: 'EXECUTING',
                  startedAt: Date.now(),
                });
              } else {
                // 기존 액션 상태 업데이트
                newExecutionHistory[existingIndex] = {
                  ...newExecutionHistory[existingIndex],
                  status: 'EXECUTING',
                  startedAt: Date.now(),
                };
              }

              return {
                ...prev,
                events: [...prev.events, data],
                currentAction: data.actionName,
                currentExecutingActionIndex: newExecutionHistory.length - 1,
                executionHistory: newExecutionHistory,
              };
            });
          },

          onProgress: (data) => {
            setState((prev) => ({
              ...prev,
              events: [...prev.events, data],
            }));
          },

          onPathUpdated: (data) => {
            const totalDuration = data.executedActions.reduce(
              (sum, action) => sum + (action.durationMs || 0),
              0
            );

            // 예상 남은 시간 추정: 평균 액션 시간 * 남은 액션 수
            const avgActionDuration =
              data.executedActions.length > 0
                ? totalDuration / data.executedActions.length
                : 0;
            const estimatedActionsRemaining = Math.max(0, 8 - data.executedActions.length);
            const estimatedTimeRemaining = avgActionDuration * estimatedActionsRemaining;

            // 진행도 계산: 실행된 액션 수 기반
            const estimatedTotalActions = Math.max(8, data.executedPath.length + 3);
            const completionRatio = data.executedActions.length / estimatedTotalActions;
            const progress = Math.min(Math.round(completionRatio * 90) + 5, 95);

            // 타임라인 데이터 생성 - 상태 전환 포함
            const executionHistory: ExecutionPathItem[] = data.executedActions.map(
              (action, index) => {
                const startTime = actionStartTimeRef.current.get(action.name) || Date.now();
                const completedTime = startTime + (action.durationMs || 0);

                return {
                  name: action.name,
                  duration: action.durationMs,
                  status: action.status === 'COMPLETED' ? 'COMPLETED' : 'FAILED',
                  startedAt: startTime,
                  completedAt: completedTime,
                };
              }
            );

            setState((prev) => ({
              ...prev,
              events: [...prev.events, data],
              executedPath: data.executedPath,
              executedActions: data.executedActions,
              executionHistory,
              totalDuration,
              estimatedTimeRemaining: Math.max(0, estimatedTimeRemaining),
              progress,
              currentExecutingActionIndex: -1, // 모두 완료됨
            }));
          },

          onAgentCompleted: (data) => {
            setState((prev) => ({
              ...prev,
              isStreaming: false,
              isComplete: true,
              events: [...prev.events, data],
              result: data.result,
              currentAction: '완료',
              progress: 100,
            }));
          },

          onError: (data) => {
            setState((prev) => ({
              ...prev,
              isStreaming: false,
              isError: true,
              events: [...prev.events, data],
              errorMessage: data.message,
              currentAction: '오류 발생',
              // 현재 실행 중인 액션을 FAILED로 표시
              executionHistory: prev.executionHistory.map((item, index) =>
                index === prev.currentExecutingActionIndex
                  ? {
                      ...item,
                      status: 'FAILED',
                      completedAt: Date.now(),
                    }
                  : item
              ),
              failedActions: new Map([
                ...prev.failedActions,
                [prev.currentAction || 'Unknown', data.message],
              ]),
            }));
          },

          onClose: () => {
            // 이미 완료나 에러 상태가 아니면 중단으로 처리
            setState((prev) => {
              if (!prev.isComplete && !prev.isError) {
                return {
                  ...prev,
                  isStreaming: false,
                  currentAction: '중단됨',
                };
              }
              return prev;
            });
          },
        }
      );

      eventSourceRef.current = eventSource;
    },
    [state.isStreaming]
  );

  const stopStream = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setState((prev) => ({
      ...prev,
      isStreaming: false,
      currentAction: '중단됨',
    }));
  }, []);

  const reset = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setState({
      isStreaming: false,
      isComplete: false,
      isError: false,
      events: [],
      result: null,
      errorMessage: null,
      currentAction: null,
      progress: 0,
      executedPath: [],
      executedActions: [],
      executionHistory: [],
      totalDuration: 0,
      estimatedTimeRemaining: null,
      currentExecutingActionIndex: -1,
      failedActions: new Map(),
    });
    actionStartTimeRef.current.clear();
  }, []);

  return {
    ...state,
    startStream,
    stopStream,
    reset,
  };
}

