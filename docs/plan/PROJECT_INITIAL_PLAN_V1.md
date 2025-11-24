# 프로젝트 초기 기획 - 스킬 위버

## 1. 프로젝트 목표 & 컨셉

### 1.1. 프로젝트 목적

* **프로젝트명**: **SkillWeaver**
* **목표**:

  * 우테코 프리코스에 참여 중인 *개발자 지망생*이,
  * **이미 가지고 있는 기술 스택 + 학습 선호도**를 바탕으로,
  * 새로운 기술을 **더 효율적으로 학습**할 수 있도록 돕는 서비스.
* **핵심 기능**

  1. 회원 정보 CRUD
  2. 회원의 기술 스택 CRUD
  3. 커뮤니티가 직접 수정/축적하는 **기술 지식 베이스**
  4. Embabel 기반 AI Agent가:

     * 회원의 도메인 정보 + 커뮤니티 지식 베이스를 참고해서
     * **새 기술 학습 플랜**을 자동으로 만들어 줌

### 1.2. Embabel 활용 포인트

* Embabel의 강점인 **도메인 모델과의 깊은 통합**을 적극 활용:

  * 엔티티/도메인 서비스에 `@Tool` 을 붙여 LLM이 직접 호출 가능
  * `@Action` 들의 입력/출력 타입을 기반으로 GOAP 플래닝
  * “도메인 로직 + LLM + 외부 Tool(Web)”이 한 에이전트 플로우 안에서 얽힘

---

## 2. 도메인 모델 설계

### 2.1. Member (회원) & LearningPreference

```kotlin
@Entity
class Member(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    val name: String,
    val email: String? = null,

    @Enumerated(EnumType.STRING)
    val targetTrack: TargetTrack,          // BACKEND, FRONTEND, FULLSTACK, MOBILE 등

    @Enumerated(EnumType.STRING)
    val experienceLevel: ExperienceLevel,  // BEGINNER, INTERMEDIATE, ADVANCED

    @Embedded
    val learningPreference: LearningPreference,  // 하루 공부 시간, 스타일 등

    @OneToMany(mappedBy = "member", cascade = [CascadeType.ALL], orphanRemoval = true)
    val skills: MutableList<MemberSkill> = mutableListOf(),
)

enum class TargetTrack { BACKEND, FRONTEND, FULLSTACK, MOBILE, DATA }
enum class ExperienceLevel { BEGINNER, INTERMEDIATE, ADVANCED }

@Embeddable
data class LearningPreference(
    val dailyMinutes: Int = 60,            // 하루 평균 공부 시간
    val preferKorean: Boolean = true,      // 한글 자료 선호 여부
    @Enumerated(EnumType.STRING)
    val style: LearningStyle = LearningStyle.PROJECT_BASED,
    val weekendBoost: Boolean = true,
)

enum class LearningStyle {
    DOC_FIRST, VIDEO_FIRST, PROJECT_BASED
}
```

> 이 값 객체는 나중에 `@Tool` 을 붙여서 “일주일 최대 공부 가능 시간 계산” 등의 도메인 로직을 LLM이 직접 사용할 수 있게 설계.

---

### 2.2. Technology & MemberSkill – 기술 스택 모델링

#### 2.2.1. Technology (기술 엔티티)

* “전 세계 모든 기술”을 다 넣는 게 아니라,

  * **초기에는 실제로 쓸 핵심 기술들만** (Java, Kotlin, Spring, JPA, MySQL, Git, Docker 등)
  * 점진적으로 커뮤니티/AI가 추가

```kotlin
@Entity
class Technology(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    val key: String,                 // "java", "spring-boot" (슬러그)
    val displayName: String,         // "Java", "Spring Boot"
    @Enumerated(EnumType.STRING)
    val category: SkillCategory,     // LANGUAGE, FRAMEWORK, DB, TOOL ...

    val ecosystem: String? = null,   // "JVM", "JavaScript" 등
    val officialSite: String? = null,

    val active: Boolean = true,
)

enum class SkillCategory { LANGUAGE, FRAMEWORK, LIBRARY, TOOL, DB, PLATFORM, ETC }
enum class SkillLevel { BEGINNER, INTERMEDIATE, ADVANCED }
```

#### 2.2.2. MemberSkill (회원이 가진 스킬)

