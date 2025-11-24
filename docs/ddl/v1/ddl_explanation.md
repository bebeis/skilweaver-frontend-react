## 1. member – “학습자 자체” 애그리거트 루트

```dbml
Table member {
  member_id        bigint [pk, increment]
  name             varchar(100)
  email            varchar(255)

  target_track     varchar(20)  // BACKEND, FRONTEND ...
  experience_level varchar(20)  // BEGINNER, INTERMEDIATE ...

  daily_minutes    int
  prefer_korean    boolean
  learning_style   varchar(20)  // DOC_FIRST, VIDEO_FIRST, PROJECT_BASED
  weekend_boost    boolean
}
```

**역할**

* SkillWeaver의 **핵심 주인공(학습자)**.
* 우테코 준비 중인 너/사람들을 표현하는 엔티티.
* “내가 어떤 트랙을 목표로 하고, 어느 정도 레벨이고, 어떤 학습 스타일인지”가 들어있음.

**연관관계**

* `member_skill.member_id`
  → 이 사람이 어떤 기술들을 어느 정도 다루는지
* `learning_goal.member_id`
  → 이 사람이 현재 어떤 학습 목표를 가지고 있는지
* `technology_edit.author_id`
  → 이 사람이 기술 지식에 어떤 수정 기여를 했는지

**이걸로 가능한 도메인 로직**

* 에이전트가 학습 플랜 만들 때:

  * `target_track` + `experience_level` + `daily_minutes` + `learning_style` 바탕으로

    * 학습 난이도 조절 (너무 어려운/쉬운 플랜 피하기)
    * 하루 분량, 주차 수 계산
* 커뮤니티 기능:

  * “이 기술 지식은 어떤 유저들이 주로 수정했는지” tracking (author_id)

---

## 2. member_skill – “내가 가진 기술 스택”

```dbml
Table member_skill {
  member_skill_id bigint [pk]
  member_id       bigint [not null]
  technology_id   bigint
  custom_name     varchar(100)
  level           varchar(50)  // SkillLevel
  years_of_use    float
  last_used_at    date
  note            text
}
```

**역할**

* **Member가 어떤 기술을 어느 수준으로 알고 있는지** 표현.
* `technology_id`가 있으면 **정규화된 기술** (Technology 테이블 기준)
* `custom_name`만 있으면 **아직 정식 등록되지 않은 기술/라이브러리**

**연관관계**

* `member_id → member.member_id`
* `technology_id → technology.technology_id (nullable)`

**도메인 로직**

* 에이전트 입장에서:

  * “지금 배우려는 기술의 **선행지식** 중에서 이 Member가 이미 알고 있는 건 뭔지”
  * “무슨 언어/프레임워크 배경을 가진 사람인지”

* 예:

  * target: Spring Boot
  * member_skill: Java(ADVANCED), HTTP(INTERMEDIATE), SQL(BEGINNER)
    → “자바/HTTP는 빠르게 스킵하고, JPA/SQL 부분을 더 자세히 다루자” 같은 의사결정

* UI/리포트:

  * 프로필 페이지에서 태그 형태로 스택 보여주기
  * `level`, `years_of_use`, `last_used_at` 기반으로 “핵심 스택 vs 한때 써본 스택” 구분

---

## 3. learning_goal – “지금 당장의 학습 목표 컨텍스트”

```dbml
Table learning_goal {
  learning_goal_id bigint [pk]
  member_id        bigint [not null]
  title            varchar(200)
  description      text
  due_date         date
  priority         varchar(20)  // GoalPriority
}
```

**역할**

* “우테코 프리코스 완주”, “백엔드 취업”, “사이드 프로젝트 완성” 같은 **목표**.
* 같은 Member가 여러 개 가질 수 있음.

**연관관계**

* `member_id → member.member_id`

**도메인 로직**

* 학습 플랜을 만들 때, 단순히 기술만 보는 게 아니라 **목표와 연결**해서 플랜을 짜게 해줌.

  * 예: “3주 안에, 우테코 프리코스 3주차 미션 대비” 같은 목표가 있으면

    * `due_date`까지의 남은 기간
    * `priority` 가 HIGH 인 것 위주로 시간을 배분
* 나중에:

  * “이 플랜은 어떤 Goal에 속한 플랜인지” 연결해서 관리할 수도 있음
    (v1에서는 LearningPlan에 goal_id를 안 달았지만 방향성은 있음)

---

## 4. technology – “정규화된 기술 목록 (기술 마스터)”

```dbml
Table technology {
  technology_id bigint [pk]
  key           varchar(100) // slug, unique
  display_name  varchar(100)
  category      varchar(50)  // SkillCategory
  ecosystem     varchar(100) // JVM, JavaScript ...
  official_site varchar(255)
  active        boolean
}
```

**역할**

