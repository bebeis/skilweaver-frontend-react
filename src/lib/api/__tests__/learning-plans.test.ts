/**
 * 학습 플랜 API 테스트
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { learningPlansApi } from '../learning-plans';
import { apiClient } from '../client';

describe('Learning Plans API', () => {
  const memberId = 1;

  beforeEach(() => {
    apiClient.setAccessToken('test-token');
  });

  describe('createPlan', () => {
    it('학습 플랜을 생성해야 한다', async () => {
      const planData = {
        targetTechName: 'Kotlin Coroutines',
        motivation: '우테코 미션을 코틀린으로 구현하고 싶어서',
        timeFrameWeeks: 4,
        dailyMinutesOverride: 90,
      };

      const response = await learningPlansApi.createPlan(memberId, planData);

      expect(response.success).toBe(true);
      expect(response.data).toMatchObject({
        learningPlanId: expect.any(Number),
        memberId,
        targetTechnology: planData.targetTechName,
        totalWeeks: planData.timeFrameWeeks,
        totalHours: expect.any(Number),
        status: 'ACTIVE',
        progress: 0,
      });
      expect(response.data.steps).toBeInstanceOf(Array);
      expect(response.data.dailySchedule).toBeInstanceOf(Array);
      expect(response.data.backgroundAnalysis).toBeDefined();
      expect(response.data.backgroundAnalysis.existingRelevantSkills).toBeInstanceOf(Array);
      expect(response.data.backgroundAnalysis.missingPrerequisites).toBeInstanceOf(Array);
      expect(response.data.backgroundAnalysis.riskFactors).toBeInstanceOf(Array);
      expect(response.message).toBe('학습 플랜이 생성되었습니다.');
    });

    it('학습 플랜의 스텝들이 올바른 구조를 가져야 한다', async () => {
      const planData = {
        targetTechName: 'Kotlin Coroutines',
        motivation: '비동기 프로그래밍 학습',
        timeFrameWeeks: 4,
      };

      const response = await learningPlansApi.createPlan(memberId, planData);

      expect(response.data.steps.length).toBeGreaterThan(0);

      const step = response.data.steps[0];
      expect(step).toMatchObject({
        stepId: expect.any(Number),
        order: expect.any(Number),
        title: expect.any(String),
        description: expect.any(String),
        estimatedHours: expect.any(Number),
        difficulty: expect.any(String),
        completed: expect.any(Boolean),
        objectives: expect.any(Array),
        suggestedResources: expect.any(Array),
      });
    });
  });

  describe('getPlans', () => {
    it('학습 플랜 목록을 조회해야 한다', async () => {
      const response = await learningPlansApi.getPlans(memberId);

      expect(response.success).toBe(true);
      expect(response.data.plans).toBeInstanceOf(Array);
      expect(response.data.pagination).toMatchObject({
        page: expect.any(Number),
        size: expect.any(Number),
        totalElements: expect.any(Number),
        totalPages: expect.any(Number),
      });

      if (response.data.plans.length > 0) {
        const plan = response.data.plans[0];
        expect(plan).toMatchObject({
          learningPlanId: expect.any(Number),
          targetTechnology: expect.any(String),
          totalWeeks: expect.any(Number),
          totalHours: expect.any(Number),
          status: expect.any(String),
          progress: expect.any(Number),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        });
      }
    });

    it('필터 파라미터로 학습 플랜을 조회해야 한다', async () => {
      const response = await learningPlansApi.getPlans(memberId, {
        status: 'ACTIVE',
        page: 0,
        size: 10,
      });

      expect(response.success).toBe(true);
      expect(response.data.plans).toBeInstanceOf(Array);
    });
  });

  describe('getPlan', () => {
    it('학습 플랜 상세 정보를 조회해야 한다', async () => {
      const planId = 1;

      const response = await learningPlansApi.getPlan(memberId, planId);

      expect(response.success).toBe(true);
      expect(response.data).toMatchObject({
        learningPlanId: planId,
        memberId,
        targetTechnology: expect.any(String),
        totalWeeks: expect.any(Number),
        totalHours: expect.any(Number),
        status: expect.any(String),
        progress: expect.any(Number),
        steps: expect.any(Array),
        dailySchedule: expect.any(Array),
        backgroundAnalysis: expect.any(Object),
      });
    });
  });

  describe('updateProgress', () => {
    it('학습 플랜 진행도를 업데이트해야 한다', async () => {
      const planId = 1;
      const progressData = {
        progress: 40,
        status: 'ACTIVE' as const,
      };

      const response = await learningPlansApi.updateProgress(memberId, planId, progressData);

      expect(response.success).toBe(true);
      expect(response.data).toMatchObject({
        learningPlanId: planId,
        progress: progressData.progress,
        status: progressData.status,
        updatedAt: expect.any(String),
      });
      expect(response.message).toBe('진행도가 업데이트되었습니다.');
    });

    it('학습 플랜을 완료 상태로 변경해야 한다', async () => {
      const planId = 1;
      const progressData = {
        progress: 100,
        status: 'COMPLETED' as const,
      };

      const response = await learningPlansApi.updateProgress(memberId, planId, progressData);

      expect(response.success).toBe(true);
      expect(response.data.progress).toBe(100);
      expect(response.data.status).toBe('COMPLETED');
    });
  });

  describe('completeStep', () => {
    it('학습 스텝을 완료 처리해야 한다', async () => {
      const planId = 1;
      const stepOrder = 1;

      const response = await learningPlansApi.completeStep(memberId, planId, stepOrder);

      expect(response.success).toBe(true);
      expect(response.data).toMatchObject({
        stepId: expect.any(Number),
        order: stepOrder,
        completed: true,
        completedAt: expect.any(String),
      });
      expect(response.message).toBe('학습 스텝이 완료 처리되었습니다.');
    });
  });
});

