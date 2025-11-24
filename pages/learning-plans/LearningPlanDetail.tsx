import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
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
  PlayCircle
} from 'lucide-react';

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
  const { planId } = useParams();
  const navigate = useNavigate();

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => navigate('/learning-plans')}>
        <ArrowLeft className="size-4 mr-2" />
        학습 플랜 목록으로
      </Button>

      {/* Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 rounded-lg p-3">
                <GraduationCap className="size-8 text-blue-600" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-gray-900">{mockPlan.targetTechnology} 학습 플랜</h1>
                  <Badge className="bg-green-100 text-green-800">
                    {mockPlan.status}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-4 text-gray-600">
                  <div className="flex items-center gap-2">
                    <Clock className="size-4" />
                    <span>{mockPlan.totalWeeks}주 · {mockPlan.totalHours}시간</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4" />
                    <span>시작: {mockPlan.createdAt}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="size-4" />
                    <span>{mockPlan.currentWeek}/{mockPlan.totalWeeks}주차</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">수정</Button>
              <Button>
                <PlayCircle className="size-4 mr-2" />
                학습 시작
              </Button>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">전체 진행률</span>
              <span className="text-gray-900">{mockPlan.progress}%</span>
            </div>
            <Progress value={mockPlan.progress} className="h-2" />
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
          <Card>
            <CardHeader>
              <CardTitle>배경 분석</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Existing Skills */}
              <div>
                <h3 className="text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="size-5 text-green-600" />
                  관련 보유 기술
                </h3>
                <div className="space-y-2">
                  {mockPlan.backgroundAnalysis.existingRelevantSkills.map((skill, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="text-gray-900">{skill.name}</span>
                        <span className="text-gray-600 ml-2">({skill.level})</span>
                      </div>
                      <Badge variant={
                        skill.relevance === 'HIGH' ? 'default' : 'secondary'
                      }>
                        {skill.relevance} 연관성
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Knowledge Gaps */}
              <div>
                <h3 className="text-gray-900 mb-3 flex items-center gap-2">
                  <AlertTriangle className="size-5 text-yellow-600" />
                  지식 격차
                </h3>
                <ul className="space-y-2">
                  {mockPlan.backgroundAnalysis.knowledgeGaps.map((gap, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-700">
                      <div className="size-2 bg-yellow-600 rounded-full mt-2" />
                      {gap}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Risk Factors */}
              <div>
                <h3 className="text-gray-900 mb-3 flex items-center gap-2">
                  <Target className="size-5 text-orange-600" />
                  고려사항
                </h3>
                <ul className="space-y-2">
                  {mockPlan.backgroundAnalysis.riskFactors.map((risk, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-700">
                      <div className="size-2 bg-orange-600 rounded-full mt-2" />
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommendations */}
              <div>
                <h3 className="text-gray-900 mb-3 flex items-center gap-2">
                  <Lightbulb className="size-5 text-blue-600" />
                  추천 학습 방법
                </h3>
                <ul className="space-y-2">
                  {mockPlan.backgroundAnalysis.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-700">
                      <div className="size-2 bg-blue-600 rounded-full mt-2" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Steps Tab */}
        <TabsContent value="steps" className="space-y-4">
          {mockPlan.steps.map((step) => (
            <Card key={step.stepOrder}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Badge>Step {step.stepOrder}</Badge>
                      <CardTitle>{step.title}</CardTitle>
                    </div>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="size-4" />
                      <span>{step.estimatedHours}시간</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Objectives */}
                <div>
                  <h4 className="text-gray-900 mb-2">학습 목표</h4>
                  <ul className="space-y-1">
                    {step.objectives.map((obj, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-700">
                        <CheckCircle2 className="size-4 text-green-600 mt-1" />
                        {obj}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Resources */}
                <div>
                  <h4 className="text-gray-900 mb-2">추천 학습 자료</h4>
                  <div className="space-y-2">
                    {step.suggestedResources.map((resource, index) => (
                      <a 
                        key={index} 
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <BookOpen className="size-4 text-gray-600" />
                          <span className="text-gray-900">{resource.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className={resourceTypeColors[resource.type as keyof typeof resourceTypeColors]}
                          >
                            {resource.type}
                          </Badge>
                          <ExternalLink className="size-4 text-gray-400" />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>이번 주 학습 일정</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockPlan.dailySchedule.map((day, index) => {
                  const isToday = day.date === today;
                  const isPast = new Date(day.date) < new Date(today);
                  
                  return (
                    <div 
                      key={index}
                      className={`p-4 rounded-lg border-2 ${
                        isToday 
                          ? 'bg-blue-50 border-blue-300' 
                          : day.completed
                          ? 'bg-green-50 border-green-200'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {day.completed ? (
                            <CheckCircle2 className="size-5 text-green-600" />
                          ) : isToday ? (
                            <PlayCircle className="size-5 text-blue-600" />
                          ) : (
                            <Calendar className="size-5 text-gray-400" />
                          )}
                          <div>
                            <p className="text-gray-900">
                              {day.date} {isToday && '(오늘)'}
                            </p>
                            <p className="text-gray-600">
                              {day.minutesPlanned}분 계획
                            </p>
                          </div>
                        </div>
                        {day.completed && (
                          <Badge className="bg-green-100 text-green-800">완료</Badge>
                        )}
                      </div>
                      <ul className="ml-8 space-y-1">
                        {day.tasks.map((task, taskIndex) => (
                          <li key={taskIndex} className="text-gray-700">
                            • {task}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
