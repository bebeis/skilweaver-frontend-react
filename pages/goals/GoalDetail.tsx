import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  ArrowLeft, 
  Target, 
  Calendar, 
  Flame, 
  Trophy, 
  BarChart3, 
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { goalsApi } from '../../src/lib/api/goals';
import { useAuth } from '../../hooks/useAuth';
import { LearningGoal, StreakInfo } from '../../src/lib/api/types';
import { cn } from '../../components/ui/utils';
import { LiquidHighlight, useFluidHighlight } from '../../components/ui/fluid-highlight';

// Streak Widget Component
function StreakWidget({ streakInfo }: { streakInfo?: StreakInfo }) {
  if (!streakInfo) return null;

  const { currentStreak, longestStreak, streakStatus, message } = streakInfo;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]';
      case 'AT_RISK': return 'text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Card className="glass-card relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Flame className={cn("size-24", getStatusColor(streakStatus))} />
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Flame className={cn("size-4", getStatusColor(streakStatus))} />
          학습 스트릭
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-2 mb-2">
          <span className="text-4xl font-bold tracking-tighter tabular-nums">
            {currentStreak}
          </span>
          <span className="text-sm text-muted-foreground mb-1.5">일 연속</span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>최장 스트릭</span>
            <span className="font-medium">{longestStreak}일</span>
          </div>
          <p className={cn(
            "text-xs font-medium py-1 px-2 rounded-md bg-secondary/50 border border-white/5",
            streakStatus === 'AT_RISK' ? "text-yellow-500 bg-yellow-500/10 border-yellow-500/20" : 
            streakStatus === 'ACTIVE' ? "text-orange-500 bg-orange-500/10 border-orange-500/20" : ""
          )}>
            {message}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Report Card Component
