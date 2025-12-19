# Hybrid Graph RAG v6 Specification

## 개요

v6에서는 기존의 분리된 Vector RAG (Qdrant)와 Graph RAG (Neo4j)를 **Hybrid RAG**로 통합합니다.

### 핵심 개념

```
┌─────────────────────────────────────────────────────────────┐
│                    Hybrid RAG Architecture                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   [사용자 쿼리]                                               │
│        │                                                     │
│        ▼                                                     │
│   ┌─────────────────────────────────────┐                   │
│   │  1. Entity Extraction               │                   │
│   │  - 쿼리에서 기술명 추출                │                   │
│   │  - 예: "React Native" → "react-native"│                   │
│   └────────────────┬────────────────────┘                   │
│                    ▼                                         │
│   ┌─────────────────────────────────────┐                   │
│   │  2. Graph Traversal (Neo4j)          │                   │
│   │  - 기술 노드 탐색                     │                   │
│   │  - 선행 지식 관계 추출                 │                   │
│   │  - 연관 기술 수집                     │                   │
│   └────────────────┬────────────────────┘                   │
│                    │ 관련 기술 목록                           │
│                    ▼                                         │
│   ┌─────────────────────────────────────┐                   │
│   │  3. Vector Search (Qdrant)           │                   │
│   │  - 각 기술별 문서 검색                 │                   │
│   │  - 유사도 기반 랭킹                   │                   │
│   └────────────────┬────────────────────┘                   │
│                    ▼                                         │
│   ┌─────────────────────────────────────┐                   │
│   │  4. Context Fusion                   │                   │
│   │  - 그래프 거리 기반 중요도 가중치       │                   │
│   │  - 통합 컨텍스트 구성                  │                   │
│   └────────────────┬────────────────────┘                   │
│                    ▼                                         │
│   ┌─────────────────────────────────────┐                   │
│   │  5. LLM Response Generation          │                   │
│   │  - 구조화된 컨텍스트 + 자연어 질문     │                   │
│   │  - 개인화된 학습 플랜 생성             │                   │
│   └─────────────────────────────────────┘                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## v6 변경사항 요약

> [!IMPORTANT]
> v6는 v5와 **완전 호환**됩니다. 기존 API는 그대로 동작하며, 새로운 Hybrid 기능이 추가됩니다.

### 신규 기능

| 구분 | 설명 |
|------|------|
| **HybridRagService** | Graph + Vector 통합 검색 서비스 |
| **Hybrid Search API** | `POST /api/v1/search/hybrid` |
| **개선된 학습 플랜** | Agent에서 Hybrid RAG 컨텍스트 사용 |
| **로드맵 API 확장** | 각 기술별 학습 문서 포함 |

### 변경 없음 (v5 호환)

- 모든 기존 API 엔드포인트
- 시드 데이터 구조
- Neo4j/Qdrant 스키마

---

## 신규 API

### POST /api/v1/search/hybrid

Hybrid RAG 기반 통합 검색 API. 그래프 관계와 벡터 유사도를 결합합니다.

#### Request Body

```json
{
  "query": "React Native 배우려면 뭘 먼저 해야 해?",
  "targetTechnology": "react-native",
  "maxGraphDepth": 2,
  "maxVectorResults": 5,
  "includeDocuments": true
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| query | String | O | 자연어 검색 쿼리 |
| targetTechnology | String | N | 목표 기술 (없으면 쿼리에서 추출) |
| maxGraphDepth | Int | N | 그래프 탐색 깊이 (default: 2) |
| maxVectorResults | Int | N | 기술당 최대 문서 수 (default: 5) |
| includeDocuments | Boolean | N | 문서 내용 포함 여부 (default: true) |

#### Response (200 OK)

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
            "content": "JavaScript 학습 로드맵...",
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
            "content": "React 학습 로드맵...",
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
            "content": "React Native 학습 로드맵...",
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
      }
    ],
    "summary": "React Native를 배우려면 JavaScript → React → React Native 순서로 학습하는 것이 효과적입니다.",
    "estimatedTotalHours": 120,
    "metadata": {
      "graphNodesTraversed": 5,
      "vectorDocumentsSearched": 12,
      "processingTimeMs": 245
    }
  }
}
```

---

## 개선된 기존 API

### GET /api/v1/technologies/{name}/roadmap

기존 응답에 각 기술별 **학습 문서**가 추가됩니다.

#### v5 Response (기존)

```json
{
  "prerequisites": {
    "required": [
      {"name": "java", "displayName": "Java", "category": "LANGUAGE"}
    ]
  },
  "nextSteps": [...]
}
```

#### v6 Response (확장)

```json
{
  "prerequisites": {
    "required": [
      {
        "name": "java",
        "displayName": "Java",
        "category": "LANGUAGE",
        "documents": [
          {
            "type": "ROADMAP",
            "content": "Java 학습 로드맵...",
            "estimatedHours": 40
          }
        ]
      }
    ]
  },
  "nextSteps": [...],
  "targetDocuments": [
    {
      "type": "ROADMAP",
      "content": "Spring Boot 학습 로드맵..."
    }
  ]
}
```

> [!NOTE]
> `documents` 필드는 v6에서 새로 추가됩니다. v5 클라이언트는 이 필드를 무시하면 됩니다.

---

### POST /api/v1/technologies/gap-analysis

Gap 분석 결과에 **각 누락 기술별 추천 학습 자료**가 추가됩니다.

#### v6 Response (확장)

```json
{
  "target": "spring-boot",
  "known": ["java", "sql"],
  "missing": [
    {
      "name": "spring-framework",
      "displayName": "Spring Framework",
      "priority": "HIGH",
      "recommendedResources": [
        {
          "type": "ROADMAP",
          "title": "Spring Framework 핵심 개념",
          "estimatedHours": 20
        }
      ]
    }
  ],
  "ready": false,
  "readinessScore": 0.5
}
```

---

## 내부 구현 변경

### HybridRagService (신규)

```kotlin
@Service
class HybridRagService(
    private val techGraphService: TechGraphService,
    private val knowledgeSearchTool: KnowledgeSearchTool?
) {
    /**
     * Hybrid RAG 검색 수행
     * 1. 그래프에서 관련 기술 탐색
     * 2. 각 기술별 벡터 검색
     * 3. 거리 기반 가중치로 컨텍스트 구성
     */
    fun searchHybrid(request: HybridSearchRequest): HybridSearchResult
    
    /**
     * 특정 기술의 학습 경로 + 문서 통합 조회
     */
    fun getLearningPathWithDocuments(technology: String): LearningPathWithDocs
    
    /**
     * Gap 분석 + 학습 자료 추천
     */
    fun analyzeGapWithResources(
        known: List<String>,
        target: String
    ): GapAnalysisWithResources
}
```

### NewTechLearningAgent 개선

`fetchRagContext()` 메서드가 Hybrid RAG를 사용하도록 변경:

```kotlin
// 기존 (v5)
private fun fetchRagContext(technology: String): String {
    val roadmapResults = knowledgeSearchTool.searchRoadmap(technology)
    val bestPractices = knowledgeSearchTool.searchBestPractices(technology)
    // 벡터 검색만 수행
}

