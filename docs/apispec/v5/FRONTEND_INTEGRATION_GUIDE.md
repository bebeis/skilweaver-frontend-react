# SkillWeaver V5 프론트엔드 통합 가이드

> **작성일**: 2025-12-12  
> **대상**: 프론트엔드 개발자  
> **버전**: API v5.0

---

## 📌 V5 기획 방향성

### 핵심 목표

**"AI 추천 학습 플랜 → 사용자 학습 목표 전환의 자연스러운 연결"**

V5 이전에는 AI가 생성한 **학습 플랜(LearningPlan)**과 사용자의 **학습 목표(LearningGoal)**가 별도로 관리되었습니다.

```
[V4 이전]
LearningPlan (AI 추천)  ←→  LearningGoal (사용자 직접 생성)
       ↓                            ↓
   별도 관리                      별도 관리
```

V5에서는 이 두 개념을 **통합**하여 사용자가 학습 플랜을 "시작"하면 자동으로 Goal이 생성되고, 진행률이 **양방향 동기화**됩니다.

```
[V5]
LearningPlan ────[시작하기]────→ LearningGoal
       ↓                            ↓
   스텝 완료 ←──────────────→ 진행률 동기화
```

### 기대 효과

| 기존 (V4) | 개선 (V5) |
|-----------|-----------|
| 플랜 완료해도 Goal 별도 관리 | 자동 연결 및 동기화 |
| 진행률 수동 입력 | 스텝 완료 시 자동 계산 |
| 학습 동기 부여 요소 없음 | 🔥 스트릭 + 📊 리포트 추가 |

---

## 🔄 도메인 변경 사항

### 1. LearningGoal 엔티티 확장

```diff
LearningGoal {
  learningGoalId: Long
  title: String
  description: String
  dueDate: LocalDate?
  priority: GoalPriority
  status: GoalStatus
  
+ // V5: Plan-Goal 연동
+ learningPlanId: Long?        // 연결된 플랜 FK
+ totalSteps: Int?             // 전체 스텝 개수
+ completedSteps: Int          // 완료된 스텝 개수 (default: 0)
+ progressPercentage: Int      // 진행률 0-100 (default: 0)
  
+ // V5 Phase 4: 스트릭
+ currentStreak: Int           // 현재 연속 학습일 (default: 0)
+ longestStreak: Int           // 최장 연속 학습일 (default: 0)
+ lastStudyDate: LocalDate?    // 마지막 학습 날짜
}
```

### 2. GoalStatus Enum 확장

```diff
enum GoalStatus {
  PLANNING     // 계획 중
  ACTIVE       // 활성 (시작 전)
+ IN_PROGRESS  // V5 추가: 학습 진행 중
  COMPLETED    // 완료
  ABANDONED    // 포기
}
```

**상태 전이 흐름:**
```
PLANNING → ACTIVE → IN_PROGRESS → COMPLETED
                        ↓
                   ABANDONED
```

> [!IMPORTANT]
> `IN_PROGRESS`는 `/start` API 호출 시 자동 설정됩니다. 프론트에서 직접 설정할 필요 없습니다.

---

## 🆕 신규 API

### 1. 학습 플랜 시작 (핵심 API)

**"학습 시작하기" 버튼 클릭 시 호출**

```http
POST /api/v1/members/{memberId}/learning-plans/{planId}/start
```

**Request (optional)**
```json
{
  "goalTitle": "Kotlin 완전정복",    // 생략 시 "{기술명} 학습하기"
  "goalDescription": "4주 완성",     // 생략 시 자동 생성
  "dueDate": "2025-12-31",
  "priority": "HIGH"                // LOW, MEDIUM, HIGH
}
```

**Response (201 Created)**
```json
{
  "success": true,
  "data": {
    "learningGoalId": 100,
    "learningPlanId": 10,
    "title": "Kotlin 완전정복",
    "status": "IN_PROGRESS",
    "totalSteps": 7,
    "completedSteps": 0,
    "progressPercentage": 0,
    "linkedPlan": {
      "learningPlanId": 10,
      "targetTechnology": "Kotlin",
      "totalWeeks": 4,
      "status": "ACTIVE"
    }
  },
  "message": "학습 목표가 생성되고 학습이 시작되었습니다."
}
```

**사용 예시 (React)**
```typescript
const startLearning = async (planId: number) => {
  const response = await api.post(`/learning-plans/${planId}/start`, {
    priority: 'HIGH'
  });
  
  // 생성된 Goal 페이지로 이동
  navigate(`/goals/${response.data.learningGoalId}`);
};
```

---

### 2. 스트릭 조회

**학습 목표 상세 페이지에서 스트릭 정보 표시**

```http
GET /api/v1/members/{memberId}/goals/{goalId}/streak
```

**Response**
```json
{
  "success": true,
  "data": {
    "currentStreak": 7,
    "longestStreak": 14,
    "lastStudyDate": "2025-12-11",
    "isActiveToday": false,
    "streakStatus": "AT_RISK",
    "message": "오늘 학습하면 8일 스트릭을 이어갈 수 있어요!"
  }
}
```

