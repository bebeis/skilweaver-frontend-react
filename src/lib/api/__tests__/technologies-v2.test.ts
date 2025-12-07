/**
 * Technology API v2 테스트
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { server } from '../../../test/mocks/server';
import { technologiesApi } from '../technologies';
import { SkillCategory } from '../types';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('technologiesApi v2', () => {
  describe('getTechnology - v2 fields', () => {
    it('should return technology with v2 learning metadata fields', async () => {
      const response = await technologiesApi.getTechnology(1);

      expect(response.success).toBe(true);
      expect(response.data.technologyId).toBe(1);

      // v2 fields
      expect(response.data.learningRoadmap).toBeDefined();
      expect(response.data.estimatedLearningHours).toBe(60);
      expect(response.data.relatedTechnologies).toContain('java');
      expect(response.data.communityPopularity).toBe(9);
      expect(response.data.jobMarketDemand).toBe(10);
    });
  });

  describe('createTechnology', () => {
    it('should create a new technology with v2 fields', async () => {
      const request = {
        key: 'kotlin',
        displayName: 'Kotlin',
        category: 'LANGUAGE' as SkillCategory,
        ecosystem: 'JVM',
        officialSite: 'https://kotlinlang.org',
        learningRoadmap: '1단계: 기본 문법 → 2단계: 객체지향 → 3단계: 함수형 프로그래밍',
        estimatedLearningHours: 40,
        relatedTechnologies: ['java', 'spring-boot'],
        communityPopularity: 8,
        jobMarketDemand: 9,
      };

      const response = await technologiesApi.createTechnology(request);

      expect(response.success).toBe(true);
      expect(response.data.key).toBe('kotlin');
      expect(response.data.displayName).toBe('Kotlin');
      expect(response.data.learningRoadmap).toBe(request.learningRoadmap);
      expect(response.data.estimatedLearningHours).toBe(40);
      expect(response.data.communityPopularity).toBe(8);
      expect(response.data.jobMarketDemand).toBe(9);
    });
  });

  describe('updateTechnology', () => {
    it('should update technology with v2 fields', async () => {
      const request = {
        displayName: 'Spring Boot Framework',
        estimatedLearningHours: 70,
        communityPopularity: 10,
      };

      const response = await technologiesApi.updateTechnology(1, request);

      expect(response.success).toBe(true);
      expect(response.data.technologyId).toBe(1);
      expect(response.data.displayName).toBe('Spring Boot Framework');
      expect(response.data.estimatedLearningHours).toBe(70);
      expect(response.data.communityPopularity).toBe(10);
    });
  });
});
