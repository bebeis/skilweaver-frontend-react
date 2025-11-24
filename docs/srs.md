## SRS: SkillWeaver

## 1. 소개
### 1.1 목적
이 소프트웨어 요구사항 명세서(SRS)는 개발자의 기존 기술 스택과 학습 선호도를 활용해 개인화된 학습 플랜을 제공하는 Embabel 기반 서비스 SkillWeaver의 동작, 제약, 인터페이스, 수용 기준을 정의한다.

### 1.2 범위
SkillWeaver는 Embabel 0.3.0과 OpenAI GPT-5를 활용해 회원, 기술 스택, 커뮤니티 기술 지식, AI 학습 플랜을 관리하는 Spring Boot 3.5.7 백엔드 API를 제공한다. 본 문서는 AWS EC2와 Amazon RDS(MySQL)에 배포되는 자바 21 기반 서버, Embabel 에이전트, GitHub Actions CD 파이프라인을 포함하며, Next.js + shadcn 프런트엔드는 정의된 인터페이스 범위만 다룬다. 초기 릴리스는 최대 5명의 동시 사용자를 목표로 한다.

### 1.3 정의 및 약어
- **Embabel**: 도메인 객체/서비스에 `@Agent`, `@Action`, `@Tool`, `@AchievesGoal`을 부여해 LLM 워크플로를 구현하는 에이전트 프레임워크.
- **GOAP**: Embabel이 주입된 액션의 입출력 시그니처를 이용해 순서를 결정하는 Goal-Oriented Action Planning 기법.
- **MemberContext**: Spring `HandlerMethodArgumentResolver`를 통해 인증된 회원 ID를 주입하는 커스텀 컨텍스트 객체.
- **TechnologyKnowledgeDto**: 특정 기술의 요약, 선행지식, 관계, 학습 팁을 담는 DTO.
- **Web Tool**: Embabel이 외부 자료 탐색을 위해 제공하는 브라우징/검색 도구 그룹.

### 1.4 참고 문서
- docs/PROJECT_INITIAL_PLAN.md (프로젝트 비전 및 도메인 모델)
- docs/ddl.sql, docs/ddl_physical_fk.sql (데이터베이스 설계 초안)
- .github/copilot-instructions.md (코딩 표준 및 협업 규칙)

### 1.5 문서 구성
이후 장에서는 제품 개요, 기능 요구사항, 인터페이스, 비기능 요구사항, 아키텍처, 데이터 요구사항, 기타 고려사항 및 부록을 순차적으로 다룬다.

## 2. 전반적 설명
### 2.1 제품 관점
SkillWeaver는 AWS EC2에서 동작하는 Spring Boot 3.5.7 REST API이며, 데이터는 Amazon RDS for MySQL에 저장된다. Next.js + shadcn 클라이언트와 Embabel Web Tool, OpenAI GPT-5가 이 API를 소비한다. Embabel 에이전트는 저장소와 도메인 서비스를 호출해 학습 플랜 생성을 오케스트레이션하며, GitHub Actions가 Docker 이미지를 EC2로 배포한다.

### 2.2 제품 기능
- 회원 프로필, 학습 선호도, 선택적 학습 목표 CRUD 제공
- Technology/MemberSkill 엔티티를 통한 기술 스택 추적
- 커뮤니티가 편집 가능한 TechnologyKnowledge 지식 베이스 및 관계 관리
- Embabel + GPT-5로 배경 분석, 리소스 수집, 학습 플랜 생성 (1분 이내)
- JWT 액세스 토큰과 HttpOnly 리프레시 쿠키를 사용하고 MemberContext 주입으로 권한을 검증하는 API 제공
- GitHub Actions CD 파이프라인으로 EC2 + RDS에 자동 배포

### 2.3 사용자 유형 및 특성
- **학습자(주 사용자)**: 우테코 프리코스 개발 지망생으로 웹 폼 사용에 익숙하며 한국어 자료를 선호하나 영어 콘텐츠도 소비 가능.
- **운영자/관리자**: 기술 지식 베이스 조정과 배포 모니터링을 담당하는 내부 인력으로 AWS/GitHub 사용 경험이 있다. 별도 모더레이터 롤은 현재 필요 없다.

