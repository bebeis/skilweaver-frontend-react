# SkillWeaver API 명세서

## 변경 이력

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
    "style": "PROJECT_BASED",
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
      "style": "PROJECT_BASED",
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
      "style": "PROJECT_BASED",
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
    "style": "DOC_FIRST",
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
- `category` (optional): LANGUAGE, FRAMEWORK, LIBRARY, TOOL, DB, PLATFORM, ETC
- `level` (optional): BEGINNER, INTERMEDIATE, ADVANCED

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "skills": [
      {
        "memberSkillId": 1,
        "technologyId": 10,
        "technologyKey": "java",
        "displayName": "Java",
        "customName": null,
        "level": "ADVANCED",
        "yearsOfUse": 2.5,
        "lastUsedAt": "2025-11-20",
        "note": "주로 Spring Boot 개발에 사용"
      },
      {
        "memberSkillId": 2,
        "technologyId": null,
        "technologyKey": null,
        "displayName": null,
        "customName": "MyCustomLib",
        "level": "BEGINNER",
        "yearsOfUse": 0.3,
        "lastUsedAt": "2025-11-24",
        "note": "사이드 프로젝트에서 사용 중"
      }
    ],
    "totalCount": 2
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
  "technologyId": 10,
  "customName": null,
  "level": "INTERMEDIATE",
  "yearsOfUse": 1.5,
  "lastUsedAt": "2025-11-24",
  "note": "주로 백엔드 개발에 사용"
}
```

> `technologyId` 또는 `customName` 중 하나는 반드시 값이 있어야 한다. 정규화된 기술을 참조하려면 `technologyId` 를, 커스텀 기술을 기록하려면 `customName` 을 사용하며 두 값이 모두 존재하는 것도 허용된다.

**Response (201 Created)**
```json
{
  "success": true,
  "data": {
    "memberSkillId": 3,
    "technologyId": 10,
    "technologyKey": "spring-boot",
    "displayName": "Spring Boot",
    "level": "INTERMEDIATE",
    "yearsOfUse": 1.5,
    "lastUsedAt": "2025-11-24",
    "note": "주로 백엔드 개발에 사용"
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

## 4. 기술 카탈로그 API

### 4.1. 기술 목록 조회

```http
GET /api/v1/technologies
```

**Query Parameters**
- `category` (optional): LANGUAGE, FRAMEWORK, LIBRARY, TOOL, DB, PLATFORM, ETC
- `ecosystem` (optional): JVM, JavaScript, Python, etc.
- `active` (optional): true/false
- `page` (optional, default: 0)
- `size` (optional, default: 20)
- `search` (optional): 검색 키워드

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "technologies": [
      {
        "technologyId": 1,
        "key": "spring-boot",
        "displayName": "Spring Boot",
        "category": "FRAMEWORK",
        "ecosystem": "JVM",
        "officialSite": "https://spring.io/projects/spring-boot",
        "active": true
      }
    ],
    "pagination": {
      "page": 0,
      "size": 20,
      "totalElements": 150,
      "totalPages": 8
    }
  }
}
```

### 4.2. 기술 상세 조회

```http
GET /api/v1/technologies/{technologyId}
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "technologyId": 1,
    "key": "spring-boot",
    "displayName": "Spring Boot",
    "category": "FRAMEWORK",
    "ecosystem": "JVM",
    "officialSite": "https://spring.io/projects/spring-boot",
    "active": true,
    "knowledge": {
      "summary": "Spring Boot는 Spring 기반 애플리케이션을 빠르고 쉽게 개발할 수 있도록 도와주는 프레임워크입니다.",
      "learningTips": "공식 문서와 예제 프로젝트를 따라하며 학습하는 것이 효과적입니다.",
      "sourceType": "COMMUNITY"
    },
    "prerequisites": [
      {
        "prerequisiteKey": "java",
        "displayName": "Java"
      },
      {
        "prerequisiteKey": "spring-framework",
        "displayName": "Spring Framework"
      }
    ],
    "useCases": [
      "REST API 서버 개발",
      "마이크로서비스 아키텍처",
      "엔터프라이즈 웹 애플리케이션"
    ]
  }
}
```

### 4.3. 기술 생성 (관리자)

```http
POST /api/v1/technologies
```

**Request Body**
```json
{
  "key": "kotlin",
  "displayName": "Kotlin",
  "category": "LANGUAGE",
  "ecosystem": "JVM",
  "officialSite": "https://kotlinlang.org"
}
```

**Response (201 Created)**

### 4.4. 기술 수정 (관리자)

```http
PUT /api/v1/technologies/{technologyId}
```

**Response (200 OK)**

---

## 5. 기술 지식 베이스 API

### 5.1. 기술 지식 조회

```http
GET /api/v1/technologies/{technologyId}/knowledge
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "technologyKnowledgeId": 1,
    "technologyId": 1,
    "summary": "Spring Boot는...",
    "learningTips": "1. 공식 문서 읽기\n2. 토이 프로젝트 만들기",
    "prerequisites": [
      {
        "prerequisiteKey": "java",
        "displayName": "Java",
        "reason": "Spring Boot는 Java 기반 프레임워크입니다"
      }
    ],
    "useCases": [
      "REST API 서버 개발",
      "마이크로서비스 아키텍처"
    ],
    "sourceType": "COMMUNITY",
    "updatedAt": "2025-11-20T10:00:00"
  }
}
```

### 5.2. 기술 지식 생성/수정

```http
PUT /api/v1/technologies/{technologyId}/knowledge
```

**Request Body**
```json
{
  "summary": "Spring Boot는 Spring 기반 애플리케이션을...",
  "learningTips": "1. 공식 가이드 따라하기\n2. 실습 프로젝트 구현하기",
  "sourceType": "COMMUNITY"
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "technologyKnowledgeId": 1,
    "createdAt": "2025-11-20T10:00:00",
    "updatedAt": "2025-11-24T16:00:00"
  },
  "message": "기술 지식이 수정되었습니다."
}
```

### 5.3. 선행 지식 추가

```http
POST /api/v1/technologies/{technologyId}/knowledge/prerequisites
```

**Request Body**
```json
{
  "prerequisiteKey": "java"
}
```

> `reason` 필드는 현재 버전에서는 지원하지 않으며, AI가 런타임에 설명을 생성합니다.

**Response (201 Created)**
```json
{
  "success": true,
  "data": {
    "technologyKnowledgeId": 1,
    "prerequisiteKey": "java",
    "displayName": "Java"
  },
  "message": "선행 지식이 추가되었습니다."
}
```

### 5.4. 사용 사례 추가

```http
POST /api/v1/technologies/{technologyId}/knowledge/use-cases
```

**Request Body**
```json
{
  "useCase": "배치 처리 시스템 개발"
}
```

**Response (201 Created)**
```json
{
  "success": true,
  "data": {
    "useCaseId": 1,
    "technologyKnowledgeId": 1,
    "useCase": "배치 처리 시스템 개발"
  },
  "message": "사용 사례가 추가되었습니다."
}
```

---

## 6. 기술 관계 그래프 API

### 6.1. 기술 관계 조회

```http
GET /api/v1/technologies/{technologyId}/relationships
```

**Query Parameters**
- `relationType` (optional): PREREQUISITE, NEXT_STEP, ALTERNATIVE

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "relationships": [
      {
        "techRelationshipId": 1,
        "fromTechnology": {
          "technologyId": 1,
          "key": "spring-boot",
          "displayName": "Spring Boot"
        },
        "toTechnology": {
          "technologyId": 15,
          "key": "spring-cloud",
          "displayName": "Spring Cloud"
        },
        "relationType": "NEXT_STEP",
        "weight": 4
      }
    ]
  }
}
```

