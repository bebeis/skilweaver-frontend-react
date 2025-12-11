import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { 
  BookOpen, 
  Target, 
  Clock, 
  TrendingUp, 
  Plus,
  Calendar,
  Sparkles,
  ArrowRight,
  Zap,
  Loader2,
  Flame,
  Briefcase,
  Database,
  GraduationCap,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { skillsApi, goalsApi, learningPlansApi, technologiesApi } from '../src/lib/api';
import { toast } from 'sonner';
import { cn } from '../components/ui/utils';
import { LiquidHighlight, useFluidHighlight } from '../components/ui/fluid-highlight';

const levelColors: Record<string, string> = {
  BEGINNER: 'level-beginner',
  INTERMEDIATE: 'level-intermediate',
  ADVANCED: 'level-advanced',
  EXPERT: 'level-expert'
};

const priorityColors: Record<string, string> = {
  HIGH: 'bg-red-500/10 text-red-400 border-red-500/20',
  MEDIUM: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  LOW: 'bg-slate-500/10 text-slate-400 border-slate-500/20'
};

function FluidList({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  const { 
    containerRef, 
    highlightStyle, 
    handleMouseEnter, 
    handleMouseLeave 
  } = useFluidHighlight<HTMLDivElement>();

  return (
    <div 
      ref={containerRef}
      onMouseLeave={handleMouseLeave}
      className={cn("relative", className)}
    >
      <LiquidHighlight style={highlightStyle} />
      {/* Clone children to attach onMouseEnter, or assume children will use context/prop if we passed it? 
          Actually, we can't easily clone deep children. 
          Pattern: we need to wrap items.
          Since we are refactoring existing lists, let's just use the hook in the component or create small wrapper components for each list section.
          Or, better, provide a wrapper that clones direct children to add onMouseEnter.
      */}
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            onMouseEnter: (e: React.MouseEvent) => {
              handleMouseEnter(e);
              child.props.onMouseEnter?.(e);
            },
            className: cn(child.props.className, "relative z-10")
          });
        }
        return child;
      })}
    </div>
  );
}

// But wait, React is not imported.
import React from 'react';

