import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import {
  LayoutDashboard,
  BookOpen,
  Target,
  Database,
  GraduationCap,
  Settings,
  LogOut,
  Menu,
  Sparkles,
  Zap,
  Map
} from 'lucide-react';
import { useState } from 'react';

export function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigation = [
    { name: '대시보드', href: '/dashboard', icon: LayoutDashboard },
    { name: '내 기술 스택', href: '/skills', icon: BookOpen },
    { name: '학습 목표', href: '/goals', icon: Target },
    { name: '기술 카탈로그', href: '/technologies', icon: Database },
    { name: '기술 탐색기', href: '/explore', icon: Map },
    { name: '학습 플랜', href: '/learning-plans', icon: GraduationCap },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userInitials = user?.name?.slice(0, 2).toUpperCase() || 'US';

  return (
    <div className="min-h-screen bg-background gradient-mesh">
      {/* 사이드바 - 세련된 다크 디자인 */}
      <aside className={`fixed top-0 left-0 z-40 h-screen transition-all duration-fluid ${
        sidebarOpen ? 'w-72' : 'w-20'
      } glass-card border-r border-border`}>
        <div className="flex flex-col h-full">
          {/* 로고 */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-border">
            <Link to="/dashboard" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-primary rounded-lg blur-md opacity-50 animate-glow-pulse"></div>
                <div className="relative bg-gradient-tech-primary rounded-lg p-2">
                  <Zap className="size-6 text-white" />
                </div>
              </div>
              {sidebarOpen && (
                <div className="flex flex-col animate-fade-in-fluid">
                  <span className="text-xl font-bold text-foreground">SkillWeaver</span>
                  <span className="text-xs text-primary">Tech Learning</span>
                </div>
              )}
            </Link>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-secondary/50 transition-all duration-fluid hover-glow-primary"
            >
              <Menu className="size-5 text-foreground" />
            </button>
          </div>

          {/* 네비게이션 */}
          <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
            {navigation.map((item, index) => {
              const isActive = location.pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center gap-4 px-4 py-3.5 rounded-lg transition-all duration-fluid border-tech animate-slide-up-fluid stagger-${index + 1} ${
                    isActive 
                      ? 'bg-primary/10 text-primary shadow-neon' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/30'
                  }`}
                >
                  <div className={`transition-all duration-fluid ${
                    isActive ? 'text-primary scale-110' : 'text-muted-foreground group-hover:text-primary group-hover:scale-110'
                  }`}>
                    <item.icon className="size-5" />
                  </div>
                  {sidebarOpen && (
                    <span className="flex-1 font-medium animate-fade-in-fluid">{item.name}</span>
                  )}
                  {sidebarOpen && isActive && (
                    <div className="w-2 h-2 rounded-full bg-primary animate-glow-pulse"></div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* 유저 프로필 */}
          <div className="p-4 border-t border-border">
            {sidebarOpen ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg glass-card border-tech">
                  <div className="relative">
                    <div className="absolute inset-0 bg-accent rounded-full blur-sm opacity-50"></div>
                    <Avatar className="relative h-10 w-10 ring-2 ring-accent/50">
                      <AvatarFallback className="bg-gradient-tech-primary text-white font-semibold">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-fluid relative z-10"
                    onClick={() => navigate('/settings/profile')}
                  >
                    <Settings className="size-4 mr-2" />
                    설정
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-fluid relative z-10"
                    onClick={handleLogout}
                  >
                    <LogOut className="size-4 mr-2" />
                    로그아웃
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-accent rounded-full blur-sm opacity-50"></div>
                  <Avatar className="relative h-10 w-10 ring-2 ring-accent/50">
                    <AvatarFallback className="bg-gradient-tech-primary text-white font-semibold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* 메인 컨텐츠 */}
      <main className={`transition-all duration-fluid ${sidebarOpen ? 'ml-72' : 'ml-20'}`}>
        {/* 헤더 */}
        <header className="glass-card border-b border-border sticky top-0 z-30">
          <div className="px-8 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20 animate-neon-flicker">
                  <Sparkles className="size-4 text-primary" />
                  <span className="text-sm font-semibold text-primary">AI 기반 학습 플랫폼</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Link to="/learning-plans/new">
                  <Button className="bg-gradient-tech-primary hover-glow-primary btn-ripple shadow-neon">
                    <Sparkles className="size-4 mr-2" />
                    새 플랜 생성
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* 페이지 컨텐츠 */}
        <div className="px-8 py-10 animate-page-fluid content-spacing">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
