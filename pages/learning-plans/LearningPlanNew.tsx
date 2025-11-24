import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Checkbox } from '../../components/ui/checkbox';
import { GraduationCap, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../hooks/useAuth';
import { LearningPlanStreamGenerator } from '../../components/learning-plans/LearningPlanStreamGenerator';
import { agentRunsApi } from '../../src/lib/api/agent-runs';

export function LearningPlanNew() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const targetFromUrl = searchParams.get('target');

  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    targetTechnology: targetFromUrl || '',
    targetCompletionWeeks: 8,
    focusAreas: [] as string[],
    dailyMinutesOverride: 60
  });

  // 사용자가 없으면 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const focusAreaOptions = [
    { id: 'FUNDAMENTALS', label: '기초 개념' },
    { id: 'PRACTICAL_PROJECTS', label: '실전 프로젝트' },
    { id: 'BEST_PRACTICES', label: '베스트 프랙티스' },
    { id: 'ADVANCED_TOPICS', label: '고급 주제' },
    { id: 'REAL_WORLD_USE_CASES', label: '실제 활용 사례' }
  ];

  const handleFocusAreaToggle = (areaId: string) => {
    setFormData(prev => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(areaId)
        ? prev.focusAreas.filter(id => id !== areaId)
        : [...prev.focusAreas, areaId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('사용자 정보를 찾을 수 없습니다.');
      navigate('/login');
      return;
    }

    if (!formData.targetTechnology) {
      toast.error('학습할 기술을 입력해주세요.');
      return;
    }

    setIsGenerating(true);
    // LearningPlanStreamGenerator 컴포넌트에서 자동으로 SSE 스트리밍을 시작합니다
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">새 학습 플랜 생성</h1>
        <p className="text-muted-foreground text-lg font-medium mt-1">
          AI가 당신의 현재 스킬과 학습 스타일을 분석하여 최적의 학습 경로를 만들어드립니다
        </p>
      </div>

      {!isGenerating ? (
        <form onSubmit={handleSubmit}>
          <Card className="glass-card border-tech">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <GraduationCap className="size-5 text-primary" />
                학습 플랜 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Target Technology */}
              <div className="space-y-2">
                <Label htmlFor="targetTechnology" className="text-foreground font-semibold">학습할 기술</Label>
                <Input
                  id="targetTechnology"
                  placeholder="예: Kubernetes, React, PostgreSQL"
                  value={formData.targetTechnology}
                  onChange={(e) => setFormData({ ...formData, targetTechnology: e.target.value })}
                  required
                  className="bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground"
                />
                <p className="text-muted-foreground font-medium">
                  학습하고 싶은 기술 이름을 입력하세요
                </p>
              </div>

              {/* Target Completion Weeks */}
              <div className="space-y-2">
                <Label htmlFor="targetCompletionWeeks" className="text-foreground font-semibold">목표 완료 기간 (주)</Label>
                <Input
                  id="targetCompletionWeeks"
                  type="number"
                  min="1"
                  max="52"
                  value={formData.targetCompletionWeeks}
                  onChange={(e) => setFormData({ ...formData, targetCompletionWeeks: parseInt(e.target.value) })}
                  required
                  className="bg-secondary/50 border-border text-foreground"
                />
                <p className="text-muted-foreground font-medium">
                  {formData.targetCompletionWeeks}주 = 약 {Math.round(formData.targetCompletionWeeks / 4.3)}개월
                </p>
              </div>

              {/* Daily Minutes Override */}
              <div className="space-y-2">
                <Label htmlFor="dailyMinutesOverride" className="text-foreground font-semibold">하루 학습 시간 (분)</Label>
                <Input
                  id="dailyMinutesOverride"
                  type="number"
                  min="15"
                  max="480"
                  value={formData.dailyMinutesOverride}
                  onChange={(e) => setFormData({ ...formData, dailyMinutesOverride: parseInt(e.target.value) })}
                  className="bg-secondary/50 border-border text-foreground"
                />
                <p className="text-muted-foreground font-medium">
                  총 예상 학습 시간: 약 {Math.round((formData.targetCompletionWeeks * 7 * formData.dailyMinutesOverride) / 60)}시간
                </p>
              </div>

              {/* Focus Areas */}
              <div className="space-y-3">
                <Label className="text-foreground font-semibold">학습 중점 분야 (복수 선택 가능)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {focusAreaOptions.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={option.id}
                        checked={formData.focusAreas.includes(option.id)}
                        onCheckedChange={() => handleFocusAreaToggle(option.id)}
                      />
                      <label
                        htmlFor={option.id}
                        className="text-foreground cursor-pointer font-medium"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
                {formData.focusAreas.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.focusAreas.map((areaId) => {
                      const option = focusAreaOptions.find(o => o.id === areaId);
                      return option ? (
                        <Badge key={areaId} variant="secondary">
                          {option.label}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}
              </div>

              {/* Info Box */}
              <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="size-5 text-primary mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-foreground font-bold">AI 맞춤 생성</p>
                    <p className="text-muted-foreground font-medium">
                      당신의 기존 기술 스택, 학습 선호도, 경험 레벨을 분석하여
                      가장 효율적인 학습 경로를 생성합니다.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-3">
              <Button type="submit" className="flex-1 relative z-10">
                <Sparkles className="size-4 mr-2" />
                AI 플랜 생성
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 relative z-10"
                onClick={() => navigate('/learning-plans')}
              >
                취소
              </Button>
            </CardFooter>
          </Card>
        </form>
      ) : (
        <LearningPlanStreamGenerator
          memberId={user?.memberId || Number(user?.id) || 0}
          targetTechnology={formData.targetTechnology}
          prefersFastPlan={false}
          onComplete={(planId) => {
            navigate(`/learning-plans/${planId}`);
          }}
        />
      )}
    </div>
  );
}
