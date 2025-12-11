# SkillWeaver API 명세서

### v4.0 (2025-12-10) - 기술 모델 통합

> [!CAUTION]
> **Breaking Changes**
> - `technologyId` (Long) → `name` (String) 변경
> - `/api/v1/graph/*` → `/api/v1/technologies/*` 경로 통합
> - 일부 응답 필드명 변경 (key → name)

주요 변경사항:
1. **Technology API와 Graph API 통합**
   - RDB 기술 모델을 Neo4j Graph로 마이그레이션
   - 단일 `/api/v1/technologies` 엔드포인트로 통합
   - 기존 `/api/v1/graph/*` 엔드포인트 Deprecated

2. **ID 전략 변경**
   - `technologyId` (Long) → `name` (String)으로 변경
   - URL-safe 문자열 사용 (예: `spring-boot`, `java`)

3. **새로운 속성**
   - `difficulty`: 학습 난이도 (BEGINNER, INTERMEDIATE, ADVANCED, EXPERT)
   - `useCases`: 사용 사례 목록 (List)
   - 기존 Graph API 속성과 RDB 속성 통합

### v3.1 (2025-12-09) - Agent Progress Streaming 추가

주요 변경사항:
1. **Agent Progress SSE 이벤트 추가**
   - 새로운 `agent_progress` SSE 이벤트 타입 추가
   - Agent 내부 실행 단계별 진행률 실시간 스트리밍
   - `ProgressStage` enum 추가: 7단계 진행률 구분

2. **프론트엔드 UX 개선**
   - 기존: `action_executed` 이벤트만 수신 → 중간 진행상황 불투명
   - 변경: `agent_progress` 이벤트로 세분화된 진행률 수신 가능

### v3.0 (2025-12-08) - Graph API 추가

주요 변경사항:
1. **Graph API 신규 추가 (4개 엔드포인트)**
   - GET /api/v1/graph/roadmap/{technology} - 기술 로드맵 조회
   - GET /api/v1/graph/path - 학습 경로 탐색
   - GET /api/v1/graph/recommendations/{technology} - 연관 기술 추천
   - POST /api/v1/graph/gap-analysis - 갭 분석

2. **GraphRAG 기반 빠른 탐색**
   - LLM 없이 Neo4j 그래프 쿼리로 실시간 응답 (~10ms)
   - Agent API와 상호 보완적 포지셔닝

3. **V3 고급 AI 기능 (백엔드)**
   - RAFT Fine-tuning 지원
   - Agentic RAG (ReAct 패턴)
   - GraphRAG (Neo4j 기반)

### v2.0 (2025-12-07) - Technology API 확장
주요 변경사항:
1. **Phase 3: Technology API 학습 메타데이터 추가**
   - GET /api/v1/technologies/{id} 응답에 6개 필드 추가
   - POST /api/v1/technologies 요청에 학습 메타데이터 지원
   - PUT /api/v1/technologies/{id} 요청에 학습 메타데이터 수정 지원
   - 신규 필드: learningRoadmap, estimatedLearningHours, relatedTechnologies, communityPopularity, jobMarketDemand

2. **Phase 4: 피드백 시스템 API 추가**
   - POST /api/v1/feedback - 피드백 제출
   - GET /api/v1/feedback/plans/{planId} - 계획별 피드백 조회
   - GET /api/v1/feedback/plans/{planId}/summary - 피드백 요약


> [!IMPORTANT]
> 이 문서는 v4.0 API 명세서입니다. 모든 API를 포함하며, 기술 카탈로그 API가 Graph 기반으로 통합되었습니다.





## 변경 이력

### v1.3 (2025-11-25)
주요 변경사항:
1. **Enum 정의 통합 및 확장**
   - 프론트엔드 실제 사용과 API 명세 일치성 확보
   - `TargetTrack`에 `DEVOPS` 추가 (기존 코드에서 사용)
   - `LearningStyle`에 `HANDS_ON`, `THEORY_FIRST` 추가 (대체 표현)
   - `SkillLevel`에 `EXPERT` 추가 (전문가 레벨 지원)
   - `SkillCategory`에 `DEVOPS`, `API`, `DATABASE` 추가
   - `GoalStatus`에 `PLANNING` 추가 (계획 중 상태)
   - `LearningPlanStatus`에 `DRAFT` 추가 (초안 상태)

2. **신규 Enum 타입 정의**
   - `LearningPathType`: `QUICK`, `STANDARD`, `DETAILED` (GOAP 경로 구분)
   - `ResourceType`: `DOC`, `VIDEO`, `BLOG`, `COURSE`, `REPO` 및 대체 표현
   - `SseEventType`: SSE 이벤트 7가지 타입 정의

3. **호환성 개선**
   - 기존 코드의 대체 표현(예: DATABASE ↔ DB)을 명시적으로 문서화
   - 점진적 마이그레이션을 위해 기본 값과 대체 값 병행 지원

### v1.2 (2025-11-24)
주요 변경사항:
1. **AI 에이전트 실시간 스트리밍 API 추가**
   - SSE 기반 학습 플랜 생성 스트리밍 API (`POST /agents/learning-plan/stream`)
   - 6가지 이벤트 타입 지원: agent_started, planning_started, action_executed, progress, agent_completed, error
   - GOAP 동적 경로 계획 실시간 모니터링
   - 각 Action 실행 과정 실시간 추적

2. **AgentRun 생명주기 관리 API 추가**
   - AgentRun 생성, 조회, 목록 조회 API
   - AgentRun 시작, 완료, 실패 처리 API
   - 4-state 생명주기: PENDING → RUNNING → COMPLETED/FAILED

3. **GOAP 동작 원리 문서화**
   - Quick/Standard/Detailed 3가지 학습 경로 설명
   - 동적 재계획(Replanning) 메커니즘 설명
   - 각 경로별 특징 및 예상 비용 명시

### v1.1 (2025-11-24)
주요 변경사항:
1. **인증 API 개선**
   - 로그인 응답 코드 201 → 200으로 변경
   - 토큰 재발급 API 추가 (`POST /auth/refresh`)
   - 로그아웃 API 추가 (`POST /auth/logout`)
   - 현재 사용자 조회 API 추가 (`GET /members/me`)

2. **AI 에이전트 API 추가**
   - 비동기 에이전트 실행 API (`POST /agent-runs`)
   - 에이전트 실행 상태 조회 (`GET /agent-runs/{runId}`)
   - SSE 이벤트 스트림 (`GET /agent-runs/{runId}/events`)
   - 학습 플랜 진행도 업데이트 API 추가
   - 학습 스텝 완료 처리 API 추가

3. **도메인 모델 정합성 개선**
   - `GoalStatus`, `LearningPlanStatus`, `StepDifficulty`, `AgentRunStatus` enum 추가
   - 모든 주요 리소스에 `createdAt`, `updatedAt` 필드 추가
   - 학습 목표 상태 관리 필드 추가
   - 선행 지식 `reason` 필드는 v1에서 제외 (AI가 런타임 생성)

4. **커뮤니티 기여 기능 연기**
   - TechnologyEdit 관련 API는 v1.1로 연기
   - v1에서는 기술 지식 직접 수정 방식 사용

## 개요

- **Base URL**: `/api/v1`
- **응답 형식**: `ApiResponse<T>`
- **인증**: Bearer Token (JWT) + HttpOnly 리프레시 쿠키
- **Content-Type**: `application/json`