* SkillWeaver의 **기술 카탈로그**.
* 커뮤니티가 합의한 정식 이름/종류/분류를 담고 있음.
* `key`는 LLM/에이전트가 쓰기 좋은 슬러그: `"java"`, `"spring-boot"` 등.

**연관관계**

* `member_skill.technology_id`
  → “이 MemberSkill은 이 Technology를 참조한다”
* `technology_knowledge.technology_id`
  → “이 기술에 대한 설명/학습 정보”
* `tech_relationship.from_id / to_id`
  → 기술 그래프의 노드
* `technology_edit.technology_id`
  → 어떤 기술의 지식을 수정했는지

**도메인 로직**

* “Spring Boot” 가 여러 표기로 입력되어도 (`"spring"`, `"스프링 부트"` 등)
  → `Technology(key="spring-boot")` 하나로 수렴
* 카테고리/에코시스템 기반 필터링:

  * “JVM 기반 백엔드 프레임워크만 보기”
  * “DB 관련 기술만 보기”
* 에이전트가:

  * “이 Member가 가진 스킬 중에서 **Spring 생태계 기술만 추리기**”
  * 추천 플랜에서 “비슷한 ecosystem의 다른 기술” 추천

---

## 5. technology_knowledge – “기술 설명 + 학습 팁 (커뮤니티 지식 베이스)”

```dbml
Table technology_knowledge {
  technology_knowledge_id bigint [pk]
  technology_id           bigint [not null]
  summary                 text
  learning_tips           text
  source_type             varchar(20) // KnowledgeSource
}
```

**역할**

* `Technology` 자체는 “이름/분류/공식사이트” 정도 수준이고,
* **사람들이 이해하기 쉽게 풀어쓴 설명/학습 팁**은 여기 저장.

  * “이 기술이 뭔지”
  * “언제 쓰면 좋은지”
  * “어떻게 공부하면 좋은지”

**연관관계**

* `technology_id → technology.technology_id` (1:1)
* `tech_prerequisite.knowledge_id`
* `tech_use_case.knowledge_id`

**도메인 로직**

* 에이전트가 학습 플랜 만들 때 1순위로 참고하는 **도메인 지식**:

  * “Spring Boot란?”을 외부 웹 검색 전에 여기서 먼저 얻어갈 수 있음.
  * `source_type`이 COMMUNITY면 → “사람들이 직접 쓴 설명”
  * AI_IMPORTED면 → “AI가 채워넣은 초안”

---

## 6. tech_prerequisite – “이 기술의 선행지식 그래프(부분)”

```dbml
Table tech_prerequisite {
  tech_prerequisite_id bigint [pk]
  knowledge_id         bigint [not null]
  prerequisite_key     varchar(100) [not null] // technology.key
}
```

**역할**

* **“이 기술을 배우기 전에 알면 좋은 기술/개념”**의 목록.
* `prerequisite_key`는 `technology.key` 기준이라, 다른 Technology와 느슨하게 연결된 구조.

**연관관계**

* `knowledge_id → technology_knowledge.technology_knowledge_id`
* `prerequisite_key → technology.key` (논리 FK)

**도메인 로직**

* 학습 플랜 생성시 핵심 로직:

  1. target 기술의 `technology_knowledge` 조회
  2. 그에 연결된 `tech_prerequisite` 목록 조회
  3. 각 `prerequisite_key` 를 Member의 `member_skill` 과 비교

     * 이미 알고 있는 것
     * 부족한 것

* 예:

  * `Kotlin Coroutines` 의 `prerequisite_key` = `["kotlin", "thread", "concurrency-basics"]`
  * Member 스킬에 `kotlin`만 있음
  * → 플랜 초반에 “스레드/동시성 기초”를 별도 Step으로 넣어줄 수 있음

---

## 7. tech_use_case – “이 기술이 주로 쓰이는 용도”

```dbml
Table tech_use_case {
  tech_use_case_id bigint [pk]
  knowledge_id     bigint [not null]
  use_case         varchar(255) [not null]
}
```

**역할**

* “Spring Boot → REST API 서버 개발, 백엔드 비즈니스 서버”
* “Kotlin Coroutines → 비동기/동시성 제어”
* 같은 **대표적인 사용처들** 리스트.

**연관관계**

* `knowledge_id → technology_knowledge.technology_knowledge_id`

**도메인 로직**

* 에이전트가 “이 기술이 이 사람의 목표랑 맞는지” 판단할 때 참고:

  * 목표: “사이드 프로젝트로 웹 백엔드 만들고 싶다”
  * target: `Kubernetes` 라면

    * use_case: “컨테이너 오케스트레이션, 운영 환경, 인프라”
    * → 현재 목표와는 살짝 거리가 있으니 우선순위를 낮추거나 다른 기술부터 추천

