import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import { Switch } from '../../components/ui/switch';
import { GraduationCap, User, Mail, Lock, Target, TrendingUp, Clock, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

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
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-indigo-200 flex items-center justify-center p-4 relative overflow-hidden">
      {/* 배경 장식 요소 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      <Card className="w-full max-w-3xl shadow-2xl border-0 backdrop-blur-sm bg-white/95 relative z-10 animate-slide-in-up">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="flex justify-center">
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-4 shadow-glow-primary animate-float">
              <GraduationCap className="size-10 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold">SkillWeaver 회원가입</CardTitle>
            <CardDescription className="text-base">
            당신의 학습 여정을 시작하세요
          </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2 text-base font-medium">
                  <User className="size-4 text-purple-600" />
                  이름
                </Label>
                <Input
                  id="name"
                  placeholder="홍길동"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="h-11"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-base font-medium">
                  <Mail className="size-4 text-purple-600" />
                  이메일
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="h-11"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2 text-base font-medium">
                  <Lock className="size-4 text-purple-600" />
                  비밀번호
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="h-11"
                />
              </div>
            </div>

            {/* Track & Experience */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-base font-medium">
                  <Target className="size-4 text-indigo-600" />
                  목표 트랙
                </Label>
                <Select 
                  value={formData.targetTrack}
                  onValueChange={(value) => setFormData({ ...formData, targetTrack: value })}
                >
                  <SelectTrigger className="h-11">
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
                <Label className="flex items-center gap-2 text-base font-medium">
                  <TrendingUp className="size-4 text-indigo-600" />
                  경험 레벨
                </Label>
                <Select 
                  value={formData.experienceLevel}
                  onValueChange={(value) => setFormData({ ...formData, experienceLevel: value })}
                >
                  <SelectTrigger className="h-11">
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
            <div className="space-y-4 p-5 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <BookOpen className="size-5 text-purple-600" />
                학습 선호도
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="dailyMinutes" className="flex items-center gap-2">
                  <Clock className="size-4 text-purple-600" />
                  하루 학습 시간 (분)
                </Label>
                <Input
                  id="dailyMinutes"
                  type="number"
                  min="15"
                  max="480"
                  value={formData.dailyMinutes}
                  onChange={(e) => setFormData({ ...formData, dailyMinutes: parseInt(e.target.value) })}
                  className="h-11"
                />
              </div>
              
              <div className="space-y-2">
                <Label>학습 스타일</Label>
                <Select 
                  value={formData.learningStyle}
                  onValueChange={(value) => setFormData({ ...formData, learningStyle: value })}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HANDS_ON">실습 중심</SelectItem>
                    <SelectItem value="THEORY_FIRST">이론 우선</SelectItem>
                    <SelectItem value="BALANCED">균형잡힌</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <Label htmlFor="preferKorean" className="cursor-pointer">한국어 자료 선호</Label>
                <Switch
                  id="preferKorean"
                  checked={formData.preferKorean}
                  onCheckedChange={(checked) => setFormData({ ...formData, preferKorean: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <Label htmlFor="weekendBoost" className="cursor-pointer">주말 학습 강화</Label>
                <Switch
                  id="weekendBoost"
                  checked={formData.weekendBoost}
                  onCheckedChange={(checked) => setFormData({ ...formData, weekendBoost: checked })}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-glow-primary btn-glow" 
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  가입 중...
                </span>
              ) : (
                '회원가입'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 pb-6">
          <div className="text-slate-600 text-center">
            이미 계정이 있으신가요?{' '}
            <Link to="/login" className="text-purple-600 hover:text-purple-700 font-semibold hover:underline">
              로그인
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