export function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [skills, setSkills] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [activePlan, setActivePlan] = useState<any>(null);
  const [plansCount, setPlansCount] = useState(0);
  const [trendingTechs, setTrendingTechs] = useState<any[]>([]);
  const [highDemandTechs, setHighDemandTechs] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        const [skillsResponse, goalsResponse, plansResponse, techsResponse] = await Promise.all([
          skillsApi.getSkills(Number(user.id)),
          goalsApi.getGoals(Number(user.id), { status: 'ACTIVE' }),
          learningPlansApi.getPlans(Number(user.id), { status: 'ACTIVE', page: 0, size: 1 }),
          technologiesApi.getTechnologies({ limit: 50, active: true }),
        ]);
        
        if (skillsResponse.success) {
          const skillsArray = Array.isArray(skillsResponse.data)
            ? skillsResponse.data
            : skillsResponse.data?.skills || [];
          setSkills(skillsArray.slice(0, 6));
        }

        if (goalsResponse.success && goalsResponse.data?.goals) {
          const goalsArray = Array.isArray(goalsResponse.data.goals)
            ? goalsResponse.data.goals
            : [];
          setGoals(goalsArray.slice(0, 4));
        }
        
        if (plansResponse.success && plansResponse.data?.pagination) {
          setPlansCount(plansResponse.data.pagination.totalElements);
          if (plansResponse.data.plans && plansResponse.data.plans.length > 0) {
            const firstPlan = plansResponse.data.plans[0];
            try {
              const planDetailResponse = await learningPlansApi.getPlan(Number(user.id), firstPlan.learningPlanId);
              if (planDetailResponse.success) {
                setActivePlan({
                  id: planDetailResponse.data.learningPlanId,
                  targetTechnology: planDetailResponse.data.targetTechnology,
                  totalWeeks: planDetailResponse.data.totalWeeks,
                  totalHours: planDetailResponse.data.totalHours,
                  progress: planDetailResponse.data.progress,
                  currentWeek: Math.floor((planDetailResponse.data.progress / 100) * planDetailResponse.data.totalWeeks),
                });
              }
            } catch (error) {}
          }
        }

        if (techsResponse.success && techsResponse.data?.technologies) {
          const techs = techsResponse.data.technologies;
          
          const trending = [...techs]
            .filter((t: any) => t.communityPopularity)
            .sort((a: any, b: any) => (b.communityPopularity || 0) - (a.communityPopularity || 0))
            .slice(0, 5);
          setTrendingTechs(trending);

          const highDemand = [...techs]
            .filter((t: any) => t.jobMarketDemand)
            .sort((a: any, b: any) => (b.jobMarketDemand || 0) - (a.jobMarketDemand || 0))
            .slice(0, 5);
          setHighDemandTechs(highDemand);
        }
      } catch (error: any) {
        toast.error(error.message || '대시보드 데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="section-gap">
        {/* Compact Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">
              안녕하세요, {user?.name}님 👋
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              오늘도 성장을 향해 한 걸음 나아가세요
            </p>
          </div>
          <Link to="/learning-plans/new">
            <Button size="sm" className="h-8 gap-1.5">
              <Sparkles className="size-3.5" />
              새 플랜 생성
            </Button>
          </Link>
        </div>

        {/* Stats Grid - Compact */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link to="/skills" className="card-compact-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">기술 스택</p>
                <p className="text-2xl font-bold text-foreground mt-0.5">{skills.length}</p>
              </div>
              <div className="p-2 rounded-lg bg-primary/10">
                <BookOpen className="size-4 text-primary" />
              </div>
            </div>
          </Link>

          <Link to="/goals" className="card-compact-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">활성 목표</p>
                <p className="text-2xl font-bold text-foreground mt-0.5">{goals.length}</p>
              </div>
              <div className="p-2 rounded-lg bg-success/10">
                <Target className="size-4 text-success" />
              </div>
            </div>
          </Link>

          <Link to="/learning-plans" className="card-compact-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">학습 플랜</p>
                <p className="text-2xl font-bold text-foreground mt-0.5">{plansCount}</p>
              </div>
              <div className="p-2 rounded-lg bg-accent/10">
                <GraduationCap className="size-4 text-accent" />
              </div>
            </div>
          </Link>

          <div className="card-compact">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">목표 트랙</p>
                <p className="text-sm font-semibold text-foreground mt-1 truncate">
                  {user?.targetTrack || '-'}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-warning/10">
                <TrendingUp className="size-4 text-warning" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column - Active Plan & Goals */}
          <div className="lg:col-span-2 space-y-4">
            {/* Active Plan - Compact */}
            {activePlan ? (
              <Card className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-primary/10">
                        <Sparkles className="size-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">진행 중인 플랜</p>
                        <h3 className="font-semibold text-foreground">{activePlan.targetTechnology}</h3>
                      </div>
                    </div>
                    <Link to={`/learning-plans/${activePlan.id}`}>
                      <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                        상세 <ChevronRight className="size-3" />
                      </Button>
                    </Link>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {activePlan.currentWeek}주차 / {activePlan.totalWeeks}주
                      </span>
                      <span className="font-semibold text-primary">{activePlan.progress}%</span>
                    </div>
                    <Progress value={activePlan.progress} className="h-1.5" />
                    <p className="text-xs text-muted-foreground">
                      총 {activePlan.totalHours}시간 · 남은 시간: {Math.round((activePlan.totalHours * (100 - activePlan.progress)) / 100)}시간
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="glass-card border-dashed">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Sparkles className="size-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">학습 플랜이 없습니다</p>
                        <p className="text-xs text-muted-foreground">AI가 맞춤형 커리큘럼을 생성해드립니다</p>
                      </div>
                    </div>
                    <Link to="/learning-plans/new">
                      <Button size="sm" className="h-8">
                        <Plus className="size-3.5 mr-1" />
                        생성
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Skills & Goals Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Skills */}
              <Card className="glass-card">
                <CardHeader className="p-3 pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <BookOpen className="size-4 text-primary" />
                      내 기술
                    </CardTitle>
                    <Link to="/skills">
                      <Button variant="ghost" size="sm" className="h-6 text-xs px-2">
                        전체
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <FluidList className="space-y-1">
                    {skills.length === 0 ? (
                      <Link to="/skills/new" className="flex items-center justify-center p-4 text-sm text-muted-foreground hover:text-foreground border border-dashed border-border rounded-md transition-colors">
                        <Plus className="size-4 mr-2" />
                        기술 추가하기
                      </Link>
                    ) : (
                      skills.map((skill: any) => (
                        <Link
                          key={skill.memberSkillId}
                          to={`/technologies/${encodeURIComponent(skill.technologyName)}`}
                          className="flex items-center justify-between py-1.5 px-2 rounded hover:text-foreground transition-colors"
                        >
                          <span className="text-sm text-foreground truncate">{skill.technologyName}</span>
                          <Badge className={cn("badge-compact border", levelColors[skill.level])}>
                            {skill.level}
                          </Badge>
                        </Link>
                      ))
                    )}
                    {skills.length > 0 && (
                      <Link to="/skills/new">
                        <Button variant="ghost" size="sm" className="w-full h-7 text-xs mt-1 border border-dashed border-border">
                          <Plus className="size-3 mr-1" />
                          추가
                        </Button>
                      </Link>
                    )}
                  </FluidList>
                </CardContent>
              </Card>

              {/* Goals */}
              <Card className="glass-card">
                <CardHeader className="p-3 pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Target className="size-4 text-success" />
                      활성 목표
                    </CardTitle>
                    <Link to="/goals">
                      <Button variant="ghost" size="sm" className="h-6 text-xs px-2">
                        전체
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <FluidList className="space-y-1">
                    {goals.length === 0 ? (
                      <Link to="/goals" className="flex items-center justify-center p-4 text-sm text-muted-foreground hover:text-foreground border border-dashed border-border rounded-md transition-colors">
                        <Plus className="size-4 mr-2" />
                        목표 추가하기
                      </Link>
                    ) : (
                      goals.map((goal: any) => (
                        <div
                          key={goal.id}
                          className="flex items-center justify-between py-1.5 px-2 rounded hover:text-foreground transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground truncate">{goal.title}</p>
                            <p className="text-xs text-muted-foreground">~{goal.dueDate}</p>
                          </div>
                          <Badge className={cn("badge-compact border ml-2", priorityColors[goal.priority])}>
                            {goal.priority}
                          </Badge>
                        </div>
                      ))
                    )}
                  </FluidList>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column - Trending & Demand */}
          <div className="space-y-4">
            {/* Trending Techs */}
            {trendingTechs.length > 0 && (
              <Card className="glass-card">
                <CardHeader className="p-3 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Flame className="size-4 text-orange-500" />
                    인기 기술
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <FluidList className="space-y-1">
                    {trendingTechs.map((tech: any, index: number) => (
                      <Link
                        key={tech.name}
                        to={`/technologies/${encodeURIComponent(tech.name)}`}
                        className="flex items-center gap-2 py-1.5 px-2 rounded hover:text-foreground transition-colors"
                      >
                        <span className="text-xs font-medium text-muted-foreground w-4">{index + 1}</span>
                        <span className="text-sm text-foreground flex-1 truncate">{tech.displayName}</span>
                        <span className="text-xs text-orange-500 font-medium">{tech.communityPopularity}/10</span>
                      </Link>
                    ))}
                  </FluidList>
                  <Link to="/technologies?sort=popularity">
                    <Button variant="ghost" size="sm" className="w-full h-7 text-xs mt-2">
                      전체 보기 <ChevronRight className="size-3 ml-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* High Demand Techs */}
            {highDemandTechs.length > 0 && (
              <Card className="glass-card">
                <CardHeader className="p-3 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Briefcase className="size-4 text-blue-500" />
                    취업 수요
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <FluidList className="space-y-1">
                    {highDemandTechs.map((tech: any, index: number) => (
                      <Link
                        key={tech.name}
                        to={`/technologies/${encodeURIComponent(tech.name)}`}
                        className="flex items-center gap-2 py-1.5 px-2 rounded hover:text-foreground transition-colors"
                      >
                        <span className="text-xs font-medium text-muted-foreground w-4">{index + 1}</span>
                        <span className="text-sm text-foreground flex-1 truncate">{tech.displayName}</span>
                        <span className="text-xs text-blue-500 font-medium">{tech.jobMarketDemand}/10</span>
                      </Link>
                    ))}
                  </FluidList>
                  <Link to="/technologies?sort=demand">
                    <Button variant="ghost" size="sm" className="w-full h-7 text-xs mt-2">
                      전체 보기 <ChevronRight className="size-3 ml-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card className="glass-card">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Zap className="size-4 text-accent" />
                  빠른 작업
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <FluidList className="space-y-1.5">
                  <Link to="/learning-plans/new" className="flex items-center gap-2 p-2 rounded-md hover:text-foreground transition-colors">
                    <div className="p-1.5 rounded bg-primary/10">
                      <Sparkles className="size-3.5 text-primary" />
                    </div>
                    <span className="text-sm">새 학습 플랜</span>
                    <ChevronRight className="size-3 text-muted-foreground ml-auto" />
                  </Link>
                  <Link to="/technologies" className="flex items-center gap-2 p-2 rounded-md hover:text-foreground transition-colors">
                    <div className="p-1.5 rounded bg-secondary">
                      <Database className="size-3.5 text-muted-foreground" />
                    </div>
                    <span className="text-sm">기술 둘러보기</span>
                    <ChevronRight className="size-3 text-muted-foreground ml-auto" />
                  </Link>
                  <Link to="/explore" className="flex items-center gap-2 p-2 rounded-md hover:text-foreground transition-colors">
                    <div className="p-1.5 rounded bg-secondary">
                      <TrendingUp className="size-3.5 text-muted-foreground" />
                    </div>
                    <span className="text-sm">로드맵 탐색</span>
                    <ChevronRight className="size-3 text-muted-foreground ml-auto" />
                  </Link>
                </FluidList>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