* UI:

  * 기술 상세페이지에서 “이 기술은 보통 이런 데 쓰여요” 영역에 출력

---

## 8. tech_relationship – “기술 간 그래프(다음/선행/대체)”

```dbml
Table tech_relationship {
  tech_relationship_id bigint [pk]
  from_id              bigint [not null] // technology.technology_id
  to_id                bigint [not null] // technology.technology_id
  relation_type        varchar(20)       // RelationType
  weight               int
}
```

**역할**

* **기술 그래프의 엣지**.

  * `PREREQUISITE`: A → B : B를 하기 전에 A를 알면 좋다
  * `NEXT_STEP`: A → B : A 다음 단계로 B를 배우기 좋다
  * `ALTERNATIVE`: A ↔ B : 비슷한 역할의 대체 기술

**연관관계**

* `from_id → technology.technology_id`
* `to_id   → technology.technology_id`

**도메인 로직**

* 추천 플로우에서:

  * “Spring Boot 이후에 무엇을 배우면 좋을까?”
    → `tech_relationship`에서 `from_id = springBoot, relation_type = NEXT_STEP` 찾기
  * “NestJS와 비슷한 백엔드 프레임워크?”
    → `ALTERNATIVE` 관계를 탐색

* 장기적으로:

  * 그래프 탐색 (BFS/DFS)로 “백엔드 개발자의 학습 로드맵” 같은 걸 그릴 수도 있음.

> v1에는 없어도 돌아가지만, **SkillWeaver 컨셉을 살리는 핵심 확장 포인트**.

---

## 9. technology_edit / technology_edit_prerequisite – “커뮤니티 수정 이력”

```dbml
Table technology_edit {
  technology_edit_id bigint [pk]
  technology_id      bigint [not null]
  author_id          bigint [not null]
  proposed_summary   text
  status             varchar(20) // EditStatus
  created_at         datetime
}

Table technology_edit_prerequisite {
  technology_edit_prerequisite_id bigint [pk]
  edit_id                         bigint [not null]
  prerequisite                    varchar(100) [not null]
}
```

**역할**

* 위키처럼 **누가 어떤 수정을 제안했는지** 추적.

  * `technology_edit`: 수정 제안의 헤더
  * `technology_edit_prerequisite`: 선행지식 리스트 수정 제안

**연관관계**

* `technology_id → technology.technology_id`
* `author_id → member.member_id`
* `edit_id → technology_edit.technology_edit_id`

**도메인 로직**

* 커뮤니티 기능:

  * “어떤 Member가 어떤 기술 지식에 기여했는지”
  * “Pending 상태인 수정들만 모아서 운영자가 검토”
  * 나중에 “신뢰도 높은 사용자가 올린 건 바로 승인” 같은 정책도 가능

* 에이전트와의 연결:

  * 초기에는 `technology_knowledge`만 보게 할 수도 있고,
  * 나중에는 `PENDING` 상태의 edit를 참고해서 “최근에 제안된 변경사항” 같은 메타 정보도 활용할 수 있음.

> 현실적으로 v1에서는 없어도 되고,
> 그냥 `technology_knowledge` 를 direct edit + `updated_at`, `updated_by` 정도만 둬도 충분함.
> 이 두 테이블은 **“위키화/이력 관리까지 하고 싶을 때”용 설계**라고 보면 돼.

---

## 10. 마지막 Ref 한 줄

```dbml
Ref: "member"."target_track" < "member"."member_id"
```

이건 의미가 없는 라인이라 **지우는 게 맞음**이야.
(자기 자신 컬럼끼리 연결되어 있고, 도메인적으로도 안 맞음)

---

## 한 번에 정리하면

* **member**
  → “누가 배우는가?”
* **member_skill**
  → “그 사람은 뭘 어느 정도까지 아는가?”
* **learning_goal**
  → “무엇을 목표로 언제까지 배우고 싶은가?”

이 세 개가 “학습자” 쪽 애그리거트들.

* **technology**
  → “세계(또는 커뮤니티)가 합의한 기술 카탈로그”
* **technology_knowledge** / **tech_prerequisite** / **tech_use_case**
  → “각 기술의 설명, 선행지식, 사용처”를 담은 지식 베이스
* **tech_relationship**
  → “기술들과의 관계 그래프(선행/다음/대체)”
* **technology_edit (+ *_prerequisite)**
  → “커뮤니티가 그 지식을 어떻게 수정/기여했는지” 이력

이 전체 구조 덕분에, Embabel 에이전트는:

1. Member + Skill + Goal로 개인의 학습 상황을 이해하고,
2. Technology + Knowledge + Prerequisite/Relationship으로 기술 도메인 지식을 읽어오고,
3. 그 두 축을 엮어서 **개인 맞춤형 학습 플랜**을 만들어낼 수 있게 되는 거야.
