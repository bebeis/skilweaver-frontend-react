import { Palette } from 'lucide-react';
import { Button } from './button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { useTheme, themes } from '../../contexts/ThemeContext';
import { cn } from './utils';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-muted-foreground hover:text-foreground transition-colors relative z-50 pointer-events-auto"
        >
          <Palette className="size-4" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-card/95 backdrop-blur-xl border-white/10 z-[100]">
        <DropdownMenuLabel className="text-xs text-muted-foreground">테마 선택</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />
        {themes.map((t) => (
          <DropdownMenuItem
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={cn(
              "flex items-center gap-3 p-2 cursor-pointer focus:bg-white/5 relative",
              theme === t.id && "bg-primary/10 text-primary"
            )}
          >
            <div className="flex -space-x-1 relative z-10">
              {t.colors.map((color, i) => (
                <div 
                  key={i} 
                  className={cn("w-3 h-3 rounded-full ring-1 ring-card", color)} 
                />
              ))}
            </div>
            <span className="text-sm font-medium relative z-10">{t.name}</span>
            {theme === t.id && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse relative z-10" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