### 2.4 운영 환경
- 백엔드: Java 21, Spring Boot 3.5.7, Kotlin 지원, Embabel SDK 0.3.0, HTTPS가 활성화된 AWS EC2(Amazon Linux 2)
- 데이터베이스: Amazon RDS for MySQL 8.x (UTF-8)
- 프런트엔드: Next.js 14 + shadcn UI (HTTPS 통신)
- 외부 서비스: OpenAI GPT-5 API, Embabel Web Tool, 선택적 이메일 발송 서비스

### 2.5 설계 및 구현 제약
- 도메인 서비스와 엔티티는 요구된 Embabel 애너테이션을 포함해야 한다.
- 학습 플랜 생성 시 Embabel을 통해 GPT-5를 호출하고, 커뮤니티 데이터 부족 시 Web Tool 검색을 허용해야 한다.
- 인증은 이메일/비밀번호 로그인 이후 JWT 액세스 토큰(Authorization: Bearer)과 HttpOnly 리프레시 쿠키를 발급하는 방식이며 이메일 인증은 없다.
- 비밀번호는 BCrypt 등 안전한 방식으로 해시 후 저장한다.
- MemberContext ArgumentResolver를 모든 보호된 컨트롤러에 적용해야 한다.
- 배포는 GitHub Actions로 Docker 아티팩트를 EC2에 반영한다.
- 초기 Technology 카탈로그는 5~6개의 핵심 기술로 시작하고 확장성을 확보해야 한다.

### 2.6 가정 및 의존성
- 최대 동시 사용자 수는 5명으로 가정하고 부하 테스트를 진행한다.
- GPT-5 호출과 외부 검색을 포함해 학습 플랜 생성은 60초 이내에 완료되어야 한다.
- OpenAI, Embabel, Web Tool 호출에는 안정적인 네트워크 이그레스가 필요하다.
- 모든 회원은 TechnologyKnowledge를 편집할 수 있으며, 이후 정책으로 보완한다.
- 이메일 인증은 필요 시 기능 플래그만으로 활성화 가능해야 한다.

## 3. 시스템 기능
### 3.1 회원 온보딩 및 인증
- **Type**: Functional
- **ID**: F-001
- **설명**: 회원 가입, 로그인, 로그아웃, JWT 액세스 토큰·리프레시 쿠키 발급과 갱신을 제공하고 MemberContext를 통해 후속 처리에 인증 정보를 전달한다.
- **우선순위**: 높음
- **입력**: `name`, `email`, `password`, Authorization 헤더(Bearer 액세스 토큰), HttpOnly 리프레시 쿠키, HTTP 헤더
- **처리**: 입력 검증, 비밀번호 해시, Member 엔티티 생성/갱신, 액세스 토큰 서명/만료 검증, 리프레시 토큰 발급·저장, MemberContext 주입
- **출력**: 액세스 토큰과 만료 정보가 포함된 HTTP 201/200 응답, HttpOnly 리프레시 쿠키, 인증 실패 시 에러 응답, 감사 로그
- **수용 기준**:
  - 비밀번호는 업계 표준 알고리즘으로 해시되어 저장된다.
  - 로그인 성공 시 짧은 수명의 액세스 토큰을 응답 본문/헤더로 반환하고, 리프레시 토큰을 HttpOnly·Secure 쿠키로 설정 및 저장한다.
  - 로그아웃 또는 리프레시 토큰 로테이션 시 기존 리프레시 토큰은 즉시 폐기되고 쿠키가 제거된다.
  - 인증된 엔드포인트는 항상 검증된 액세스 토큰 클레임으로부터 MemberContext를 구성한다.
  - 인증 실패 시 HTTP 401/403과 일관된 오류 페이로드를 반환한다.

