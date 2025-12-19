import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import {
  GitCompare,
  Target,
  Loader2,
  AlertTriangle,
  Check,
  X,
  Plus,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Share2,
  Copy,
  RotateCcw
} from 'lucide-react';
import { analyzeGapWithResources } from '@/lib/api/search';
import { GapAnalysisWithResources, MissingTechV6, GapPriority } from '@/lib/api/types';
import { ApiError } from '@/lib/api/client';
import { useAuth } from '../../hooks/useAuth';
import { skillsApi } from '../../src/lib/api/skills';
import { TechAutocomplete } from './TechAutocomplete';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { LiquidHighlight, useFluidHighlight } from '../ui/fluid-highlight';
import { cn } from '../ui/utils';

const priorityColors: Record<GapPriority, string> = {
  HIGH: 'bg-red-100 text-red-700 border-red-200',
  MEDIUM: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  LOW: 'bg-green-100 text-green-700 border-green-200',
};

const priorityLabels: Record<GapPriority, string> = {
  HIGH: '필수',
  MEDIUM: '권장',
  LOW: '선택',
};

const priorityOrder: Record<GapPriority, number> = {
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

function MissingTechCard({ 
  tech, 
  onAddToKnown,
  onMouseEnter 
}: { 
  tech: MissingTechV6; 
  onAddToKnown: (name: string) => void;
  onMouseEnter?: (e: React.MouseEvent<HTMLDivElement>) => void;
}) {
  const navigate = useNavigate();
  
  return (
    <div 
      className="flex flex-col gap-3 p-3 rounded-lg border border-border bg-card/50 transition-colors relative z-10 hover:border-border/50"
      onMouseEnter={onMouseEnter}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-red-500/10">
          <AlertCircle className="size-4 text-red-500" />
        </div>
        <div className="flex-1 min-w-0">
          <button
            className="font-semibold text-foreground hover:text-primary transition-colors text-left"
            onClick={() => navigate(`/technologies/${encodeURIComponent(tech.name)}`)}
          >
            {tech.displayName}
          </button>
          <div className="text-sm text-muted-foreground">{tech.name}</div>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={() => onAddToKnown(tech.name)}
              >
                <Plus className="size-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>보유 기술에 추가</TooltipContent>
          </Tooltip>
          <Badge variant="outline" className={priorityColors[tech.priority] ? priorityColors[tech.priority].replace('bg-', 'bg-opacity-10 bg-').replace('text-', 'text-opacity-90 text-').replace('border-', 'border-opacity-20 border-') : ''}>
            {priorityLabels[tech.priority]}
          </Badge>
        </div>
      </div>
      
      {/* Resources Section */}
      {tech.recommendedResources && tech.recommendedResources.length > 0 && (
        <div className="mt-2 pl-11">
          <p className="text-xs font-medium text-muted-foreground mb-2">추천 학습 자료:</p>
          <div className="space-y-2">
            {tech.recommendedResources.map((resource, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm bg-secondary/20 p-2 rounded">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] h-4 px-1">
                    {resource.type}
                  </Badge>
                  <span className="truncate max-w-[200px]">{resource.title}</span>
                </div>
                {resource.estimatedHours && (
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {resource.estimatedHours}h
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MissingTechList({ 
  techs, 
  onAddToKnown 
}: { 
  techs: MissingTechV6[]; 
  onAddToKnown: (name: string) => void;
}) {
  const { 
    containerRef, 
    highlightStyle, 
    handleMouseEnter, 
    handleMouseLeave 
  } = useFluidHighlight<HTMLDivElement>();

  return (
    <div 
      ref={containerRef}
      onMouseLeave={handleMouseLeave}
      className="space-y-3 relative"
    >
      <LiquidHighlight style={highlightStyle} />
      {techs.map(tech => (
        <MissingTechCard 
          key={tech.name} 
          tech={tech} 
          onAddToKnown={onAddToKnown}
          onMouseEnter={handleMouseEnter}
        />
      ))}
    </div>
  );
}

export function GapAnalysis() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // URL에서 초기값 로드
  const initialTarget = searchParams.get('target') || '';
  const initialKnown = searchParams.get('known')?.split(',').filter(Boolean) || [];
  
  const [targetTech, setTargetTech] = useState(initialTarget);
  const [knownTechs, setKnownTechs] = useState<string[]>(initialKnown);
  const [techInput, setTechInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GapAnalysisWithResources | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<Array<{ target: string; score: number; timestamp: Date }>>([]);

  // URL 초기값이 있으면 자동 분석 실행
  useEffect(() => {
    if (initialTarget && !result) {
      analyze();
    }
  }, []);

  // Load user's skills on mount
  useEffect(() => {
    const loadUserSkills = async () => {
      if (!user?.memberId || knownTechs.length > 0) return;

      setLoadingSkills(true);
      try {
        const response = await skillsApi.getSkills(user.memberId);
        if (response.success && response.data?.skills) {
          // V4: technologyKey → technologyName
          const techNames = response.data.skills
            .filter((s: any) => s.technologyName)
            .map((s: any) => s.technologyName);
          setKnownTechs(techNames);
        }
      } catch (err) {
        console.error('Failed to load skills:', err);
      } finally {
        setLoadingSkills(false);
      }
    };

    loadUserSkills();
  }, [user?.memberId]);

  // 히스토리 로드
  useEffect(() => {
    const saved = localStorage.getItem('gap_analysis_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAnalysisHistory(parsed.map((h: any) => ({ ...h, timestamp: new Date(h.timestamp) })));
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, []);

  const addTech = () => {
    if (!techInput.trim()) return;
    const tech = techInput.trim().toLowerCase();
    if (!knownTechs.includes(tech)) {
      setKnownTechs(prev => [...prev, tech]);
    }
    setTechInput('');
  };

  const removeTech = (tech: string) => {
    setKnownTechs(prev => prev.filter(t => t !== tech));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTech();
    }
  };

  // 부족한 기술을 보유 기술에 추가
  const addMissingToKnown = (techName: string) => {
    if (!knownTechs.includes(techName)) {
      setKnownTechs(prev => [...prev, techName]);
      toast.success(`${techName}을(를) 보유 기술에 추가했습니다`);
    }
  };

  // 분석 결과 공유 URL 생성
  const shareAnalysis = () => {
    const params = new URLSearchParams();
    params.set('tab', 'gap');
    params.set('target', targetTech);
    if (knownTechs.length > 0) {
      params.set('known', knownTechs.join(','));
    }
    const url = `${window.location.origin}/explore?${params.toString()}`;
    navigator.clipboard.writeText(url);
    toast.success('분석 URL이 클립보드에 복사되었습니다');
  };

  const analyze = useCallback(async () => {
    if (!targetTech.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await analyzeGapWithResources({
        known: knownTechs,
        target: targetTech.trim().toLowerCase(),
      });
      
      if (response.success && response.data) {
        setResult(response.data);
        
        // 히스토리에 추가
        const newHistory = [
          { target: targetTech, score: response.data.readinessScore, timestamp: new Date() },
          ...analysisHistory.filter(h => h.target !== targetTech).slice(0, 9)
        ];
        setAnalysisHistory(newHistory);
        localStorage.setItem('gap_analysis_history', JSON.stringify(newHistory));
        
        // URL 업데이트
        const params = new URLSearchParams(searchParams);
        params.set('target', targetTech);
        if (knownTechs.length > 0) {
          params.set('known', knownTechs.join(','));
        }
        setSearchParams(params, { replace: true });
      } else {
        setError(response.message || '분석에 실패했습니다');
      }
      
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.errorCode === 'TECHNOLOGY_NOT_FOUND') {
        setError(`'${targetTech}' 기술을 찾을 수 없습니다.`);
      } else if (apiError.errorCode === 'GRAPH_SERVICE_UNAVAILABLE') {
        setError('Graph 서비스에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
      } else {
        setError('갭 분석에 실패했습니다.');
      }
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, [targetTech, knownTechs, analysisHistory, searchParams, setSearchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    analyze();
  };

  const handleCreatePlan = () => {
    if (result) {
      navigate(`/learning-plans/new?technology=${result.target}`);
    }
  };

  // 히스토리에서 다시 분석
  const reanalyze = (target: string) => {
    setTargetTech(target);
    setTimeout(() => analyze(), 100);
  };

  // 결과 정렬 (우선순위별)
  const sortedMissing = result?.missing?.slice().sort((a, b) => 
    priorityOrder[a.priority] - priorityOrder[b.priority]
  ) || [];

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Input Form */}
        <Card className="glass-card border-tech">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitCompare className="size-5 text-primary" />
              갭 분석
            </CardTitle>
            <CardDescription>
              보유한 기술과 목표 기술을 비교하여 부족한 부분을 분석합니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Known Technologies */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                보유 기술
                {loadingSkills && <Loader2 className="size-3 animate-spin text-muted-foreground" />}
                <Badge variant="secondary" className="ml-auto">{knownTechs.length}개</Badge>
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="기술 추가 (예: java, python...)"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button type="button" variant="outline" onClick={addTech}>
                  <Plus className="size-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 min-h-[32px]">
                {knownTechs.length === 0 ? (
                  <span className="text-sm text-muted-foreground">
                    보유 기술을 추가하거나, 내 기술 스택에서 자동으로 불러옵니다
                  </span>
                ) : (
                  knownTechs.map(tech => (
                    <Badge
                      key={tech}
                      variant="secondary"
                      className="flex items-center gap-1 pr-1"
                    >
                      <Check className="size-3 text-green-500" />
                      {tech}
                      <button
                        onClick={() => removeTech(tech)}
                        className="ml-1 p-0.5 rounded-full hover:bg-destructive/20 transition-colors"
                      >
                        <X className="size-3 text-muted-foreground hover:text-destructive" />
                      </button>
                    </Badge>
                  ))
                )}
              </div>
            </div>

            {/* Target Technology */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">목표 기술</label>
                <TechAutocomplete
                  value={targetTech}
                  onChange={setTargetTech}
                  onSelect={(tech) => setTargetTech(tech.name)}
                  placeholder="배우고 싶은 기술 (예: kubernetes, spring-boot...)"
                  icon={<Target className="size-4 text-primary" />}
                />
              </div>

              <Button type="submit" disabled={loading || !targetTech.trim()} className="w-full md:w-auto btn-liquid-glass-primary shadow-glow-primary">
                {loading ? <Loader2 className="size-4 animate-spin mr-2" /> : <GitCompare className="size-4 mr-2 fill-current" />}
                분석하기
              </Button>
            </form>

            {/* Quick Suggestions */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">예시:</span>
              {['spring-boot', 'kubernetes', 'react', 'mlops'].map(tech => (
                <Badge
                  key={tech}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary/10 hover:border-primary/50 transition-colors"
                  onClick={() => setTargetTech(tech)}
                >
                  {tech}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Analysis History */}
        {analysisHistory.length > 0 && !result && (
          <Card className="glass-card border-tech">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <RotateCcw className="size-4" />
                최근 분석 기록
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {analysisHistory.slice(0, 5).map((history, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary/10 hover:border-primary/50 transition-colors flex items-center gap-2"
                    onClick={() => reanalyze(history.target)}
                  >
                    {history.target}
                    <span className={`text-xs ${
                      history.score >= 0.7 ? 'text-green-600' :
                      history.score >= 0.4 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {Math.round(history.score * 100)}%
                    </span>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="size-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Readiness Score */}
            <Card className={`glass-card ${result.ready ? 'border-green-500/50' : 'border-yellow-500/50'}`}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-6">
                  <div className={`p-4 rounded-full ${result.ready ? 'bg-green-100' : 'bg-yellow-100'}`}>
                    {result.ready ? (
                      <CheckCircle2 className="size-8 text-green-600" />
                    ) : (
                      <AlertCircle className="size-8 text-yellow-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        학습 준비도: {result.target}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8" onClick={shareAnalysis}>
                              <Share2 className="size-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>분석 결과 공유</TooltipContent>
                        </Tooltip>
                        <span className={`text-2xl font-bold ${
                          result.readinessScore >= 0.7 ? 'text-green-600' :
                          result.readinessScore >= 0.4 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {Math.round(result.readinessScore * 100)}%
                        </span>
                      </div>
                    </div>
                    <Progress
                      value={result.readinessScore * 100}
                      className="h-2"
                    />
                    <p className="text-muted-foreground mt-3">{result.message}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Missing Technologies */}
            {sortedMissing.length > 0 && (
              <Card className="glass-card border-tech">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-yellow-600">
                        <AlertCircle className="size-5" />
                        부족한 선행 지식
                      </CardTitle>
                      <CardDescription>
                        {result.target}을(를) 학습하기 전에 다음 기술을 먼저 학습하세요
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">{sortedMissing.length}개</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <MissingTechList 
                    techs={sortedMissing} 
                        onAddToKnown={addMissingToKnown}
                      />
                  
                  {/* Priority Legend */}
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
                    <span className="text-xs text-muted-foreground">우선순위:</span>
                    {Object.entries(priorityLabels).map(([key, label]) => (
                      <Badge key={key} variant="outline" className={`text-xs ${priorityColors[key as GapPriority]}`}>
                        {label}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Known Technologies Used */}
            {result.known.length > 0 && (
              <Card className="glass-card border-tech">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="size-5" />
                    보유 중인 연관 기술
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {result.known.map(tech => (
                      <Badge key={tech} variant="secondary" className="bg-green-50 text-green-700">
                        <Check className="size-3 mr-1" />
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Button */}
            <Card className="glass-card border-primary/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {result.ready ? '학습을 시작할 준비가 되었습니다!' : '먼저 선행 지식을 학습하세요'}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {result.ready
                        ? 'AI 기반 상세 커리큘럼을 생성해보세요'
                        : '부족한 기술을 먼저 학습한 후 플랜을 생성하세요'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!result.ready && sortedMissing.length > 0 && (
                      <Button 
                        variant="outline"
                        onClick={() => {
                          // 가장 우선순위가 높은 부족한 기술로 새 갭 분석
                          setTargetTech(sortedMissing[0].name);
                          setTimeout(() => analyze(), 100);
                        }}
                      >
                        <Target className="size-4 mr-2" />
                        {sortedMissing[0].displayName} 먼저 분석
                      </Button>
                    )}
                    <Button onClick={handleCreatePlan} disabled={!result.ready} className="btn-liquid-glass-primary shadow-glow-primary">
                      <Sparkles className="size-4 mr-2 fill-current" />
                      학습 플랜 생성
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Empty State */}
        {!result && !loading && !error && (
          <Card className="glass-card border-tech">
            <CardContent className="py-12 text-center">
              <GitCompare className="size-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">갭 분석을 시작하세요</h3>
              <p className="text-muted-foreground">
                보유한 기술과 목표 기술을 입력하면
                <br />
                학습에 필요한 준비 상태를 분석해드립니다.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  );
}
