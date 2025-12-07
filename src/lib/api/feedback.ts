/**
 * 피드백 시스템 관련 API (v2)
 */

import { apiClient, ApiResponse } from './client';
import { Feedback, SubmitFeedbackRequest, FeedbackSummary } from './types';

export const feedbackApi = {
  /**
   * 피드백 제출
   * 학습 계획 또는 특정 스텝에 대한 피드백을 제출합니다.
   */
  async submitFeedback(
    request: SubmitFeedbackRequest
  ): Promise<ApiResponse<Feedback>> {
    return apiClient.post('/feedback', request);
  },

  /**
   * 계획별 피드백 목록 조회
   * 특정 학습 계획에 대한 모든 피드백을 조회합니다.
   */
  async getFeedbacksByPlan(planId: number): Promise<ApiResponse<Feedback[]>> {
    return apiClient.get(`/feedback/plans/${planId}`);
  },

  /**
   * 피드백 요약 조회
   * 학습 계획의 피드백 통계 요약을 조회합니다.
   */
  async getFeedbackSummary(
    planId: number
  ): Promise<ApiResponse<FeedbackSummary>> {
    return apiClient.get(`/feedback/plans/${planId}/summary`);
  },
};