### 3.2 회원 기술 포트폴리오 관리
- **Type**: Functional
- **ID**: F-002
- **설명**: 회원별로 정규화된 기술과 커스텀 기술을 포함한 MemberSkill을 관리하고 숙련도, 사용 기간, 메모를 저장한다.
- **우선순위**: 높음
- **입력**: 회원 ID, 기술 key 또는 customName, level, yearsOfUse, lastUsedAt, note
- **처리**: 기술 참조 검증, cascade 규칙을 지닌 MemberSkill 컬렉션 유지, CRUD 수행, 포트폴리오 변경 시 Embabel 이벤트 발행
- **출력**: 기술 리스트 JSON, HTTP 상태 코드, 변경 감사 이력
- **수용 기준**:
  - 가능한 경우 Technology를 참조하고, 미등록 기술은 `customName`으로 저장한다.
  - CRUD 엔드포인트는 MemberContext를 사용해 소유권을 검증한다.
  - 중복 기술 등록 등 검증 오류 시 HTTP 400과 필드별 메시지를 반환한다.
  - 회원당 100개 이상의 스킬도 200ms 이내로 조회할 수 있어야 한다.

### 3.3 학습 선호도 및 목표
- **Type**: Functional
- **ID**: F-003
- **설명**: 하루 학습 시간, 스타일, 주말 부스트 등을 담은 LearningPreference와 다중 LearningGoal을 저장한다.
- **우선순위**: 중간
- **입력**: 선호도 DTO, 목표 제목/설명, 기한, 우선순위
- **처리**: Embedded LearningPreference 업데이트, LearningGoal 컬렉션 라이프사이클 관리, `weeklyCapacityMinutes()`와 `findRelatedSkills()`를 Embabel Tool로 노출
- **출력**: 갱신된 Member JSON, 활성 목표 목록, Embabel Tool 메타데이터
- **수용 기준**:
  - 기본값은 1일 60분, 한국어 선호, 프로젝트 기반, 주말 부스트 활성이다.
  - 복수의 활성 목표를 유지하고, 보관 목표는 조회 가능해야 한다.
  - MemberLearningProfile에서 제공하는 Tool이 에이전트 흐름에서 호출 가능해야 한다.
  - 과거 날짜의 목표 기한 입력 시 명확한 오류를 반환한다.

### 3.4 기술 카탈로그 및 커뮤니티 지식 베이스
- **Type**: Functional
- **ID**: F-004
- **설명**: Technology 엔티티와 TechnologyKnowledge 요약/선행지식/사용처/팁을 관리하며 모든 회원이 편집할 수 있도록 한다.
- **우선순위**: 높음
- **입력**: 기술 key/displayName/category/ecosystem/officialSite, 요약, 선행지식 리스트, 사용처 리스트, 학습 팁, sourceType
- **처리**: 고유 key 검증, 일대일 매핑으로 지식 연결, 필요 시 TechnologyEdit 이력 기록, 인증된 회원에게 편집 권한 부여
- **출력**: 기술/지식 JSON, 편집 이력, 관계 데이터
- **수용 기준**:
  - GA 이전에 최소 5개의 기술이 시드 데이터로 등록되어야 한다.
  - 모든 인증된 회원은 수정 시각과 작성자 정보가 포함된 상태로 지식을 갱신할 수 있다.
  - 응답에는 선행지식 3~5개와 사용처 배열이 항상 포함된다(내용이 없으면 빈 배열).
  - TechnologyEdit 기능은 스키마 변경 없이 온/오프 가능해야 한다.

### 3.5 기술 관계 및 검토 제어
- **Type**: Functional
- **ID**: F-005
- **설명**: 기술 간 선행/다음/대체 관계를 저장하고, 필요한 경우 관리자 검토 흐름을 제공한다.
- **우선순위**: 중간
- **입력**: from Technology, to Technology, relationType, weight, 편집 제안
- **처리**: TechRelationship 간선 저장, 추천용 인접 리스트 제공, 관리자 승인/거절 API 제공(활성 시)
- **출력**: 관계 배열, 편집 상태, 감사 로그
- **수용 기준**:
  - 관계 가중치는 기본 1이며 최대 5까지 허용된다.
  - 기술당 50개의 관계도 200ms 이내로 조회되어야 한다.
  - 편집 제안은 `PENDING`, `APPROVED`, `REJECTED` 상태 전이를 제공한다.
  - 관리자 모드가 켜져 있을 때만 승인/거절 엔드포인트가 노출된다.

