import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '../../components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { 
  Plus, 
  Edit, 
  Trash2, 
  BookOpen, 
  Calendar, 
  Award, 
  Loader2,
  Search,
  Map as MapIcon,
  GitCompare,
  Database,
  ChevronRight,
  MoreHorizontal,
  ExternalLink,
  Check,
  ChevronsUpDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { toast } from 'sonner';
import { skillsApi, technologiesApi } from '../../src/lib/api';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../components/ui/utils';
import { SkillLevel } from '../../src/lib/api/types';

interface Skill {
  id: string;
  technologyName: string;
  displayName: string;
  level: SkillLevel;
  category?: string;
  yearsOfUse: number;
  lastUsedAt?: string;
  note?: string;
}

interface TechInfo {
  name: string;
  displayName: string;
  category: string;
  difficulty?: string;
}

const levelColors: Record<SkillLevel, string> = {
  BEGINNER: 'level-beginner',
  INTERMEDIATE: 'level-intermediate',
  ADVANCED: 'level-advanced',
  EXPERT: 'level-expert'
};

const levelLabels: Record<SkillLevel, string> = {
  BEGINNER: '입문',
  INTERMEDIATE: '중급',
  ADVANCED: '고급',
  EXPERT: '전문가'
};

const categoryColors: Record<string, string> = {
  LANGUAGE: 'category-language',
  FRAMEWORK: 'category-framework',
  LIBRARY: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  TOOL: 'category-tool',
  DATABASE: 'category-database',
  DB: 'category-database',
  PLATFORM: 'category-platform',
  DEVOPS: 'category-devops',
  API: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  CONCEPT: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  ETC: 'bg-slate-500/10 text-slate-400 border-slate-500/20'
};

