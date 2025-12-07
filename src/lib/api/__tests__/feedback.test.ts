/**
 * 피드백 API 테스트 (v2)
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { server } from '../../../test/mocks/server';
import { feedbackApi } from '../feedback';
import { FeedbackType } from '../types';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('feedbackApi', () => {
  describe('submitFeedback', () => {
    it('should submit feedback for a learning plan', async () => {
      const request = {
        learningPlanId: 100,
        rating: 5,
        feedbackType: 'HELPFUL' as FeedbackType,
        comment: '매우 도움이 되었습니다',
      };

      const response = await feedbackApi.submitFeedback(request);

      expect(response.success).toBe(true);
      expect(response.data.id).toBeDefined();
      expect(response.data.learningPlanId).toBe(100);
      expect(response.data.rating).toBe(5);
      expect(response.data.feedbackType).toBe('HELPFUL');
      expect(response.data.comment).toBe('매우 도움이 되었습니다');
    });

    it('should submit feedback for a specific step', async () => {
      const request = {
        learningPlanId: 100,
        stepId: 1,
        rating: 3,
        feedbackType: 'TOO_HARD' as FeedbackType,
        comment: '이 단계가 어려웠습니다',
      };

      const response = await feedbackApi.submitFeedback(request);

      expect(response.success).toBe(true);
      expect(response.data.stepId).toBe(1);
      expect(response.data.feedbackType).toBe('TOO_HARD');
    });
  });

  describe('getFeedbacksByPlan', () => {
    it('should get all feedbacks for a plan', async () => {
      const response = await feedbackApi.getFeedbacksByPlan(100);

      expect(response.success).toBe(true);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThan(0);
      expect(response.data[0].learningPlanId).toBe(100);
    });
  });

  describe('getFeedbackSummary', () => {
    it('should get feedback summary for a plan', async () => {
      const response = await feedbackApi.getFeedbackSummary(100);

      expect(response.success).toBe(true);
      expect(response.data.planId).toBe(100);
      expect(response.data.averageRating).toBeDefined();
      expect(response.data.totalFeedbackCount).toBeDefined();
      expect(response.data.typeBreakdown).toBeDefined();
      expect(response.data.typeBreakdown.HELPFUL).toBeDefined();
    });
  });
});