* **하이브리드 설계**:

  * 가능하면 `Technology` 엔티티로 정규화해서 참조
  * 그래도 커버 안 되는 기술은 `customName` (자유 입력)으로 저장

```kotlin
@Entity
class MemberSkill(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    val member: Member,

    @ManyToOne(fetch = FetchType.LAZY)
    val technology: Technology? = null,   // 정규화된 기술

    val customName: String? = null,       // DB에 없는 기술일 때 자유 입력

    @Enumerated(EnumType.STRING)
    val level: SkillLevel,
    val yearsOfUse: Double = 0.0,
    val lastUsedAt: LocalDate? = null,
    val note: String? = null,
)
```

* 이렇게 하면:

  * 통계/추천/그래프에 필요한 애들만 `Technology` 로 관리
  * 나머지는 자유롭게 입력
  * Embabel Agent가 기술 그래프/선행지식을 도메인 Tool을 통해 활용하기 쉬움

---

### 2.3. LearningGoal (선택적인 학습 목표)

* 각 회원이 여러 개의 학습 목표를 가질 수 있도록:

```kotlin
@Entity
class LearningGoal(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    val member: Member,

    val title: String,
    val description: String,

    val dueDate: LocalDate? = null,
    @Enumerated(EnumType.STRING)
    val priority: GoalPriority = GoalPriority.MEDIUM,
    @Enumerated(EnumType.STRING)
    val status: GoalStatus = GoalStatus.ACTIVE,
)

enum class GoalPriority { LOW, MEDIUM, HIGH }
enum class GoalStatus { ACTIVE, COMPLETED, ABANDONED }
```

* 초기 버전에서 부담되면 생략 가능하지만,
  장기적으로 “우테코 준비”, “코테 준비”, “사이드 프로젝트” 같은 컨텍스트를 붙이기에 좋음.

---

### 2.4. 커뮤니티 기반 기술 지식 베이스

#### 2.4.1. TechnologyKnowledge – 기술 설명/학습 정보

```kotlin
@Entity
class TechnologyKnowledge(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @OneToOne(fetch = FetchType.LAZY)
    val technology: Technology,

    @Lob
    val summary: String?,                     // 이 기술이 뭔지 요약

    @ElementCollection
    @CollectionTable(name = "tech_prerequisite", joinColumns = [JoinColumn(name = "knowledge_id")])
    @Column(name = "prerequisite_key")
    val prerequisites: List<String> = emptyList(),  // 선행 지식 key 목록

    @ElementCollection
    @CollectionTable(name = "tech_use_case", joinColumns = [JoinColumn(name = "knowledge_id")])
    @Column(name = "use_case")
    val typicalUseCases: List<String> = emptyList(), // 대표적인 사용처

    @Lob
    val learningTips: String? = null,              // “이렇게 공부하면 좋다” 팁

    @Enumerated(EnumType.STRING)
    val sourceType: KnowledgeSource = KnowledgeSource.COMMUNITY,
)

enum class KnowledgeSource {
    COMMUNITY,   // 커뮤니티가 직접 작성
    AI_IMPORTED  // AI가 초안으로 가져온 정보
}
```

#### 2.4.2. TechRelationship – 기술 간 관계 (선행/다음/대체)

```kotlin
@Entity
class TechRelationship(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    val from: Technology,

    @ManyToOne(fetch = FetchType.LAZY)
    val to: Technology,

    @Enumerated(EnumType.STRING)
    val relationType: RelationType,   // PREREQUISITE, NEXT_STEP, ALTERNATIVE
    val weight: Int = 1,              // 연관도 (1~5 등)
)

enum class RelationType {
    PREREQUISITE,
    NEXT_STEP,
    ALTERNATIVE
}
```

* 나중에 “Spring Boot 다음에 뭘 배우면 좋지?” 같은 추천에 활용.

#### 2.4.3. TechnologyEdit – 커뮤니티 수정 이력(선택)

```kotlin
@Entity
class TechnologyEdit(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    val technology: Technology,

    @ManyToOne(fetch = FetchType.LAZY)
    val author: Member,

    @Lob
    val proposedSummary: String? = null,

    @ElementCollection
    val proposedPrerequisites: List<String> = emptyList(),

    @Enumerated(EnumType.STRING)
    val status: EditStatus = EditStatus.PENDING,

    val createdAt: LocalDateTime = LocalDateTime.now(),
)

enum class EditStatus { PENDING, APPROVED, REJECTED }
```

