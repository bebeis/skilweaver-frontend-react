import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import {
  Database,
  ExternalLink,
  BookOpen,
  Lightbulb,
  CheckCircle2,
  ArrowRight,
  GitBranch,
  ArrowLeft,
  GraduationCap,
  Edit,
  Loader2,
  Clock,
  TrendingUp,
  Briefcase,
  Users,
  Map,
  Link as LinkIcon,
  Share2,
  Star,
  StarOff,
  GitCompare,
  Check,
  StickyNote,
  Save,
  Trash2,
  MoreHorizontal,
  ChevronRight,
  Search
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../../components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';
import { Progress } from '../../components/ui/progress';
import { toast } from 'sonner';
import { technologiesApi } from '../../src/lib/api';
import { cn } from '../../components/ui/utils';

const BOOKMARKS_KEY = 'skillweaver_tech_bookmarks';
const MEMO_KEY_PREFIX = 'skillweaver_memo_';

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

const difficultyColors: Record<string, string> = {
  BEGINNER: 'level-beginner',
  INTERMEDIATE: 'level-intermediate',
  ADVANCED: 'level-advanced',
  EXPERT: 'level-expert'
};

// Compare Dialog Component
function CompareDialog({ 
  open, 
  onOpenChange, 
  currentTech 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  currentTech: any;
}) {
  const [targetTech, setTargetTech] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    if (search.length > 1) {
      const searchTech = async () => {
        try {
          const response = await technologiesApi.getTechnologies({ limit: 100 });
          if (response.success && response.data?.technologies) {
            const results = response.data.technologies.filter((t: any) => 
              t.name !== currentTech.name && 
              (t.displayName.toLowerCase().includes(search.toLowerCase()) || 
               t.name.toLowerCase().includes(search.toLowerCase()))
            );
            setSearchResults(results.slice(0, 5));
          }
        } catch (error) {
          console.error(error);
        }
      };
      const timer = setTimeout(searchTech, 300);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [search, currentTech]);

  const handleSelect = async (techName: string) => {
    try {
      setLoading(true);
      const response = await technologiesApi.getTechnology(techName);
      if (response.success) {
        setTargetTech(response.data);
      }
    } catch (error) {
      toast.error('비교 대상을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>기술 비교</DialogTitle>
        </DialogHeader>
        
        {!targetTech ? (
          <div className="space-y-4 py-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input 
                placeholder="비교할 기술 검색..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="space-y-1">
              {searchResults.map((tech) => (
                <button
                  key={tech.name}
                  onClick={() => handleSelect(tech.name)}
                  className="w-full flex items-center justify-between p-2 rounded hover:bg-secondary/50 transition-colors text-left"
                >
                  <span className="font-medium">{tech.displayName}</span>
                  <Badge variant="outline" className="text-xs">{tech.category}</Badge>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 py-4">
            {/* Current Tech */}
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base text-primary">{currentTech.displayName}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                <div className="text-sm">
                  <span className="text-muted-foreground block text-xs">카테고리</span>
                  {currentTech.category}
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground block text-xs">난이도</span>
                  {currentTech.difficulty || '-'}
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs mb-1">인기도</span>
                  <Progress value={(currentTech.communityPopularity || 0) * 10} className="h-1.5" />
                  <span className="text-xs font-bold">{currentTech.communityPopularity}/10</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs mb-1">수요</span>
                  <Progress value={(currentTech.jobMarketDemand || 0) * 10} className="h-1.5" />
                  <span className="text-xs font-bold">{currentTech.jobMarketDemand}/10</span>
                </div>
              </CardContent>
            </Card>

            {/* Target Tech */}
            <Card className="bg-secondary/30">
              <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">{targetTech.displayName}</CardTitle>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setTargetTech(null)}>
                  <Trash2 className="size-3" />
                </Button>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                <div className="text-sm">
                  <span className="text-muted-foreground block text-xs">카테고리</span>
                  {targetTech.category}
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground block text-xs">난이도</span>
                  {targetTech.difficulty || '-'}
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs mb-1">인기도</span>
                  <Progress value={(targetTech.communityPopularity || 0) * 10} className="h-1.5" />
                  <span className="text-xs font-bold">{targetTech.communityPopularity}/10</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs mb-1">수요</span>
                  <Progress value={(targetTech.jobMarketDemand || 0) * 10} className="h-1.5" />
                  <span className="text-xs font-bold">{targetTech.jobMarketDemand}/10</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function TechnologyDetail() {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [technology, setTechnology] = useState<any>(null);
  
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Memo state
  const [memo, setMemo] = useState('');
  const [isMemoOpen, setIsMemoOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);

  // Load bookmark & memo
  useEffect(() => {
    if (!name) return;
    const techName = decodeURIComponent(name);
    
    // Bookmark
    const savedBookmarks = localStorage.getItem(BOOKMARKS_KEY);
    if (savedBookmarks) {
      const bookmarks = new Set(JSON.parse(savedBookmarks));
      setIsBookmarked(bookmarks.has(techName));
    }

    // Memo
    const savedMemo = localStorage.getItem(`${MEMO_KEY_PREFIX}${techName}`);
    if (savedMemo) setMemo(savedMemo);
  }, [name]);

  const toggleBookmark = () => {
    if (!name) return;
    const techName = decodeURIComponent(name);
    const saved = localStorage.getItem(BOOKMARKS_KEY);
    const bookmarks = new Set(saved ? JSON.parse(saved) : []);
    
    if (bookmarks.has(techName)) {
      bookmarks.delete(techName);
      setIsBookmarked(false);
      toast.success('북마크 해제');
    } else {
      bookmarks.add(techName);
      setIsBookmarked(true);
      toast.success('북마크 추가');
    }
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify([...bookmarks]));
  };

  const saveMemo = () => {
    if (!name) return;
    const techName = decodeURIComponent(name);
    localStorage.setItem(`${MEMO_KEY_PREFIX}${techName}`, memo);
    toast.success('메모 저장됨');
    setIsMemoOpen(false);
  };

  // Load technology
  useEffect(() => {
    if (!name) return;
    
    const loadTechnology = async () => {
      try {
        setLoading(true);
        const response = await technologiesApi.getTechnology(decodeURIComponent(name));
        
        if (response.success) {
          setTechnology(response.data);
        }
      } catch (error: any) {
        toast.error('기술 정보를 불러오는데 실패했습니다.');
        navigate('/technologies');
      } finally {
        setLoading(false);
      }
    };
    
    loadTechnology();
  }, [name, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!technology) return null;

  return (
    <TooltipProvider>
      <div className="flex h-[calc(100vh-8rem)] gap-6">
        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header - Compact */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground" onClick={() => navigate('/technologies')}>
                <ArrowLeft className="size-4 mr-1" />
                목록
              </Button>
              <div className="h-4 w-px bg-border/50 mx-1" />
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-primary/10">
                  <Database className="size-4 text-primary" />
                </div>
                <h1 className="text-lg font-bold text-foreground">{technology.displayName}</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={toggleBookmark}
              >
                {isBookmarked ? (
                  <Star className="size-4 text-yellow-500 fill-yellow-500" />
                ) : (
                  <StarOff className="size-4 text-muted-foreground" />
                )}
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setCompareOpen(true)}>
                    <GitCompare className="size-4 mr-2" />
                    비교하기
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsMemoOpen(true)}>
                    <StickyNote className="size-4 mr-2" />
                    메모 작성
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate(`/learning-plans/new?target=${technology.name}`)}>
                    <GraduationCap className="size-4 mr-2" />
                    학습 플랜 생성
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Memo Alert */}
          {isMemoOpen && (
            <Card className="glass-card mb-4 border-l-4 border-l-accent animate-slide-up">
              <CardContent className="p-3">
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-xs font-semibold text-muted-foreground">내 메모</Label>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setIsMemoOpen(false)} className="h-6 w-6 p-0">
                      <Trash2 className="size-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={saveMemo} className="h-6 text-xs gap-1">
                      <Save className="size-3" /> 저장
                    </Button>
                  </div>
                </div>
                <Textarea 
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="메모를 입력하세요..."
                  className="bg-secondary/30 min-h-[80px] text-sm resize-none"
                />
              </CardContent>
            </Card>
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
            <TabsList className="w-full justify-start h-10 p-1 bg-secondary/30 rounded-lg mb-4 shrink-0">
              <TabsTrigger value="overview" className="h-8 px-4 text-xs">개요</TabsTrigger>
              <TabsTrigger value="resources" className="h-8 px-4 text-xs">학습 자료</TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1 -mx-4 px-4">
              <div className="pb-6">
                <TabsContent value="overview" className="mt-0 space-y-4">
                  {/* Description */}
                  <Card className="glass-card">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <BookOpen className="size-4 text-primary" />
                        소개
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                        {technology.description || '상세 설명이 없습니다.'}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Use Cases & Tips Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {technology.useCases && technology.useCases.length > 0 && (
                      <Card className="glass-card">
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <GitBranch className="size-4 text-success" />
                            활용 사례
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <ul className="grid gap-2">
                            {technology.useCases.map((useCase: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                                <CheckCircle2 className="size-3.5 text-success mt-0.5 shrink-0" />
                                {useCase}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}

                    {technology.learningTips && (
                      <Card className="glass-card bg-accent/5 border-accent/20">
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-sm font-medium flex items-center gap-2 text-accent">
                            <Lightbulb className="size-4" />
                            학습 팁
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <p className="text-xs text-muted-foreground/90 leading-relaxed">
                            {technology.learningTips}
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Prerequisites */}
                  {(technology.prerequisites?.required?.length > 0 || technology.prerequisites?.recommended?.length > 0) && (
                    <Card className="glass-card">
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium">선행 학습</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="space-y-2">
                          {technology.prerequisites.required?.map((req: any) => (
                            <div key={req.name} className="flex items-center justify-between text-xs p-2 rounded bg-secondary/30">
                              <Link 
                                to={`/technologies/${encodeURIComponent(req.name)}`}
                                className="font-medium hover:text-primary transition-colors"
                              >
                                {req.displayName}
                              </Link>
                              <Badge variant="destructive" className="badge-compact">필수</Badge>
                            </div>
                          ))}
                          {technology.prerequisites.recommended?.map((rec: any) => (
                            <div key={rec.name} className="flex items-center justify-between text-xs p-2 rounded bg-secondary/30">
                              <Link 
                                to={`/technologies/${encodeURIComponent(rec.name)}`}
                                className="font-medium hover:text-primary transition-colors"
                              >
                                {rec.displayName}
                              </Link>
                              <Badge variant="secondary" className="badge-compact">권장</Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="resources" className="mt-0">
                  <Card className="glass-card">
                    <CardContent className="py-12 text-center text-muted-foreground">
                      <BookOpen className="size-10 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">준비된 학습 자료가 없습니다.</p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </ScrollArea>
          </Tabs>
        </div>

        {/* Right Sidebar - Metadata */}
        <div className="w-72 shrink-0 space-y-4">
          <Card className="glass-card">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium">정보</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4">
              {/* Badges */}
              <div className="flex flex-wrap gap-1.5">
                <Badge className={cn("badge-compact border", categoryColors[technology.category])}>
                  {technology.category}
                </Badge>
                {technology.difficulty && (
                  <Badge className={cn("badge-compact border", difficultyColors[technology.difficulty])}>
                    {technology.difficulty}
                  </Badge>
                )}
                {technology.ecosystem && (
                  <Badge variant="outline" className="badge-compact">
                    {technology.ecosystem}
                  </Badge>
                )}
              </div>

              {/* Stats */}
              <div className="space-y-3 pt-2 border-t border-border/50">
                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Users className="size-3" /> 커뮤니티
                    </span>
                    <span className="text-xs font-bold">{technology.communityPopularity}/10</span>
                  </div>
                  <Progress value={(technology.communityPopularity || 0) * 10} className="h-1" />
                </div>
                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Briefcase className="size-3" /> 수요
                    </span>
                    <span className="text-xs font-bold">{technology.jobMarketDemand}/10</span>
                  </div>
                  <Progress value={(technology.jobMarketDemand || 0) * 10} className="h-1" />
                </div>
                {technology.estimatedLearningHours && (
                  <div className="pt-2 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="size-3" /> 시간
                    </span>
                    <span className="font-bold">{technology.estimatedLearningHours}h</span>
                  </div>
                )}
              </div>

              {/* Official Site */}
              {technology.officialSite && (
                <a
                  href={technology.officialSite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors pt-2 border-t border-border/50"
                >
                  <ExternalLink className="size-3" />
                  공식 웹사이트 방문
                </a>
              )}
            </CardContent>
          </Card>

          {/* Related Techs */}
          {technology.relatedTechnologies?.length > 0 && (
            <Card className="glass-card">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-medium">관련 기술</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex flex-wrap gap-1.5">
                  {technology.relatedTechnologies.map((tech: any, idx: number) => {
                    const techName = typeof tech === 'string' ? tech : tech.name;
                    const displayName = typeof tech === 'string' ? tech : (tech.displayName || tech.name);
                    return (
                      <Link key={idx} to={`/technologies/${encodeURIComponent(techName)}`}>
                        <Badge variant="outline" className="badge-compact hover:bg-primary/10 transition-colors cursor-pointer">
                          {displayName}
                        </Badge>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Roadmap Link Button - Added Here */}
          <Button 
            variant="outline" 
            className="w-full justify-start text-xs h-9"
            onClick={() => navigate(`/explore?tech=${technology.name}`)}
          >
            <Map className="size-3.5 mr-2 text-muted-foreground" />
            로드맵 전체 보기
          </Button>

          {/* CTA */}
          <Button 
            className="w-full shadow-glow-primary"
            onClick={() => navigate(`/learning-plans/new?target=${technology.name}`)}
          >
            <GraduationCap className="size-4 mr-2" />
            이 기술 학습하기
          </Button>
        </div>

        {/* Dialogs */}
        <CompareDialog 
          open={compareOpen} 
          onOpenChange={setCompareOpen} 
          currentTech={technology} 
        />
      </div>
    </TooltipProvider>
  );
}
