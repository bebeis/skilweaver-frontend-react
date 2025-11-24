# AI 에이전트 API 사용 가이드

SSE(Server-Sent Events)를 이용한 실시간 학습 플랜 생성 API 사용법

## 📦 구현된 파일들

### 1. API 클라이언트
- `src/lib/api/agent-runs.ts` - AgentRun API 및 SSE 스트리밍 함수들

### 2. React Hook
- `hooks/useLearningPlanStream.tsx` - SSE 스트리밍 상태 관리 Hook

### 3. UI 컴포넌트
- `components/learning-plans/LearningPlanStreamGenerator.tsx` - 학습 플랜 생성 UI

## 🚀 사용 방법

### 방법 1: React Hook 사용 (권장)

가장 간단하고 React스러운 방법입니다.

```tsx
import { useLearningPlanStream } from '@hooks/useLearningPlanStream';

function MyComponent() {
  const {
    isStreaming,
    isComplete,
    events,
    result,
    currentAction,
    progress,
    startStream,
    stopStream,
    reset,
  } = useLearningPlanStream();

  const handleGenerate = () => {
    startStream(1, 'Kotlin Coroutines', false);
  };

  return (
    <div>
      <button onClick={handleGenerate} disabled={isStreaming}>
        플랜 생성
      </button>
      
      {isStreaming && (
        <div>
          <p>진행 중: {currentAction}</p>
          <progress value={progress} max={100} />
        </div>
      )}
      
      {isComplete && result && (
        <div>
          <h3>생성 완료!</h3>
          <p>경로: {result.path}</p>
          <p>단계 수: {result.curriculum.length}</p>
          <p>소요 시간: {result.generationTimeSeconds}초</p>
        </div>
      )}
    </div>
  );
}
```

### 방법 2: 직접 SSE 함수 사용

더 세밀한 제어가 필요한 경우:

```tsx
import { streamLearningPlanGeneration } from '@/lib/api/agent-runs';
import { useEffect, useRef } from 'react';

function MyComponent() {
  const eventSourceRef = useRef<EventSource | null>(null);

  const handleStart = () => {
    eventSourceRef.current = streamLearningPlanGeneration(
      1, // memberId
      'Kotlin Coroutines', // targetTechnology
      false, // prefersFastPlan
      {
        onAgentStarted: (data) => {
          console.log('시작:', data);
        },
        onActionExecuted: (data) => {
          console.log('액션 실행:', data.actionName);
        },
        onAgentCompleted: (data) => {
          console.log('완료:', data.result);
        },
        onError: (data) => {
          console.error('오류:', data.message);
        },
      }
    );
  };

  const handleStop = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return (
    <div>
      <button onClick={handleStart}>시작</button>
      <button onClick={handleStop}>중단</button>
    </div>
  );
}
```

### 방법 3: UI 컴포넌트 사용

바로 사용 가능한 완성된 UI:

```tsx
import { LearningPlanStreamGenerator } from '@components/learning-plans/LearningPlanStreamGenerator';

function MyPage() {
  const memberId = 1; // 현재 로그인한 사용자 ID

  return (
    <div>
      <h1>학습 플랜 생성</h1>
      <LearningPlanStreamGenerator
        memberId={memberId}
        onComplete={(learningPlanId) => {
          console.log('생성된 플랜 ID:', learningPlanId);
          // 플랜 상세 페이지로 이동
        }}
      />
    </div>
  );
}
```

## 📊 SSE 이벤트 타입

서버에서 전송하는 이벤트들:

### 1. agent_started
```json
{
  "type": "AGENT_STARTED",
  "agentRunId": 1,
  "message": "Agent 실행 시작",
  "timestamp": 1700000000000
}
```

### 2. planning_started
```json
{
  "type": "PLANNING_STARTED",
  "agentRunId": 1,
  "message": "GOAP 경로 계획 중...",
  "timestamp": 1700000001000
}
```

### 3. action_executed
```json
{
  "type": "ACTION_EXECUTED",
  "agentRunId": 1,
  "actionName": "extractMemberProfile",
  "message": "extractMemberProfile 실행 완료 (1234ms)",
  "timestamp": 1700000002000
}
```

### 4. progress
```json
{
  "type": "PROGRESS",
  "agentRunId": 1,
  "message": "진행 중... (3개 액션 완료)",
  "timestamp": 1700000003000
}
```

### 5. agent_completed
```json
{
  "type": "AGENT_COMPLETED",
  "agentRunId": 1,
  "message": "Agent 실행 완료",
  "result": {
    "path": "QUICK",
    "curriculum": [...],
    "estimatedCost": 0.05,
    "generationTimeSeconds": 180
  },
  "timestamp": 1700000180000
}
```

### 6. error
```json
{
  "type": "ERROR",
  "message": "오류 발생: Invalid member ID",
  "timestamp": 1700000005000
}
```

## 🔧 AgentRun 관리 API

SSE 스트리밍 외에 AgentRun을 관리하는 REST API도 제공됩니다.

### AgentRun 생성

```typescript
import { agentRunsApi } from '@/lib/api/agent-runs';

const response = await agentRunsApi.createAgentRun(1, {
  agentType: 'LEARNING_PLAN',
  parameters: JSON.stringify({
    targetTechnology: 'kotlin',
    prefersFastPlan: false,
  }),
});

console.log('AgentRun ID:', response.data.agentRunId);
```

