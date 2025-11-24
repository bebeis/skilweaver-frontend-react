/**
 * 기술 스택 관련 API
 */

import { apiClient, ApiResponse } from './client';
import { MemberSkill, AddSkillRequest, UpdateSkillRequest } from './types';

export const skillsApi = {
  /**
   * 회원 기술 스택 목록 조회
   */
  async getSkills(
    memberId: number,
    params?: { category?: string; level?: string }
  ): Promise<ApiResponse<{ skills: MemberSkill[]; totalCount: number }>> {
    // Filter out undefined values to avoid sending "undefined" as string in query params
    const filteredParams = Object.fromEntries(
      Object.entries(params || {}).filter(([, value]) => value !== undefined)
    );
    const queryParams = new URLSearchParams(filteredParams as any).toString();
    const endpoint = `/members/${memberId}/skills${queryParams ? `?${queryParams}` : ''}`;
    return apiClient.get(endpoint);
  },

  /**
   * 기술 스택 추가
   */
  async addSkill(
    memberId: number,
    request: AddSkillRequest
  ): Promise<ApiResponse<MemberSkill>> {
    return apiClient.post(`/members/${memberId}/skills`, request);
  },

  /**
   * 기술 스택 수정
   */
  async updateSkill(
    memberId: number,
    skillId: number,
    request: UpdateSkillRequest
  ): Promise<ApiResponse<MemberSkill>> {
    return apiClient.put(`/members/${memberId}/skills/${skillId}`, request);
  },

  /**
   * 기술 스택 삭제
   */
  async deleteSkill(memberId: number, skillId: number): Promise<ApiResponse<null>> {
    return apiClient.delete(`/members/${memberId}/skills/${skillId}`);
  },
};

