import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Plus, Edit, Trash2, BookOpen, Calendar, Sparkles, Filter, ArrowRight, Award, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { skillsApi } from '../../src/lib/api';
import { useAuth } from '../../hooks/useAuth';

interface Skill {
  id: string;
  technologyName: string;
  level: string;
  category: string;
  yearsOfUse: number;
  lastUsedAt?: string;
  note?: string;
}

const levelColors = {
  BEGINNER: 'bg-green-100 text-green-800',
  INTERMEDIATE: 'bg-blue-100 text-blue-800',
  ADVANCED: 'bg-purple-100 text-purple-800',
  EXPERT: 'bg-orange-100 text-orange-800'
};

const categoryColors = {
  LANGUAGE: 'bg-red-50 text-red-700',
  FRAMEWORK: 'bg-blue-50 text-blue-700',
  LIBRARY: 'bg-teal-50 text-teal-700',
  TOOL: 'bg-yellow-50 text-yellow-700',
  DB: 'bg-green-50 text-green-700',
  PLATFORM: 'bg-purple-50 text-purple-700',
  ETC: 'bg-gray-50 text-gray-700'
};

export function Skills() {
  const { user } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [levelFilter, setLevelFilter] = useState('ALL');

  // Load skills from API
  useEffect(() => {
    if (!user) return;
    
    const loadSkills = async () => {
      try {
        setLoading(true);
        const response = await skillsApi.getSkills(Number(user.id), {
          category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
          level: levelFilter !== 'ALL' ? levelFilter : undefined,
        });
        
        if (response.success) {
          const mappedSkills: Skill[] = response.data.skills.map((s: any) => ({
            id: String(s.memberSkillId),
            technologyName: s.displayName || s.customName || 'Unknown',
            level: s.level,
            category: 'ETC', // API doesn't return category, so we'll use ETC as default
            yearsOfUse: s.yearsOfUse,
            lastUsedAt: s.lastUsedAt,
            note: s.note,
          }));
          setSkills(mappedSkills);
        }
      } catch (error: any) {
        toast.error(error.message || '기술 스택을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    loadSkills();
  }, [user, categoryFilter, levelFilter]);

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

  const filteredSkills = skills.filter(skill => {
    if (categoryFilter !== 'ALL' && skill.category !== categoryFilter) return false;
    if (levelFilter !== 'ALL' && skill.level !== levelFilter) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
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

      {/* Filters */}
      <Card className="glass-card border-tech shadow-tech">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-foreground font-semibold flex items-center gap-2">
                <Filter className="size-4 text-primary" />
                카테고리
              </label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">전체</SelectItem>
                  <SelectItem value="LANGUAGE">언어</SelectItem>
                  <SelectItem value="FRAMEWORK">프레임워크</SelectItem>
                  <SelectItem value="DATABASE">데이터베이스</SelectItem>
                  <SelectItem value="DEVOPS">DevOps</SelectItem>
                  <SelectItem value="TOOL">도구</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-foreground font-semibold flex items-center gap-2">
                <Award className="size-4 text-primary" />
                레벨
              </label>
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="h-11">
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

            <div className="flex items-end">
              <Button 
                variant="outline" 
                className="w-full h-11 hover:bg-blue-50 hover:border-blue-300 relative z-10"
                onClick={() => {
                  setCategoryFilter('ALL');
                  setLevelFilter('ALL');
                }}
              >
                필터 초기화
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills List */}
      <div className="space-y-4">
        {filteredSkills.length === 0 ? (
          <Card className="border-0 shadow-soft">
            <CardContent className="py-16 text-center">
              <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <BookOpen className="size-12 text-blue-600" />
              </div>
              <p className="text-lg text-slate-600 mb-4">조건에 맞는 기술이 없습니다.</p>
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
            <Card key={skill.id} className="card-hover border-0 shadow-soft bg-gradient-to-r from-white to-blue-50/30">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-3 shadow-lg">
                        <BookOpen className="size-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <h3 className="text-xl font-bold text-slate-900">{skill.technologyName}</h3>
                          <Badge className={levelColors[skill.level as keyof typeof levelColors] + ' px-3 py-1 font-medium shadow-sm'}>
                            {skill.level}
                          </Badge>
                          <Badge variant="outline" className={categoryColors[skill.category as keyof typeof categoryColors] + ' px-3 py-1 font-medium'}>
                            {skill.category}
                          </Badge>
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
                      <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
                        <Calendar className="size-4 text-cyan-600" />
                        <span className="text-sm text-slate-600">최근: {skill.lastUsedAt}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex md:flex-col gap-2">
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
      {filteredSkills.length > 0 && (
        <Card className="border-0 shadow-soft bg-gradient-to-br from-slate-50 to-slate-100">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="p-4 bg-white rounded-xl shadow-sm">
                <p className="text-4xl font-bold text-slate-900 mb-1">{filteredSkills.length}</p>
                <p className="text-slate-600 font-medium">총 기술</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-sm border border-purple-200">
                <p className="text-4xl font-bold text-purple-700 mb-1">
                  {filteredSkills.filter(s => s.level === 'ADVANCED' || s.level === 'EXPERT').length}
                </p>
                <p className="text-purple-700 font-medium">고급 이상</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl shadow-sm border border-blue-200">
                <p className="text-4xl font-bold text-blue-700 mb-1">
                  {filteredSkills.filter(s => s.level === 'INTERMEDIATE').length}
                </p>
                <p className="text-blue-700 font-medium">중급</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-sm border border-green-200">
                <p className="text-4xl font-bold text-green-700 mb-1">
                  {filteredSkills.filter(s => s.level === 'BEGINNER').length}
                </p>
                <p className="text-green-700 font-medium">입문</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
