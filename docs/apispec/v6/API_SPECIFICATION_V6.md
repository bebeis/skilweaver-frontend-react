# SkillWeaver API 명세서

### v6.0 (2025-12-19) - Hybrid Graph RAG

> [!TIP]
> **하위 호환성 유지**: v6는 v5와 완전 호환됩니다. 기존 API는 그대로 동작하며, Hybrid RAG 기능이 추가됩니다.

주요 변경사항:
1. **Hybrid RAG 검색 API 추가**
   - `POST /api/v1/search/hybrid` - Graph + Vector 통합 검색
   - `GET /api/v1/search/learning-path/{technology}` - 학습 경로 + 문서 조회
   - `POST /api/v1/search/gap-analysis` - Gap 분석 + 리소스 추천

2. **HybridRagService 신규**
   - Neo4j 그래프 탐색 + Qdrant 벡터 검색 통합
   - 선행 기술 경로와 관련 문서를 함께 제공
   - Agent에서 자동으로 Hybrid 컨텍스트 사용

3. **NewTechLearningAgent 개선**
   - `fetchRagContext()` → Hybrid RAG 우선 사용
   - 벡터 검색만 사용하던 방식에서 그래프 관계까지 통합

4. **기존 API 확장 옵션** (선택적 활용 가능)
   - 로드맵/Gap 분석 응답에 문서 정보 추가 가능

---

### v5.0 (2025-12-12) - 학습 플랜 → 학습 목표 통합

> [!CAUTION]
> **Breaking Changes**
> - `GoalStatus` enum에 `IN_PROGRESS` 추가 (학습 진행 중 상태)
> - `learning_goal` 테이블에 8개 컬럼 추가 (스키마 변경 필요)

> [!IMPORTANT]
> **DB 마이그레이션 필수**: `docs/migrations/v5_learning_goal_migration.sql` 실행 필요

주요 변경사항:
1. **학습 플랜 시작 API 추가**
   - `POST /api/v1/members/{memberId}/learning-plans/{planId}/start`
   - 학습 플랜 시작 시 학습 목표 자동 생성
   - 1:1 Plan-Goal 연결 (FK 관계)

2. **진행률 자동 동기화**
   - 스텝 완료 시 연결된 Goal의 진행률 자동 업데이트
   - `completedSteps`, `progressPercentage` 자동 계산
   - 모든 스텝 완료 시 Goal 상태 → COMPLETED

3. **LearningGoal 도메인 확장**
   - `learningPlanId`: 연결된 학습 플랜 FK
   - `totalSteps`, `completedSteps`, `progressPercentage`: 진행률 추적
   - `currentStreak`, `longestStreak`, `lastStudyDate`: 학습 스트릭

4. **GoalStatus enum 확장**
   - `IN_PROGRESS` 추가: PLANNING → ACTIVE → IN_PROGRESS → COMPLETED

---

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
> 이 문서는 v6.0 API 명세서입니다. 모든 API를 포함하며, Hybrid RAG 검색 기능이 추가되었습니다.

---

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

---

## 11. Hybrid RAG 검색 API (V6 신규)

Hybrid RAG API는 **Graph RAG (Neo4j)**와 **Vector RAG (Qdrant)**를 통합하여 학습 경로와 관련 문서를 함께 제공합니다.

### Hybrid RAG vs 기존 API 비교

| 구분 | Hybrid Search (V6) | Graph API (V3) | Agent API |
|------|-------------------|----------------|-----------|
| **역할** | 통합 검색 + 문서 | 네비게이션 (지도) | 상세 커리큘럼 |
| **데이터** | Graph + Vector | Graph만 | LLM 생성 |
| **속도** | ~200ms | ~10ms | 10s+ |
| **비용** | 무료 | 무료 | 크레딧 소모 |
| **용도** | 풍부한 컨텍스트 | 빠른 탐색 | 맞춤 계획 |

### 11.1. Hybrid RAG 검색

Graph 관계 탐색 + Vector 유사도 검색을 결합하여 학습 경로와 관련 문서를 함께 제공합니다.

```http
POST /api/v1/search/hybrid
```

