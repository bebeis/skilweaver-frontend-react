import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Input } from '../ui/input';
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
  Map,
  Search,
  Command,
  X,
  ChevronRight,
  Clock,
  Star
} from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Dialog,
  DialogContent,
} from '../ui/dialog';
import { cn } from '../ui/utils';

// Command Palette Component
function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = [
    { id: 'dashboard', label: '대시보드', icon: LayoutDashboard, href: '/dashboard', category: '네비게이션' },
    { id: 'skills', label: '내 기술 스택', icon: BookOpen, href: '/skills', category: '네비게이션' },
    { id: 'goals', label: '학습 목표', icon: Target, href: '/goals', category: '네비게이션' },
    { id: 'technologies', label: '기술 카탈로그', icon: Database, href: '/technologies', category: '네비게이션' },
    { id: 'explore', label: '기술 탐색기', icon: Map, href: '/explore', category: '네비게이션' },
    { id: 'plans', label: '학습 플랜', icon: GraduationCap, href: '/learning-plans', category: '네비게이션' },
    { id: 'new-plan', label: '새 학습 플랜 생성', icon: Sparkles, href: '/learning-plans/new', category: '액션' },
    { id: 'new-skill', label: '기술 추가', icon: BookOpen, href: '/skills/new', category: '액션' },
    { id: 'settings', label: '설정', icon: Settings, href: '/settings/profile', category: '설정' },
  ];

  const filteredCommands = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(query.toLowerCase())
  );

  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, typeof commands>);

  useEffect(() => {
    if (open) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const handleSelect = (href: string) => {
    navigate(href);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 max-w-lg overflow-hidden bg-card/95 backdrop-blur-xl border-border/50">
        <div className="flex items-center border-b border-border px-3">
          <Search className="size-4 text-muted-foreground shrink-0" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="검색 또는 명령어 입력..."
            className="border-0 focus-visible:ring-0 bg-transparent h-12 text-sm"
          />
          <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-border bg-muted px-1.5 text-[10px] text-muted-foreground">
            ESC
          </kbd>
        </div>
        <div className="max-h-[300px] overflow-y-auto p-2">
          {Object.entries(groupedCommands).map(([category, items]) => (
            <div key={category} className="mb-2">
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">{category}</div>
              {items.map((cmd) => (
                <button
                  key={cmd.id}
                  onClick={() => handleSelect(cmd.href)}
                  className="w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-secondary/80 text-sm text-foreground transition-colors"
                >
                  <cmd.icon className="size-4 text-muted-foreground" />
                  <span>{cmd.label}</span>
                  <ChevronRight className="size-3 text-muted-foreground ml-auto" />
                </button>
              ))}
            </div>
          ))}
          {filteredCommands.length === 0 && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              결과가 없습니다
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  const navigation = [
    { name: '대시보드', href: '/dashboard', icon: LayoutDashboard },
    { name: '기술 스택', href: '/skills', icon: BookOpen },
    { name: '학습 목표', href: '/goals', icon: Target },
    { name: '기술 카탈로그', href: '/technologies', icon: Database },
    { name: '탐색기', href: '/explore', icon: Map },
    { name: '학습 플랜', href: '/learning-plans', icon: GraduationCap },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userInitials = user?.name?.slice(0, 2).toUpperCase() || 'US';

  // Command palette keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Command Palette */}
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />

      {/* Compact Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-40 h-screen bg-card/50 backdrop-blur-md border-r border-border transition-all duration-200",
        sidebarCollapsed ? "w-16" : "w-56"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className={cn(
            "flex items-center h-14 px-3 border-b border-border",
            sidebarCollapsed ? "justify-center" : "justify-between"
          )}>
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="bg-primary rounded-lg p-1.5">
                <Zap className="size-4 text-primary-foreground" />
              </div>
              {!sidebarCollapsed && (
                <span className="font-bold text-foreground text-sm">SkillWeaver</span>
              )}
            </Link>
            {!sidebarCollapsed && (
              <button
                onClick={() => setSidebarCollapsed(true)}
                className="p-1 rounded hover:bg-secondary/50 text-muted-foreground"
              >
                <Menu className="size-4" />
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
            {sidebarCollapsed && (
              <button
                onClick={() => setSidebarCollapsed(false)}
                className="w-full p-2 mb-2 rounded-md hover:bg-secondary/50 text-muted-foreground"
              >
                <Menu className="size-4 mx-auto" />
              </button>
            )}
            {navigation.map((item) => {
              const isActive = location.pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
                    sidebarCollapsed && "justify-center px-2"
                  )}
                  title={sidebarCollapsed ? item.name : undefined}
                >
                  <item.icon className="size-4 shrink-0" />
                  {!sidebarCollapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Quick Action */}
          <div className="px-2 py-2 border-t border-border">
            <Link to="/learning-plans/new">
              <Button 
                size="sm" 
                className={cn(
                  "w-full bg-primary hover:bg-primary/90 text-xs h-8",
                  sidebarCollapsed && "px-2"
                )}
              >
                <Sparkles className="size-3.5" />
                {!sidebarCollapsed && <span className="ml-1.5">새 플랜</span>}
              </Button>
            </Link>
          </div>

          {/* User */}
          <div className="px-2 py-2 border-t border-border">
            {sidebarCollapsed ? (
              <div className="flex flex-col items-center gap-1">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/20 text-primary text-xs font-medium">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded hover:bg-secondary/50 text-muted-foreground"
                  title="로그아웃"
                >
                  <LogOut className="size-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-1">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-primary/20 text-primary text-xs font-medium">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{user?.name}</p>
                </div>
                <button
                  onClick={() => navigate('/settings/profile')}
                  className="p-1 rounded hover:bg-secondary/50 text-muted-foreground"
                >
                  <Settings className="size-3.5" />
                </button>
                <button
                  onClick={handleLogout}
                  className="p-1 rounded hover:bg-secondary/50 text-muted-foreground"
                >
                  <LogOut className="size-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "transition-all duration-200",
        sidebarCollapsed ? "ml-16" : "ml-56"
      )}>
        {/* Compact Header */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="flex items-center justify-between h-12 px-4">
            {/* Search Trigger */}
            <button
              onClick={() => setCommandOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary/50 hover:bg-secondary text-sm text-muted-foreground transition-colors w-64"
            >
              <Search className="size-3.5" />
              <span className="flex-1 text-left">검색...</span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 text-[10px]">
                <Command className="size-2.5" />K
              </kbd>
            </button>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <Link to="/learning-plans/new">
                <Button size="sm" variant="ghost" className="h-8 text-xs gap-1.5">
                  <Sparkles className="size-3.5" />
                  <span className="hidden md:inline">새 플랜</span>
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
