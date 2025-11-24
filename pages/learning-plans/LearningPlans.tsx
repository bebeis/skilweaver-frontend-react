import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Plus, GraduationCap, Clock, Calendar, TrendingUp } from 'lucide-react';

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-gray-900">학습 플랜</h1>
          <p className="text-gray-600 mt-1">
            AI가 생성한 맞춤형 학습 계획을 관리하세요
          </p>
        </div>
        <Link to="/learning-plans/new">
          <Button>
            <Plus className="size-4 mr-2" />
            새 플랜 생성
          </Button>
        </Link>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-gray-700">상태</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
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
                className="w-full"
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
            <Card>
              <CardContent className="py-12 text-center">
                <GraduationCap className="size-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">조건에 맞는 학습 플랜이 없습니다.</p>
                <Link to="/learning-plans/new">
                  <Button variant="outline" className="mt-4">
                    <Plus className="size-4 mr-2" />
                    첫 플랜 생성하기
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredPlans.map((plan) => (
            <Card key={plan.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 rounded-lg p-2">
                        <GraduationCap className="size-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-gray-900">{plan.targetTechnology}</h3>
                        <p className="text-gray-600 mt-1">
                          {plan.totalWeeks}주 · {plan.totalHours}시간
                        </p>
                      </div>
                    </div>
                    <Badge className={statusColors[plan.status as keyof typeof statusColors]}>
                      {plan.status}
                    </Badge>
                  </div>

                  {/* Progress */}
                  {plan.status !== 'DRAFT' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">진행률</span>
                        <span className="text-gray-900">{plan.progress}%</span>
                      </div>
                      <Progress value={plan.progress} />
                      {plan.status === 'ACTIVE' && (
                        <p className="text-gray-600">
                          현재 {plan.currentWeek}주차 진행중
                        </p>
                      )}
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="flex flex-wrap gap-4 text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="size-4" />
                      <span>생성: {plan.createdAt}</span>
                    </div>
                    {plan.status === 'ACTIVE' && (
                      <div className="flex items-center gap-2">
                        <Clock className="size-4" />
                        <span>남은 시간: {Math.round((plan.totalHours * (100 - plan.progress)) / 100)}시간</span>
                      </div>
                    )}
                  </div>

                  {/* Action */}
                  <Link to={`/learning-plans/${plan.id}`}>
                    <Button variant="outline" className="w-full">
                      {plan.status === 'DRAFT' ? '플랜 확인하기' : '상세 보기'}
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
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-gray-900">{mockPlans.length}</p>
                <p className="text-gray-600">총 플랜</p>
              </div>
              <div>
                <p className="text-gray-900">
                  {mockPlans.filter(p => p.status === 'ACTIVE').length}
                </p>
                <p className="text-gray-600">진행중</p>
              </div>
              <div>
                <p className="text-gray-900">
                  {mockPlans.filter(p => p.status === 'COMPLETED').length}
                </p>
                <p className="text-gray-600">완료</p>
              </div>
              <div>
                <p className="text-gray-900">
                  {mockPlans.reduce((sum, p) => sum + p.totalHours, 0)}
                </p>
                <p className="text-gray-600">총 학습 시간</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
