import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Checkbox } from '../../components/ui/checkbox';
import { GraduationCap, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { GOAPVisualization } from '../../components/learning-plans/GOAPVisualization';

export function LearningPlanNew() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetFromUrl = searchParams.get('target');

  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    targetTechName: targetFromUrl || '',
    targetCompletionWeeks: 8,
    focusAreas: [] as string[],
    dailyMinutesOverride: 60
  });

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

    if (!formData.targetTechName) {
      toast.error('학습할 기술을 입력해주세요.');
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI generation with GOAP process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsGenerating(false);
    toast.success('학습 플랜이 생성되었습니다! 🎉');
    navigate('/learning-plans/1'); // Navigate to the newly created plan
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-gray-900">새 학습 플랜 생성</h1>
        <p className="text-gray-600 mt-1">
          AI가 당신의 현재 스킬과 학습 스타일을 분석하여 최적의 학습 경로를 만들어드립니다
        </p>
      </div>

      {!isGenerating ? (
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="size-5" />
                학습 플랜 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Target Technology */}
              <div className="space-y-2">
                <Label htmlFor="targetTechName">학습할 기술</Label>
                <Input
                  id="targetTechName"
                  placeholder="예: Kubernetes, React, PostgreSQL"
                  value={formData.targetTechName}
                  onChange={(e) => setFormData({ ...formData, targetTechName: e.target.value })}
                  required
                />
                <p className="text-gray-600">
                  학습하고 싶은 기술 이름을 입력하세요
                </p>
              </div>

              {/* Target Completion Weeks */}
              <div className="space-y-2">
                <Label htmlFor="targetCompletionWeeks">목표 완료 기간 (주)</Label>
                <Input
                  id="targetCompletionWeeks"
                  type="number"
                  min="1"
                  max="52"
                  value={formData.targetCompletionWeeks}
                  onChange={(e) => setFormData({ ...formData, targetCompletionWeeks: parseInt(e.target.value) })}
                  required
                />
                <p className="text-gray-600">
                  {formData.targetCompletionWeeks}주 = 약 {Math.round(formData.targetCompletionWeeks / 4.3)}개월
                </p>
              </div>

              {/* Daily Minutes Override */}
              <div className="space-y-2">
                <Label htmlFor="dailyMinutesOverride">하루 학습 시간 (분)</Label>
                <Input
                  id="dailyMinutesOverride"
                  type="number"
                  min="15"
                  max="480"
                  value={formData.dailyMinutesOverride}
                  onChange={(e) => setFormData({ ...formData, dailyMinutesOverride: parseInt(e.target.value) })}
                />
                <p className="text-gray-600">
                  총 예상 학습 시간: 약 {Math.round((formData.targetCompletionWeeks * 7 * formData.dailyMinutesOverride) / 60)}시간
                </p>
              </div>

              {/* Focus Areas */}
              <div className="space-y-3">
                <Label>학습 중점 분야 (복수 선택 가능)</Label>
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
                        className="text-gray-700 cursor-pointer"
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
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="size-5 text-blue-600 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-blue-900">AI 맞춤 생성</p>
                    <p className="text-blue-700">
                      당신의 기존 기술 스택, 학습 선호도, 경험 레벨을 분석하여 
                      가장 효율적인 학습 경로를 생성합니다.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-3">
              <Button type="submit" className="flex-1">
                <Sparkles className="size-4 mr-2" />
                AI 플랜 생성
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={() => navigate('/learning-plans')}
              >
                취소
              </Button>
            </CardFooter>
          </Card>
        </form>
      ) : (
        <GOAPVisualization targetTech={formData.targetTechName} />
      )}
    </div>
  );
}