* 초기 버전에서는 `TechnologyKnowledge` 직접 수정 + 나중에 이력만 남기는 수준으로 시작해도 OK.

---

### 2.5. 에이전트 입출력 도메인 객체

#### 2.5.1. 새 기술 학습 요청

```kotlin
data class NewTechLearningRequest(
    val memberId: Long,
    val targetTechName: String,         // "Kotlin Coroutines", "NestJS" 등
    val motivation: String,             // 우테코 준비, 코테, 포트폴리오 등
    val timeFrameWeeks: Int? = null,    // 몇 주 안에 끝내고 싶은지
    val dailyMinutesOverride: Int? = null, // 이번 플랜에서만 별도 공부시간
)
```

#### 2.5.2. 프로파일 / 배경 분석 / 최종 플랜

```kotlin
data class MemberLearningProfile(
    val member: Member,
    val skills: List<MemberSkill>,
    val activeGoals: List<LearningGoal>,
)

data class BackgroundAnalysis(
    val existingRelevantSkills: List<String>,
    val missingPrerequisites: List<String>,
    val riskFactors: List<String>,
)
```

```kotlin
data class LearningPlan(
    val memberId: Long,
    val targetTechName: String,
    val summary: String,
    val totalWeeks: Int,
    val steps: List<LearningStep>,
    val dailySchedule: List<DailyStudySlot>,
)

data class LearningStep(
    val order: Int,
    val title: String,
    val description: String,
    val estimatedMinutes: Int,
    val requiredBackground: List<String>,
    val output: String,
    val suggestedResources: List<LearningResourceRef>,
)

data class DailyStudySlot(
    val dayIndex: Int,
    val date: LocalDate?,
    val topic: String,
    val minutes: Int,
    val stepRef: Int,
)

data class LearningResourceRef(
    val type: ResourceType,  // DOC, VIDEO, BLOG, COURSE, REPO
    val title: String,
    val url: String?,
    val language: String?,   // "ko", "en"
)

enum class ResourceType { DOC, VIDEO, BLOG, COURSE, REPO }
```

* Embabel의 `createObject(prompt, LearningPlan::class.java)` 로 LLM이 이 스키마에 맞는 객체를 바로 생성하도록 설계.

---

## 3. API 설계 요약

### 3.1. 기본 CRUD

* 회원

  * `POST /members`
  * `GET /members/{id}`
  * `PUT /members/{id}`
  * `DELETE /members/{id}`

* 회원 기술 스택

  * `POST /members/{id}/skills`
  * `GET /members/{id}/skills`
  * `PUT /members/{id}/skills/{skillId}`
  * `DELETE /members/{id}/skills/{skillId}`

* (선택) 학습 목표

  * `POST /members/{id}/goals`
  * `GET /members/{id}/goals`
  * ...

* 커뮤니티 기술 정보

  * `GET /technologies`
  * `POST /technologies`
  * `GET /technologies/{key}`
  * `PUT /technologies/{key}/knowledge` (요약/선행지식/학습팁 수정)
  * (선택) `POST /technologies/{key}/edits` (수정 제안)

### 3.2. 에이전트 호출 API

```http
POST /members/{memberId}/learning-plans
Content-Type: application/json

{
  "targetTechName": "Kotlin Coroutines",
  "motivation": "우테코 미션을 코틀린으로 구현하고 싶어서",
  "timeFrameWeeks": 3,
  "dailyMinutesOverride": 90
}
```

* Controller 에서 `NewTechLearningRequest` 로 받고,
* Embabel `AgentPlatform` 으로 `NewTechLearningAgent` 실행 → `LearningPlan` JSON 반환.

---

## 4. Embabel Agent 설계

### 4.1. 에이전트 & Goal

```kotlin
@Agent(description = "기존 기술 스택과 목표를 바탕으로 새 기술 학습 플랜을 만드는 에이전트")
class NewTechLearningAgent(
    private val memberRepository: MemberRepository,
    private val skillRepository: MemberSkillRepository,
    private val goalRepository: LearningGoalRepository,
)
```

* 최종 Goal: `LearningPlan` 생성
* 마지막 `@Action` 에 `@AchievesGoal` 붙여 Goal 달성 지점 명시.

---

### 4.2. 주요 Actions 흐름

