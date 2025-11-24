import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import { GraduationCap, Sparkles, TrendingUp, Brain, Zap } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-indigo-200 flex items-center justify-center p-4 relative overflow-hidden">
      {/* 배경 장식 요소 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
        {/* 왼쪽: 마케팅 섹션 */}
        <div className="hidden lg:block space-y-8 animate-fade-in">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm shadow-soft">
              <Sparkles className="size-5 text-purple-600" />
              <span className="text-sm font-semibold text-purple-900">AI 기반 맞춤형 학습</span>
            </div>
            <h1 className="text-5xl font-bold text-slate-900 leading-tight">
              당신만을 위한<br />
              <span className="text-gradient">스마트 학습 여정</span>
            </h1>
            <p className="text-xl text-slate-600">
              AI가 분석한 맞춤형 학습 플랜으로 더 빠르게, 더 효율적으로 성장하세요.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: Brain, title: 'AI 맞춤 분석', desc: '당신의 기술 스택을 분석하여 최적의 학습 경로 제공' },
              { icon: TrendingUp, title: '체계적 성장', desc: '단계별 로드맵으로 확실한 실력 향상' },
              { icon: Zap, title: '빠른 학습', desc: '핵심만 골라 배우는 효율적인 커리큘럼' },
            ].map((feature, index) => (
              <div key={index} className="flex items-start gap-4 p-4 rounded-2xl bg-white/60 backdrop-blur-sm shadow-soft hover:shadow-lg transition-all duration-300 animate-slide-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-3 shadow-glow-primary">
                  <feature.icon className="size-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">{feature.title}</h3>
                  <p className="text-sm text-slate-600">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 오른쪽: 로그인 폼 */}
        <Card className="w-full shadow-2xl border-0 backdrop-blur-sm bg-white/95 animate-slide-in-up">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="flex justify-center">
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-4 shadow-glow-primary animate-float">
                <GraduationCap className="size-10 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold">SkillWeaver</CardTitle>
              <CardDescription className="text-base">
            AI 기반 맞춤형 기술 학습 플랫폼
          </CardDescription>
            </div>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-medium">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                  className="h-12 text-base"
              />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password" className="text-base font-medium">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                  className="h-12 text-base"
              />
            </div>
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-glow-primary btn-glow" 
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    로그인 중...
                  </span>
                ) : (
                  '로그인'
                )}
            </Button>
          </form>
        </CardContent>
          <CardFooter className="flex flex-col gap-3 pb-8">
            <div className="text-slate-600 text-center">
            계정이 없으신가요?{' '}
              <Link to="/signup" className="text-purple-600 hover:text-purple-700 font-semibold hover:underline">
              회원가입
            </Link>
          </div>
        </CardFooter>
      </Card>
      </div>
    </div>
  );
}
