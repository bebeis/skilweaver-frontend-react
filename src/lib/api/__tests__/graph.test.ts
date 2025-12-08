/**
 * V3 Graph API 테스트
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { server } from '../../../test/mocks/server';
import {
  fetchRoadmap,
  fetchLearningPath,
  fetchRecommendations,
  analyzeGap,
  analyzeGapSimple,
} from '../graph';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Graph API', () => {
  describe('fetchRoadmap', () => {
    it('should fetch roadmap for a technology', async () => {
      const response = await fetchRoadmap('spring-boot');

      expect(response.success).toBe(true);
      expect(response.data.technology).toBe('spring-boot');
      expect(response.data.displayName).toBe('Spring Boot');
      expect(response.data.prerequisites.required).toHaveLength(1);
      expect(response.data.prerequisites.required[0].name).toBe('java');
      expect(response.data.prerequisites.recommended).toHaveLength(1);
      expect(response.data.nextSteps).toHaveLength(2);
    });

    it('should handle not found technology', async () => {
      await expect(fetchRoadmap('unknown-tech')).rejects.toMatchObject({
        errorCode: 'TECHNOLOGY_NOT_FOUND',
      });
    });
  });

  describe('fetchLearningPath', () => {
    it('should fetch learning path between technologies', async () => {
      const response = await fetchLearningPath('java', 'mlops');

      expect(response.success).toBe(true);
      expect(response.data.from).toBe('java');
      expect(response.data.to).toBe('mlops');
      expect(response.data.totalSteps).toBe(4);
      expect(response.data.path).toHaveLength(4);
      expect(response.data.path[0].step).toBe(1);
      expect(response.data.path[0].technology).toBe('python-data');
    });

    it('should handle no path found', async () => {
      await expect(fetchLearningPath('java', 'unknown-tech')).rejects.toMatchObject({
        errorCode: 'NO_PATH_FOUND',
      });
    });
  });

  describe('fetchRecommendations', () => {
    it('should fetch recommendations for a technology', async () => {
      const response = await fetchRecommendations('react');

      expect(response.success).toBe(true);
      expect(response.data.technology).toBe('react');
      expect(response.data.recommendations).toHaveLength(3);
      expect(response.data.recommendations[0].name).toBe('nextjs');
      expect(response.data.recommendations[0].relation).toBe('CONTAINS');
    });

    it('should handle not found technology', async () => {
      await expect(fetchRecommendations('unknown-tech')).rejects.toMatchObject({
        errorCode: 'TECHNOLOGY_NOT_FOUND',
      });
    });
  });

  describe('analyzeGap', () => {
    it('should analyze gap when ready', async () => {
      const response = await analyzeGap({
        knownTechnologies: ['java', 'sql'],
        targetTechnology: 'spring-boot',
      });

      expect(response.success).toBe(true);
      expect(response.data.target).toBe('spring-boot');
      expect(response.data.known).toContain('java');
      expect(response.data.known).toContain('sql');
      expect(response.data.ready).toBe(true);
      expect(response.data.readinessScore).toBe(0.8);
      expect(response.data.missing).toHaveLength(0);
    });

    it('should analyze gap when not ready', async () => {
      const response = await analyzeGap({
        knownTechnologies: ['python'],
        targetTechnology: 'spring-boot',
      });

      expect(response.success).toBe(true);
      expect(response.data.ready).toBe(false);
      expect(response.data.readinessScore).toBe(0.3);
      expect(response.data.missing).toHaveLength(1);
      expect(response.data.missing[0].name).toBe('java');
      expect(response.data.missing[0].priority).toBe('HIGH');
    });

    it('should handle not found target technology', async () => {
      await expect(
        analyzeGap({
          knownTechnologies: ['java'],
          targetTechnology: 'unknown-tech',
        })
      ).rejects.toMatchObject({
        errorCode: 'TECHNOLOGY_NOT_FOUND',
      });
    });
  });

  describe('analyzeGapSimple', () => {
    it('should work with simple parameters', async () => {
      const response = await analyzeGapSimple(['java', 'sql'], 'spring-boot');

      expect(response.success).toBe(true);
      expect(response.data.target).toBe('spring-boot');
      expect(response.data.ready).toBe(true);
    });
  });
});
