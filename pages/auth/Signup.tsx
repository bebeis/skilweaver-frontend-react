import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import { Switch } from '../../components/ui/switch';
import { GraduationCap } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    targetTrack: 'BACKEND',
    experienceLevel: 'BEGINNER',
    dailyMinutes: 60,
    preferKorean: true,
    learningStyle: 'BALANCED',
    weekendBoost: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('모든 필수 항목을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      await signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        targetTrack: formData.targetTrack,
        experienceLevel: formData.experienceLevel,
        learningPreference: {
          dailyMinutes: formData.dailyMinutes,
          preferKorean: formData.preferKorean,
          learningStyle: formData.learningStyle,
          weekendBoost: formData.weekendBoost
        }
      });
      toast.success('회원가입 완료! 환영합니다 🎉');
      navigate('/dashboard');
    } catch (error) {
      toast.error('회원가입에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 rounded-full p-3">
              <GraduationCap className="size-8 text-white" />
            </div>
          </div>
          <CardTitle>SkillWeaver 회원가입</CardTitle>
          <CardDescription>
            당신의 학습 여정을 시작하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">이름</Label>
                <Input
                  id="name"
                  placeholder="홍길동"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Track & Experience */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>목표 트랙</Label>
                <Select 
                  value={formData.targetTrack}
                  onValueChange={(value) => setFormData({ ...formData, targetTrack: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BACKEND">백엔드</SelectItem>
                    <SelectItem value="FRONTEND">프론트엔드</SelectItem>
                    <SelectItem value="FULLSTACK">풀스택</SelectItem>
                    <SelectItem value="MOBILE">모바일</SelectItem>
                    <SelectItem value="DEVOPS">데브옵스</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>경험 레벨</Label>
                <Select 
                  value={formData.experienceLevel}
                  onValueChange={(value) => setFormData({ ...formData, experienceLevel: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BEGINNER">입문</SelectItem>
                    <SelectItem value="INTERMEDIATE">중급</SelectItem>
                    <SelectItem value="ADVANCED">고급</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Learning Preferences */}
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-gray-900">학습 선호도</h3>
              
              <div className="space-y-2">
                <Label htmlFor="dailyMinutes">하루 학습 시간 (분)</Label>
                <Input
                  id="dailyMinutes"
                  type="number"
                  min="15"
                  max="480"
                  value={formData.dailyMinutes}
                  onChange={(e) => setFormData({ ...formData, dailyMinutes: parseInt(e.target.value) })}
                />
              </div>
              
              <div className="space-y-2">
                <Label>학습 스타일</Label>
                <Select 
                  value={formData.learningStyle}
                  onValueChange={(value) => setFormData({ ...formData, learningStyle: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HANDS_ON">실습 중심</SelectItem>
                    <SelectItem value="THEORY_FIRST">이론 우선</SelectItem>
                    <SelectItem value="BALANCED">균형잡힌</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="preferKorean">한국어 자료 선호</Label>
                <Switch
                  id="preferKorean"
                  checked={formData.preferKorean}
                  onCheckedChange={(checked) => setFormData({ ...formData, preferKorean: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="weekendBoost">주말 학습 강화</Label>
                <Switch
                  id="weekendBoost"
                  checked={formData.weekendBoost}
                  onCheckedChange={(checked) => setFormData({ ...formData, weekendBoost: checked })}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '가입 중...' : '회원가입'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <div className="text-gray-600 text-center">
            이미 계정이 있으신가요?{' '}
            <Link to="/login" className="text-blue-600 hover:underline">
              로그인
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
