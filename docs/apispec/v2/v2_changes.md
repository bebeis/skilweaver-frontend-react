# SkillWeaver API v2 변경사항

## v2.0 (2025-12-07)

### 주요 변경사항

1. **Phase 3: RAG 시스템 도입** (내부 구현, API 변경 없음)
   - Knowledge Base 관리는 내부 서비스로 구현
   - `KnowledgeIngestionService`, `KnowledgeSearchTool` 추가
   - `NewTechLearningAgent`가 RAG 컨텍스트를 활용하여 더 정확한 커리큘럼 생성

2. **Phase 4: 피드백 시스템 신규 API** ⭐
   - `POST /api/v1/feedback` - 피드백 제출
   - `GET /api/v1/feedback/plans/{planId}` - 계획별 피드백 조회
   - `GET /api/v1/feedback/plans/{planId}/summary` - 피드백 요약

3. **Phase 5: Multi-Agent 시스템** (내부 구현, API 변경 없음)
   - `TechResearchAgent` - 기술 동향 조사
   - `ResourceCuratorAgent` - 학습 자료 큐레이션
   - `NewTechLearningAgent`의 정확도 및 리소스 품질 향상

4. **신규 Enum 타입**
   - `FeedbackType`: 7가지 피드백 유형
   - `KnowledgeType`: 6가지 지식 문서 유형 (내부 사용)

---

## 피드백 API 상세

### POST /api/v1/feedback

**설명**: 학습 계획 또는 특정 스텝에 대한 피드백 제출

**요청 Body**:
```json
{
  "learningPlanId": 100,
  "stepId": 1,
  "rating": 4,
  "feedbackType": "HELPFUL",
  "comment": "이 단계가 매우 도움이 되었습니다"
}
```

**필드 설명**:

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| learningPlanId | Long | O | 학습 계획 ID |
| stepId | Long | X | 특정 스텝 ID (null이면 전체 계획 피드백) |
| rating | Integer | O | 평점 (1-5) |
| feedbackType | FeedbackType | O | 피드백 유형 |
| comment | String | X | 추가 코멘트 (최대 1000자) |

**응답 (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "learningPlanId": 100,
    "stepId": 1,
    "rating": 4,
    "feedbackType": "HELPFUL",
    "comment": "이 단계가 매우 도움이 되었습니다"
  },
  "message": "Feedback submitted successfully"
}
```

---

### GET /api/v1/feedback/plans/{planId}

**설명**: 특정 학습 계획에 대한 모든 피드백 조회

**URL Parameters**:
- `planId`: 학습 계획 ID

**응답 (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "learningPlanId": 100,
      "stepId": null,
      "rating": 5,
      "feedbackType": "HELPFUL",
      "comment": "전체적으로 좋았습니다"
    },
    {
      "id": 2,
      "learningPlanId": 100,
      "stepId": 1,
      "rating": 3,
      "feedbackType": "TOO_HARD",
      "comment": "이 단계가 조금 어려웠습니다"
    }
  ]
}
```

---

### GET /api/v1/feedback/plans/{planId}/summary

**설명**: 학습 계획의 피드백 통계 요약

**URL Parameters**:
- `planId`: 학습 계획 ID

**응답 (200 OK)**:
```json
{
  "success": true,
  "data": {
    "planId": 100,
    "averageRating": 4.2,
    "totalFeedbackCount": 5,
    "typeBreakdown": {
      "HELPFUL": 3,
      "TOO_HARD": 1,
      "TOO_EASY": 0,
      "IRRELEVANT": 0,
      "TIME_ISSUE": 1,
      "RESOURCE_ISSUE": 0,
      "GENERAL": 0
    }
  }
}
```

---

## 신규 Enum 정의

### FeedbackType

```
HELPFUL         // 도움이 됨
TOO_EASY        // 너무 쉬움 (난이도 조정 필요)
TOO_HARD        // 너무 어려움 (선행 지식 보강 필요)
IRRELEVANT      // 관련 없는 내용 (추천 품질 문제)
TIME_ISSUE      // 시간 예측 부정확
RESOURCE_ISSUE  // 리소스 품질 문제
GENERAL         // 일반 피드백
```

**사용 예시**:
- 학습 완료 후 전체 평가: `HELPFUL`, `GENERAL`
- 난이도 피드백: `TOO_EASY`, `TOO_HARD`
- 시간 예측 피드백: `TIME_ISSUE`
- 리소스 품질 피드백: `RESOURCE_ISSUE`, `IRRELEVANT`

### KnowledgeType (내부 사용, API에 노출되지 않음)

```
ROADMAP             // 학습 로드맵
BEST_PRACTICE       // 베스트 프랙티스
COMMUNITY_INSIGHT   // 커뮤니티 인사이트
OFFICIAL_DOC        // 공식 문서
TUTORIAL            // 튜토리얼
CASE_STUDY          // 성공 사례
```

---

## 피드백 API 사용 시나리오

### 시나리오 1: 학습 완료 후 전체 평가
```http
POST /api/v1/feedback
{
  "learningPlanId": 100,
  "stepId": null,
  "rating": 4,
  "feedbackType": "HELPFUL",
  "comment": "전반적으로 좋았지만 시간이 조금 부족했어요"
}
```

### 시나리오 2: 특정 스텝이 너무 어려움
```http
POST /api/v1/feedback
{
  "learningPlanId": 100,
  "stepId": 3,
  "rating": 2,
  "feedbackType": "TOO_HARD",
  "comment": "Coroutine Scope 개념이 어려웠습니다"
}
```

