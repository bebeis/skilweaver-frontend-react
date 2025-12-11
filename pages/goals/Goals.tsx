import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { ScrollArea } from '../../components/ui/scroll-area';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Target, 
  Calendar, 
  Loader2, 
  ChevronRight,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { toast } from 'sonner';
import { goalsApi } from '../../src/lib/api';
import { useAuth } from '../../hooks/useAuth';
import { LiquidHighlight, useFluidHighlight } from '../../components/ui/fluid-highlight';
import { cn } from '../../components/ui/utils';

interface Goal {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  dueDate: string;
  createdAt: string;
}

const priorityColors: Record<string, string> = {
  HIGH: 'bg-red-500/10 text-red-400 border-red-500/20',
  MEDIUM: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  LOW: 'bg-slate-500/10 text-slate-400 border-slate-500/20'
};

const priorityLabels: Record<string, string> = {
  HIGH: '높음',
  MEDIUM: '중간',
  LOW: '낮음'
};

const statusConfig: Record<string, { label: string; class: string; icon: any }> = {
  PLANNING: { label: '계획', class: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: Clock },
  ACTIVE: { label: '진행중', class: 'status-active', icon: Target },
  COMPLETED: { label: '완료', class: 'status-completed', icon: CheckCircle },
  ABANDONED: { label: '중단', class: 'status-error', icon: XCircle }
};