**Request Body**
```json
{
  "query": "React Native 배우려면 뭘 먼저 해야 해?",
  "targetTechnology": "react-native",
  "maxGraphDepth": 2,
  "maxVectorResults": 5,
  "includeDocuments": true
}
```

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| query | String | O | - | 자연어 검색 쿼리 |
| targetTechnology | String | N | 쿼리에서 추출 | 목표 기술 (없으면 쿼리에서 자동 추출) |
| maxGraphDepth | Int | N | 2 | 그래프 탐색 깊이 |
| maxVectorResults | Int | N | 5 | 기술당 최대 문서 수 |
| includeDocuments | Boolean | N | true | 문서 내용 포함 여부 |

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "query": "React Native 배우려면 뭘 먼저 해야 해?",
    "targetTechnology": {
      "name": "react-native",
      "displayName": "React Native",
      "category": "FRAMEWORK"
    },
    "learningPath": [
      {
        "step": 1,
        "technology": {
          "name": "javascript",
          "displayName": "JavaScript",
          "category": "LANGUAGE"
        },
        "relation": "DEPENDS_ON",
        "distance": 2,
        "documents": [
          {
            "type": "ROADMAP",
            "content": "JavaScript 학습 로드맵: 1. 변수와 자료형...",
            "source": "official",
            "relevanceScore": 0.92
          }
        ]
      },
      {
        "step": 2,
        "technology": {
          "name": "react",
          "displayName": "React",
          "category": "FRAMEWORK"
        },
        "relation": "DEPENDS_ON",
        "distance": 1,
        "documents": [
          {
            "type": "ROADMAP",
            "content": "React 학습 로드맵: 1. JSX 문법...",
            "source": "official",
            "relevanceScore": 0.89
          }
        ]
      },
      {
        "step": 3,
        "technology": {
          "name": "react-native",
          "displayName": "React Native",
          "category": "FRAMEWORK"
        },
        "relation": "TARGET",
        "distance": 0,
        "documents": [
          {
            "type": "ROADMAP",
            "content": "React Native 학습 로드맵: 1. 환경 설정...",
            "source": "official",
            "relevanceScore": 0.95
          }
        ]
      }
    ],
    "relatedTechnologies": [
      {
        "name": "typescript",
        "displayName": "TypeScript",
        "relation": "USED_WITH"
      },
      {
        "name": "expo",
        "displayName": "Expo",
        "relation": "USED_WITH"
      }
    ],
    "summary": "React Native을(를) 배우려면 JavaScript → React → React Native 순서로 학습하는 것이 효과적입니다.",
    "estimatedTotalHours": 120,
    "metadata": {
      "graphNodesTraversed": 5,
      "vectorDocumentsSearched": 15,
      "processingTimeMs": 245
    }
  }
}
```

**Response (400 Bad Request)**
```json
{
  "success": false,
  "message": "Could not extract technology from query",
  "errorCode": "INVALID_REQUEST"
}
```

### 11.2. 학습 경로 + 문서 조회

특정 기술의 선행 지식 경로와 각 단계별 학습 문서를 함께 제공합니다.

```http
GET /api/v1/search/learning-path/{technology}
```

**Path Parameters**
- `technology`: 기술 이름 (예: `spring-boot`, `react`)

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "technology": "spring-boot",
    "displayName": "Spring Boot",
    "prerequisites": {
      "required": [
        {
          "name": "java",
          "displayName": "Java",
          "category": "LANGUAGE",
          "difficulty": "BEGINNER",
          "documents": [
            {
              "type": "ROADMAP",
              "content": "Java 학습 로드맵...",
              "source": "official",
              "relevanceScore": 0.91
            }
          ]
        }
      ],
      "recommended": [
        {
          "name": "spring-framework",
          "displayName": "Spring Framework",
          "category": "FRAMEWORK",
          "difficulty": "INTERMEDIATE",
          "documents": [
            {
              "type": "ROADMAP",
              "content": "Spring Framework 개념...",
              "source": "baeldung",
              "relevanceScore": 0.85
            }
          ]
        }
      ]
    },
    "nextSteps": [
      {
        "name": "spring-data",
        "displayName": "Spring Data",
        "category": "LIBRARY",
        "difficulty": "INTERMEDIATE",
        "documents": []
      }
    ],
    "targetDocuments": [
      {
        "type": "ROADMAP",
        "content": "Spring Boot 학습 로드맵: 1. 프로젝트 생성...",
        "source": "spring.io",
        "relevanceScore": 0.95
      },
      {
        "type": "BEST_PRACTICE",
        "content": "Spring Boot 베스트 프랙티스: 1. @ConfigurationProperties 사용...",
        "source": "community",
        "relevanceScore": 0.88
      }
    ]
  }
}
```

**Response (404 Not Found)**
```json
{
  "success": false,
  "message": "Technology 'unknown-tech' not found",
  "errorCode": "TECHNOLOGY_NOT_FOUND"
}
```

### 11.3. Gap 분석 + 리소스 추천

현재 보유 기술과 목표 기술 간의 갭을 분석하고, 부족한 기술에 대한 학습 리소스를 추천합니다.

```http
POST /api/v1/search/gap-analysis
```