// 변경 (v6)
private fun fetchRagContext(technology: String): String {
    // 1. 그래프에서 선행 기술 조회
    val prerequisites = techGraphService.findPrerequisites(technology)
    
    // 2. 모든 관련 기술에 대해 벡터 검색
    val allTechs = listOf(technology) + prerequisites.required.map { it.name }
    val documents = allTechs.flatMap { tech ->
        knowledgeSearchTool?.searchKnowledge(tech) ?: emptyList()
    }
    
    // 3. 거리 기반 우선순위로 정렬
    // ...
}
```

---

## 데이터 구조

### HybridSearchRequest

```kotlin
data class HybridSearchRequest(
    val query: String,
    val targetTechnology: String? = null,
    val maxGraphDepth: Int = 2,
    val maxVectorResults: Int = 5,
    val includeDocuments: Boolean = true
)
```

### HybridSearchResult

```kotlin
data class HybridSearchResult(
    val query: String,
    val targetTechnology: TechSummary,
    val learningPath: List<LearningPathStep>,
    val relatedTechnologies: List<TechSummary>,
    val summary: String?,
    val estimatedTotalHours: Int,
    val metadata: SearchMetadata
)

data class LearningPathStep(
    val step: Int,
    val technology: TechSummary,
    val relation: String,
    val distance: Int,
    val documents: List<DocumentResult>
)

data class DocumentResult(
    val type: String,
    val content: String,
    val source: String,
    val relevanceScore: Double
)
```

---

## 마이그레이션 가이드

### v5 → v6 업그레이드

1. **코드 변경 없이 업그레이드 가능**
   - 모든 v5 API가 그대로 동작
   - 새 필드는 무시해도 됨

2. **새 기능 활용 (선택)**
   - `/api/v1/search/hybrid` 엔드포인트 사용
   - 로드맵 응답에서 `documents` 필드 활용

3. **성능 고려사항**
   - Hybrid 검색은 Graph + Vector 둘 다 쿼리하므로 약간 느릴 수 있음
   - `includeDocuments: false`로 문서 생략 가능

---

## 참고

- [API_SPECIFICATION_V5.md](../v5/API_SPECIFICATION_V5.md) - v5 전체 API 명세
- [FRONTEND_INTEGRATION_GUIDE.md](../v5/FRONTEND_INTEGRATION_GUIDE.md) - 프론트엔드 통합 가이드