### AgentRun 조회

```typescript
const response = await agentRunsApi.getAgentRun(1, 1); // agentRunId, memberId
console.log('상태:', response.data.status);
console.log('결과:', response.data.result);
```

### AgentRun 목록 조회

```typescript
const response = await agentRunsApi.listAgentRuns(1, 'COMPLETED');
console.log('완료된 실행:', response.data.runs);
```

### AgentRun 시작

```typescript
await agentRunsApi.startAgentRun(1);
```

### AgentRun 완료 처리

```typescript
await agentRunsApi.completeAgentRun(1, {
  result: JSON.stringify({ curriculum: [...] }),
  learningPlanId: 5,
  cost: 0.05,
  executionTimeMs: 180000,
});
```

### AgentRun 실패 처리

```typescript
await agentRunsApi.failAgentRun(1, 'LLM API timeout');
```

## 💡 실전 예제

### 학습 플랜 생성 페이지

```tsx
import React, { useState } from 'react';
import { useLearningPlanStream } from '@hooks/useLearningPlanStream';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';

export function LearningPlanCreatePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [technology, setTechnology] = useState('');

  const {
    isStreaming,
    isComplete,
    isError,
    result,
    errorMessage,
    currentAction,
    progress,
    events,
    startStream,
    reset,
  } = useLearningPlanStream();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !technology.trim()) return;
    
    startStream(user.memberId, technology, false);
  };

  if (isComplete && result) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">플랜 생성 완료! 🎉</h1>
        
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-4xl font-bold text-indigo-600">
              {result.curriculum.length}
            </p>
            <p className="text-gray-600 mt-2">학습 단계</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-4xl font-bold text-indigo-600">
              {result.path}
            </p>
            <p className="text-gray-600 mt-2">경로 타입</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-4xl font-bold text-indigo-600">
              {Math.round(result.generationTimeSeconds / 60)}분
            </p>
            <p className="text-gray-600 mt-2">생성 시간</p>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => navigate('/learning-plans')}
            className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700"
          >
            플랜 목록 보기
          </button>
          <button
            onClick={reset}
            className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300"
          >
            다시 생성
          </button>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-800 mb-2">
            오류가 발생했습니다
          </h2>
          <p className="text-red-600 mb-4">{errorMessage}</p>
          <button
            onClick={reset}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (isStreaming) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">플랜 생성 중...</h1>
        
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">{currentAction}</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm max-h-96 overflow-y-auto">
          {events.map((event, i) => (
            <div key={i} className="mb-1">
              <span className="text-gray-500">
                {new Date(event.timestamp).toLocaleTimeString()}
              </span>
              {' › '}
              <span>{event.message}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">새 학습 플랜 생성</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            학습할 기술
          </label>
          <input
            type="text"
            value={technology}
            onChange={(e) => setTechnology(e.target.value)}
            placeholder="예: Kotlin Coroutines, React Hooks, Docker"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700"
        >
          플랜 생성 시작
        </button>
      </form>
    </div>
  );
}
```

## 🎯 주요 특징

### 1. 실시간 진행 상황
- SSE를 통해 실시간으로 생성 과정 모니터링
- 각 Action 실행을 즉시 확인 가능

### 2. React 친화적
- Hook 기반 API로 React 컴포넌트에 쉽게 통합
- 자동 cleanup (unmount 시 EventSource 자동 종료)

### 3. TypeScript 완벽 지원
- 모든 이벤트 타입이 정의되어 있음
- IDE 자동완성 지원

### 4. 유연한 사용법
- Hook, 직접 API, UI 컴포넌트 중 선택 가능
- 다양한 사용 시나리오 지원

## 🔍 디버깅 팁

### 네트워크 탭에서 SSE 확인

브라우저 개발자 도구 → Network → EventStream 타입 필터링

### 콘솔 로그 추가

```typescript
const eventSource = streamLearningPlanGeneration(
  memberId,
  technology,
  false,
  {
    onAgentStarted: (data) => {
      console.log('[SSE] Agent Started:', data);
    },
    onActionExecuted: (data) => {
      console.log('[SSE] Action Executed:', data.actionName);
    },
    onAgentCompleted: (data) => {
      console.log('[SSE] Completed:', data.result);
    },
    onError: (data) => {
      console.error('[SSE] Error:', data.message);
    },
  }
);
```

## ⚠️ 주의사항

1. **EventSource 정리**: 컴포넌트 unmount 시 반드시 `eventSource.close()` 호출
2. **브라우저 지원**: EventSource는 모든 모던 브라우저에서 지원 (IE 제외)
3. **타임아웃**: 서버 설정에 따라 긴 요청은 타임아웃될 수 있음
4. **재연결**: 네트워크 오류 시 EventSource가 자동으로 재연결 시도

## 📚 참고 자료

- [MDN - EventSource API](https://developer.mozilla.org/en-US/docs/Web/API/EventSource)
- [Server-Sent Events 스펙](https://html.spec.whatwg.org/multipage/server-sent-events.html)
- 백엔드 API 명세서: `docs/apispec/v1/API_SPECIFICATION_V1.md`