// --- Skill Dialog Component ---
function SkillDialog({ 
  open, 
  onOpenChange, 
  mode, 
  initialData, 
  onSuccess 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  mode: 'new' | 'edit';
  initialData?: Skill | null;
  onSuccess: () => void;
}) {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [loadingTechnologies, setLoadingTechnologies] = useState(false);
  const [technologies, setTechnologies] = useState<TechInfo[]>([]);
  const [techOpen, setTechOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const [formData, setFormData] = useState({
    technologyName: '',
    displayName: '',
    level: 'BEGINNER' as SkillLevel,
    yearsOfUse: 0,
    lastUsedAt: new Date().toISOString().split('T')[0],
    note: ''
  });

  // Init form data
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setFormData({
        technologyName: initialData.technologyName,
        displayName: initialData.displayName,
        level: initialData.level,
        yearsOfUse: initialData.yearsOfUse,
        lastUsedAt: initialData.lastUsedAt || new Date().toISOString().split('T')[0],
        note: initialData.note || ''
      });
    } else {
      setFormData({
        technologyName: '',
        displayName: '',
        level: 'BEGINNER',
        yearsOfUse: 0,
        lastUsedAt: new Date().toISOString().split('T')[0],
        note: ''
      });
    }
  }, [mode, initialData, open]);

  // Load technologies
  useEffect(() => {
    if (open && technologies.length === 0) {
      const loadTechnologies = async () => {
        try {
          setLoadingTechnologies(true);
          const response = await technologiesApi.getTechnologies({ limit: 200 });
          if (response.success) {
            const techList = Array.isArray(response.data)
              ? response.data
              : response.data?.technologies || [];
            setTechnologies(techList.map((t: any) => ({
              name: t.name,
              displayName: t.displayName,
              category: t.category,
              difficulty: t.difficulty
            })));
          }
        } catch (error) {
          console.error('Failed to load technologies:', error);
          toast.error('기술 목록을 불러오는데 실패했습니다.');
        } finally {
          setLoadingTechnologies(false);
        }
      };
      loadTechnologies();
    }
  }, [open, technologies.length]);

  const handleSubmit = async () => {
    if (!formData.technologyName) {
      toast.error('기술을 선택해주세요.');
      return;
    }

    if (!user) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    try {
      setSubmitting(true);
      const skillData = {
        technologyName: formData.technologyName,
        level: formData.level,
        yearsOfUse: formData.yearsOfUse,
        lastUsedAt: formData.lastUsedAt,
        note: formData.note || undefined
      };

      if (mode === 'edit' && initialData) {
        await skillsApi.updateSkill(Number(user.id), Number(initialData.id), {
          level: skillData.level,
          yearsOfUse: skillData.yearsOfUse,
          lastUsedAt: skillData.lastUsedAt,
          note: skillData.note
        });
        toast.success('기술이 수정되었습니다.');
      } else {
        await skillsApi.addSkill(Number(user.id), skillData);
        toast.success('기술이 추가되었습니다.');
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || '요청 처리에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTechnologies = technologies.filter(tech =>
    tech.displayName.toLowerCase().includes(searchValue.toLowerCase()) ||
    tech.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  const selectedTech = technologies.find(t => t.name === formData.technologyName);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? '기술 수정' : '기술 추가'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>기술 선택 *</Label>
            <Popover open={techOpen} onOpenChange={setTechOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={techOpen}
                  className="w-full justify-between"
                  disabled={mode === 'edit'}
                >
                  <div className="flex items-center gap-2">
                    {formData.technologyName ? (
                      <>
                        <Database className="size-4 text-primary" />
                        <span>{formData.displayName || formData.technologyName}</span>
                        {selectedTech?.category && (
                          <Badge variant="outline" className="text-xs h-5">
                            {selectedTech.category}
                          </Badge>
                        )}
                      </>
                    ) : (
                      <span className="text-muted-foreground">기술 검색...</span>
                    )}
                  </div>
                  <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[460px] p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder="기술 검색..."
                    value={searchValue}
                    onValueChange={setSearchValue}
                  />
                  {loadingTechnologies ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      <Loader2 className="inline size-4 animate-spin mr-2" />
                      로딩 중...
                    </div>
                  ) : (
                    <div className="max-h-[300px] overflow-y-auto">
                      {filteredTechnologies.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          검색 결과가 없습니다.
                        </div>
                      ) : (
                        <CommandGroup>
                          {filteredTechnologies.map((tech) => (
                            <CommandItem
                              key={tech.name}
                              value={tech.displayName}
                              onSelect={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  technologyName: tech.name,
                                  displayName: tech.displayName
                                }));
                                setSearchValue('');
                                setTechOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.technologyName === tech.name ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex-1 flex items-center gap-2">
                                <span>{tech.displayName}</span>
                                <Badge variant="outline" className="text-[10px] h-5">
                                  {tech.category}
                                </Badge>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}
                    </div>
                  )}
                </Command>
              </PopoverContent>
            </Popover>
            {mode === 'edit' && (
              <p className="text-xs text-muted-foreground">수정 시에는 기술을 변경할 수 없습니다.</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>숙련도 *</Label>
            <Select 
              value={formData.level}
              onValueChange={(value: SkillLevel) => setFormData({ ...formData, level: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BEGINNER">입문 - 기본 사용 가능</SelectItem>
                <SelectItem value="INTERMEDIATE">중급 - 실무 활용 가능</SelectItem>
                <SelectItem value="ADVANCED">고급 - 깊은 이해와 응용</SelectItem>
                <SelectItem value="EXPERT">전문가 - 타인 교육 가능</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>사용 경력 (년) *</Label>
              <Input
                type="number"
                min="0"
                max="50"
                step="0.5"
                value={formData.yearsOfUse}
                onChange={(e) => setFormData({ ...formData, yearsOfUse: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label>최근 사용일</Label>
              <Input
                type="date"
                value={formData.lastUsedAt}
                onChange={(e) => setFormData({ ...formData, lastUsedAt: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>메모 (선택사항)</Label>
            <Textarea
              placeholder="프로젝트 경험, 특이사항 등..."
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !formData.technologyName}>
            {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
            {mode === 'edit' ? '수정' : '추가'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Main Skills Component ---
export function Skills() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [skills, setSkills] = useState<Skill[]>([]);
  const [techMap, setTechMap] = useState<Map<string, TechInfo>>(new Map());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'new' | 'edit'>('new');
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);

  // Sync Dialog with URL
  useEffect(() => {
    const mode = searchParams.get('mode');
    const skillId = searchParams.get('skillId');

    if (mode === 'new') {
      setDialogMode('new');
      setEditingSkill(null);
      setDialogOpen(true);
    } else if (mode === 'edit' && skillId) {
      const skill = skills.find(s => s.id === skillId);
      if (skill) {
        setDialogMode('edit');
        setEditingSkill(skill);
        setDialogOpen(true);
      }
    } else {
      setDialogOpen(false);
    }
  }, [searchParams, skills]);

  const handleOpenDialog = (mode: 'new' | 'edit', skill?: Skill) => {
    if (mode === 'new') {
      setSearchParams({ mode: 'new' });
    } else if (mode === 'edit' && skill) {
      setSearchParams({ mode: 'edit', skillId: skill.id });
    }
  };

  const handleCloseDialog = (open: boolean) => {
    if (!open) {
      setSearchParams({});
    }
    setDialogOpen(open);
  };

  // Load technologies for category mapping
  useEffect(() => {
    const loadTechnologies = async () => {
      try {
        const response = await technologiesApi.getTechnologies({ limit: 200, active: true });
        if (response.success && response.data?.technologies) {
          const map = new Map<string, TechInfo>();
          response.data.technologies.forEach((tech: any) => {
            map.set(tech.name, {
              name: tech.name,
              displayName: tech.displayName,
              category: tech.category,
              difficulty: tech.difficulty
            });
          });
          setTechMap(map);
        }
      } catch (error) {
        console.error('Failed to load technologies:', error);
      }
    };
    loadTechnologies();
  }, []);

  // Load skills function
  const loadSkills = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const response = await skillsApi.getSkills(Number(user.id), {
        level: levelFilter !== 'ALL' ? levelFilter : undefined,
      });
      
      if (response.success) {
        const skillsArray = Array.isArray(response.data)
          ? response.data
          : response.data?.skills || [];

        const mappedSkills: Skill[] = skillsArray.map((s: any) => {
          const techInfo = techMap.get(s.technologyName);
          return {
            id: String(s.memberSkillId),
            technologyName: s.technologyName,
            displayName: techInfo?.displayName || s.technologyName,
            level: s.level,
            category: techInfo?.category || 'ETC',
            yearsOfUse: s.yearsOfUse,
            lastUsedAt: s.lastUsedAt,
            note: s.note,
          };
        });
        setSkills(mappedSkills);
        
        // Update editing skill if needed (in case data refreshed)
        if (editingSkill) {
          const updated = mappedSkills.find(s => s.id === editingSkill.id);
          if (updated) setEditingSkill(updated);
        }
        
        // Update selected skill if needed
        if (selectedSkill) {
          const updated = mappedSkills.find(s => s.id === selectedSkill.id);
          if (updated) setSelectedSkill(updated);
        }
      } else {
        setSkills([]);
      }
    } catch (error: any) {
      toast.error(error.message || '기술 스택을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // Initial Load
  useEffect(() => {
    loadSkills();
  }, [user, levelFilter, techMap]);

  const handleDelete = async (skillId: string) => {
    if (!confirm('이 기술을 삭제하시겠습니까?')) return;
    
    if (!user) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    try {
      await skillsApi.deleteSkill(Number(user.id), Number(skillId));
      setSkills(skills.filter(s => s.id !== skillId));
      if (selectedSkill?.id === skillId) {
        setSelectedSkill(null);
      }
      toast.success('기술이 삭제되었습니다.');
    } catch (error: any) {
      toast.error(error.message || '삭제에 실패했습니다.');
    }
  };

  // Filter skills
  const filteredSkills = useMemo(() => {
    return skills.filter(skill => {
      const matchesSearch = 
        skill.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.technologyName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'ALL' || skill.category === categoryFilter;
      const matchesLevel = levelFilter === 'ALL' || skill.level === levelFilter;
      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [skills, searchQuery, categoryFilter, levelFilter]);

  // Stats
  const stats = useMemo(() => {
    const levelCount: Record<string, number> = { BEGINNER: 0, INTERMEDIATE: 0, ADVANCED: 0, EXPERT: 0 };
    let totalYears = 0;

    skills.forEach(skill => {
      levelCount[skill.level] = (levelCount[skill.level] || 0) + 1;
      totalYears += skill.yearsOfUse;
    });

    return {
      total: skills.length,
      levelCount,
      avgYears: skills.length > 0 ? (totalYears / skills.length).toFixed(1) : '0'
    };
  }, [skills]);

  const resetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('ALL');
    setLevelFilter('ALL');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex h-[calc(100vh-8rem)] gap-4">
        {/* Main List Panel */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-foreground">내 기술 스택</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {skills.length}개의 기술
              </p>
            </div>
            <Button size="sm" className="h-8 gap-1.5" onClick={() => handleOpenDialog('new')}>
              <Plus className="size-3.5" />
              기술 추가
            </Button>
          </div>

          {/* Filters */}
          <Card className="glass-card mb-4">
            <CardContent className="p-3">
              <div className="flex flex-wrap items-center gap-2">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <Input
                    placeholder="검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 pl-8 text-sm bg-secondary/50"
                  />
                </div>

                {/* Category */}
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="h-8 w-[120px] text-xs">
                    <SelectValue placeholder="카테고리" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">전체</SelectItem>
                    <SelectItem value="LANGUAGE">언어</SelectItem>
                    <SelectItem value="FRAMEWORK">프레임워크</SelectItem>
                    <SelectItem value="DATABASE">데이터베이스</SelectItem>
                    <SelectItem value="DEVOPS">DevOps</SelectItem>
                    <SelectItem value="PLATFORM">플랫폼</SelectItem>
                    <SelectItem value="TOOL">도구</SelectItem>
                  </SelectContent>
                </Select>

                {/* Level */}
                <Select value={levelFilter} onValueChange={setLevelFilter}>
                  <SelectTrigger className="h-8 w-[100px] text-xs">
                    <SelectValue placeholder="레벨" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">전체</SelectItem>
                    <SelectItem value="BEGINNER">입문</SelectItem>
                    <SelectItem value="INTERMEDIATE">중급</SelectItem>
                    <SelectItem value="ADVANCED">고급</SelectItem>
                    <SelectItem value="EXPERT">전문가</SelectItem>
                  </SelectContent>
                </Select>

                {(categoryFilter !== 'ALL' || levelFilter !== 'ALL' || searchQuery) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={resetFilters}
                  >
                    초기화
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stats Row */}
          <div className="grid grid-cols-5 gap-2 mb-4">
            <div className="card-compact text-center">
              <p className="text-lg font-bold text-foreground">{stats.total}</p>
              <p className="text-[10px] text-muted-foreground">전체</p>
            </div>
            <div className="card-compact text-center">
              <p className="text-lg font-bold text-orange-400">{stats.levelCount.EXPERT}</p>
              <p className="text-[10px] text-muted-foreground">전문가</p>
            </div>
            <div className="card-compact text-center">
              <p className="text-lg font-bold text-purple-400">{stats.levelCount.ADVANCED}</p>
              <p className="text-[10px] text-muted-foreground">고급</p>
            </div>
            <div className="card-compact text-center">
              <p className="text-lg font-bold text-blue-400">{stats.levelCount.INTERMEDIATE}</p>
              <p className="text-[10px] text-muted-foreground">중급</p>
            </div>
            <div className="card-compact text-center">
              <p className="text-lg font-bold text-green-400">{stats.avgYears}년</p>
              <p className="text-[10px] text-muted-foreground">평균 경력</p>
            </div>
          </div>

          {/* Skills List */}
          <ScrollArea className="flex-1 -mx-1 px-1">
            <div className="space-y-1">
              {filteredSkills.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <BookOpen className="size-8 mb-2 opacity-50" />
                  <p className="text-sm mb-3">
                    {skills.length === 0 ? '등록된 기술이 없습니다' : '검색 결과가 없습니다'}
                  </p>
                  {skills.length === 0 && (
                    <Button size="sm" variant="outline" className="h-8" onClick={() => handleOpenDialog('new')}>
                      <Plus className="size-3.5 mr-1" />
                      첫 기술 추가
                    </Button>
                  )}
                </div>
              ) : (
                filteredSkills.map((skill) => (
                  <button
                    key={skill.id}
                    onClick={() => setSelectedSkill(skill)}
                    className={cn(
                      "w-full flex items-center gap-3 p-2.5 rounded-md text-left transition-colors",
                      selectedSkill?.id === skill.id
                        ? "bg-primary/10 border border-primary/20"
                        : "hover:bg-secondary/50"
                    )}
                  >
                    <div className="p-1.5 rounded bg-secondary shrink-0">
                      <Database className="size-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-foreground truncate">
                          {skill.displayName}
                        </span>
                        <Badge className={cn("badge-compact border", levelColors[skill.level])}>
                          {levelLabels[skill.level]}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                        <span>{skill.yearsOfUse}년 경력</span>
                        {skill.category && (
                          <>
                            <span>·</span>
                            <span>{skill.category}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground shrink-0" />
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Detail Panel */}
        <div className="hidden lg:block w-80 shrink-0">
          {selectedSkill ? (
            <Card className="glass-card h-full flex flex-col">
              <CardHeader className="p-4 pb-3 border-b border-border">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{selectedSkill.displayName}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">{selectedSkill.technologyName}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenDialog('edit', selectedSkill)}>
                        <Edit className="size-3.5 mr-2" />
                        수정
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDelete(selectedSkill.id)}
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
                    <Badge className={cn("border", levelColors[selectedSkill.level])}>
                      {levelLabels[selectedSkill.level]}
                    </Badge>
                    {selectedSkill.category && (
                      <Badge className={cn("border", categoryColors[selectedSkill.category])}>
                        {selectedSkill.category}
                      </Badge>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-md bg-secondary/50 text-center">
                      <Award className="size-4 text-primary mx-auto" />
                      <p className="text-lg font-bold mt-1">{selectedSkill.yearsOfUse}년</p>
                      <p className="text-[10px] text-muted-foreground">경력</p>
                    </div>
                    {selectedSkill.lastUsedAt && (
                      <div className="p-3 rounded-md bg-secondary/50 text-center">
                        <Calendar className="size-4 text-accent mx-auto" />
                        <p className="text-sm font-bold mt-1">{selectedSkill.lastUsedAt}</p>
                        <p className="text-[10px] text-muted-foreground">최근 사용</p>
                      </div>
                    )}
                  </div>

                  {/* Note */}
                  {selectedSkill.note && (
                    <div className="p-3 rounded-md bg-secondary/30">
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedSkill.note}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="space-y-2 pt-2">
                    <Link to={`/technologies/${encodeURIComponent(selectedSkill.technologyName)}`}>
                      <Button variant="outline" size="sm" className="w-full h-8 text-xs">
                        <ExternalLink className="size-3 mr-1.5" />
                        기술 상세
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full h-8 text-xs"
                      onClick={() => navigate(`/explore?tech=${selectedSkill.technologyName}`)}
                    >
                      <MapIcon className="size-3 mr-1.5" />
                      로드맵 탐색
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full h-8 text-xs"
                      onClick={() => navigate(`/explore?tab=gap&known=${selectedSkill.technologyName}`)}
                    >
                      <GitCompare className="size-3 mr-1.5" />
                      갭 분석
                    </Button>
                    <Button 
                      size="sm" 
                      className="w-full h-8 text-xs"
                      onClick={() => handleOpenDialog('edit', selectedSkill)}
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
                <BookOpen className="size-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">기술을 선택하세요</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Skill Dialog */}
      <SkillDialog 
        open={dialogOpen} 
        onOpenChange={handleCloseDialog}
        mode={dialogMode}
        initialData={editingSkill}
        onSuccess={loadSkills}
      />
    </TooltipProvider>
  );
}
