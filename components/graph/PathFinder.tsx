import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import {
  Route,
  ArrowRight,
  Loader2,
  AlertTriangle,
  ChevronRight,
  Flag,
  Target,
  CircleDot
} from 'lucide-react';
import { fetchLearningPath } from '../../src/lib/api/graph';
import { LearningPathData, PathStep, GraphRelationType } from '../../src/lib/api/types';
import { ApiError } from '../../src/lib/api/client';

const relationLabels: Record<GraphRelationType, string> = {
  PREREQUISITE: '선행 지식',
  RECOMMENDED_AFTER: '권장 순서',
  DEPENDS_ON: '의존',
  CONTAINS: '포함',
  USED_WITH: '함께 사용',
  ALTERNATIVE: '대체',
};

const relationColors: Record<GraphRelationType, string> = {
  PREREQUISITE: 'bg-red-100 text-red-700',
  RECOMMENDED_AFTER: 'bg-blue-100 text-blue-700',
  DEPENDS_ON: 'bg-orange-100 text-orange-700',
  CONTAINS: 'bg-purple-100 text-purple-700',
  USED_WITH: 'bg-green-100 text-green-700',
  ALTERNATIVE: 'bg-gray-100 text-gray-700',
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
  const [fromTech, setFromTech] = useState('');
  const [toTech, setToTech] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pathData, setPathData] = useState<LearningPathData | null>(null);

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
                <label className="text-sm font-medium text-foreground">시작 기술 (현재 보유)</label>
                <div className="relative">
                  <Flag className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-green-500" />
                  <Input
                    placeholder="예: java, python..."
                    value={fromTech}
                    onChange={(e) => setFromTech(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">목표 기술</label>
                <div className="relative">
                  <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-primary" />
                  <Input
                    placeholder="예: kubernetes, mlops..."
                    value={toTech}
                    onChange={(e) => setToTech(e.target.value)}
                    className="pl-10"
                  />
                </div>
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
