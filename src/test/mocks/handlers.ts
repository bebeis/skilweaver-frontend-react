import { http, HttpResponse } from 'msw';

// MSW에서는 절대 경로를 사용해야 합니다
// 환경 변수와 일치시키거나 패턴으로 처리
const BASE_URL = 'http://localhost:8080/api/v1';

export const handlers = [
  // 1. 인증 API
  // 회원가입
  http.post(`${BASE_URL}/auth/signup/email`, async ({ request }) => {
    const body = await request.json() as any;
    return HttpResponse.json({
      success: true,
      data: {
        memberId: 1,
        name: body.name,
        email: body.email,
        targetTrack: body.targetTrack,
        experienceLevel: body.experienceLevel,
        createdAt: new Date().toISOString(),
      },
      message: '회원가입이 완료되었습니다.',
      timestamp: new Date().toISOString(),
    }, { status: 201 });
  }),

  // 로그인
  http.post(`${BASE_URL}/auth/login`, async ({ request }) => {
    const body = await request.json() as any;
    
    if (body.email === 'test@example.com' && body.password === 'password123!') {
      return HttpResponse.json({
        success: true,
        data: {
          accessToken: 'mock-access-token',
          memberId: 1,
          name: '홍길동',
          email: 'test@example.com',
        },
        message: '로그인 성공',
        timestamp: new Date().toISOString(),
      }, { 
        status: 200,
        headers: {
          'Set-Cookie': 'SW_REFRESH=mock-refresh-token; HttpOnly; Secure; SameSite=Lax',
        },
      });
    }
    
    return HttpResponse.json({
      success: false,
      data: null,
      message: '이메일 또는 비밀번호가 잘못되었습니다.',
      errorCode: 'UNAUTHORIZED',
      timestamp: new Date().toISOString(),
    }, { status: 401 });
  }),

  // 토큰 재발급
  http.post(`${BASE_URL}/auth/refresh`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        accessToken: 'new-mock-access-token',
      },
      message: '토큰이 재발급되었습니다.',
      timestamp: new Date().toISOString(),
    });
  }),

  // 로그아웃
  http.post(`${BASE_URL}/auth/logout`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // 현재 사용자 정보 조회
  http.get(`${BASE_URL}/members/me`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        memberId: 1,
        name: '홍길동',
        email: 'test@example.com',
        targetTrack: 'BACKEND',
        experienceLevel: 'BEGINNER',
        learningPreference: {
          dailyMinutes: 60,
          preferKorean: true,
          style: 'PROJECT_BASED',
          weekendBoost: true,
        },
        createdAt: '2025-11-24T12:00:00',
        updatedAt: '2025-11-24T12:00:00',
      },
      timestamp: new Date().toISOString(),
    });
  }),

  // 2. 회원 정보 API
  http.get(`${BASE_URL}/members/:memberId`, ({ params }) => {
    return HttpResponse.json({
      success: true,
      data: {
        memberId: Number(params.memberId),
        name: '홍길동',
        email: 'test@example.com',
        targetTrack: 'BACKEND',
        experienceLevel: 'BEGINNER',
        learningPreference: {
          dailyMinutes: 60,
          preferKorean: true,
          style: 'PROJECT_BASED',
          weekendBoost: true,
        },
        createdAt: '2025-11-24T12:00:00',
        updatedAt: '2025-11-24T12:00:00',
      },
      timestamp: new Date().toISOString(),
    });
  }),

  http.put(`${BASE_URL}/members/:memberId`, async ({ request }) => {
    const body = await request.json() as any;
    return HttpResponse.json({
      success: true,
      data: {
        memberId: 1,
        name: body.name,
        email: 'test@example.com',
        targetTrack: body.targetTrack,
        experienceLevel: body.experienceLevel,
        updatedAt: new Date().toISOString(),
      },
      message: '회원 정보가 수정되었습니다.',
      timestamp: new Date().toISOString(),
    });
  }),

  http.delete(`${BASE_URL}/members/:memberId`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // 3. 기술 스택 API - V4: technologyName 기반
  http.get(`${BASE_URL}/members/:memberId/skills`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        skills: [
          {
            memberSkillId: 1,
            technologyName: 'java',  // V4: 단일 필드
            level: 'ADVANCED',
            yearsOfUse: 2.5,
            lastUsedAt: '2025-11-20',
            note: '주로 Spring Boot 개발에 사용',
          },
          {
            memberSkillId: 2,
            technologyName: 'spring-boot',
            level: 'INTERMEDIATE',
            yearsOfUse: 1.5,
            lastUsedAt: '2025-11-20',
            note: 'REST API 개발',
          },
        ],
        totalCount: 2,
      },
      timestamp: new Date().toISOString(),
    });
  }),

  http.post(`${BASE_URL}/members/:memberId/skills`, async ({ request }) => {
    const body = await request.json() as any;
    return HttpResponse.json({
      success: true,
      data: {
        memberSkillId: 3,
        technologyName: body.technologyName,  // V4: technologyName 사용
        level: body.level,
        yearsOfUse: body.yearsOfUse,
        lastUsedAt: body.lastUsedAt,
        note: body.note,
      },
      message: '기술 스택이 추가되었습니다.',
      timestamp: new Date().toISOString(),
    }, { status: 201 });
  }),

  http.put(`${BASE_URL}/members/:memberId/skills/:skillId`, async ({ request, params }) => {
    const body = await request.json() as any;
    return HttpResponse.json({
      success: true,
      data: {
        memberSkillId: Number(params.skillId),
        technologyName: 'java',  // V4: 수정 시 technologyName 유지
        level: body.level,
        yearsOfUse: body.yearsOfUse,
        lastUsedAt: body.lastUsedAt,
        note: body.note,
        updatedAt: new Date().toISOString(),
      },
      message: '기술 스택이 수정되었습니다.',
      timestamp: new Date().toISOString(),
    });
  }),

  http.delete(`${BASE_URL}/members/:memberId/skills/:skillId`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // 4. 학습 목표 API
  http.get(`${BASE_URL}/members/:memberId/goals`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        goals: [
          {
            learningGoalId: 1,
            title: '우테코 프리코스 완주',
            description: '6주간의 프리코스를 성실히 완주하기',
            dueDate: '2025-12-31',
            priority: 'HIGH',
            status: 'ACTIVE',
            createdAt: '2025-11-01T10:00:00',
            updatedAt: '2025-11-01T10:00:00',
          },
        ],
        totalCount: 1,
      },
      timestamp: new Date().toISOString(),
    });
  }),

  http.post(`${BASE_URL}/members/:memberId/goals`, async ({ request }) => {
    const body = await request.json() as any;
    return HttpResponse.json({
      success: true,
      data: {
        learningGoalId: 2,
        title: body.title,
        description: body.description,
        dueDate: body.dueDate,
        priority: body.priority,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      message: '학습 목표가 생성되었습니다.',
      timestamp: new Date().toISOString(),
    }, { status: 201 });
  }),

  http.put(`${BASE_URL}/members/:memberId/goals/:goalId`, async ({ request }) => {
    const body = await request.json() as any;
    return HttpResponse.json({
      success: true,
      data: {
        learningGoalId: 1,
        title: body.title,
        description: body.description,
        dueDate: body.dueDate,
        priority: body.priority,
        status: body.status,
        updatedAt: new Date().toISOString(),
      },
      message: '학습 목표가 수정되었습니다.',
      timestamp: new Date().toISOString(),
    });
  }),

  http.delete(`${BASE_URL}/members/:memberId/goals/:goalId`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // 5. 학습 플랜 API
  http.post(`${BASE_URL}/members/:memberId/learning-plans`, async ({ request }) => {
    const body = await request.json() as any;
    return HttpResponse.json({
      success: true,
      data: {
        learningPlanId: 1,
        memberId: 1,
        targetTechnology: body.targetTechName,
        totalWeeks: body.timeFrameWeeks || 4,
        totalHours: 42,
        status: 'ACTIVE',
        progress: 0,
        steps: [
          {
            stepId: 1,
            order: 1,
            title: 'Kotlin 기초 복습',
            description: '코루틴 학습에 필요한 Kotlin 기본 문법 복습',
            estimatedHours: 3,
            difficulty: 'EASY',
            completed: false,
            objectives: ['람다와 고차함수 이해하기', '확장 함수 활용법 익히기'],
            suggestedResources: [
              {
                type: 'DOC',
                title: 'Kotlin 공식 문서 - Functions',
                url: 'https://kotlinlang.org/docs/functions.html',
                language: 'ko',
              },
            ],
          },
        ],
        dailySchedule: [
          {
            dayIndex: 1,
            date: '2025-11-25',
            allocatedMinutes: 90,
            stepRef: 1,
            tasks: ['람다와 고차함수 공부', '예제 코드 실습'],
          },
        ],
        backgroundAnalysis: {
          existingRelevantSkills: ['Kotlin', 'Java'],
          missingPrerequisites: ['비동기 프로그래밍'],
          riskFactors: ['비동기 프로그래밍 경험이 없어 초반에 어려움이 있을 수 있습니다'],
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      message: '학습 플랜이 생성되었습니다.',
      timestamp: new Date().toISOString(),
    }, { status: 201 });
  }),

  http.get(`${BASE_URL}/members/:memberId/learning-plans`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        plans: [
          {
            learningPlanId: 1,
            targetTechnology: 'Kotlin Coroutines',
            totalWeeks: 4,
            totalHours: 42,
            status: 'ACTIVE',
            progress: 25,
            createdAt: '2025-11-24T17:00:00',
            updatedAt: '2025-11-24T18:30:00',
            startedAt: '2025-11-25T09:00:00',
          },
        ],
        pagination: {
          page: 0,
          size: 10,
          totalElements: 1,
          totalPages: 1,
        },
      },
      timestamp: new Date().toISOString(),
    });
  }),

  http.get(`${BASE_URL}/members/:memberId/learning-plans/:planId`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        learningPlanId: 1,
        memberId: 1,
        targetTechnology: 'Kotlin Coroutines',
        totalWeeks: 4,
        totalHours: 42,
        status: 'ACTIVE',
        progress: 25,
        steps: [
          {
            stepId: 1,
            order: 1,
            title: 'Kotlin 기초 복습',
            description: '코루틴 학습에 필요한 Kotlin 기본 문법 복습',
            estimatedHours: 3,
            difficulty: 'EASY',
            completed: false,
            objectives: ['람다와 고차함수 이해하기'],
            suggestedResources: [],
          },
        ],
        dailySchedule: [],
        backgroundAnalysis: {
          existingRelevantSkills: ['Kotlin'],
          missingPrerequisites: ['비동기 프로그래밍'],
          riskFactors: [],
        },
        createdAt: '2025-11-24T17:00:00',
        updatedAt: '2025-11-24T18:30:00',
      },
      timestamp: new Date().toISOString(),
    });
  }),

  http.patch(`${BASE_URL}/members/:memberId/learning-plans/:planId/progress`, async ({ request }) => {
    const body = await request.json() as any;
    return HttpResponse.json({
      success: true,
      data: {
        learningPlanId: 1,
        progress: body.progress,
        status: body.status,
        updatedAt: new Date().toISOString(),
      },
      message: '진행도가 업데이트되었습니다.',
      timestamp: new Date().toISOString(),
    });
  }),

  http.post(`${BASE_URL}/members/:memberId/learning-plans/:planId/steps/:stepOrder/complete`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        stepId: 1,
        order: 1,
        completed: true,
        completedAt: new Date().toISOString(),
      },
      message: '학습 스텝이 완료 처리되었습니다.',
      timestamp: new Date().toISOString(),
    });
  }),

  // 6. V4 기술 카탈로그 API (name 기반)
  http.get(`${BASE_URL}/technologies`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        technologies: [
          {
            name: 'spring-boot',
            displayName: 'Spring Boot',
            category: 'FRAMEWORK',
            difficulty: 'INTERMEDIATE',
            ecosystem: 'JVM',
            officialSite: 'https://spring.io/projects/spring-boot',
            active: true,
            description: 'Spring 기반 애플리케이션을 빠르게 개발할 수 있는 프레임워크',
            learningRoadmap: '1단계: Spring 기초 → 2단계: Spring Boot 자동 설정 → 3단계: REST API 개발',
            estimatedLearningHours: 80,
            learningTips: '공식 문서와 예제를 따라하세요',
            useCases: ['REST API', 'Microservices'],
            communityPopularity: 9,
            jobMarketDemand: 10,
          },
        ],
        totalCount: 1,
      },
      timestamp: new Date().toISOString(),
    });
  }),

  // V4: name 기반 기술 상세 조회
  http.get(`${BASE_URL}/technologies/:name`, ({ params }) => {
    const name = params.name as string;
    
    if (name === 'unknown-tech') {
      return HttpResponse.json({
        success: false,
        data: null,
        message: `Technology '${name}' not found`,
        errorCode: 'TECHNOLOGY_NOT_FOUND',
        timestamp: new Date().toISOString(),
      }, { status: 404 });
    }

    return HttpResponse.json({
      success: true,
      data: {
        name: name,
        displayName: name === 'spring-boot' ? 'Spring Boot' : name,
        category: 'FRAMEWORK',
        difficulty: 'INTERMEDIATE',
        ecosystem: 'JVM',
        officialSite: 'https://spring.io/projects/spring-boot',
        active: true,
        description: 'Spring Boot는 Spring 기반 애플리케이션을 빠르고 쉽게 개발할 수 있도록 도와주는 프레임워크입니다.',
        learningRoadmap: '1단계: Spring 기초 → 2단계: Spring Boot 자동 설정 → 3단계: REST API 개발 → 4단계: 데이터 연동',
        estimatedLearningHours: 60,
        learningTips: '공식 문서와 예제 프로젝트를 따라하며 학습하는 것이 효과적입니다.',
        useCases: ['REST API 서버 개발', '마이크로서비스 아키텍처'],
        communityPopularity: 9,
        jobMarketDemand: 10,
        prerequisites: {
          required: [
            { name: 'java', displayName: 'Java', category: 'LANGUAGE', difficulty: 'BEGINNER' },
          ],
          recommended: [
            { name: 'spring-framework', displayName: 'Spring Framework', category: 'FRAMEWORK', difficulty: 'INTERMEDIATE' },
          ],
        },
        relatedTechnologies: [
          { name: 'kotlin', displayName: 'Kotlin', category: 'LANGUAGE', difficulty: 'INTERMEDIATE' },
        ],
      },
      timestamp: new Date().toISOString(),
    });
  }),

  // V4: 기술 생성 (관리자)
  http.post(`${BASE_URL}/technologies`, async ({ request }) => {
    const body = await request.json() as any;
    return HttpResponse.json({
      success: true,
      data: {
        name: body.name,
        displayName: body.displayName,
        category: body.category,
        difficulty: body.difficulty || 'INTERMEDIATE',
        ecosystem: body.ecosystem,
        officialSite: body.officialSite,
        active: true,
        description: body.description,
        learningRoadmap: body.learningRoadmap,
        estimatedLearningHours: body.estimatedLearningHours,
        learningTips: body.learningTips,
        useCases: body.useCases || [],
        communityPopularity: body.communityPopularity,
        jobMarketDemand: body.jobMarketDemand,
      },
      message: '기술이 등록되었습니다',
      timestamp: new Date().toISOString(),
    }, { status: 201 });
  }),

  // V4: 기술 수정 (관리자) - name 기반
  http.put(`${BASE_URL}/technologies/:name`, async ({ request, params }) => {
    const body = await request.json() as any;
    return HttpResponse.json({
      success: true,
      data: {
        name: params.name,
        displayName: body.displayName || 'Spring Boot',
        category: 'FRAMEWORK',
        difficulty: body.difficulty || 'INTERMEDIATE',
        ecosystem: body.ecosystem || 'JVM',
        officialSite: body.officialSite,
        active: body.active !== undefined ? body.active : true,
        description: body.description,
        learningRoadmap: body.learningRoadmap,
        estimatedLearningHours: body.estimatedLearningHours,
        learningTips: body.learningTips,
        useCases: body.useCases || [],
        communityPopularity: body.communityPopularity,
        jobMarketDemand: body.jobMarketDemand,
      },
      message: '기술 정보가 수정되었습니다',
      timestamp: new Date().toISOString(),
    });
  }),

  // V4: 기술 삭제 (관리자)
  http.delete(`${BASE_URL}/technologies/:name`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // ==================== v2 Feedback APIs ====================

  // 피드백 제출
  http.post(`${BASE_URL}/feedback`, async ({ request }) => {
    const body = await request.json() as any;
    return HttpResponse.json({
      success: true,
      data: {
        id: 1,
        learningPlanId: body.learningPlanId,
        stepId: body.stepId,
        rating: body.rating,
        feedbackType: body.feedbackType,
        comment: body.comment,
      },
      message: 'Feedback submitted successfully',
      timestamp: new Date().toISOString(),
    });
  }),

  // 계획별 피드백 목록 조회
  http.get(`${BASE_URL}/feedback/plans/:planId`, ({ params }) => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: 1,
          learningPlanId: Number(params.planId),
          stepId: null,
          rating: 5,
          feedbackType: 'HELPFUL',
          comment: '전체적으로 좋았습니다',
        },
        {
          id: 2,
          learningPlanId: Number(params.planId),
          stepId: 1,
          rating: 3,
          feedbackType: 'TOO_HARD',
          comment: '이 단계가 조금 어려웠습니다',
        },
      ],
      timestamp: new Date().toISOString(),
    });
  }),

  // 피드백 요약 조회
  http.get(`${BASE_URL}/feedback/plans/:planId/summary`, ({ params }) => {
    return HttpResponse.json({
      success: true,
      data: {
        planId: Number(params.planId),
        averageRating: 4.2,
        totalFeedbackCount: 5,
        typeBreakdown: {
          HELPFUL: 3,
          TOO_HARD: 1,
          TOO_EASY: 0,
          IRRELEVANT: 0,
          TIME_ISSUE: 1,
          RESOURCE_ISSUE: 0,
          GENERAL: 0,
        },
      },
      timestamp: new Date().toISOString(),
    });
  }),

  // ==================== V4 Graph APIs (Technologies API로 통합) ====================

  // V4: 기술 로드맵 조회 (GET /api/v1/technologies/{name}/roadmap)
  http.get(`${BASE_URL}/technologies/:name/roadmap`, ({ params }) => {
    const tech = params.name as string;

    // 알 수 없는 기술 처리
    if (tech === 'unknown-tech') {
      return HttpResponse.json({
        success: false,
        data: null,
        message: `Technology '${tech}' not found in graph`,
        errorCode: 'TECHNOLOGY_NOT_FOUND',
        timestamp: new Date().toISOString(),
      }, { status: 404 });
    }

    return HttpResponse.json({
      success: true,
      data: {
        technology: tech,
        displayName: tech === 'spring-boot' ? 'Spring Boot' : tech === 'react' ? 'React' : tech,
        prerequisites: {
          required: [
            { name: 'java', displayName: 'Java', category: 'LANGUAGE', difficulty: 'BEGINNER' },
          ],
          recommended: [
            { name: 'spring-framework', displayName: 'Spring Framework', category: 'FRAMEWORK', difficulty: 'INTERMEDIATE' },
          ],
        },
        nextSteps: [
          { name: 'spring-data', displayName: 'Spring Data', category: 'LIBRARY', difficulty: 'INTERMEDIATE' },
          { name: 'spring-security', displayName: 'Spring Security', category: 'LIBRARY', difficulty: 'INTERMEDIATE' },
        ],
      },
      timestamp: new Date().toISOString(),
    });
  }),

  // V4: 학습 경로 탐색 (GET /api/v1/technologies/path)
  http.get(`${BASE_URL}/technologies/path`, ({ request }) => {
    const url = new URL(request.url);
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');

    // 경로 없음 처리
    if (to === 'unknown-tech') {
      return HttpResponse.json({
        success: false,
        data: null,
        message: `Cannot find learning path from '${from}' to '${to}'`,
        errorCode: 'NO_PATH_FOUND',
        timestamp: new Date().toISOString(),
      }, { status: 404 });
    }

    return HttpResponse.json({
      success: true,
      data: {
        from,
        to,
        totalSteps: 4,
        path: [
          { step: 1, technology: 'python-data', relation: 'RECOMMENDED_AFTER' },
          { step: 2, technology: 'ml-theory', relation: 'DEPENDS_ON' },
          { step: 3, technology: 'docker', relation: 'USED_WITH' },
          { step: 4, technology: to, relation: 'RECOMMENDED_AFTER' },
        ],
      },
      timestamp: new Date().toISOString(),
    });
  }),

  // V4: 연관 기술 추천 (GET /api/v1/technologies/{name}/recommendations)
  http.get(`${BASE_URL}/technologies/:name/recommendations`, ({ params }) => {
    const tech = params.name as string;

    if (tech === 'unknown-tech') {
      return HttpResponse.json({
        success: false,
        data: null,
        message: `Technology '${tech}' not found in graph`,
        errorCode: 'TECHNOLOGY_NOT_FOUND',
        timestamp: new Date().toISOString(),
      }, { status: 404 });
    }

    return HttpResponse.json({
      success: true,
      data: {
        technology: tech,
        recommendations: [
          { name: 'nextjs', displayName: 'Next.js', relation: 'CONTAINS', category: 'FRAMEWORK' },
          { name: 'tailwind', displayName: 'Tailwind CSS', relation: 'USED_WITH', category: 'LIBRARY' },
          { name: 'zustand', displayName: 'Zustand', relation: 'USED_WITH', category: 'LIBRARY' },
        ],
      },
      timestamp: new Date().toISOString(),
    });
  }),

  // V4: 갭 분석 (POST /api/v1/technologies/gap-analysis)
  http.post(`${BASE_URL}/technologies/gap-analysis`, async ({ request }) => {
    const body = await request.json() as any;
    const { knownTechnologies, targetTechnology } = body;

    if (targetTechnology === 'unknown-tech') {
      return HttpResponse.json({
        success: false,
        data: null,
        message: `Target technology '${targetTechnology}' not found in graph`,
        errorCode: 'TECHNOLOGY_NOT_FOUND',
        timestamp: new Date().toISOString(),
      }, { status: 404 });
    }

    // java, sql을 알고 있으면 spring-boot 학습 가능
    const hasJava = knownTechnologies.includes('java');
    const ready = hasJava;
    const readinessScore = hasJava ? 0.8 : 0.3;

    return HttpResponse.json({
      success: true,
      data: {
        target: targetTechnology,
        known: knownTechnologies,
        missing: ready ? [] : [
          { name: 'java', displayName: 'Java', priority: 'HIGH' },
        ],
        ready,
        readinessScore,
        message: ready
          ? `${knownTechnologies.join(', ')} 지식이 있으므로 ${targetTechnology} 학습이 가능합니다.`
          : `다음 기술을 먼저 학습하면 더 효과적입니다: java`,
      },
      timestamp: new Date().toISOString(),
    });
  }),

  // V4: 기술 관계 조회 (GET /api/v1/technologies/{name}/relationships)
  http.get(`${BASE_URL}/technologies/:name/relationships`, ({ params }) => {
    const tech = params.name as string;

    if (tech === 'unknown-tech') {
      return HttpResponse.json({
        success: false,
        data: null,
        message: `Technology '${tech}' not found`,
        errorCode: 'TECHNOLOGY_NOT_FOUND',
        timestamp: new Date().toISOString(),
      }, { status: 404 });
    }

    return HttpResponse.json({
      success: true,
      data: [
        { from: tech, to: 'java', relation: 'DEPENDS_ON', weight: 1.0 },
        { from: tech, to: 'kotlin', relation: 'USED_WITH', weight: 1.0 },
      ],
      timestamp: new Date().toISOString(),
    });
  }),

  // V4: 관계 생성 (POST /api/v1/technologies/{name}/relationships)
  http.post(`${BASE_URL}/technologies/:name/relationships`, async ({ request, params }) => {
    const body = await request.json() as any;
    return HttpResponse.json({
      success: true,
      data: {
        from: params.name,
        to: body.to,
        relation: body.relation,
        weight: body.weight || 1.0,
      },
      message: '관계가 생성되었습니다',
      timestamp: new Date().toISOString(),
    }, { status: 201 });
  }),

  // V4: 관계 삭제 (DELETE /api/v1/technologies/{from}/relationships/{to})
  http.delete(`${BASE_URL}/technologies/:from/relationships/:to`, () => {
    return new HttpResponse(null, { status: 204 });
  }),
];

