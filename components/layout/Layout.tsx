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
    <div className="min-h-screen bg-background relative selection:bg-primary/20">
      {/* Background Gradients for modern feel */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-background [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)] opacity-20 pointer-events-none" />
      <div className="fixed top-0 left-0 -z-10 h-96 w-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-0 -z-10 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

      {/* Command Palette */}
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />

      {/* Floating Glass Sidebar */}
      <aside className={cn(
        "fixed top-4 left-4 z-40 h-[calc(100vh-2rem)] rounded-2xl border border-white/5 bg-card/20 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 flex flex-col overflow-hidden",
        sidebarCollapsed ? "w-16" : "w-60"
      )}>
        {/* Logo Area */}
        <div className={cn(
          "flex items-center h-16 px-4 border-b border-white/5",
          sidebarCollapsed ? "justify-center" : "justify-between"
        )}>
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary to-purple-600 rounded-lg p-1.5 shadow-lg shadow-primary/20">
              <Zap className="size-4 text-white" />
            </div>
            {!sidebarCollapsed && (
              <span className="font-bold text-foreground text-sm tracking-tight">SkillWeaver</span>
            )}
          </Link>
          {!sidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(true)}
              className="p-1.5 rounded-md hover:bg-white/5 text-muted-foreground transition-colors"
            >
              <Menu className="size-4" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {sidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="w-full p-2 mb-4 rounded-xl hover:bg-white/5 text-muted-foreground transition-colors group"
            >
              <Menu className="size-5 mx-auto group-hover:text-foreground transition-colors" />
            </button>
          )}
          {navigation.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                  isActive 
                    ? "bg-primary/10 text-primary shadow-sm" 
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5",
                  sidebarCollapsed && "justify-center px-2"
                )}
                title={sidebarCollapsed ? item.name : undefined}
              >
                <item.icon className={cn(
                  "size-5 shrink-0 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )} />
                {!sidebarCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 mt-auto space-y-3 border-t border-white/5 bg-black/5">
          {/* Quick Action */}
          <Link to="/learning-plans/new">
            <Button 
              className={cn(
                "w-full btn-liquid-glass-primary text-white border-0 transition-all",
                sidebarCollapsed ? "h-10 px-0" : "h-10 px-4"
              )}
            >
              <Sparkles className="size-4" />
              {!sidebarCollapsed && <span className="ml-2 font-bold">새 플랜</span>}
            </Button>
          </Link>

          {/* User Profile */}
          <div className={cn(
            "flex items-center gap-3 p-2 rounded-xl transition-colors hover:bg-white/5 cursor-pointer",
            sidebarCollapsed && "justify-center p-0 hover:bg-transparent"
          )}>
            <Avatar className="h-8 w-8 ring-2 ring-background">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-xs font-bold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{user?.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">Free Plan</p>
              </div>
            )}
            {!sidebarCollapsed && (
              <button onClick={handleLogout} className="text-muted-foreground hover:text-destructive transition-colors">
                <LogOut className="size-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={cn(
        "transition-all duration-300 min-h-screen flex flex-col",
        sidebarCollapsed ? "pl-[5.5rem]" : "pl-[17rem]"
      )}>
        {/* Invisible Header */}
        <header className="sticky top-0 z-30 h-20 flex items-center justify-between px-8 bg-transparent pointer-events-none">
          <div className="flex-1 max-w-xl pointer-events-auto">
             <button
              onClick={() => setCommandOpen(true)}
              className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-card/30 hover:bg-card/50 border border-white/5 backdrop-blur-md text-sm text-muted-foreground transition-all w-full shadow-sm group"
            >
              <Search className="size-4 group-hover:text-primary transition-colors" />
              <span className="flex-1 text-left">무엇을 찾고 계신가요?</span>
              <kbd className="hidden sm:inline-flex items-center gap-1 rounded px-2 py-0.5 bg-white/5 text-[10px] font-medium text-muted-foreground">
                <Command className="size-2.5" />K
              </kbd>
            </button>
          </div>
          
          <div className="flex items-center gap-4 pointer-events-auto">
             {/* Add extra header actions if needed */}
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 px-8 pb-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