### 6.2. 기술 관계 추가

```http
POST /api/v1/technologies/{technologyId}/relationships
```

**Request Body**
```json
{
  "toTechnologyId": 15,
  "relationType": "NEXT_STEP",
  "weight": 4
}
```

**Response (201 Created)**

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
    "motivation": "우테코 미션을 코틀린으로 구현하고 싶어서",
    "timeFrameWeeks": 4,
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
  "motivation": "우테코 미션을 코틀린으로 구현하고 싶어서",
  "timeFrameWeeks": 4,
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
    "backgroundAnalysis": {
      "existingRelevantSkills": ["Kotlin", "Java", "멀티스레딩 기초"],
      "missingPrerequisites": ["비동기 프로그래밍", "코루틴 개념"],
      "riskFactors": [
        "비동기 프로그래밍 경험이 없어 초반에 어려움이 있을 수 있습니다"
      ]
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
| 401 | UNAUTHORIZED | 인증 실패 |
| 403 | FORBIDDEN | 권한 없음 |
| 404 | NOT_FOUND | 리소스를 찾을 수 없음 |
| 409 | CONFLICT | 중복된 데이터 |
| 422 | UNPROCESSABLE_ENTITY | 유효성 검증 실패 |
| 500 | INTERNAL_SERVER_ERROR | 서버 내부 오류 |
| 503 | SERVICE_UNAVAILABLE | 서비스 일시 중단 |

## 주요 도메인 Enum

### TargetTrack
- `BACKEND`
- `FRONTEND`
- `FULLSTACK`
- `MOBILE`
- `DATA`

### ExperienceLevel
- `BEGINNER`
- `INTERMEDIATE`
- `ADVANCED`

### LearningStyle
- `DOC_FIRST`
- `VIDEO_FIRST`
- `PROJECT_BASED`

### SkillCategory
- `LANGUAGE`
- `FRAMEWORK`
- `LIBRARY`
- `TOOL`
- `DB`
- `PLATFORM`
- `ETC`

### SkillLevel
- `BEGINNER`
- `INTERMEDIATE`
- `ADVANCED`

### GoalPriority
- `LOW`
- `MEDIUM`
- `HIGH`

### GoalStatus
- `ACTIVE`
- `COMPLETED`
- `ABANDONED`

### LearningPlanStatus
- `ACTIVE`
- `COMPLETED`
- `ABANDONED`

### StepDifficulty
- `EASY`
- `MEDIUM`
- `HARD`

### AgentRunStatus
- `RUNNING`
- `COMPLETED`
- `FAILED`

### KnowledgeSource
- `COMMUNITY`
- `AI_IMPORTED`

### RelationType
- `PREREQUISITE`
- `NEXT_STEP`
- `ALTERNATIVE`

### ResourceType
- `DOC`
- `VIDEO`
- `BLOG`
- `COURSE`
- `REPO`

### EditStatus (v1.1)
- `PENDING`
- `APPROVED`
- `REJECTED`