### 3.6 AI 학습 플랜 생성
- **Type**: Functional
- **ID**: F-006
- **설명**: Embabel NewTechLearningAgent를 실행해 GOAP 기반으로 학습 플랜 생성 목표를 달성하기 위한 액션 경로를 동적으로 계획하고 실행한다.
- **우선순위**: 높음
- **입력**: `memberId`, `targetTechName`, motivation, `timeFrameWeeks`, `dailyMinutesOverride`
- **처리**: 
  - Embabel GOAP 엔진이 최종 목표(`LearningPlan` 생성)를 달성하기 위해 필요한 액션들을 타입 시그니처 기반으로 자동 추론
  - 현재 상태(가용 데이터)와 각 액션의 사전조건·사후조건을 분석하여 실행 가능한 액션 체인을 동적으로 구성
  - 예시 액션: `loadMemberProfile`, `analyzeBackground`, `collectResources`, `createLearningPlan` 등 (순서와 조합은 상황에 따라 동적으로 결정됨)
  - 각 액션 실행 후 상태를 재평가하고, 필요 시 계획을 재수립하여 최적 경로 탐색
  - 유효 일일 학습 시간 적용, GPT-5 프롬프트 수행, 전체 실행 시간을 60초 이내로 제한
- **출력**: LearningPlan JSON(요약, 총 주차, LearningStep, DailyStudySlot, LearningResourceRef), 실행된 액션 체인 메타데이터
- **수용 기준**:
  - API 기준 95% 이상의 요청이 60초 이내에 완료된다.
  - LearningPlan은 최소 3개의 step과 전체 주차를 커버하는 daily schedule을 포함한다.
  - BackgroundAnalysis는 관련 스킬, 부족한 선행지식, 리스크를 각각 1개 이상 제시한다.
  - GOAP 엔진이 목표 달성을 위한 유효한 액션 체인을 자동으로 구성하고, 실행 경로가 로깅된다.
  - 새로운 액션 추가 시 기존 코드 수정 없이 GOAP가 자동으로 해당 액션을 계획에 통합할 수 있어야 한다.
  - GPT-5/Embabel 오류는 HTTP 503으로 재시도 가능 상태로 노출되고 로깅된다.

### 3.7 커뮤니티 우선 리소스 수집
- **Type**: Functional
- **ID**: F-007
- **설명**: CommunityTechnologyTool을 통해 지식을 우선 조회하고, 부족하면 Web Tool 검색으로 보완한다.
- **우선순위**: 높음
- **입력**: 기술 key/이름, NewTechLearningRequest
- **처리**: Embabel 실행기가 `findKnowledge`를 호출해 결과를 확인하고, 요약/선행지식이 없거나 미비하면 Web Tool과 GPT-5를 통해 TechnologyKnowledgeDto를 구성한다.
- **출력**: 관계와 출처 정보가 포함된 TechnologyKnowledgeDto, Web Tool 사용 로그
- **수용 기준**:
  - 각 학습 플랜 생성 시 커뮤니티/웹 어느 경로가 사용됐는지 로깅한다.
  - Web Tool이 반환한 LearningResourceRef에는 URL과 언어(`ko`/`en`)가 포함된다.
  - 커뮤니티 데이터가 존재하면 Web Tool은 호출되지 않는다.
  - 필요 시 TechnologyBootstrapTool을 통해 Web Tool 결과를 DB에 저장할 수 있다.

### 3.8 배포 및 전송 파이프라인
- **Type**: Functional
- **ID**: F-008
- **설명**: GitHub Actions를 활용해 빌드, 테스트, Docker 이미지 생성, EC2 배포, RDS 마이그레이션을 자동화한다.
- **우선순위**: 중간
- **입력**: main 브랜치 푸시, AWS/OpenAI 시크릿, 마이그레이션 스크립트
- **처리**: CI 테스트 실행, Docker 이미지 빌드·푸시, EC2(SSH/SSM) 배포, DB 마이그레이션, 서비스 재시작, 실패 시 알림
- **출력**: 파이프라인 로그, 상태 배지, 경보, 실행 중인 서비스
- **수용 기준**:
  - main 병합마다 단위테스트와 정적 분석을 통과해야 배포가 진행된다.
  - 테스트 또는 마이그레이션 실패 시 배포가 중단되고 롤백된다.
  - 평균 배포 시간은 10분 이내를 유지한다.
  - 시크릿은 GitHub Actions Secrets로 관리하며 분기별로 교체한다.

