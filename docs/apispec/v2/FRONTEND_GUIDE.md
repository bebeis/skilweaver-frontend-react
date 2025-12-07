# SkillWeaver API v2 - 프론트엔드 구현 가이드

## 개요

백엔드 v2 업데이트가 완료되었습니다. 프론트엔드에서 구현이 필요한 변경사항을 정리했습니다.

---

## 1. Technology API 확장 (필수 구현)

### 변경된 API

#### GET /api/v1/technologies/{technologyId}

**응답에 추가된 필드:**

```typescript
interface TechnologyDetailResponse {
  // 기존 필드들...
  technologyId: number;
  key: string;
  displayName: string;
  category: string;
  // ...
  
  // v2 신규 필드 (모두 nullable)
  learningRoadmap?: string;           // 학습 로드맵 설명
  estimatedLearningHours?: number;    // 예상 학습 시간
  relatedTechnologies: string[];      // 관련 기술 key 배열
  communityPopularity?: number;       // 1-10
  jobMarketDemand?: number;          // 1-10
}
```

**프론트엔드 구현 필요:**
- ✅ 기술 상세 페이지에 신규 필드 표시
  - 학습 로드맵 섹션
  - 예상 학습 시간 배지
  - 관련 기술 태그/링크
  - 인기도/수요 시각화 (별점, 프로그레스 바 등)

---

#### POST /api/v1/technologies (관리자 전용)

**요청 Body 확장:**

```typescript
interface CreateTechnologyRequest {
  // 필수
  key: string;
  displayName: string;
  category: TechnologyCategory;
  
  // 선택
  ecosystem?: string;
  officialSite?: string;
  
  // v2 신규 (모두 선택)
  learningRoadmap?: string;
  estimatedLearningHours?: number;
  prerequisites?: string[];           // 다른 Technology의 key
  relatedTechnologies?: string[];     // 다른 Technology의 key
  communityPopularity?: number;       // 1-10
  jobMarketDemand?: number;          // 1-10
}
```

**프론트엔드 구현 필요:**
- ✅ 관리자 페이지: 기술 등록 폼에 신규 필드 추가
  - 학습 로드맵 textarea
  - 예상 학습 시간 number input
  - 선행 지식 multi-select (Technology 목록에서 선택)
  - 관련 기술 multi-select
  - 인기도/수요 slider (1-10)

---

#### PUT /api/v1/technologies/{technologyId} (관리자 전용)

**요청 Body에 신규 필드 추가 (모두 선택적 수정 가능)**

**프론트엔드 구현 필요:**
- ✅ 관리자 페이지: 기술 수정 폼에 신규 필드 추가

---

## 2. 피드백 시스템 API (신규 기능)

### 신규 API 3개

#### POST /api/v1/feedback

**요청:**
```typescript
interface SubmitFeedbackRequest {
  learningPlanId: number;    // 필수
  stepId?: number;           // 선택 (특정 스텝 피드백)
  rating: number;            // 1-5 필수
  feedbackType: FeedbackType; // 필수
  comment?: string;          // 선택
}

enum FeedbackType {
  HELPFUL = 'HELPFUL',
  TOO_EASY = 'TOO_EASY',
  TOO_HARD = 'TOO_HARD',
  IRRELEVANT = 'IRRELEVANT',
  TIME_ISSUE = 'TIME_ISSUE',
  RESOURCE_ISSUE = 'RESOURCE_ISSUE',
  GENERAL = 'GENERAL'
}
```

**프론트엔드 구현 필요:**
- ✅ 학습 계획 상세 페이지에 "피드백 남기기" 버튼
- ✅ 피드백 모달/폼
  - 별점 (1-5)
  - 피드백 유형 선택 (라디오 또는 드롭다운)
  - 코멘트 textarea (선택)
  - 특정 스텝에 대한 피드백인 경우 스텝 선택

---

#### GET /api/v1/feedback/plans/{planId}

**응답:**
```typescript
interface FeedbackListResponse {
  success: true;
  data: Feedback[];
}

interface Feedback {
  id: number;
  learningPlanId: number;
  stepId?: number;
  rating: number;
  feedbackType: FeedbackType;
  comment?: string;
}
```

**프론트엔드 구현 필요:**
- ✅ 학습 계획 상세 페이지에 "피드백 목록" 섹션
  - 전체 계획 피드백
  - 각 스텝별 피드백 그룹화