export function Goals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'ACTIVE',
    dueDate: ''
  });

  const { 
    containerRef: listRef, 
    highlightStyle, 
    handleMouseEnter, 
    handleMouseLeave 
  } = useFluidHighlight<HTMLDivElement>();

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

  // Stats
  const stats = {
    total: goals.length,
    active: goals.filter(g => g.status === 'ACTIVE').length,
    completed: goals.filter(g => g.status === 'COMPLETED').length,
    high: goals.filter(g => g.priority === 'HIGH').length
  };

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
          const updatedGoal = {
            ...editingGoal,
            title: formData.title,
            description: formData.description,
            priority: formData.priority,
            status: formData.status,
            dueDate: formData.dueDate,
          };
          setGoals(goals.map(g => g.id === editingGoal.id ? updatedGoal : g));
          if (selectedGoal?.id === editingGoal.id) {
            setSelectedGoal(updatedGoal);
          }
          toast.success('목표가 수정되었습니다.');
        }
      } else {
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
          toast.success('새 목표가 추가되었습니다.');
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
      if (selectedGoal?.id === goalId) {
        setSelectedGoal(null);
      }
      toast.success('목표가 삭제되었습니다.');
    } catch (error: any) {
      toast.error(error.message || '삭제에 실패했습니다.');
    }
  };

  const resetFilters = () => {
    setPriorityFilter('ALL');
    setStatusFilter('ALL');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="flex h-[calc(100vh-8rem)] gap-4">
        {/* Main List Panel */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-foreground">학습 목표</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {goals.length}개의 목표
              </p>
            </div>
            <Button size="sm" className="h-8 gap-1.5" onClick={() => handleOpenDialog()}>
              <Plus className="size-3.5" />
              목표 추가
            </Button>
          </div>

          {/* Filters */}
          <Card className="glass-card mb-4">
            <CardContent className="p-3">
              <div className="flex flex-wrap items-center gap-2">
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="h-8 w-[100px] text-xs">
                    <SelectValue placeholder="우선순위" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">전체</SelectItem>
                    <SelectItem value="HIGH">높음</SelectItem>
                    <SelectItem value="MEDIUM">중간</SelectItem>
                    <SelectItem value="LOW">낮음</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-8 w-[100px] text-xs">
                    <SelectValue placeholder="상태" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">전체</SelectItem>
                    <SelectItem value="ACTIVE">진행중</SelectItem>
                    <SelectItem value="COMPLETED">완료</SelectItem>
                    <SelectItem value="ABANDONED">중단</SelectItem>
                  </SelectContent>
                </Select>

                {(priorityFilter !== 'ALL' || statusFilter !== 'ALL') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={resetFilters}
                  >
                    초기화
                  </Button>
                )}

                <div className="ml-auto text-xs text-muted-foreground">
                  {filteredGoals.length}개
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
              <p className="text-lg font-bold text-red-400">{stats.high}</p>
              <p className="text-[10px] text-muted-foreground">높은 우선순위</p>
            </div>
          </div>

          {/* Goals List */}
          <ScrollArea className="flex-1 -mx-1 px-1">
            <div 
              ref={listRef}
              onMouseLeave={handleMouseLeave}
              className="space-y-1 relative"
            >
              <LiquidHighlight style={highlightStyle} />
              {filteredGoals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Target className="size-8 mb-2 opacity-50" />
                  <p className="text-sm mb-3">목표가 없습니다</p>
                  <Button size="sm" variant="outline" className="h-8" onClick={() => handleOpenDialog()}>
                    <Plus className="size-3.5 mr-1" />
                    첫 목표 추가
                  </Button>
                </div>
              ) : (
                filteredGoals.map((goal) => {
                  const statusInfo = statusConfig[goal.status] || statusConfig.ACTIVE;
                  const StatusIcon = statusInfo.icon;
                  
                  return (
                    <button
                      key={goal.id}
                      onClick={() => setSelectedGoal(goal)}
                      onMouseEnter={handleMouseEnter}
                      className={cn(
                        "w-full flex items-center gap-3 p-2.5 rounded-md text-left transition-colors relative z-10",
                        selectedGoal?.id === goal.id
                          ? "bg-primary/10 border border-primary/20"
                          : "hover:text-foreground"
                      )}
                    >
                      <div className="p-1.5 rounded bg-success/10 shrink-0">
                        <Target className="size-3.5 text-success" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-medium text-sm text-foreground truncate">
                            {goal.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Badge className={cn("badge-compact border", priorityColors[goal.priority])}>
                            {priorityLabels[goal.priority]}
                          </Badge>
                          <Badge className={cn("badge-compact border", statusInfo.class)}>
                            <StatusIcon className="size-2.5 mr-0.5" />
                            {statusInfo.label}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground shrink-0">
                        ~{goal.dueDate}
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
          {selectedGoal ? (
            <Card className="glass-card h-full flex flex-col">
              <CardHeader className="p-4 pb-3 border-b border-border">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{selectedGoal.title}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedGoal.createdAt} 생성
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenDialog(selectedGoal)}>
                        <Edit className="size-3.5 mr-2" />
                        수정
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDelete(selectedGoal.id)}
                      >
                        <Trash2 className="size-3.5 mr-2" />
                        삭제
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <ScrollArea className="flex-1">
                <CardContent className="p-4 space-y-4">
                  {/* Badges */}
                  <div className="flex flex-wrap gap-1.5">
                    <Badge className={cn("border", priorityColors[selectedGoal.priority])}>
                      {priorityLabels[selectedGoal.priority]} 우선순위
                    </Badge>
                    <Badge className={cn("border", statusConfig[selectedGoal.status]?.class)}>
                      {statusConfig[selectedGoal.status]?.label}
                    </Badge>
                  </div>

                  {/* Due Date */}
                  <div className="p-3 rounded-md bg-secondary/50">
                    <div className="flex items-center gap-2">
                      <Calendar className="size-4 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">목표일</p>
                        <p className="text-sm font-medium text-foreground">{selectedGoal.dueDate}</p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {selectedGoal.description && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">설명</p>
                      <p className="text-sm text-foreground">{selectedGoal.description}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="space-y-2 pt-2">
                    <Button 
                      size="sm" 
                      className="w-full h-8 text-xs"
                      onClick={() => handleOpenDialog(selectedGoal)}
                    >
                      <Edit className="size-3 mr-1.5" />
                      수정하기
                    </Button>
                  </div>
                </CardContent>
              </ScrollArea>
            </Card>
          ) : (
            <Card className="glass-card h-full flex items-center justify-center">
              <div className="text-center text-muted-foreground p-4">
                <Target className="size-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">목표를 선택하세요</p>
              </div>
            </Card>
          )}
        </div>
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
                className="h-9"
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

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>우선순위</Label>
                <Select 
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger className="h-9">
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
                  <SelectTrigger className="h-9">
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
                className="h-9"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>
              취소
            </Button>
            <Button size="sm" onClick={handleSubmit}>
              {editingGoal ? '수정' : '추가'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