## 4. 외부 인터페이스 요구사항
### 4.1 사용자 인터페이스
- 한국어 중심 복사본을 가진 Next.js + shadcn SPA
- 회원/스킬/목표/기술/지식 편집 폼과 상태 표시
- 학습 플랜 단계 및 일별 일정 시각화를 제공하는 대시보드 위젯

### 4.2 하드웨어 인터페이스
- 별도의 물리 장비 연동은 없으며, HTTPS를 지원하는 사용자 디바이스와 클라우드 인프라만 사용한다.

### 4.3 소프트웨어 인터페이스
- docs/PROJECT_INITIAL_PLAN.md에 정의된 REST API (`/members`, `/members/{id}/skills`, `/technologies/{key}`, `/members/{memberId}/learning-plans` 등)
- Embabel AgentPlatform 및 Tool API
- OpenAI GPT-5, Embabel Web Tool, 선택적 이메일 서비스(SMTP/HTTP)
- AWS EC2/RDS/IAM, GitHub Actions 러너

### 4.4 통신 인터페이스
- UTF-8 JSON을 사용하는 HTTPS 통신
- GPT-5 및 Web Tool 호출을 위한 TLS 아웃바운드 트래픽
- GitHub Actions에서 EC2로의 SSH 또는 AWS SSM 채널

## 5. 비기능 요구사항
### 5.1 성능
- **NF-001**: 학습 플랜 생성 외 API의 중앙값 응답시간은 300ms 이하, p95는 600ms 이하(동시 사용자 5명 기준).
- **NF-002**: 학습 플랜 생성 전체 소요시간의 95%는 60초 이하이며, 초과 시 구조화된 로그와 경보를 발생시킨다.

### 5.2 신뢰성
- **NF-003**: 월 가용성 목표는 98%이며 헬스 체크로 모니터링한다.
- **NF-004**: GPT-5/Web Tool 호출 실패 시 최대 2회 지수 백오프로 재시도 후 오류를 보고한다.

### 5.3 보안
- **NF-005**: 비밀번호는 cost 10 이상 BCrypt로 해시하고, 사용자별 솔트를 적용한다.
- **NF-006**: 리프레시 토큰 쿠키는 HttpOnly, Secure, SameSite=Lax 속성을 가지며 12시간 미사용 시 만료되고 로테이션 시 즉시 무효화된다.
- **NF-007**: 모든 데이터 접근 검증은 MemberContext 기반으로 수행해 교차 접근을 방지한다.

### 5.4 유지보수성
- **NF-008**: 서비스 및 에이전트 계층의 라인 커버리지는 80% 이상을 유지한다.
- **NF-009**: Embabel `@Tool`로 노출되는 도메인 로직은 모듈화되고 한국어/영문 Kotlin 문서가 포함된다.
- **NF-010**: OpenAPI 명세와 Markdown 플레이북은 릴리스마다 갱신해야 한다.

### 5.5 이식성
- **NF-011**: Docker Compose(app + MySQL)로 15분 이내에 로컬 실행 및 온보딩이 가능해야 한다.
- **NF-012**: 인프라 스크립트는 신규 EC2에 스냅샷 복구 외 추가 작업 없이 재배포할 수 있어야 한다.

## 6. 시스템 아키텍처
### 6.1 개요
아키텍처는 Next.js 클라이언트, EC2에서 동작하는 Spring Boot 3.5.7 + Embabel 0.3.0 백엔드, Amazon RDS MySQL, 외부 서비스(OpenAI GPT-5, Web Tool, 이메일)를 포함한다. 클라이언트는 REST API로 백엔드와 통신하고, Embabel 액션은 GPT-5/Web Tool을 호출한 뒤 결과를 RDS에 반영한다.