## 공통 응답 형식

```json
{
  "success": true,
  "data": {},
  "message": "Success",
  "timestamp": "2025-11-24T12:00:00"
}
```

에러 응답:
```json
{
  "success": false,
  "data": null,
  "message": "Error message",
  "errorCode": "ERROR_CODE",
  "timestamp": "2025-11-24T12:00:00"
}
```

- 모든 2xx 응답은 별도 언급이 없는 한 위 `ApiResponse<T>` 포맷을 따른다. `message` 는 선택적이지만 `success`·`data`·`timestamp` 는 항상 포함한다.
- `204 No Content` 응답은 HTTP 표준에 따라 본문을 비워 두며, `ApiResponse` 래퍼를 사용하지 않는다.
- 오류 응답은 반드시 `errorCode` 를 포함해 클라이언트가 원인을 식별할 수 있도록 한다.

---

## 1. 회원 관리 API

### 1.1. 회원 가입

```http
POST /api/v1/auth/signup/email
```

**Request Body**
```json
{
  "name": "홍길동",
  "email": "hong@example.com",
  "password": "password123!",
  "targetTrack": "BACKEND",
  "experienceLevel": "BEGINNER",
  "learningPreference": {
    "dailyMinutes": 60,
    "preferKorean": true,
    "learningStyle": "PROJECT_BASED",
    "weekendBoost": true
  }
}
```

**Response (201 Created)**
```json
{
  "success": true,
  "data": {
    "memberId": 1,
    "name": "홍길동",
    "email": "hong@example.com",
    "targetTrack": "BACKEND",
    "experienceLevel": "BEGINNER",
    "createdAt": "2025-11-24T12:00:00"
  },
  "message": "회원가입이 완료되었습니다."
}
```

### 1.2. 로그인

```http
POST /api/v1/auth/login
```

**Request Body**
```json
{
  "email": "hong@example.com",
  "password": "password123!"
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "memberId": 1,
    "name": "홍길동",
    "email": "hong@example.com"
  },
  "message": "로그인 성공"
}
```

> 성공 시 본문에 반환된 액세스 토큰 외에 `Set-Cookie: SW_REFRESH=<jwt>; HttpOnly; Secure; SameSite=Lax` 헤더가 내려가며, 모든 보호된 API 호출은 Authorization 헤더의 액세스 토큰을 사용한다.

### 1.3. 토큰 재발급

```http
POST /api/v1/auth/refresh
```

**Request**
- HttpOnly 쿠키의 `SW_REFRESH` 토큰 사용
- Request Body 없음

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "토큰이 재발급되었습니다."
}
```

### 1.4. 로그아웃

```http
POST /api/v1/auth/logout
```

**Response (204 No Content)**

> 리프레시 토큰을 무효화하고 `SW_REFRESH` 쿠키를 삭제한다.

### 1.5. 현재 사용자 정보 조회

```http
GET /api/v1/members/me
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "memberId": 1,
    "name": "홍길동",
    "email": "hong@example.com",
    "targetTrack": "BACKEND",
    "experienceLevel": "BEGINNER",
    "learningPreference": {
      "dailyMinutes": 60,
      "preferKorean": true,
      "learningStyle": "PROJECT_BASED",
      "weekendBoost": true
    },
    "createdAt": "2025-11-24T12:00:00",
    "updatedAt": "2025-11-24T12:00:00"
  }
}
```

### 1.6. 회원 정보 조회

```http
GET /api/v1/members/{memberId}
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "memberId": 1,
    "name": "홍길동",
    "email": "hong@example.com",
    "targetTrack": "BACKEND",
    "experienceLevel": "BEGINNER",
    "learningPreference": {
      "dailyMinutes": 60,
      "preferKorean": true,
      "learningStyle": "PROJECT_BASED",
      "weekendBoost": true
    },
    "createdAt": "2025-11-24T12:00:00",
    "updatedAt": "2025-11-24T12:00:00"
  }
}
```

### 1.7. 회원 정보 수정

```http
PUT /api/v1/members/{memberId}
```

**Request Body**
```json
{
  "name": "홍길동",
  "targetTrack": "FULLSTACK",
  "experienceLevel": "INTERMEDIATE",
  "learningPreference": {
    "dailyMinutes": 90,
    "preferKorean": true,
    "learningStyle": "DOC_FIRST",
    "weekendBoost": true
  }
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "memberId": 1,
    "name": "홍길동",
    "email": "hong@example.com",
    "targetTrack": "FULLSTACK",
    "experienceLevel": "INTERMEDIATE",
    "updatedAt": "2025-11-24T13:00:00"
  },
  "message": "회원 정보가 수정되었습니다."
}
```

### 1.8. 회원 탈퇴

```http
DELETE /api/v1/members/{memberId}
```

**Response (204 No Content)**

---

## 2. 기술 스택 관리 API

### 2.1. 회원 기술 스택 목록 조회

```http
GET /api/v1/members/{memberId}/skills
```

**Query Parameters**
- `level` (optional): BEGINNER, INTERMEDIATE, ADVANCED, EXPERT

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "skills": [
      {
        "memberSkillId": 1,
        "technologyName": "java",
        "customName": null,
        "level": "ADVANCED",
        "yearsOfUse": 2.5,
        "lastUsedAt": "2025-11-20",
        "note": "주로 Spring Boot 개발에 사용",
        "updatedAt": "2025-11-24T12:00:00"
      },
      {
        "memberSkillId": 2,
        "technologyName": null,
        "customName": "MyCustomLib",
        "level": "BEGINNER",
        "yearsOfUse": 0.3,
        "lastUsedAt": "2025-11-24",
        "note": "사이드 프로젝트에서 사용 중",
        "updatedAt": "2025-11-24T13:00:00"
      }
    ],
    "totalCount": 2
  }
}
```

> [!NOTE]
> V4에서 `category` 필터는 제거되었습니다. 기술 카테고리는 Neo4j에서 관리되므로 별도 조회가 필요한 경우 `/api/v1/technologies` API를 사용하세요.

### 2.2. 기술 스택 추가

```http
POST /api/v1/members/{memberId}/skills
```

**Request Body**
```json
{
  "technologyName": "spring-boot",
  "customName": null,
  "level": "INTERMEDIATE",
  "yearsOfUse": 1.5,
  "lastUsedAt": "2025-11-24",
  "note": "주로 백엔드 개발에 사용"
}
```

> `technologyName` 또는 `customName` 중 하나는 반드시 값이 있어야 합니다. Neo4j에 등록된 기술을 참조하려면 `technologyName`을, 커스텀 기술을 기록하려면 `customName`을 사용합니다.

**Response (201 Created)**
```json
{
  "success": true,
  "data": {
    "memberSkillId": 3,
    "technologyName": "spring-boot",
    "customName": null,
    "level": "INTERMEDIATE",
    "yearsOfUse": 1.5,
    "lastUsedAt": "2025-11-24",
    "note": "주로 백엔드 개발에 사용",
    "updatedAt": "2025-11-24T14:00:00"
  },
  "message": "기술 스택이 추가되었습니다."
}
```

### 2.3. 기술 스택 수정

```http
PUT /api/v1/members/{memberId}/skills/{skillId}
```

