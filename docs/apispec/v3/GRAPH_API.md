# V3 Graph API 스펙

## 개요

GraphRAG 기반의 **빠르고 무료인** 기술 탐색 API입니다.
Agent API(LLM 기반)와 상호 보완적으로 동작합니다.

### 포지셔닝

| 구분 | Graph API (V3) | Agent API (기존) |
|------|----------------|------------------|
| **역할** | 네비게이션 (지도) | 가이드 투어 (계획) |
| **속도** | 실시간 (~10ms) | 스트리밍 (10s+) |
| **비용** | 무료 | 크레딧 소모 |
| **용도** | 탐색, 미리보기 | 상세 커리큘럼 생성 |

---

## API 엔드포인트

### 1. 기술 로드맵 조회

**GET** `/api/v1/graph/roadmap/{technology}`

특정 기술의 선수 지식과 후행 학습을 트리 구조로 반환합니다.

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

---

### 2. 학습 경로 탐색

**GET** `/api/v1/graph/path`

두 기술 간의 최단 학습 경로를 반환합니다.

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

**Response (404 Not Found)**
```json
{
  "success": false,
  "error": "NO_PATH_FOUND",
  "message": "Cannot find learning path from 'java' to 'mlops'"
}
```

---

### 3. 연관 기술 추천

**GET** `/api/v1/graph/recommendations/{technology}`

특정 기술과 함께 자주 사용되는 기술을 추천합니다.

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "technology": "react",
    "recommendations": [
      {"name": "nextjs", "displayName": "Next.js", "relation": "CONTAINS", "category": "FRAMEWORK"},
      {"name": "tailwind", "displayName": "Tailwind CSS", "relation": "USED_WITH", "category": "LIBRARY"},
      {"name": "zustand", "displayName": "Zustand", "relation": "USED_WITH", "category": "LIBRARY"}
    ]
  }
}
```

---

### 4. 갭 분석

**POST** `/api/v1/graph/gap-analysis`

사용자 보유 기술과 목표 기술 간의 Missing Link를 분석합니다.

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

---

## 에러 코드

| 코드 | HTTP Status | 설명 |
|------|-------------|------|
| TECH_NOT_FOUND | 404 | 기술이 그래프에 존재하지 않음 |
| NO_PATH_FOUND | 404 | 두 기술 간 경로 없음 |
| GRAPH_SERVICE_UNAVAILABLE | 503 | Neo4j 연결 실패 |

---

## 사용 시나리오

```
[탐색 단계 - Graph API]
1. 사용자가 "Spring Boot" 검색
2. /graph/roadmap/spring-boot 호출
3. 선수 지식 트리 시각화 (D3.js)

[결정 단계 - Agent API]
4. "학습 계획 생성" 버튼 클릭
5. /agent/learning-plan 호출 (LLM 기반)
```

---

## 기술 요구사항

- GraphRAG 활성화: `GRAPH_RAG_ENABLED=true`
- Neo4j 연결 필요
