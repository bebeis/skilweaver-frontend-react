import { Link } from 'react-router-dom';
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
  Flame
} from 'lucide-react';

// Mock data
const mockSkills = [
  { id: '1', name: 'Java', level: 'ADVANCED', category: 'LANGUAGE' },
  { id: '2', name: 'Spring Boot', level: 'INTERMEDIATE', category: 'FRAMEWORK' },
  { id: '3', name: 'Docker', level: 'BEGINNER', category: 'DEVOPS' },
];

const mockGoals = [
  { id: '1', title: 'Kubernetes 마스터하기', priority: 'HIGH', dueDate: '2025-12-31', status: 'ACTIVE' },
  { id: '2', title: 'AWS 자격증 취득', priority: 'MEDIUM', dueDate: '2025-06-30', status: 'ACTIVE' },
];

const mockActivePlan = {
  id: '1',
  targetTechnology: 'Kubernetes',
  totalWeeks: 8,
  totalHours: 56,
  progress: 35,
  currentWeek: 3,
  todayTask: 'Pod와 Deployment 개념 이해 및 실습'
};

const levelColors = {
  BEGINNER: 'bg-green-100 text-green-800',
  INTERMEDIATE: 'bg-blue-100 text-blue-800',
  ADVANCED: 'bg-purple-100 text-purple-800'
};

const priorityColors = {
  HIGH: 'bg-red-100 text-red-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  LOW: 'bg-gray-100 text-gray-800'
};