**Request Body**
```json
{
  "level": "ADVANCED",
  "yearsOfUse": 2.0,
  "lastUsedAt": "2025-11-24",
  "note": "실무에서 활발히 사용 중"
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "memberSkillId": 3,
    "level": "ADVANCED",
    "yearsOfUse": 2.0,
    "lastUsedAt": "2025-11-24",
    "note": "실무에서 활발히 사용 중",
    "updatedAt": "2025-11-24T14:00:00"
  },
  "message": "기술 스택이 수정되었습니다."
}
```

### 2.4. 기술 스택 삭제

```http
DELETE /api/v1/members/{memberId}/skills/{skillId}
```

**Response (204 No Content)**

---

## 3. 학습 목표 관리 API

### 3.1. 학습 목표 목록 조회

```http
GET /api/v1/members/{memberId}/goals
```

**Query Parameters**
- `priority` (optional): LOW, MEDIUM, HIGH
- `status` (optional): ACTIVE, COMPLETED, ABANDONED

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "goals": [
      {
        "learningGoalId": 1,
        "title": "우테코 프리코스 완주",
        "description": "6주간의 프리코스를 성실히 완주하기",
        "dueDate": "2025-12-31",
        "priority": "HIGH",
        "status": "ACTIVE",
        "createdAt": "2025-11-01T10:00:00",
        "updatedAt": "2025-11-01T10:00:00"
      }
    ],
    "totalCount": 1
  }
}
```

### 3.2. 학습 목표 생성

```http
POST /api/v1/members/{memberId}/goals
```

**Request Body**
```json
{
  "title": "백엔드 개발자 취업",
  "description": "Spring Boot 기반 백엔드 개발자로 취업하기",
  "dueDate": "2026-06-30",
  "priority": "HIGH"
}
```

**Response (201 Created)**
```json
{
  "success": true,
  "data": {
    "learningGoalId": 2,
    "title": "백엔드 개발자 취업",
    "description": "Spring Boot 기반 백엔드 개발자로 취업하기",
    "dueDate": "2026-06-30",
    "priority": "HIGH",
    "status": "ACTIVE",
    "createdAt": "2025-11-24T15:00:00",
    "updatedAt": "2025-11-24T15:00:00"
  },
  "message": "학습 목표가 생성되었습니다."
}
```

### 3.3. 학습 목표 수정

```http
PUT /api/v1/members/{memberId}/goals/{goalId}
```

**Request Body**
```json
{
  "title": "백엔드 개발자 취업 (수정)",
  "description": "Spring Boot와 Kotlin 기반 백엔드 개발자로 취업하기",
  "dueDate": "2026-08-31",
  "priority": "HIGH",
  "status": "ACTIVE"
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "learningGoalId": 2,
    "title": "백엔드 개발자 취업 (수정)",
    "description": "Spring Boot와 Kotlin 기반 백엔드 개발자로 취업하기",
    "dueDate": "2026-08-31",
    "priority": "HIGH",
    "status": "ACTIVE",
    "updatedAt": "2025-11-24T16:00:00"
  },
  "message": "학습 목표가 수정되었습니다."
}
```

### 3.4. 학습 목표 삭제

```http
DELETE /api/v1/members/{memberId}/goals/{goalId}
```

**Response (204 No Content)**

---

## 4. 기술 카탈로그 API (V4 통합)

> [!IMPORTANT]
> V4부터 모든 기술 데이터는 Neo4j Graph에서 관리됩니다.
> 이 API는 `skillweaver.graph.enabled=true` 설정 시에만 활성화됩니다.

### 4.1. 기술 목록 조회

```http
GET /api/v1/technologies
```

**Query Parameters**
| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| category | String | N | LANGUAGE, FRAMEWORK, LIBRARY, TOOL, CONCEPT, DATABASE, PLATFORM, DEVOPS, API, ETC |
| active | Boolean | N | 활성화 여부 |
| search | String | N | 이름/표시명 검색 |
| limit | Int | N | 최대 조회 개수 (default: 100) |

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "technologies": [
      {
        "name": "spring-boot",
        "displayName": "Spring Boot",
        "category": "FRAMEWORK",
        "difficulty": "INTERMEDIATE",
        "ecosystem": "JVM",
        "officialSite": "https://spring.io/projects/spring-boot",
        "active": true,
        "description": "Spring 기반 애플리케이션을 빠르게 개발할 수 있는 프레임워크",
        "learningRoadmap": "1단계: Spring 기초...",
        "estimatedLearningHours": 80,
        "learningTips": "공식 문서와 예제를 따라하세요",
        "useCases": ["REST API", "Microservices"],
        "communityPopularity": 9,
        "jobMarketDemand": 10
      }
    ],
    "totalCount": 42
  }
}
```

### 4.2. 기술 상세 조회

```http
GET /api/v1/technologies/{name}
```

**Path Parameters**
- `name`: 기술 이름 (예: `spring-boot`, `java`)

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "name": "spring-boot",
    "displayName": "Spring Boot",
    "category": "FRAMEWORK",
    "difficulty": "INTERMEDIATE",
    "ecosystem": "JVM",
    "officialSite": "https://spring.io/projects/spring-boot",
    "active": true,
    "description": "Spring 기반 애플리케이션을 빠르게 개발할 수 있는 프레임워크",
    "learningRoadmap": "...",
    "estimatedLearningHours": 80,
    "learningTips": "공식 문서와 예제를 따라하세요",
    "useCases": ["REST API", "Microservices"],
    "communityPopularity": 9,
    "jobMarketDemand": 10,
    "prerequisites": {
      "required": [
        {"name": "java", "displayName": "Java", "category": "LANGUAGE", "difficulty": "BEGINNER"}
      ],
      "recommended": [
        {"name": "spring-framework", "displayName": "Spring Framework", "category": "FRAMEWORK", "difficulty": "INTERMEDIATE"}
      ]
    },
    "relatedTechnologies": [
      {"name": "kotlin", "displayName": "Kotlin", "category": "LANGUAGE", "difficulty": "INTERMEDIATE"}
    ]
  }
}
```

**Response (404 Not Found)**
```json
{
  "success": false,
  "errorCode": "TECHNOLOGY_NOT_FOUND",
  "message": "Technology 'unknown' not found"
}
```

### 4.3. 기술 생성 (관리자)

```http
POST /api/v1/technologies
```

**Request Body**
```json
{
  "name": "kotlin",
  "displayName": "Kotlin",
  "category": "LANGUAGE",
  "difficulty": "INTERMEDIATE",
  "ecosystem": "JVM",
  "officialSite": "https://kotlinlang.org",
  "description": "JVM 기반 현대적 프로그래밍 언어",
  "learningRoadmap": "1단계: 기본 문법...",
  "estimatedLearningHours": 40,
  "learningTips": "Java와 비교하며 학습하세요",
  "useCases": ["Android", "Backend", "Multiplatform"],
  "communityPopularity": 8,
  "jobMarketDemand": 9,
  "relations": [
    {"to": "java", "relation": "EXTENDS", "weight": 1.0}
  ]
}
```

**Response (201 Created)**
```json
{
  "success": true,
  "data": { ... },
  "message": "기술이 등록되었습니다"
}
```

**Response (409 Conflict)**
```json
{
  "success": false,
  "errorCode": "TECHNOLOGY_ALREADY_EXISTS",
  "message": "Technology 'kotlin' already exists"
}
```

### 4.4. 기술 수정 (관리자)

```http
PUT /api/v1/technologies/{name}
```

**Request Body** (모든 필드 optional)
```json
{
  "displayName": "Kotlin Programming Language",
  "difficulty": "INTERMEDIATE",
  "communityPopularity": 9
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": { ... },
  "message": "기술 정보가 수정되었습니다"
}
```

### 4.5. 기술 삭제 (관리자)

```http
DELETE /api/v1/technologies/{name}
```

**Response (204 No Content)**

---

## 5. 기술 로드맵 & 학습 경로 API

### 5.1. 기술 로드맵 조회

```http
GET /api/v1/technologies/{name}/roadmap
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "technology": "spring-boot",
    "displayName": "Spring Boot",
    "prerequisites": {
      "required": [{"name": "java", "displayName": "Java", "category": "LANGUAGE", "difficulty": "BEGINNER"}],
      "recommended": [{"name": "spring-framework", "displayName": "Spring Framework", "category": "FRAMEWORK", "difficulty": "INTERMEDIATE"}]
    },
    "nextSteps": [
      {"name": "spring-data", "displayName": "Spring Data", "category": "LIBRARY", "difficulty": "INTERMEDIATE"}
    ]
  }
}
```

**Response (404 Not Found)**
```json
{
  "success": false,
  "errorCode": "TECHNOLOGY_NOT_FOUND",
  "message": "Technology 'unknown' not found in graph"
}
```

### 5.2. 학습 경로 탐색

```http
GET /api/v1/technologies/path?from={from}&to={to}
```

**Query Parameters**
| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| from | String | O | 시작 기술 (현재 보유) |
| to | String | O | 목표 기술 |

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "from": "java",
    "to": "spring-boot",
    "totalSteps": 2,
    "path": [
      {"step": 1, "technology": "spring-framework", "relation": "DEPENDS_ON"},
      {"step": 2, "technology": "spring-boot", "relation": "EXTENDS"}
    ]
  }
}
```

