import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { ScrollArea } from '../../components/ui/scroll-area';
import { 
  Database, 
  Search, 
  ExternalLink, 
  Loader2, 
  AlertTriangle,
  LayoutGrid,
  List,
  TrendingUp,
  Briefcase,
  Clock,
  Star,
  StarOff,
  Map,
  GitCompare,
  X,
  ChevronRight,
  Sparkles,
  BookOpen,
  ArrowUpDown
} from 'lucide-react';
import { technologiesApi } from '../../src/lib/api/technologies';
import { toast } from 'sonner';
import { cn } from '../../components/ui/utils';

const categoryColors: Record<string, string> = {
  LANGUAGE: 'category-language',
  FRAMEWORK: 'category-framework',
  DATABASE: 'category-database',
  DEVOPS: 'category-devops',
  PLATFORM: 'category-platform',
  API: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  TOOL: 'category-tool',
  CONCEPT: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  LIBRARY: 'bg-teal-500/10 text-teal-400 border-teal-500/20'
};

const difficultyColors: Record<string, string> = {
  BEGINNER: 'level-beginner',
  INTERMEDIATE: 'level-intermediate',
  ADVANCED: 'level-advanced',
  EXPERT: 'level-expert'
};

const BOOKMARKS_KEY = 'skillweaver_tech_bookmarks';
type SortOption = 'name' | 'popularity' | 'demand' | 'hours' | 'difficulty';

const difficultyOrder: Record<string, number> = {
  BEGINNER: 1,
  INTERMEDIATE: 2,
  ADVANCED: 3,
  EXPERT: 4
};