**Request Body**
```json
{
  "known": ["python", "sql"],
  "target": "spring-boot"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| known | List<String> | O | 현재 보유 기술 목록 |
| target | String | O | 목표 기술 |

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "target": "spring-boot",
    "known": ["python", "sql"],
    "missing": [
      {
        "name": "java",
        "displayName": "Java",
        "priority": "HIGH",
        "recommendedResources": [
          {
            "type": "ROADMAP",
            "title": "Java 기초부터 고급까지...",
            "estimatedHours": 60
          },
          {
            "type": "VIDEO",
            "title": "Java 프로그래밍 입문 강의",
            "estimatedHours": 20
          }
        ]
      }
    ],
    "ready": false,
    "readinessScore": 0.3,
    "message": "java을(를) 먼저 학습하면 더 효과적입니다."
  }
}
```

**Response (200 OK) - 준비 완료**
```json
{
  "success": true,
  "data": {
    "target": "spring-boot",
    "known": ["java", "sql"],
    "missing": [],
    "ready": true,
    "readinessScore": 1.0,
    "message": "모든 필수 선행 지식을 보유하고 있습니다!"
  }
}
```

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

**Response (200 OK)** - 1.5와 동일한 구조

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
      }
    ],
    "totalCount": 1
  }
}
```

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

> `technologyName` 또는 `customName` 중 하나는 반드시 값이 있어야 합니다.

**Response (201 Created)**
```json
{
  "success": true,
  "data": {
    "memberSkillId": 3,
    "technologyName": "spring-boot",
    "level": "INTERMEDIATE",
    "yearsOfUse": 1.5
  },
  "message": "기술 스택이 추가되었습니다."
}
```

### 2.3. 기술 스택 수정

```http
PUT /api/v1/members/{memberId}/skills/{skillId}
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
- `status` (optional): ACTIVE, COMPLETED, ABANDONED, IN_PROGRESS

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
        "status": "IN_PROGRESS",
        "totalSteps": 7,
        "completedSteps": 3,
        "progressPercentage": 43,
        "currentStreak": 5,
        "longestStreak": 5,
        "lastStudyDate": "2025-12-18",
        "createdAt": "2025-11-01T10:00:00"
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

### 3.3. 학습 목표 수정

```http
PUT /api/v1/members/{memberId}/goals/{goalId}
```

### 3.4. 학습 목표 삭제

```http
DELETE /api/v1/members/{memberId}/goals/{goalId}
```

### 3.5. 학습 스트릭 조회 (V5)

```http
GET /api/v1/members/{memberId}/goals/{goalId}/streak
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "learningGoalId": 5,
    "currentStreak": 7,
    "longestStreak": 14,
    "lastStudyDate": "2025-12-11",
    "isActiveToday": false,
    "streakStatus": "AT_RISK",
    "message": "오늘 학습하면 8일 스트릭을 이어갈 수 있어요!"
  }
}
```

---

## 4. 기술 카탈로그 API (V4 통합)

> [!IMPORTANT]
> V4부터 모든 기술 데이터는 Neo4j Graph에서 관리됩니다.

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

### 4.2. 기술 상세 조회