function ReportCard({ type, goalId, memberId }: { type: 'weekly' | 'monthly', goalId: number, memberId: number }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const apiCall = type === 'weekly' ? goalsApi.getGoalWeeklyReport : goalsApi.getGoalMonthlyReport;
        const res = await apiCall(memberId, goalId);
        if (res.success) setData(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [goalId, memberId, type]);

  if (loading) return <div className="h-32 flex items-center justify-center text-muted-foreground text-xs">로딩중...</div>;
  if (!data) return <div className="h-32 flex items-center justify-center text-muted-foreground text-xs">데이터가 없습니다</div>;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card-compact p-3">
          <div className="text-muted-foreground text-xs mb-1">완료 스텝</div>
          <div className="text-xl font-bold flex items-center gap-1">
            <CheckCircle2 className="size-4 text-primary" />
            {data.completedSteps}
          </div>
        </div>
        <div className="card-compact p-3">
          <div className="text-muted-foreground text-xs mb-1">학습 시간</div>
          <div className="text-xl font-bold flex items-center gap-1">
            <Clock className="size-4 text-blue-400" />
            {data.totalLearningHours}h
          </div>
        </div>
        <div className="card-compact p-3">
          <div className="text-muted-foreground text-xs mb-1">학습일</div>
          <div className="text-xl font-bold flex items-center gap-1">
            <Calendar className="size-4 text-green-400" />
            {data.learningDays}일
          </div>
        </div>
        <div className="card-compact p-3">
          <div className="text-muted-foreground text-xs mb-1">진행률 변화</div>
          <div className="text-xl font-bold flex items-center gap-1">
            <TrendingUp className="size-4 text-primary" />
            +{data.progressChange}%
          </div>
        </div>
      </div>

      {data.milestones && data.milestones.length > 0 && (
        <Card className="bg-card/30 border-white/5">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">달성 마일스톤</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-2">
            {data.milestones.map((m: any, i: number) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <div className={cn(
                  "size-4 rounded-full flex items-center justify-center border",
                  m.achieved ? "bg-primary/20 border-primary text-primary" : "bg-muted border-border text-muted-foreground"
                )}>
                  <CheckCircle2 className="size-2.5" />
                </div>
                <span className={m.achieved ? "text-foreground font-medium" : "text-muted-foreground"}>
                  {m.milestone}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function GoalDetail() {
  const { goalId } = useParams<{ goalId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [goal, setGoal] = useState<LearningGoal | null>(null);
  const [loading, setLoading] = useState(true);

  // Stats for Liquid Highlight in Reports area
  const { 
    containerRef, 
    highlightStyle, 
    handleMouseEnter, 
    handleMouseLeave 
  } = useFluidHighlight<HTMLDivElement>();

  useEffect(() => {
    if (!user || !goalId) return;
    const fetchGoal = async () => {
      try {
        setLoading(true);
        // Using getGoals for now as getGoal might need backend update, but we added getGoal to api wrapper
        // Let's try the new getGoal
        const res = await goalsApi.getGoal(Number(user.id), Number(goalId));
        if (res.success) {
          setGoal(res.data);
        }
      } catch (error) {
        console.error(error);
        toast.error('목표 정보를 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchGoal();
  }, [user, goalId]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[500px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-muted-foreground text-sm">목표 정보를 불러오는 중...</p>
      </div>
    </div>
  );

  if (!goal) return (
    <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
      <AlertTriangle className="size-10 text-destructive" />
      <p className="text-muted-foreground">목표를 찾을 수 없습니다.</p>
      <Button onClick={() => navigate('/goals')}>목록으로 돌아가기</Button>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" className="shrink-0" onClick={() => navigate('/goals')}>
          <ArrowLeft className="size-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-foreground truncate">{goal.title}</h1>
            <Badge variant="outline" className={cn(
              "px-2 py-0.5 text-xs font-medium border",
              goal.status === 'IN_PROGRESS' ? 'bg-primary/10 text-primary border-primary/20' : 
              goal.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500 border-green-500/20' : ''
            )}>
              {goal.status === 'IN_PROGRESS' ? '학습 중' : goal.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">{goal.description}</p>
          
          {goal.learningPlanId && (
            <Link to={`/learning-plans/${goal.learningPlanId}`} className="inline-flex items-center gap-1 mt-2 text-xs text-primary hover:underline">
              <Zap className="size-3" />
              연결된 학습 플랜 보러가기
            </Link>
          )}
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Progress (Merged with steps info) */}
        <Card className="glass-card md:col-span-2 flex flex-col justify-center p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
          <div className="relative z-10 space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm text-muted-foreground mb-1">전체 진행률</p>
                <div className="text-5xl font-bold tracking-tighter text-primary">
                  {goal.progressPercentage || 0}%
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">완료 스텝</p>
                <div className="text-2xl font-semibold text-foreground">
                  {goal.completedSteps || 0} / {goal.totalSteps || 0}
                </div>
              </div>
            </div>
            
            <Progress value={goal.progressPercentage || 0} className="h-4 w-full" />
            
            <div className="flex gap-4 pt-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/30 px-3 py-1.5 rounded-lg border border-white/5">
                <Calendar className="size-4" />
                <span>목표일: {goal.dueDate}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/30 px-3 py-1.5 rounded-lg border border-white/5">
                <Trophy className="size-4" />
                <span>우선순위: {goal.priority}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Right: Streak */}
        <div className="md:col-span-1">
          <StreakWidget streakInfo={goal.streakInfo || {
             // Mock data if not provided
             currentStreak: 0,
             longestStreak: 0,
             streakStatus: 'NEW',
             message: '학습을 시작해보세요!',
             isActiveToday: false
          }} />
        </div>
      </div>

      {/* Reports Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <BarChart3 className="size-5 text-primary" />
          학습 리포트
        </h2>
        
        <Tabs defaultValue="weekly" className="w-full">
          <TabsList className="bg-secondary/30 border border-white/5 p-1 mb-4 w-64">
            <TabsTrigger value="weekly" className="flex-1">주간 리포트</TabsTrigger>
            <TabsTrigger value="monthly" className="flex-1">월간 리포트</TabsTrigger>
          </TabsList>
          
          <div 
            ref={containerRef} 
            onMouseLeave={handleMouseLeave}
            className="relative"
          >
            <LiquidHighlight style={highlightStyle} />
            <TabsContent value="weekly" className="mt-0 relative z-10" onMouseEnter={handleMouseEnter}>
              <ReportCard type="weekly" goalId={Number(goalId)} memberId={Number(user?.id)} />
            </TabsContent>
            <TabsContent value="monthly" className="mt-0 relative z-10" onMouseEnter={handleMouseEnter}>
              <ReportCard type="monthly" goalId={Number(goalId)} memberId={Number(user?.id)} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

