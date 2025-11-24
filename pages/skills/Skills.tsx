import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Plus, Edit, Trash2, BookOpen, Calendar } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

// Mock data
const mockSkills = [
  {
    id: '1',
    technologyName: 'Java',
    level: 'ADVANCED',
    category: 'LANGUAGE',
    yearsOfUse: 3,
    lastUsedAt: '2025-11-20',
    note: 'Spring Boot 프로젝트 경험 다수'
  },
  {
    id: '2',
    technologyName: 'Spring Boot',
    level: 'INTERMEDIATE',
    category: 'FRAMEWORK',
    yearsOfUse: 2,
    lastUsedAt: '2025-11-22',
    note: 'REST API 개발 경험'
  },
  {
    id: '3',
    technologyName: 'Docker',
    level: 'BEGINNER',
    category: 'DEVOPS',
    yearsOfUse: 0.5,
    lastUsedAt: '2025-11-15',
    note: '기본 컨테이너 배포 경험'
  },
  {
    id: '4',
    technologyName: 'PostgreSQL',
    level: 'INTERMEDIATE',
    category: 'DATABASE',
    yearsOfUse: 2,
    lastUsedAt: '2025-11-23',
    note: '쿼리 최적화 학습 중'
  },
  {
    id: '5',
    technologyName: 'React',
    level: 'BEGINNER',
    category: 'FRAMEWORK',
    yearsOfUse: 0.3,
    lastUsedAt: '2025-11-10',
    note: '기본 컴포넌트 작성 가능'
  }
];

const levelColors = {
  BEGINNER: 'bg-green-100 text-green-800',
  INTERMEDIATE: 'bg-blue-100 text-blue-800',
  ADVANCED: 'bg-purple-100 text-purple-800',
  EXPERT: 'bg-orange-100 text-orange-800'
};

const categoryColors = {
  LANGUAGE: 'bg-red-50 text-red-700',
  FRAMEWORK: 'bg-blue-50 text-blue-700',
  DATABASE: 'bg-green-50 text-green-700',
  DEVOPS: 'bg-purple-50 text-purple-700',
  TOOL: 'bg-yellow-50 text-yellow-700'
};

export function Skills() {
  const [skills, setSkills] = useState(mockSkills);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [levelFilter, setLevelFilter] = useState('ALL');

  const handleDelete = (skillId: string) => {
    if (confirm('이 기술을 삭제하시겠습니까?')) {
      setSkills(skills.filter(s => s.id !== skillId));
      toast.success('기술이 삭제되었습니다.');
    }
  };

  const filteredSkills = skills.filter(skill => {
    if (categoryFilter !== 'ALL' && skill.category !== categoryFilter) return false;
    if (levelFilter !== 'ALL' && skill.level !== levelFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-gray-900">내 기술 스택</h1>
          <p className="text-gray-600 mt-1">
            보유한 기술을 관리하고 새로운 기술을 추가하세요
          </p>
        </div>
        <Link to="/skills/new">
          <Button>
            <Plus className="size-4 mr-2" />
            기술 추가
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-gray-700">카테고리</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
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
              <label className="text-gray-700">레벨</label>
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger>
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
                className="w-full"
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
      <div className="space-y-3">
        {filteredSkills.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="size-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">조건에 맞는 기술이 없습니다.</p>
              <Link to="/skills/new">
                <Button variant="outline" className="mt-4">
                  <Plus className="size-4 mr-2" />
                  첫 기술 추가하기
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          filteredSkills.map((skill) => (
            <Card key={skill.id}>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 rounded-full p-2">
                        <BookOpen className="size-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-gray-900">{skill.technologyName}</h3>
                          <Badge className={levelColors[skill.level as keyof typeof levelColors]}>
                            {skill.level}
                          </Badge>
                          <Badge variant="outline" className={categoryColors[skill.category as keyof typeof categoryColors]}>
                            {skill.category}
                          </Badge>
                        </div>
                        {skill.note && (
                          <p className="text-gray-600 mt-2">{skill.note}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="size-4" />
                        <span>경력: {skill.yearsOfUse}년</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="size-4" />
                        <span>최근 사용: {skill.lastUsedAt}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex md:flex-col gap-2">
                    <Link to={`/skills/${skill.id}/edit`} className="flex-1 md:flex-initial">
                      <Button variant="outline" size="sm" className="w-full">
                        <Edit className="size-4 mr-2" />
                        수정
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 md:flex-initial text-red-600 hover:text-red-700"
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
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-gray-900">{filteredSkills.length}</p>
                <p className="text-gray-600">총 기술</p>
              </div>
              <div>
                <p className="text-gray-900">
                  {filteredSkills.filter(s => s.level === 'ADVANCED' || s.level === 'EXPERT').length}
                </p>
                <p className="text-gray-600">고급 이상</p>
              </div>
              <div>
                <p className="text-gray-900">
                  {filteredSkills.filter(s => s.level === 'INTERMEDIATE').length}
                </p>
                <p className="text-gray-600">중급</p>
              </div>
              <div>
                <p className="text-gray-900">
                  {filteredSkills.filter(s => s.level === 'BEGINNER').length}
                </p>
                <p className="text-gray-600">입문</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
