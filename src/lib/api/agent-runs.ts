/**
 * AI 에이전트 실행 API
 * SSE(Server-Sent Events)를 이용한 실시간 스트리밍 지원
 */

import { apiClient, ApiResponse } from './client';
import { AgentRunStatus } from './types';

// ============================================================================
// Types
// ============================================================================

export type AgentType = 'LEARNING_PLAN';

export type SSEEventType =
  | 'AGENT_STARTED'
  | 'PLANNING_STARTED'
  | 'ACTION_EXECUTED'
  | 'PROGRESS'
  | 'AGENT_PROGRESS'
  | 'PATH_UPDATED'
  | 'AGENT_COMPLETED'
  | 'ERROR';

// ProgressStage enum (v3.1 신규)
export type ProgressStage =
  | 'ANALYSIS_STARTED'
  | 'DEEP_ANALYSIS'
  | 'GAP_ANALYSIS'
  | 'CURRICULUM_GENERATION'
  | 'RESOURCE_ENRICHMENT'
  | 'RESOURCE_STEP_PROGRESS'
  | 'FINALIZING';

// ProgressStage별 예상 진행률 매핑
export const PROGRESS_STAGE_PERCENTAGE: Record<ProgressStage, number> = {
  ANALYSIS_STARTED: 10,
  DEEP_ANALYSIS: 20,
  GAP_ANALYSIS: 30,
  CURRICULUM_GENERATION: 50,
  RESOURCE_ENRICHMENT: 70,
  RESOURCE_STEP_PROGRESS: 85, // 70-95% 범위 내에서 동적
  FINALIZING: 95,
};

// ProgressStage 한글 라벨
export const PROGRESS_STAGE_LABELS: Record<ProgressStage, string> = {
  ANALYSIS_STARTED: '기술 분석 시작',
  DEEP_ANALYSIS: '심층 분석',
  GAP_ANALYSIS: '역량 Gap 분석',
  CURRICULUM_GENERATION: '커리큘럼 생성',
  RESOURCE_ENRICHMENT: '학습 자료 수집',
  RESOURCE_STEP_PROGRESS: '스텝별 리소스 수집',
  FINALIZING: '최종화',
};

