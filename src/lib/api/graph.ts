/**
 * V4 Graph API 클라이언트
 * 
 * ⚠️ V4 Breaking Change:
 * 기존 /api/v1/graph/* 엔드포인트가 /api/v1/technologies/*로 통합되었습니다.
 * 
 * 이 파일은 기존 코드와의 호환성을 위해 유지되며,
 * 내부적으로 V4 Technologies API 엔드포인트를 호출합니다.
 * 
 * 엔드포인트 변경:
 * - GET /api/v1/graph/roadmap/{tech} → GET /api/v1/technologies/{name}/roadmap
 * - GET /api/v1/graph/path → GET /api/v1/technologies/path
 * - GET /api/v1/graph/recommendations/{tech} → GET /api/v1/technologies/{name}/recommendations
 * - POST /api/v1/graph/gap-analysis → POST /api/v1/technologies/gap-analysis
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
 * V4: GET /api/v1/technologies/{name}/roadmap
 * 
 * 특정 기술의 선수 지식과 후행 학습을 트리 구조로 반환
 *
 * @param technology - 기술 name (예: 'spring-boot', 'react')
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
  // V4: /graph/roadmap/{tech} → /technologies/{name}/roadmap
  return apiClient.get<RoadmapData>(`/technologies/${encodeURIComponent(technology)}/roadmap`);
};

/**
 * 학습 경로 탐색
 * V4: GET /api/v1/technologies/path?from={from}&to={to}
 * 
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
  // V4: /graph/path → /technologies/path
  return apiClient.get<LearningPathData>(`/technologies/path?${params.toString()}`);
};

/**
 * 연관 기술 추천
 * V4: GET /api/v1/technologies/{name}/recommendations
 * 
 * 특정 기술과 함께 자주 사용되는 기술을 추천
 *
 * @param technology - 기술 name (예: 'react')
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
  // V4: /graph/recommendations/{tech} → /technologies/{name}/recommendations
  return apiClient.get<RecommendationsData>(
    `/technologies/${encodeURIComponent(technology)}/recommendations`
  );
};

/**
 * 갭 분석
 * V4: POST /api/v1/technologies/gap-analysis
 * 
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
  // V4: /graph/gap-analysis → /technologies/gap-analysis
  return apiClient.post<GapAnalysisData>('/technologies/gap-analysis', request);
};

/**
 * 갭 분석 (간편 버전)
 *
 * @param knownTechnologies - 보유 기술 name 목록
 * @param targetTechnology - 목표 기술 name
 * @returns 갭 분석 결과
 */
export const analyzeGapSimple = async (
  knownTechnologies: string[],
  targetTechnology: string
): Promise<ApiResponse<GapAnalysisData>> => {
  return analyzeGap({ knownTechnologies, targetTechnology });
};