export function Technologies() {
  const navigate = useNavigate();
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [difficultyFilter, setDifficultyFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [sortDesc, setSortDesc] = useState(false);
  
  // Bookmark states
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  
  // Selected tech for detail panel
  const [selectedTech, setSelectedTech] = useState<any>(null);
  
  // Data states
  const [technologies, setTechnologies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load bookmarks
  useEffect(() => {
    const saved = localStorage.getItem(BOOKMARKS_KEY);
    if (saved) {
      setBookmarks(new Set(JSON.parse(saved)));
    }
  }, []);

  // Toggle bookmark
  const toggleBookmark = (name: string, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
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

  // Load technologies
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
        }
      } catch (err) {
        console.error('기술 목록 조회 실패:', err);
        setError('기술 목록을 불러오는 데 실패했습니다.');
        toast.error('기술 목록을 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadTechnologies();
  }, []);

  // Filtered technologies
  const filteredTechnologies = useMemo(() => {
    let result = technologies.filter(tech => {
      const matchesSearch = tech.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           tech.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           tech.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'ALL' || tech.category === categoryFilter;
      const matchesDifficulty = difficultyFilter === 'ALL' || tech.difficulty === difficultyFilter;
      const matchesBookmark = !showBookmarksOnly || bookmarks.has(tech.name);

      return matchesSearch && matchesCategory && matchesDifficulty && matchesBookmark;
    });

    // Sort
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
  }, [technologies, searchQuery, categoryFilter, difficultyFilter, showBookmarksOnly, bookmarks, sortBy, sortDesc]);

  // Reset filters
  const resetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('ALL');
    setDifficultyFilter('ALL');
    setShowBookmarksOnly(false);
  };

  const activeFilterCount = [
    categoryFilter !== 'ALL',
    difficultyFilter !== 'ALL',
    showBookmarksOnly
  ].filter(Boolean).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="size-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">불러오는 중...</p>
        </div>
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
              <h1 className="text-xl font-bold text-foreground">기술 카탈로그</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {filteredTechnologies.length}개의 기술
              </p>
            </div>
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

                {/* Difficulty */}
                <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                  <SelectTrigger className="h-8 w-[100px] text-xs">
                    <SelectValue placeholder="난이도" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">전체</SelectItem>
                    <SelectItem value="BEGINNER">입문</SelectItem>
                    <SelectItem value="INTERMEDIATE">중급</SelectItem>
                    <SelectItem value="ADVANCED">고급</SelectItem>
                  </SelectContent>
                </Select>

                {/* Sort */}
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                  <SelectTrigger className="h-8 w-[100px] text-xs">
                    <SelectValue placeholder="정렬" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">이름</SelectItem>
                    <SelectItem value="popularity">인기도</SelectItem>
                    <SelectItem value="demand">수요</SelectItem>
                    <SelectItem value="hours">학습시간</SelectItem>
                  </SelectContent>
                </Select>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setSortDesc(!sortDesc)}
                    >
                      <ArrowUpDown className={cn("size-3.5", sortDesc && "rotate-180")} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{sortDesc ? '내림차순' : '오름차순'}</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={showBookmarksOnly ? 'default' : 'outline'}
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
                    >
                      <Star className={cn("size-3.5", showBookmarksOnly && "fill-current")} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>북마크만</TooltipContent>
                </Tooltip>

                {activeFilterCount > 0 && (
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

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-2 mb-4 rounded-md bg-destructive/10 text-destructive text-sm">
              <AlertTriangle className="size-4" />
              {error}
            </div>
          )}

          {/* Tech List */}
          <ScrollArea className="flex-1 -mx-1 px-1">
            <div className="space-y-1">
              {filteredTechnologies.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Database className="size-8 mb-2 opacity-50" />
                  <p className="text-sm">검색 결과가 없습니다</p>
                </div>
              ) : (
                filteredTechnologies.map((tech) => (
                  <button
                    key={tech.name}
                    onClick={() => setSelectedTech(tech)}
                    className={cn(
                      "w-full flex items-center gap-3 p-2.5 rounded-md text-left transition-colors",
                      selectedTech?.name === tech.name
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
                          {tech.displayName}
                        </span>
                        {bookmarks.has(tech.name) && (
                          <Star className="size-3 text-yellow-500 fill-yellow-500 shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge className={cn("badge-compact border", categoryColors[tech.category])}>
                          {tech.category}
                        </Badge>
                        {tech.difficulty && (
                          <Badge className={cn("badge-compact border", difficultyColors[tech.difficulty])}>
                            {tech.difficulty}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="hidden md:flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                      {tech.communityPopularity && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="size-3" />
                              {tech.communityPopularity}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>인기도</TooltipContent>
                        </Tooltip>
                      )}
                      {tech.jobMarketDemand && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="flex items-center gap-1">
                              <Briefcase className="size-3" />
                              {tech.jobMarketDemand}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>취업 수요</TooltipContent>
                        </Tooltip>
                      )}
                      {tech.estimatedLearningHours && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="flex items-center gap-1">
                              <Clock className="size-3" />
                              {tech.estimatedLearningHours}h
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>학습 시간</TooltipContent>
                        </Tooltip>
                      )}
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
          {selectedTech ? (
            <Card className="glass-card h-full flex flex-col">
              <CardHeader className="p-4 pb-3 border-b border-border">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{selectedTech.displayName}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">{selectedTech.name}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => toggleBookmark(selectedTech.name)}
                  >
                    {bookmarks.has(selectedTech.name) ? (
                      <Star className="size-4 text-yellow-500 fill-yellow-500" />
                    ) : (
                      <StarOff className="size-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <ScrollArea className="flex-1">
                <CardContent className="p-4 space-y-4">
                  {/* Description */}
                  {selectedTech.description && (
                    <p className="text-sm text-muted-foreground">{selectedTech.description}</p>
                  )}

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1.5">
                    <Badge className={cn("badge-compact border", categoryColors[selectedTech.category])}>
                      {selectedTech.category}
                    </Badge>
                    {selectedTech.difficulty && (
                      <Badge className={cn("badge-compact border", difficultyColors[selectedTech.difficulty])}>
                        {selectedTech.difficulty}
                      </Badge>
                    )}
                    {selectedTech.ecosystem && (
                      <Badge variant="outline" className="badge-compact">
                        {selectedTech.ecosystem}
                      </Badge>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2">
                    {selectedTech.communityPopularity && (
                      <div className="p-2 rounded-md bg-secondary/50 text-center">
                        <TrendingUp className="size-4 text-orange-500 mx-auto" />
                        <p className="text-lg font-bold mt-1">{selectedTech.communityPopularity}</p>
                        <p className="text-[10px] text-muted-foreground">인기도</p>
                      </div>
                    )}
                    {selectedTech.jobMarketDemand && (
                      <div className="p-2 rounded-md bg-secondary/50 text-center">
                        <Briefcase className="size-4 text-blue-500 mx-auto" />
                        <p className="text-lg font-bold mt-1">{selectedTech.jobMarketDemand}</p>
                        <p className="text-[10px] text-muted-foreground">수요</p>
                      </div>
                    )}
                    {selectedTech.estimatedLearningHours && (
                      <div className="p-2 rounded-md bg-secondary/50 text-center">
                        <Clock className="size-4 text-green-500 mx-auto" />
                        <p className="text-lg font-bold mt-1">{selectedTech.estimatedLearningHours}</p>
                        <p className="text-[10px] text-muted-foreground">시간</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-2">
                    <Link to={`/technologies/${encodeURIComponent(selectedTech.name)}`}>
                      <Button variant="outline" size="sm" className="w-full h-8 text-xs">
                        <BookOpen className="size-3 mr-1.5" />
                        상세 페이지
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full h-8 text-xs"
                      onClick={() => navigate(`/explore?tech=${selectedTech.name}`)}
                    >
                      <Map className="size-3 mr-1.5" />
                      로드맵 탐색
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full h-8 text-xs"
                      onClick={() => navigate(`/explore?tab=gap&target=${selectedTech.name}`)}
                    >
                      <GitCompare className="size-3 mr-1.5" />
                      갭 분석
                    </Button>
                    <Link to={`/learning-plans/new?target=${selectedTech.name}`}>
                      <Button size="sm" className="w-full h-8 text-xs">
                        <Sparkles className="size-3 mr-1.5" />
                        학습 플랜 생성
                      </Button>
                    </Link>
                  </div>

                  {/* Official Site */}
                  {selectedTech.officialSite && (
                    <a
                      href={selectedTech.officialSite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      <ExternalLink className="size-3" />
                      공식 사이트
                    </a>
                  )}
                </CardContent>
              </ScrollArea>
            </Card>
          ) : (
            <Card className="glass-card h-full flex items-center justify-center">
              <div className="text-center text-muted-foreground p-4">
                <Database className="size-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">기술을 선택하세요</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
