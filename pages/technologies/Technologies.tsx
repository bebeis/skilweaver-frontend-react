import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { 
  Database, 
  Search, 
  ExternalLink, 
  Loader2, 
  AlertTriangle,
  LayoutGrid,
  List,
  ArrowUpDown,
  TrendingUp,
  Briefcase,
  Clock,
  Star,
  StarOff,
  Map,
  GitCompare,
  BarChart3,
  Filter,
  X
} from 'lucide-react';
import { technologiesApi } from '../../src/lib/api/technologies';
import { toast } from 'sonner';

// Default technologies (fallback if API fails) - V4 스펙 적용
const defaultTechnologies = [
  {
    name: 'kubernetes',
    displayName: 'Kubernetes',
    category: 'DEVOPS',
    difficulty: 'ADVANCED',
    ecosystem: 'CLOUD_NATIVE',
    description: '컨테이너 오케스트레이션 플랫폼',
    officialSite: 'https://kubernetes.io',
    active: true,
    estimatedLearningHours: 120,
    communityPopularity: 9,
    jobMarketDemand: 10
  },
  {
    name: 'react',
    displayName: 'React',
    category: 'FRAMEWORK',
    difficulty: 'INTERMEDIATE',
    ecosystem: 'FRONTEND',
    description: '사용자 인터페이스 구축을 위한 JavaScript 라이브러리',
    officialSite: 'https://react.dev',
    active: true,
    estimatedLearningHours: 60,
    communityPopularity: 10,
    jobMarketDemand: 10
  },
  {
    name: 'spring-boot',
    displayName: 'Spring Boot',
    category: 'FRAMEWORK',
    difficulty: 'INTERMEDIATE',
    ecosystem: 'JVM',
    description: '스프링 기반 애플리케이션을 쉽게 만들 수 있는 프레임워크',
    officialSite: 'https://spring.io/projects/spring-boot',
    active: true,
    estimatedLearningHours: 80,
    communityPopularity: 9,
    jobMarketDemand: 10
  },
  {
    name: 'postgresql',
    displayName: 'PostgreSQL',
    category: 'DATABASE',
    difficulty: 'INTERMEDIATE',
    ecosystem: 'SQL',
    description: '강력한 오픈소스 관계형 데이터베이스',
    officialSite: 'https://www.postgresql.org',
    active: true,
    estimatedLearningHours: 40,
    communityPopularity: 8,
    jobMarketDemand: 9
  },
  {
    name: 'docker',
    displayName: 'Docker',
    category: 'DEVOPS',
    difficulty: 'INTERMEDIATE',
    ecosystem: 'CONTAINER',
    description: '컨테이너 기반 가상화 플랫폼',
    officialSite: 'https://www.docker.com',
    active: true,
    estimatedLearningHours: 30,
    communityPopularity: 9,
    jobMarketDemand: 9
  },
  {
    name: 'go',
    displayName: 'Go',
    category: 'LANGUAGE',
    difficulty: 'INTERMEDIATE',
    ecosystem: 'GENERAL',
    description: '구글이 개발한 정적 타입 컴파일 언어',
    officialSite: 'https://go.dev',
    active: true,
    estimatedLearningHours: 50,
    communityPopularity: 8,
    jobMarketDemand: 8
  },
  {
    name: 'redis',
    displayName: 'Redis',
    category: 'DATABASE',
    difficulty: 'INTERMEDIATE',
    ecosystem: 'NOSQL',
    description: '인메모리 데이터 구조 저장소',
    officialSite: 'https://redis.io',
    active: true,
    estimatedLearningHours: 20,
    communityPopularity: 8,
    jobMarketDemand: 8
  },
  {
    name: 'typescript',
    displayName: 'TypeScript',
    category: 'LANGUAGE',
    difficulty: 'INTERMEDIATE',
    ecosystem: 'JAVASCRIPT',
    description: 'JavaScript의 타입이 있는 슈퍼셋',
    officialSite: 'https://www.typescriptlang.org',
    active: true,
    estimatedLearningHours: 40,
    communityPopularity: 10,
    jobMarketDemand: 10
  },
  {
    name: 'aws',
    displayName: 'AWS',
    category: 'PLATFORM',
    difficulty: 'ADVANCED',
    ecosystem: 'CLOUD',
    description: '아마존 웹 서비스 클라우드 플랫폼',
    officialSite: 'https://aws.amazon.com',
    active: true,
    estimatedLearningHours: 200,
    communityPopularity: 10,
    jobMarketDemand: 10
  },
  {
    name: 'graphql',
    displayName: 'GraphQL',
    category: 'API',
    difficulty: 'INTERMEDIATE',
    ecosystem: 'WEB',
    description: 'API를 위한 쿼리 언어',
    officialSite: 'https://graphql.org',
    active: true,
    estimatedLearningHours: 30,
    communityPopularity: 7,
    jobMarketDemand: 7
  }
];

