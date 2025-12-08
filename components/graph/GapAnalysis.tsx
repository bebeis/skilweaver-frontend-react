import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  CheckCircle2
} from 'lucide-react';
import { analyzeGap } from '../../src/lib/api/graph';
import { GapAnalysisData, MissingTechnology, GapPriority } from '../../src/lib/api/types';
import { ApiError } from '../../src/lib/api/client';
import { useAuth } from '../../hooks/useAuth';
import { skillsApi } from '../../src/lib/api/skills';

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

function MissingTechCard({ tech }: { tech: MissingTechnology }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
      <div className="p-2 rounded-lg bg-red-50">
        <AlertCircle className="size-4 text-red-500" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-foreground">{tech.displayName}</div>
        <div className="text-sm text-muted-foreground">{tech.name}</div>
      </div>
      <Badge variant="outline" className={priorityColors[tech.priority]}>
        {priorityLabels[tech.priority]}
      </Badge>
    </div>
  );
}

export function GapAnalysis() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [targetTech, setTargetTech] = useState('');
  const [knownTechs, setKnownTechs] = useState<string[]>([]);
  const [techInput, setTechInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GapAnalysisData | null>(null);

  // Load user's skills on mount
  useEffect(() => {
    const loadUserSkills = async () => {
      if (!user?.memberId) return;

      setLoadingSkills(true);
      try {
        const response = await skillsApi.getSkills(user.memberId);
        if (response.success && response.data?.skills) {
          const techKeys = response.data.skills
            .filter((s: any) => s.technologyKey)
            .map((s: any) => s.technologyKey);
          setKnownTechs(techKeys);
        }
      } catch (err) {
        console.error('Failed to load skills:', err);
      } finally {
        setLoadingSkills(false);
      }
    };

    loadUserSkills();
  }, [user?.memberId]);

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

  const analyze = useCallback(async () => {
    if (!targetTech.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await analyzeGap({
        knownTechnologies: knownTechs,
        targetTechnology: targetTech.trim().toLowerCase(),
      });
      setResult(response.data);
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
  }, [targetTech, knownTechs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    analyze();
  };

  const handleCreatePlan = () => {
    if (result) {
      navigate(`/learning-plans/new?technology=${result.target}`);
    }
  };

  return (
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
              <div className="relative">
                <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-primary" />
                <Input
                  placeholder="배우고 싶은 기술 (예: kubernetes, spring-boot...)"
                  value={targetTech}
                  onChange={(e) => setTargetTech(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Button type="submit" disabled={loading || !targetTech.trim()} className="w-full md:w-auto">
              {loading ? <Loader2 className="size-4 animate-spin mr-2" /> : <GitCompare className="size-4 mr-2" />}
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
                      학습 준비도
                    </h3>
                    <span className={`text-2xl font-bold ${
                      result.readinessScore >= 0.7 ? 'text-green-600' :
                      result.readinessScore >= 0.4 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {Math.round(result.readinessScore * 100)}%
                    </span>
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
          {result.missing.length > 0 && (
            <Card className="glass-card border-tech">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-600">
                  <AlertCircle className="size-5" />
                  부족한 선행 지식
                </CardTitle>
                <CardDescription>
                  {result.target}을(를) 학습하기 전에 다음 기술을 먼저 학습하세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.missing.map(tech => (
                    <MissingTechCard key={tech.name} tech={tech} />
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
              <div className="flex items-center justify-between">
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
                <Button onClick={handleCreatePlan} disabled={!result.ready}>
                  <Sparkles className="size-4 mr-2" />
                  학습 플랜 생성
                </Button>
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
  );
}