---

#### GET /api/v1/feedback/plans/{planId}/summary

**응답:**
```typescript
interface FeedbackSummaryResponse {
  planId: number;
  averageRating: number;           // 평균 평점
  totalFeedbackCount: number;
  typeBreakdown: {                 // 유형별 개수
    HELPFUL: number;
    TOO_HARD: number;
    // ...
  };
}
```

**프론트엔드 구현 필요:**
- ✅ 학습 계획 상세 페이지 상단에 요약 통계 표시
  - 평균 평점 (별점)
  - 총 피드백 수
  - 피드백 유형별 차트 (파이 차트, 바 차트 등)

---

## 3. 내부 개선 (구현 불필요, 안내만)

### Phase 1-2, 5: RAG 및 Multi-Agent 통합

**변경 없음 - 기존 API 그대로 사용**

- Agent 커리큘럼 생성 API는 동일하게 호출
- 단, **커리큘럼 품질이 향상**되었으므로:
  - 더 정확한 학습 시간 예측
  - 더 적절한 리소스 추천
  - 최신 기술 트렌드 반영

**프론트엔드 액션:**
- ✅ UI/UX 개선 검토
  - Agent 생성 커리큘럼의 품질이 높아졌으므로 더 신뢰할 수 있다는 메시지
  - "AI 추천" 배지 또는 아이콘 강조

---

## 4. 구현 우선순위

### 🔴 높음 (필수)
1. **Technology 상세 페이지** - 신규 필드 표시
2. **피드백 제출 기능** - POST /api/v1/feedback

### 🟡 중간 (권장)
3. **피드백 목록/요약 표시** - 학습 계획 페이지
4. **관리자 페이지** - Technology 등록/수정 폼 확장

### 🟢 낮음 (선택)
5. 관련 기술 추천 UI 개선
6. 인기도/수요 기반 정렬/필터링

---

## 5. TypeScript 타입 정의

```typescript
// Technology v2
interface TechnologyDetailResponse {
  technologyId: number;
  key: string;
  displayName: string;
  category: TechnologyCategory;
  ecosystem?: string;
  officialSite?: string;
  active: boolean;
  knowledge?: TechnologyKnowledge;
  prerequisites: Prerequisite[];
  useCases: string[];
  
  // v2 신규
  learningRoadmap?: string;
  estimatedLearningHours?: number;
  relatedTechnologies: string[];
  communityPopularity?: number;    // 1-10
  jobMarketDemand?: number;        // 1-10
}

// Feedback
enum FeedbackType {
  HELPFUL = 'HELPFUL',
  TOO_EASY = 'TOO_EASY',
  TOO_HARD = 'TOO_HARD',
  IRRELEVANT = 'IRRELEVANT',
  TIME_ISSUE = 'TIME_ISSUE',
  RESOURCE_ISSUE = 'RESOURCE_ISSUE',
  GENERAL = 'GENERAL'
}

interface SubmitFeedbackRequest {
  learningPlanId: number;
  stepId?: number;
  rating: number;              // 1-5
  feedbackType: FeedbackType;
  comment?: string;
}

interface FeedbackSummary {
  planId: number;
  averageRating: number;
  totalFeedbackCount: number;
  typeBreakdown: Record<FeedbackType, number>;
}
```

---

## 6. 테스트 가이드

### Technology API
```bash
# 기술 상세 조회
GET /api/v1/technologies/1
# → learningRoadmap, estimatedLearningHours 등 확인

# 기술 생성 (관리자)
POST /api/v1/technologies
{
  "key": "test-tech",
  "displayName": "Test Technology",
  "category": "LANGUAGE",
  "estimatedLearningHours": 30,
  "communityPopularity": 7
}
```

### Feedback API
```bash
# 피드백 제출
POST /api/v1/feedback
{
  "learningPlanId": 100,
  "rating": 5,
  "feedbackType": "HELPFUL",
  "comment": "매우 도움이 되었습니다"
}

# 피드백 요약 조회
GET /api/v1/feedback/plans/100/summary
```

---

## 7. 참고 문서

- `docs/apispec/v2/API_SPECIFICATION_V2.md` - 전체 API 명세
- `docs/apispec/v2/v2_changes.md` - v2 변경사항 상세
- `docs/ddl/v2/ddl.sql` - 데이터베이스 스키마
