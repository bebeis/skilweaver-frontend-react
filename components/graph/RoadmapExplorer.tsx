import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import {
  Search,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  BookOpen,
  GraduationCap
} from 'lucide-react';
import { fetchRoadmap } from '../../src/lib/api/graph';
import { RoadmapData, RoadmapTechnology, StepDifficulty } from '../../src/lib/api/types';
import { ApiError } from '../../src/lib/api/client';
import { TechAutocomplete } from './TechAutocomplete';

const difficultyColors: Record<StepDifficulty, string> = {
  EASY: 'bg-green-50 text-green-700 border-green-200',
  MEDIUM: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  HARD: 'bg-red-50 text-red-700 border-red-200',
};

const categoryColors: Record<string, string> = {
  LANGUAGE: 'bg-red-50 text-red-700 border-red-200',
  FRAMEWORK: 'bg-blue-50 text-blue-700 border-blue-200',
  LIBRARY: 'bg-purple-50 text-purple-700 border-purple-200',
  TOOL: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  DATABASE: 'bg-green-50 text-green-700 border-green-200',
  DB: 'bg-green-50 text-green-700 border-green-200',
  PLATFORM: 'bg-orange-50 text-orange-700 border-orange-200',
  DEVOPS: 'bg-indigo-50 text-indigo-700 border-indigo-200',
};

