/**
 * 기술 스택 API 테스트 - V4 스펙
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { skillsApi } from '../skills';
import { apiClient } from '../client';

describe('Skills API', () => {
  const memberId = 1;

  beforeEach(() => {
    apiClient.setAccessToken('test-token');
  });

  describe('getSkills', () => {
    it('회원 기술 스택 목록을 조회해야 한다', async () => {
      const response = await skillsApi.getSkills(memberId);

      expect(response.success).toBe(true);
      expect(response.data.skills).toBeInstanceOf(Array);
      expect(response.data.totalCount).toBeGreaterThanOrEqual(0);

      if (response.data.skills.length > 0) {
        const skill = response.data.skills[0];
        // V4: technologyName 단일 필드
        expect(skill).toMatchObject({
          memberSkillId: expect.any(Number),
          technologyName: expect.any(String),  // V4
          level: expect.any(String),
          yearsOfUse: expect.any(Number),
        });
      }
    });

    it('레벨 필터로 기술 스택을 조회해야 한다', async () => {
      // V4: category 파라미터 제거, level만 지원
      const response = await skillsApi.getSkills(memberId, {
        level: 'ADVANCED',
      });

      expect(response.success).toBe(true);
      expect(response.data.skills).toBeInstanceOf(Array);
    });
  });

  describe('addSkill', () => {
    it('기술 스택을 추가해야 한다', async () => {
      // V4: technologyName 사용 (technologyId 대신)
      const skillData = {
        technologyName: 'spring-boot',  // V4
        level: 'INTERMEDIATE' as const,
        yearsOfUse: 1.5,
        lastUsedAt: '2025-11-24',
        note: '주로 백엔드 개발에 사용',
      };

      const response = await skillsApi.addSkill(memberId, skillData);

      expect(response.success).toBe(true);
      expect(response.data).toMatchObject({
        memberSkillId: expect.any(Number),
        technologyName: skillData.technologyName,  // V4
        level: skillData.level,
        yearsOfUse: skillData.yearsOfUse,
        note: skillData.note,
      });
      expect(response.message).toBe('기술 스택이 추가되었습니다.');
    });
  });

  describe('updateSkill', () => {
    it('기술 스택을 수정해야 한다', async () => {
      const skillId = 1;
      const updateData = {
        level: 'ADVANCED' as const,
        yearsOfUse: 2.0,
        lastUsedAt: '2025-11-24',
        note: '실무에서 활발히 사용 중',
      };

      const response = await skillsApi.updateSkill(memberId, skillId, updateData);

      expect(response.success).toBe(true);
      expect(response.data).toMatchObject({
        memberSkillId: skillId,
        technologyName: expect.any(String),  // V4
        level: updateData.level,
        yearsOfUse: updateData.yearsOfUse,
        note: updateData.note,
      });
      expect(response.data.updatedAt).toBeDefined();
      expect(response.message).toBe('기술 스택이 수정되었습니다.');
    });
  });

  describe('deleteSkill', () => {
    it('기술 스택을 삭제해야 한다', async () => {
      const skillId = 1;

      const response = await skillsApi.deleteSkill(memberId, skillId);

      expect(response.success).toBe(true);
      expect(response.data).toBeNull();
    });
  });
});
