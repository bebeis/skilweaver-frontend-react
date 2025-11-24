/**
 * 인증 관련 API
 */

import { apiClient, ApiResponse } from './client';
import { SignupRequest, LoginRequest, LoginResponse, Member } from './types';

export const authApi = {
  /**
   * 회원가입
   */
  async signup(request: SignupRequest): Promise<ApiResponse<Member>> {
    return apiClient.post<Member>('/auth/signup/email', request);
  },

  /**
   * 로그인
   */
  async login(request: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await apiClient.post<LoginResponse>('/auth/login', request);
    if (response.success && response.data.accessToken) {
      apiClient.setAccessToken(response.data.accessToken);
    }
    return response;
  },

  /**
   * 토큰 재발급
   */
  async refresh(): Promise<ApiResponse<{ accessToken: string }>> {
    const response = await apiClient.post<{ accessToken: string }>('/auth/refresh');
    if (response.success && response.data.accessToken) {
      apiClient.setAccessToken(response.data.accessToken);
    }
    return response;
  },

  /**
   * 로그아웃
   */
  async logout(): Promise<ApiResponse<null>> {
    const response = await apiClient.post<null>('/auth/logout');
    apiClient.setAccessToken(null);
    return response;
  },

  /**
   * 현재 사용자 정보 조회
   */
  async getCurrentUser(): Promise<ApiResponse<Member>> {
    return apiClient.get<Member>('/members/me');
  },
};

