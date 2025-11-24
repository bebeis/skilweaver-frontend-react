/**
 * 학습 목표 API 테스트
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { goalsApi } from '../goals';
import { apiClient } from '../client';

describe('Goals API', () => {
  const memberId = 1;

  beforeEach(() => {
    apiClient.setAccessToken('test-token');
  });

  describe('getGoals', () => {
    it('학습 목표 목록을 조회해야 한다', async () => {
      const response = await goalsApi.getGoals(memberId);

      expect(response.success).toBe(true);
      expect(response.data.goals).toBeInstanceOf(Array);
      expect(response.data.totalCount).toBeGreaterThanOrEqual(0);

      if (response.data.goals.length > 0) {
        const goal = response.data.goals[0];
        expect(goal).toMatchObject({
          learningGoalId: expect.any(Number),
          title: expect.any(String),
          description: expect.any(String),
          priority: expect.any(String),
          status: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        });
      }
    });

    it('필터 파라미터로 학습 목표를 조회해야 한다', async () => {
      const response = await goalsApi.getGoals(memberId, {
        priority: 'HIGH',
        status: 'ACTIVE',
      });

      expect(response.success).toBe(true);
      expect(response.data.goals).toBeInstanceOf(Array);
    });
  });

  describe('createGoal', () => {
    it('학습 목표를 생성해야 한다', async () => {
      const goalData = {
        title: '백엔드 개발자 취업',
        description: 'Spring Boot 기반 백엔드 개발자로 취업하기',
        dueDate: '2026-06-30',
        priority: 'HIGH' as const,
      };

      const response = await goalsApi.createGoal(memberId, goalData);

      expect(response.success).toBe(true);
      expect(response.data).toMatchObject({
        learningGoalId: expect.any(Number),
        title: goalData.title,
        description: goalData.description,
        dueDate: goalData.dueDate,
        priority: goalData.priority,
        status: 'ACTIVE',
      });
      expect(response.data.createdAt).toBeDefined();
      expect(response.data.updatedAt).toBeDefined();
      expect(response.message).toBe('학습 목표가 생성되었습니다.');
    });
  });

  describe('updateGoal', () => {
    it('학습 목표를 수정해야 한다', async () => {
      const goalId = 1;
      const updateData = {
        title: '백엔드 개발자 취업 (수정)',
        description: 'Spring Boot와 Kotlin 기반 백엔드 개발자로 취업하기',
        dueDate: '2026-08-31',
        priority: 'HIGH' as const,
        status: 'ACTIVE' as const,
      };

      const response = await goalsApi.updateGoal(memberId, goalId, updateData);

      expect(response.success).toBe(true);
      expect(response.data).toMatchObject({
        learningGoalId: goalId,
        title: updateData.title,
        description: updateData.description,
        dueDate: updateData.dueDate,
        priority: updateData.priority,
        status: updateData.status,
      });
      expect(response.data.updatedAt).toBeDefined();
      expect(response.message).toBe('학습 목표가 수정되었습니다.');
    });

    it('학습 목표 상태를 완료로 변경해야 한다', async () => {
      const goalId = 1;
      const updateData = {
        title: '우테코 프리코스 완주',
        description: '6주간의 프리코스를 성실히 완주하기',
        dueDate: '2025-12-31',
        priority: 'HIGH' as const,
        status: 'COMPLETED' as const,
      };

      const response = await goalsApi.updateGoal(memberId, goalId, updateData);

      expect(response.success).toBe(true);
      expect(response.data.status).toBe('COMPLETED');
    });
  });

  describe('deleteGoal', () => {
    it('학습 목표를 삭제해야 한다', async () => {
      const goalId = 1;

      const response = await goalsApi.deleteGoal(memberId, goalId);

      expect(response.success).toBe(true);
      expect(response.data).toBeNull();
    });
  });
});