**Response (404 Not Found)**
```json
{
  "success": false,
  "errorCode": "NO_PATH_FOUND",
  "message": "Cannot find learning path from 'java' to 'unknown'"
}
```

### 5.3. 연관 기술 추천

```http
GET /api/v1/technologies/{name}/recommendations
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "technology": "react",
    "recommendations": [
      {"name": "nextjs", "displayName": "Next.js", "category": "FRAMEWORK", "relation": "USED_WITH"},
      {"name": "typescript", "displayName": "TypeScript", "category": "LANGUAGE", "relation": "USED_WITH"}
    ]
  }
}
```

**Response (404 Not Found)**
```json
{
  "success": false,
  "errorCode": "TECHNOLOGY_NOT_FOUND",
  "message": "Technology 'unknown' not found in graph"
}
```

### 5.4. 갭 분석

```http
POST /api/v1/technologies/gap-analysis
```

**Request Body**
```json
{
  "knownTechnologies": ["java", "sql"],
  "targetTechnology": "spring-boot"
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "target": "spring-boot",
    "known": ["java", "sql"],
    "missing": [
      {"name": "spring-framework", "displayName": "Spring Framework", "priority": "HIGH"}
    ],
    "ready": false,
    "readinessScore": 0.5,
    "message": "다음 기술을 먼저 학습하면 더 효과적입니다: spring-framework"
  }
}
```

**Response (404 Not Found)**
```json
{
  "success": false,
  "errorCode": "TECHNOLOGY_NOT_FOUND",
  "message": "Target technology 'unknown' not found in graph"
}
```

---

## 6. 기술 관계 관리 API

### 6.1. 기술 관계 조회

```http
GET /api/v1/technologies/{name}/relationships
```

**Query Parameters**
| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| relationType | String | N | DEPENDS_ON, RECOMMENDED_AFTER, CONTAINS, EXTENDS, USED_WITH, ALTERNATIVE_TO |

**Response (200 OK)**
```json
{
  "success": true,
  "data": [
    {"from": "spring-boot", "to": "java", "relation": "DEPENDS_ON", "weight": 1.0},
    {"from": "spring-boot", "to": "kotlin", "relation": "USED_WITH", "weight": 1.0}
  ]
}
```

**Response (404 Not Found)**
```json
{
  "success": false,
  "errorCode": "TECHNOLOGY_NOT_FOUND",
  "message": "Technology 'unknown' not found"
}
```

### 6.2. 관계 생성 (관리자)

```http
POST /api/v1/technologies/{name}/relationships
```

**Request Body**
```json
{
  "to": "kotlin",
  "relation": "USED_WITH",
  "weight": 1.0
}
```

**Response (201 Created)**
```json
{
  "success": true,
  "data": {"from": "spring-boot", "to": "kotlin", "relation": "USED_WITH", "weight": 1.0},
  "message": "관계가 생성되었습니다"
}
```

**Response (400 Bad Request)**
```json
{
  "success": false,
  "errorCode": "INVALID_RELATIONSHIP",
  "message": "Cannot create relationship to self"
}
```

### 6.3. 관계 삭제 (관리자)

```http
DELETE /api/v1/technologies/{from}/relationships/{to}?relationType={type}
```

**Query Parameters**
| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| relationType | String | O | DEPENDS_ON, RECOMMENDED_AFTER, CONTAINS, EXTENDS, USED_WITH, ALTERNATIVE_TO |

**Response (204 No Content)**

---

## 7. AI 에이전트 API

### 7.1. 학습 플랜 에이전트 실행 (비동기)

```http
POST /api/v1/agent-runs
```

**Request Body**
```json
{
  "memberId": 1,
  "agentType": "LEARNING_PLAN",
  "parameters": {
    "targetTechName": "Kotlin Coroutines",
    "targetCompletionWeeks": 4,
    "focusAreas": ["비동기 프로그래밍", "동시성 제어"],
    "dailyMinutesOverride": 90
  }
}
```

**Response (202 Accepted)**
```json
{
  "success": true,
  "data": {
    "runId": "run_abc123",
    "status": "RUNNING",
    "createdAt": "2025-11-24T17:00:00"
  },
  "message": "에이전트 실행이 시작되었습니다."
}
```

### 7.2. 에이전트 실행 상태 조회

```http
GET /api/v1/agent-runs/{runId}
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "runId": "run_abc123",
    "agentType": "LEARNING_PLAN",
    "status": "COMPLETED",
    "startedAt": "2025-11-24T17:00:00",
    "completedAt": "2025-11-24T17:02:15",
    "result": {
      "learningPlanId": 1,
      "targetTechnology": "Kotlin Coroutines"
    },
    "error": null
  }
}
```

**Status 값**
- `RUNNING`: 실행 중
- `COMPLETED`: 완료
- `FAILED`: 실패

### 7.3. 에이전트 실행 이벤트 스트림 (SSE)

```http
GET /api/v1/agent-runs/{runId}/events
```

**Response (text/event-stream)**

```
event: PLAN_CREATED
data: {"message": "학습 플랜 초안이 생성되었습니다", "timestamp": "2025-11-24T17:00:10"}

event: ACTION_STARTED
data: {"action": "AnalyzeMemberSkills", "timestamp": "2025-11-24T17:00:15"}

event: ACTION_COMPLETED
data: {"action": "AnalyzeMemberSkills", "result": "분석 완료", "timestamp": "2025-11-24T17:00:45"}

event: ACTION_STARTED
data: {"action": "GenerateLearningSteps", "timestamp": "2025-11-24T17:00:50"}

event: ACTION_COMPLETED
data: {"action": "GenerateLearningSteps", "result": "7개 단계 생성", "timestamp": "2025-11-24T17:01:30"}

event: GOAL_ACHIEVED
data: {"message": "학습 플랜 생성 완료", "learningPlanId": 1, "timestamp": "2025-11-24T17:02:15"}

event: DONE
data: {"runId": "run_abc123"}
```

