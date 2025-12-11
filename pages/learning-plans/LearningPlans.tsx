import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { ScrollArea } from '../../components/ui/scroll-area';
import { 
  Plus, 
  GraduationCap, 
  Clock, 
  Calendar, 
  TrendingUp, 
  Sparkles, 
  Loader2,
  ChevronRight,
  Play,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { learningPlansApi } from '../../src/lib/api';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';
import { LiquidHighlight, useFluidHighlight } from '../../components/ui/fluid-highlight';
import { cn } from '../../components/ui/utils';

interface Plan {
  id: string;
  targetTechnology: string;
  totalWeeks: number;
  totalHours: number;
  progress: number;
  status: string;
  createdAt: string;
  currentWeek?: number;
}

const statusConfig: Record<string, { label: string; class: string; icon: any }> = {
  ACTIVE: { 
    label: '진행중', 
    class: 'status-active', 
    icon: Play 
  },
  COMPLETED: { 
    label: '완료', 
    class: 'status-completed', 
    icon: CheckCircle 
  },
  ABANDONED: { 
    label: '중단', 
    class: 'status-error', 
    icon: XCircle 
  }
};

export function LearningPlans() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const { 
    containerRef: listRef, 
    highlightStyle, 
    handleMouseEnter, 
    handleMouseLeave 
  } = useFluidHighlight<HTMLDivElement>();

  useEffect(() => {
    if (!user) return;
    
    const loadPlans = async () => {
      try {
        setLoading(true);
        const response = await learningPlansApi.getPlans(Number(user.id), {
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
          page: 0,
          size: 20,
        });
        
        if (response.success) {
          const mappedPlans: Plan[] = response.data.plans.map((p: any) => ({
            id: String(p.learningPlanId),
            targetTechnology: p.targetTechnology,
            totalWeeks: p.totalWeeks,
            totalHours: p.totalHours,
            progress: p.progress,
            status: p.status,
            createdAt: p.createdAt.split('T')[0],
            currentWeek: Math.floor((p.progress / 100) * p.totalWeeks),
          }));
          setPlans(mappedPlans);
        }
      } catch (error: any) {
        toast.error(error.message || '학습 플랜을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    loadPlans();
  }, [user, statusFilter]);

  // Stats
  const stats = {
    total: plans.length,
    active: plans.filter(p => p.status === 'ACTIVE').length,
    completed: plans.filter(p => p.status === 'COMPLETED').length,
    totalHours: plans.reduce((sum, p) => sum + p.totalHours, 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Main List Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">학습 플랜</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              AI 기반 맞춤형 학습 계획
            </p>
          </div>
          <Link to="/learning-plans/new">
            <Button size="sm" className="h-8 gap-1.5 btn-liquid-glass-primary shadow-glow-primary">
              <Sparkles className="size-3.5 fill-current" />
              새 플랜 생성
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card className="glass-card mb-4">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 w-[120px] text-xs">
                  <SelectValue placeholder="상태" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">전체</SelectItem>
                  <SelectItem value="ACTIVE">진행중</SelectItem>
                  <SelectItem value="COMPLETED">완료</SelectItem>
                  <SelectItem value="ABANDONED">중단</SelectItem>
                </SelectContent>
              </Select>

              {statusFilter !== 'ALL' && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => setStatusFilter('ALL')}
                >
                  초기화
                </Button>
              )}

              <div className="ml-auto text-xs text-muted-foreground">
                {plans.length}개의 플랜
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="card-compact text-center">
            <p className="text-lg font-bold text-foreground">{stats.total}</p>
            <p className="text-[10px] text-muted-foreground">전체</p>
          </div>
          <div className="card-compact text-center">
            <p className="text-lg font-bold text-green-400">{stats.active}</p>
            <p className="text-[10px] text-muted-foreground">진행중</p>
          </div>
          <div className="card-compact text-center">
            <p className="text-lg font-bold text-primary">{stats.completed}</p>
            <p className="text-[10px] text-muted-foreground">완료</p>
          </div>
          <div className="card-compact text-center">
            <p className="text-lg font-bold text-accent">{stats.totalHours}</p>
            <p className="text-[10px] text-muted-foreground">총 시간</p>
          </div>
        </div>

        {/* Plans List */}
        <ScrollArea className="flex-1 -mx-1 px-1">
          <div 
            ref={listRef}
            onMouseLeave={handleMouseLeave}
            className="space-y-1 relative"
          >
            <LiquidHighlight style={highlightStyle} />
            {plans.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <GraduationCap className="size-8 mb-2 opacity-50" />
                <p className="text-sm mb-3">학습 플랜이 없습니다</p>
                <Link to="/learning-plans/new">
                  <Button size="sm" variant="outline" className="h-8 btn-liquid-glass">
                    <Plus className="size-3.5 mr-1" />
                    첫 플랜 생성
                  </Button>
                </Link>
              </div>
            ) : (
              plans.map((plan) => {
                const statusInfo = statusConfig[plan.status] || statusConfig.ACTIVE;
                const StatusIcon = statusInfo.icon;
                
                return (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan)}
                    onMouseEnter={handleMouseEnter}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-md text-left transition-colors relative z-10",
                      selectedPlan?.id === plan.id
                        ? "bg-primary/10 border border-primary/20"
                        : "hover:text-foreground"
                    )}
                  >
                    <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                      <GraduationCap className="size-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-foreground truncate">
                          {plan.targetTechnology}
                        </span>
                        <Badge className={cn("badge-compact border", statusInfo.class)}>
                          <StatusIcon className="size-2.5 mr-0.5" />
                          {statusInfo.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{plan.totalWeeks}주</span>
                        <span>{plan.totalHours}시간</span>
                      </div>
                      {plan.status === 'ACTIVE' && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-muted-foreground">
                              {plan.currentWeek}주차
                            </span>
                            <span className="text-primary font-medium">{plan.progress}%</span>
                          </div>
                          <Progress value={plan.progress} className="h-1" />
                        </div>
                      )}
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground shrink-0" />
                  </button>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Detail Panel */}
      <div className="hidden lg:block w-80 shrink-0">
        {selectedPlan ? (
          <Card className="glass-card h-full flex flex-col">
            <CardHeader className="p-4 pb-3 border-b border-border">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{selectedPlan.targetTechnology}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedPlan.createdAt} 생성
                  </p>
                </div>
                <Badge className={cn("border", statusConfig[selectedPlan.status]?.class)}>
                  {statusConfig[selectedPlan.status]?.label}
                </Badge>
              </div>
            </CardHeader>
            <ScrollArea className="flex-1">
              <CardContent className="p-4 space-y-4">
                {/* Progress */}
                {selectedPlan.status === 'ACTIVE' && (
                  <div className="p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">진행률</span>
                      <span className="text-xl font-bold text-primary">{selectedPlan.progress}%</span>
                    </div>
                    <Progress value={selectedPlan.progress} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                      현재 {selectedPlan.currentWeek}주차 / 총 {selectedPlan.totalWeeks}주
                    </p>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-md bg-secondary/50 text-center">
                    <Calendar className="size-4 text-primary mx-auto" />
                    <p className="text-lg font-bold mt-1">{selectedPlan.totalWeeks}</p>
                    <p className="text-[10px] text-muted-foreground">주</p>
                  </div>
                  <div className="p-3 rounded-md bg-secondary/50 text-center">
                    <Clock className="size-4 text-accent mx-auto" />
                    <p className="text-lg font-bold mt-1">{selectedPlan.totalHours}</p>
                    <p className="text-[10px] text-muted-foreground">시간</p>
                  </div>
                </div>

                {/* Remaining Time */}
                {selectedPlan.status === 'ACTIVE' && (
                  <div className="p-3 rounded-md bg-primary/10">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="size-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">남은 학습 시간</p>
                        <p className="text-xs text-muted-foreground">
                          약 {Math.round((selectedPlan.totalHours * (100 - selectedPlan.progress)) / 100)}시간
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-2 pt-2">
                  <Link to={`/learning-plans/${selectedPlan.id}`}>
                    <Button size="sm" className="w-full h-8 text-xs">
                      <ChevronRight className="size-3 mr-1.5" />
                      상세 보기
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </ScrollArea>
          </Card>
        ) : (
          <Card className="glass-card h-full flex items-center justify-center">
            <div className="text-center text-muted-foreground p-4">
              <GraduationCap className="size-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">플랜을 선택하세요</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
