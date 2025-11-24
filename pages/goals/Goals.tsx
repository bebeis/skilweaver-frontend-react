import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Plus, Edit, Trash2, Target, Calendar, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { goalsApi } from '../../src/lib/api';
import { useAuth } from '../../hooks/useAuth';

interface Goal {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  dueDate: string;
  createdAt: string;
}

const priorityColors = {
  HIGH: 'bg-red-100 text-red-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  LOW: 'bg-gray-100 text-gray-800'
};

const statusColors = {
  PLANNING: 'bg-blue-100 text-blue-800',
  ACTIVE: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-purple-100 text-purple-800',
  ABANDONED: 'bg-gray-100 text-gray-800'
};

export function Goals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'ACTIVE',
    dueDate: ''
  });

  // Load goals from API
  useEffect(() => {
    if (!user) return;
    
    const loadGoals = async () => {
      try {
        setLoading(true);
        const response = await goalsApi.getGoals(Number(user.id), {
          priority: priorityFilter !== 'ALL' ? priorityFilter : undefined,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
        });
        
        if (response.success) {
          const mappedGoals: Goal[] = response.data.goals.map((g: any) => ({
            id: String(g.learningGoalId),
            title: g.title,
            description: g.description,
            priority: g.priority,
            status: g.status,
            dueDate: g.dueDate || '',
            createdAt: g.createdAt.split('T')[0],
          }));
          setGoals(mappedGoals);
        }
      } catch (error: any) {
        toast.error(error.message || '목표를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    loadGoals();
  }, [user, priorityFilter, statusFilter]);

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
        status: 'ACTIVE',
        dueDate: ''
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.dueDate) {
      toast.error('제목과 목표일을 입력해주세요.');
      return;
    }

    if (!user) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    try {
      if (editingGoal) {
        // Update existing goal
        const response = await goalsApi.updateGoal(
          Number(user.id),
          Number(editingGoal.id),
          {
            title: formData.title,
            description: formData.description,
            dueDate: formData.dueDate,
            priority: formData.priority as any,
            status: formData.status as any,
          }
        );
        
        if (response.success) {
          setGoals(goals.map(g => 
            g.id === editingGoal.id 
              ? {
                  ...g,
                  title: formData.title,
                  description: formData.description,
                  priority: formData.priority,
                  status: formData.status,
                  dueDate: formData.dueDate,
                }
              : g
          ));
          toast.success(response.message || '목표가 수정되었습니다.');
        }
      } else {
        // Create new goal
        const response = await goalsApi.createGoal(Number(user.id), {
          title: formData.title,
          description: formData.description,
          dueDate: formData.dueDate,
          priority: formData.priority as any,
        });
        
        if (response.success) {
          const newGoal: Goal = {
            id: String(response.data.learningGoalId),
            title: response.data.title,
            description: response.data.description,
            priority: response.data.priority,
            status: response.data.status,
            dueDate: response.data.dueDate || '',
            createdAt: response.data.createdAt.split('T')[0],
          };
          setGoals([newGoal, ...goals]);
          toast.success(response.message || '새 목표가 추가되었습니다.');
        }
      }

      setDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || '작업을 처리하는데 실패했습니다.');
    }
  };

  const handleDelete = async (goalId: string) => {
    if (!confirm('이 목표를 삭제하시겠습니까?')) return;
    
    if (!user) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    try {
      await goalsApi.deleteGoal(Number(user.id), Number(goalId));
      setGoals(goals.filter(g => g.id !== goalId));
      toast.success('목표가 삭제되었습니다.');
    } catch (error: any) {
      toast.error(error.message || '삭제에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">학습 목표</h1>
          <p className="text-muted-foreground text-lg font-medium mt-1">
            학습 목표를 설정하고 진행 상황을 관리하세요
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="size-4 mr-2" />
          목표 추가
        </Button>
      </div>

      {/* Filters */}
      <Card className="glass-card border-tech">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-foreground font-semibold">우선순위</label>
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
              <label className="text-foreground font-semibold">상태</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">전체</SelectItem>
                  <SelectItem value="ACTIVE">진행중</SelectItem>
                  <SelectItem value="COMPLETED">완료</SelectItem>
                  <SelectItem value="ABANDONED">중단</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                className="w-full relative z-10"
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
          <Card className="glass-card border-tech">
            <CardContent className="py-12 text-center">
              <Target className="size-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">조건에 맞는 목표가 없습니다.</p>
              <Button variant="outline" className="mt-4" onClick={() => handleOpenDialog()}>
                <Plus className="size-4 mr-2" />
                첫 목표 추가하기
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredGoals.map((goal) => (
            <Card key={goal.id} className="glass-card border-tech card-hover-float">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="bg-success/20 rounded-full p-2 border border-success/30">
                        <Target className="size-5 text-success" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <h3 className="text-foreground font-bold">{goal.title}</h3>
                          <Badge className={priorityColors[goal.priority as keyof typeof priorityColors]}>
                            {goal.priority}
                          </Badge>
                          <Badge className={statusColors[goal.status as keyof typeof statusColors]}>
                            {goal.status}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground">{goal.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="size-4" />
                      <span className="font-medium">목표일: {goal.dueDate}</span>
                    </div>
                  </div>

                  <div className="flex md:flex-col gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 md:flex-initial relative z-10"
                      onClick={() => handleOpenDialog(goal)}
                    >
                      <Edit className="size-4 mr-2" />
                      수정
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 md:flex-initial text-red-600 hover:text-red-700 relative z-10"
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
                    <SelectItem value="ACTIVE">진행중</SelectItem>
                    <SelectItem value="COMPLETED">완료</SelectItem>
                    <SelectItem value="ABANDONED">중단</SelectItem>
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