### 7.4. 학습 플랜 생성 (동기, 간편 버전)

```http
POST /api/v1/members/{memberId}/learning-plans
```

**Request Body**
```json
{
  "targetTechName": "Kotlin Coroutines",
  "targetCompletionWeeks": 4,
  "focusAreas": ["비동기 프로그래밍", "동시성 제어"],
  "dailyMinutesOverride": 90
}
```

**Response (201 Created)**
```json
{
  "success": true,
  "data": {
    "learningPlanId": 1,
    "memberId": 1,
    "targetTechnology": "Kotlin Coroutines",
    "totalWeeks": 4,
    "totalHours": 42,
    "status": "ACTIVE",
    "progress": 0,
    "steps": [
      {
        "stepId": 1,
        "order": 1,
        "title": "Kotlin 기초 복습",
        "description": "코루틴 학습에 필요한 Kotlin 기본 문법 복습",
        "estimatedHours": 3,
        "difficulty": "EASY",
        "completed": false,
        "objectives": [
          "람다와 고차함수 이해하기",
          "확장 함수 활용법 익히기"
        ],
        "suggestedResources": [
          {
            "type": "DOC",
            "title": "Kotlin 공식 문서 - Functions",
            "url": "https://kotlinlang.org/docs/functions.html",
            "language": "ko"
          }
        ]
      },
      {
        "stepId": 2,
        "order": 2,
        "title": "동시성과 비동기 개념 학습",
        "description": "코루틴을 이해하기 위한 동시성 기초 개념",
        "estimatedHours": 5,
        "difficulty": "MEDIUM",
        "completed": false,
        "objectives": [
          "동시성과 병렬성의 차이 이해하기",
          "블로킹과 논블로킹 이해하기"
        ],
        "suggestedResources": [
          {
            "type": "VIDEO",
            "title": "동시성 프로그래밍 입문",
            "url": "https://youtube.com/example",
            "language": "ko"
          }
        ]
      },
      {
        "stepId": 3,
        "order": 3,
        "title": "Kotlin Coroutines 기초",
        "description": "코루틴의 기본 개념과 사용법 학습",
        "estimatedHours": 8,
        "difficulty": "MEDIUM",
        "completed": false,
        "objectives": [
          "코루틴 빌더 사용법 익히기 (launch, async)",
          "suspend 함수 이해하기",
          "코루틴 스코프와 컨텍스트 이해하기"
        ],
        "suggestedResources": [
          {
            "type": "DOC",
            "title": "Kotlin Coroutines 공식 가이드",
            "url": "https://kotlinlang.org/docs/coroutines-guide.html",
            "language": "en"
          }
        ]
      }
    ],
    "dailySchedule": [
      {
        "dayIndex": 1,
        "date": "2025-11-25",
        "allocatedMinutes": 90,
        "stepRef": 1,
        "tasks": ["람다와 고차함수 공부", "예제 코드 실습"]
      }
    ],
    "dailySchedule": [
      {
        "dayIndex": 1,
        "date": "2025-11-25",
        "allocatedMinutes": 90,
        "stepRef": 1,
        "tasks": ["람다와 고차함수 공부", "예제 코드 실습"]
      }
    ],
    "backgroundAnalysis": {
      "existingRelevantSkills": ["Kotlin", "Java", "멀티스레딩 기초"],
      "knowledgeGaps": ["비동기 프로그래밍", "코루틴 개념"],
      "recommendations": [
        "Kotlin 기초가 탄탄하므로 코루틴 학습에 유리합니다",
        "Java의 Thread 경험을 바탕으로 비교하며 학습하면 좋습니다"
      ],
      "riskFactors": [
        "비동기 프로그래밍 경험이 없어 초반에 어려움이 있을 수 있습니다"
      ],
      "rawText": null
    },
    "createdAt": "2025-11-24T17:00:00",
    "updatedAt": "2025-11-24T17:00:00"
  },
  "message": "학습 플랜이 생성되었습니다."
}
```

### 7.5. 학습 플랜 목록 조회

```http
GET /api/v1/members/{memberId}/learning-plans
```

