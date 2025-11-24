/**
 * 인증 API 테스트
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { authApi } from '../auth';
import { apiClient } from '../client';

describe('Auth API', () => {
  beforeEach(() => {
    apiClient.setAccessToken(null);
  });

  describe('signup', () => {
    it('회원가입이 성공해야 한다', async () => {
      const signupData = {
        name: '홍길동',
        email: 'hong@example.com',
        password: 'password123!',
        targetTrack: 'BACKEND' as const,
        experienceLevel: 'BEGINNER' as const,
        learningPreference: {
          dailyMinutes: 60,
          preferKorean: true,
          style: 'PROJECT_BASED' as const,
          weekendBoost: true,
        },
      };

      const response = await authApi.signup(signupData);

      expect(response.success).toBe(true);
      expect(response.data).toMatchObject({
        memberId: expect.any(Number),
        name: signupData.name,
        email: signupData.email,
        targetTrack: signupData.targetTrack,
        experienceLevel: signupData.experienceLevel,
      });
      expect(response.data.createdAt).toBeDefined();
      expect(response.message).toBe('회원가입이 완료되었습니다.');
    });
  });

  describe('login', () => {
    it('올바른 인증 정보로 로그인이 성공해야 한다', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123!',
      };

      const response = await authApi.login(loginData);

      expect(response.success).toBe(true);
      expect(response.data).toMatchObject({
        accessToken: expect.any(String),
        memberId: expect.any(Number),
        name: expect.any(String),
        email: loginData.email,
      });
      expect(response.message).toBe('로그인 성공');

      // 토큰이 자동으로 설정되어야 함
      expect(apiClient.getAccessToken()).toBe(response.data.accessToken);
    });

    it('잘못된 인증 정보로 로그인이 실패해야 한다', async () => {
      const loginData = {
        email: 'wrong@example.com',
        password: 'wrongpassword',
      };

      await expect(authApi.login(loginData)).rejects.toMatchObject({
        success: false,
        message: expect.stringContaining('이메일 또는 비밀번호가 잘못되었습니다'),
        errorCode: 'UNAUTHORIZED',
      });
    });
  });

  describe('refresh', () => {
    it('토큰 재발급이 성공해야 한다', async () => {
      const response = await authApi.refresh();

      expect(response.success).toBe(true);
      expect(response.data.accessToken).toBeDefined();
      expect(response.message).toBe('토큰이 재발급되었습니다.');

      // 새 토큰이 자동으로 설정되어야 함
      expect(apiClient.getAccessToken()).toBe(response.data.accessToken);
    });
  });

  describe('logout', () => {
    it('로그아웃이 성공해야 한다', async () => {
      // 먼저 로그인
      apiClient.setAccessToken('test-token');

      const response = await authApi.logout();

      expect(response.success).toBe(true);
      expect(response.data).toBeNull();

      // 토큰이 제거되어야 함
      expect(apiClient.getAccessToken()).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('현재 사용자 정보를 조회해야 한다', async () => {
      // 먼저 로그인
      apiClient.setAccessToken('test-token');

      const response = await authApi.getCurrentUser();

      expect(response.success).toBe(true);
      expect(response.data).toMatchObject({
        memberId: expect.any(Number),
        name: expect.any(String),
        email: expect.any(String),
        targetTrack: expect.any(String),
        experienceLevel: expect.any(String),
        learningPreference: {
          dailyMinutes: expect.any(Number),
          preferKorean: expect.any(Boolean),
          style: expect.any(String),
          weekendBoost: expect.any(Boolean),
        },
      });
    });
  });
});

