# V4 마이그레이션 가이드

## 개요

V4에서는 기술 카탈로그 데이터가 RDB(MySQL)에서 Neo4j Graph로 마이그레이션됩니다.
이 문서는 프론트엔드 및 백엔드 개발자를 위한 마이그레이션 가이드입니다.

---

## Breaking Changes

### 1. ID 전략 변경

| V3 | V4 |
|----|-----|
| `technologyId: Long` | `name: String` |
| `/technologies/1` | `/technologies/spring-boot` |

**영향**:
- 모든 기술 참조를 숫자 ID에서 문자열 name으로 변경
- URL 파라미터 변경 필요

### 2. API 엔드포인트 통합

| V3 (Deprecated) | V4 (New) |
|-----------------|----------|
| `GET /api/v1/graph/roadmap/{tech}` | `GET /api/v1/technologies/{name}/roadmap` |
| `GET /api/v1/graph/path` | `GET /api/v1/technologies/path` |
| `GET /api/v1/graph/recommendations/{tech}` | `GET /api/v1/technologies/{name}/recommendations` |
| `POST /api/v1/graph/gap-analysis` | `POST /api/v1/technologies/gap-analysis` |

### 3. 응답 필드 변경

| V3 | V4 |
|----|-----|
| `technologyId` | `name` |
| `key` | `name` |
| `knowledge.summary` | `description` |
| - | `difficulty` (신규) |
| - | `useCases` (신규) |

---

## 프론트엔드 마이그레이션

### API 클라이언트 변경

```typescript
// V3
const getTechnology = (id: number) => 
  fetch(`/api/v1/technologies/${id}`);

// V4
const getTechnology = (name: string) => 
  fetch(`/api/v1/technologies/${name}`);
```

### 응답 타입 변경

```typescript
// V3
interface TechnologyV3 {
  technologyId: number;
  key: string;
  displayName: string;
  category: string;
  knowledge?: { summary: string };
}

// V4
interface TechnologyV4 {
  name: string;
  displayName: string;
  category: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  description?: string;
  useCases: string[];
  prerequisites?: { required: TechNode[]; recommended: TechNode[] };
  relatedTechnologies: TechNode[];
}
```

### Graph API 통합

```typescript
// V3 - 별도 Graph API 호출
const roadmap = await fetch(`/api/v1/graph/roadmap/${tech}`);

// V4 - 통합 Technologies API
const roadmap = await fetch(`/api/v1/technologies/${name}/roadmap`);
```

---

## 백엔드 마이그레이션

### 기존 RDB 코드 영향도

| 파일 | 상태 | 설명 |
|------|------|------|
| `TechnologyController.kt` | Deprecated | V4에서 `TechnologyGraphController` 사용 |
| `TechnologyService.kt` | Deprecated | V4에서 `TechGraphService` 사용 |
| `Technology.kt` (Entity) | Deprecated | 회원 스킬 참조용으로만 유지 |
| `GraphApiController.kt` | Deprecated | `TechnologyGraphController`로 통합 |

### 새로운 파일

| 파일 | 설명 |
|------|------|
| `TechnologyGraphController.kt` | 통합 API Controller |
| `TechnologyGraphDto.kt` | 통합 DTO |
| `TechGraphService.kt` | Neo4j CRUD 서비스 (확장됨) |
| `GraphModels.kt` | 확장된 TechNode 모델 |

### 설정 요구사항

```yaml
# application.yml
skillweaver:
  graph:
    enabled: true        # Neo4j 그래프 기능 활성화
    seed-on-startup: true # 시작 시 seed 데이터 로딩
```

---

## 데이터 마이그레이션

### 1. Seed 파일 업데이트

기존 JSON seed 파일에 새 필드 추가:

```json
{
  "technology": "spring-boot",
  "displayName": "Spring Boot",
  "category": "FRAMEWORK",
  "difficulty": "INTERMEDIATE",
  
  // V4 신규 필드
  "ecosystem": "JVM",
  "officialSite": "https://spring.io/projects/spring-boot",
  "estimatedLearningHours": 80,
  "communityPopularity": 9,
  "jobMarketDemand": 10,
  "useCases": ["REST API", "Microservices"],
  "learningTips": "공식 문서를 따라 학습하세요"
}
```

### 2. Neo4j 초기화

```bash
# Docker로 Neo4j 실행
docker-compose up -d neo4j

# 애플리케이션 시작 (seed 자동 로딩)
./gradlew bootRun --args='--spring.profiles.active=local'
```

---

## 호환성 유지 기간

| 버전 | 기존 API | 신규 API | 상태 |
|------|----------|----------|------|
| V4 | 동작 (Deprecated) | 권장 | 현재 |
| V5 (예정) | 제거 | 필수 | 미래 |

---

## 문의

마이그레이션 관련 문의사항은 이슈 트래커를 통해 등록해주세요.
