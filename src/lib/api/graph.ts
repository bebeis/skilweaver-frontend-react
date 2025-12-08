/**
 * V3 Graph API 클라이언트
 * Neo4j 기반 GraphRAG API - LLM 없이 실시간 응답 (~10ms)
 */

import { apiClient, ApiResponse } from './client';
import {
  RoadmapData,
  LearningPathData,
  RecommendationsData,
  GapAnalysisData,
  GapAnalysisRequest,
} from './types';

/**
 * 기술 로드맵 조회
 * 특정 기술의 선수 지식과 후행 학습을 트리 구조로 반환
 *
 * @param technology - 기술 key (예: 'spring-boot', 'react')
 * @returns 로드맵 데이터 (선수지식, 후속 학습)
 *
 * @example
 * const roadmap = await fetchRoadmap('spring-boot');
 * console.log(roadmap.data.prerequisites.required);
 * // [{ name: "java", displayName: "Java", ... }]
 */
export const fetchRoadmap = async (
  technology: string
): Promise<ApiResponse<RoadmapData>> => {
  return apiClient.get<RoadmapData>(`/graph/roadmap/${encodeURIComponent(technology)}`);
};

/**
 * 학습 경로 탐색
 * 두 기술 간의 최단 학습 경로를 반환
 *
 * @param from - 시작 기술 (현재 보유)
 * @param to - 목표 기술
 * @returns 학습 경로 데이터
 *
 * @example
 * const path = await fetchLearningPath('java', 'mlops');
 * console.log(path.data.path);
 * // [{ step: 1, technology: "python-data", relation: "RECOMMENDED_AFTER" }, ...]
 */
export const fetchLearningPath = async (
  from: string,
  to: string
): Promise<ApiResponse<LearningPathData>> => {
  const params = new URLSearchParams({
    from: from,
    to: to,
  });
  return apiClient.get<LearningPathData>(`/graph/path?${params.toString()}`);
};

/**
 * 연관 기술 추천
 * 특정 기술과 함께 자주 사용되는 기술을 추천
 *
 * @param technology - 기술 key (예: 'react')
 * @returns 추천 기술 목록
 *
 * @example
 * const recs = await fetchRecommendations('react');
 * console.log(recs.data.recommendations);
 * // [{ name: "nextjs", displayName: "Next.js", ... }]
 */
export const fetchRecommendations = async (
  technology: string
): Promise<ApiResponse<RecommendationsData>> => {
  return apiClient.get<RecommendationsData>(
    `/graph/recommendations/${encodeURIComponent(technology)}`
  );
};

/**
 * 갭 분석
 * 사용자 보유 기술과 목표 기술 간의 Missing Link를 분석
 *
 * @param request - 갭 분석 요청 (보유 기술 목록, 목표 기술)
 * @returns 갭 분석 결과 (부족한 기술, 준비도 점수)
 *
 * @example
 * const gap = await analyzeGap({
 *   knownTechnologies: ['java', 'sql'],
 *   targetTechnology: 'spring-boot'
 * });
 * console.log(gap.data.message);
 * // "Java와 SQL 지식이 있으므로 Spring Boot 학습이 가능합니다."
 */
export const analyzeGap = async (
  request: GapAnalysisRequest
): Promise<ApiResponse<GapAnalysisData>> => {
  return apiClient.post<GapAnalysisData>('/graph/gap-analysis', request);
};

/**
 * 갭 분석 (간편 버전)
 *
 * @param knownTechnologies - 보유 기술 key 목록
 * @param targetTechnology - 목표 기술 key
 * @returns 갭 분석 결과
 */
export const analyzeGapSimple = async (
  knownTechnologies: string[],
  targetTechnology: string
): Promise<ApiResponse<GapAnalysisData>> => {
  return analyzeGap({ knownTechnologies, targetTechnology });
};
