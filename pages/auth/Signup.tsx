import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import { Switch } from '../../components/ui/switch';
import { Zap, User, Mail, Lock, Target, TrendingUp, Clock, BookOpen, ArrowRight } from 'lucide-react';
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
    learningStyle: 'PROJECT_BASED',
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
    <div className="min-h-screen bg-background gradient-mesh flex items-center justify-center p-6 relative overflow-hidden">
      {/* 배경 애니메이션 효과 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-primary/20 rounded-full filter blur-3xl animate-float-smooth pointer-events-none"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/20 rounded-full filter blur-3xl animate-float-smooth pointer-events-none" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="w-full max-w-4xl relative z-50">
        {/* 로고 헤더 */}
        <div className="text-center mb-8 space-y-4 animate-slide-up-fluid relative z-50">
          <div className="flex justify-center">
            <div className="relative group">
              <div className="absolute inset-0 bg-primary rounded-2xl blur-xl opacity-50 animate-glow-pulse pointer-events-none"></div>
              <div className="relative bg-gradient-tech-primary rounded-2xl p-4 shadow-neon pointer-events-none">
                <Zap className="size-10 text-white" />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">SkillWeaver 회원가입</h1>
            <p className="text-muted-foreground text-lg">당신의 학습 여정을 시작하세요</p>
          </div>
        </div>

      <Card className="glass-card border-tech shadow-tech animate-scale-in stagger-2 relative z-50">
        <CardHeader className="pb-6 relative z-50">
        </CardHeader>
        <CardContent className="card-spacing relative z-50">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info */}
            <div className="space-y-5">
              <div className="space-y-3">
                <Label htmlFor="name" className="flex items-center gap-2 text-base font-medium text-foreground">
                  <User className="size-4 text-primary" />
                  이름
                </Label>
                <Input
                  id="name"
                  placeholder="홍길동"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="h-12 bg-secondary/50 border-border focus:border-primary transition-all duration-fluid relative z-50"
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="email" className="flex items-center gap-2 text-base font-medium text-foreground">
                  <Mail className="size-4 text-primary" />
                  이메일
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="h-12 bg-secondary/50 border-border focus:border-primary transition-all duration-fluid relative z-50"
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="password" className="flex items-center gap-2 text-base font-medium text-foreground">
                  <Lock className="size-4 text-primary" />
                  비밀번호
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="h-12 bg-secondary/50 border-border focus:border-primary transition-all duration-fluid relative z-50"
                />
              </div>
            </div>

            {/* Track & Experience */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-base font-medium text-foreground">
                  <Target className="size-4 text-accent" />
                  목표 트랙
                </Label>
                <Select 
                  value={formData.targetTrack}
                  onValueChange={(value) => setFormData({ ...formData, targetTrack: value })}
                >
                  <SelectTrigger className="h-12 bg-secondary/50 border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BACKEND">백엔드</SelectItem>
                    <SelectItem value="FRONTEND">프론트엔드</SelectItem>
                    <SelectItem value="FULLSTACK">풀스택</SelectItem>
                    <SelectItem value="MOBILE">모바일</SelectItem>
                    <SelectItem value="DATA">데이터</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-base font-medium text-foreground">
                  <TrendingUp className="size-4 text-accent" />
                  경험 레벨
                </Label>
                <Select 
                  value={formData.experienceLevel}
                  onValueChange={(value) => setFormData({ ...formData, experienceLevel: value })}
                >
                  <SelectTrigger className="h-12 bg-secondary/50 border-border">
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
            <div className="space-y-5 p-6 glass-card border-tech rounded-xl">
              <h3 className="font-semibold text-foreground flex items-center gap-2 text-lg">
                <BookOpen className="size-5 text-primary" />
                학습 선호도
              </h3>
              
              <div className="space-y-3">
                <Label htmlFor="dailyMinutes" className="flex items-center gap-2 text-foreground">
                  <Clock className="size-4 text-primary" />
                  하루 학습 시간 (분)
                </Label>
                <Input
                  id="dailyMinutes"
                  type="number"
                  min="15"
                  max="480"
                  value={formData.dailyMinutes}
                  onChange={(e) => setFormData({ ...formData, dailyMinutes: parseInt(e.target.value) })}
                  className="h-12 bg-secondary/50 border-border"
                />
              </div>
              
              <div className="space-y-3">
                <Label className="text-foreground">학습 스타일</Label>
                <Select 
                  value={formData.learningStyle}
                  onValueChange={(value) => setFormData({ ...formData, learningStyle: value })}
                >
                  <SelectTrigger className="h-12 bg-secondary/50 border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DOC_FIRST">문서 우선</SelectItem>
                    <SelectItem value="VIDEO_FIRST">영상 우선</SelectItem>
                    <SelectItem value="PROJECT_BASED">프로젝트 중심</SelectItem>
                    <SelectItem value="BALANCED">균형잡힌</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg transition-all duration-fluid hover:bg-secondary/50">
                <Label htmlFor="preferKorean" className="cursor-pointer text-foreground">한국어 자료 선호</Label>
                <Switch
                  id="preferKorean"
                  checked={formData.preferKorean}
                  onCheckedChange={(checked) => setFormData({ ...formData, preferKorean: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg transition-all duration-fluid hover:bg-secondary/50">
                <Label htmlFor="weekendBoost" className="cursor-pointer text-foreground">주말 학습 강화</Label>
                <Switch
                  id="weekendBoost"
                  checked={formData.weekendBoost}
                  onCheckedChange={(checked) => setFormData({ ...formData, weekendBoost: checked })}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-13 text-base font-semibold bg-gradient-tech-primary hover-glow-primary btn-ripple shadow-neon relative z-50 cursor-pointer" 
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  가입 중...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  회원가입
                  <ArrowRight className="size-5" />
                </span>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 pb-8 relative z-50">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
          <div className="text-muted-foreground text-center">
            이미 계정이 있으신가요?{' '}
            <Link to="/login" className="text-primary hover:text-accent font-semibold transition-colors duration-fluid hover:underline relative z-50 cursor-pointer">
              로그인
            </Link>
          </div>
        </CardFooter>
      </Card>
      </div>
    </div>
  );
}
