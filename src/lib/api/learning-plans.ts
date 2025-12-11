/**
 * 학습 플랜 관련 API
 */

import { apiClient, ApiResponse } from './client';
import {
  LearningPlan,
  CreateLearningPlanRequest,
  UpdatePlanProgressRequest,
  Pagination,
} from './types';

export const learningPlansApi = {
  /**
   * 학습 플랜 생성
   */
  async createPlan(
    memberId: number,
    request: CreateLearningPlanRequest
  ): Promise<ApiResponse<LearningPlan>> {
    return apiClient.post(`/members/${memberId}/learning-plans`, request);
  },

  /**
   * 학습 플랜 목록 조회
   */
  async getPlans(
    memberId: number,
    params?: { status?: string; page?: number; size?: number }
  ): Promise<
    ApiResponse<{
      plans: Array<Omit<LearningPlan, 'steps' | 'dailySchedule' | 'backgroundAnalysis'>>;
      pagination: Pagination;
    }>
  > {
    const queryParams = new URLSearchParams(params as any).toString();
    const endpoint = `/members/${memberId}/learning-plans${queryParams ? `?${queryParams}` : ''}`;
    return apiClient.get(endpoint);
  },

  /**
   * 학습 플랜 상세 조회
   */
  async getPlan(memberId: number, planId: number): Promise<ApiResponse<LearningPlan>> {
    return apiClient.get(`/members/${memberId}/learning-plans/${planId}`);
  },

  /**
   * 학습 플랜 진행도 업데이트
   */
  async updateProgress(
    memberId: number,
    planId: number,
    request: UpdatePlanProgressRequest
  ): Promise<
    ApiResponse<{
      learningPlanId: number;
      progress: number;
      status: string;
      updatedAt: string;
    }>
  > {
    return apiClient.patch(`/members/${memberId}/learning-plans/${planId}/progress`, request);
  },

  /**
   * 학습 스텝 완료 처리
   */
  async completeStep(
    memberId: number,
    planId: number,
    stepOrder: number
  ): Promise<
    ApiResponse<{
      stepId: number;
      order: number;
      completed: boolean;
      completedAt: string;
    }>
  > {
    return apiClient.post(
      `/members/${memberId}/learning-plans/${planId}/steps/${stepOrder}/complete`
    );
  },

  /**
   * 학습 플랜 시작 (Goal 생성 및 연동) - V5
   */
  async startPlan(
    memberId: number,
    planId: number,
    options?: {
      goalTitle?: string;
      goalDescription?: string;
      dueDate?: string;
      priority?: 'LOW' | 'MEDIUM' | 'HIGH';
    }
  ): Promise<ApiResponse<any>> { // Returns Created Goal info
    return apiClient.post(`/members/${memberId}/learning-plans/${planId}/start`, options);
  },
};