### 시나리오 3: 시간 예측 피드백
```http
POST /api/v1/feedback
{
  "learningPlanId": 100,
  "stepId": 2,
  "rating": 3,
  "feedbackType": "TIME_ISSUE",
  "comment": "10시간 예상이었는데 실제로는 15시간 걸렸어요"
}
```

### 시나리오 4: 리소스 품질 문제
```http
POST /api/v1/feedback
{
  "learningPlanId": 100,
  "stepId": 4,
  "rating": 2,
  "feedbackType": "RESOURCE_ISSUE",
  "comment": "추천 링크가 404 에러입니다"
}
```

---

## v1 API 유지

v1.3의 모든 API는 그대로 유지됩니다:
- 회원 관리 API
- 기술 관리 API
- 학습 목표 API
- 학습 계획 API
- Agent 실행 API (SSE 스트리밍 포함)

자세한 내용은 `API_SPECIFICATION_V2.md` 본문 참조.



---

## Phase 5 완성: Multi-Agent Orchestrator 통합

### NewTechLearningAgent 개선 (내부 변경, API 영향 없음)

Phase 5의 Orchestrator 통합이 완료되어 `NewTechLearningAgent`가 이제 전문 Agent들을 활용합니다:

**활용되는 전문 Agent:**
1. **TechResearchAgent** - 최신 기술 동향 조사
   - 현재 버전, 트렌드, 주의사항 수집
   - Agent가 생성하는 커리큘럼의 정확도 향상

2. **ResourceCuratorAgent** - 학습 자료 큐레이션
   - 공식 문서, 비디오 강의, 실습 자료 선별
   - 학습자 레벨에 맞는 리소스 추천

**적용된 메서드:**
- `generateQuickCurriculum()` - Quick 경로
- `generateStandardCurriculum()` - Standard 경로
- `generateDetailedCurriculum()` - Detailed 경로

**효과:**
- 더 정확한 버전 정보 반영
- 품질 높은 학습 리소스 추천
- 최신 트렌드 기반 커리큘럼

**기술 스택:**
- Embabel Agent Platform을 통한 Multi-Agent 협업
- Spring AI의 Tool 인터페이스 활용
- Web Search, GitHub, YouTube 툴 통합



---

## Technology API 개선 (Phase 3 완성)

### 학습 메타데이터 필드 추가

Technology API에 Phase 3에서 추가된 학습 메타데이터 필드가 반영되었습니다.

#### GET /api/v1/technologies/{technologyId}

**응답에 추가된 필드:**

```json
{
  "success": true,
  "data": {
    "technologyId": 1,
    "key": "kotlin",
    "displayName": "Kotlin",
    // ... 기존 필드들
    
    // Phase 3: 학습 메타데이터
    "learningRoadmap": "1. 기본 문법 2. 객체지향 3. 함수형 ...",
    "estimatedLearningHours": 40,
    "relatedTechnologies": ["java", "spring-boot", "android"],
    "communityPopularity": 8,
    "jobMarketDemand": 9
  }
}
```

**필드 설명:**

| 필드 | 타입 | 설명 |
|------|------|------|
| learningRoadmap | String? | 학습 로드맵 설명 (TEXT) |
| estimatedLearningHours | Int? | 예상 학습 시간 |
| relatedTechnologies | List\<String\> | 관련 기술 목록 (key 리스트) |
| communityPopularity | Int? | 커뮤니티 인기도 (1-10) |
| jobMarketDemand | Int? | 취업 시장 수요 (1-10) |

#### POST /api/v1/technologies

**요청 Body에 추가된 필드:**

```json
{
  "key": "kotlin",
  "displayName": "Kotlin",
  "category": "LANGUAGE",
  "ecosystem": "JVM",
  "officialSite": "https://kotlinlang.org",
  
  // Phase 3: 학습 메타데이터 (모두 optional)
  "learningRoadmap": "1단계: 기본 문법... 2단계: 객체지향...",
  "estimatedLearningHours": 40,
  "prerequisites": ["java", "object-oriented-programming"],
  "relatedTechnologies": ["java", "spring-boot"],
  "communityPopularity": 8,
  "jobMarketDemand": 9
}
```

**참고:**
- `prerequisites`와 `relatedTechnologies`는 다른 Technology의 `key` 값입니다
- `communityPopularity`, `jobMarketDemand`는 1-10 범위 권장

#### PUT /api/v1/technologies/{technologyId}

**요청 Body 업데이트:**

기존 필드와 함께 학습 메타데이터도 선택적으로 업데이트 가능합니다.

```json
{
  "displayName": "Kotlin Programming Language",
  "estimatedLearningHours": 50,
  "communityPopularity": 9
}
```

---

### 활용 시나리오

**시나리오 1: Agent가 Technology 조회 시**
```
NewTechLearningAgent가 커리큘럼 생성 시 Technology API를 호출하면:
→ estimatedLearningHours를 참고하여 학습 시간 예측 정확도 향상
→ prerequisites를 Gap Analysis에 활용
→ relatedTechnologies로 관련 기술 추천
```

**시나리오 2: 관리자가 인기 기술 등록**
```
POST /api/v1/technologies
{
  "key": "nextjs",
  "displayName": "Next.js",
  "category": "FRAMEWORK",
  "ecosystem": "JavaScript",
  "estimatedLearningHours": 30,
  "prerequisites": ["react", "javascript"],
  "communityPopularity": 9,
  "jobMarketDemand": 10
}
```

