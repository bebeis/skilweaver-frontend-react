/**
 * V4 기술 카탈로그 API (Graph 통합)
 * 
 * V4 변경사항:
 * - technologyId (Long) → name (String)으로 ID 전략 변경
 * - Graph API 엔드포인트가 Technologies API로 통합
 * - /api/v1/graph/* → /api/v1/technologies/*
 */

import { apiClient, ApiResponse } from './client';
import {
  Technology,
  TechnologyDetail,
  CreateTechnologyRequest,
  UpdateTechnologyRequest,
  CreateRelationshipRequest,
  TechRelationship,
  RoadmapData,
  LearningPathData,
  RecommendationsData,
  GapAnalysisData,
  GapAnalysisRequest,
  TechRelation,
} from './types';

export const technologiesApi = {
  // ==========================================================================
  // 기본 CRUD API
  // ==========================================================================

  /**
   * 기술 목록 조회
   * GET /api/v1/technologies
   */
  async getTechnologies(params?: {
    category?: string;
    active?: boolean;
    search?: string;
    limit?: number;
  }): Promise<ApiResponse<{
    technologies: Technology[];
    totalCount: number;
  }>> {
    const queryParams = new URLSearchParams();
    
    // 값이 존재하고 유효한 경우에만 쿼리 파라미터 추가
    if (params?.category && params.category.trim() !== '') {
      queryParams.set('category', params.category);
    }
    if (params?.active !== undefined && params.active !== null) {
      queryParams.set('active', String(params.active));
    }
    if (params?.search && params.search.trim() !== '') {
      queryParams.set('search', params.search);
    }
    if (params?.limit !== undefined && params.limit !== null && params.limit > 0) {
      queryParams.set('limit', String(params.limit));
    }
    
    const query = queryParams.toString();
    const endpoint = `/technologies${query ? `?${query}` : ''}`;
    return apiClient.get(endpoint);
  },

  /**
   * 기술 상세 조회
   * GET /api/v1/technologies/{name}
   * 
   * @param name - 기술 이름 (예: 'spring-boot', 'java')
   */
  async getTechnology(name: string): Promise<ApiResponse<TechnologyDetail>> {
    return apiClient.get(`/technologies/${encodeURIComponent(name)}`);
  },

  /**
   * 기술 생성 (관리자)
   * POST /api/v1/technologies
   */
  async createTechnology(
    request: CreateTechnologyRequest
  ): Promise<ApiResponse<TechnologyDetail>> {
    return apiClient.post('/technologies', request);
  },

  /**
   * 기술 수정 (관리자)
   * PUT /api/v1/technologies/{name}
   */
  async updateTechnology(
    name: string,
    request: UpdateTechnologyRequest
  ): Promise<ApiResponse<TechnologyDetail>> {
    return apiClient.put(`/technologies/${encodeURIComponent(name)}`, request);
  },

  /**
   * 기술 삭제 (관리자)
   * DELETE /api/v1/technologies/{name}
   */
  async deleteTechnology(name: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/technologies/${encodeURIComponent(name)}`);
  },

  // ==========================================================================
  // 로드맵 & 학습 경로 API (V4 통합 - 기존 Graph API)
  // ==========================================================================

  /**
   * 기술 로드맵 조회
   * GET /api/v1/technologies/{name}/roadmap
   * 
   * 특정 기술의 선수 지식과 후행 학습을 트리 구조로 반환
   * 
   * @param name - 기술 이름 (예: 'spring-boot', 'react')
   */
  async getRoadmap(name: string): Promise<ApiResponse<RoadmapData>> {
    return apiClient.get(`/technologies/${encodeURIComponent(name)}/roadmap`);
  },

  /**
   * 학습 경로 탐색
   * GET /api/v1/technologies/path?from={from}&to={to}
   * 
   * 두 기술 간의 최단 학습 경로를 반환
   * 
   * @param from - 시작 기술 (현재 보유)
   * @param to - 목표 기술
   */
  async getLearningPath(from: string, to: string): Promise<ApiResponse<LearningPathData>> {
    const params = new URLSearchParams({ from, to });
    return apiClient.get(`/technologies/path?${params.toString()}`);
  },

  /**
   * 연관 기술 추천
   * GET /api/v1/technologies/{name}/recommendations
   * 
   * 특정 기술과 함께 자주 사용되는 기술을 추천
   * 
   * @param name - 기술 이름
   */
  async getRecommendations(name: string): Promise<ApiResponse<RecommendationsData>> {
    return apiClient.get(`/technologies/${encodeURIComponent(name)}/recommendations`);
  },

  /**
   * 갭 분석
   * POST /api/v1/technologies/gap-analysis
   * 
   * 사용자 보유 기술과 목표 기술 간의 Missing Link를 분석
   * 
   * @param request - 갭 분석 요청 (보유 기술 목록, 목표 기술)
   */
  async analyzeGap(request: GapAnalysisRequest): Promise<ApiResponse<GapAnalysisData>> {
    return apiClient.post('/technologies/gap-analysis', request);
  },

  // ==========================================================================
  // 기술 관계 관리 API
  // ==========================================================================

  /**
   * 기술 관계 조회
   * GET /api/v1/technologies/{name}/relationships
   * 
   * @param name - 기술 이름
   * @param relationType - 관계 타입 필터 (optional)
   */
  async getRelationships(
    name: string,
    relationType?: TechRelation
  ): Promise<ApiResponse<TechRelationship[]>> {
    const query = relationType ? `?relationType=${relationType}` : '';
    return apiClient.get(`/technologies/${encodeURIComponent(name)}/relationships${query}`);
  },

  /**
   * 관계 생성 (관리자)
   * POST /api/v1/technologies/{name}/relationships
   */
  async createRelationship(
    name: string,
    request: CreateRelationshipRequest
  ): Promise<ApiResponse<TechRelationship>> {
    return apiClient.post(`/technologies/${encodeURIComponent(name)}/relationships`, request);
  },

  /**
   * 관계 삭제 (관리자)
   * DELETE /api/v1/technologies/{from}/relationships/{to}?relationType={type}
   */
  async deleteRelationship(
    from: string,
    to: string,
    relationType: TechRelation
  ): Promise<ApiResponse<void>> {
    return apiClient.delete(
      `/technologies/${encodeURIComponent(from)}/relationships/${encodeURIComponent(to)}?relationType=${relationType}`
    );
  },
};
