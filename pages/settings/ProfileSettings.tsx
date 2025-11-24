import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/card';
import { Switch } from '../../components/ui/switch';
import { Separator } from '../../components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../components/ui/alert-dialog';
import { User, Settings, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export function ProfileSettings() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    targetTrack: user?.targetTrack || 'BACKEND',
    experienceLevel: user?.experienceLevel || 'BEGINNER',
    dailyMinutes: 60,
    preferKorean: true,
    learningStyle: 'BALANCED',
    weekendBoost: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateUser({
      name: formData.name,
      targetTrack: formData.targetTrack,
      experienceLevel: formData.experienceLevel
    });
    
    toast.success('프로필이 업데이트되었습니다.');
  };

  const handleDeleteAccount = () => {
    // Mock API call
    toast.success('계정이 삭제되었습니다.');
    logout();
    navigate('/login');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">프로필 설정</h1>
        <p className="text-muted-foreground text-lg font-medium mt-1">
          계정 정보와 학습 선호도를 관리하세요
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card className="glass-card border-tech">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <User className="size-5 text-primary" />
              기본 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground font-semibold">이름</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="bg-secondary/50 border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-semibold">이메일</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                disabled
                className="bg-muted/50 text-muted-foreground"
              />
              <p className="text-muted-foreground font-medium">이메일은 변경할 수 없습니다.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground font-semibold">목표 트랙</Label>
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
                <Label className="text-foreground font-semibold">경험 레벨</Label>
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
          </CardContent>
        </Card>

        {/* Learning Preferences */}
        <Card className="glass-card border-tech">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Settings className="size-5 text-primary" />
              학습 선호도
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="dailyMinutes" className="text-foreground font-semibold">하루 학습 시간 (분)</Label>
              <Input
                id="dailyMinutes"
                type="number"
                min="15"
                max="480"
                value={formData.dailyMinutes}
                onChange={(e) => setFormData({ ...formData, dailyMinutes: parseInt(e.target.value) })}
                className="bg-secondary/50 border-border text-foreground"
              />
              <p className="text-muted-foreground font-medium">
                현재: {formData.dailyMinutes}분 ({Math.floor(formData.dailyMinutes / 60)}시간 {formData.dailyMinutes % 60}분)
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground font-semibold">학습 스타일</Label>
              <Select 
                value={formData.learningStyle}
                onValueChange={(value) => setFormData({ ...formData, learningStyle: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HANDS_ON">실습 중심 - 코드를 직접 작성하며 학습</SelectItem>
                  <SelectItem value="THEORY_FIRST">이론 우선 - 개념을 먼저 이해한 후 실습</SelectItem>
                  <SelectItem value="BALANCED">균형잡힌 - 이론과 실습을 병행</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="preferKorean" className="text-foreground font-semibold">한국어 자료 선호</Label>
                  <p className="text-muted-foreground font-medium">
                    가능한 한국어 학습 자료를 우선적으로 추천합니다
                  </p>
                </div>
                <Switch
                  id="preferKorean"
                  checked={formData.preferKorean}
                  onCheckedChange={(checked) => setFormData({ ...formData, preferKorean: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="weekendBoost" className="text-foreground font-semibold">주말 학습 강화</Label>
                  <p className="text-muted-foreground font-medium">
                    주말에 더 많은 학습 시간을 할애합니다
                  </p>
                </div>
                <Switch
                  id="weekendBoost"
                  checked={formData.weekendBoost}
                  onCheckedChange={(checked) => setFormData({ ...formData, weekendBoost: checked })}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full relative z-10">
              변경사항 저장
            </Button>
          </CardFooter>
        </Card>

        {/* Danger Zone */}
        <Card className="glass-card border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="size-5" />
              계정 삭제
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground font-medium mb-4">
              계정을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="relative z-10">
                  계정 삭제
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>정말로 계정을 삭제하시겠습니까?</AlertDialogTitle>
                  <AlertDialogDescription>
                    이 작업은 되돌릴 수 없습니다. 모든 학습 데이터, 기술 스택, 목표 및 학습 플랜이 영구적으로 삭제됩니다.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700">
                    삭제
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
