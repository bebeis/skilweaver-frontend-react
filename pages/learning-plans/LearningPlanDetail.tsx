import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { toast } from 'sonner';
import {
  ArrowLeft,
  GraduationCap,
  Clock,
  Target,
  Calendar,
  BookOpen,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  ExternalLink,
  PlayCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { learningPlansApi } from '../../src/lib/api/learning-plans';
import type { LearningPlan } from '../../src/lib/api/types';

// Mock data
const mockPlan = {
  id: '1',
  targetTechnology: 'Kubernetes',
  totalWeeks: 8,
  totalHours: 56,
  progress: 35,
  status: 'ACTIVE',
  createdAt: '2025-11-01',
  currentWeek: 3,
  backgroundAnalysis: {
    existingRelevantSkills: [
      { name: 'Docker', level: 'INTERMEDIATE', relevance: 'HIGH' },
      { name: 'Linux', level: 'ADVANCED', relevance: 'MEDIUM' },
      { name: 'Networking', level: 'INTERMEDIATE', relevance: 'MEDIUM' }
    ],
    knowledgeGaps: [
      '컨테이너 오케스트레이션 개념 부족',
      'YAML 문법 미숙',
      '클라우드 네이티브 아키텍처 경험 부족'
    ],
    riskFactors: [
      'Docker 경험이 있어 기본 컨테이너 개념은 이해하고 있음',
      'YAML 문법 학습이 필요하나 단기간 습득 가능',
      '실습 환경 구축에 시간이 소요될 수 있음'
    ],
    recommendations: [
      'Docker 기초를 복습하며 시작하세요',
      'Minikube로 로컬 환경을 먼저 구축하세요',
      '공식 문서를 중심으로 학습하되, 한글 튜토리얼도 활용하세요',
      '매일 조금씩 실습하는 것이 중요합니다'
    ]
  },
  steps: [
    {
      stepOrder: 1,
      title: 'Kubernetes 기초 개념',
      description: 'Kubernetes의 핵심 개념과 아키텍처 이해',
      estimatedHours: 8,
      objectives: [
        'Kubernetes가 무엇인지 설명할 수 있다',
        'Pod, Service, Deployment 개념을 이해한다',
        'Control Plane과 Worker Node 구조를 안다'
      ],
      suggestedResources: [
        { type: 'DOCUMENTATION', title: 'Kubernetes 공식 문서 - 개념', url: 'https://kubernetes.io/docs/concepts/' },
        { type: 'VIDEO', title: '쿠버네티스 입문 강의', url: '#' },
        { type: 'ARTICLE', title: 'Kubernetes 101: 초보자 가이드', url: '#' }
      ]
    },
    {
      stepOrder: 2,
      title: '로컬 환경 구축',
      description: 'Minikube를 이용한 로컬 Kubernetes 클러스터 구축',
      estimatedHours: 4,
      objectives: [
        'Minikube를 설치하고 클러스터를 시작할 수 있다',
        'kubectl 명령어로 클러스터를 관리할 수 있다',
        '간단한 Pod를 배포하고 확인할 수 있다'
      ],
      suggestedResources: [
        { type: 'DOCUMENTATION', title: 'Minikube 설치 가이드', url: 'https://minikube.sigs.k8s.io/' },
        { type: 'TUTORIAL', title: 'kubectl 기본 명령어', url: '#' }
      ]
    },
    {
      stepOrder: 3,
      title: 'Pod와 Deployment',
      description: 'Pod 생성 및 Deployment를 통한 애플리케이션 배포',
      estimatedHours: 10,
      objectives: [
        'YAML 파일로 Pod를 정의하고 생성할 수 있다',
        'Deployment를 만들어 애플리케이션을 배포할 수 있다',
        'Rolling Update를 수행할 수 있다'
      ],
      suggestedResources: [
        { type: 'DOCUMENTATION', title: 'Pod 개요', url: 'https://kubernetes.io/docs/concepts/workloads/pods/' },
        { type: 'TUTORIAL', title: 'Deployment 튜토리얼', url: '#' },
        { type: 'PROJECT', title: '간단한 웹 앱 배포 실습', url: '#' }
      ]
    },
    {
      stepOrder: 4,
      title: 'Service와 네트워킹',
      description: 'Service를 통한 Pod 간 통신 및 외부 노출',
      estimatedHours: 8,
      objectives: [
        'ClusterIP, NodePort, LoadBalancer 타입을 구분할 수 있다',
        'Service를 생성하여 Pod를 노출할 수 있다',
        'Ingress를 이해하고 설정할 수 있다'
      ],
      suggestedResources: [
        { type: 'DOCUMENTATION', title: 'Service 개요', url: '#' },
        { type: 'VIDEO', title: 'Kubernetes 네트워킹 완벽 가이드', url: '#' }
      ]
    },
    {
      stepOrder: 5,
      title: 'ConfigMap과 Secret',
      description: '설정 관리 및 민감 정보 처리',
      estimatedHours: 6,
      objectives: [
        'ConfigMap으로 설정을 관리할 수 있다',
        'Secret으로 민감 정보를 안전하게 저장할 수 있다',
        '환경 변수로 ConfigMap/Secret을 주입할 수 있다'
      ],
      suggestedResources: [
        { type: 'DOCUMENTATION', title: 'ConfigMap', url: '#' },
        { type: 'DOCUMENTATION', title: 'Secret', url: '#' }
      ]
    },
    {
      stepOrder: 6,
      title: '볼륨과 스토리지',
      description: '영구 데이터 저장 및 볼륨 관리',
      estimatedHours: 6,
      objectives: [
        'PersistentVolume과 PersistentVolumeClaim을 이해한다',
        '다양한 볼륨 타입을 활용할 수 있다',
        'StatefulSet을 이해한다'
      ],
      suggestedResources: [
        { type: 'DOCUMENTATION', title: 'Volumes', url: '#' },
        { type: 'TUTORIAL', title: 'Persistent Storage 실습', url: '#' }
      ]
    },
    {
      stepOrder: 7,
      title: '모니터링과 로깅',
      description: '클러스터 모니터링 및 로그 관리',
      estimatedHours: 6,
      objectives: [
        'kubectl logs로 로그를 확인할 수 있다',
        '기본 모니터링 도구를 설정할 수 있다',
        'Health Check를 설정할 수 있다'
      ],
      suggestedResources: [
        { type: 'DOCUMENTATION', title: 'Monitoring and Logging', url: '#' },
        { type: 'VIDEO', title: 'Prometheus & Grafana 설정', url: '#' }
      ]
    },
    {
      stepOrder: 8,
      title: '종합 프로젝트',
      description: '마이크로서비스 애플리케이션 배포 프로젝트',
      estimatedHours: 8,
      objectives: [
        '3-tier 애플리케이션을 Kubernetes에 배포할 수 있다',
        'CI/CD 파이프라인을 구성할 수 있다',
        '운영 환경을 고려한 설정을 적용할 수 있다'
      ],
      suggestedResources: [
        { type: 'PROJECT', title: '마이크로서비스 샘플 프로젝트', url: '#' },
        { type: 'ARTICLE', title: 'Kubernetes Best Practices', url: '#' }
      ]
    }
  ],
  dailySchedule: [
    { date: '2025-11-25', tasks: ['Kubernetes 아키텍처 이해', 'Pod 개념 학습'], minutesPlanned: 60, completed: true },
    { date: '2025-11-26', tasks: ['Service 개념 학습', 'ClusterIP 실습'], minutesPlanned: 60, completed: true },
    { date: '2025-11-27', tasks: ['Deployment YAML 작성', 'Rolling Update 실습'], minutesPlanned: 60, completed: false },
    { date: '2025-11-28', tasks: ['ConfigMap 실습', 'Secret 관리'], minutesPlanned: 60, completed: false },
    { date: '2025-11-29', tasks: ['볼륨 개념 학습', 'PV/PVC 실습'], minutesPlanned: 60, completed: false },
    { date: '2025-11-30', tasks: ['주말 종합 복습'], minutesPlanned: 120, completed: false },
    { date: '2025-12-01', tasks: ['다음 주 계획'], minutesPlanned: 90, completed: false }
  ]
};

const resourceTypeColors = {
  DOCUMENTATION: 'bg-blue-50 text-blue-700 border-blue-200',
  VIDEO: 'bg-red-50 text-red-700 border-red-200',
  TUTORIAL: 'bg-green-50 text-green-700 border-green-200',
  ARTICLE: 'bg-purple-50 text-purple-700 border-purple-200',
  PROJECT: 'bg-orange-50 text-orange-700 border-orange-200'
};

export function LearningPlanDetail() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [plan, setPlan] = useState<LearningPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchPlan = async () => {
      if (!user || !planId) {
        setError('사용자 정보 또는 플랜 ID가 없습니다.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await learningPlansApi.getPlan(
          user.memberId || Number(user.id),
          Number(planId)
        );

        if (response.data) {
          setPlan(response.data);
          setError(null);
        } else {
          setError('학습 플랜을 찾을 수 없습니다.');
        }
      } catch (err) {
        console.error('학습 플랜 조회 실패:', err);
        setError('학습 플랜을 불러오는 데 실패했습니다.');
        toast.error('학습 플랜을 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [user, planId]);

  const handleEdit = () => {
    navigate(`/learning-plans/${planId}/edit`);
  };

  const handleStartLearning = () => {
    toast.success('학습을 시작합니다! 📚');
    // Here you would typically update the plan status or navigate to a learning session
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-muted-foreground">학습 플랜을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertTriangle className="size-8 text-destructive" />
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              {error || '학습 플랜을 불러올 수 없습니다'}
            </h2>
            <Button
              variant="outline"
              onClick={() => navigate('/learning-plans')}
            >
              <ArrowLeft className="size-4 mr-2" />
              목록으로 돌아가기
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => navigate('/learning-plans')}>
        <ArrowLeft className="size-4 mr-2" />
        학습 플랜 목록으로
      </Button>

      {/* Header */}
      <Card className="glass-card border-tech">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="bg-primary/20 rounded-lg p-3 border border-primary/30">
                <GraduationCap className="size-8 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-foreground">{plan.targetTechnology} 학습 플랜</h1>
                  <Badge className="bg-success/20 text-success border border-success/30">
                    {plan.status}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-4 text-muted-foreground font-medium">
                  <div className="flex items-center gap-2">
                    <Clock className="size-4" />
                    <span>{plan.targetCompletionWeeks || 8}주 · {Math.round((plan.targetCompletionWeeks || 8) * 7 * (plan.dailyMinutes || 60) / 60)}시간</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4" />
                    <span>시작: {plan.createdAt?.split('T')[0] || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="size-4" />
                    <span>{Math.ceil((new Date(plan.createdAt || today).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24 * 7)) + 1}/{plan.targetCompletionWeeks || 8}주차</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="relative z-10" onClick={handleEdit}>수정</Button>
              <Button className="relative z-10" onClick={handleStartLearning}>
                <PlayCircle className="size-4 mr-2" />
                학습 시작
              </Button>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-semibold">전체 진행률</span>
              <span className="text-foreground font-bold">{plan.progress || 0}%</span>
            </div>
            <Progress value={plan.progress || 0} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="steps">학습 단계</TabsTrigger>
          <TabsTrigger value="schedule">일일 일정</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Background Analysis */}
          <Card className="glass-card border-tech">
            <CardHeader>
              <CardTitle className="text-foreground">배경 분석</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Existing Skills */}
              <div>
                <h3 className="text-foreground font-bold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="size-5 text-success" />
                  관련 보유 기술
                </h3>
                <div className="space-y-2">
                  {plan.backgroundAnalysis && typeof plan.backgroundAnalysis === 'object' && (plan.backgroundAnalysis as any).existingRelevantSkills && (plan.backgroundAnalysis as any).existingRelevantSkills.length > 0 ? (
                    (plan.backgroundAnalysis as any).existingRelevantSkills.map((skill: any, index: number) => (
                      <div key={`skill-${index}`} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg border border-border">
                        <div>
                          {typeof skill === 'string' ? (
                            <span className="text-foreground font-semibold">{skill}</span>
                          ) : (
                            <>
                              <span className="text-foreground font-semibold">{skill.name}</span>
                              <span className="text-muted-foreground ml-2">({skill.level})</span>
                            </>
                          )}
                        </div>
                        {skill.relevance && (
                          <Badge variant={
                            skill.relevance === 'HIGH' ? 'default' : 'secondary'
                          }>
                            {skill.relevance} 연관성
                          </Badge>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">관련 기술 정보 없음</p>
                  )}
                </div>
              </div>

              {/* Knowledge Gaps */}
              <div>
                <h3 className="text-foreground font-bold mb-3 flex items-center gap-2">
                  <AlertTriangle className="size-5 text-warning" />
                  지식 격차
                </h3>
                <ul className="space-y-2">
                  {plan.backgroundAnalysis && typeof plan.backgroundAnalysis === 'object' && (plan.backgroundAnalysis as any).knowledgeGaps && (plan.backgroundAnalysis as any).knowledgeGaps.length > 0 ? (
                    (plan.backgroundAnalysis as any).knowledgeGaps.map((gap: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-muted-foreground font-medium">
                        <div className="size-2 bg-warning rounded-full mt-2" />
                        {gap}
                      </li>
                    ))
                  ) : (
                    <p className="text-muted-foreground">지식 격차 정보 없음</p>
                  )}
                </ul>
              </div>

              {/* Risk Factors */}
              <div>
                <h3 className="text-foreground font-bold mb-3 flex items-center gap-2">
                  <Target className="size-5 text-accent" />
                  고려사항
                </h3>
                <ul className="space-y-2">
                  {plan.backgroundAnalysis && typeof plan.backgroundAnalysis === 'object' && (plan.backgroundAnalysis as any).riskFactors && (plan.backgroundAnalysis as any).riskFactors.length > 0 ? (
                    (plan.backgroundAnalysis as any).riskFactors.map((risk: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-muted-foreground font-medium">
                        <div className="size-2 bg-accent rounded-full mt-2" />
                        {risk}
                      </li>
                    ))
                  ) : (
                    <p className="text-muted-foreground">고려사항 정보 없음</p>
                  )}
                </ul>
              </div>

              {/* Recommendations */}
              <div>
                <h3 className="text-foreground font-bold mb-3 flex items-center gap-2">
                  <Lightbulb className="size-5 text-primary" />
                  추천 학습 방법
                </h3>
                <ul className="space-y-2">
                  {plan.backgroundAnalysis && typeof plan.backgroundAnalysis === 'object' && (plan.backgroundAnalysis as any).recommendations && (plan.backgroundAnalysis as any).recommendations.length > 0 ? (
                    (plan.backgroundAnalysis as any).recommendations.map((rec: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-muted-foreground font-medium">
                        <div className="size-2 bg-primary rounded-full mt-2" />
                        {rec}
                      </li>
                    ))
                  ) : (
                    <p className="text-muted-foreground">추천 정보 없음</p>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Steps Tab */}
        <TabsContent value="steps" className="space-y-4">
          {plan.steps && plan.steps.length > 0 ? plan.steps.map((step: any, stepIndex: number) => (
            <Card key={`step-${stepIndex}-${step.stepOrder}`} className="glass-card border-tech">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className="bg-primary/20 text-primary border border-primary/30">Step {step.stepOrder}</Badge>
                      <CardTitle className="text-foreground">{step.title}</CardTitle>
                    </div>
                    <p className="text-muted-foreground font-medium">{step.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-muted-foreground font-medium">
                      <Clock className="size-4" />
                      <span>{step.estimatedHours}시간</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Objectives */}
                <div>
                  <h4 className="text-foreground font-bold mb-2">학습 목표</h4>
                  <ul className="space-y-1">
                    {step.objectives?.map((obj, objIndex) => (
                      <li key={`obj-${stepIndex}-${objIndex}`} className="flex items-start gap-2 text-muted-foreground font-medium">
                        <CheckCircle2 className="size-4 text-success mt-1" />
                        {obj}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Resources */}
                <div>
                  <h4 className="text-foreground font-bold mb-2">추천 학습 자료</h4>
                  <div className="space-y-2">
                    {step.suggestedResources?.map((resource, resIndex) => (
                      <a
                        key={`res-${stepIndex}-${resIndex}`} 
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg hover:bg-primary/10 transition-all border border-border hover:border-primary/50"
                      >
                        <div className="flex items-center gap-3">
                          <BookOpen className="size-4 text-primary" />
                          <span className="text-foreground font-medium">{resource.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className={resourceTypeColors[resource.type as keyof typeof resourceTypeColors]}
                          >
                            {resource.type}
                          </Badge>
                          <ExternalLink className="size-4 text-muted-foreground" />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )) : (
            <Card className="glass-card border-tech">
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-center">학습 단계 정보가 없습니다.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-4">
          <Card className="glass-card border-tech">
            <CardHeader>
              <CardTitle className="text-foreground">이번 주 학습 일정</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {plan.dailySchedule && plan.dailySchedule.length > 0 ? plan.dailySchedule.map((day: any, dayIndex: number) => {
                  const isToday = day.date === today;
                  const isPast = new Date(day.date) < new Date(today);

                  return (
                    <div
                      key={`day-${day.date || dayIndex}`}
                      className={`p-4 rounded-lg border-2 ${
                        isToday 
                          ? 'bg-primary/10 border-primary/50' 
                          : day.completed
                          ? 'bg-success/10 border-success/30'
                          : 'bg-secondary/30 border-border'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {day.completed ? (
                            <CheckCircle2 className="size-5 text-success" />
                          ) : isToday ? (
                            <PlayCircle className="size-5 text-primary" />
                          ) : (
                            <Calendar className="size-5 text-muted-foreground" />
                          )}
                          <div>
                            <p className="text-foreground font-bold">
                              {day.date} {isToday && '(오늘)'}
                            </p>
                            <p className="text-muted-foreground font-medium">
                              {day.minutesPlanned}분 계획
                            </p>
                          </div>
                        </div>
                        {day.completed && (
                          <Badge className="bg-success/20 text-success border border-success/30">완료</Badge>
                        )}
                      </div>
                      <ul className="ml-8 space-y-1">
                        {day.tasks?.map((task, taskIndex) => (
                          <li key={`task-${dayIndex}-${taskIndex}`} className="text-muted-foreground font-medium">
                            • {task}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                }) : (
                  <p className="text-muted-foreground text-center">일정 정보가 없습니다.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
