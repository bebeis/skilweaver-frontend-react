import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Plus, Edit, Trash2, Target, Calendar } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Goal {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  dueDate: string;
  createdAt: string;
}

const mockGoals: Goal[] = [
  {
    id: '1',
    title: 'Kubernetes 마스터하기',
    description: '쿠버네티스 기본 개념부터 실전 배포까지 학습',
    priority: 'HIGH',
    status: 'ACTIVE',
    dueDate: '2025-12-31',
    createdAt: '2025-11-01'
  },
  {
    id: '2',
    title: 'AWS 자격증 취득',
    description: 'AWS Solutions Architect Associate 자격증 취득',
    priority: 'MEDIUM',
    status: 'ACTIVE',
    dueDate: '2025-06-30',
    createdAt: '2025-10-15'
  },
  {
    id: '3',
    title: 'Go 언어 학습',
    description: 'Go 언어 기초 문법 및 동시성 프로그래밍 학습',
    priority: 'LOW',
    status: 'PLANNING',
    dueDate: '2026-03-31',
    createdAt: '2025-11-10'
  },
  {
    id: '4',
    title: 'MSA 아키텍처 이해',
    description: '마이크로서비스 아키텍처 설계 및 구현 경험',
    priority: 'HIGH',
    status: 'ACTIVE',
    dueDate: '2025-09-30',
    createdAt: '2025-09-01'
  }
];

const priorityColors = {
  HIGH: 'bg-red-100 text-red-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  LOW: 'bg-gray-100 text-gray-800'
};

const statusColors = {
  PLANNING: 'bg-blue-100 text-blue-800',
  ACTIVE: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-purple-100 text-purple-800',
  ON_HOLD: 'bg-orange-100 text-orange-800'
};

export function Goals() {
  const [goals, setGoals] = useState(mockGoals);
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'PLANNING',
    dueDate: ''
  });

  const filteredGoals = goals.filter(goal => {
    if (priorityFilter !== 'ALL' && goal.priority !== priorityFilter) return false;
    if (statusFilter !== 'ALL' && goal.status !== statusFilter) return false;
    return true;
  });

  const handleOpenDialog = (goal?: Goal) => {
    if (goal) {
      setEditingGoal(goal);
      setFormData({
        title: goal.title,
        description: goal.description,
        priority: goal.priority,
        status: goal.status,
        dueDate: goal.dueDate
      });
    } else {
      setEditingGoal(null);
      setFormData({
        title: '',
        description: '',
        priority: 'MEDIUM',
        status: 'PLANNING',
        dueDate: ''
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.dueDate) {
      toast.error('제목과 목표일을 입력해주세요.');
      return;
    }

    if (editingGoal) {
      // Update existing goal
      setGoals(goals.map(g => 
        g.id === editingGoal.id 
          ? { ...g, ...formData }
          : g
      ));
      toast.success('목표가 수정되었습니다.');
    } else {
      // Create new goal
      const newGoal: Goal = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setGoals([newGoal, ...goals]);
      toast.success('새 목표가 추가되었습니다.');
    }

    setDialogOpen(false);
  };

  const handleDelete = (goalId: string) => {
    if (confirm('이 목표를 삭제하시겠습니까?')) {
      setGoals(goals.filter(g => g.id !== goalId));
      toast.success('목표가 삭제되었습니다.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-gray-900">학습 목표</h1>
          <p className="text-gray-600 mt-1">
            학습 목표를 설정하고 진행 상황을 관리하세요
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="size-4 mr-2" />
          목표 추가
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-gray-700">우선순위</label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">전체</SelectItem>
                  <SelectItem value="HIGH">높음</SelectItem>
                  <SelectItem value="MEDIUM">중간</SelectItem>
                  <SelectItem value="LOW">낮음</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-gray-700">상태</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">전체</SelectItem>
                  <SelectItem value="PLANNING">계획중</SelectItem>
                  <SelectItem value="ACTIVE">진행중</SelectItem>
                  <SelectItem value="COMPLETED">완료</SelectItem>
                  <SelectItem value="ON_HOLD">보류</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setPriorityFilter('ALL');
                  setStatusFilter('ALL');
                }}
              >
                필터 초기화
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goals List */}
      <div className="space-y-3">
        {filteredGoals.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Target className="size-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">조건에 맞는 목표가 없습니다.</p>
              <Button variant="outline" className="mt-4" onClick={() => handleOpenDialog()}>
                <Plus className="size-4 mr-2" />
                첫 목표 추가하기
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredGoals.map((goal) => (
            <Card key={goal.id}>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 rounded-full p-2">
                        <Target className="size-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <h3 className="text-gray-900">{goal.title}</h3>
                          <Badge className={priorityColors[goal.priority as keyof typeof priorityColors]}>
                            {goal.priority}
                          </Badge>
                          <Badge className={statusColors[goal.status as keyof typeof statusColors]}>
                            {goal.status}
                          </Badge>
                        </div>
                        <p className="text-gray-600">{goal.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="size-4" />
                      <span>목표일: {goal.dueDate}</span>
                    </div>
                  </div>

                  <div className="flex md:flex-col gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 md:flex-initial"
                      onClick={() => handleOpenDialog(goal)}
                    >
                      <Edit className="size-4 mr-2" />
                      수정
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 md:flex-initial text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(goal.id)}
                    >
                      <Trash2 className="size-4 mr-2" />
                      삭제
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Goal Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingGoal ? '목표 수정' : '새 목표 추가'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">제목</Label>
              <Input
                id="title"
                placeholder="예: Kubernetes 마스터하기"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                placeholder="목표에 대한 상세 설명"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>우선순위</Label>
                <Select 
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HIGH">높음</SelectItem>
                    <SelectItem value="MEDIUM">중간</SelectItem>
                    <SelectItem value="LOW">낮음</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>상태</Label>
                <Select 
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PLANNING">계획중</SelectItem>
                    <SelectItem value="ACTIVE">진행중</SelectItem>
                    <SelectItem value="COMPLETED">완료</SelectItem>
                    <SelectItem value="ON_HOLD">보류</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">목표일</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSubmit}>
              {editingGoal ? '수정' : '추가'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