export function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-3xl blur-3xl opacity-30"></div>
        <div className="relative bg-gradient-to-br from-white to-purple-50/50 rounded-2xl p-8 border border-purple-100 shadow-soft">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-4 shadow-glow-primary animate-float">
                <Flame className="size-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-1">안녕하세요, {user?.name}님! 👋</h1>
                <p className="text-lg text-slate-600">
                  오늘도 성장을 위한 여정을 이어가세요
                </p>
              </div>
            </div>
            <Link to="/learning-plans/new">
              <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-glow-primary btn-glow h-12 px-6">
                <Sparkles className="size-5 mr-2" />
                새 학습 플랜 만들기
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-hover border-0 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 font-medium mb-1">내 기술 스택</p>
                <p className="text-4xl font-bold text-slate-900">{mockSkills.length}</p>
                <p className="text-sm text-slate-500 mt-1">개</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-4 shadow-glow-accent">
                <BookOpen className="size-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover border-0 bg-gradient-to-br from-green-50 to-emerald-50 shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 font-medium mb-1">활성 목표</p>
                <p className="text-4xl font-bold text-slate-900">{mockGoals.length}</p>
                <p className="text-sm text-slate-500 mt-1">개</p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-4 shadow-lg">
                <Target className="size-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover border-0 bg-gradient-to-br from-purple-50 to-pink-50 shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 font-medium mb-1">하루 학습 시간</p>
                <p className="text-4xl font-bold text-slate-900">60</p>
                <p className="text-sm text-slate-500 mt-1">분</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-4 shadow-glow-primary">
                <Clock className="size-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover border-0 bg-gradient-to-br from-orange-50 to-red-50 shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 font-medium mb-1">목표 트랙</p>
                <p className="text-xl font-bold text-slate-900 mt-2">{user?.targetTrack}</p>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-4 shadow-lg">
                <TrendingUp className="size-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Learning Plan */}
      {mockActivePlan && (
        <Card className="border-0 shadow-soft bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-3xl opacity-20 -mr-32 -mt-32"></div>
          <CardHeader className="relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-2 shadow-glow-primary">
                  <Sparkles className="size-6 text-white" />
                </div>
                <CardTitle className="text-2xl">진행 중인 학습 플랜</CardTitle>
              </div>
              <Link to={`/learning-plans/${mockActivePlan.id}`}>
                <Button variant="outline" className="border-purple-300 hover:bg-purple-100">
                  자세히 보기
                  <ArrowRight className="size-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 relative">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">{mockActivePlan.targetTechnology}</h3>
                <p className="text-slate-600 mt-2 text-lg">
                  {mockActivePlan.currentWeek}주차 / {mockActivePlan.totalWeeks}주 · {mockActivePlan.totalHours}시간
                </p>
              </div>
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 text-sm shadow-lg">
                진행중
              </Badge>
            </div>
            
            <div className="space-y-3 bg-white/70 backdrop-blur-sm rounded-xl p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">진행률</span>
                <span className="text-2xl font-bold text-slate-900">{mockActivePlan.progress}%</span>
              </div>
              <Progress value={mockActivePlan.progress} className="h-3" />
            </div>

            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-glow-primary">
              <div className="flex items-start gap-4">
                <div className="bg-white/20 rounded-xl p-3">
                  <Calendar className="size-6" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-lg mb-2">오늘의 학습</p>
                  <p className="text-white/90 text-base leading-relaxed">{mockActivePlan.todayTask}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Skills & Goals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Skills */}
        <Card className="border-0 shadow-soft">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-2 shadow-lg">
                  <BookOpen className="size-5 text-white" />
                </div>
                <CardTitle className="text-xl">내 기술 스택</CardTitle>
              </div>
              <Link to="/skills">
                <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:border-blue-300">
                  전체 보기
                  <ArrowRight className="size-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockSkills.map((skill) => (
                <div key={skill.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl hover:shadow-md transition-all duration-200 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="bg-white rounded-xl p-2.5 shadow-sm">
                      <BookOpen className="size-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{skill.name}</p>
                      <p className="text-sm text-slate-500">{skill.category}</p>
                    </div>
                  </div>
                  <Badge className={levelColors[skill.level as keyof typeof levelColors] + ' px-3 py-1 font-medium'}>
                    {skill.level}
                  </Badge>
                </div>
              ))}
              <Link to="/skills/new">
                <Button variant="outline" className="w-full h-12 border-dashed border-2 border-blue-300 hover:bg-blue-50 hover:border-blue-400">
                  <Plus className="size-5 mr-2" />
                  기술 추가
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Active Goals */}
        <Card className="border-0 shadow-soft">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-2 shadow-lg">
                  <Target className="size-5 text-white" />
                </div>
                <CardTitle className="text-xl">활성 목표</CardTitle>
              </div>
              <Link to="/goals">
                <Button variant="outline" size="sm" className="hover:bg-green-50 hover:border-green-300">
                  전체 보기
                  <ArrowRight className="size-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockGoals.map((goal) => (
                <div key={goal.id} className="p-4 bg-gradient-to-r from-slate-50 to-green-50 rounded-xl hover:shadow-md transition-all duration-200 border border-slate-100">
                  <div className="flex items-start justify-between mb-3">
                    <p className="font-semibold text-slate-900 flex-1">{goal.title}</p>
                    <Badge className={priorityColors[goal.priority as keyof typeof priorityColors] + ' px-3 py-1 font-medium'}>
                      {goal.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="size-4" />
                    <span className="text-sm">~{goal.dueDate}</span>
                  </div>
                </div>
              ))}
              <Link to="/goals">
                <Button variant="outline" className="w-full h-12 border-dashed border-2 border-green-300 hover:bg-green-50 hover:border-green-400">
                  <Plus className="size-5 mr-2" />
                  목표 추가
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-soft bg-gradient-to-br from-slate-50 to-slate-100">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-slate-600 to-slate-800 rounded-xl p-2 shadow-lg">
              <Sparkles className="size-5 text-white" />
            </div>
            <CardTitle className="text-xl">빠른 작업</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/learning-plans/new">
              <Button variant="outline" className="w-full h-24 justify-start flex-col items-start p-5 hover:shadow-lg transition-all duration-200 bg-white border-2 hover:border-purple-300 hover:bg-purple-50 group">
                <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg p-2 mb-2 group-hover:scale-110 transition-transform">
                  <Plus className="size-5 text-white" />
                </div>
                <span className="font-semibold text-slate-900">새 학습 플랜 만들기</span>
              </Button>
            </Link>
            <Link to="/technologies">
              <Button variant="outline" className="w-full h-24 justify-start flex-col items-start p-5 hover:shadow-lg transition-all duration-200 bg-white border-2 hover:border-blue-300 hover:bg-blue-50 group">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg p-2 mb-2 group-hover:scale-110 transition-transform">
                  <BookOpen className="size-5 text-white" />
                </div>
                <span className="font-semibold text-slate-900">기술 카탈로그 둘러보기</span>
              </Button>
            </Link>
            <Link to="/skills/new">
              <Button variant="outline" className="w-full h-24 justify-start flex-col items-start p-5 hover:shadow-lg transition-all duration-200 bg-white border-2 hover:border-green-300 hover:bg-green-50 group">
                <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg p-2 mb-2 group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="size-5 text-white" />
                </div>
                <span className="font-semibold text-slate-900">기술 스택 업데이트</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
