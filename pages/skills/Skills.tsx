import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';
import { 
  Plus, 
  Edit, 
  Trash2, 
  BookOpen, 
  Calendar, 
  Filter, 
  Award, 
  Loader2,
  Search,
  Map as MapIcon,
  GitCompare,
  Database
} from 'lucide-react';
import { toast } from 'sonner';
import { skillsApi, technologiesApi } from '../../src/lib/api';
import { useAuth } from '../../hooks/useAuth';

interface Skill {
  id: string;
  technologyName: string;  // V4: 단일 필드
  displayName: string;     // 표시용 (기술 카탈로그에서 조회)
  level: string;
  category?: string;       // 프론트엔드에서 기술 카탈로그 조회하여 매핑
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

const levelColors: Record<string, string> = {
  BEGINNER: 'bg-green-100 text-green-800',
  INTERMEDIATE: 'bg-blue-100 text-blue-800',
  ADVANCED: 'bg-purple-100 text-purple-800',
  EXPERT: 'bg-orange-100 text-orange-800'
};

const levelLabels: Record<string, string> = {
  BEGINNER: '입문',
  INTERMEDIATE: '중급',
  ADVANCED: '고급',
  EXPERT: '전문가'
};

const categoryColors: Record<string, string> = {
  LANGUAGE: 'bg-red-50 text-red-700',
  FRAMEWORK: 'bg-blue-50 text-blue-700',
  LIBRARY: 'bg-teal-50 text-teal-700',
  TOOL: 'bg-yellow-50 text-yellow-700',
  DATABASE: 'bg-green-50 text-green-700',
  DB: 'bg-green-50 text-green-700',
  PLATFORM: 'bg-purple-50 text-purple-700',
  DEVOPS: 'bg-indigo-50 text-indigo-700',
  API: 'bg-pink-50 text-pink-700',
  CONCEPT: 'bg-cyan-50 text-cyan-700',
  ETC: 'bg-gray-50 text-gray-700'
};

export function Skills() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [techMap, setTechMap] = useState<Map<string, TechInfo>>(new Map());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [levelFilter, setLevelFilter] = useState('ALL');

  // 기술 카탈로그 로드 (카테고리 정보 매핑용)
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

