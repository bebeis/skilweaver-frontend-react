# SkillWeaver API 테스트 가이드

## 개요

이 문서는 SkillWeaver 프론트엔드의 API 테스트 구조와 실행 방법을 설명합니다.

## 테스트 스택

- **Vitest**: 빠르고 현대적인 테스트 러너
- **MSW (Mock Service Worker)**: API 모킹을 위한 라이브러리
- **Testing Library**: React 컴포넌트 테스트를 위한 유틸리티

## 프로젝트 구조

```
src/
├── lib/
│   └── api/
│       ├── client.ts              # API 클라이언트 유틸리티
│       ├── types.ts               # API 타입 정의
│       ├── auth.ts                # 인증 API
│       ├── skills.ts              # 기술 스택 API
│       ├── goals.ts               # 학습 목표 API
│       ├── learning-plans.ts      # 학습 플랜 API
│       └── __tests__/
│           ├── auth.test.ts       # 인증 API 테스트
│           ├── skills.test.ts     # 기술 스택 API 테스트
│           ├── goals.test.ts      # 학습 목표 API 테스트
│           ├── learning-plans.test.ts  # 학습 플랜 API 테스트
│           └── integration.test.ts     # 통합 시나리오 테스트
└── test/
    ├── setup.ts                   # 테스트 환경 설정
    └── mocks/
        ├── server.ts              # MSW 서버 설정
        └── handlers.ts            # API 모킹 핸들러

vitest.config.ts                   # Vitest 설정
```

## 설치

```bash
npm install
```

## 테스트 실행

### 모든 테스트 실행

```bash
npm test
```

### 특정 테스트 파일 실행

```bash
npm test auth.test
```

### UI 모드로 실행

```bash
npm run test:ui
```

### 커버리지 리포트 생성

```bash
npm run test:coverage
```

## 테스트 커버리지

현재 구현된 테스트:

### 1. 인증 API 테스트 (`auth.test.ts`)
- ✅ 회원가입
- ✅ 로그인 (성공/실패)
- ✅ 토큰 재발급
- ✅ 로그아웃
- ✅ 현재 사용자 정보 조회

### 2. 기술 스택 API 테스트 (`skills.test.ts`)
- ✅ 기술 스택 목록 조회
- ✅ 기술 스택 추가 (정규화된 기술 / 커스텀 기술)
- ✅ 기술 스택 수정
- ✅ 기술 스택 삭제

### 3. 학습 목표 API 테스트 (`goals.test.ts`)
- ✅ 학습 목표 목록 조회
- ✅ 학습 목표 생성
- ✅ 학습 목표 수정
- ✅ 학습 목표 삭제
- ✅ 학습 목표 상태 변경 (완료)

### 4. 학습 플랜 API 테스트 (`learning-plans.test.ts`)
- ✅ 학습 플랜 생성
- ✅ 학습 플랜 목록 조회
- ✅ 학습 플랜 상세 조회
- ✅ 학습 플랜 진행도 업데이트
- ✅ 학습 스텝 완료 처리

### 5. 통합 시나리오 테스트 (`integration.test.ts`)
- ✅ 신규 회원 온보딩 플로우
- ✅ 학습 플랜 진행 플로우
- ✅ 프로필 수정 플로우

## API 클라이언트 사용법

### 기본 사용

```typescript
import { authApi } from '@/lib/api/auth';

// 로그인
const response = await authApi.login({
  email: 'user@example.com',
  password: 'password123!',
});

if (response.success) {
  console.log('액세스 토큰:', response.data.accessToken);
  // 토큰은 자동으로 apiClient에 설정됩니다
}
```

### 에러 처리

```typescript
import { skillsApi } from '@/lib/api/skills';

try {
  const response = await skillsApi.addSkill(memberId, skillData);
  console.log('성공:', response.data);
} catch (error) {
  // ApiError 타입
  console.error('에러:', error.message);
  console.error('에러 코드:', error.errorCode);
}
```

### 인증 토큰 관리

```typescript
import { apiClient } from '@/lib/api/client';

// 토큰 설정
apiClient.setAccessToken('your-access-token');

// 토큰 조회
const token = apiClient.getAccessToken();

// 토큰 제거 (로그아웃)
apiClient.setAccessToken(null);
```

## MSW 핸들러 커스터마이징

테스트에서 특정 응답을 시뮬레이션하려면:

```typescript
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';

it('특정 에러 케이스 테스트', async () => {
  // 이 테스트에서만 특정 응답 반환
  server.use(
    http.post('/api/v1/auth/login', () => {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          message: '서버 오류',
          errorCode: 'INTERNAL_SERVER_ERROR',
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    })
  );

  // 테스트 코드...
});
```

## API 명세서 대응

모든 API 엔드포인트는 `docs/apispec/v1/API_SPECIFICATION_V1.md`의 명세를 따릅니다:

- ✅ 회원 관리 API (섹션 1)
- ✅ 기술 스택 관리 API (섹션 2)
- ✅ 학습 목표 관리 API (섹션 3)
- ✅ 기술 카탈로그 API (섹션 4) - 부분 구현
- ✅ 학습 플랜 API (섹션 7) - 부분 구현

## 다음 단계

1. **기술 카탈로그 API 완성**
   - 기술 목록 조회
   - 기술 상세 조회
   - 기술 지식 베이스 API

2. **AI 에이전트 API**
   - 비동기 에이전트 실행
   - SSE 이벤트 스트림

3. **실제 백엔드 통합**
   - 환경 변수 설정
   - 인터셉터 추가 (에러 처리, 재시도 로직)
   - 토큰 리프레시 자동화

## 문제 해결

### 테스트가 실패하는 경우

1. **MSW 서버가 시작되지 않음**
   ```bash
   # setup.ts 파일 확인
   # beforeAll에서 server.listen()이 호출되는지 확인
   ```

2. **타입 에러**
   ```bash
   # tsconfig.json에 테스트 경로가 포함되어 있는지 확인
   ```

3. **모듈을 찾을 수 없음**
   ```bash
   # vitest.config.ts의 alias 설정 확인
   ```

## 참고 자료

- [Vitest 공식 문서](https://vitest.dev/)
- [MSW 공식 문서](https://mswjs.io/)
- [Testing Library 공식 문서](https://testing-library.com/)
- [SkillWeaver API 명세서](./docs/apispec/v1/API_SPECIFICATION_V1.md)

