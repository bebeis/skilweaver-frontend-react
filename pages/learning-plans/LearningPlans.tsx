import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Plus, GraduationCap, Clock, Calendar, TrendingUp, Sparkles, ArrowRight, Filter } from 'lucide-react';

// Mock data
const mockPlans = [
  {
    id: '1',
    targetTechnology: 'Kubernetes',
    totalWeeks: 8,
    totalHours: 56,
    progress: 35,
    status: 'ACTIVE',
    createdAt: '2025-11-01',
    currentWeek: 3
  },
  {
    id: '2',
    targetTechnology: 'GraphQL',
    totalWeeks: 4,
    totalHours: 28,
    progress: 75,
    status: 'ACTIVE',
    createdAt: '2025-10-15',
    currentWeek: 3
  },
  {
    id: '3',
    targetTechnology: 'Redis',
    totalWeeks: 3,
    totalHours: 21,
    progress: 100,
    status: 'COMPLETED',
    createdAt: '2025-09-20',
    currentWeek: 3
  },
  {
    id: '4',
    targetTechnology: 'TypeScript',
    totalWeeks: 6,
    totalHours: 42,
    progress: 0,
    status: 'DRAFT',
    createdAt: '2025-11-20',
    currentWeek: 0
  }
];

const statusColors = {
  DRAFT: 'bg-gray-100 text-gray-800',
  ACTIVE: 'bg-green-100 text-green-800',
  PAUSED: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
  CANCELLED: 'bg-red-100 text-red-800'
};

export function LearningPlans() {
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredPlans = mockPlans.filter(plan => {
    if (statusFilter !== 'ALL' && plan.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-3xl blur-3xl opacity-30"></div>
        <div className="relative bg-gradient-to-br from-white to-indigo-50/50 rounded-2xl p-8 border border-indigo-100 shadow-soft">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-4 shadow-glow-primary animate-float">
                <GraduationCap className="size-8 text-white" />
              </div>
        <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-1">학습 플랜</h1>
                <p className="text-lg text-slate-600">
            AI가 생성한 맞춤형 학습 계획을 관리하세요
          </p>
              </div>
        </div>
        <Link to="/learning-plans/new">
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-glow-primary btn-glow h-12 px-6">
                <Sparkles className="size-5 mr-2" />
            새 플랜 생성
          </Button>
        </Link>
          </div>
        </div>
      </div>

      {/* Filter */}
      <Card className="glass-card border-tech shadow-tech">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-foreground font-semibold flex items-center gap-2">
                <Filter className="size-4 text-primary" />
                상태
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">전체</SelectItem>
                  <SelectItem value="DRAFT">초안</SelectItem>
                  <SelectItem value="ACTIVE">진행중</SelectItem>
                  <SelectItem value="PAUSED">일시중지</SelectItem>
                  <SelectItem value="COMPLETED">완료</SelectItem>
                  <SelectItem value="CANCELLED">취소</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                className="w-full h-11 hover:bg-indigo-50 hover:border-indigo-300 relative z-10"
                onClick={() => setStatusFilter('ALL')}
              >
                필터 초기화
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPlans.length === 0 ? (
          <div className="col-span-full">
            <Card className="border-0 shadow-soft">
              <CardContent className="py-16 text-center">
                <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <GraduationCap className="size-12 text-indigo-600" />
                </div>
                <p className="text-lg text-slate-600 mb-4">조건에 맞는 학습 플랜이 없습니다.</p>
                <Link to="/learning-plans/new">
                  <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-glow-primary btn-glow">
                    <Plus className="size-5 mr-2" />
                    첫 플랜 생성하기
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredPlans.map((plan) => (
            <Card key={plan.id} className="card-hover border-0 shadow-soft bg-gradient-to-br from-white to-slate-50">
              <CardContent className="pt-6">
                <div className="space-y-5">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-3 shadow-lg">
                        <GraduationCap className="size-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-1">{plan.targetTechnology}</h3>
                        <p className="text-slate-600">
                          {plan.totalWeeks}주 · {plan.totalHours}시간
                        </p>
                      </div>
                    </div>
                    <Badge className={statusColors[plan.status as keyof typeof statusColors] + ' px-3 py-1.5 font-medium shadow-sm'}>
                      {plan.status}
                    </Badge>
                  </div>

                  {/* Progress */}
                  {plan.status !== 'DRAFT' && (
                    <div className="space-y-3 bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 font-medium">진행률</span>
                        <span className="text-xl font-bold text-slate-900">{plan.progress}%</span>
                      </div>
                      <Progress value={plan.progress} className="h-2.5" />
                      {plan.status === 'ACTIVE' && (
                        <p className="text-sm text-slate-600 flex items-center gap-2">
                          <TrendingUp className="size-4" />
                          현재 {plan.currentWeek}주차 진행중
                        </p>
                      )}
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="flex flex-wrap gap-4 text-slate-600">
                    <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-lg px-3 py-2">
                      <Calendar className="size-4 text-indigo-600" />
                      <span className="text-sm">생성: {plan.createdAt}</span>
                    </div>
                    {plan.status === 'ACTIVE' && (
                      <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-lg px-3 py-2">
                        <Clock className="size-4 text-purple-600" />
                        <span className="text-sm">남은: {Math.round((plan.totalHours * (100 - plan.progress)) / 100)}시간</span>
                      </div>
                    )}
                  </div>

                  {/* Action */}
                  <Link to={`/learning-plans/${plan.id}`}>
                    <Button variant="outline" className="w-full h-11 hover:bg-indigo-50 hover:border-indigo-300 group">
                      <span className="mr-2">{plan.status === 'DRAFT' ? '플랜 확인하기' : '상세 보기'}</span>
                      <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Stats */}
      {filteredPlans.length > 0 && (
        <Card className="border-0 shadow-soft bg-gradient-to-br from-slate-50 to-slate-100">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="p-4 bg-white rounded-xl shadow-sm">
                <p className="text-4xl font-bold text-slate-900 mb-1">{mockPlans.length}</p>
                <p className="text-slate-600 font-medium">총 플랜</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-sm border border-green-200">
                <p className="text-4xl font-bold text-green-700 mb-1">
                  {mockPlans.filter(p => p.status === 'ACTIVE').length}
                </p>
                <p className="text-green-700 font-medium">진행중</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl shadow-sm border border-blue-200">
                <p className="text-4xl font-bold text-blue-700 mb-1">
                  {mockPlans.filter(p => p.status === 'COMPLETED').length}
                </p>
                <p className="text-blue-700 font-medium">완료</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-sm border border-purple-200">
                <p className="text-4xl font-bold text-purple-700 mb-1">
                  {mockPlans.reduce((sum, p) => sum + p.totalHours, 0)}
                </p>
                <p className="text-purple-700 font-medium">총 학습 시간</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