#### 4.2.1. 회원 프로필 로딩 (비 LLM)

```kotlin
@Action
fun loadMemberProfile(
    request: NewTechLearningRequest
): MemberLearningProfile {
    val member = memberRepository.findById(request.memberId)
        ?: throw IllegalArgumentException("Member not found")

    val skills = skillRepository.findByMemberId(member.id!!)
    val goals = goalRepository.findActiveByMemberId(member.id!!)

    return MemberLearningProfile(member, skills, goals)
}
```

#### 4.2.2. 배경 분석 (LLM)

```kotlin
@Action
fun analyzeBackground(
    request: NewTechLearningRequest,
    profile: MemberLearningProfile,
    context: OperationContext,
): BackgroundAnalysis {
    val runner = context.ai().withDefaultLlm()

    return runner.createObject(
        """(프롬프트: 회원 프로필/스킬/목표/새 기술/동기 설명 후,
        1) 관련 있는 기존 스킬
        2) 부족한 선행지식
        3) 위험요소
        를 분석해서 BackgroundAnalysis 스키마로 반환하도록 지시)""".trimIndent(),
        BackgroundAnalysis::class.java
    )
}
```

#### 4.2.3. 리소스 수집 (LLM + WEB Tool)

```kotlin
@Action(toolGroups = [CoreToolGroups.WEB])
fun collectResources(
    request: NewTechLearningRequest,
    analysis: BackgroundAnalysis,
    profile: MemberLearningProfile,
    context: OperationContext,
): List<LearningResourceRef> {
    val runner = context.ai()
        .withDefaultLlm()
        .withToolGroup(CoreToolGroups.WEB)

    return runner.createObject(
        """(프롬프트: WEB tool 사용 허용, targetTech + backgroundAnalysis를 기반으로
        5~10개 학습 리소스를 찾아 LearningResourceRef 리스트로 반환하도록 지시)""".trimIndent(),
        object : TypeReference<List<LearningResourceRef>>() {}.type
    )
}
```

#### 4.2.4. 학습 플랜 생성 (Goal 달성)

```kotlin
@AchievesGoal(description = "회원의 프로필과 배경을 고려한 새 기술 학습 플랜 생성")
@Action
fun createLearningPlan(
    request: NewTechLearningRequest,
    profile: MemberLearningProfile,
    analysis: BackgroundAnalysis,
    resources: List<LearningResourceRef>,
    context: OperationContext,
): LearningPlan {
    val effectiveDailyMinutes = request.dailyMinutesOverride
        ?: profile.member.learningPreference.dailyMinutes

    val runner = context.ai().withDefaultLlm()

    return runner.createObject(
        """(프롬프트: 프로필/배경/리소스를 모두 포함시킨 후,
        - 3~N주 분량
        - 하루 공부 시간 제약 반영
        - Step/Output/일단위 스케줄을 포함한 LearningPlan 스키마로 반환하도록 지시)""".trimIndent(),
        LearningPlan::class.java
    )
}
```

* Embabel이 각 액션의 입출력 타입을 보고 **자동으로 순서를 플래닝**함.

---

## 5. Tool 설계 & “커뮤니티 → 없으면 WEB” 전략

### 5.1. CommunityTechnologyTool – 커뮤니티 지식 조회

```kotlin
@Component
class CommunityTechnologyTool(
    private val technologyRepository: TechnologyRepository,
    private val knowledgeRepository: TechnologyKnowledgeRepository,
    private val relationshipRepository: TechRelationshipRepository,
) {

    @Tool(description = "커뮤니티가 입력한 기술 지식을 조회한다. key 또는 이름으로 검색.")
    fun findKnowledge(techNameOrKey: String): TechnologyKnowledgeDto? {
        val tech = technologyRepository.findByKey(techNameOrKey.lowercase())
            ?: technologyRepository.findByDisplayNameIgnoreCase(techNameOrKey)
            ?: return null

        val knowledge = knowledgeRepository.findByTechnologyId(tech.id!!)
        val relationships = relationshipRepository.findByFromId(tech.id)

        return TechnologyKnowledgeDto(
            key = tech.key,
            displayName = tech.displayName,
            category = tech.category,
            summary = knowledge?.summary,
            prerequisites = knowledge?.prerequisites ?: emptyList(),
            typicalUseCases = knowledge?.typicalUseCases ?: emptyList(),
            learningTips = knowledge?.learningTips,
            sourceType = knowledge?.sourceType ?: KnowledgeSource.COMMUNITY,
            relationships = relationships.map {
                RelatedTechDto(
                    key = it.to.key,
                    relationType = it.relationType,
                    weight = it.weight
                )
            }
        )
    }
}
```

