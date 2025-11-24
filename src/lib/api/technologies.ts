/**
 * 기술 카탈로그 관련 API
 */

import { apiClient, ApiResponse } from './client';
import { Technology, TechnologyDetail, Pagination } from './types';

export const technologiesApi = {
  /**
   * 기술 목록 조회
   */
  async getTechnologies(params?: {
    category?: string;
    ecosystem?: string;
    active?: boolean;
    page?: number;
    size?: number;
    search?: string;
  }): Promise<
    ApiResponse<{
      technologies: Technology[];
      pagination: Pagination;
    }>
  > {
    const queryParams = new URLSearchParams(params as any).toString();
    const endpoint = `/technologies${queryParams ? `?${queryParams}` : ''}`;
    return apiClient.get(endpoint);
  },

  /**
   * 기술 상세 조회
   */
  async getTechnology(technologyId: number): Promise<ApiResponse<TechnologyDetail>> {
    return apiClient.get(`/technologies/${technologyId}`);
  },

  /**
   * 기술 지식 조회
   */
  async getTechnologyKnowledge(
    technologyId: number
  ): Promise<ApiResponse<any>> {
    return apiClient.get(`/technologies/${technologyId}/knowledge`);
  },

  /**
   * 기술 관계 조회
   */
  async getTechnologyRelationships(
    technologyId: number,
    relationType?: string
  ): Promise<ApiResponse<{ relationships: any[] }>> {
    const queryParams = relationType
      ? `?relationType=${relationType}`
      : '';
    return apiClient.get(
      `/technologies/${technologyId}/relationships${queryParams}`
    );
  },
};

