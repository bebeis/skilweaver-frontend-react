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
import { Check, ChevronsUpDown } from 'lucide-react';
import { toast } from 'sonner';

// Mock technologies for search
const mockTechnologies = [
  { id: '1', name: 'Java' },
  { id: '2', name: 'JavaScript' },
  { id: '3', name: 'TypeScript' },
  { id: '4', name: 'Python' },
  { id: '5', name: 'Go' },
  { id: '6', name: 'React' },
  { id: '7', name: 'Vue.js' },
  { id: '8', name: 'Spring Boot' },
  { id: '9', name: 'Django' },
  { id: '10', name: 'Docker' },
  { id: '11', name: 'Kubernetes' },
  { id: '12', name: 'PostgreSQL' },
  { id: '13', name: 'MongoDB' },
  { id: '14', name: 'Redis' },
];

export function SkillForm() {
  const navigate = useNavigate();
  const { skillId } = useParams();
  const isEdit = !!skillId;

  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [formData, setFormData] = useState({
    technologyId: '',
    technologyName: '',
    customName: '',
    level: 'BEGINNER',
    yearsOfUse: 0,
    lastUsedAt: new Date().toISOString().split('T')[0],
    note: ''
  });

  useEffect(() => {
    // If editing, load existing skill data
    if (isEdit) {
      // Mock loading existing skill
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.technologyName && !formData.customName) {
      toast.error('기술을 선택하거나 직접 입력해주세요.');
      return;
    }

    // Mock API call
    toast.success(isEdit ? '기술이 수정되었습니다.' : '기술이 추가되었습니다.');
    navigate('/skills');
  };

  const handleTechnologySelect = (techId: string, techName: string) => {
    setFormData({
      ...formData,
      technologyId: techId,
      technologyName: techName,
      customName: ''
    });
    setOpen(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-gray-900">{isEdit ? '기술 수정' : '기술 추가'}</h1>
        <p className="text-gray-600 mt-1">
          보유한 기술 정보를 입력해주세요
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>기술 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Technology Selection */}
            <div className="space-y-2">
              <Label>기술 선택</Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                  >
                    {formData.technologyName || "기술 검색..."}
                    <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput 
                      placeholder="기술 검색..." 
                      value={searchValue}
                      onValueChange={setSearchValue}
                    />
                    <CommandEmpty>검색 결과가 없습니다.</CommandEmpty>
                    <CommandGroup>
                      {mockTechnologies
                        .filter(tech => 
                          tech.name.toLowerCase().includes(searchValue.toLowerCase())
                        )
                        .map((tech) => (
                          <CommandItem
                            key={tech.id}
                            value={tech.name}
                            onSelect={() => handleTechnologySelect(tech.id, tech.name)}
                          >
                            <Check
                              className={`mr-2 size-4 ${
                                formData.technologyId === tech.id ? "opacity-100" : "opacity-0"
                              }`}
                            />
                            {tech.name}
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <p className="text-gray-600">
                또는 아래에 직접 입력하세요
              </p>
            </div>

            {/* Custom Name */}
            <div className="space-y-2">
              <Label htmlFor="customName">직접 입력 (선택사항)</Label>
              <Input
                id="customName"
                placeholder="예: 내부 프레임워크 XYZ"
                value={formData.customName}
                onChange={(e) => setFormData({ ...formData, customName: e.target.value })}
              />
            </div>

            {/* Level */}
            <div className="space-y-2">
              <Label>숙련도</Label>
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
              <Label htmlFor="yearsOfUse">사용 경력 (년)</Label>
              <Input
                id="yearsOfUse"
                type="number"
                min="0"
                step="0.1"
                value={formData.yearsOfUse}
                onChange={(e) => setFormData({ ...formData, yearsOfUse: parseFloat(e.target.value) })}
              />
            </div>

            {/* Last Used At */}
            <div className="space-y-2">
              <Label htmlFor="lastUsedAt">최근 사용일</Label>
              <Input
                id="lastUsedAt"
                type="date"
                value={formData.lastUsedAt}
                onChange={(e) => setFormData({ ...formData, lastUsedAt: e.target.value })}
              />
            </div>

            {/* Note */}
            <div className="space-y-2">
              <Label htmlFor="note">메모 (선택사항)</Label>
              <Textarea
                id="note"
                placeholder="이 기술과 관련된 프로젝트 경험, 특이사항 등을 기록하세요"
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                rows={4}
              />
            </div>
          </CardContent>
          <CardFooter className="flex gap-3">
            <Button type="submit" className="flex-1">
              {isEdit ? '수정 완료' : '추가하기'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
              onClick={() => navigate('/skills')}
            >
              취소
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
