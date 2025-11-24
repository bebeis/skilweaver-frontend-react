/**
 * 학습 목표 관련 API
 */

import { apiClient, ApiResponse } from './client';
import { LearningGoal, CreateGoalRequest, UpdateGoalRequest } from './types';

export const goalsApi = {
  /**
   * 학습 목표 목록 조회
   */
  async getGoals(
    memberId: number,
    params?: { priority?: string; status?: string }
  ): Promise<ApiResponse<{ goals: LearningGoal[]; totalCount: number }>> {
    const queryParams = new URLSearchParams(params as any).toString();
    const endpoint = `/members/${memberId}/goals${queryParams ? `?${queryParams}` : ''}`;
    return apiClient.get(endpoint);
  },

  /**
   * 학습 목표 생성
   */
  async createGoal(
    memberId: number,
    request: CreateGoalRequest
  ): Promise<ApiResponse<LearningGoal>> {
    return apiClient.post(`/members/${memberId}/goals`, request);
  },

  /**
   * 학습 목표 수정
   */
  async updateGoal(
    memberId: number,
    goalId: number,
    request: UpdateGoalRequest
  ): Promise<ApiResponse<LearningGoal>> {
    return apiClient.put(`/members/${memberId}/goals/${goalId}`, request);
  },

  /**
   * 학습 목표 삭제
   */
  async deleteGoal(memberId: number, goalId: number): Promise<ApiResponse<null>> {
    return apiClient.delete(`/members/${memberId}/goals/${goalId}`);
  },
};

