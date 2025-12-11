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
import { Badge } from '../../components/ui/badge';
import { Check, ChevronsUpDown, Loader2, Database } from 'lucide-react';
import { toast } from 'sonner';
import { skillsApi, technologiesApi } from '../../src/lib/api';
import { useAuth } from '../../hooks/useAuth';

// V4: Technology는 name 기반
interface Technology {
  name: string;
  displayName: string;
  category?: string;
  difficulty?: string;
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
  
  // V4: technologyId → technologyName
  const [formData, setFormData] = useState({
    technologyName: '',       // V4: Neo4j name (예: "spring-boot")
    displayName: '',          // 화면 표시용
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
        // V4: limit 파라미터 사용
        const response = await technologiesApi.getTechnologies({ limit: 200 });
        if (response.success) {
          const techList = Array.isArray(response.data)
            ? response.data
            : response.data?.technologies || [];
          // V4: name 기반으로 매핑
          setTechnologies(techList.map((t: any) => ({
            name: t.name,
            displayName: t.displayName,
            category: t.category,
            difficulty: t.difficulty
          })));
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
    // TODO: API에서 실제 스킬 데이터 조회 구현
    if (isEdit && user) {
      // Mock loading existing skill
      setFormData({
        technologyName: 'java',
        displayName: 'Java',
        level: 'ADVANCED',
        yearsOfUse: 3,
        lastUsedAt: '2025-11-20',
        note: 'Spring Boot 프로젝트 경험 다수'
      });
    }
  }, [isEdit, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.technologyName) {
      toast.error('기술을 선택해주세요.');
      return;
    }

    if (!user) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    try {
      setSubmitting(true);
      // V4: technologyName 기반 요청
      const skillData = {
        technologyName: formData.technologyName,
        level: formData.level,
        yearsOfUse: formData.yearsOfUse,
        lastUsedAt: formData.lastUsedAt,
        note: formData.note || undefined
      };

      if (isEdit) {
        // UpdateSkillRequest는 technologyName 제외
        await skillsApi.updateSkill(Number(user.id), Number(skillId), {
          level: skillData.level,
          yearsOfUse: skillData.yearsOfUse,
          lastUsedAt: skillData.lastUsedAt,
          note: skillData.note
        });
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

  // V4: name 기반 선택
  const handleTechnologySelect = (tech: Technology) => {
    setFormData({
      ...formData,
      technologyName: tech.name,
      displayName: tech.displayName
    });
    setSearchValue('');
    setOpen(false);
  };

  const filteredTechnologies = technologies.filter(tech =>
    tech.displayName.toLowerCase().includes(searchValue.toLowerCase()) ||
    tech.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  const selectedTech = technologies.find(t => t.name === formData.technologyName);

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
            {/* Technology Selection - V4: name 기반 */}
            <div className="space-y-2">
              <Label className="text-foreground font-semibold">기술 선택 *</Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    role="combobox"
                    aria-expanded={open}
                    disabled={isEdit}
                    className="flex w-full items-center justify-between gap-2 rounded-md border border-input bg-secondary/50 text-foreground px-3 py-2 text-sm transition-[color,box-shadow] outline-none hover:bg-secondary/70 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-2">
                      {formData.technologyName ? (
                        <>
                          <Database className="size-4 text-primary" />
                          <span>{formData.displayName || formData.technologyName}</span>
                          {selectedTech?.category && (
                            <Badge variant="outline" className="text-xs">
                              {selectedTech.category}
                            </Badge>
                          )}
                        </>
                      ) : (
                        <span className="text-muted-foreground">기술 검색...</span>
                      )}
                    </div>
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
                      <CommandEmpty className="text-muted-foreground p-4 text-center">
                        {technologies.length === 0 ? '기술을 불러올 수 없습니다.' : '검색 결과가 없습니다.'}
                      </CommandEmpty>
                    )}
                    {!loadingTechnologies && (
                      <CommandGroup className="max-h-64 overflow-auto">
                        {filteredTechnologies.map((tech) => (
                          <CommandItem
                            key={tech.name}
                            value={tech.displayName}
                            onSelect={() => handleTechnologySelect(tech)}
                            className="flex items-center gap-2"
                          >
                            <Check
                              className={`size-4 ${
                                formData.technologyName === tech.name ? "opacity-100" : "opacity-0"
                              }`}
                            />
                            <Database className="size-4 text-muted-foreground" />
                            <span className="flex-1">{tech.displayName}</span>
                            {tech.category && (
                              <Badge variant="outline" className="text-xs">
                                {tech.category}
                              </Badge>
                            )}
                            {tech.difficulty && (
                              <Badge variant="secondary" className="text-xs">
                                {tech.difficulty}
                              </Badge>
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </Command>
                </PopoverContent>
              </Popover>
              {isEdit && (
                <p className="text-sm text-muted-foreground">
                  수정 시에는 기술을 변경할 수 없습니다.
                </p>
              )}
            </div>

            {/* Level */}
            <div className="space-y-2">
              <Label className="text-foreground font-semibold">숙련도 *</Label>
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
              <Label htmlFor="yearsOfUse" className="text-foreground font-semibold">사용 경력 (년) *</Label>
              <Input
                id="yearsOfUse"
                type="number"
                min="0"
                max="50"
                step="0.5"
                value={formData.yearsOfUse}
                onChange={(e) => setFormData({ ...formData, yearsOfUse: parseFloat(e.target.value) || 0 })}
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
              disabled={submitting || !formData.technologyName}
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
