/**
 * API 타입 정의
 */

// Enums
export type TargetTrack = 'BACKEND' | 'FRONTEND' | 'FULLSTACK' | 'MOBILE' | 'DATA' | 'DEVOPS';
export type ExperienceLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type LearningStyle = 'DOC_FIRST' | 'VIDEO_FIRST' | 'PROJECT_BASED' | 'BALANCED' | 'HANDS_ON' | 'THEORY_FIRST';
export type SkillCategory = 'LANGUAGE' | 'FRAMEWORK' | 'LIBRARY' | 'TOOL' | 'DB' | 'PLATFORM' | 'ETC' | 'DEVOPS' | 'API' | 'DATABASE';
export type SkillLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
export type GoalPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type GoalStatus = 'ACTIVE' | 'COMPLETED' | 'ABANDONED' | 'PLANNING';
export type LearningPlanStatus = 'ACTIVE' | 'COMPLETED' | 'ABANDONED' | 'DRAFT';
export type StepDifficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type AgentRunStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
export type KnowledgeSource = 'COMMUNITY' | 'AI_IMPORTED';
// V4: TechRelation (Graph 관계 타입)
export type TechRelation =
  | 'DEPENDS_ON'
  | 'RECOMMENDED_AFTER'
  | 'CONTAINS'
  | 'EXTENDS'
  | 'USED_WITH'
  | 'ALTERNATIVE_TO';

// V4: Difficulty 레벨
export type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

// Deprecated: V3 이하
export type RelationType = 'PREREQUISITE' | 'NEXT_STEP' | 'ALTERNATIVE';
export type ResourceType = 'DOC' | 'VIDEO' | 'BLOG' | 'COURSE' | 'REPO' | 'DOCUMENTATION' | 'TUTORIAL' | 'ARTICLE' | 'PROJECT';

// v2 Feedback Types
export type FeedbackType =
  | 'HELPFUL'
  | 'TOO_EASY'
  | 'TOO_HARD'
  | 'IRRELEVANT'
  | 'TIME_ISSUE'
  | 'RESOURCE_ISSUE'
  | 'GENERAL';

// 회원
export interface LearningPreference {
  dailyMinutes: number;
  preferKorean: boolean;
  learningStyle: LearningStyle;
  weekendBoost: boolean;
}

export interface Member {
  memberId: number;
  name: string;
  email: string;
  targetTrack: TargetTrack;
  experienceLevel: ExperienceLevel;
  learningPreference?: LearningPreference;
  createdAt: string;
  updatedAt: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  targetTrack: TargetTrack;
  experienceLevel: ExperienceLevel;
  learningPreference: LearningPreference;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  memberId: number;
  name: string;
  email: string;
}

// 기술 스택
// V4: technologyId, technologyKey, displayName → technologyName 단일 필드로 통합
export interface MemberSkill {
  memberSkillId: number;
  technologyName: string;         // V4: Neo4j name으로 직접 참조
  level: SkillLevel;
  yearsOfUse: number;
  lastUsedAt?: string;
  note?: string;
}

// V4: technologyId → technologyName
export interface AddSkillRequest {
  technologyName: string;         // V4: Neo4j name (예: "spring-boot")
  level: SkillLevel;
  yearsOfUse: number;
  lastUsedAt?: string;
  note?: string;
}

export interface UpdateSkillRequest {
  level: SkillLevel;
  yearsOfUse: number;
  lastUsedAt?: string;
  note?: string;
}