  // Load skills from API
  useEffect(() => {
    if (!user) return;
    
    const loadSkills = async () => {
      try {
        setLoading(true);
        // V4: category 파라미터 제거, level만 서버에 전달
        const response = await skillsApi.getSkills(Number(user.id), {
          level: levelFilter !== 'ALL' ? levelFilter : undefined,
        });
        
        if (response.success) {
          const skillsArray = Array.isArray(response.data)
            ? response.data
            : response.data?.skills || [];

          // V4: technologyName 기반으로 매핑
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
        } else {
          setSkills([]);
        }
      } catch (error: any) {
        toast.error(error.message || '기술 스택을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
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
      toast.success('기술이 삭제되었습니다.');
    } catch (error: any) {
      toast.error(error.message || '삭제에 실패했습니다.');
    }
  };

  // 프론트엔드에서 필터링 (V4: category는 서버에서 제거됨)
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

  // 통계 계산
  const stats = useMemo(() => {
    const categoryCount: Record<string, number> = {};
    const levelCount: Record<string, number> = { BEGINNER: 0, INTERMEDIATE: 0, ADVANCED: 0, EXPERT: 0 };
    let totalYears = 0;

    skills.forEach(skill => {
      categoryCount[skill.category || 'ETC'] = (categoryCount[skill.category || 'ETC'] || 0) + 1;
      levelCount[skill.level] = (levelCount[skill.level] || 0) + 1;
      totalYears += skill.yearsOfUse;
    });

    return {
      total: skills.length,
      categoryCount,
      levelCount,
      avgYears: skills.length > 0 ? (totalYears / skills.length).toFixed(1) : '0'
    };
  }, [skills]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-8">
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-3xl blur-3xl opacity-30"></div>
          <div className="relative bg-gradient-to-br from-white to-blue-50/50 rounded-2xl p-8 border border-blue-100 shadow-soft">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-4 shadow-glow-accent animate-float">
                  <BookOpen className="size-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 mb-1">내 기술 스택</h1>
                  <p className="text-lg text-slate-600">
                    보유한 기술을 관리하고 새로운 기술을 추가하세요
                  </p>
                </div>
              </div>
              <Link to="/skills/new">
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-glow-accent btn-glow h-12 px-6">
                  <Plus className="size-5 mr-2" />
                  기술 추가
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="glass-card border-tech shadow-tech">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="기술명으로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-secondary/50"
                />
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-foreground font-semibold flex items-center gap-2 text-sm">
                    <Filter className="size-4 text-primary" />
                    카테고리
                  </label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">전체</SelectItem>
                      <SelectItem value="LANGUAGE">언어</SelectItem>
                      <SelectItem value="FRAMEWORK">프레임워크</SelectItem>
                      <SelectItem value="DATABASE">데이터베이스</SelectItem>
                      <SelectItem value="DEVOPS">DevOps</SelectItem>
                      <SelectItem value="PLATFORM">플랫폼</SelectItem>
                      <SelectItem value="TOOL">도구</SelectItem>
                      <SelectItem value="LIBRARY">라이브러리</SelectItem>
                      <SelectItem value="API">API</SelectItem>
                      <SelectItem value="CONCEPT">개념</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-foreground font-semibold flex items-center gap-2 text-sm">
                    <Award className="size-4 text-primary" />
                    레벨
                  </label>
                  <Select value={levelFilter} onValueChange={setLevelFilter}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">전체</SelectItem>
                      <SelectItem value="BEGINNER">입문</SelectItem>
                      <SelectItem value="INTERMEDIATE">중급</SelectItem>
                      <SelectItem value="ADVANCED">고급</SelectItem>
                      <SelectItem value="EXPERT">전문가</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end col-span-1 sm:col-span-2 lg:col-span-2">
                  <Button 
                    variant="outline" 
                    className="w-full h-10 hover:bg-blue-50 hover:border-blue-300 relative z-10"
                    onClick={() => {
                      setSearchQuery('');
                      setCategoryFilter('ALL');
                      setLevelFilter('ALL');
                    }}
                  >
                    필터 초기화
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="text-muted-foreground font-medium">
          {filteredSkills.length}개의 기술
        </div>

        {/* Skills List */}
        <div className="space-y-4">
          {filteredSkills.length === 0 ? (
            <Card className="border-0 shadow-soft">
              <CardContent className="py-16 text-center">
                <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <BookOpen className="size-12 text-blue-600" />
                </div>
                <p className="text-lg text-slate-600 mb-4">
                  {skills.length === 0 ? '등록된 기술이 없습니다.' : '조건에 맞는 기술이 없습니다.'}
                </p>
                <Link to="/skills/new">
                  <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-glow-accent btn-glow">
                    <Plus className="size-5 mr-2" />
                    첫 기술 추가하기
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            filteredSkills.map((skill) => (
              <Card key={skill.id} className="card-hover border-0 shadow-soft bg-gradient-to-r from-white to-blue-50/30 group">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-3 shadow-lg">
                          <Database className="size-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <Link 
                              to={`/technologies/${encodeURIComponent(skill.technologyName)}`}
                              className="text-xl font-bold text-slate-900 hover:text-primary transition-colors"
                            >
                              {skill.displayName}
                            </Link>
                            <Badge className={`${levelColors[skill.level]} px-3 py-1 font-medium shadow-sm`}>
                              {levelLabels[skill.level] || skill.level}
                            </Badge>
                            {skill.category && (
                              <Badge variant="outline" className={`${categoryColors[skill.category]} px-3 py-1 font-medium`}>
                                {skill.category}
                              </Badge>
                            )}
                          </div>
                          {skill.note && (
                            <p className="text-slate-600 leading-relaxed">{skill.note}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
                          <Award className="size-4 text-blue-600" />
                          <span className="text-sm text-slate-600">경력: {skill.yearsOfUse}년</span>
                        </div>
                        {skill.lastUsedAt && (
                          <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
                            <Calendar className="size-4 text-cyan-600" />
                            <span className="text-sm text-slate-600">최근: {skill.lastUsedAt}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex md:flex-col gap-2">
                      {/* Quick Actions */}
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              onClick={() => navigate(`/explore?tech=${skill.technologyName}`)}
                            >
                              <MapIcon className="size-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>로드맵 탐색</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              onClick={() => navigate(`/explore?tab=gap&known=${skill.technologyName}`)}
                            >
                              <GitCompare className="size-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>갭 분석에 활용</TooltipContent>
                        </Tooltip>
                      </div>

                      <Button variant="outline" className="flex-1 md:flex-initial w-full h-10 hover:bg-blue-50 hover:border-blue-300" asChild>
                        <Link to={`/skills/${skill.id}/edit`}>
                          <Edit className="size-4 mr-2" />
                          수정
                        </Link>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1 md:flex-initial h-10 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300"
                        onClick={() => handleDelete(skill.id)}
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

        {/* Stats */}
        {skills.length > 0 && (
          <Card className="border-0 shadow-soft bg-gradient-to-br from-slate-50 to-slate-100">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                <div className="p-4 bg-white rounded-xl shadow-sm">
                  <p className="text-3xl font-bold text-slate-900 mb-1">{stats.total}</p>
                  <p className="text-sm text-slate-600 font-medium">총 기술</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl shadow-sm border border-orange-200">
                  <p className="text-3xl font-bold text-orange-700 mb-1">
                    {stats.levelCount.EXPERT}
                  </p>
                  <p className="text-sm text-orange-700 font-medium">전문가</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-sm border border-purple-200">
                  <p className="text-3xl font-bold text-purple-700 mb-1">
                    {stats.levelCount.ADVANCED}
                  </p>
                  <p className="text-sm text-purple-700 font-medium">고급</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl shadow-sm border border-blue-200">
                  <p className="text-3xl font-bold text-blue-700 mb-1">
                    {stats.levelCount.INTERMEDIATE}
                  </p>
                  <p className="text-sm text-blue-700 font-medium">중급</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-sm border border-green-200">
                  <p className="text-3xl font-bold text-green-700 mb-1">
                    {stats.avgYears}년
                  </p>
                  <p className="text-sm text-green-700 font-medium">평균 경력</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  );
}