export interface AgentRun {
  agentRunId: number;
  memberId: number;
  agentType: AgentType;
  status: AgentRunStatus;
  parameters: string; // JSON string
  result: string | null; // JSON string
  learningPlanId: number | null;
  errorMessage: string | null;
  startedAt: string | null;
  completedAt: string | null;
  executionTimeMs: number | null;
  estimatedCost: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAgentRunRequest {
  agentType: AgentType;
  parameters: string; // JSON string
}

export interface AgentRunListResponse {
  runs: AgentRun[];
  total: number;
}

export interface CompleteAgentRunParams {
  result?: string;
  learningPlanId?: number;
  cost?: number;
  executionTimeMs?: number;
}

// SSE Event Data Types
export interface SSEBaseEvent {
  type: SSEEventType;
  agentRunId: number;
  message: string;
  timestamp: number;
}

export interface AgentStartedEvent extends SSEBaseEvent {
  type: 'AGENT_STARTED';
}

export interface PlanningStartedEvent extends SSEBaseEvent {
  type: 'PLANNING_STARTED';
}

export interface ActionExecutedEvent extends SSEBaseEvent {
  type: 'ACTION_EXECUTED';
  actionName: string;
}

export interface ProgressEvent extends SSEBaseEvent {
  type: 'PROGRESS';
}

// v3.1 신규: 세분화된 진행률 이벤트
export interface AgentProgressEvent extends SSEBaseEvent {
  type: 'AGENT_PROGRESS';
  actionName: ProgressStage;  // ProgressStage enum 값
  message: string;  // 상세 메시지 (예: "커리큘럼 생성 중 (모드: standard) - 50%")
}

export type ActionStatus = 'PLANNED' | 'EXECUTING' | 'COMPLETED' | 'FAILED';

export interface ActionExecutionDetail {
  name: string;
  status: ActionStatus;
  durationMs: number | null;
}

export interface PathUpdatedEvent extends SSEBaseEvent {
  type: 'PATH_UPDATED';
  executedPath: string[];
  executedActions: ActionExecutionDetail[];
}

export interface AgentCompletedEvent extends SSEBaseEvent {
  type: 'AGENT_COMPLETED';
  result: {
    path: string;
    curriculum: any[];
    estimatedCost: number;
    generationTimeSeconds: number;
  };
}

export interface ErrorEvent {
  type: 'ERROR';
  message: string;
  timestamp: number;
}

export type SSEEvent =
  | AgentStartedEvent
  | PlanningStartedEvent
  | ActionExecutedEvent
  | ProgressEvent
  | AgentProgressEvent
  | PathUpdatedEvent
  | AgentCompletedEvent
  | ErrorEvent;

// SSE Callbacks
export interface SSECallbacks {
  onAgentStarted?: (data: AgentStartedEvent) => void;
  onPlanningStarted?: (data: PlanningStartedEvent) => void;
  onActionExecuted?: (data: ActionExecutedEvent) => void;
  onProgress?: (data: ProgressEvent) => void;
  onAgentProgress?: (data: AgentProgressEvent) => void;  // v3.1 신규
  onPathUpdated?: (data: PathUpdatedEvent) => void;
  onAgentCompleted?: (data: AgentCompletedEvent) => void;
  onError?: (data: ErrorEvent) => void;
  onClose?: () => void;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * AgentRun 생성
 */
export async function createAgentRun(
  memberId: number,
  request: CreateAgentRunRequest
): Promise<ApiResponse<AgentRun>> {
  return apiClient.post<AgentRun>(
    `/agent-runs?memberId=${memberId}`,
    request
  );
}

/**
 * AgentRun 조회
 */
export async function getAgentRun(
  agentRunId: number,
  memberId: number
): Promise<ApiResponse<AgentRun>> {
  return apiClient.get<AgentRun>(
    `/agent-runs/${agentRunId}?memberId=${memberId}`
  );
}

/**
 * AgentRun 목록 조회
 */
export async function listAgentRuns(
  memberId: number,
  status?: AgentRunStatus
): Promise<ApiResponse<AgentRunListResponse>> {
  const statusParam = status ? `&status=${status}` : '';
  return apiClient.get<AgentRunListResponse>(
    `/agent-runs?memberId=${memberId}${statusParam}`
  );
}

/**
 * AgentRun 시작
 */
export async function startAgentRun(
  agentRunId: number
): Promise<ApiResponse<AgentRun>> {
  return apiClient.post<AgentRun>(`/agent-runs/${agentRunId}/start`);
}

/**
 * AgentRun 완료 처리
 */
export async function completeAgentRun(
  agentRunId: number,
  params?: CompleteAgentRunParams
): Promise<ApiResponse<AgentRun>> {
  const queryParams = new URLSearchParams();
  if (params?.result) queryParams.append('result', params.result);
  if (params?.learningPlanId)
    queryParams.append('learningPlanId', params.learningPlanId.toString());
  if (params?.cost) queryParams.append('cost', params.cost.toString());
  if (params?.executionTimeMs)
    queryParams.append('executionTimeMs', params.executionTimeMs.toString());

  const query = queryParams.toString();
  return apiClient.post<AgentRun>(
    `/agent-runs/${agentRunId}/complete${query ? '?' + query : ''}`
  );
}

/**
 * AgentRun 실패 처리
 */
export async function failAgentRun(
  agentRunId: number,
  errorMessage: string
): Promise<ApiResponse<AgentRun>> {
  return apiClient.post<AgentRun>(
    `/agent-runs/${agentRunId}/fail?errorMessage=${encodeURIComponent(
      errorMessage
    )}`
  );
}

// ============================================================================
// SSE Streaming
// ============================================================================

/**
 * 학습 플랜 생성 SSE 스트리밍
 * 
 * @param memberId 회원 ID
 * @param targetTechnology 학습할 기술명 (예: "Kotlin Coroutines")
 * @param prefersFastPlan 빠른 플랜 선호 여부
 * @param callbacks SSE 이벤트 콜백 함수들
 * @returns EventSource 인스턴스 (스트림 중단 시 close() 호출)
 * 
 * @example
 * ```typescript
 * const eventSource = streamLearningPlanGeneration(
 *   1,
 *   'Kotlin Coroutines',
 *   false,
 *   {
 *     onAgentStarted: (data) => console.log('시작:', data),
 *     onActionExecuted: (data) => console.log('액션:', data.actionName),
 *     onAgentCompleted: (data) => console.log('완료:', data.result),
 *     onError: (data) => console.error('오류:', data.message),
 *   }
 * );
 * 
 * // 스트림 중단하려면:
 * // eventSource.close();
 * ```
 */
export function streamLearningPlanGeneration(
  memberId: number,
  targetTechnology: string,
  prefersFastPlan: boolean = false,
  callbacks: SSECallbacks
): EventSource {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
  const accessToken = localStorage.getItem('accessToken');

  const params = new URLSearchParams({
    memberId: memberId.toString(),
    targetTechnology,
    prefersFastPlan: prefersFastPlan.toString(),
  });

  // EventSource는 헤더를 보낼 수 없으므로 쿼리 파라미터로 토큰 전달
  if (accessToken) {
    params.append('accessToken', accessToken);
  }

  const url = `${baseUrl}/agents/learning-plan/stream?${params.toString()}`;

  const eventSource = new EventSource(url);
  let isStreamClosed = false;

  // Event listeners - 백엔드에서 보내는 이벤트 이름과 정확히 일치해야 함
  // 백엔드: event:agent_started, event:planning_started 등 (소문자)
  eventSource.addEventListener('agent_started', (event) => {
    if (callbacks.onAgentStarted) {
      const data = JSON.parse(event.data) as AgentStartedEvent;
      callbacks.onAgentStarted(data);
    }
  });

  eventSource.addEventListener('planning_started', (event) => {
    if (callbacks.onPlanningStarted) {
      const data = JSON.parse(event.data) as PlanningStartedEvent;
      callbacks.onPlanningStarted(data);
    }
  });

  eventSource.addEventListener('action_executed', (event) => {
    if (callbacks.onActionExecuted) {
      const data = JSON.parse(event.data) as ActionExecutedEvent;
      callbacks.onActionExecuted(data);
    }
  });

  eventSource.addEventListener('progress', (event) => {
    if (callbacks.onProgress) {
      const data = JSON.parse(event.data) as ProgressEvent;
      callbacks.onProgress(data);
    }
  });

  // v3.1 신규: agent_progress 이벤트 (세분화된 진행률)
  eventSource.addEventListener('agent_progress', (event) => {
    if (callbacks.onAgentProgress) {
      const data = JSON.parse(event.data) as AgentProgressEvent;
      callbacks.onAgentProgress(data);
    }
  });

  eventSource.addEventListener('path_updated', (event) => {
    if (callbacks.onPathUpdated) {
      const data = JSON.parse(event.data) as PathUpdatedEvent;
      callbacks.onPathUpdated(data);
    }
  });

  eventSource.addEventListener('agent_completed', (event) => {
    if (callbacks.onAgentCompleted) {
      const data = JSON.parse(event.data) as AgentCompletedEvent;
      callbacks.onAgentCompleted(data);
    }
    isStreamClosed = true;
    eventSource.close();
    if (callbacks.onClose) {
      callbacks.onClose();
    }
  });

  eventSource.addEventListener('error', (event) => {
    const messageEvent = event as MessageEvent;
    const data = JSON.parse(messageEvent.data) as ErrorEvent;
    if (callbacks.onError) {
      callbacks.onError(data);
    }
    isStreamClosed = true;
    eventSource.close();
    if (callbacks.onClose) {
      callbacks.onClose();
    }
  });

  // Generic error handler (network errors, etc.)
  // Only trigger if the stream hasn't been properly closed
  eventSource.onerror = () => {
    // ReadyState: 0=CONNECTING, 1=OPEN, 2=CLOSED
    // Only handle errors if the connection is still open
    if (eventSource.readyState === EventSource.OPEN && !isStreamClosed) {
      if (callbacks.onError) {
        callbacks.onError({
          type: 'ERROR',
          message: '네트워크 오류가 발생했습니다.',
          timestamp: Date.now(),
        });
      }
      eventSource.close();
      if (callbacks.onClose) {
        callbacks.onClose();
      }
    } else if (!isStreamClosed) {
      // Connection closed unexpectedly
      isStreamClosed = true;
      eventSource.close();
      if (callbacks.onClose) {
        callbacks.onClose();
      }
    }
  };

  return eventSource;
}

// ============================================================================
// Exports
// ============================================================================

export const agentRunsApi = {
  createAgentRun,
  getAgentRun,
  listAgentRuns,
  startAgentRun,
  completeAgentRun,
  failAgentRun,
  streamLearningPlanGeneration,
};

