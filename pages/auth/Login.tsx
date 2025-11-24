import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import { Zap, Mail, Lock, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      toast.success('로그인 성공!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
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
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl animate-float-smooth pointer-events-none" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="w-full max-w-md relative z-50">
        {/* 로고 헤더 */}
        <div className="text-center mb-10 space-y-6 animate-slide-up-fluid relative z-50">
          <div className="flex justify-center">
            <div className="relative group">
              <div className="absolute inset-0 bg-primary rounded-2xl blur-xl opacity-50 animate-glow-pulse pointer-events-none"></div>
              <div className="relative bg-gradient-tech-primary rounded-2xl p-5 shadow-neon pointer-events-none">
                <Zap className="size-12 text-white" />
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <h1 className="text-5xl font-bold text-foreground">SkillWeaver</h1>
            <p className="text-muted-foreground text-lg">AI 기반 맞춤형 기술 학습 플랫폼</p>
          </div>
        </div>

        {/* 로그인 카드 */}
        <Card className="glass-card border-tech shadow-tech animate-scale-in stagger-2 relative z-50">
          <CardContent className="card-spacing relative z-50">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-base font-medium text-foreground flex items-center gap-2">
                  <Mail className="size-4 text-primary" />
                  이메일
                </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                  className="h-12 text-base bg-secondary/50 border-border focus:border-primary transition-all duration-fluid relative z-50"
              />
            </div>
              <div className="space-y-3">
                <Label htmlFor="password" className="text-base font-medium text-foreground flex items-center gap-2">
                  <Lock className="size-4 text-primary" />
                  비밀번호
                </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                  className="h-12 text-base bg-secondary/50 border-border focus:border-primary transition-all duration-fluid relative z-50"
              />
            </div>
              <Button 
                type="submit" 
                className="w-full h-13 text-base font-semibold bg-gradient-tech-primary hover-glow-primary btn-ripple shadow-neon relative z-50 cursor-pointer" 
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    로그인 중...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    로그인
                    <ArrowRight className="size-5" />
                  </span>
                )}
            </Button>
          </form>
        </CardContent>
          <CardFooter className="flex flex-col gap-4 pb-8 relative z-50">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
            <div className="text-muted-foreground text-center">
            계정이 없으신가요?{' '}
              <Link to="/signup" className="text-primary hover:text-accent font-semibold transition-colors duration-fluid hover:underline relative z-50 cursor-pointer">
              회원가입
            </Link>
          </div>
        </CardFooter>
      </Card>

        {/* 하단 텍스트 */}
        <p className="text-center text-muted-foreground text-sm mt-8 animate-fade-in-fluid stagger-3 relative z-50">
          안전한 학습 환경을 위해 최선을 다하고 있습니다
        </p>
      </div>
    </div>
  );
}
