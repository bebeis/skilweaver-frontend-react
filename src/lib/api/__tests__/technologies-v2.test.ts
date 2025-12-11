/**
 * Technology API V4 테스트
 * 
 * V4 변경사항:
 * - technologyId (Long) → name (String) ID 전략 변경
 * - Graph API가 Technologies API로 통합
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { server } from '../../../test/mocks/server';
import { technologiesApi } from '../technologies';
import { SkillCategory } from '../types';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('technologiesApi V4', () => {
  describe('getTechnology - V4 name 기반', () => {
    it('should return technology by name with V4 fields', async () => {
      // V4: getTechnology(name: string)
      const response = await technologiesApi.getTechnology('spring-boot');

      expect(response.success).toBe(true);
      expect(response.data.name).toBe('spring-boot');
      expect(response.data.displayName).toBe('Spring Boot');

      // V4 fields
      expect(response.data.difficulty).toBeDefined();
      expect(response.data.description).toBeDefined();
      expect(response.data.learningRoadmap).toBeDefined();
      expect(response.data.estimatedLearningHours).toBe(60);
      expect(response.data.communityPopularity).toBe(9);
      expect(response.data.jobMarketDemand).toBe(10);

      // V4: prerequisites 구조 변경
      expect(response.data.prerequisites).toBeDefined();
      expect(response.data.prerequisites?.required).toBeDefined();
      expect(response.data.prerequisites?.recommended).toBeDefined();
    });

    it('should handle not found technology', async () => {
      await expect(technologiesApi.getTechnology('unknown-tech')).rejects.toMatchObject({
        errorCode: 'TECHNOLOGY_NOT_FOUND',
      });
    });
  });

  describe('createTechnology', () => {
    it('should create a new technology with V4 fields', async () => {
      const request = {
        name: 'kotlin',
        displayName: 'Kotlin',
        category: 'LANGUAGE' as SkillCategory,
        difficulty: 'INTERMEDIATE' as const,
        ecosystem: 'JVM',
        officialSite: 'https://kotlinlang.org',
        description: 'JVM 기반 현대적 프로그래밍 언어',
        learningRoadmap: '1단계: 기본 문법 → 2단계: 객체지향 → 3단계: 함수형 프로그래밍',
        estimatedLearningHours: 40,
        learningTips: 'Java와 비교하며 학습하세요',
        useCases: ['Android', 'Backend', 'Multiplatform'],
        communityPopularity: 8,
        jobMarketDemand: 9,
      };

      const response = await technologiesApi.createTechnology(request);

      expect(response.success).toBe(true);
      expect(response.data.name).toBe('kotlin');
      expect(response.data.displayName).toBe('Kotlin');
      expect(response.data.difficulty).toBe('INTERMEDIATE');
      expect(response.data.description).toBe(request.description);
      expect(response.data.estimatedLearningHours).toBe(40);
      expect(response.data.communityPopularity).toBe(8);
      expect(response.data.jobMarketDemand).toBe(9);
    });
  });

  describe('updateTechnology', () => {
    it('should update technology by name with V4 fields', async () => {
      const request = {
        displayName: 'Spring Boot Framework',
        difficulty: 'ADVANCED' as const,
        estimatedLearningHours: 70,
        communityPopularity: 10,
      };

      // V4: updateTechnology(name: string, ...)
      const response = await technologiesApi.updateTechnology('spring-boot', request);

      expect(response.success).toBe(true);
      expect(response.data.name).toBe('spring-boot');
      expect(response.data.displayName).toBe('Spring Boot Framework');
    });
  });

  // V4: Graph API 통합 테스트
  describe('getRoadmap', () => {
    it('should fetch roadmap for a technology', async () => {
      const response = await technologiesApi.getRoadmap('spring-boot');

      expect(response.success).toBe(true);
      expect(response.data.technology).toBe('spring-boot');
      expect(response.data.displayName).toBe('Spring Boot');
      expect(response.data.prerequisites.required).toHaveLength(1);
      expect(response.data.prerequisites.required[0].name).toBe('java');
      expect(response.data.nextSteps).toHaveLength(2);
    });

    it('should handle not found technology', async () => {
      await expect(technologiesApi.getRoadmap('unknown-tech')).rejects.toMatchObject({
        errorCode: 'TECHNOLOGY_NOT_FOUND',
      });
    });
  });

  describe('getLearningPath', () => {
    it('should fetch learning path between technologies', async () => {
      const response = await technologiesApi.getLearningPath('java', 'mlops');

      expect(response.success).toBe(true);
      expect(response.data.from).toBe('java');
      expect(response.data.to).toBe('mlops');
      expect(response.data.totalSteps).toBe(4);
      expect(response.data.path).toHaveLength(4);
    });

    it('should handle no path found', async () => {
      await expect(technologiesApi.getLearningPath('java', 'unknown-tech')).rejects.toMatchObject({
        errorCode: 'NO_PATH_FOUND',
      });
    });
  });

  describe('getRecommendations', () => {
    it('should fetch recommendations for a technology', async () => {
      const response = await technologiesApi.getRecommendations('react');

      expect(response.success).toBe(true);
      expect(response.data.technology).toBe('react');
      expect(response.data.recommendations).toHaveLength(3);
      expect(response.data.recommendations[0].name).toBe('nextjs');
    });
  });

  describe('analyzeGap', () => {
    it('should analyze gap when ready', async () => {
      const response = await technologiesApi.analyzeGap({
        knownTechnologies: ['java', 'sql'],
        targetTechnology: 'spring-boot',
      });

      expect(response.success).toBe(true);
      expect(response.data.target).toBe('spring-boot');
      expect(response.data.known).toContain('java');
      expect(response.data.ready).toBe(true);
      expect(response.data.readinessScore).toBe(0.8);
    });

    it('should analyze gap when not ready', async () => {
      const response = await technologiesApi.analyzeGap({
        knownTechnologies: ['python'],
        targetTechnology: 'spring-boot',
      });

      expect(response.success).toBe(true);
      expect(response.data.ready).toBe(false);
      expect(response.data.readinessScore).toBe(0.3);
      expect(response.data.missing).toHaveLength(1);
      expect(response.data.missing[0].name).toBe('java');
    });
  });

  describe('getRelationships', () => {
    it('should fetch relationships for a technology', async () => {
      const response = await technologiesApi.getRelationships('spring-boot');

      expect(response.success).toBe(true);
      expect(response.data).toHaveLength(2);
      expect(response.data[0].from).toBe('spring-boot');
      expect(response.data[0].to).toBe('java');
      expect(response.data[0].relation).toBe('DEPENDS_ON');
    });
  });
});
