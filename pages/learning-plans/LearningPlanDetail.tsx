import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
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
  Loader2,
  MessageSquare,
  Timer,
  Pause,
  Play,
  RotateCcw,
  Zap,
  Check,
  ChevronRight,
  MoreHorizontal,
  Edit,
  CheckCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../../components/ui/dropdown-menu';
import { useAuth } from '../../hooks/useAuth';
import { learningPlansApi } from '../../src/lib/api/learning-plans';
import { FeedbackModal, FeedbackSummaryCard, FeedbackList } from '../../components/feedback';
import type { LearningPlan } from '../../src/lib/api/types';
import { cn } from '../../components/ui/utils';

// Focus Timer Component
function FocusTimer({ open, onOpenChange, currentTask }: { open: boolean; onOpenChange: (open: boolean) => void; currentTask?: string }) {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'FOCUS' | 'BREAK'>('FOCUS'); // FOCUS | SHORT_BREAK | LONG_BREAK

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      toast.success(mode === 'FOCUS' ? '집중 시간 종료! 휴식하세요.' : '휴식 종료! 다시 집중해볼까요?');
      if (mode === 'FOCUS') setMode('BREAK');
      else setMode('FOCUS');
      setTimeLeft(mode === 'FOCUS' ? 5 * 60 : 25 * 60);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'FOCUS' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <DialogTitle className="text-center flex items-center justify-center gap-2">
            <Zap className="size-5 text-yellow-500 fill-yellow-500" />
            {mode === 'FOCUS' ? '집중 모드' : '휴식 시간'}
          </DialogTitle>
        </DialogHeader>
        <div className="py-8">
          <div className="text-6xl font-bold tracking-tighter tabular-nums mb-6 text-primary">
            {formatTime(timeLeft)}
          </div>
          {currentTask && (
            <div className="mb-6 p-3 bg-secondary/50 rounded-lg text-sm text-muted-foreground">
              현재 작업: <span className="text-foreground font-medium">{currentTask}</span>
            </div>
          )}
          <div className="flex justify-center gap-4">
            <Button size="lg" className="w-32" onClick={toggleTimer}>
              {isActive ? <Pause className="mr-2 size-5" /> : <Play className="mr-2 size-5" />}
              {isActive ? '일시정지' : '시작'}
            </Button>
            <Button size="lg" variant="outline" onClick={resetTimer}>
              <RotateCcw className="size-5" />
            </Button>
          </div>
        </div>
        <DialogFooter className="justify-center sm:justify-center">
          <div className="flex gap-2 text-xs text-muted-foreground">
            <button 
              onClick={() => { setMode('FOCUS'); setTimeLeft(25 * 60); setIsActive(false); }}
              className={cn("px-3 py-1 rounded-full", mode === 'FOCUS' ? "bg-primary/20 text-primary" : "hover:bg-secondary")}
            >
              집중 (25분)
            </button>
            <button 
              onClick={() => { setMode('BREAK'); setTimeLeft(5 * 60); setIsActive(false); }}
              className={cn("px-3 py-1 rounded-full", mode === 'BREAK' ? "bg-primary/20 text-primary" : "hover:bg-secondary")}
            >
              휴식 (5분)
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function LearningPlanDetail() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [plan, setPlan] = useState<LearningPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [focusTimerOpen, setFocusTimerOpen] = useState(false);
  const [currentStepId, setCurrentStepId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('curriculum');
  const [completingStep, setCompletingStep] = useState<number | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<number[]>([]);

  const toggleStep = (stepId: number) => {
    setExpandedSteps(prev => 
      prev.includes(stepId) 
        ? prev.filter(id => id !== stepId) 
        : [...prev, stepId]
    );
  };

  const fetchPlan = async () => {
    if (!user || !planId) {
      setError('정보가 부족합니다.');
      setLoading(false);
      return;
    }

    try {
      // Don't set loading to true on refresh to avoid flickering
      if (!plan) setLoading(true);
      
      const response = await learningPlansApi.getPlan(
        user.memberId || Number(user.id),
        Number(planId)
      );

      if (response.data) {
        setPlan(response.data);
        // Only set currentStepId if it's not already set or if the current one became completed
        if (!currentStepId) {
          const firstIncomplete = response.data.steps?.find(s => !s.completed);
          if (firstIncomplete) setCurrentStepId(firstIncomplete.stepId);
        } else {
          // If current step is completed, move to next
          const currentStep = response.data.steps?.find(s => s.stepId === currentStepId);
          if (currentStep?.completed) {
            const nextStep = response.data.steps?.find(s => s.order > currentStep.order && !s.completed);
            if (nextStep) setCurrentStepId(nextStep.stepId);
          }
        }
      } else {
        setError('학습 플랜을 찾을 수 없습니다.');
      }
    } catch (err) {
      setError('학습 플랜 로드 실패');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, [user, planId]);

  const handleCompleteStep = async (stepOrder: number) => {
    if (!user || !planId) return;
    
    try {
      setCompletingStep(stepOrder);
      await learningPlansApi.completeStep(
        user.memberId || Number(user.id),
        Number(planId),
        stepOrder
      );
      toast.success('스텝을 완료했습니다! 🎉');
      await fetchPlan(); // Refresh plan to update progress and next step
    } catch (error) {
      toast.error('완료 처리에 실패했습니다.');
    } finally {
      setCompletingStep(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertTriangle className="size-10 text-destructive" />
        <p className="text-muted-foreground">{error || '플랜을 찾을 수 없습니다'}</p>
        <Button onClick={() => navigate('/learning-plans')}>돌아가기</Button>
      </div>
    );
  }

  const currentStep = plan.steps?.find(s => s.stepId === currentStepId) || plan.steps?.[0];

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header - Compact */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground" onClick={() => navigate('/learning-plans')}>
              <ArrowLeft className="size-4 mr-1" />
              목록
            </Button>
            <div className="h-4 w-px bg-border/50 mx-1" />
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded bg-primary/10">
                <GraduationCap className="size-4 text-primary" />
              </div>
              <h1 className="text-lg font-bold text-foreground">{plan.targetTechnology} 마스터</h1>
              <Badge variant={plan.status === 'ACTIVE' ? 'default' : 'secondary'} className="badge-compact">
                {plan.status}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              className="h-8 shadow-glow-primary gap-1.5"
              onClick={() => setFocusTimerOpen(true)}
            >
              <Zap className="size-3.5 fill-current" />
              집중 모드
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFeedbackModalOpen(true)}>
                  <MessageSquare className="size-4 mr-2" />
                  피드백
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate(`/learning-plans/${planId}/edit`)}>
                  <Edit className="size-4 mr-2" />
                  수정
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Progress Bar Header */}
        <Card className="glass-card mb-4 p-4 flex items-center justify-between gap-6">
          <div className="flex-1 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-foreground">진행률</span>
              <span className="font-bold text-primary">{plan.progress}%</span>
            </div>
            <Progress value={plan.progress} className="h-2" />
          </div>
          <div className="flex gap-4 text-xs text-muted-foreground shrink-0 border-l border-border/50 pl-4">
            <div className="text-center">
              <p className="font-bold text-foreground">{plan.totalWeeks}주</p>
              <p>총 기간</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-foreground">{Math.round(plan.totalHours * (1 - (plan.progress || 0) / 100))}h</p>
              <p>남은 시간</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-foreground">{plan.steps?.filter(s => s.completed).length}/{plan.steps?.length}</p>
              <p>완료 단계</p>
            </div>
          </div>
        </Card>

        {/* Current Focus Highlight */}
        {currentStep && !currentStep.completed && (
          <Card className="glass-card mb-4 border-l-4 border-l-primary animate-slide-up">
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-primary uppercase mb-1">Current Focus</p>
                <h3 className="font-bold text-lg text-foreground">{currentStep.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-1">{currentStep.description}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button size="sm" variant="outline" onClick={() => setFocusTimerOpen(true)}>
                  <Play className="size-3.5 mr-1.5" /> 시작
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => handleCompleteStep(currentStep.order)} 
                  disabled={completingStep === currentStep.order}
                >
                  {completingStep === currentStep.order ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="size-3.5 mr-1.5" />
                      완료
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="w-full justify-start h-10 p-1 bg-secondary/30 rounded-lg mb-4 shrink-0">
            <TabsTrigger value="curriculum" className="h-8 px-4 text-xs">커리큘럼</TabsTrigger>
            <TabsTrigger value="schedule" className="h-8 px-4 text-xs">일정</TabsTrigger>
            <TabsTrigger value="analysis" className="h-8 px-4 text-xs">분석</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 -mx-4 px-4">
            <TabsContent value="curriculum" className="mt-0 pb-6">
              <div className="relative border-l border-border/50 ml-4 space-y-6">
                {plan.steps?.map((step: any, index: number) => (
                  <div key={step.stepId} className="relative pl-8 group">
                    {/* Timeline Dot */}
                    <div className={cn(
                      "absolute -left-[5px] top-1.5 size-2.5 rounded-full border-2 transition-colors",
                      step.completed 
                        ? "bg-success border-success" 
                        : step.stepId === currentStepId
                        ? "bg-primary border-primary animate-pulse"
                        : "bg-background border-muted-foreground"
                    )} />
                    
                    <Card className={cn(
                      "transition-all duration-200",
                      step.completed ? "opacity-70 bg-secondary/10" : "bg-card",
                      step.stepId === currentStepId && "border-primary shadow-md"
                    )}>
                      <CardHeader className="p-4 pb-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="badge-compact">
                                Step {index + 1}
                              </Badge>
                              <h4 className="font-semibold text-sm">{step.title}</h4>
                            </div>
                            <p className="text-xs text-muted-foreground">{step.description}</p>
                          </div>
                          {step.completed ? (
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="size-5 text-success shrink-0" />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 p-0"
                                onClick={() => toggleStep(step.stepId)}
                              >
                                {expandedSteps.includes(step.stepId) ? (
                                  <ChevronUp className="size-4" />
                                ) : (
                                  <ChevronDown className="size-4" />
                                )}
                              </Button>
                            </div>
                          ) : (
                            step.stepId === currentStepId && (
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-7 text-xs"
                                onClick={() => handleCompleteStep(step.order)}
                                disabled={completingStep === step.order}
                              >
                                {completingStep === step.order ? (
                                  <Loader2 className="size-3.5 animate-spin" />
                                ) : (
                                  "완료하기"
                                )}
                              </Button>
                            )
                          )}
                        </div>
                      </CardHeader>
                      {(step.stepId === currentStepId || !step.completed || expandedSteps.includes(step.stepId)) && (
                        <CardContent className="p-4 pt-2 space-y-3">
                          {/* Objectives */}
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1.5">학습 목표</p>
                            <ul className="grid gap-1">
                              {step.objectives?.map((obj: string, i: number) => (
                                <li key={i} className="text-xs flex items-start gap-2 text-muted-foreground">
                                  <span className="mt-1.5 size-1 rounded-full bg-primary/50 shrink-0" />
                                  {obj}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          {/* Resources */}
                          {step.suggestedResources?.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground mb-1.5">추천 자료</p>
                              <div className="grid gap-1.5">
                                {step.suggestedResources.map((res: any, i: number) => (
                                  <a 
                                    key={i} 
                                    href={res.url} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="flex items-center justify-between p-2 rounded bg-secondary/30 hover:bg-secondary/50 transition-colors text-xs group"
                                  >
                                    <div className="flex items-center gap-2 overflow-hidden">
                                      {res.type === 'VIDEO' ? <PlayCircle className="size-3.5 text-red-500" /> : <BookOpen className="size-3.5 text-blue-500" />}
                                      <span className="truncate group-hover:text-primary transition-colors">{res.title}</span>
                                    </div>
                                    <ExternalLink className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      )}
                    </Card>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="schedule" className="mt-0">
              <Card className="glass-card">
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Calendar className="size-10 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">주간 일정 기능이 준비 중입니다.</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="mt-0">
              <div className="space-y-6">
                <FeedbackSummaryCard planId={Number(planId)} />
                <FeedbackList planId={Number(planId)} />
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>

      {/* Right Sidebar */}
      <div className="w-72 shrink-0 space-y-4">
        {/* AI Tips */}
        <Card className="glass-card">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Lightbulb className="size-4 text-yellow-500" />
              AI 조언
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <ul className="text-xs space-y-2 text-muted-foreground">
              {plan.backgroundAnalysis?.recommendations?.slice(0, 3).map((rec: string, i: number) => (
                <li key={i} className="flex gap-2">
                  <span className="text-primary">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card className="glass-card">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium">통계</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">총 소요 시간</span>
              <span className="font-bold">{plan.totalHours}시간</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">시작일</span>
              <span className="font-bold">{plan.createdAt ? new Date(plan.createdAt).toLocaleDateString() : '-'}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">예상 완료일</span>
              <span className="font-bold">
                {plan.createdAt 
                  ? new Date(new Date(plan.createdAt).getTime() + (plan.totalWeeks * 7 * 24 * 60 * 60 * 1000)).toLocaleDateString() 
                  : '-'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Focus Timer Modal */}
      <FocusTimer 
        open={focusTimerOpen} 
        onOpenChange={setFocusTimerOpen}
        currentTask={currentStep?.title}
      />

      {/* Feedback Modal */}
      <FeedbackModal
        open={feedbackModalOpen}
        onOpenChange={setFeedbackModalOpen}
        learningPlanId={Number(planId)}
        steps={plan.steps || []}
        onSuccess={() => toast.success('피드백이 제출되었습니다')}
      />
    </div>
  );
}
