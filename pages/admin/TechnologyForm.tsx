/**
 * 관리자용 기술 등록/수정 폼 (v2)
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Slider } from '../../components/ui/slider';
import { Badge } from '../../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  ArrowLeft,
  Save,
  Loader2,
  Database,
  Clock,
  Users,
  Briefcase,
  Map,
  Link as LinkIcon,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { technologiesApi } from '../../src/lib/api/technologies';
import type {
  SkillCategory,
  CreateTechnologyRequest,
  UpdateTechnologyRequest,
  TechnologyDetail
} from '../../src/lib/api/types';

const categories: SkillCategory[] = [
  'LANGUAGE',
  'FRAMEWORK',
  'LIBRARY',
  'TOOL',
  'DB',
  'PLATFORM',
  'ETC',
  'DEVOPS',
  'API',
  'DATABASE'
];

const categoryLabels: Record<SkillCategory, string> = {
  LANGUAGE: '언어',
  FRAMEWORK: '프레임워크',
  LIBRARY: '라이브러리',
  TOOL: '도구',
  DB: '데이터베이스',
  PLATFORM: '플랫폼',
  ETC: '기타',
  DEVOPS: 'DevOps',
  API: 'API',
  DATABASE: '데이터베이스'
};

export function TechnologyForm() {
  const { technologyId } = useParams<{ technologyId: string }>();
  const navigate = useNavigate();
  const isEditMode = !!technologyId;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [technology, setTechnology] = useState<TechnologyDetail | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    key: '',
    displayName: '',
    category: 'LANGUAGE' as SkillCategory,
    ecosystem: '',
    officialSite: '',
    // v2 fields
    learningRoadmap: '',
    estimatedLearningHours: 0,
    prerequisites: [] as string[],
    relatedTechnologies: [] as string[],
    communityPopularity: 5,
    jobMarketDemand: 5,
  });

  const [newPrerequisite, setNewPrerequisite] = useState('');
  const [newRelatedTech, setNewRelatedTech] = useState('');

  // Load existing technology data in edit mode
  useEffect(() => {
    if (isEditMode && technologyId) {
      const loadTechnology = async () => {
        try {
          setLoading(true);
          const response = await technologiesApi.getTechnology(Number(technologyId));
          if (response.success && response.data) {
            const tech = response.data;
            setTechnology(tech);
            setFormData({
              key: tech.key,
              displayName: tech.displayName,
              category: tech.category,
              ecosystem: tech.ecosystem || '',
              officialSite: tech.officialSite || '',
              learningRoadmap: tech.learningRoadmap || '',
              estimatedLearningHours: tech.estimatedLearningHours || 0,
              prerequisites: tech.prerequisites?.map(p => p.prerequisiteKey) || [],
              relatedTechnologies: tech.relatedTechnologies || [],
              communityPopularity: tech.communityPopularity || 5,
              jobMarketDemand: tech.jobMarketDemand || 5,
            });
          }
        } catch (error: any) {
          toast.error('기술 정보를 불러오는데 실패했습니다.');
          navigate('/admin/technologies');
        } finally {
          setLoading(false);
        }
      };
      loadTechnology();
    }
  }, [isEditMode, technologyId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.key || !formData.displayName) {
      toast.error('필수 항목을 입력해주세요.');
      return;
    }

    setSaving(true);

    try {
      if (isEditMode && technologyId) {
        const updateRequest: UpdateTechnologyRequest = {
          displayName: formData.displayName,
          ecosystem: formData.ecosystem || undefined,
          officialSite: formData.officialSite || undefined,
          learningRoadmap: formData.learningRoadmap || undefined,
          estimatedLearningHours: formData.estimatedLearningHours || undefined,
          prerequisites: formData.prerequisites.length > 0 ? formData.prerequisites : undefined,
          relatedTechnologies: formData.relatedTechnologies.length > 0 ? formData.relatedTechnologies : undefined,
          communityPopularity: formData.communityPopularity,
          jobMarketDemand: formData.jobMarketDemand,
        };

        const response = await technologiesApi.updateTechnology(
          Number(technologyId),
          updateRequest
        );

        if (response.success) {
          toast.success('기술이 수정되었습니다.');
          navigate(`/technologies/${technologyId}`);
        }
      } else {
        const createRequest: CreateTechnologyRequest = {
          key: formData.key,
          displayName: formData.displayName,
          category: formData.category,
          ecosystem: formData.ecosystem || undefined,
          officialSite: formData.officialSite || undefined,
          learningRoadmap: formData.learningRoadmap || undefined,
          estimatedLearningHours: formData.estimatedLearningHours || undefined,
          prerequisites: formData.prerequisites.length > 0 ? formData.prerequisites : undefined,
          relatedTechnologies: formData.relatedTechnologies.length > 0 ? formData.relatedTechnologies : undefined,
          communityPopularity: formData.communityPopularity,
          jobMarketDemand: formData.jobMarketDemand,
        };

        const response = await technologiesApi.createTechnology(createRequest);

        if (response.success) {
          toast.success('기술이 등록되었습니다.');
          navigate(`/technologies/${response.data.technologyId}`);
        }
      }
    } catch (error: any) {
      toast.error(error.message || '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const addPrerequisite = () => {
    if (newPrerequisite.trim() && !formData.prerequisites.includes(newPrerequisite.trim())) {
      setFormData({
        ...formData,
        prerequisites: [...formData.prerequisites, newPrerequisite.trim()],
      });
      setNewPrerequisite('');
    }
  };

  const removePrerequisite = (key: string) => {
    setFormData({
      ...formData,
      prerequisites: formData.prerequisites.filter((p) => p !== key),
    });
  };

  const addRelatedTech = () => {
    if (newRelatedTech.trim() && !formData.relatedTechnologies.includes(newRelatedTech.trim())) {
      setFormData({
        ...formData,
        relatedTechnologies: [...formData.relatedTechnologies, newRelatedTech.trim()],
      });
      setNewRelatedTech('');
    }
  };

  const removeRelatedTech = (key: string) => {
    setFormData({
      ...formData,
      relatedTechnologies: formData.relatedTechnologies.filter((t) => t !== key),
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="size-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => navigate(-1)}>
        <ArrowLeft className="size-4 mr-2" />
        뒤로 가기
      </Button>

      {/* Header */}
      <Card className="glass-card border-tech">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="bg-primary/20 rounded-lg p-3 border border-primary/30">
              <Database className="size-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {isEditMode ? '기술 수정' : '새 기술 등록'}
              </h1>
              <p className="text-muted-foreground">
                {isEditMode
                  ? '기술 정보와 학습 메타데이터를 수정합니다.'
                  : '새로운 기술을 카탈로그에 등록합니다.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card className="glass-card border-tech">
          <CardHeader>
            <CardTitle className="text-foreground">기본 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="key">기술 키 *</Label>
                <Input
                  id="key"
                  placeholder="예: spring-boot"
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                  disabled={isEditMode}
                />
                <p className="text-xs text-muted-foreground">
                  고유 식별자 (영문 소문자, 하이픈 사용)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">표시 이름 *</Label>
                <Input
                  id="displayName"
                  placeholder="예: Spring Boot"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">카테고리 *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value as SkillCategory })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="카테고리 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {categoryLabels[cat]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ecosystem">생태계</Label>
                <Input
                  id="ecosystem"
                  placeholder="예: JVM, JavaScript, Python"
                  value={formData.ecosystem}
                  onChange={(e) => setFormData({ ...formData, ecosystem: e.target.value })}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="officialSite">공식 사이트</Label>
                <Input
                  id="officialSite"
                  type="url"
                  placeholder="https://..."
                  value={formData.officialSite}
                  onChange={(e) => setFormData({ ...formData, officialSite: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* v2: Learning Metadata */}
        <Card className="glass-card border-tech">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Map className="size-5 text-success" />
              학습 메타데이터 (v2)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Learning Roadmap */}
            <div className="space-y-2">
              <Label htmlFor="learningRoadmap">학습 로드맵</Label>
              <Textarea
                id="learningRoadmap"
                placeholder="1단계: 기초 개념 학습&#10;2단계: 실습 프로젝트&#10;3단계: 심화 학습..."
                value={formData.learningRoadmap}
                onChange={(e) => setFormData({ ...formData, learningRoadmap: e.target.value })}
                rows={5}
              />
              <p className="text-xs text-muted-foreground">
                기술 학습을 위한 추천 로드맵을 입력하세요.
              </p>
            </div>

            {/* Estimated Learning Hours */}
            <div className="space-y-2">
              <Label htmlFor="estimatedLearningHours" className="flex items-center gap-2">
                <Clock className="size-4" />
                예상 학습 시간 (시간)
              </Label>
              <Input
                id="estimatedLearningHours"
                type="number"
                min="0"
                max="1000"
                placeholder="예: 60"
                value={formData.estimatedLearningHours || ''}
                onChange={(e) => setFormData({ ...formData, estimatedLearningHours: Number(e.target.value) })}
              />
            </div>

            {/* Prerequisites */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                선행 지식
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder="예: java"
                  value={newPrerequisite}
                  onChange={(e) => setNewPrerequisite(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPrerequisite())}
                />
                <Button type="button" variant="outline" onClick={addPrerequisite}>
                  추가
                </Button>
              </div>
              {formData.prerequisites.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.prerequisites.map((prereq) => (
                    <Badge key={prereq} variant="secondary" className="flex items-center gap-1">
                      {prereq}
                      <button
                        type="button"
                        onClick={() => removePrerequisite(prereq)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Related Technologies */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <LinkIcon className="size-4" />
                관련 기술
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder="예: spring-framework"
                  value={newRelatedTech}
                  onChange={(e) => setNewRelatedTech(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRelatedTech())}
                />
                <Button type="button" variant="outline" onClick={addRelatedTech}>
                  추가
                </Button>
              </div>
              {formData.relatedTechnologies.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.relatedTechnologies.map((tech) => (
                    <Badge key={tech} variant="secondary" className="flex items-center gap-1">
                      {tech}
                      <button
                        type="button"
                        onClick={() => removeRelatedTech(tech)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* v2: Popularity & Demand */}
        <Card className="glass-card border-tech">
          <CardHeader>
            <CardTitle className="text-foreground">인기도 및 시장 수요</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Community Popularity */}
            <div className="space-y-4">
              <Label className="flex items-center gap-2">
                <Users className="size-4" />
                커뮤니티 인기도: {formData.communityPopularity}/10
              </Label>
              <Slider
                value={[formData.communityPopularity]}
                onValueChange={(value) => setFormData({ ...formData, communityPopularity: value[0] })}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                커뮤니티 활성도, 학습 자료 풍부함, 채용 공고 빈도 등을 고려하세요.
              </p>
            </div>

            {/* Job Market Demand */}
            <div className="space-y-4">
              <Label className="flex items-center gap-2">
                <Briefcase className="size-4" />
                취업 시장 수요: {formData.jobMarketDemand}/10
              </Label>
              <Slider
                value={[formData.jobMarketDemand]}
                onValueChange={(value) => setFormData({ ...formData, jobMarketDemand: value[0] })}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                현재 채용 시장에서의 수요, 급여 수준, 성장 가능성을 고려하세요.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            disabled={saving}
          >
            취소
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                저장 중...
              </>
            ) : (
              <>
                <Save className="size-4 mr-2" />
                {isEditMode ? '수정하기' : '등록하기'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
