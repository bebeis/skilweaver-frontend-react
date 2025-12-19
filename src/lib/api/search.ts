import { apiClient, ApiResponse } from './client';
import {
  HybridSearchRequest,
  HybridSearchResponse,
  LearningPathWithDocs,
  GapAnalysisRequestV6,
  GapAnalysisWithResources,
} from './types';

/**
 * Hybrid Search API
 * POST /api/v1/search/hybrid
 */
export const searchHybrid = async (
  request: HybridSearchRequest
): Promise<ApiResponse<HybridSearchResponse>> => {
  return apiClient.post<HybridSearchResponse>('/search/hybrid', request);
};

/**
 * Learning Path with Docs API
 * GET /api/v1/search/learning-path/{technology}
 */
export const fetchLearningPathWithDocs = async (
  technology: string
): Promise<ApiResponse<LearningPathWithDocs>> => {
  return apiClient.get<LearningPathWithDocs>(`/search/learning-path/${encodeURIComponent(technology)}`);
};

/**
 * Gap Analysis with Resources API
 * POST /api/v1/search/gap-analysis
 */
export const analyzeGapWithResources = async (
  request: GapAnalysisRequestV6
): Promise<ApiResponse<GapAnalysisWithResources>> => {
  return apiClient.post<GapAnalysisWithResources>('/search/gap-analysis', request);
};
