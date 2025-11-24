import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/card';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '../../components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { skillsApi, technologiesApi } from '../../src/lib/api';
import { useAuth } from '../../hooks/useAuth';

interface Technology {
  technologyId: number;
  displayName: string;
}

export function SkillForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { skillId } = useParams();
  const isEdit = !!skillId;

  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loadingTechnologies, setLoadingTechnologies] = useState(false);
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [formData, setFormData] = useState({
    technologyId: '',
    technologyName: '',
    customName: '',
    level: 'BEGINNER',
    yearsOfUse: 0,
    lastUsedAt: new Date().toISOString().split('T')[0],
    note: ''
  });

  // Load technologies on component mount
  useEffect(() => {
    const loadTechnologies = async () => {
      try {
        setLoadingTechnologies(true);
        const response = await technologiesApi.getTechnologies({ size: 100 });
        if (response.success) {
          // Handle both response formats:
          // 1. { technologies: [...] } - from API spec
          // 2. [...] - direct array from actual API
          const techList = Array.isArray(response.data)
            ? response.data
            : response.data?.technologies || [];
          setTechnologies(techList);
        }
      } catch (error) {
        console.error('Failed to load technologies:', error);
        toast.error('기술 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoadingTechnologies(false);
      }
    };

    loadTechnologies();
  }, []);

  useEffect(() => {
    // If editing, load existing skill data
    if (isEdit) {
      // Mock loading existing skill - TODO: fetch actual skill data from API
      setFormData({
        technologyId: '1',
        technologyName: 'Java',
        customName: '',
        level: 'ADVANCED',
        yearsOfUse: 3,
        lastUsedAt: '2025-11-20',
        note: 'Spring Boot 프로젝트 경험 다수'
      });
    }
  }, [isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.technologyName && !formData.customName) {
      toast.error('기술을 선택하거나 직접 입력해주세요.');
      return;
    }

    if (!user) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    try {
      setSubmitting(true);
      // API 스펙: technologyId 또는 customName 중 하나는 반드시 값이 있어야 함
      const skillData = {
        technologyId: formData.technologyId ? Number(formData.technologyId) : null,
        customName: formData.customName || null,
        level: formData.level,
        yearsOfUse: formData.yearsOfUse,
        lastUsedAt: formData.lastUsedAt,
        note: formData.note
      };

      if (isEdit) {
        await skillsApi.updateSkill(Number(user.id), Number(skillId), skillData);
        toast.success('기술이 수정되었습니다.');
      } else {
        await skillsApi.addSkill(Number(user.id), skillData);
        toast.success('기술이 추가되었습니다.');
      }

      navigate('/skills');
    } catch (error: any) {
      toast.error(error.message || '요청 처리에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTechnologySelect = (techId: number, techName: string) => {
    setFormData({
      ...formData,
      technologyId: String(techId),
      technologyName: techName,
      customName: ''
    });
    setSearchValue('');
    setOpen(false);
  };

  const filteredTechnologies = technologies.filter(tech =>
    tech.displayName.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">{isEdit ? '기술 수정' : '기술 추가'}</h1>
        <p className="text-muted-foreground text-lg font-medium mt-1">
          보유한 기술 정보를 입력해주세요
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="glass-card border-tech">
          <CardHeader>
            <CardTitle className="text-foreground">기술 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Technology Selection */}
            <div className="space-y-2">
              <Label className="text-foreground font-semibold">기술 선택</Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    role="combobox"
                    aria-expanded={open}
                    className="flex w-full items-center justify-between gap-2 rounded-md border border-input bg-secondary/50 text-foreground px-3 py-2 text-sm transition-[color,box-shadow] outline-none hover:bg-secondary/70 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                  >
                    <span>{formData.technologyName || "기술 검색..."}</span>
                    <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                  <Command>
                    <CommandInput
                      placeholder="기술 검색..."
                      value={searchValue}
                      onValueChange={setSearchValue}
                      className="text-foreground"
                      disabled={loadingTechnologies}
                    />
                    {loadingTechnologies && (
                      <div className="p-2 text-center text-sm text-muted-foreground">
                        <Loader2 className="inline size-4 animate-spin mr-2" />
                        로딩 중...
                      </div>
                    )}
                    {!loadingTechnologies && filteredTechnologies.length === 0 && (
                      <CommandEmpty className="text-muted-foreground">
                        {technologies.length === 0 ? '기술을 불러올 수 없습니다.' : '검색 결과가 없습니다.'}
                      </CommandEmpty>
                    )}
                    {!loadingTechnologies && (
                      <CommandGroup>
                        {filteredTechnologies.map((tech) => (
                          <CommandItem
                            key={tech.technologyId}
                            value={tech.displayName}
                            onSelect={() => handleTechnologySelect(tech.technologyId, tech.displayName)}
                          >
                            <Check
                              className={`mr-2 size-4 ${
                                formData.technologyId === String(tech.technologyId) ? "opacity-100" : "opacity-0"
                              }`}
                            />
                            {tech.displayName}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </Command>
                </PopoverContent>
              </Popover>
              <p className="text-muted-foreground font-medium">
                또는 아래에 직접 입력하세요
              </p>
            </div>

            {/* Custom Name */}
            <div className="space-y-2">
              <Label htmlFor="customName" className="text-foreground font-semibold">직접 입력 (선택사항)</Label>
              <Input
                id="customName"
                placeholder="예: 내부 프레임워크 XYZ"
                value={formData.customName}
                onChange={(e) => setFormData({ ...formData, customName: e.target.value })}
                className="bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Level */}
            <div className="space-y-2">
              <Label className="text-foreground font-semibold">숙련도</Label>
              <Select 
                value={formData.level}
                onValueChange={(value) => setFormData({ ...formData, level: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BEGINNER">입문 - 기본 사용 가능</SelectItem>
                  <SelectItem value="INTERMEDIATE">중급 - 실무 활용 가능</SelectItem>
                  <SelectItem value="ADVANCED">고급 - 깊은 이해와 응용</SelectItem>
                  <SelectItem value="EXPERT">전문가 - 타인 교육 가능</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Years of Use */}
            <div className="space-y-2">
              <Label htmlFor="yearsOfUse" className="text-foreground font-semibold">사용 경력 (년)</Label>
              <Input
                id="yearsOfUse"
                type="number"
                min="0"
                step="0.1"
                value={formData.yearsOfUse}
                onChange={(e) => setFormData({ ...formData, yearsOfUse: parseFloat(e.target.value) })}
                className="bg-secondary/50 border-border text-foreground"
              />
            </div>

            {/* Last Used At */}
            <div className="space-y-2">
              <Label htmlFor="lastUsedAt" className="text-foreground font-semibold">최근 사용일</Label>
              <Input
                id="lastUsedAt"
                type="date"
                value={formData.lastUsedAt}
                onChange={(e) => setFormData({ ...formData, lastUsedAt: e.target.value })}
                className="bg-secondary/50 border-border text-foreground"
              />
            </div>

            {/* Note */}
            <div className="space-y-2">
              <Label htmlFor="note" className="text-foreground font-semibold">메모 (선택사항)</Label>
              <Textarea
                id="note"
                placeholder="이 기술과 관련된 프로젝트 경험, 특이사항 등을 기록하세요"
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                rows={4}
                className="bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </CardContent>
          <CardFooter className="flex gap-3">
            <Button
              type="submit"
              className="flex-1 relative z-10"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  처리 중...
                </>
              ) : (
                isEdit ? '수정 완료' : '추가하기'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1 relative z-10"
              onClick={() => navigate('/skills')}
              disabled={submitting}
            >
              취소
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