**Query Parameters**
- `status` (optional): ACTIVE, COMPLETED, ABANDONED
- `page` (optional, default: 0)
- `size` (optional, default: 10)

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "plans": [
      {
        "learningPlanId": 1,
        "targetTechnology": "Kotlin Coroutines",
        "totalWeeks": 4,
        "totalHours": 42,
        "status": "ACTIVE",
        "progress": 25,
        "createdAt": "2025-11-24T17:00:00",
        "updatedAt": "2025-11-24T18:30:00",
        "startedAt": "2025-11-25T09:00:00"
      }
    ],
    "pagination": {
      "page": 0,
      "size": 10,
      "totalElements": 1,
      "totalPages": 1
    }
  }
}
```

### 7.6. 학습 플랜 상세 조회

```http
GET /api/v1/members/{memberId}/learning-plans/{planId}
```

**Response (200 OK)** - 7.4의 Response와 동일한 구조

### 7.7. 학습 플랜 진행도 업데이트

```http
PATCH /api/v1/members/{memberId}/learning-plans/{planId}/progress
```

**Request Body**
```json
{
  "progress": 40,
  "status": "ACTIVE"
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "learningPlanId": 1,
    "progress": 40,
    "status": "ACTIVE",
    "updatedAt": "2025-11-25T20:00:00"
  },
  "message": "진행도가 업데이트되었습니다."
}
```

### 7.8. 학습 스텝 완료 처리

```http
POST /api/v1/members/{memberId}/learning-plans/{planId}/steps/{stepOrder}/complete
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "stepId": 1,
    "order": 1,
    "completed": true,
    "completedAt": "2025-11-25T22:00:00"
  },
  "message": "학습 스텝이 완료 처리되었습니다."
}
```

---

## 8. 커뮤니티 기여 API (v1.1 예정)

> 현재 v1에서는 기술 지식을 직접 수정하는 방식을 사용하며, 커뮤니티 제안 기능은 v1.1에서 추가될 예정입니다.

### 8.1. 기술 지식 수정 제안 (v1.1)

```http
POST /api/v1/technologies/{technologyId}/edits
```

**Request Body**
```json
{
  "proposedSummary": "Spring Boot는... (수정된 내용)",
  "proposedLearningTips": "1. ... (수정된 팁)",
  "proposedPrerequisites": ["java", "spring-framework", "maven"]
}
```

**Response (201 Created)**
```json
{
  "success": true,
  "data": {
    "technologyEditId": 1,
    "status": "PENDING",
    "authorId": 1,
    "createdAt": "2025-11-24T18:00:00"
  },
  "message": "수정 제안이 제출되었습니다. 검토 후 반영됩니다."
}
```

### 8.2. 수정 제안 목록 조회

```http
GET /api/v1/technologies/{technologyId}/edits
```

**Query Parameters**
- `status` (optional): PENDING, APPROVED, REJECTED

**Response (200 OK)**

### 8.3. 수정 제안 승인/거부 (관리자)

```http
PATCH /api/v1/technologies/{technologyId}/edits/{editId}
```

**Request Body**
```json
{
  "status": "APPROVED"
}
```

**Response (200 OK)**

---

## 에러 코드

| HTTP Status | Error Code | 설명 |
|-------------|------------|------|
| 400 | INVALID_REQUEST | 잘못된 요청 |
| 400 | INVALID_RELATIONSHIP | 잘못된 관계 (자기 참조 등) |
| 401 | UNAUTHORIZED | 인증 실패 |
| 403 | FORBIDDEN | 권한 없음 |
| 404 | NOT_FOUND | 리소스를 찾을 수 없음 |
| 404 | TECHNOLOGY_NOT_FOUND | 기술을 찾을 수 없음 (V4) |
| 404 | NO_PATH_FOUND | 학습 경로를 찾을 수 없음 (V4) |
| 409 | CONFLICT | 중복된 데이터 |
| 409 | TECHNOLOGY_ALREADY_EXISTS | 기술이 이미 존재함 (V4) |
| 422 | UNPROCESSABLE_ENTITY | 유효성 검증 실패 |
| 500 | INTERNAL_SERVER_ERROR | 서버 내부 오류 |
| 503 | SERVICE_UNAVAILABLE | 서비스 일시 중단 |

## 주요 도메인 Enum

### TargetTrack
- `BACKEND` - 백엔드
- `FRONTEND` - 프론트엔드
- `FULLSTACK` - 풀스택
- `MOBILE` - 모바일
- `DATA` - 데이터
- `DEVOPS` - 데브옵스

### ExperienceLevel
- `BEGINNER` - 입문
- `INTERMEDIATE` - 중급
- `ADVANCED` - 고급

### LearningStyle
- `DOC_FIRST` - 문서 우선
- `VIDEO_FIRST` - 영상 우선
- `PROJECT_BASED` - 프로젝트 중심
- `BALANCED` - 균형잡힌
- `HANDS_ON` - 실습 중심 (대체 표현)
- `THEORY_FIRST` - 이론 우선 (대체 표현)

### SkillCategory
- `LANGUAGE` - 언어
- `FRAMEWORK` - 프레임워크
- `LIBRARY` - 라이브러리
- `TOOL` - 도구
- `DB` - 데이터베이스
- `PLATFORM` - 플랫폼
- `ETC` - 기타
- `DEVOPS` - DevOps (추가)
- `API` - API (추가)
- `DATABASE` - 데이터베이스 (DB의 대체 표현)

### SkillLevel
- `BEGINNER` - 입문
- `INTERMEDIATE` - 중급
- `ADVANCED` - 고급
- `EXPERT` - 전문가

### GoalPriority
- `LOW` - 낮음
- `MEDIUM` - 중간
- `HIGH` - 높음

### GoalStatus
- `ACTIVE` - 진행 중
- `COMPLETED` - 완료
- `ABANDONED` - 중단
- `PLANNING` - 계획 중 (추가)

### LearningPlanStatus
- `ACTIVE` - 진행 중
- `COMPLETED` - 완료
- `ABANDONED` - 중단
- `DRAFT` - 초안 (추가)

### StepDifficulty
- `EASY` - 쉬움
- `MEDIUM` - 중간
- `HARD` - 어려움

### AgentRunStatus
- `PENDING` - 대기 중
- `RUNNING` - 실행 중
- `COMPLETED` - 완료
- `FAILED` - 실패

### AgentType
- `LEARNING_PLAN` - 학습 플랜 생성 에이전트

### KnowledgeSource
- `COMMUNITY` - 커뮤니티
- `AI_IMPORTED` - AI 자동 생성

### TechRelation (V4 Graph)
- `DEPENDS_ON` - 선행 지식 필수
- `RECOMMENDED_AFTER` - 권장 학습 순서
- `CONTAINS` - 포함 관계
- `EXTENDS` - 확장 관계
- `USED_WITH` - 함께 사용
- `ALTERNATIVE_TO` - 대체 가능

### RelationType (Deprecated, V3 이하)
- `PREREQUISITE` - 선행 지식
- `NEXT_STEP` - 다음 단계
- `ALTERNATIVE` - 대체 기술

### TechCategory (V4)
- `LANGUAGE` - 언어 (Java, Kotlin, Python)
- `FRAMEWORK` - 프레임워크 (Spring, React)
- `LIBRARY` - 라이브러리 (JPA, Pandas)
- `TOOL` - 도구 (Docker, Git)
- `CONCEPT` - 개념 (DI, REST, SOLID)
- `DATABASE` - 데이터베이스 (MySQL, Redis)
- `DB` - DATABASE 별칭
- `PLATFORM` - 플랫폼 (AWS, GCP)
- `DEVOPS` - DevOps (CI/CD, Kubernetes)
- `API` - API (REST, GraphQL)
- `ETC` - 기타

### Difficulty (V4)
- `BEGINNER` - 입문
- `INTERMEDIATE` - 중급
- `ADVANCED` - 고급
- `EXPERT` - 전문가

### EditStatus (v1.1)
- `PENDING` - 검토 대기
- `APPROVED` - 승인
- `REJECTED` - 거부

### LearningPathType
- `QUICK` - 빠른 경로 (3-4단계)
- `STANDARD` - 표준 경로 (5-7단계)
- `DETAILED` - 상세 경로 (8-12단계)

### ResourceType
- `DOC` - 문서
- `VIDEO` - 영상
- `BLOG` - 블로그
- `COURSE` - 강의
- `REPO` - 저장소
- `DOCUMENTATION` - 공식 문서 (DOC의 대체 표현)
- `TUTORIAL` - 튜토리얼 (BLOG의 대체 표현)
- `ARTICLE` - 글 (BLOG의 대체 표현)
- `PROJECT` - 프로젝트 (REPO의 대체 표현)

### SseEventType
- `AGENT_STARTED` - 에이전트 실행 시작
- `PLANNING_STARTED` - GOAP 계획 시작
- `ACTION_EXECUTED` - 액션 실행 완료
- `PROGRESS` - 진행 상황 업데이트
- `PATH_UPDATED` - 실행 경로(액션 시퀀스) 업데이트
- `AGENT_COMPLETED` - 에이전트 실행 완료
- `ERROR` - 오류 발생

### ProgressStage (v3.1 신규)
Agent 내부 진행 단계를 나타내는 enum:
- `ANALYSIS_STARTED` - 기술 분석 시작 (10%)
- `DEEP_ANALYSIS` - 심층 분석 진행 (20%)
- `GAP_ANALYSIS` - 역량 Gap 분석 (30%)
- `CURRICULUM_GENERATION` - 커리큘럼 생성 (50%)
- `RESOURCE_ENRICHMENT` - 학습 자료 수집 (70%)
- `RESOURCE_STEP_PROGRESS` - 스텝별 리소스 수집 진행 (70-95%)
- `FINALIZING` - 최종화 (95%)

---

## 7. AI 에이전트 API

### 7.1. 학습 플랜 생성 (SSE 스트리밍)

AI 에이전트를 실행하여 실시간으로 학습 플랜 생성 과정을 스트리밍합니다.

```http
POST /api/v1/agents/learning-plan/stream
```

**Query Parameters**
- `memberId` (required): 회원 ID
- `targetTechnology` (required): 학습할 기술명 (예: "Kotlin Coroutines")

**Response**
- Content-Type: `text/event-stream`
- 실시간 SSE 이벤트 스트림

**SSE 이벤트 타입**

1. **agent_started** - 에이전트 실행 시작
```json
{
  "type": "AGENT_STARTED",
  "agentRunId": 1,
  "message": "Agent 실행 시작",
  "timestamp": 1700000000000
}
```

2. **planning_started** - GOAP 경로 계획 시작
```json
{
  "type": "PLANNING_STARTED",
  "agentRunId": 1,
  "message": "GOAP 경로 계획 중...",
  "timestamp": 1700000001000
}
```

3. **action_executed** - Action 실행 완료
```json
{
  "type": "ACTION_EXECUTED",
  "agentRunId": 1,
  "actionName": "extractMemberProfile",
  "message": "extractMemberProfile 실행 완료 (1234ms)",
  "timestamp": 1700000002000
}
```

4. **progress** - 진행 상황 업데이트
```json
{
  "type": "PROGRESS",
  "agentRunId": 1,
  "message": "진행 중... (3개 액션 완료)",
  "timestamp": 1700000003000
}
```

5. **agent_progress** (v3.1 신규) - 세분화된 진행률 이벤트
```json
{
  "type": "PROGRESS",
  "agentRunId": 1,
  "actionName": "CURRICULUM_GENERATION",
  "message": "커리큘럼 생성 중 (모드: standard) - 50%",
  "timestamp": 1700000004000
}
```

**agent_progress 필드 설명:**
- `actionName`: ProgressStage enum 값 (ANALYSIS_STARTED, DEEP_ANALYSIS, GAP_ANALYSIS, CURRICULUM_GENERATION, RESOURCE_ENRICHMENT, RESOURCE_STEP_PROGRESS, FINALIZING)
- `message`: 현재 단계 설명 + 상세 정보 + 진행률 %

6. **path_updated** - 실행된 액션 경로(배치) 업데이트
```json
{
  "type": "PATH_UPDATED",
  "agentRunId": 1,
  "message": "경로 업데이트 (3개 액션 실행)",
  "executedPath": ["ExtractMemberProfile", "QuickAnalysis", "GenerateQuickCurriculum"],
  "executedActions": [
    {"name": "ExtractMemberProfile", "status": "COMPLETED", "durationMs": null},
    {"name": "QuickAnalysis", "status": "COMPLETED", "durationMs": null},
    {"name": "GenerateQuickCurriculum", "status": "COMPLETED", "durationMs": null}
  ],
  "timestamp": 1700000003500
}
```

7. **agent_completed** - 에이전트 실행 완료
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

8. **error** - 오류 발생
```json
{
  "type": "ERROR",
  "message": "오류 발생: Invalid member ID",
  "timestamp": 1700000005000
}
```

**사용 예시 (JavaScript)**
```javascript
const eventSource = new EventSource(
  '/api/v1/agents/learning-plan/stream?memberId=1&targetTechnology=kotlin'
);

