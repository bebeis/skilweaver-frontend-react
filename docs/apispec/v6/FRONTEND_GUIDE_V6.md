# V6 Hybrid RAG - 프론트엔드 통합 가이드

> **버전**: v6.0 | **작성일**: 2025-12-19

## 📌 V6 변경 요약

V6에서 **Hybrid RAG** 검색 API 3개가 추가되었습니다. 기존 API는 모두 그대로 동작합니다.

| 신규 API | 설명 |
|----------|------|
| `POST /api/v1/search/hybrid` | 통합 검색 (경로 + 문서) |
| `GET /api/v1/search/learning-path/{tech}` | 학습 경로 + 문서 조회 |
| `POST /api/v1/search/gap-analysis` | Gap 분석 + 리소스 추천 |

---

## 1️⃣ Hybrid 검색 API

### 요청

```typescript
// POST /api/v1/search/hybrid
interface HybridSearchRequest {
  query: string;              // "React Native 배우려면?"
  targetTechnology?: string;  // "react-native" (없으면 쿼리에서 추출)
  maxGraphDepth?: number;     // default: 2
  maxVectorResults?: number;  // default: 5
  includeDocuments?: boolean; // default: true
}
```

### 응답

```typescript
interface HybridSearchResponse {
  success: true;
  data: {
    query: string;
    targetTechnology: TechSummary;
    learningPath: LearningPathStep[];   // 학습 경로
    relatedTechnologies: TechRelation[]; // 연관 기술
    summary: string;                     // "JavaScript → React → React Native 순서로..."
    estimatedTotalHours: number;
    metadata: {
      graphNodesTraversed: number;
      vectorDocumentsSearched: number;
      processingTimeMs: number;
    };
  };
}

interface LearningPathStep {
  step: number;
  technology: TechSummary;
  relation: "DEPENDS_ON" | "TARGET";
  distance: number;           // 0 = 목표, 1 = 바로 전 단계...
  documents: DocumentResult[];
}

interface DocumentResult {
  type: string;     // "ROADMAP", "BEST_PRACTICE"
  content: string;
  source: string;
  relevanceScore: number;
}
```

### 사용 예시

```javascript
const searchHybrid = async (query, targetTech) => {
  const res = await fetch('/api/v1/search/hybrid', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: query,
      targetTechnology: targetTech,
      includeDocuments: true
    })
  });
  return res.json();
};

// 사용
const result = await searchHybrid("Kotlin 코루틴 배우려면?", "kotlin-coroutines");
console.log(result.data.learningPath);
// → [{ step: 1, technology: { name: "kotlin" }, documents: [...] }, ...]
```

---

## 2️⃣ 학습 경로 + 문서 조회

### 요청

```
GET /api/v1/search/learning-path/{technology}
```

### 응답

```typescript
interface LearningPathWithDocs {
  technology: string;
  displayName: string;
  prerequisites: {
    required: TechWithDocs[];
    recommended: TechWithDocs[];
  };
  nextSteps: TechWithDocs[];
  targetDocuments: DocumentResult[];
}

interface TechWithDocs {
  name: string;
  displayName: string;
  category: string;
  difficulty: string;
  documents: DocumentResult[];
}
```

### 사용 예시

```javascript
const getLearningPath = async (tech) => {
  const res = await fetch(`/api/v1/search/learning-path/${tech}`);
  return res.json();
};

// 사용
const path = await getLearningPath("spring-boot");
console.log(path.data.prerequisites.required);
// → [{ name: "java", documents: [...] }]
```

---

## 3️⃣ Gap 분석 + 리소스 추천

### 요청

```typescript
// POST /api/v1/search/gap-analysis
interface GapAnalysisRequest {
  known: string[];   // ["java", "sql"]
  target: string;    // "spring-boot"
}
```

### 응답

```typescript
interface GapAnalysisWithResources {
  target: string;
  known: string[];
  missing: MissingTech[];
  ready: boolean;           // 바로 학습 가능 여부
  readinessScore: number;   // 0.0 ~ 1.0
  message: string;
}

interface MissingTech {
  name: string;
  displayName: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  recommendedResources: Resource[];
}

interface Resource {
  type: string;
  title: string;
  estimatedHours: number | null;
}
```

### 사용 예시

```javascript
const analyzeGap = async (mySkills, targetTech) => {
  const res = await fetch('/api/v1/search/gap-analysis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      known: mySkills,
      target: targetTech
    })
  });
  return res.json();
};

// 사용
const gap = await analyzeGap(["python"], "spring-boot");
if (!gap.data.ready) {
  console.log("먼저 배워야 할 것:", gap.data.missing);
  // → [{ name: "java", priority: "HIGH", recommendedResources: [...] }]
}
```

---

## 🎨 UI 활용 제안

### 1. 통합 검색 페이지
```
[검색창: "React Native 배우려면?"]
         ↓
┌──────────────────────────────────────┐
│ 📍 학습 경로                           │
│ JavaScript → React → React Native    │
│                                      │
│ 📚 단계별 추천 자료                     │
│ ├─ JavaScript: MDN 가이드, 유튜브 강의   │
│ ├─ React: 공식 문서, 실습 프로젝트       │
│ └─ React Native: Expo 튜토리얼         │
└──────────────────────────────────────┘
```

### 2. 스킬 Gap 대시보드
```
┌─────────────────────────────────────────┐
│ 🎯 목표: Spring Boot                     │
│ 📊 준비도: 30%  ████░░░░░░              │
│                                         │
│ ❌ 부족한 기술                            │
│ ┌─────────────────────────────────────┐ │
│ │ Java (HIGH)                         │ │
│ │ └─ 추천: Java 기초 강의 (60h)         │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ✅ 보유 기술: python, sql                │
└─────────────────────────────────────────┘
```

---

## ⚠️ 에러 처리

```typescript
// 404: 기술을 찾을 수 없음
{
  "success": false,
  "message": "Technology 'unknown' not found",
  "errorCode": "TECHNOLOGY_NOT_FOUND"
}

// 400: 쿼리에서 기술 추출 실패
{
  "success": false,
  "message": "Could not extract technology from query",
  "errorCode": "INVALID_REQUEST"
}
```

---

## 📎 참고 문서

- [V6 API 전체 명세](./API_SPECIFICATION_V6.md)
- [V5 프론트엔드 가이드](../v5/FRONTEND_INTEGRATION_GUIDE.md)
