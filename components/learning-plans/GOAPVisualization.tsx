import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  Brain, 
  Target, 
  Route, 
  CheckCircle2, 
  Loader2,
  ArrowRight,
  Zap
} from 'lucide-react';

interface GOAPVisualizationProps {
  targetTech: string;
  onPhaseUpdate?: (phase: string, status: 'pending' | 'running' | 'completed') => void;
}

interface GOAPPhase {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed';
  description: string;
  actions?: string[];
}

export function GOAPVisualization({ targetTech }: GOAPVisualizationProps) {
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [phases, setPhases] = useState<GOAPPhase[]>([
    {
      id: '1',
      name: '목표 설정',
      status: 'pending',
      description: `${targetTech} 학습을 위한 목표 상태 정의`,
      actions: [
        '목표 기술 분석',
        '필요한 역량 식별',
        '학습 완료 조건 설정'
      ]
    },
    {
      id: '2',
      name: '현재 상태 분석',
      status: 'pending',
      description: '사용자의 현재 기술 스택 및 경험 분석',
      actions: [
        '보유 기술 스택 확인',
        '관련 경험 평가',
        '지식 격차 파악'
      ]
    },
    {
      id: '3',
      name: '선행 조건 확인',
      status: 'pending',
      description: '학습에 필요한 선행 기술 확인',
      actions: [
        '필수 선행 기술 확인',
        '권장 선행 지식 평가',
        '부족한 부분 식별'
      ]
    },
    {
      id: '4',
      name: '경로 탐색 (A* 알고리즘)',
      status: 'pending',
      description: '최적의 학습 경로 계산',
      actions: [
        '가능한 학습 경로 생성',
        '각 경로의 비용 계산',
        '최적 경로 선택'
      ]
    },
    {
      id: '5',
      name: '액션 플랜 생성',
      status: 'pending',
      description: '구체적인 학습 단계 및 자료 선정',
      actions: [
        '주차별 학습 목표 설정',
        '학습 자료 선정',
        '실습 프로젝트 계획'
      ]
    },
    {
      id: '6',
      name: '일정 최적화',
      status: 'pending',
      description: '사용자 선호도에 맞춘 일정 조정',
      actions: [
        '일일 학습 시간 배분',
        '주말 학습 조정',
        '진도 체크포인트 설정'
      ]
    },
    {
      id: '7',
      name: '플랜 완성',
      status: 'pending',
      description: '최종 학습 플랜 생성 완료',
      actions: [
        '플랜 검증',
        '리소스 링크 추가',
        '플랜 저장'
      ]
    }
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setPhases(prev => {
        const newPhases = [...prev];
        
        // Mark current phase as completed if it's running
        if (currentPhaseIndex > 0 && newPhases[currentPhaseIndex - 1].status === 'running') {
          newPhases[currentPhaseIndex - 1].status = 'completed';
        }
        
        // Set current phase to running
        if (currentPhaseIndex < newPhases.length) {
          newPhases[currentPhaseIndex].status = 'running';
        }
        
        return newPhases;
      });

      if (currentPhaseIndex < phases.length - 1) {
        setTimeout(() => {
          setCurrentPhaseIndex(prev => prev + 1);
        }, 1500);
      } else {
        // Mark last phase as completed
        setTimeout(() => {
          setPhases(prev => {
            const newPhases = [...prev];
            newPhases[newPhases.length - 1].status = 'completed';
            return newPhases;
          });
        }, 1500);
      }
    }, 2000);

    return () => clearInterval(timer);
  }, [currentPhaseIndex, phases.length]);

  const completedCount = phases.filter(p => p.status === 'completed').length;
  const progressPercentage = Math.round((completedCount / phases.length) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="bg-blue-600 rounded-full p-3">
              <Brain className="size-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-gray-900 mb-2">AI 학습 플랜 생성 중...</h2>
              <p className="text-gray-700 mb-4">
                GOAP (Goal-Oriented Action Planning) 알고리즘으로 {targetTech} 학습 경로를 계산하고 있습니다
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">전체 진행률</span>
                  <span className="text-gray-900">{progressPercentage}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* GOAP Phases */}
      <div className="space-y-3">
        {phases.map((phase, index) => (
          <Card 
            key={phase.id} 
            className={`transition-all ${
              phase.status === 'running' 
                ? 'border-blue-500 shadow-lg scale-[1.02]' 
                : phase.status === 'completed'
                ? 'border-green-300 bg-green-50'
                : 'opacity-60'
            }`}
          >
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                {/* Status Icon */}
                <div className={`rounded-full p-2 ${
                  phase.status === 'completed' 
                    ? 'bg-green-100' 
                    : phase.status === 'running'
                    ? 'bg-blue-100'
                    : 'bg-gray-100'
                }`}>
                  {phase.status === 'completed' ? (
                    <CheckCircle2 className="size-6 text-green-600" />
                  ) : phase.status === 'running' ? (
                    <Loader2 className="size-6 text-blue-600 animate-spin" />
                  ) : (
                    <Target className="size-6 text-gray-400" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant={
                      phase.status === 'completed' 
                        ? 'default' 
                        : phase.status === 'running'
                        ? 'secondary'
                        : 'outline'
                    }>
                      Phase {index + 1}
                    </Badge>
                    <h3 className="text-gray-900">{phase.name}</h3>
                    {phase.status === 'running' && (
                      <Badge className="bg-blue-100 text-blue-800">
                        <Zap className="size-3 mr-1" />
                        실행중
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-3">{phase.description}</p>
                  
                  {/* Actions */}
                  {phase.actions && phase.status !== 'pending' && (
                    <div className="space-y-2">
                      {phase.actions.map((action, actionIndex) => (
                        <div 
                          key={actionIndex} 
                          className={`flex items-center gap-2 text-gray-700 ${
                            phase.status === 'running' 
                              ? 'animate-pulse' 
                              : ''
                          }`}
                        >
                          <ArrowRight className="size-4 text-blue-600" />
                          <span>{action}</span>
                          {phase.status === 'completed' && (
                            <CheckCircle2 className="size-4 text-green-600 ml-auto" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info */}
      <Card className="bg-gray-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Route className="size-5 text-gray-600 mt-0.5" />
            <div>
              <h3 className="text-gray-900 mb-2">GOAP 알고리즘이란?</h3>
              <p className="text-gray-600">
                Goal-Oriented Action Planning은 AI가 목표를 달성하기 위한 최적의 행동 순서를 
                계획하는 알고리즘입니다. 현재 상태에서 목표 상태까지 도달하는 가장 효율적인 
                경로를 A* 탐색 알고리즘을 통해 찾아냅니다.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
