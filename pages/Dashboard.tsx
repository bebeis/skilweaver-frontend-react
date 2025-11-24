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
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  Zap,
  Activity,
  Loader2
} from 'lucide-react';
import { skillsApi, goalsApi, learningPlansApi } from '../src/lib/api';
import { toast } from 'sonner';

const levelColors = {
  BEGINNER: 'bg-success/20 text-success border-success/30',
  INTERMEDIATE: 'bg-primary/20 text-primary border-primary/30',
  ADVANCED: 'bg-accent/20 text-accent border-accent/30'
};

const priorityColors = {
  HIGH: 'bg-destructive/20 text-destructive border-destructive/30',
  MEDIUM: 'bg-warning/20 text-warning border-warning/30',
  LOW: 'bg-muted-foreground/20 text-muted-foreground border-muted-foreground/30'
};

export function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [skills, setSkills] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [activePlan, setActivePlan] = useState<any>(null);
  const [plansCount, setPlansCount] = useState(0);

  // Load dashboard data from APIs
  useEffect(() => {
    if (!user) return;
    
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Load all data in parallel
        const [skillsResponse, goalsResponse, plansResponse] = await Promise.all([
          skillsApi.getSkills(Number(user.id)),
          goalsApi.getGoals(Number(user.id), { status: 'ACTIVE' }),
          learningPlansApi.getPlans(Number(user.id), { status: 'ACTIVE', page: 0, size: 1 }),
        ]);
        
        if (skillsResponse.success) {
          // Handle both response formats:
          // 1. { skills: [...] } - from API spec
          // 2. [...] - direct array from actual API
          const skillsArray = Array.isArray(skillsResponse.data)
            ? skillsResponse.data
            : skillsResponse.data?.skills || [];
          setSkills(skillsArray.slice(0, 5)); // Top 5 skills
        }

        if (goalsResponse.success && goalsResponse.data?.goals) {
          const goalsArray = Array.isArray(goalsResponse.data.goals)
            ? goalsResponse.data.goals
            : [];
          setGoals(goalsArray.slice(0, 3)); // Top 3 goals
        }
        
        if (plansResponse.success && plansResponse.data?.pagination) {
          setPlansCount(plansResponse.data.pagination.totalElements);
          if (plansResponse.data.plans && plansResponse.data.plans.length > 0) {
            // Get the first active plan details
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
            } catch (error) {
              // Ignore if plan details fail
            }
          }
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
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="content-spacing">
      {/* 웰컴 헤더 */}
      <div className="relative overflow-hidden">
        <div className="glass-card border-tech card-hover-float p-8 animate-slide-up-fluid">
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="absolute inset-0 bg-primary rounded-2xl blur-xl opacity-50 animate-glow-pulse"></div>
                <div className="relative bg-gradient-tech-primary rounded-2xl p-4 shadow-neon">
                  <Activity className="size-10 text-white" />
                </div>
              </div>
      <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">안녕하세요, {user?.name}님</h1>
                <p className="text-xl text-muted-foreground font-medium">
                  오늘도 성장을 위한 여정을 이어가세요 🚀
                </p>
              </div>
            </div>
            <Link to="/learning-plans/new">
              <Button className="bg-gradient-tech-primary hover-glow-primary btn-ripple shadow-neon h-14 px-8 text-base">
                <Sparkles className="size-5 mr-2" />
                새 학습 플랜 만들기
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card border-tech card-hover-float animate-scale-in stagger-1">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground font-semibold mb-2">내 기술 스택</p>
                <p className="text-5xl font-bold text-foreground">{skills.length}</p>
                <p className="text-sm text-muted-foreground font-medium mt-1">개</p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-primary rounded-xl blur-md opacity-30"></div>
                <div className="relative bg-primary/20 rounded-xl p-4 border border-primary/30">
                  <BookOpen className="size-8 text-primary" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-tech card-hover-float animate-scale-in stagger-2">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground font-semibold mb-2">활성 목표</p>
                <p className="text-5xl font-bold text-foreground">{goals.length}</p>
                <p className="text-sm text-muted-foreground font-medium mt-1">개</p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-success rounded-xl blur-md opacity-30"></div>
                <div className="relative bg-success/20 rounded-xl p-4 border border-success/30">
                  <Target className="size-8 text-success" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-tech card-hover-float animate-scale-in stagger-3">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground font-semibold mb-2">하루 학습 시간</p>
                <p className="text-5xl font-bold text-foreground">60</p>
                <p className="text-sm text-muted-foreground font-medium mt-1">분</p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-accent rounded-xl blur-md opacity-30"></div>
                <div className="relative bg-accent/20 rounded-xl p-4 border border-accent/30">
                  <Clock className="size-8 text-accent" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-tech card-hover-float animate-scale-in stagger-4">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground font-semibold mb-2">목표 트랙</p>
                <p className="text-2xl font-bold text-foreground mt-3">{user?.targetTrack}</p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-warning rounded-xl blur-md opacity-30"></div>
                <div className="relative bg-warning/20 rounded-xl p-4 border border-warning/30">
                  <TrendingUp className="size-8 text-warning" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 활성 학습 플랜 */}
      {activePlan && (
        <Card className="glass-card border-tech card-hover-float shadow-neon animate-slide-up-fluid stagger-5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary rounded-lg blur-md opacity-50"></div>
                  <div className="relative bg-primary/20 rounded-lg p-3 border border-primary/30">
                    <Sparkles className="size-6 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-2xl">진행 중인 학습 플랜</CardTitle>
              </div>
                <Link to={`/learning-plans/${activePlan.id}`}>
                <Button variant="outline" className="border-primary/30 hover:bg-primary/10 transition-all duration-fluid">
                  상세 보기
                  <ArrowRight className="size-4 ml-2" />
                </Button>
                </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-3xl font-bold text-foreground mb-2">{activePlan.targetTechnology}</h3>
                <p className="text-muted-foreground text-lg font-medium">
                  {activePlan.currentWeek}주차 / {activePlan.totalWeeks}주 · {activePlan.totalHours}시간
                </p>
              </div>
              <Badge className="bg-success/20 text-success border-success/30 px-4 py-2 text-sm shadow-neon-sm">
                진행중
              </Badge>
            </div>

            <div className="space-y-4 glass-card p-5 rounded-xl border border-border/50">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-semibold">진행률</span>
                <span className="text-3xl font-bold text-primary">{activePlan.progress}%</span>
              </div>
              <Progress value={activePlan.progress} className="h-3" />
            </div>

            <div className="bg-gradient-tech-primary p-6 rounded-xl shadow-neon border border-primary/30">
              <div className="flex items-start gap-4">
                <div className="bg-white/20 rounded-xl p-3 backdrop-blur-sm">
                  <Calendar className="size-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white text-lg mb-2">오늘의 학습</p>
                  <p className="text-white/90 text-base leading-relaxed">학습 플랜을 진행 중입니다</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 스킬 & 목표 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 스킬 */}
        <Card className="glass-card border-tech shadow-tech animate-slide-up-fluid stagger-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary rounded-lg blur-md opacity-40"></div>
                  <div className="relative bg-primary/20 rounded-lg p-2.5 border border-primary/30">
                    <BookOpen className="size-5 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-xl">내 기술 스택</CardTitle>
              </div>
                <Link to="/skills">
                <Button variant="outline" size="sm" className="border-primary/30 hover:bg-primary/10 transition-fluid">
                  전체 보기
                  <ArrowRight className="size-4 ml-1" />
                </Button>
                </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {skills.map((skill: any) => (
                <Link key={skill.memberSkillId} to={`/skills/${skill.memberSkillId}`} className="flex items-center justify-between p-4 glass-card rounded-lg border-tech hover-glow-primary">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/20 rounded-lg p-2.5 border border-primary/30">
                      <BookOpen className="size-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{skill.displayName || skill.customName}</p>
                      <p className="text-sm text-muted-foreground">{skill.level}</p>
                    </div>
                  </div>
                  <Badge className={levelColors[skill.level as keyof typeof levelColors] + ' px-3 py-1 font-medium border'}>
                    {skill.level}
                  </Badge>
                </Link>
              ))}
                <Link to="/skills/new">
                <Button variant="outline" className="w-full h-12 border-dashed border-2 border-primary/30 hover:bg-primary/10 transition-fluid">
                  <Plus className="size-5 mr-2" />
                  기술 추가
                </Button>
                </Link>
            </div>
          </CardContent>
        </Card>

        {/* 목표 */}
        <Card className="glass-card border-tech shadow-tech animate-slide-up-fluid stagger-7">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-success rounded-lg blur-md opacity-40"></div>
                  <div className="relative bg-success/20 rounded-lg p-2.5 border border-success/30">
                    <Target className="size-5 text-success" />
                  </div>
                </div>
                <CardTitle className="text-xl">활성 목표</CardTitle>
              </div>
                <Link to="/goals">
                <Button variant="outline" size="sm" className="border-success/30 hover:bg-success/10 transition-fluid">
                  전체 보기
                  <ArrowRight className="size-4 ml-1" />
                </Button>
                </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {goals.map((goal) => (
                <Link key={goal.id} to={`/goals/${goal.id}`} className="block p-4 glass-card rounded-lg border-tech hover-glow-primary">
                  <div className="flex items-start justify-between mb-3">
                    <p className="font-semibold text-foreground flex-1">{goal.title}</p>
                    <Badge className={priorityColors[goal.priority as keyof typeof priorityColors] + ' px-3 py-1 font-medium border'}>
                      {goal.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="size-4" />
                    <span className="text-sm">~{goal.dueDate}</span>
                  </div>
                </Link>
              ))}
                <Link to="/goals">
                <Button variant="outline" className="w-full h-12 border-dashed border-2 border-success/30 hover:bg-success/10 transition-fluid">
                  <Plus className="size-5 mr-2" />
                  목표 추가
                </Button>
                </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 빠른 작업 */}
      <Card className="glass-card border-tech shadow-tech animate-slide-up-fluid stagger-8">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-accent rounded-lg blur-md opacity-40"></div>
              <div className="relative bg-accent/20 rounded-lg p-2.5 border border-accent/30">
                <Zap className="size-5 text-accent" />
              </div>
            </div>
            <CardTitle className="text-xl">빠른 작업</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/learning-plans/new">
              <Button variant="outline" className="w-full h-28 flex-col items-start p-6 hover-glow-primary border-tech transition-fluid group">
                <div className="bg-gradient-tech-primary rounded-lg p-3 mb-3 group-hover:scale-110 transition-transform shadow-neon-sm">
                  <Plus className="size-6 text-white" />
                </div>
                <span className="font-semibold text-foreground text-left">새 학습 플랜 만들기</span>
              </Button>
              </Link>
              <Link to="/technologies">
              <Button variant="outline" className="w-full h-28 flex-col items-start p-6 hover-glow-primary border-tech transition-fluid group">
                <div className="bg-primary/20 rounded-lg p-3 mb-3 border border-primary/30 group-hover:scale-110 transition-transform">
                  <BookOpen className="size-6 text-primary" />
                </div>
                <span className="font-semibold text-foreground text-left">기술 카탈로그 둘러보기</span>
              </Button>
              </Link>
              <Link to="/skills/new">
              <Button variant="outline" className="w-full h-28 flex-col items-start p-6 hover-glow-primary border-tech transition-fluid group">
                <div className="bg-success/20 rounded-lg p-3 mb-3 border border-success/30 group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="size-6 text-success" />
                </div>
                <span className="font-semibold text-foreground text-left">기술 스택 업데이트</span>
              </Button>
              </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
