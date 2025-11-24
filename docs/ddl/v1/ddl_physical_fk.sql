-- =====================================================================
-- SkillWeaver 도메인 DDL (MySQL 8.x 기준) - FK 명시 버전
--  - CHARACTER SET utf8mb4 / COLLATE utf8mb4_unicode_ci
--  - 모든 PK는 BIGINT AUTO_INCREMENT
--  - PK 컬럼명: <table>_id 관례 사용
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Member & LearningPreference
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS member (
    member_id          BIGINT       NOT NULL AUTO_INCREMENT,
    name               VARCHAR(100) NOT NULL,
    email              VARCHAR(255) NULL,

    target_track       VARCHAR(20)  NOT NULL,  -- enum TargetTrack (BACKEND, FRONTEND, ...)
    experience_level   VARCHAR(20)  NOT NULL,  -- enum ExperienceLevel

    -- Embedded: LearningPreference
    daily_minutes      INT          NOT NULL DEFAULT 60,
    prefer_korean      TINYINT(1)   NOT NULL DEFAULT 1,
    learning_style     VARCHAR(20)  NOT NULL DEFAULT 'PROJECT_BASED', -- enum LearningStyle
    weekend_boost      TINYINT(1)   NOT NULL DEFAULT 1,

    PRIMARY KEY (member_id),

    UNIQUE KEY uk_member_email (email),
    KEY idx_member_track (target_track),
    KEY idx_member_experience (experience_level)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;


-- ---------------------------------------------------------------------
-- 2. Technology (기술 마스터)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS technology (
    technology_id   BIGINT        NOT NULL AUTO_INCREMENT,
    `key`           VARCHAR(100)  NOT NULL,        -- "java", "spring-boot" 등 슬러그
    display_name    VARCHAR(100)  NOT NULL,
    category        VARCHAR(50)   NOT NULL,        -- enum SkillCategory
    ecosystem       VARCHAR(100)  NULL,            -- "JVM", "JavaScript" 등
    official_site   VARCHAR(255)  NULL,
    active          TINYINT(1)    NOT NULL DEFAULT 1,

    PRIMARY KEY (technology_id),

    UNIQUE KEY uk_technology_key (`key`),
    KEY idx_technology_display_name (display_name),
    KEY idx_technology_category (category),
    KEY idx_technology_ecosystem (ecosystem),
    KEY idx_technology_active (active)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;


-- ---------------------------------------------------------------------
-- 3. MemberSkill (회원이 가진 기술)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS member_skill (
    member_skill_id  BIGINT        NOT NULL AUTO_INCREMENT,
    member_id        BIGINT        NOT NULL,        -- member.member_id 의미
    technology_id    BIGINT        NULL,            -- technology.technology_id 의미
    custom_name      VARCHAR(100)  NULL,            -- 정규화 안 된 기술명 (자유 입력)
    level            VARCHAR(50)   NOT NULL,        -- enum SkillLevel
    years_of_use     DOUBLE        NOT NULL DEFAULT 0.0,
    last_used_at     DATE          NULL,
    note             TEXT          NULL,

    PRIMARY KEY (member_skill_id),

    KEY idx_member_skill_member_id (member_id),
    KEY idx_member_skill_technology_id (technology_id),
    KEY idx_member_skill_level (level),
    KEY idx_member_skill_custom_name (custom_name),

    CONSTRAINT fk_member_skill_member
        FOREIGN KEY (member_id) REFERENCES member (member_id),
    CONSTRAINT fk_member_skill_technology
        FOREIGN KEY (technology_id) REFERENCES technology (technology_id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;


-- ---------------------------------------------------------------------
-- 4. LearningGoal (회원별 학습 목표)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS learning_goal (
    learning_goal_id  BIGINT        NOT NULL AUTO_INCREMENT,
    member_id         BIGINT        NOT NULL,          -- member.member_id 의미
    title             VARCHAR(200)  NOT NULL,
    description       TEXT          NOT NULL,
    due_date          DATE          NULL,
    priority          VARCHAR(20)   NOT NULL DEFAULT 'MEDIUM', -- enum GoalPriority

    PRIMARY KEY (learning_goal_id),

    KEY idx_learning_goal_member_id (member_id),
    KEY idx_learning_goal_due_date (due_date),
    KEY idx_learning_goal_priority (priority),

    CONSTRAINT fk_learning_goal_member
        FOREIGN KEY (member_id) REFERENCES member (member_id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;


-- ---------------------------------------------------------------------
-- 5. TechnologyKnowledge (기술 지식: 요약/선행지식/유즈케이스/학습팁)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS technology_knowledge (
    technology_knowledge_id  BIGINT       NOT NULL AUTO_INCREMENT,
    technology_id            BIGINT       NOT NULL,           -- technology.technology_id (1:1 매핑)
    summary                  TEXT         NULL,
    learning_tips            TEXT         NULL,
    source_type              VARCHAR(20)  NOT NULL DEFAULT 'COMMUNITY',  -- enum KnowledgeSource

    PRIMARY KEY (technology_knowledge_id),

    UNIQUE KEY uk_technology_knowledge_technology_id (technology_id),
    KEY idx_technology_knowledge_source_type (source_type),

    CONSTRAINT fk_technology_knowledge_technology
        FOREIGN KEY (technology_id) REFERENCES technology (technology_id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;


-- ---------------------------------------------------------------------
-- 5-1. tech_prerequisite (TechnologyKnowledge.prerequisites)
--      @ElementCollection: knowledge_id + prerequisite_key
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tech_prerequisite (
    tech_prerequisite_id  BIGINT        NOT NULL AUTO_INCREMENT,
    knowledge_id          BIGINT        NOT NULL,       -- technology_knowledge.technology_knowledge_id
    prerequisite_key      VARCHAR(100)  NOT NULL,       -- 요구되는 선행 기술 key (technology.key)

    PRIMARY KEY (tech_prerequisite_id),

    KEY idx_tech_prerequisite_knowledge_id (knowledge_id),
    KEY idx_tech_prerequisite_key (prerequisite_key),

    CONSTRAINT fk_tech_prerequisite_knowledge
        FOREIGN KEY (knowledge_id) REFERENCES technology_knowledge (technology_knowledge_id),
    CONSTRAINT fk_tech_prerequisite_technology_key
        FOREIGN KEY (prerequisite_key) REFERENCES technology (`key`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;


-- ---------------------------------------------------------------------
-- 5-2. tech_use_case (TechnologyKnowledge.typicalUseCases)
--      @ElementCollection: knowledge_id + use_case
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tech_use_case (
    tech_use_case_id  BIGINT        NOT NULL AUTO_INCREMENT,
    knowledge_id      BIGINT        NOT NULL,           -- technology_knowledge.technology_knowledge_id
    `use_case`        VARCHAR(255)  NOT NULL,

    PRIMARY KEY (tech_use_case_id),

    KEY idx_tech_use_case_knowledge_id (knowledge_id),
    KEY idx_tech_use_case_use_case (`use_case`),

    CONSTRAINT fk_tech_use_case_knowledge
        FOREIGN KEY (knowledge_id) REFERENCES technology_knowledge (technology_knowledge_id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;


-- ---------------------------------------------------------------------
-- 6. TechRelationship (기술 간 관계: 선행/다음/대체)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tech_relationship (
    tech_relationship_id  BIGINT       NOT NULL AUTO_INCREMENT,
    from_id               BIGINT       NOT NULL,    -- technology.technology_id
    to_id                 BIGINT       NOT NULL,    -- technology.technology_id
    relation_type         VARCHAR(20)  NOT NULL,    -- enum RelationType (PREREQUISITE, ...)
    weight                INT          NOT NULL DEFAULT 1,

    PRIMARY KEY (tech_relationship_id),

    KEY idx_tech_relationship_from_id (from_id),
    KEY idx_tech_relationship_to_id (to_id),

    UNIQUE KEY uk_tech_relationship_from_to_type (from_id, to_id, relation_type),

    CONSTRAINT fk_tech_relationship_from
        FOREIGN KEY (from_id) REFERENCES technology (technology_id),
    CONSTRAINT fk_tech_relationship_to
        FOREIGN KEY (to_id) REFERENCES technology (technology_id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;


-- ---------------------------------------------------------------------
-- 7. TechnologyEdit (커뮤니티 수정 이력)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS technology_edit (
    technology_edit_id   BIGINT        NOT NULL AUTO_INCREMENT,
    technology_id        BIGINT        NOT NULL,       -- technology.technology_id
    author_id            BIGINT        NOT NULL,       -- member.member_id
    proposed_summary     TEXT          NULL,
    status               VARCHAR(20)   NOT NULL DEFAULT 'PENDING', -- enum EditStatus
    created_at           DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (technology_edit_id),

    KEY idx_technology_edit_technology_id (technology_id),
    KEY idx_technology_edit_author_id (author_id),
    KEY idx_technology_edit_status (status),
    KEY idx_technology_edit_created_at (created_at),

    CONSTRAINT fk_technology_edit_technology
        FOREIGN KEY (technology_id) REFERENCES technology (technology_id),
    CONSTRAINT fk_technology_edit_author
        FOREIGN KEY (author_id) REFERENCES member (member_id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;


-- ---------------------------------------------------------------------
-- 7-1. technology_edit_prerequisite
--      TechnologyEdit.proposedPrerequisites (@ElementCollection)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS technology_edit_prerequisite (
    technology_edit_prerequisite_id  BIGINT        NOT NULL AUTO_INCREMENT,
    edit_id                          BIGINT        NOT NULL,          -- technology_edit.technology_edit_id
    prerequisite                     VARCHAR(100)  NOT NULL,

    PRIMARY KEY (technology_edit_prerequisite_id),

    KEY idx_technology_edit_prereq_edit_id (edit_id),
    KEY idx_technology_edit_prereq_value (prerequisite),

    CONSTRAINT fk_technology_edit_prerequisite_edit
        FOREIGN KEY (edit_id) REFERENCES technology_edit (technology_edit_id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- 끝
-- =====================================================================