// 학습 목표
export interface LearningGoal {
  learningGoalId: number;
  title: string;
  description: string;
  dueDate?: string;
  priority: GoalPriority;
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGoalRequest {
  title: string;
  description: string;
  dueDate?: string;
  priority: GoalPriority;
}

export interface UpdateGoalRequest {
  title: string;
  description: string;
  dueDate?: string;
  priority: GoalPriority;
  status: GoalStatus;
}

// 학습 플랜
export interface LearningStep {
  stepId: number;
  order: number;
  title: string;
  description: string;
  estimatedHours: number;
  difficulty: StepDifficulty;
  completed: boolean;
  objectives: string[];
  suggestedResources: LearningResource[];
}

export interface LearningResource {
  type: ResourceType;
  title: string;
  url: string;
  language: string;
}

export interface DailySchedule {
  dayIndex: number;
  date: string;
  allocatedMinutes: number;
  stepRef: number;
  tasks: string[];
}

export interface BackgroundAnalysis {
  existingRelevantSkills: string[];
  knowledgeGaps: string[];
  recommendations: string[];
  riskFactors: string[];
}

export interface LearningPlan {
  learningPlanId: number;
  memberId: number;
  targetTechnology: string;
  totalWeeks: number;
  totalHours: number;
  status: LearningPlanStatus;
  progress: number;
  steps: LearningStep[];
  dailySchedule: DailySchedule[];
  backgroundAnalysis: BackgroundAnalysis;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
}

export interface CreateLearningPlanRequest {
  targetTechnology: string;
  targetCompletionWeeks?: number;
  focusAreas?: string[];
  dailyMinutesOverride?: number;
}

export interface UpdatePlanProgressRequest {
  progress: number;
  status: LearningPlanStatus;
}

// V4 기술 카탈로그 (Neo4j Graph 기반)
export interface Technology {
  name: string;                    // V4: technologyId → name (String PK)
  displayName: string;
  category: SkillCategory;
  difficulty?: Difficulty;         // V4 신규
  ecosystem?: string;
  officialSite?: string;
  active: boolean;
  description?: string;            // V4: knowledge.summary → description
  learningRoadmap?: string;
  estimatedLearningHours?: number;
  learningTips?: string;           // V4: knowledge.learningTips → learningTips
  useCases?: string[];             // V4 신규
  communityPopularity?: number;    // 1-10
  jobMarketDemand?: number;        // 1-10
}

// V4: TechNode (관계에서 사용되는 간략 기술 노드)
export interface TechNode {
  name: string;
  displayName: string;
  category: SkillCategory;
  difficulty?: Difficulty;
}

// V4: 기술 상세 (Prerequisites, RelatedTechnologies 포함)
export interface TechnologyDetail extends Technology {
  prerequisites?: {
    required: TechNode[];
    recommended: TechNode[];
  };
  relatedTechnologies?: TechNode[];
}

// V4: 기술 관계
export interface TechRelationship {
  from: string;
  to: string;
  relation: TechRelation;
  weight: number;
}

// Deprecated: V3 이하
export interface TechnologyKnowledge {
  summary?: string;
  learningTips?: string;
  sourceType: KnowledgeSource;
}

// V4 - Technology Admin Requests
export interface CreateTechnologyRequest {
  name: string;                   // V4: key → name
  displayName: string;
  category: SkillCategory;
  difficulty?: Difficulty;        // V4 신규
  ecosystem?: string;
  officialSite?: string;
  description?: string;           // V4 신규
  learningRoadmap?: string;
  estimatedLearningHours?: number;
  learningTips?: string;          // V4 신규
  useCases?: string[];            // V4 신규
  communityPopularity?: number;
  jobMarketDemand?: number;
  relations?: Array<{             // V4 신규: 관계 생성
    to: string;
    relation: TechRelation;
    weight?: number;
  }>;
}

export interface UpdateTechnologyRequest {
  displayName?: string;
  difficulty?: Difficulty;        // V4 신규
  ecosystem?: string;
  officialSite?: string;
  active?: boolean;
  description?: string;           // V4 신규
  learningRoadmap?: string;
  estimatedLearningHours?: number;
  learningTips?: string;          // V4 신규
  useCases?: string[];            // V4 신규
  communityPopularity?: number;
  jobMarketDemand?: number;
}

// V4: 관계 생성 요청
export interface CreateRelationshipRequest {
  to: string;
  relation: TechRelation;
  weight?: number;
}

// v2 - Feedback System
export interface Feedback {
  id: number;
  learningPlanId: number;
  stepId?: number;
  rating: number; // 1-5
  feedbackType: FeedbackType;
  comment?: string;
}

export interface SubmitFeedbackRequest {
  learningPlanId: number;
  stepId?: number;
  rating: number; // 1-5
  feedbackType: FeedbackType;
  comment?: string;
}

export interface FeedbackSummary {
  planId: number;
  averageRating: number;
  totalFeedbackCount: number;
  typeBreakdown: Record<FeedbackType, number>;
}

// Pagination
export interface Pagination {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// =============================================================================
// V4 Graph API Types (Technologies API로 통합)
// =============================================================================

// V4: GraphRelationType은 TechRelation으로 통합 (위에 정의됨)
// 호환성을 위해 alias 제공
export type GraphRelationType = TechRelation;

export type GapPriority = 'HIGH' | 'MEDIUM' | 'LOW';

// V4: Roadmap API (GET /api/v1/technologies/{name}/roadmap)
export interface RoadmapTechnology {
  name: string;
  displayName: string;
  category: SkillCategory;
  difficulty?: Difficulty;
}

export interface RoadmapPrerequisites {
  required: RoadmapTechnology[];
  recommended: RoadmapTechnology[];
}

export interface RoadmapData {
  technology: string;
  displayName: string;
  prerequisites: RoadmapPrerequisites;
  nextSteps: RoadmapTechnology[];
}

// V4: Learning Path API (GET /api/v1/technologies/path)
export interface PathStep {
  step: number;
  technology: string;
  relation: TechRelation;
}

export interface LearningPathData {
  from: string;
  to: string;
  totalSteps: number;
  path: PathStep[];
}

// V4: Recommendations API (GET /api/v1/technologies/{name}/recommendations)
export interface RecommendedTechnology {
  name: string;
  displayName: string;
  relation: TechRelation;
  category: SkillCategory;
}

export interface RecommendationsData {
  technology: string;
  recommendations: RecommendedTechnology[];
}

// V4: Gap Analysis API (POST /api/v1/technologies/gap-analysis)
export interface MissingTechnology {
  name: string;
  displayName: string;
  priority: GapPriority;
}

export interface GapAnalysisRequest {
  knownTechnologies: string[];
  targetTechnology: string;
}

export interface GapAnalysisData {
  target: string;
  known: string[];
  missing: MissingTechnology[];
  ready: boolean;
  readinessScore: number;
  message: string;
}

// V4: API Error Codes
export type GraphErrorCode =
  | 'TECHNOLOGY_NOT_FOUND'
  | 'NO_PATH_FOUND'
  | 'GRAPH_SERVICE_UNAVAILABLE'
  | 'TECHNOLOGY_ALREADY_EXISTS'
  | 'INVALID_RELATIONSHIP';