eventSource.addEventListener('agent_started', (e) => {
  const data = JSON.parse(e.data);
  console.log('Agent 시작:', data.agentRunId);
});

eventSource.addEventListener('action_executed', (e) => {
  const data = JSON.parse(e.data);
  console.log(`${data.actionName} 완료`);
});

// v3.1 신규: 세분화된 진행률 이벤트
eventSource.addEventListener('agent_progress', (e) => {
  const data = JSON.parse(e.data);
  console.log(`진행 단계: ${data.actionName}`);
  console.log(`메시지: ${data.message}`);
  // UI 업데이트 예시: 프로그레스 바 업데이트
  // updateProgressBar(data.actionName, data.message);
});

eventSource.addEventListener('agent_completed', (e) => {
  const data = JSON.parse(e.data);
  console.log('최종 결과:', data.result);
  eventSource.close();
});

eventSource.addEventListener('error', (e) => {
  const data = JSON.parse(e.data);
  console.error('오류:', data.message);
  eventSource.close();
});
```

**특징**
- **GOAP 동적 경로 설정**: Agent가 회원 프로필에 따라 Quick/Standard/Detailed 경로를 동적으로 선택
- **실시간 모니터링**: 각 Action 실행을 실시간으로 추적
- **경로 스트리밍**: path_updated 이벤트로 실행된 액션 경로를 주기적으로 송신
- **비동기 처리**: 서버에서 CompletableFuture를 사용한 non-blocking 처리
- **자동 재계획**: 각 Action 실행 후 GOAP가 자동으로 재계획(replanning) 수행

---

### 7.2. AgentRun 관리 API

#### 7.2.1. AgentRun 생성

```http
POST /api/v1/agent-runs?memberId={memberId}
```

**Request Body**
```json
{
  "agentType": "LEARNING_PLAN",
  "parameters": "{\"targetTechnology\":\"kotlin\"}"
}
```

**Response (201 Created)**
```json
{
  "success": true,
  "data": {
    "agentRunId": 1,
    "memberId": 1,
    "agentType": "LEARNING_PLAN",
    "status": "PENDING",
    "parameters": "{\"targetTechnology\":\"kotlin\"}",
    "result": null,
    "learningPlanId": null,
    "errorMessage": null,
    "startedAt": null,
    "completedAt": null,
    "executionTimeMs": null,
    "estimatedCost": null,
    "createdAt": "2025-11-24T12:00:00",
    "updatedAt": "2025-11-24T12:00:00"
  },
  "message": "Agent run created successfully"
}
```

#### 7.2.2. AgentRun 조회

```http
GET /api/v1/agent-runs/{agentRunId}?memberId={memberId}
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "agentRunId": 1,
    "memberId": 1,
    "agentType": "LEARNING_PLAN",
    "status": "COMPLETED",
    "parameters": "{\"targetTechnology\":\"kotlin\"}",
    "result": "{\"path\":\"QUICK\",\"curriculum\":[...]}",
    "learningPlanId": 5,
    "errorMessage": null,
    "startedAt": "2025-11-24T12:00:00",
    "completedAt": "2025-11-24T12:03:00",
    "executionTimeMs": 180000,
    "estimatedCost": 0.05,
    "createdAt": "2025-11-24T12:00:00",
    "updatedAt": "2025-11-24T12:03:00"
  },
  "message": "Agent run retrieved successfully"
}
```

#### 7.2.3. AgentRun 목록 조회

```http
GET /api/v1/agent-runs?memberId={memberId}&status={status}
```

**Query Parameters**
- `memberId` (required): 회원 ID
- `status` (optional): AgentRunStatus 필터 (PENDING, RUNNING, COMPLETED, FAILED)

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "runs": [
      {
        "agentRunId": 1,
        "memberId": 1,
        "agentType": "LEARNING_PLAN",
        "status": "COMPLETED",
        "createdAt": "2025-11-24T12:00:00"
      }
    ],
    "total": 1
  },
  "message": "Agent runs retrieved successfully"
}
```

#### 7.2.4. AgentRun 시작

```http
POST /api/v1/agent-runs/{agentRunId}/start
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "agentRunId": 1,
    "status": "RUNNING",
    "startedAt": "2025-11-24T12:00:00"
  },
  "message": "Agent run started successfully"
}
```

#### 7.2.5. AgentRun 완료 처리

```http
POST /api/v1/agent-runs/{agentRunId}/complete
```