const categoryColors: Record<string, string> = {
  LANGUAGE: 'bg-red-50 text-red-700 border-red-200',
  FRAMEWORK: 'bg-blue-50 text-blue-700 border-blue-200',
  DATABASE: 'bg-green-50 text-green-700 border-green-200',
  DEVOPS: 'bg-purple-50 text-purple-700 border-purple-200',
  PLATFORM: 'bg-orange-50 text-orange-700 border-orange-200',
  API: 'bg-pink-50 text-pink-700 border-pink-200',
  TOOL: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  CONCEPT: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  LIBRARY: 'bg-teal-50 text-teal-700 border-teal-200'
};

const difficultyColors: Record<string, string> = {
  BEGINNER: 'bg-green-50 text-green-700 border-green-200',
  INTERMEDIATE: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  ADVANCED: 'bg-orange-50 text-orange-700 border-orange-200',
  EXPERT: 'bg-red-50 text-red-700 border-red-200'
};

const difficultyOrder: Record<string, number> = {
  BEGINNER: 1,
  INTERMEDIATE: 2,
  ADVANCED: 3,
  EXPERT: 4
};

// 북마크 로컬스토리지 키
const BOOKMARKS_KEY = 'skillweaver_tech_bookmarks';

// 정렬 옵션
type SortOption = 'name' | 'popularity' | 'demand' | 'hours' | 'difficulty';