```http
GET /api/v1/technologies/{name}
```

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
    "prerequisites": {
      "required": [
        {"name": "java", "displayName": "Java", "category": "LANGUAGE"}
      ],
      "recommended": [
        {"name": "spring-framework", "displayName": "Spring Framework", "category": "FRAMEWORK"}
      ]
    },
    "relatedTechnologies": [
      {"name": "kotlin", "displayName": "Kotlin", "category": "LANGUAGE"}
    ]
  }
}
```

### 4.3 ~ 4.5. 기술 생성/수정/삭제 (관리자)

```http
POST /api/v1/technologies
PUT /api/v1/technologies/{name}
DELETE /api/v1/technologies/{name}
```

---

## 5. 기술 로드맵 & 학습 경로 API

### 5.1. 기술 로드맵 조회

```http
GET /api/v1/technologies/{name}/roadmap
```

### 5.2. 학습 경로 탐색

```http
GET /api/v1/technologies/path?from={from}&to={to}
```

### 5.3. 연관 기술 추천

```http
GET /api/v1/technologies/{name}/recommendations
```

### 5.4. 갭 분석

```http
POST /api/v1/technologies/gap-analysis
```

---

## 6. 기술 관계 관리 API

### 6.1. 기술 관계 조회

```http
GET /api/v1/technologies/{name}/relationships
```

### 6.2. 관계 생성 (관리자)

```http
POST /api/v1/technologies/{name}/relationships
```

### 6.3. 관계 삭제 (관리자)

```http
DELETE /api/v1/technologies/{from}/relationships/{to}?relationType={type}
```

---

## 7. AI 에이전트 API

### 7.1. 학습 플랜 생성 (SSE 스트리밍)

```http
POST /api/v1/agents/learning-plan/stream
```

**Query Parameters**
- `memberId` (required): 회원 ID
- `targetTechnology` (required): 학습할 기술명

**Response**: `text/event-stream`

### 7.2 ~ 7.8. AgentRun 관리 및 학습 플랜 API

- `POST /api/v1/agent-runs` - AgentRun 생성
- `GET /api/v1/agent-runs/{runId}` - AgentRun 조회
- `POST /api/v1/members/{memberId}/learning-plans` - 학습 플랜 생성
- `GET /api/v1/members/{memberId}/learning-plans` - 학습 플랜 목록
- `POST /api/v1/members/{memberId}/learning-plans/{planId}/start` - 학습 플랜 시작 (V5)
- `POST /api/v1/members/{memberId}/learning-plans/{planId}/steps/{stepOrder}/complete` - 스텝 완료

---

## 에러 코드

| HTTP Status | Error Code | 설명 |
|-------------|------------|------|
| 400 | INVALID_REQUEST | 잘못된 요청 |
| 400 | INVALID_RELATIONSHIP | 잘못된 관계 (자기 참조 등) |
| 401 | UNAUTHORIZED | 인증 실패 |
| 403 | FORBIDDEN | 권한 없음 |
| 404 | NOT_FOUND | 리소스를 찾을 수 없음 |
| 404 | TECHNOLOGY_NOT_FOUND | 기술을 찾을 수 없음 |
| 404 | NO_PATH_FOUND | 학습 경로를 찾을 수 없음 |
| 409 | CONFLICT | 중복된 데이터 |
| 409 | TECHNOLOGY_ALREADY_EXISTS | 기술이 이미 존재함 |
| 500 | INTERNAL_SERVER_ERROR | 서버 내부 오류 |
| 503 | SERVICE_UNAVAILABLE | 서비스 일시 중단 |
| 503 | GRAPH_SERVICE_UNAVAILABLE | Neo4j 연결 실패 |

---

## 주요 도메인 Enum

### TargetTrack
- `BACKEND`, `FRONTEND`, `FULLSTACK`, `MOBILE`, `DATA`, `DEVOPS`

### ExperienceLevel
- `BEGINNER`, `INTERMEDIATE`, `ADVANCED`

### LearningStyle
- `DOC_FIRST`, `VIDEO_FIRST`, `PROJECT_BASED`, `BALANCED`, `HANDS_ON`, `THEORY_FIRST`

### GoalStatus
- `ACTIVE`, `COMPLETED`, `ABANDONED`, `PLANNING`, `IN_PROGRESS` (V5)

### TechCategory (V4)
- `LANGUAGE`, `FRAMEWORK`, `LIBRARY`, `TOOL`, `CONCEPT`, `DATABASE`, `PLATFORM`, `DEVOPS`, `API`, `ETC`

### TechRelation (V4)
- `DEPENDS_ON`, `RECOMMENDED_AFTER`, `CONTAINS`, `EXTENDS`, `USED_WITH`, `ALTERNATIVE_TO`

### Difficulty (V4)
- `BEGINNER`, `INTERMEDIATE`, `ADVANCED`, `EXPERT`

### ProgressStage (V3.1)
- `ANALYSIS_STARTED` (10%), `DEEP_ANALYSIS` (20%), `GAP_ANALYSIS` (30%)
- `CURRICULUM_GENERATION` (50%), `RESOURCE_ENRICHMENT` (70%)
- `RESOURCE_STEP_PROGRESS` (70-95%), `FINALIZING` (95%)

### LearningPathType
- `QUICK`, `STANDARD`, `DETAILED`

### ResourceType
- `DOC`, `VIDEO`, `BLOG`, `COURSE`, `REPO`, `ROADMAP`, `BEST_PRACTICE`

---

## Hybrid RAG 사용 시나리오

```
[탐색 단계 - Hybrid Search API]
1. 사용자가 "React Native 배우려면?" 검색
2. POST /api/v1/search/hybrid 호출
3. Graph 관계 + Vector 문서 통합 결과 수신
4. 학습 경로 시각화 + 각 단계별 추천 자료 표시

[결정 단계 - Agent API]
5. "맞춤 학습 계획 생성" 버튼 클릭
6. POST /api/v1/agents/learning-plan/stream 호출
7. AI가 Hybrid RAG 컨텍스트를 활용하여 상세 커리큘럼 생성
```

---

## 참고

- [V5 API 명세서](../v5/API_SPECIFICATION_V5.md)
- [프론트엔드 통합 가이드](../v5/FRONTEND_INTEGRATION_GUIDE.md)
