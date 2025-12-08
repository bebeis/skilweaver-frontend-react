# RAFT 사용 가이드 및 클라우드 배포 문서

## 1. RAFT란?

**RAFT (Retrieval Augmented Fine-Tuning)** 는 RAG와 Fine-tuning을 결합한 기법입니다.
모델에게 "문서를 보고 정답을 찾는 방법"을 학습시켜 환각(Hallucination)을 줄입니다.

---

## 2. RAFT 실행 방법 (Step-by-Step)

### Step 1: 환경 준비
```bash
cd /path/to/skillweaver/scripts
pip install openai
export OPENAI_API_KEY=sk-your-key
```

### Step 2: 학습 데이터 생성
```bash
python raft_data_generator.py \
  --input-dir ../src/main/resources/knowledge-seed \
  --output training_data.jsonl \
  --num-examples 50 \
  --distractors 2
```

### Step 3: OpenAI에 파일 업로드
```bash
openai api files.create -f training_data.jsonl -p fine-tune
# 결과: file-abc123xyz
```

### Step 4: Fine-tuning 작업 생성
```bash
openai api fine_tuning.jobs.create \
  -t file-abc123xyz \
  -m gpt-4o-mini-2024-07-18
# 결과: ftjob-xxx
```

### Step 5: 학습 상태 확인
```bash
openai api fine_tuning.jobs.retrieve -i ftjob-xxx
# status: "succeeded" 될 때까지 대기 (약 10-30분)
```

### Step 6: 모델 ID 확보
```bash
openai api fine_tuning.jobs.retrieve -i ftjob-xxx | jq '.fine_tuned_model'
# 예: "ft:gpt-4o-mini-2024-07-18:my-org:skillweaver:abc123"
```

---

## 3. 로컬 테스트 방법

### 환경 변수 설정 (.env 파일)
```bash
# Qdrant Cloud
QDRANT_CLOUD_ENDPOINT=xxx.us-west-1-0.aws.cloud.qdrant.io
QDRANT_CLOUD_API_KEY=your-api-key
QDRANT_USE_TLS=true

# Neo4j AuraDB
NEO4J_URI=neo4j+s://xxx.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your-password
GRAPH_RAG_ENABLED=true

# RAFT (Fine-tuned 모델)
RAFT_ENABLED=true
RAFT_MODEL_ID=ft:gpt-4o-mini-2024-07-18:my-org:skillweaver:abc123
```

### 애플리케이션 실행
```bash
source .env
JAVA_HOME=/path/to/jdk-21 ./gradlew bootRun --args='--spring.profiles.active=rag'
```

### 테스트 API 호출
```bash
curl -X POST http://localhost:8080/api/v1/agent/learning-plan \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "targetTechnology": "spring-boot",
    "currentLevel": "BEGINNER"
  }'
```

---

## 4. AWS EC2 배포 가이드 (클라우드 서비스 활용)

### 아키텍처
```
┌───────────────────────────────────────────────────────────────┐
│                         AWS Cloud                              │
│  ┌─────────────────┐                                          │
│  │   EC2 t3.small  │                                          │
│  │   (Spring Boot) │───────┐                                  │
│  └─────────────────┘       │                                  │
│                            ▼                                  │
│  ┌─────────────────┐  ┌─────────────────┐                    │
│  │   RDS MySQL     │  │  OpenAI API     │                    │
│  │   (Database)    │  │  (LLM + RAFT)   │                    │
│  └─────────────────┘  └─────────────────┘                    │
└───────────────────────────────────────────────────────────────┘
          │                              │
          ▼                              ▼
┌─────────────────┐            ┌─────────────────┐
│  Qdrant Cloud   │            │  Neo4j AuraDB   │
│  (Vector Store) │            │  (Graph DB)     │
└─────────────────┘            └─────────────────┘
```

### Step 1: EC2 인스턴스 생성
- **AMI**: Amazon Linux 2023
- **인스턴스 유형**: t3.small (2 vCPU, 2GB RAM) - 클라우드 DB 사용으로 충분
- **스토리지**: 20GB SSD
- **보안 그룹**: 22 (SSH), 8080 (Spring Boot)

### Step 2: EC2에 필수 도구 설치
```bash
# JDK 21 설치
sudo yum install -y java-21-amazon-corretto
export JAVA_HOME=/usr/lib/jvm/java-21-amazon-corretto

# Git 설치
sudo yum install -y git
```

