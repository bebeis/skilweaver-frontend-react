# Vercel 배포 가이드

## 배포 준비사항

### 1. EC2 서버 확인
먼저 EC2 서버가 다음 조건을 만족하는지 확인하세요:
- ✅ Spring Boot API가 실행 중
- ✅ 포트가 열려있음 (예: 8080)
- ✅ CORS 설정이 Vercel 도메인을 허용
- ✅ HTTPS 설정 (권장) 또는 HTTP 허용

### 2. EC2 서버 CORS 설정
Spring Boot `application.yml` 또는 `application.properties`에서 CORS 설정:

```yaml
# application.yml 예시
spring:
  web:
    cors:
      allowed-origins:
        - "https://your-app.vercel.app"
        - "https://*.vercel.app"  # 프리뷰 배포도 허용
        - "http://localhost:3000"  # 로컬 개발
      allowed-methods:
        - GET
        - POST
        - PUT
        - PATCH
        - DELETE
        - OPTIONS
      allowed-headers:
        - "*"
      allow-credentials: true
      max-age: 3600
```

또는 Java 코드로 설정:

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(
                    "https://your-app.vercel.app",
                    "https://*.vercel.app",
                    "http://localhost:3000"
                )
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

### 3. Vercel 배포 단계

#### 방법 1: Vercel CLI 사용

```bash
# Vercel CLI 설치
npm install -g vercel

# 로그인
vercel login

# 프로젝트 배포
vercel

# 프로덕션 배포
vercel --prod
```

#### 방법 2: GitHub 연동 (권장)

1. GitHub 저장소에 코드 푸시
2. [Vercel 대시보드](https://vercel.com/dashboard) 접속
3. "Add New Project" 클릭
4. GitHub 저장소 선택
5. 환경 변수 설정 (아래 참고)
6. Deploy 클릭

### 4. Vercel 환경 변수 설정

Vercel 대시보드에서 다음 환경 변수를 설정하세요:

| 변수명 | 값 예시 | 설명 |
|--------|---------|------|
| `VITE_API_BASE_URL` | `https://api.skillweaver.com/api/v1` | EC2 서버의 API URL |

**설정 방법:**
1. Vercel 프로젝트 → Settings → Environment Variables
2. 변수명과 값 입력
3. Environment 선택 (Production, Preview, Development)
4. Save

### 5. vercel.json 수정

`vercel.json` 파일의 `rewrites` 섹션을 실제 EC2 서버 주소로 수정하세요:

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

**옵션:**
- **Option 1**: 환경 변수 사용 (프록시)
  - `vercel.json`의 rewrites를 그대로 사용
  - API 요청이 Vercel을 통해 EC2로 프록시됨
  - 장점: CORS 이슈 없음, 클라이언트가 EC2 주소를 몰라도 됨
  
- **Option 2**: 직접 연결
  - `VITE_API_BASE_URL`을 EC2 서버 주소로 직접 설정
  - `vercel.json`에서 rewrites 제거
  - 장점: 더 빠른 응답, 프록시 오버헤드 없음
  - 단점: CORS 설정 필수

### 6. 배포 확인

배포 후 다음을 확인하세요:

```bash
# 1. 빌드 성공 확인
vercel logs [deployment-url]

# 2. API 연결 테스트
curl https://your-app.vercel.app/api/v1/health

# 3. 브라우저에서 확인
# - 개발자 도구 → Network 탭
# - API 요청이 정상적으로 전송되는지 확인
```

## 트러블슈팅

### CORS 오류
```
Access to fetch at 'https://...' from origin 'https://your-app.vercel.app' 
has been blocked by CORS policy
```

**해결방법:**
1. EC2 서버의 CORS 설정에 Vercel 도메인 추가
2. 또는 `vercel.json`의 rewrites를 활성화하여 프록시 사용

### API 연결 실패
```
Failed to fetch
```

**확인사항:**
1. EC2 서버가 실행 중인가?
2. EC2 보안 그룹에서 포트가 열려있는가?
3. `VITE_API_BASE_URL` 환경 변수가 올바른가?
4. HTTPS를 사용하는 경우 인증서가 유효한가?

### 404 Not Found (React Router)
페이지 새로고침 시 404 오류

**해결방법:**
`vercel.json`에 이미 SPA 라우팅 설정이 포함되어 있습니다. 문제가 계속되면:

```json
{
  "routes": [
    {
      "src": "/[^.]+",
      "dest": "/",
      "status": 200
    }
  ]
}
```

## 추가 최적화

### 1. 프리뷰 배포 활용
- Pull Request마다 자동으로 프리뷰 배포 생성
- 팀원들과 변경사항 미리 확인 가능

### 2. 환경별 설정
```bash
# .env.production
VITE_API_BASE_URL=https://api.skillweaver.com/api/v1

# .env.development
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

### 3. 성능 모니터링
- Vercel Analytics 활성화
- Real User Monitoring 확인

## 유용한 명령어

```bash
# 로컬에서 프로덕션 빌드 테스트
npm run build
npm run preview

# Vercel 로그 확인
vercel logs

# 환경 변수 확인
vercel env ls

# 도메인 설정
vercel domains add your-domain.com
```

## 보안 체크리스트

- [ ] EC2 서버에 HTTPS 적용 (Let's Encrypt 권장)
- [ ] 환경 변수를 Git에 커밋하지 않음
- [ ] CORS 설정이 와일드카드(*)를 사용하지 않음
- [ ] API 키가 클라이언트에 노출되지 않음
- [ ] Rate limiting 설정 (EC2 서버)

## 지원

문제가 발생하면:
1. [Vercel 문서](https://vercel.com/docs)
2. [Vercel 커뮤니티](https://github.com/vercel/vercel/discussions)
3. EC2 서버 로그 확인

