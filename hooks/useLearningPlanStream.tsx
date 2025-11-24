/**
 * 학습 플랜 생성 SSE 스트리밍을 위한 React Hook
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  streamLearningPlanGeneration,
  SSEEvent,
  AgentCompletedEvent,
} from '@/lib/api/agent-runs';

export interface UseLearningPlanStreamState {
  isStreaming: boolean;
  isComplete: boolean;
  isError: boolean;
  events: SSEEvent[];
  result: AgentCompletedEvent['result'] | null;
  errorMessage: string | null;
  currentAction: string | null;
  progress: number; // 0-100
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
  });

  const eventSourceRef = useRef<EventSource | null>(null);

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
      setState({
        isStreaming: true,
        isComplete: false,
        isError: false,
        events: [],
        result: null,
        errorMessage: null,
        currentAction: null,
        progress: 0,
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
            setState((prev) => ({
              ...prev,
              events: [...prev.events, data],
              currentAction: data.actionName,
              progress: Math.min(prev.progress + 15, 85),
            }));
          },

          onProgress: (data) => {
            setState((prev) => ({
              ...prev,
              events: [...prev.events, data],
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
    });
  }, []);

  return {
    ...state,
    startStream,
    stopStream,
    reset,
  };
}

