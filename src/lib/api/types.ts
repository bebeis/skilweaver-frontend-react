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
export interface MemberSkill {
  memberSkillId: number;
  technologyId?: number;
  technologyKey?: string;
  displayName?: string;
  customName?: string;
  level: SkillLevel;
  yearsOfUse: number;
  lastUsedAt?: string;
  note?: string;
}

export interface AddSkillRequest {
  technologyId?: number;
  customName?: string;
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

// 기술 카탈로그
export interface Technology {
  technologyId: number;
  key: string;
  displayName: string;
  category: SkillCategory;
  ecosystem?: string;
  officialSite?: string;
  active: boolean;
}

export interface TechnologyKnowledge {
  summary?: string;
  learningTips?: string;
  sourceType: KnowledgeSource;
}

export interface TechnologyDetail extends Technology {
  knowledge?: TechnologyKnowledge;
  prerequisites: Array<{
    prerequisiteKey: string;
    displayName: string;
  }>;
  useCases: string[];
  // v2 fields - Learning metadata
  learningRoadmap?: string;
  estimatedLearningHours?: number;
  relatedTechnologies: string[];
  communityPopularity?: number; // 1-10
  jobMarketDemand?: number; // 1-10
}

// v2 - Technology Admin Requests
export interface CreateTechnologyRequest {
  key: string;
  displayName: string;
  category: SkillCategory;
  ecosystem?: string;
  officialSite?: string;
  // v2 learning metadata
  learningRoadmap?: string;
  estimatedLearningHours?: number;
  prerequisites?: string[];
  relatedTechnologies?: string[];
  communityPopularity?: number;
  jobMarketDemand?: number;
}

export interface UpdateTechnologyRequest {
  displayName?: string;
  ecosystem?: string;
  officialSite?: string;
  active?: boolean;
  // v2 learning metadata
  learningRoadmap?: string;
  estimatedLearningHours?: number;
  prerequisites?: string[];
  relatedTechnologies?: string[];
  communityPopularity?: number;
  jobMarketDemand?: number;
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