function TechNode({ tech, onClick, direction }: {
  tech: RoadmapTechnology;
  onClick?: () => void;
  direction: 'prerequisite' | 'next';
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:bg-secondary/50 hover:border-primary/50 transition-all duration-200 text-left w-full group"
    >
      <div className={`p-2 rounded-lg ${direction === 'prerequisite' ? 'bg-amber-100' : 'bg-emerald-100'}`}>
        {direction === 'prerequisite' ? (
          <BookOpen className="size-4 text-amber-600" />
        ) : (
          <GraduationCap className="size-4 text-emerald-600" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
          {tech.displayName}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="outline" className={`text-xs ${categoryColors[tech.category] || 'bg-gray-50 text-gray-700'}`}>
            {tech.category}
          </Badge>
          <Badge variant="outline" className={`text-xs ${difficultyColors[tech.difficulty]}`}>
            {tech.difficulty}
          </Badge>
        </div>
      </div>
      <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
    </button>
  );
}

interface RoadmapExplorerProps {
  initialTechnology?: string;
}

export function RoadmapExplorer({ initialTechnology = '' }: RoadmapExplorerProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState(initialTechnology);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [initialized, setInitialized] = useState(false);

  const loadRoadmap = useCallback(async (technology: string, addToHistory = true) => {
    if (!technology.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetchRoadmap(technology.trim().toLowerCase());
      setRoadmap(response.data);

      if (addToHistory && roadmap) {
        setHistory(prev => [...prev, roadmap.technology]);
      }
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.errorCode === 'TECHNOLOGY_NOT_FOUND') {
        setError(`'${technology}' 기술을 찾을 수 없습니다. 다른 기술명을 입력해주세요.`);
      } else if (apiError.errorCode === 'GRAPH_SERVICE_UNAVAILABLE') {
        setError('Graph 서비스에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
      } else {
        setError('로드맵을 불러오는 데 실패했습니다.');
      }
      setRoadmap(null);
    } finally {
      setLoading(false);
    }
  }, [roadmap]);

  // 초기 기술이 있으면 자동으로 로드
  useEffect(() => {
    if (initialTechnology && !initialized) {
      setInitialized(true);
      loadRoadmap(initialTechnology);
    }
  }, [initialTechnology, initialized, loadRoadmap]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadRoadmap(searchQuery);
  };

  const handleTechClick = (techName: string) => {
    setSearchQuery(techName);
    loadRoadmap(techName);
  };

  const handleBack = () => {
    if (history.length > 0) {
      const prevTech = history[history.length - 1];
      setHistory(prev => prev.slice(0, -1));
      setSearchQuery(prevTech);
      loadRoadmap(prevTech, false);
    }
  };

  const handleCreatePlan = () => {
    if (roadmap) {
      navigate(`/learning-plans/new?technology=${roadmap.technology}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card className="glass-card border-tech">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="size-5 text-primary" />
            기술 로드맵 탐색
          </CardTitle>
          <CardDescription>
            기술명을 입력하면 선수 지식과 후행 학습을 확인할 수 있습니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-3">
            <TechAutocomplete
              value={searchQuery}
              onChange={setSearchQuery}
              onSelect={(tech) => {
                setSearchQuery(tech.key);
                loadRoadmap(tech.key);
              }}
              placeholder="예: spring-boot, react, kubernetes..."
              className="flex-1"
            />
            <Button type="submit" disabled={loading || !searchQuery.trim()}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
              <span className="ml-2">검색</span>
            </Button>
          </form>

          {/* Quick Suggestions */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">추천:</span>
            {['spring-boot', 'react', 'kubernetes', 'python', 'docker'].map(tech => (
              <Badge
                key={tech}
                variant="outline"
                className="cursor-pointer hover:bg-primary/10 hover:border-primary/50 transition-colors"
                onClick={() => {
                  setSearchQuery(tech);
                  loadRoadmap(tech);
                }}
              >
                {tech}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Roadmap Result */}
      {roadmap && (
        <div className="space-y-6">
          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBack}
              disabled={history.length === 0}
            >
              <ArrowLeft className="size-4 mr-2" />
              이전
            </Button>
            <Button onClick={handleCreatePlan}>
              <Sparkles className="size-4 mr-2" />
              이 기술로 학습 플랜 생성
            </Button>
          </div>

          {/* Target Technology */}
          <Card className="glass-card border-primary/50 shadow-neon">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <div className="bg-gradient-tech-primary text-white px-6 py-4 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold">{roadmap.displayName}</h2>
                    <p className="text-sm opacity-80 mt-1">{roadmap.technology}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prerequisites & Next Steps */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Prerequisites */}
            <Card className="glass-card border-tech">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-600">
                  <ArrowLeft className="size-5" />
                  선수 지식
                </CardTitle>
                <CardDescription>
                  {roadmap.displayName}을(를) 학습하기 전에 알아야 할 기술
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Required */}
                {roadmap.prerequisites.required.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                      <Badge variant="destructive" className="text-xs">필수</Badge>
                    </h4>
                    <div className="space-y-2">
                      {roadmap.prerequisites.required.map(tech => (
                        <TechNode
                          key={tech.name}
                          tech={tech}
                          direction="prerequisite"
                          onClick={() => handleTechClick(tech.name)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommended */}
                {roadmap.prerequisites.recommended.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">권장</Badge>
                    </h4>
                    <div className="space-y-2">
                      {roadmap.prerequisites.recommended.map(tech => (
                        <TechNode
                          key={tech.name}
                          tech={tech}
                          direction="prerequisite"
                          onClick={() => handleTechClick(tech.name)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {roadmap.prerequisites.required.length === 0 &&
                 roadmap.prerequisites.recommended.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">
                    선수 지식이 없습니다. 바로 시작할 수 있습니다!
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card className="glass-card border-tech">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-600">
                  <ArrowRight className="size-5" />
                  다음 단계
                </CardTitle>
                <CardDescription>
                  {roadmap.displayName} 학습 후 배우면 좋은 기술
                </CardDescription>
              </CardHeader>
              <CardContent>
                {roadmap.nextSteps.length > 0 ? (
                  <div className="space-y-2">
                    {roadmap.nextSteps.map(tech => (
                      <TechNode
                        key={tech.name}
                        tech={tech}
                        direction="next"
                        onClick={() => handleTechClick(tech.name)}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    등록된 후행 학습이 없습니다.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!roadmap && !loading && !error && (
        <Card className="glass-card border-tech">
          <CardContent className="py-12 text-center">
            <Search className="size-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">기술을 검색해보세요</h3>
            <p className="text-muted-foreground">
              기술명을 입력하면 선수 지식과 학습 로드맵을 확인할 수 있습니다.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
