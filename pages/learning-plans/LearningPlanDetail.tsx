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
import { LiquidHighlight, useFluidHighlight } from '../../components/ui/fluid-highlight';

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

// Resource List Component with independent fluid highlight state
function ResourceList({ resources }: { resources: any[] }) {
  const { 
    containerRef, 
    highlightStyle, 
    handleMouseEnter, 
    handleMouseLeave 
  } = useFluidHighlight<HTMLDivElement>();

  return (
    <div 
      className="grid sm:grid-cols-2 gap-3 relative"
      ref={containerRef}
      onMouseLeave={handleMouseLeave}
    >
      <LiquidHighlight style={highlightStyle} />
      {resources.map((res: any, i: number) => (
        <a 
          key={i} 
          href={res.url} 
          target="_blank" 
          rel="noreferrer"
          onMouseEnter={handleMouseEnter}
          className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 border border-transparent hover:border-border/50 transition-all text-sm group relative z-10"
        >
          <div className={cn(
            "size-8 rounded-lg flex items-center justify-center shrink-0",
            res.type === 'VIDEO' ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"
          )}>
            {res.type === 'VIDEO' ? <PlayCircle className="size-4" /> : <BookOpen className="size-4" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">{res.title}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              외부 링크 <ExternalLink className="size-2.5" />
            </p>
          </div>
        </a>
      ))}
    </div>
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
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-6">
      {/* Header - Compact */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground shrink-0" onClick={() => navigate('/learning-plans')}>
            <ArrowLeft className="size-4 mr-1" />
            목록
          </Button>
          <div className="h-4 w-px bg-border/50 mx-1 shrink-0" />
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="p-1.5 rounded bg-primary/10 shrink-0">
              <GraduationCap className="size-4 text-primary" />
            </div>
            <h1 className="text-lg font-bold text-foreground truncate min-w-0 flex-1" title={`${plan.targetTechnology} 마스터`}>
              {plan.targetTechnology} 마스터
            </h1>
            <Badge variant={plan.status === 'ACTIVE' ? 'default' : 'secondary'} className="badge-compact shrink-0">
              {plan.status}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <Button 
            size="sm" 
            className="h-8 shadow-glow-primary gap-1.5 btn-liquid-glass-primary"
            onClick={async () => {
              if (!user || !planId) return;
              try {
                 // Simple start with defaults for now, or could open a dialog
                 const res = await learningPlansApi.startPlan(user.memberId || Number(user.id), Number(planId), {
                   priority: 'HIGH'
                 });
                 if (res.success) {
                   toast.success('학습이 시작되었습니다! 목표 페이지로 이동합니다.');
                   navigate(`/goals/${res.data.learningGoalId}`);
                 }
              } catch (e: any) {
                // 이미 시작된 경우 처리
                if (e.message?.includes('이미 시작된') || e.code === 'ALREADY_STARTED') {
                  toast.info('이미 진행 중인 학습입니다. 목표 페이지로 이동합니다.');
                  // 목표 ID를 알 수 없으므로 목록으로 이동하거나, API에서 Goal ID를 반환해주면 베스트
                  // 현재는 일단 목표 목록으로 이동
                  navigate('/goals');
                } else {
                  toast.error(e.message || '학습 시작 실패');
                }
              }
            }}
          >
            <Target className="size-3.5 fill-current" />
            <span className="hidden sm:inline">학습 시작하기</span>
            <span className="sm:hidden">시작</span>
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            className="h-8 gap-1.5"
            onClick={() => setFocusTimerOpen(true)}
          >
            <Zap className="size-3.5 fill-current" />
            <span className="hidden sm:inline">집중 모드</span>
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

      <ScrollArea className="flex-1 -mx-4 px-4">
        <div className="space-y-6 pb-10">
          {/* Top Info Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Progress & Stats */}
            <Card className="glass-card lg:col-span-2 p-5 flex flex-col justify-between gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Target className="size-32" />
              </div>
              
              <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">전체 진행률</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold tracking-tighter text-primary">{plan.progress}%</span>
                      <span className="text-sm text-muted-foreground">완료</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex gap-6 text-sm">
                      <div className="text-center">
                        <p className="font-bold text-foreground text-lg">{plan.totalWeeks}주</p>
                        <p className="text-xs text-muted-foreground">총 기간</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-foreground text-lg">{Math.round(plan.totalHours * (1 - (plan.progress || 0) / 100))}h</p>
                        <p className="text-xs text-muted-foreground">남은 시간</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-foreground text-lg">{plan.steps?.filter(s => s.completed).length}/{plan.steps?.length}</p>
                        <p className="text-xs text-muted-foreground">완료 단계</p>
                      </div>
                    </div>
                  </div>
                </div>
                <Progress value={plan.progress} className="h-3 w-full" />
              </div>
            </Card>

            {/* Right: AI Tips & Stats Summary */}
            <Card className="glass-card p-5 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-3 text-primary">
                <Lightbulb className="size-4 fill-current" />
                <span className="font-semibold text-sm">AI 학습 조언</span>
              </div>
              <ul className="text-xs space-y-2.5 text-muted-foreground">
                {plan.backgroundAnalysis?.recommendations?.slice(0, 3).map((rec: string, i: number) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span className="line-clamp-2">{rec}</span>
                  </li>
                ))}
                {!plan.backgroundAnalysis?.recommendations?.length && (
                  <li>등록된 조언이 없습니다.</li>
                )}
              </ul>
              
              <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-muted-foreground">총 소요 시간</p>
                  <p className="font-medium text-sm">{plan.totalHours}시간</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">예상 완료일</p>
                  <p className="font-medium text-sm">
                    {plan.createdAt 
                      ? new Date(new Date(plan.createdAt).getTime() + (plan.totalWeeks * 7 * 24 * 60 * 60 * 1000)).toLocaleDateString() 
                      : '-'}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Current Focus Highlight */}
          {currentStep && !currentStep.completed && (
            <Card className="glass-card border-l-4 border-l-primary animate-slide-up bg-primary/5">
              <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs font-bold text-primary uppercase tracking-wider">Current Focus</p>
                    <div className="h-px flex-1 bg-primary/20 w-12" />
                  </div>
                  <h3 className="font-bold text-xl text-foreground mb-1">{currentStep.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">{currentStep.description}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                  <Button size="sm" variant="outline" onClick={() => setFocusTimerOpen(true)} className="bg-background/50">
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start h-12 p-1 bg-secondary/30 rounded-xl mb-6">
              <TabsTrigger value="curriculum" className="flex-1 h-10 text-sm">커리큘럼</TabsTrigger>
              <TabsTrigger value="schedule" className="flex-1 h-10 text-sm">일정</TabsTrigger>
              <TabsTrigger value="analysis" className="flex-1 h-10 text-sm">분석</TabsTrigger>
            </TabsList>

            <TabsContent value="curriculum" className="mt-0">
              <div className="relative border-l-2 border-border/50 ml-4 space-y-8 pb-4">
                {plan.steps?.map((step: any, index: number) => (
                  <div key={step.stepId} className="relative pl-8 group">
                    {/* Timeline Dot */}
                    <div className={cn(
                      "absolute -left-[9px] top-6 size-4 rounded-full border-4 transition-colors z-10 bg-background",
                      step.completed 
                        ? "border-success" 
                        : step.stepId === currentStepId
                        ? "border-primary shadow-[0_0_0_4px_rgba(var(--primary),0.2)]"
                        : "border-muted-foreground/30"
                    )} />
                    
                    <Card className={cn(
                      "transition-all duration-300 overflow-hidden",
                      step.completed ? "opacity-70 bg-card/30" : "bg-card/50 backdrop-blur-sm",
                      step.stepId === currentStepId && "border-primary/50 shadow-lg ring-1 ring-primary/20"
                    )}>
                      <CardHeader className="p-5 pb-3 bg-secondary/10 border-b border-border/50">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1.5">
                              <Badge variant="outline" className="badge-compact bg-background/50">
                                Step {index + 1}
                              </Badge>
                              {step.stepId === currentStepId && (
                                <Badge className="badge-compact bg-primary/20 text-primary hover:bg-primary/30 border-primary/20">
                                  진행 중
                                </Badge>
                              )}
                            </div>
                            <h4 className="font-bold text-lg">{step.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                          </div>
                          {step.completed ? (
                            <div className="flex items-center gap-2 shrink-0">
                              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/10 text-success text-xs font-medium border border-success/20">
                                <CheckCircle2 className="size-3.5" />
                                <span>완료됨</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
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
                                onClick={() => handleCompleteStep(step.order)}
                                disabled={completingStep === step.order}
                                className="shrink-0"
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
                        <CardContent className="p-5 space-y-6">
                          {/* Objectives */}
                          <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">학습 목표</p>
                            <ul className="grid gap-2">
                              {step.objectives?.map((obj: string, i: number) => (
                                <li key={i} className="text-sm flex items-start gap-2.5 text-foreground/90">
                                  <span className="mt-2 size-1.5 rounded-full bg-primary shrink-0" />
                                  {obj}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          {/* Resources */}
                          {step.suggestedResources?.length > 0 && (
                            <div>
                              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">추천 자료</p>
                              <ResourceList resources={step.suggestedResources} />
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
                <CardContent className="py-16 text-center text-muted-foreground">
                  <div className="size-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
                    <Calendar className="size-8 opacity-50" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-1">일정 관리 준비 중</h3>
                  <p className="text-sm">주간 학습 일정을 관리하는 기능이 곧 추가됩니다.</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="mt-0">
              <div className="space-y-6">
                <FeedbackSummaryCard planId={Number(planId)} />
                <FeedbackList planId={Number(planId)} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>

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
