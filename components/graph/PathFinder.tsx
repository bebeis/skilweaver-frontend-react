import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import {
  Route,
  ArrowRight,
  Loader2,
  AlertTriangle,
  Flag,
  Target,
  CircleDot,
  UserCircle,
  ChevronDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '../ui/dropdown-menu';
import { fetchLearningPath } from '../../src/lib/api/graph';
import { LearningPathData, PathStep, TechRelation, MemberSkill } from '../../src/lib/api/types';
import { ApiError } from '../../src/lib/api/client';
import { TechAutocomplete } from './TechAutocomplete';
import { useAuth } from '../../hooks/useAuth';
import { skillsApi } from '../../src/lib/api/skills';

// V4: TechRelation 사용
const relationLabels: Record<TechRelation, string> = {
  DEPENDS_ON: '의존',
  RECOMMENDED_AFTER: '권장 순서',
  CONTAINS: '포함',
  EXTENDS: '확장',
  USED_WITH: '함께 사용',
  ALTERNATIVE_TO: '대체',
};

const relationColors: Record<TechRelation, string> = {
  DEPENDS_ON: 'bg-orange-100 text-orange-700',
  RECOMMENDED_AFTER: 'bg-blue-100 text-blue-700',
  CONTAINS: 'bg-purple-100 text-purple-700',
  EXTENDS: 'bg-teal-100 text-teal-700',
  USED_WITH: 'bg-green-100 text-green-700',
  ALTERNATIVE_TO: 'bg-gray-100 text-gray-700',
};

function PathStepCard({ step, isLast, totalSteps }: {
  step: PathStep;
  isLast: boolean;
  totalSteps: number;
}) {
  const progress = (step.step / totalSteps) * 100;

  return (
    <div className="flex items-stretch gap-4">
      {/* Timeline */}
      <div className="flex flex-col items-center">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          isLast
            ? 'bg-gradient-tech-primary text-white shadow-lg'
            : 'bg-primary/10 text-primary border-2 border-primary/30'
        }`}>
          {isLast ? <Target className="size-5" /> : <CircleDot className="size-5" />}
        </div>
        {!isLast && (
          <div className="w-0.5 flex-1 bg-gradient-to-b from-primary/50 to-primary/20 my-2"></div>
        )}
      </div>

      {/* Content */}
      <div className={`flex-1 ${!isLast ? 'pb-6' : ''}`}>
        <Card className={`glass-card border-tech ${isLast ? 'border-primary/50 shadow-neon' : ''}`}>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  Step {step.step}
                </Badge>
                <Badge className={`text-xs ${relationColors[step.relation]}`}>
                  {relationLabels[step.relation]}
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
            </div>

            <h4 className="font-semibold text-lg text-foreground">{step.technology}</h4>

            <div className="mt-2">
              <Progress value={progress} className="h-1" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function PathFinder() {
  const { user } = useAuth();
  const [fromTech, setFromTech] = useState('');
  const [toTech, setToTech] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pathData, setPathData] = useState<LearningPathData | null>(null);

  // 사용자 보유 기술
  const [userSkills, setUserSkills] = useState<MemberSkill[]>([]);
  const [loadingSkills, setLoadingSkills] = useState(false);

  // 사용자 보유 기술 로드
  useEffect(() => {
    const loadUserSkills = async () => {
      if (!user?.memberId) return;

      setLoadingSkills(true);
      try {
        const response = await skillsApi.getSkills(user.memberId);
        if (response.success && response.data?.skills) {
          setUserSkills(response.data.skills);
        }
      } catch (err) {
        console.error('Failed to load skills:', err);
      } finally {
        setLoadingSkills(false);
      }
    };

    loadUserSkills();
  }, [user?.memberId]);

  const findPath = useCallback(async () => {
    if (!fromTech.trim() || !toTech.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetchLearningPath(
        fromTech.trim().toLowerCase(),
        toTech.trim().toLowerCase()
      );
      setPathData(response.data);
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.errorCode === 'NO_PATH_FOUND') {
        setError(`'${fromTech}'에서 '${toTech}'까지의 학습 경로를 찾을 수 없습니다.`);
      } else if (apiError.errorCode === 'TECHNOLOGY_NOT_FOUND') {
        setError('입력한 기술 중 하나를 찾을 수 없습니다. 기술명을 확인해주세요.');
      } else if (apiError.errorCode === 'GRAPH_SERVICE_UNAVAILABLE') {
        setError('Graph 서비스에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
      } else {
        setError('학습 경로를 찾는 데 실패했습니다.');
      }
      setPathData(null);
    } finally {
      setLoading(false);
    }
  }, [fromTech, toTech]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    findPath();
  };

  const setExample = (from: string, to: string) => {
    setFromTech(from);
    setToTech(to);
  };

  const handleSelectUserSkill = (skill: MemberSkill) => {
    // V4: technologyKey → technologyName
    setFromTech(skill.technologyName);
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card className="glass-card border-tech">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="size-5 text-primary" />
            학습 경로 탐색
          </CardTitle>
          <CardDescription>
            현재 알고 있는 기술에서 목표 기술까지의 최단 학습 경로를 찾습니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">시작 기술 (현재 보유)</label>
                  {userSkills.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                          <UserCircle className="size-3" />
                          내 기술에서 선택
                          <ChevronDown className="size-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel className="flex items-center gap-2">
                          <UserCircle className="size-4" />
                          보유 기술 목록
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {loadingSkills ? (
                          <div className="py-2 px-2 text-center text-sm text-muted-foreground">
                            <Loader2 className="size-4 animate-spin mx-auto" />
                          </div>
                        ) : (
                          userSkills.map((skill) => (
                            <DropdownMenuItem
                              key={skill.memberSkillId}
                              onClick={() => handleSelectUserSkill(skill)}
                              className="cursor-pointer"
                            >
                              <div className="flex items-center justify-between w-full">
                                {/* V4: technologyName 표시 */}
                                <span>{skill.technologyName}</span>
                                <Badge variant="secondary" className="text-xs ml-2">
                                  {skill.level}
                                </Badge>
                              </div>
                            </DropdownMenuItem>
                          ))
                        )}
                        {!loadingSkills && userSkills.length === 0 && (
                          <div className="py-2 px-2 text-center text-sm text-muted-foreground">
                            등록된 기술이 없습니다
                          </div>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                <TechAutocomplete
                  value={fromTech}
                  onChange={setFromTech}
                  onSelect={(tech) => setFromTech(tech.name)}
                  placeholder="예: java, python..."
                  icon={<Flag className="size-4 text-green-500" />}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">목표 기술</label>
                <TechAutocomplete
                  value={toTech}
                  onChange={setToTech}
                  onSelect={(tech) => setToTech(tech.name)}
                  placeholder="예: kubernetes, mlops..."
                  icon={<Target className="size-4 text-primary" />}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || !fromTech.trim() || !toTech.trim()}
              className="w-full md:w-auto"
            >
              {loading ? <Loader2 className="size-4 animate-spin mr-2" /> : <Route className="size-4 mr-2" />}
              경로 찾기
            </Button>
          </form>

          {/* Quick Examples */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">예시:</span>
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-primary/10 hover:border-primary/50 transition-colors"
              onClick={() => setExample('java', 'kubernetes')}
            >
              Java → Kubernetes
            </Badge>
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-primary/10 hover:border-primary/50 transition-colors"
              onClick={() => setExample('python', 'mlops')}
            >
              Python → MLOps
            </Badge>
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-primary/10 hover:border-primary/50 transition-colors"
              onClick={() => setExample('javascript', 'react')}
            >
              JavaScript → React
            </Badge>
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

      {/* Path Result */}
      {pathData && (
        <div className="space-y-6">
          {/* Summary */}
          <Card className="glass-card border-tech">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-green-100 text-green-700 px-3 py-1 rounded-lg font-medium">
                      {pathData.from}
                    </div>
                    <ArrowRight className="size-5 text-muted-foreground" />
                    <div className="bg-primary/10 text-primary px-3 py-1 rounded-lg font-medium">
                      {pathData.to}
                    </div>
                  </div>
                </div>
                <Badge variant="secondary" className="text-sm">
                  {pathData.totalSteps}단계
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Path Steps */}
          <Card className="glass-card border-tech">
            <CardHeader>
              <CardTitle>학습 경로</CardTitle>
              <CardDescription>
                각 단계를 순서대로 학습하면 목표 기술에 도달할 수 있습니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-0">
                {/* Start Point */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg">
                    <Flag className="size-5" />
                  </div>
                  <div className="font-semibold text-foreground">
                    시작: <span className="text-green-600">{pathData.from}</span>
                  </div>
                </div>

                {/* Steps */}
                {pathData.path.map((step, index) => (
                  <PathStepCard
                    key={step.step}
                    step={step}
                    isLast={index === pathData.path.length - 1}
                    totalSteps={pathData.totalSteps}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {!pathData && !loading && !error && (
        <Card className="glass-card border-tech">
          <CardContent className="py-12 text-center">
            <Route className="size-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">학습 경로를 찾아보세요</h3>
            <p className="text-muted-foreground">
              현재 알고 있는 기술과 목표 기술을 입력하면
              <br />
              최적의 학습 경로를 안내해드립니다.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
