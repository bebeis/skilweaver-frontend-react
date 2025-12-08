# V3 프론트엔드 개발 가이드 - Graph API 통합

## 개요

V3에서 추가된 **Graph API**를 프론트엔드에서 활용하는 방법을 안내합니다.
이 API는 LLM 없이 Neo4j 그래프 쿼리로 동작하므로 **실시간 응답**이 가능합니다.

---

## API 엔드포인트 요약

| 엔드포인트 | 메서드 | 용도 | 응답 시간 |
|-----------|--------|------|-----------|
| `/api/v1/graph/roadmap/{tech}` | GET | 기술 로드맵 조회 | ~10ms |
| `/api/v1/graph/path` | GET | 학습 경로 탐색 | ~10ms |
| `/api/v1/graph/recommendations/{tech}` | GET | 연관 기술 추천 | ~10ms |
| `/api/v1/graph/gap-analysis` | POST | 갭 분석 | ~10ms |

---

## 사용 시나리오

### 권장 UX 플로우

```
[1. 탐색 단계 - Graph API 사용]
   사용자: "Spring Boot" 검색
   → /graph/roadmap/spring-boot 호출
   → 선수 지식 트리 시각화 (D3.js / React Flow)
   → 사용자: "아, Java를 먼저 알아야 하는구나"

[2. 결정 단계 - Agent API 사용]
   사용자: "학습 계획 생성" 버튼 클릭
   → /agent/learning-plan 호출 (기존 API, LLM 기반)
   → 상세 커리큘럼 생성 (챕터, 시간 예측)
```

### Graph API vs Agent API 사용 기준

| 상황 | 사용할 API |
|------|-----------|
| "이 기술 배우려면 뭐 알아야 해?" | Graph API (무료, 즉시) |
| "내 수준에 맞는 커리큘럼 만들어줘" | Agent API (크레딧, 스트리밍) |
| "React랑 같이 쓰기 좋은 거 추천" | Graph API |
| "내가 아는 거 기반으로 부족한 거 뭐야?" | Graph API |

---

## 코드 예시

### 1. 기술 로드맵 조회

```typescript
// api/graph.ts
export const fetchRoadmap = (technology: string) =>
  fetch(`/api/v1/graph/roadmap/${technology}`)
    .then(res => res.json());

// 사용 예시
const roadmap = await fetchRoadmap('spring-boot');
console.log(roadmap.data.prerequisites.required);
// [{ name: "java", displayName: "Java", ... }]
```

### 2. 학습 경로 탐색

```typescript
export const fetchLearningPath = (from: string, to: string) =>
  fetch(`/api/v1/graph/path?from=${from}&to=${to}`)
    .then(res => res.json());

// 사용 예시
const path = await fetchLearningPath('java', 'mlops');
console.log(path.data.path);
// [{ step: 1, technology: "python-data", relation: "RECOMMENDED_AFTER" }, ...]
```

### 3. 연관 기술 추천

```typescript
export const fetchRecommendations = (technology: string) =>
  fetch(`/api/v1/graph/recommendations/${technology}`)
    .then(res => res.json());

// 사용 예시
const recs = await fetchRecommendations('react');
console.log(recs.data.recommendations);
// [{ name: "nextjs", displayName: "Next.js", ... }]
```

### 4. 갭 분석

```typescript
export const analyzeGap = (known: string[], target: string) =>
  fetch('/api/v1/graph/gap-analysis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ knownTechnologies: known, targetTechnology: target })
  }).then(res => res.json());

// 사용 예시
const gap = await analyzeGap(['java', 'sql'], 'spring-boot');
console.log(gap.data.message);
// "모든 선행 지식을 갖추고 있습니다. spring-boot 학습을 시작할 수 있습니다."
```

---

## 시각화 권장 사항

### D3.js Force Graph

로드맵 데이터를 **인터랙티브 그래프**로 시각화:

```typescript
// nodes와 links 변환
const nodes = [
  { id: 'spring-boot', group: 'target' },
  ...roadmap.prerequisites.required.map(p => ({ id: p.name, group: 'required' })),
  ...roadmap.nextSteps.map(n => ({ id: n.name, group: 'next' }))
];

const links = [
  ...roadmap.prerequisites.required.map(p => ({ source: p.name, target: 'spring-boot' })),
  ...roadmap.nextSteps.map(n => ({ source: 'spring-boot', target: n.name }))
];
```

### React Flow

경로 탐색 결과를 **플로우 다이어그램**으로 표시:

```typescript
const nodes = path.map((step, i) => ({
  id: step.technology,
  position: { x: i * 200, y: 100 },
  data: { label: step.technology }
}));

const edges = path.slice(0, -1).map((step, i) => ({
  id: `e${i}`,
  source: step.technology,
  target: path[i + 1].technology,
  label: step.relation
}));
```

---

## 에러 처리

```typescript
const result = await fetchLearningPath('java', 'unknown-tech');

if (!result.success) {
  switch (result.error) {
    case 'TECH_NOT_FOUND':
      showToast('해당 기술을 찾을 수 없습니다.');
      break;
    case 'NO_PATH_FOUND':
      showToast('두 기술 간 학습 경로가 없습니다.');
      break;
    case 'GRAPH_SERVICE_UNAVAILABLE':
      showToast('서비스가 일시적으로 불가합니다.');
      break;
  }
}
```

---

## 환경별 API 엔드포인트

| 환경 | Base URL |
|------|----------|
| 로컬 개발 | `http://localhost:8080` |
| 스테이징 | `https://api.staging.skillweaver.com` |
| 프로덕션 | `https://api.skillweaver.com` |

---

## 주의사항

1. **GraphRAG 활성화 필요**: 백엔드에서 `GRAPH_RAG_ENABLED=true` 설정 필요
2. **Neo4j 연결**: 그래프 데이터가 로딩된 Neo4j 인스턴스 필요
3. **캐싱 권장**: 로드맵 데이터는 자주 변하지 않으므로 클라이언트 캐싱 권장