export function Technologies() {
  const navigate = useNavigate();
  
  // 필터 상태
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [ecosystemFilter, setEcosystemFilter] = useState('ALL');
  const [difficultyFilter, setDifficultyFilter] = useState('ALL');
  const [learningHoursFilter, setLearningHoursFilter] = useState('ALL');
  
  // 정렬 및 뷰 상태
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [sortDesc, setSortDesc] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // 북마크 상태
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  
  // 통계 패널 표시
  const [showStats, setShowStats] = useState(false);
  
  // 데이터 상태
  const [technologies, setTechnologies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 북마크 로드
  useEffect(() => {
    const saved = localStorage.getItem(BOOKMARKS_KEY);
    if (saved) {
      setBookmarks(new Set(JSON.parse(saved)));
    }
  }, []);

  // 북마크 저장
  const toggleBookmark = (name: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const newBookmarks = new Set(bookmarks);
    if (newBookmarks.has(name)) {
      newBookmarks.delete(name);
      toast.success('북마크에서 제거했습니다');
    } else {
      newBookmarks.add(name);
      toast.success('북마크에 추가했습니다');
    }
    setBookmarks(newBookmarks);
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify([...newBookmarks]));
  };

  // Load technologies from API
  useEffect(() => {
    const loadTechnologies = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await technologiesApi.getTechnologies({
          limit: 100,
          active: true
        });

        if (response.success && response.data?.technologies) {
          setTechnologies(response.data.technologies);
        } else {
          setError('기술 목록을 불러올 수 없습니다.');
          setTechnologies(defaultTechnologies as any);
        }
      } catch (err) {
        console.error('기술 목록 조회 실패:', err);
        setError('기술 목록을 불러오는 데 실패했습니다.');
        setTechnologies(defaultTechnologies as any);
        toast.error('기술 목록을 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadTechnologies();
  }, []);

  // 필터링된 기술 목록
  const filteredTechnologies = useMemo(() => {
    let result = technologies.filter(tech => {
      const matchesSearch = tech.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           tech.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           tech.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'ALL' || tech.category === categoryFilter;
      const matchesEcosystem = ecosystemFilter === 'ALL' || tech.ecosystem === ecosystemFilter;
      const matchesDifficulty = difficultyFilter === 'ALL' || tech.difficulty === difficultyFilter;
      const matchesBookmark = !showBookmarksOnly || bookmarks.has(tech.name);
      
      // 학습 시간 필터
      let matchesHours = true;
      if (learningHoursFilter !== 'ALL' && tech.estimatedLearningHours) {
        const hours = tech.estimatedLearningHours;
        switch (learningHoursFilter) {
          case 'SHORT': matchesHours = hours <= 30; break;
          case 'MEDIUM': matchesHours = hours > 30 && hours <= 60; break;
          case 'LONG': matchesHours = hours > 60 && hours <= 100; break;
          case 'VERY_LONG': matchesHours = hours > 100; break;
        }
      }

      return matchesSearch && matchesCategory && matchesEcosystem && matchesDifficulty && matchesHours && matchesBookmark;
    });

    // 정렬
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.displayName.localeCompare(b.displayName);
          break;
        case 'popularity':
          comparison = (b.communityPopularity || 0) - (a.communityPopularity || 0);
          break;
        case 'demand':
          comparison = (b.jobMarketDemand || 0) - (a.jobMarketDemand || 0);
          break;
        case 'hours':
          comparison = (a.estimatedLearningHours || 999) - (b.estimatedLearningHours || 999);
          break;
        case 'difficulty':
          comparison = (difficultyOrder[a.difficulty] || 0) - (difficultyOrder[b.difficulty] || 0);
          break;
      }
      return sortDesc ? -comparison : comparison;
    });

    return result;
  }, [technologies, searchQuery, categoryFilter, ecosystemFilter, difficultyFilter, learningHoursFilter, showBookmarksOnly, bookmarks, sortBy, sortDesc]);

  // 통계 계산
  const stats = useMemo(() => {
    const categoryCount: Record<string, number> = {};
    const difficultyCount: Record<string, number> = {};
    let totalHours = 0;
    let hoursCount = 0;
    let avgPopularity = 0;
    let avgDemand = 0;
    let popularityCount = 0;
    let demandCount = 0;

    technologies.forEach(tech => {
      // 카테고리별 집계
      categoryCount[tech.category] = (categoryCount[tech.category] || 0) + 1;
      
      // 난이도별 집계
      if (tech.difficulty) {
        difficultyCount[tech.difficulty] = (difficultyCount[tech.difficulty] || 0) + 1;
      }
      
      // 학습 시간 평균
      if (tech.estimatedLearningHours) {
        totalHours += tech.estimatedLearningHours;
        hoursCount++;
      }
      
      // 인기도/수요 평균
      if (tech.communityPopularity) {
        avgPopularity += tech.communityPopularity;
        popularityCount++;
      }
      if (tech.jobMarketDemand) {
        avgDemand += tech.jobMarketDemand;
        demandCount++;
      }
    });

    return {
      total: technologies.length,
      categoryCount,
      difficultyCount,
      avgHours: hoursCount > 0 ? Math.round(totalHours / hoursCount) : 0,
      avgPopularity: popularityCount > 0 ? (avgPopularity / popularityCount).toFixed(1) : '0',
      avgDemand: demandCount > 0 ? (avgDemand / demandCount).toFixed(1) : '0',
      bookmarkCount: bookmarks.size
    };
  }, [technologies, bookmarks]);

  // 필터 초기화
  const resetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('ALL');
    setEcosystemFilter('ALL');
    setDifficultyFilter('ALL');
    setLearningHoursFilter('ALL');
    setShowBookmarksOnly(false);
  };

  // 활성 필터 개수
  const activeFilterCount = [
    categoryFilter !== 'ALL',
    ecosystemFilter !== 'ALL',
    difficultyFilter !== 'ALL',
    learningHoursFilter !== 'ALL',
    showBookmarksOnly
  ].filter(Boolean).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-muted-foreground">기술 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">기술 카탈로그</h1>
            <p className="text-muted-foreground text-lg font-medium mt-1">
              커뮤니티가 함께 만드는 기술 지식 베이스
            </p>
          </div>
          
          {/* 뷰 모드 & 통계 토글 */}
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={showStats ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setShowStats(!showStats)}
                >
                  <BarChart3 className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>통계 보기</TooltipContent>
            </Tooltip>
            
            <div className="border rounded-lg p-1 flex">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="icon"
                    className="size-8"
                    onClick={() => setViewMode('grid')}
                  >
                    <LayoutGrid className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>그리드 뷰</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="icon"
                    className="size-8"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>리스트 뷰</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* 통계 패널 */}
        {showStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
              <CardContent className="pt-4 pb-4">
                <div className="text-2xl font-bold text-primary">{stats.total}</div>
                <div className="text-sm text-muted-foreground">전체 기술</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5">
              <CardContent className="pt-4 pb-4">
                <div className="text-2xl font-bold text-yellow-600">{stats.bookmarkCount}</div>
                <div className="text-sm text-muted-foreground">북마크</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
              <CardContent className="pt-4 pb-4">
                <div className="text-2xl font-bold text-blue-600">{stats.avgHours}h</div>
                <div className="text-sm text-muted-foreground">평균 학습 시간</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
              <CardContent className="pt-4 pb-4">
                <div className="text-2xl font-bold text-green-600">{stats.avgPopularity}</div>
                <div className="text-sm text-muted-foreground">평균 인기도</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5">
              <CardContent className="pt-4 pb-4">
                <div className="text-2xl font-bold text-purple-600">{stats.avgDemand}</div>
                <div className="text-sm text-muted-foreground">평균 수요</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5">
              <CardContent className="pt-4 pb-4">
                <div className="text-2xl font-bold text-orange-600">
                  {Object.keys(stats.categoryCount).length}
                </div>
                <div className="text-sm text-muted-foreground">카테고리</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <Card className="border-destructive bg-destructive/10">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="size-5 text-destructive mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-destructive font-medium">{error}</p>
                  <p className="text-sm text-destructive/70 mt-1">기본 데이터를 표시하고 있습니다.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="기술명, 설명으로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-secondary/50"
                />
              </div>

              {/* Filters Row 1 */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="space-y-2">
                  <label className="text-foreground font-semibold text-sm">카테고리</label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">전체</SelectItem>
                      <SelectItem value="LANGUAGE">언어</SelectItem>
                      <SelectItem value="FRAMEWORK">프레임워크</SelectItem>
                      <SelectItem value="DATABASE">데이터베이스</SelectItem>
                      <SelectItem value="DEVOPS">DevOps</SelectItem>
                      <SelectItem value="PLATFORM">플랫폼</SelectItem>
                      <SelectItem value="API">API</SelectItem>
                      <SelectItem value="TOOL">도구</SelectItem>
                      <SelectItem value="CONCEPT">개념</SelectItem>
                      <SelectItem value="LIBRARY">라이브러리</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-foreground font-semibold text-sm">에코시스템</label>
                  <Select value={ecosystemFilter} onValueChange={setEcosystemFilter}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">전체</SelectItem>
                      <SelectItem value="JVM">JVM</SelectItem>
                      <SelectItem value="JAVASCRIPT">JavaScript</SelectItem>
                      <SelectItem value="FRONTEND">Frontend</SelectItem>
                      <SelectItem value="CLOUD_NATIVE">Cloud Native</SelectItem>
                      <SelectItem value="CLOUD">Cloud</SelectItem>
                      <SelectItem value="SQL">SQL</SelectItem>
                      <SelectItem value="NOSQL">NoSQL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-foreground font-semibold text-sm">난이도</label>
                  <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                    <SelectTrigger className="h-9">
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

                <div className="space-y-2">
                  <label className="text-foreground font-semibold text-sm">학습 시간</label>
                  <Select value={learningHoursFilter} onValueChange={setLearningHoursFilter}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">전체</SelectItem>
                      <SelectItem value="SHORT">~30시간 (단기)</SelectItem>
                      <SelectItem value="MEDIUM">30~60시간 (중기)</SelectItem>
                      <SelectItem value="LONG">60~100시간 (장기)</SelectItem>
                      <SelectItem value="VERY_LONG">100시간+ (심화)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-foreground font-semibold text-sm">정렬</label>
                  <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">이름순</SelectItem>
                      <SelectItem value="popularity">인기도순</SelectItem>
                      <SelectItem value="demand">수요순</SelectItem>
                      <SelectItem value="hours">학습시간순</SelectItem>
                      <SelectItem value="difficulty">난이도순</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-foreground font-semibold text-sm">&nbsp;</label>
                  <div className="flex gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9"
                          onClick={() => setSortDesc(!sortDesc)}
                        >
                          <ArrowUpDown className={`size-4 ${sortDesc ? 'rotate-180' : ''} transition-transform`} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{sortDesc ? '내림차순' : '오름차순'}</TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={showBookmarksOnly ? 'default' : 'outline'}
                          size="icon"
                          className="h-9 w-9"
                          onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
                        >
                          <Star className={`size-4 ${showBookmarksOnly ? 'fill-current' : ''}`} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>북마크만 보기</TooltipContent>
                    </Tooltip>

                    {activeFilterCount > 0 && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 gap-1"
                            onClick={resetFilters}
                          >
                            <X className="size-3" />
                            <span className="text-xs">{activeFilterCount}</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>필터 초기화</TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground font-medium">
            {filteredTechnologies.length}개의 기술
            {showBookmarksOnly && ' (북마크)'}
          </div>
        </div>

        {/* Technologies Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTechnologies.length === 0 ? (
              <div className="col-span-full">
                <Card className="glass-card border-tech">
                  <CardContent className="py-12 text-center">
                    <Database className="size-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground font-medium">
                      {showBookmarksOnly ? '북마크된 기술이 없습니다.' : '검색 결과가 없습니다.'}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              filteredTechnologies.map((tech) => (
                <Link key={tech.name} to={`/technologies/${encodeURIComponent(tech.name)}`}>
                  <Card className="h-full glass-card border-tech card-hover-float cursor-pointer group">
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        {/* Header with Bookmark */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="bg-primary/20 rounded-lg p-2 border border-primary/30">
                              <Database className="size-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-foreground font-bold">{tech.displayName}</h3>
                              <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
                                {tech.description}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => toggleBookmark(tech.name, e)}
                          >
                            {bookmarks.has(tech.name) ? (
                              <Star className="size-4 fill-yellow-500 text-yellow-500" />
                            ) : (
                              <StarOff className="size-4" />
                            )}
                          </Button>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-1.5">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${categoryColors[tech.category] || 'bg-gray-50'}`}
                          >
                            {tech.category}
                          </Badge>
                          {tech.difficulty && (
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${difficultyColors[tech.difficulty]}`}
                            >
                              {tech.difficulty}
                            </Badge>
                          )}
                        </div>

                        {/* Stats */}
                        {(tech.communityPopularity || tech.jobMarketDemand || tech.estimatedLearningHours) && (
                          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/50">
                            {tech.communityPopularity && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <TrendingUp className="size-3" />
                                    <span>{tech.communityPopularity}/10</span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>커뮤니티 인기도</TooltipContent>
                              </Tooltip>
                            )}
                            {tech.jobMarketDemand && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Briefcase className="size-3" />
                                    <span>{tech.jobMarketDemand}/10</span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>취업 시장 수요</TooltipContent>
                              </Tooltip>
                            )}
                            {tech.estimatedLearningHours && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock className="size-3" />
                                    <span>{tech.estimatedLearningHours}h</span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>예상 학습 시간</TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        )}

                        {/* Quick Actions */}
                        <div className="flex gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 h-7 text-xs"
                                onClick={(e) => {
                                  e.preventDefault();
                                  navigate(`/explore?tech=${tech.name}`);
                                }}
                              >
                                <Map className="size-3 mr-1" />
                                로드맵
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>로드맵 탐색</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 h-7 text-xs"
                                onClick={(e) => {
                                  e.preventDefault();
                                  navigate(`/explore?tab=gap&target=${tech.name}`);
                                }}
                              >
                                <GitCompare className="size-3 mr-1" />
                                갭 분석
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>갭 분석</TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        ) : (
          /* List View */
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredTechnologies.length === 0 ? (
                  <div className="py-12 text-center">
                    <Database className="size-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground font-medium">
                      {showBookmarksOnly ? '북마크된 기술이 없습니다.' : '검색 결과가 없습니다.'}
                    </p>
                  </div>
                ) : (
                  filteredTechnologies.map((tech) => (
                    <Link
                      key={tech.name}
                      to={`/technologies/${encodeURIComponent(tech.name)}`}
                      className="flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors group"
                    >
                      <div className="bg-primary/20 rounded-lg p-2 border border-primary/30">
                        <Database className="size-5 text-primary" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-foreground font-semibold">{tech.displayName}</h3>
                          <Badge variant="outline" className={`text-xs ${categoryColors[tech.category] || 'bg-gray-50'}`}>
                            {tech.category}
                          </Badge>
                          {tech.difficulty && (
                            <Badge variant="outline" className={`text-xs ${difficultyColors[tech.difficulty]}`}>
                              {tech.difficulty}
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground text-sm mt-1 line-clamp-1">
                          {tech.description}
                        </p>
                      </div>

                      {/* Stats in List View */}
                      <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
                        {tech.communityPopularity && (
                          <div className="flex items-center gap-1">
                            <TrendingUp className="size-4" />
                            <span>{tech.communityPopularity}/10</span>
                          </div>
                        )}
                        {tech.jobMarketDemand && (
                          <div className="flex items-center gap-1">
                            <Briefcase className="size-4" />
                            <span>{tech.jobMarketDemand}/10</span>
                          </div>
                        )}
                        {tech.estimatedLearningHours && (
                          <div className="flex items-center gap-1">
                            <Clock className="size-4" />
                            <span>{tech.estimatedLearningHours}h</span>
                          </div>
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={(e) => toggleBookmark(tech.name, e)}
                      >
                        {bookmarks.has(tech.name) ? (
                          <Star className="size-4 fill-yellow-500 text-yellow-500" />
                        ) : (
                          <StarOff className="size-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </Button>
                    </Link>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  );
}
