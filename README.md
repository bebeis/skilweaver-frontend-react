# SkillWeaver Frontend V2

AI 기반 맞춤형 기술 학습 플랫폼 프론트엔드

## 🚀 기술 스택

- **프레임워크**: React 18 + TypeScript
- **빌드 도구**: Vite
- **라우팅**: React Router v6
- **스타일링**: TailwindCSS + shadcn/ui
- **상태 관리**: React Context API
- **테스팅**: Vitest + Testing Library + MSW
- **배포**: Vercel

## 📦 시작하기

### 설치

```bash
npm install
```

### 환경 변수 설정

로컬 개발을 위해 `.env.local` 파일을 생성하세요:

```bash
# env.example.txt 파일을 참고하여 .env.local 생성
cp env.example.txt .env.local
```

`.env.local` 내용:

```env
# 로컬 개발 - EC2 서버가 localhost:8080에서 실행 중인 경우
VITE_API_BASE_URL=http://localhost:8080/api/v1

# 또는 원격 EC2 서버에 연결하는 경우
# VITE_API_BASE_URL=https://your-ec2-domain.com/api/v1
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 접속

### 빌드

```bash
npm run build
```

### 프로덕션 미리보기

```bash
npm run preview
```

## 🧪 테스트

```bash
# 테스트 실행
npm test

# UI 모드
npm run test:ui

# 커버리지
npm run test:coverage
```

자세한 테스트 가이드는 [README.test.md](./README.test.md) 참고

## 🌐 Vercel 배포

### 빠른 배포

#### 방법 1: Vercel CLI

```bash
# Vercel CLI 설치
npm install -g vercel

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

#### 방법 2: GitHub 연동 (권장)

1. GitHub에 저장소 푸시
2. [Vercel](https://vercel.com) 로그인
3. "Add New Project" → GitHub 저장소 선택
4. 환경 변수 설정:
   - `VITE_API_BASE_URL`: EC2 서버 API URL
5. Deploy 클릭

### EC2 서버 연결 설정

**중요**: `vercel.json` 파일에서 EC2 서버 주소를 설정해야 합니다.

```json
{
  "rewrites": [
    {
      "source": "/api/v1/:path*",
      "destination": "https://your-ec2-domain.com/api/v1/:path*"
    }
  ]
}
```

**두 가지 연결 방법:**

1. **프록시 방식** (기본값, 권장)
   - `vercel.json`의 rewrites 사용
   - CORS 이슈 없음
   - Vercel이 API 요청을 EC2로 프록시

2. **직접 연결**
   - `VITE_API_BASE_URL`을 EC2 주소로 설정
   - EC2에서 CORS 설정 필수

자세한 배포 가이드는 [DEPLOYMENT.md](./DEPLOYMENT.md) 참고

## 📁 프로젝트 구조

```
├── components/          # React 컴포넌트
│   ├── ui/             # shadcn/ui 컴포넌트
│   ├── layout/         # 레이아웃 컴포넌트
│   └── learning-plans/ # 도메인별 컴포넌트
├── pages/              # 페이지 컴포넌트
│   ├── auth/          # 인증 페이지
│   ├── goals/         # 학습 목표
│   ├── skills/        # 기술 스택
│   └── learning-plans/ # 학습 플랜
├── src/
│   ├── lib/
│   │   └── api/       # API 클라이언트
│   └── test/          # 테스트 설정
├── contexts/          # React Context
├── hooks/             # Custom Hooks
├── styles/            # 전역 스타일
└── docs/              # 문서
```

## 🔧 주요 기능

- ✅ 사용자 인증 (회원가입/로그인)
- ✅ 기술 스택 관리
- ✅ 학습 목표 설정
- ✅ AI 기반 학습 플랜 생성
- ✅ 학습 진행도 추적
- ✅ 기술 카탈로그 조회
- ✅ 다크 모드 지원

## 🔑 환경 변수

| 변수명 | 필수 | 기본값 | 설명 |
|--------|------|--------|------|
| `VITE_API_BASE_URL` | ✅ | `/api/v1` | EC2 서버 API 베이스 URL |

## 📚 문서

- [API 명세서](./docs/apispec/v1/API_SPECIFICATION_V1.md)
- [테스트 가이드](./README.test.md)
- [배포 가이드](./DEPLOYMENT.md)
- [프로젝트 계획](./docs/plan/PROJECT_INITIAL_PLAN_V1.md)
- [요구사항 명세서](./docs/srs.md)

## 🛠 개발 도구

### VS Code 확장

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript and JavaScript Language Features

### 코드 스타일

- TypeScript strict mode
- ESLint + Prettier
- TailwindCSS class sorting

## 🚨 트러블슈팅

### API 연결 실패

```
Failed to fetch
```

**확인사항:**
1. EC2 서버가 실행 중인지 확인
2. 포트가 올바른지 확인
3. CORS 설정 확인 (프록시 미사용 시)

### CORS 오류

```
Access to fetch has been blocked by CORS policy
```

**해결방법:**
1. `vercel.json`의 rewrites 활성화 (프록시 사용)
2. 또는 EC2 서버에 CORS 설정 추가

### 빌드 오류

```bash
# 캐시 삭제 후 재빌드
rm -rf node_modules dist
npm install
npm run build
```

## 📄 라이선스

이 프로젝트는 비공개 프로젝트입니다.

## 👥 기여

Luna - 개발자

## 📞 지원

문제가 발생하면 [DEPLOYMENT.md](./DEPLOYMENT.md)의 트러블슈팅 섹션을 참고하세요.