### 5.2. Fallback 액션 – “먼저 커뮤니티, 없으면 WEB”

```kotlin
@Action(toolGroups = [CoreToolGroups.WEB])
fun loadTechKnowledgeWithFallback(
    request: NewTechLearningRequest,
    context: OperationContext,
    communityTool: CommunityTechnologyTool,
): TechnologyKnowledgeDto {
    val runner = context.ai()
        .withDefaultLlm()
        .withToolObject(communityTool)
        .withToolGroup(CoreToolGroups.WEB)

    return runner.createObject(
        """
        1. 우선 'findKnowledge' tool을 호출해서 커뮤니티 지식이 있는지 확인한다.
        2. 결과가 있으면 그대로 사용한다.
        3. 결과가 없거나 summary/prerequisites 가 거의 비어 있으면,
           WEB tool을 사용해 공식 문서, 블로그, 강의 등을 찾아
           TechnologyKnowledgeDto를 직접 구성한다.
        4. 선행지식은 3~5개 정도로 간결하게 정리한다.
        """.trimIndent(),
        TechnologyKnowledgeDto::class.java
    )
}
```

### 5.3. (선택) AI가 가져온 정보를 DB에 저장하는 Tool

```kotlin
@Component
class TechnologyBootstrapTool(
    private val technologyRepository: TechnologyRepository,
    private val knowledgeRepository: TechnologyKnowledgeRepository,
) {

    @Tool(description = "새로운 기술에 대한 초안 지식을 DB에 저장한다.")
    fun saveAiImportedKnowledge(dto: TechnologyKnowledgeDto): Boolean {
        // key 기준으로 Technology 생성/조회 후,
        // TechnologyKnowledge 생성/업데이트
        return true
    }
}
```

* 나중에는:

  * 커뮤니티 정보가 없을 때 WEB으로 가져온 내용을
  * LLM이 `saveAiImportedKnowledge` tool을 호출해서 DB에 초안으로 저장
  * 커뮤니티가 그걸 기반으로 다듬는 흐름까지 가능

---

## 6. 도메인 메서드에 @Tool 부착 예

```kotlin
data class MemberLearningProfile(
    val member: Member,
    val skills: List<MemberSkill>,
    val activeGoals: List<LearningGoal>,
) {

    @Tool(description = "회원의 일주일 최대 공부 가능 시간을 계산한다.")
    fun weeklyCapacityMinutes(): Int {
        val base = member.learningPreference.dailyMinutes * 5
        val weekendBoost = if (member.learningPreference.weekendBoost) {
            member.learningPreference.dailyMinutes * 2
        } else 0
        return base + weekendBoost
    }

    @Tool(description = "특정 기술명과 연관성이 높은 보유 기술명을 찾는다.")
    fun findRelatedSkills(targetTechName: String): List<String> {
        val lowered = targetTechName.lowercase()
        return skills
            .filter {
                // 간단한 예시 로직
                it.name.lowercase().contains("java") && lowered.contains("kotlin") ||
                it.category == SkillCategory.LANGUAGE
            }
            .map { it.technology?.displayName ?: it.customName ?: "Unknown" }
    }
}
```

* 이렇게 하면 LLM이 학습 플랜을 짤 때

  * `weeklyCapacityMinutes()` 로 총 시간 계산
  * `findRelatedSkills("Kotlin Coroutines")` 로 기존 관련 스킬 파악
    같은 도메인 로직을 직접 호출 가능.

---

## 7. 프로젝트 네이밍

* **프로젝트명**: **SkillWeaver**

  * Skill(기술) + Weaver(엮는 사람/직조)
    → 커뮤니티 기술 지식 + 개인 스택 + AI 플랜을 “엮어주는” 서비스 이미지를 잘 표현
* **artifactId**: `skillweaver`

  * 예:

    * `groupId`: `com.bebeis.skillweaver` 또는 `com.skillweaver`
    * `artifactId`: `skillweaver`
    * 리포명: `skillweaver` 또는 `skillweaver-server`