**Query Parameters**
- `result` (optional): 결과 JSON
- `learningPlanId` (optional): 생성된 학습 플랜 ID
- `cost` (optional): 예상 비용
- `executionTimeMs` (optional): 실행 시간(ms)

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "agentRunId": 1,
    "status": "COMPLETED",
    "result": "{...}",
    "completedAt": "2025-11-24T12:03:00"
  },
  "message": "Agent run completed successfully"
}
```

#### 7.2.6. AgentRun 실패 처리

```http
POST /api/v1/agent-runs/{agentRunId}/fail?errorMessage={message}
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "agentRunId": 1,
    "status": "FAILED",
    "errorMessage": "LLM API timeout",
    "completedAt": "2025-11-24T12:01:00"
  },
  "message": "Agent run failed"
}
```

---

## 8. GOAP 동작 원리

SkillWeaver의 AI 에이전트는 **GOAP(Goal-Oriented Action Planning)** 알고리즘을 사용하여 회원의 상황에 맞는 최적의 학습 경로를 동적으로 결정합니다.

### 8.1. 3가지 학습 경로

1. **Quick Path (빠른 경로)**
   - 대상: ADVANCED 레벨 + PROJECT_BASED + 충분한 스킬 보유
   - 특징: 3-4단계, 3-5분, 약 $0.05
   - Actions: extractMemberProfile → quickAnalysis → skipGapAnalysis → generateQuickCurriculum → finalizeQuickPlan

2. **Standard Path (표준 경로)**
   - 대상: INTERMEDIATE 레벨
   - 특징: 5-7단계, 8-12분, 약 $0.15
   - Actions: extractMemberProfile → deepAnalysis → quickGapCheck → generateStandardCurriculum → finalizeStandardPlan

3. **Detailed Path (상세 경로)**
   - 대상: BEGINNER 레벨 또는 선행 지식 부족
   - 특징: 8-12단계 (리소스 포함), 15-20분, 약 $0.30
   - Actions: extractMemberProfile → deepAnalysis → detailedGapAnalysis → generateDetailedCurriculum → enrichWithResources → finalizeDetailedPlan

### 8.2. 동적 재계획 (Replanning)

각 Action 실행 후 GOAP는 다음을 수행합니다:
1. **현재 상태 분석**: Blackboard와 World 상태 확인
2. **실행 가능한 Action 탐색**: Precondition 평가
3. **최적 경로 탐색**: A* 알고리즘으로 Goal까지의 최적 시퀀스 계산
4. **다음 Action 실행**: 선택된 Action 실행 후 다시 1번으로

이를 통해 예상치 못한 상황(예: LLM 응답 결과에 따른 조건 변경)에도 유연하게 대응할 수 있습니다.

---

---

## 10. Graph API (V3 신규)

Graph API는 GraphRAG 기반의 **빠르고 무료인** 기술 탐색 API입니다.
LLM을 사용하지 않고 Neo4j Cypher 쿼리로 동작하므로 실시간 응답이 가능합니다.

### Graph API vs Agent API

| 구분 | Graph API (V3) | Agent API (기존) |
|------|----------------|------------------|
| **역할** | 네비게이션 (지도) | 가이드 투어 (계획) |
| **속도** | 실시간 (~10ms) | 스트리밍 (10s+) |
| **비용** | 무료 | 크레딧 소모 |
| **용도** | 탐색, 미리보기 | 상세 커리큘럼 생성 |

### 10.1. 기술 로드맵 조회

```http
GET /api/v1/graph/roadmap/{technology}
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "technology": "spring-boot",
    "displayName": "Spring Boot",
    "prerequisites": {
      "required": [
        {"name": "java", "displayName": "Java", "category": "LANGUAGE", "difficulty": "BEGINNER"}
      ],
      "recommended": [
        {"name": "spring-framework", "displayName": "Spring Framework", "category": "FRAMEWORK", "difficulty": "INTERMEDIATE"}
      ]
    },
    "nextSteps": [
      {"name": "spring-data", "displayName": "Spring Data", "category": "LIBRARY", "difficulty": "INTERMEDIATE"}
    ]
  }
}
```

**Response (404 Not Found)**
```json
{
  "success": false,
  "data": null,
  "message": "Technology 'unknown-tech' not found in graph",
  "errorCode": "TECHNOLOGY_NOT_FOUND"
}
```

### 10.2. 학습 경로 탐색

```http
GET /api/v1/graph/path?from={from}&to={to}
```

**Query Parameters**
| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| from | String | O | 시작 기술 (현재 보유) |
| to | String | O | 목표 기술 |

**Example**: `/api/v1/graph/path?from=java&to=mlops`

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "from": "java",
    "to": "mlops",
    "totalSteps": 4,
    "path": [
      {"step": 1, "technology": "python-data", "relation": "RECOMMENDED_AFTER"},
      {"step": 2, "technology": "ml-theory", "relation": "DEPENDS_ON"},
      {"step": 3, "technology": "mlops", "relation": "RECOMMENDED_AFTER"}
    ]
  }
}
```

### 10.3. 연관 기술 추천

```http
GET /api/v1/graph/recommendations/{technology}
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "technology": "react",
    "recommendations": [
      {"name": "nextjs", "displayName": "Next.js", "relation": "CONTAINS", "category": "FRAMEWORK"},
      {"name": "tailwind", "displayName": "Tailwind CSS", "relation": "USED_WITH", "category": "LIBRARY"}
    ]
  }
}
```

**Response (404 Not Found)**
```json
{
  "success": false,
  "data": null,
  "message": "Technology 'unknown-tech' not found in graph",
  "errorCode": "TECHNOLOGY_NOT_FOUND"
}
```

### 10.4. 갭 분석

```http
POST /api/v1/graph/gap-analysis
```

**Request Body**
```json
{
  "knownTechnologies": ["java", "sql"],
  "targetTechnology": "spring-boot"
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "target": "spring-boot",
    "known": ["java", "sql"],
    "missing": [
      {"name": "spring-framework", "displayName": "Spring Framework", "priority": "HIGH"}
    ],
    "ready": true,
    "readinessScore": 0.8,
    "message": "Java와 SQL 지식이 있으므로 Spring Boot 학습이 가능합니다."
  }
}
```

**Response (404 Not Found)**
```json
{
  "success": false,
  "data": null,
  "message": "Target technology 'unknown-tech' not found in graph",
  "errorCode": "TECHNOLOGY_NOT_FOUND"
}
```

### Graph API 에러 코드

| 코드 | HTTP Status | 설명 |
|------|-------------|------|
| TECHNOLOGY_NOT_FOUND | 404 | 기술이 그래프에 존재하지 않음 |
| NO_PATH_FOUND | 404 | 두 기술 간 경로 없음 |
| GRAPH_SERVICE_UNAVAILABLE | 503 | Neo4j 연결 실패 |

---

## Graph API 사용 시나리오

```
[탐색 단계 - Graph API]
1. 사용자가 "Spring Boot" 검색
2. GET /api/v1/graph/roadmap/spring-boot 호출
3. 선수 지식 트리 시각화 (D3.js)
4. 사용자: "아, Java를 먼저 알아야 하는구나"

[결정 단계 - Agent API]
5. "학습 계획 생성" 버튼 클릭
6. POST /api/v1/agents/learning-plan 호출 (LLM 기반)
7. 상세 커리큘럼 생성 (챕터, 시간 예측)
```

