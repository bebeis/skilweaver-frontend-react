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
  X,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';

export function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigation = [
    { name: '대시보드', href: '/dashboard', icon: LayoutDashboard, gradient: 'from-purple-500 to-pink-500' },
    { name: '내 기술 스택', href: '/skills', icon: BookOpen, gradient: 'from-blue-500 to-cyan-500' },
    { name: '학습 목표', href: '/goals', icon: Target, gradient: 'from-green-500 to-emerald-500' },
    { name: '기술 카탈로그', href: '/technologies', icon: Database, gradient: 'from-orange-500 to-red-500' },
    { name: '학습 플랜', href: '/learning-plans', icon: GraduationCap, gradient: 'from-indigo-500 to-purple-500' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userInitials = user?.name?.slice(0, 2).toUpperCase() || 'US';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* 사이드바 */}
      <aside className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ${
        sidebarOpen ? 'w-72' : 'w-20'
      } bg-white border-r border-slate-200 shadow-soft`}>
        <div className="flex flex-col h-full">
          {/* 로고 */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-slate-200">
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-2 shadow-glow-primary">
                <GraduationCap className="size-6 text-white" />
              </div>
              {sidebarOpen && (
                <div className="flex flex-col animate-fade-in">
                  <span className="text-xl font-bold text-gradient">SkillWeaver</span>
                  <span className="text-xs text-slate-500">Learn Smarter</span>
                </div>
              )}
            </Link>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Menu className="size-5 text-slate-600" />
            </button>
          </div>

          {/* 네비게이션 */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-gradient-to-r shadow-soft ' + item.gradient + ' text-white' 
                      : 'text-slate-600 hover:bg-slate-50 hover:shadow-sm'
                  }`}
                >
                  <div className={`${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-700'}`}>
                    <item.icon className="size-5" />
                  </div>
                  {sidebarOpen && (
                    <span className="flex-1 font-medium animate-fade-in">{item.name}</span>
                  )}
                  {sidebarOpen && isActive && (
                    <ChevronRight className="size-4 animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* 유저 프로필 */}
          <div className="p-4 border-t border-slate-200">
            <div className={`flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 ${
              sidebarOpen ? 'justify-between' : 'justify-center'
            }`}>
              {sidebarOpen ? (
                <>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar className="h-10 w-10 ring-2 ring-purple-500 ring-offset-2">
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-semibold">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Link to="/settings/profile">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Settings className="size-4" />
                      </Button>
                    </Link>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleLogout}>
                      <LogOut className="size-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <Avatar className="h-10 w-10 ring-2 ring-purple-500 ring-offset-2">
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-semibold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* 메인 컨텐츠 */}
      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-72' : 'ml-20'}`}>
        {/* 헤더 */}
        <header className="bg-white/70 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-indigo-100 border border-purple-200">
                  <Sparkles className="size-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900">AI 기반 학습 플랫폼</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Link to="/learning-plans/new">
                  <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-glow-primary btn-glow">
                    <Sparkles className="size-4 mr-2" />
                    새 플랜 생성
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* 페이지 컨텐츠 */}
        <div className="px-8 py-8 animate-page-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