**StreakStatus 값:**
| 값 | 의미 | UI 제안 |
|----|------|---------|
| `ACTIVE` | 오늘 학습 완료 | 🔥 초록색 불꽃 |
| `AT_RISK` | 오늘 학습 안 함 | ⚠️ 주황색 경고 |
| `BROKEN` | 스트릭 끊어짐 | 💔 회색 |
| `NEW` | 아직 시작 안 함 | 🆕 파란색 |

---

### 3. 주간/월간 리포트

```http
GET /api/v1/members/{memberId}/goals/{goalId}/reports/weekly
GET /api/v1/members/{memberId}/goals/{goalId}/reports/monthly
```

**주간 리포트 Response**
```json
{
  "success": true,
  "data": {
    "weekStartDate": "2025-12-09",
    "weekEndDate": "2025-12-15",
    "completedSteps": 3,
    "totalLearningHours": 6,
    "learningDays": 5,
    "averageDailyHours": 1.2,
    "progressChange": 15,
    "milestones": [
      {"milestone": "첫 스텝 완료", "achieved": true},
      {"milestone": "목표 25% 달성", "achieved": false}
    ]
  }
}
```

---

## 📝 기존 API 변경 사항

### 1. LearningGoalResponse 확장

`GET /goals/{goalId}` 및 `GET /goals` 응답에 다음 필드가 **추가**됩니다:

```diff
{
  "learningGoalId": 100,
  "title": "...",
  "status": "IN_PROGRESS",
+ "learningPlanId": 10,        // 연결된 플랜 (없으면 null)
+ "totalSteps": 7,
+ "completedSteps": 3,
+ "progressPercentage": 42,
+ "streakInfo": {
+   "currentStreak": 5,
+   "longestStreak": 10,
+   "lastStudyDate": "2025-12-11"
+ }
}
```

> [!NOTE]
> `learningPlanId`가 null이면 사용자가 직접 생성한 Goal입니다.  
> `learningPlanId`가 있으면 플랜에서 시작된 Goal입니다.

### 2. 스텝 완료 API (동작 변경)

```http
POST /api/v1/members/{memberId}/learning-plans/{planId}/steps/{stepOrder}/complete
```

**V5 변경사항:**
- 기존: 스텝 완료만 처리
- V5: 스텝 완료 **+ 연결된 Goal 진행률 자동 업데이트**

프론트엔드에서 별도 처리 불필요 - 백엔드에서 자동 동기화합니다.

---

## 🎨 UI/UX 권장 사항

### 학습 플랜 상세 페이지

```
┌─────────────────────────────────────────────┐
│  Kotlin Coroutines 학습 플랜                │
├─────────────────────────────────────────────┤
│  4주 과정  •  총 42시간                      │
│                                             │
│  [🚀 학습 시작하기]  ← /start API 호출       │
│                                             │
│  또는 커스텀 목표 설정:                      │
│  ┌─────────────────────────────────────┐   │
│  │ 목표 제목: [                    ]   │   │
│  │ 우선순위:  [HIGH ▼]                 │   │
│  │ 목표일:    [2025-12-31]             │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### 학습 목표 상세 페이지 (V5 확장)

```
┌─────────────────────────────────────────────┐
│  🎯 Kotlin 완전정복                         │
│                                             │
│  ████████████░░░░░░░░░  42% (3/7 스텝)      │
│                                             │
│  🔥 현재 스트릭: 7일  |  최장: 14일          │
│  ⚠️ 오늘 학습하면 8일!                       │
│                                             │
│  ┌─ 이번 주 리포트 ─────────────────────┐   │
│  │ 📚 완료 스텝: 3개                     │   │
│  │ ⏱️ 학습 시간: 6시간                   │   │
│  │ 📅 학습일: 5일                        │   │
│  └──────────────────────────────────────┘   │
│                                             │
│  [연결된 플랜 보기] → /learning-plans/10    │
└─────────────────────────────────────────────┘
```

---

## 🔧 마이그레이션 체크리스트

### 프론트엔드 작업 항목

- [ ] `GoalStatus`에 `IN_PROGRESS` 추가
- [ ] Goal 상세 페이지에 새 필드 표시 (progressPercentage, streakInfo)
- [ ] 플랜 상세 페이지에 "학습 시작하기" 버튼 추가
- [ ] `/start` API 호출 및 결과 처리
- [ ] 스트릭 UI 컴포넌트 구현
- [ ] 주간/월간 리포트 컴포넌트 구현
- [ ] Goal 목록 필터에 `IN_PROGRESS` 추가

---

## ❓ FAQ

**Q: 이미 존재하는 Goal에 플랜을 연결할 수 있나요?**  
A: 아니요, `/start` API는 항상 새 Goal을 생성합니다. 기존 Goal은 영향받지 않습니다.

**Q: 플랜 없이 Goal만 생성할 수 있나요?**  
A: 네, 기존 `POST /goals` API는 그대로 사용 가능합니다. 이 경우 `learningPlanId`는 null입니다.

**Q: 스트릭은 언제 업데이트되나요?**  
A: 스텝 완료(`/complete`) 호출 시 자동으로 업데이트됩니다.

**Q: Goal 삭제 시 플랜도 삭제되나요?**  
A: 아니요, Goal과 Plan은 독립적입니다. Goal 삭제해도 Plan은 유지됩니다.

---

## 📞 문의

백엔드 관련 문의: `#backend-team`  
API 스펙 상세: [API_SPECIFICATION_V5.md](./API_SPECIFICATION_V5.md)