### Step 3: RDS MySQL 생성
- **엔진**: MySQL 8.0
- **인스턴스**: db.t3.micro (개발용)
- **스토리지**: 20GB
- **보안 그룹**: EC2에서 3306 접근 허용

### Step 4: 환경 변수 설정
```bash
cat > /home/ec2-user/skillweaver/.env << 'EOF'
SPRING_PROFILES_ACTIVE=prod,rag
SERVER_PORT=8080

# RDS MySQL
SPRING_DATASOURCE_URL=jdbc:mysql://your-rds-endpoint:3306/skillweaver
SPRING_DATASOURCE_USERNAME=admin
SPRING_DATASOURCE_PASSWORD=your-rds-password

# OpenAI
OPENAI_API_KEY=sk-xxx

# Qdrant Cloud
QDRANT_CLOUD_ENDPOINT=xxx.us-west-1-0.aws.cloud.qdrant.io
QDRANT_CLOUD_API_KEY=your-qdrant-api-key
QDRANT_USE_TLS=true

# Neo4j AuraDB
NEO4J_URI=neo4j+s://xxx.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your-neo4j-password
GRAPH_RAG_ENABLED=true

# RAFT Fine-tuned Model
RAFT_ENABLED=true
RAFT_MODEL_ID=ft:gpt-4o-mini-2024-07-18:my-org:skillweaver:abc123
EOF
```

### Step 5: 애플리케이션 배포
```bash
git clone https://github.com/your-org/skillweaver.git
cd skillweaver

# 환경 변수 로드
source .env

# JAR 빌드 및 실행
./gradlew bootJar
java -Xmx512m -jar build/libs/skillweaver-*.jar
```

### Step 6: systemd 서비스 등록 (선택)
```bash
sudo vi /etc/systemd/system/skillweaver.service
```

```ini
[Unit]
Description=SkillWeaver Service
After=network.target

[Service]
User=ec2-user
WorkingDirectory=/home/ec2-user/skillweaver
ExecStart=/usr/lib/jvm/java-21-amazon-corretto/bin/java -Xmx512m -jar build/libs/skillweaver-0.0.1-SNAPSHOT.jar
EnvironmentFile=/home/ec2-user/skillweaver/.env
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable skillweaver
sudo systemctl start skillweaver
```

---

## 5. 비용 예측

| 항목 | 월간 비용 (예상) |
|------|-----------------|
| EC2 t3.small | ~$15 |
| RDS db.t3.micro | ~$15 |
| Qdrant Cloud (Free Tier 1GB) | $0 |
| Neo4j AuraDB (Free Tier) | $0 |
| OpenAI RAFT 학습 | ~$2 (1회) |
| OpenAI RAFT 추론 | ~$10/월 (사용량 따라) |
| **합계** | **~$40/월** |

---

## 6. 클라우드 서비스 설정 예시

### Qdrant Cloud 연결 확인 (Java)
```java
QdrantClient client = new QdrantClient(
    QdrantGrpcClient.newBuilder(
        "xxx.us-west-1-0.aws.cloud.qdrant.io",
        6334,
        true  // useTls
    )
    .withApiKey("your-api-key")
    .build()
);

List<String> collections = client.listCollectionsAsync(Duration.ofSeconds(5)).get();
System.out.println(collections);
```

### Neo4j AuraDB 연결 확인 (Java)
```java
Driver driver = GraphDatabase.driver(
    "neo4j+s://xxx.databases.neo4j.io",
    AuthTokens.basic("neo4j", "your-password")
);
driver.verifyConnectivity();
System.out.println("Neo4j connection established.");
```

---

## 7. 문제 해결

### Qdrant Cloud 연결 실패
```bash
# TLS 설정 확인
export QDRANT_USE_TLS=true

# API Key 확인
echo $QDRANT_CLOUD_API_KEY
```

### Neo4j AuraDB 연결 실패
```bash
# URI 형식 확인 (neo4j+s:// 필수)
echo $NEO4J_URI

# 비밀번호에 특수문자 있으면 따옴표로 감싸기
export NEO4J_PASSWORD='your$pecial!password'
```

### RAFT 모델이 적용되지 않음
```bash
# 환경 변수 확인
echo $RAFT_ENABLED
echo $RAFT_MODEL_ID

# 로그에서 확인
grep "raftModelId" logs/application.log
```
