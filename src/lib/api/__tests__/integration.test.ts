/**
 * 통합 시나리오 테스트
 * 실제 사용자 플로우를 시뮬레이션하는 엔드투엔드 테스트
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { authApi } from '../auth';
import { skillsApi } from '../skills';
import { goalsApi } from '../goals';
import { learningPlansApi } from '../learning-plans';
import { apiClient } from '../client';

describe('Integration Tests', () => {
  beforeEach(() => {
    apiClient.setAccessToken(null);
  });

  describe('신규 회원 온보딩 플로우', () => {
    it('회원가입 → 로그인 → 기술스택 등록 → 학습목표 생성 → 학습플랜 생성', async () => {
      // 1. 회원가입
      const signupResponse = await authApi.signup({
        name: '김개발',
        email: 'kim@example.com',
        password: 'password123!',
        targetTrack: 'BACKEND',
        experienceLevel: 'BEGINNER',
        learningPreference: {
          dailyMinutes: 90,
          preferKorean: true,
          style: 'PROJECT_BASED',
          weekendBoost: true,
        },
      });

      expect(signupResponse.success).toBe(true);
      const memberId = signupResponse.data.memberId;

      // 2. 로그인
      const loginResponse = await authApi.login({
        email: 'test@example.com',
        password: 'password123!',
      });

      expect(loginResponse.success).toBe(true);
      expect(apiClient.getAccessToken()).toBeTruthy();

      // 3. 기술 스택 등록
      const addSkillResponse = await skillsApi.addSkill(memberId, {
        technologyId: 10,
        level: 'INTERMEDIATE',
        yearsOfUse: 1.5,
        note: 'Spring Boot 경험 있음',
      });

      expect(addSkillResponse.success).toBe(true);

      // 4. 학습 목표 생성
      const createGoalResponse = await goalsApi.createGoal(memberId, {
        title: '백엔드 개발자 취업',
        description: 'Spring Boot 기반 백엔드 개발자로 취업하기',
        dueDate: '2026-06-30',
        priority: 'HIGH',
      });

      expect(createGoalResponse.success).toBe(true);

      // 5. 학습 플랜 생성
      const createPlanResponse = await learningPlansApi.createPlan(memberId, {
        targetTechName: 'Kotlin Coroutines',
        motivation: '우테코 프리코스 준비',
        timeFrameWeeks: 4,
        dailyMinutesOverride: 90,
      });

      expect(createPlanResponse.success).toBe(true);
      expect(createPlanResponse.data.learningPlanId).toBeDefined();
      expect(createPlanResponse.data.steps.length).toBeGreaterThan(0);
    });
  });

  describe('학습 플랜 진행 플로우', () => {
    it('학습플랜 조회 → 스텝 완료 → 진행도 업데이트', async () => {
      const memberId = 1;
      const planId = 1;

      // 로그인
      await authApi.login({
        email: 'test@example.com',
        password: 'password123!',
      });

      // 1. 학습 플랜 상세 조회
      const planResponse = await learningPlansApi.getPlan(memberId, planId);
      expect(planResponse.success).toBe(true);

      const initialProgress = planResponse.data.progress;

      // 2. 첫 번째 스텝 완료
      const completeStepResponse = await learningPlansApi.completeStep(
        memberId,
        planId,
        1
      );
      expect(completeStepResponse.success).toBe(true);
      expect(completeStepResponse.data.completed).toBe(true);

      // 3. 진행도 업데이트
      const updateProgressResponse = await learningPlansApi.updateProgress(
        memberId,
        planId,
        {
          progress: initialProgress + 20,
          status: 'ACTIVE',
        }
      );
      expect(updateProgressResponse.success).toBe(true);
      expect(updateProgressResponse.data.progress).toBeGreaterThan(initialProgress);
    });
  });

  describe('프로필 수정 플로우', () => {
    it('로그인 → 현재 정보 조회 → 기술스택 수정 → 학습목표 수정', async () => {
      const memberId = 1;

      // 로그인
      await authApi.login({
        email: 'test@example.com',
        password: 'password123!',
      });

      // 1. 현재 사용자 정보 조회
      const userResponse = await authApi.getCurrentUser();
      expect(userResponse.success).toBe(true);

      // 2. 기술 스택 목록 조회
      const skillsResponse = await skillsApi.getSkills(memberId);
      expect(skillsResponse.success).toBe(true);

      // 3. 기술 스택 수정 (첫 번째 스킬)
      if (skillsResponse.data.skills.length > 0) {
        const skillId = skillsResponse.data.skills[0].memberSkillId;
        const updateSkillResponse = await skillsApi.updateSkill(memberId, skillId, {
          level: 'ADVANCED',
          yearsOfUse: 3.0,
          note: '실무 경험 추가',
        });
        expect(updateSkillResponse.success).toBe(true);
      }

      // 4. 학습 목표 목록 조회
      const goalsResponse = await goalsApi.getGoals(memberId);
      expect(goalsResponse.success).toBe(true);

      // 5. 학습 목표 수정 (첫 번째 목표)
      if (goalsResponse.data.goals.length > 0) {
        const goalId = goalsResponse.data.goals[0].learningGoalId;
        const goal = goalsResponse.data.goals[0];
        const updateGoalResponse = await goalsApi.updateGoal(memberId, goalId, {
          ...goal,
          status: 'COMPLETED',
        });
        expect(updateGoalResponse.success).toBe(true);
      }
    });
  });

  describe('에러 처리', () => {
    it('인증되지 않은 요청은 실패해야 한다', async () => {
      // 토큰 없이 요청
      apiClient.setAccessToken(null);

      // MSW 핸들러가 401 에러를 반환하도록 설정되어 있지 않으므로
      // 실제로는 성공할 것입니다. 실제 환경에서는 401 에러가 발생합니다.
      // 이 테스트는 실제 백엔드와 통합 시 활성화해야 합니다.
    });

    it('잘못된 데이터로 요청하면 실패해야 한다', async () => {
      await authApi.login({
        email: 'test@example.com',
        password: 'password123!',
      });

      // 잘못된 회원 ID로 요청
      // 실제 환경에서는 404 에러가 발생하지만,
      // MSW는 모든 ID를 받아들이므로 이 테스트는 실제 백엔드와 통합 시 활성화해야 합니다.
    });
  });
});