### 6.2 구성 요소 및 상호작용
- **API 레이어**: MemberContext로 권한을 확인하고 요청/응답을 직렬화하는 컨트롤러
- **도메인 레이어**: Member, Technology, MemberSkill, LearningGoal, TechnologyKnowledge, TechRelationship, TechnologyEdit 엔티티 및 서비스
- **Embabel 레이어**: 프로필 로딩, 배경 분석, 리소스 수집, 플랜 생성을 담당하는 에이전트 클래스
- **인프라 레이어**: GitHub Actions CI/CD, AWS 네트워킹, CloudWatch 모니터링
- **외부 서비스**: GPT-5 LLM, Web Tool, 이메일 제공자

### 6.3 데이터 흐름
1. 사용자가 프런트엔드에서 CRUD 또는 학습 플랜 요청을 전송한다.
2. API는 Authorization 헤더의 JWT 액세스 토큰을 검증하고 필요 시 리프레시 쿠키로 재발급한 뒤 MemberContext를 해석해 저장소를 호출한다.
3. 학습 플랜 요청의 경우 Embabel 에이전트가 저장소 조회, GPT-5 프롬프트, Web Tool 검색을 순차 실행한다.
4. 생성된 LearningPlan은 필요 시 DB에 저장되거나 바로 응답으로 반환되고, 메타데이터는 모니터링에 기록된다.
5. 기술 지식 편집 내용은 Technology 서비스로 전달되며, Web Tool 결과는 TechnologyBootstrapTool을 통해 DB에 반영될 수 있다.

## 7. 데이터 요구사항
### 7.1 데이터 모델
- **Member**: id, name, email, targetTrack, experienceLevel, learningPreference, skills, goals
- **LearningPreference**: dailyMinutes, preferKorean, style, weekendBoost
- **MemberSkill**: member 참조, technology 참조 또는 customName, level, yearsOfUse, lastUsedAt, note
- **Technology**: key, displayName, category, ecosystem, officialSite, active
- **TechnologyKnowledge**: summary, prerequisites(ElementCollection), typicalUseCases, learningTips, sourceType
- **TechRelationship**: from, to, relationType, weight
- **TechnologyEdit**(선택): proposedSummary, proposedPrerequisites, status, author, createdAt
- **LearningGoal**: title, description, dueDate, priority, member 참조
- **LearningPlan 산출물**: LearningStep, DailyStudySlot, LearningResourceRef(감사 목적 JSON 보관)

### 7.2 데이터 저장
- docs/ddl_physical_fk.sql에 정의된 외래키 제약을 준수한다.
- `technology.key`, `members.email`, `tech_relationship.from_id` 등에 인덱스를 생성한다.
- RDS 스냅샷을 매일 생성해 7일간 보관하고, Point-In-Time Recovery를 활성화한다.

### 7.3 데이터 검증
- 이메일은 RFC 5322 기본 패턴을 따르며 고유해야 한다.
- Skill level은 Enum 값만 허용하고, yearsOfUse는 0 이상, lastUsedAt은 현재 날짜를 초과할 수 없다.
- Technology key는 소문자 슬러그, displayName은 2~60자 범위를 유지한다.
- LearningPlan 응답은 반환 전 JSON 스키마 검증을 거친다.

## 8. 기타 요구사항
### 8.1 법적/규제 사항
- 특정 규제는 없으며, 최소한의 개인정보만 저장하고 삭제 요청을 7일 내 처리한다.

### 8.2 현지화
- UI와 자동 생성 플랜은 한국어를 기본으로 하고, 필요한 경우 영어 리소스를 제공한다. LearningResourceRef.language 필드는 `ko` 또는 `en`을 명시한다.

### 8.3 접근성
- 프런트엔드는 WCAG 2.1 AA 대비를 충족하고, 모든 폼은 키보드 내비게이션을 지원해야 한다. 백엔드는 보조도구용 상세 오류 코드를 반환한다.

## 9. 부록
### 9.1 참고 다이어그램
- 아키텍처, 시퀀스, ER 다이어그램은 docs/PROJECT_INITIAL_PLAN.md 및 향후 설계 산출물에 추가된다.

### 9.2 변경 이력
- v0.2: 전체 한글화 및 런타임 버전(자바 21, Spring Boot 3.5.7, Embabel 0.3.0) 반영.
- v0.1: 초기 AWS EC2 + RDS 배포 초안.

### 9.3 보류 중 작업
- 명세화된 각 요구사항에 대해 GitHub 이슈를 생성할지 여부 확인.
