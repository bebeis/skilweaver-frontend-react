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
  Calendar
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900 mb-2">안녕하세요, {user?.name}님! 👋</h1>
        <p className="text-gray-600">
          오늘도 성장을 위한 여정을 이어가세요
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">내 기술 스택</p>
                <p className="text-gray-900 mt-1">{mockSkills.length}개</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <BookOpen className="size-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">활성 목표</p>
                <p className="text-gray-900 mt-1">{mockGoals.length}개</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <Target className="size-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">하루 학습 시간</p>
                <p className="text-gray-900 mt-1">60분</p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <Clock className="size-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">목표 트랙</p>
                <p className="text-gray-900 mt-1">{user?.targetTrack}</p>
              </div>
              <div className="bg-orange-100 rounded-full p-3">
                <TrendingUp className="size-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Learning Plan */}
      {mockActivePlan && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>진행 중인 학습 플랜</CardTitle>
              <Link to={`/learning-plans/${mockActivePlan.id}`}>
                <Button variant="outline" size="sm">자세히 보기</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-gray-900">{mockActivePlan.targetTechnology}</h3>
                <p className="text-gray-600 mt-1">
                  {mockActivePlan.currentWeek}주차 / {mockActivePlan.totalWeeks}주 ({mockActivePlan.totalHours}시간)
                </p>
              </div>
              <Badge className="bg-blue-100 text-blue-800">진행중</Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">진행률</span>
                <span className="text-gray-900">{mockActivePlan.progress}%</span>
              </div>
              <Progress value={mockActivePlan.progress} />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Calendar className="size-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-blue-900">오늘의 학습</p>
                  <p className="text-blue-700 mt-1">{mockActivePlan.todayTask}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Skills & Goals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Skills */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>내 기술 스택</CardTitle>
              <Link to="/skills">
                <Button variant="outline" size="sm">전체 보기</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockSkills.map((skill) => (
                <div key={skill.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-white rounded-full p-2">
                      <BookOpen className="size-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-gray-900">{skill.name}</p>
                      <p className="text-gray-600">{skill.category}</p>
                    </div>
                  </div>
                  <Badge className={levelColors[skill.level as keyof typeof levelColors]}>
                    {skill.level}
                  </Badge>
                </div>
              ))}
              <Link to="/skills/new">
                <Button variant="outline" size="sm" className="w-full">
                  <Plus className="size-4 mr-2" />
                  기술 추가
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Active Goals */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>활성 목표</CardTitle>
              <Link to="/goals">
                <Button variant="outline" size="sm">전체 보기</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockGoals.map((goal) => (
                <div key={goal.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-gray-900">{goal.title}</p>
                    <Badge className={priorityColors[goal.priority as keyof typeof priorityColors]}>
                      {goal.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="size-4" />
                    <span>~{goal.dueDate}</span>
                  </div>
                </div>
              ))}
              <Link to="/goals">
                <Button variant="outline" size="sm" className="w-full">
                  <Plus className="size-4 mr-2" />
                  목표 추가
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>빠른 작업</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/learning-plans/new">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="size-4 mr-2" />
                새 학습 플랜 만들기
              </Button>
            </Link>
            <Link to="/technologies">
              <Button variant="outline" className="w-full justify-start">
                <BookOpen className="size-4 mr-2" />
                기술 카탈로그 둘러보기
              </Button>
            </Link>
            <Link to="/skills/new">
              <Button variant="outline" className="w-full justify-start">
                <CheckCircle2 className="size-4 mr-2" />
                기술 스택 업데이트
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
