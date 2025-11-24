# EC2 서버 CORS 설정 가이드

Vercel에 배포된 프론트엔드가 EC2 서버의 Spring Boot API에 연결하기 위한 CORS 설정 가이드입니다.

## 1. Spring Boot CORS 설정

### 방법 1: WebMvcConfigurer 사용 (권장)

`src/main/java/com/skillweaver/config/CorsConfig.java` 생성:

```java
package com.skillweaver.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(
                    "http://localhost:3000",           // 로컬 개발
                    "https://skillweaver.vercel.app",  // 프로덕션
                    "https://*.vercel.app"             // 프리뷰 배포 (와일드카드)
                )
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

### 방법 2: application.yml 설정

`src/main/resources/application.yml`:

```yaml
spring:
  web:
    cors:
      allowed-origins:
        - "http://localhost:3000"
        - "https://skillweaver.vercel.app"
        - "https://*.vercel.app"
      allowed-methods:
        - GET
        - POST
        - PUT
        - PATCH
        - DELETE
        - OPTIONS
      allowed-headers: "*"
      allow-credentials: true
      max-age: 3600
```

### 방법 3: Security Config (Spring Security 사용 시)

`src/main/java/com/skillweaver/config/SecurityConfig.java`:

```java
package com.skillweaver.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            // ... 나머지 설정
            ;
        
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:3000",
            "https://skillweaver.vercel.app",
            "https://*.vercel.app"
        ));
        
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
        ));
        
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        
        return source;
    }
}
```

## 2. EC2 보안 그룹 설정

EC2 인스턴스의 보안 그룹에서 필요한 포트를 열어야 합니다.

### 인바운드 규칙 추가

AWS 콘솔 → EC2 → 보안 그룹 → 인바운드 규칙 편집:

| 유형 | 프로토콜 | 포트 범위 | 소스 | 설명 |
|------|----------|-----------|------|------|
| HTTP | TCP | 80 | 0.0.0.0/0 | HTTP 접근 |
| HTTPS | TCP | 443 | 0.0.0.0/0 | HTTPS 접근 |
| Custom TCP | TCP | 8080 | 0.0.0.0/0 | Spring Boot (개발) |

⚠️ **프로덕션에서는** 0.0.0.0/0 대신 Vercel IP 범위 또는 ALB/CloudFront만 허용하는 것이 안전합니다.

## 3. HTTPS 설정 (권장)

### Let's Encrypt + Nginx 리버스 프록시

#### 3.1 Nginx 설치

```bash
sudo apt update
sudo apt install nginx -y
```

#### 3.2 Certbot 설치

```bash
sudo apt install certbot python3-certbot-nginx -y
```

#### 3.3 도메인 설정

도메인 DNS에 A 레코드 추가:
```
A    api    your-ec2-ip
```

#### 3.4 SSL 인증서 발급

```bash
sudo certbot --nginx -d api.yourdomain.com
```

#### 3.5 Nginx 설정

`/etc/nginx/sites-available/skillweaver`:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    # SSL 설정
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS 헤더 (Spring Boot에서 처리하지 않는 경우)
        add_header 'Access-Control-Allow-Origin' 'https://skillweaver.vercel.app' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, PATCH, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' '*' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        
        if ($request_method = 'OPTIONS') {
            return 204;
        }
    }
}
```

심볼릭 링크 생성 및 재시작:

```bash
sudo ln -s /etc/nginx/sites-available/skillweaver /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 3.6 자동 갱신 설정

```bash
sudo crontab -e
```

다음 줄 추가:
```
0 0 1 * * certbot renew --quiet
```

## 4. Vercel 설정 업데이트

`vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/api/v1/:path*",
      "destination": "https://api.yourdomain.com/api/v1/:path*"
    }
  ]
}
```

또는 직접 연결:

Vercel 환경 변수:
```
VITE_API_BASE_URL=https://api.yourdomain.com/api/v1
```

## 5. 테스트

### 5.1 CORS 테스트

```bash
# Preflight 요청 테스트
curl -X OPTIONS https://api.yourdomain.com/api/v1/health \
  -H "Origin: https://skillweaver.vercel.app" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v
```

응답 헤더 확인:
```
Access-Control-Allow-Origin: https://skillweaver.vercel.app
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Credentials: true
```

### 5.2 실제 요청 테스트

```bash
# GET 요청 테스트
curl https://api.yourdomain.com/api/v1/health \
  -H "Origin: https://skillweaver.vercel.app" \
  -v
```

### 5.3 브라우저에서 테스트

브라우저 콘솔에서:

```javascript
fetch('https://api.yourdomain.com/api/v1/health', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  },
  credentials: 'include'
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));
```

## 6. 트러블슈팅

### CORS 오류가 계속 발생하는 경우

1. **캐시 확인**
   ```bash
   # 브라우저에서 Hard Refresh (Cmd+Shift+R 또는 Ctrl+Shift+R)
   ```

2. **Spring Boot 로그 확인**
   ```bash
   # EC2에서
   tail -f /var/log/skillweaver/application.log
   ```

3. **Nginx 로그 확인**
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

4. **Vercel 배포 로그 확인**
   ```bash
   vercel logs your-deployment-url
   ```

### Preflight 요청 실패

OPTIONS 요청이 401 Unauthorized를 반환하는 경우:

```java
// Spring Security에서 OPTIONS 요청 허용
@Override
protected void configure(HttpSecurity http) throws Exception {
    http
        .authorizeRequests()
        .antMatchers(HttpMethod.OPTIONS, "/**").permitAll()
        // ... 나머지 설정
}
```

### 와일드카드 서브도메인 미작동

Spring Boot는 `*.vercel.app` 와일드카드를 직접 지원하지 않습니다.

**해결방법:**

```java
@Override
public void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/api/**")
            .allowedOriginPatterns("https://*.vercel.app")  // allowedOrigins 대신 사용
            .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true)
            .maxAge(3600);
}
```

## 7. 보안 체크리스트

- [ ] 프로덕션에서 HTTPS 사용
- [ ] CORS allowed origins에 와일드카드(*) 사용 안 함
- [ ] 환경별로 다른 CORS 설정 사용
- [ ] 민감한 정보를 CORS 헤더에 노출 안 함
- [ ] Rate limiting 설정
- [ ] API 키를 헤더로 전송 시 HTTPS 필수

## 8. 환경별 설정

### 개발 환경 (application-dev.yml)

```yaml
spring:
  web:
    cors:
      allowed-origins:
        - "http://localhost:3000"
      allowed-methods: "*"
      allowed-headers: "*"
      allow-credentials: true
```

### 프로덕션 환경 (application-prod.yml)

```yaml
spring:
  web:
    cors:
      allowed-origins:
        - "https://skillweaver.vercel.app"
      allowed-methods:
        - GET
        - POST
        - PUT
        - PATCH
        - DELETE
      allowed-headers:
        - Content-Type
        - Authorization
      allow-credentials: true
      max-age: 3600
```

## 참고 자료

- [Spring Boot CORS 문서](https://docs.spring.io/spring-framework/reference/web/webmvc-cors.html)
- [MDN CORS 가이드](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Vercel 배포 문서](https://vercel.com/docs)

