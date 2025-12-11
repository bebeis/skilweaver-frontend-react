import { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '../ui/command';
import { Popover, PopoverContent, PopoverAnchor } from '../ui/popover';
import { Loader2, Search, Database } from 'lucide-react';
import { technologiesApi } from '../../src/lib/api/technologies';
import { Technology } from '../../src/lib/api/types';

interface TechAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (technology: Technology) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

const categoryColors: Record<string, string> = {
  LANGUAGE: 'bg-red-50 text-red-700',
  FRAMEWORK: 'bg-blue-50 text-blue-700',
  LIBRARY: 'bg-purple-50 text-purple-700',
  TOOL: 'bg-yellow-50 text-yellow-700',
  DATABASE: 'bg-green-50 text-green-700',
  DB: 'bg-green-50 text-green-700',
  PLATFORM: 'bg-orange-50 text-orange-700',
  DEVOPS: 'bg-indigo-50 text-indigo-700',
  API: 'bg-pink-50 text-pink-700',
  CONCEPT: 'bg-cyan-50 text-cyan-700',
};

export function TechAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = '기술 검색...',
  disabled = false,
  className = '',
  icon,
}: TechAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Technology[]>([]);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const searchTechnologies = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 1) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await technologiesApi.getTechnologies({
        search: query,
        limit: 10,
        active: true,
      });

      if (response.success && response.data?.technologies) {
        setSuggestions(response.data.technologies);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Failed to search technologies:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      searchTechnologies(value);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [value, searchTechnologies]);

  const handleSelect = (tech: Technology) => {
    // V4: key → name
    onChange(tech.name);
    onSelect?.(tech);
    setOpen(false);
    setSuggestions([]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    if (newValue.trim()) {
      setOpen(true);
    }
  };

  const handleFocus = () => {
    if (value.trim() && suggestions.length > 0) {
      setOpen(true);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div className={`relative ${className}`}>
          {icon ? (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          ) : (
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
          )}
          <Input
            ref={inputRef}
            value={value}
            onChange={handleInputChange}
            onFocus={handleFocus}
            placeholder={placeholder}
            disabled={disabled}
            className={icon ? 'pl-10' : 'pl-10'}
          />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground animate-spin" />
          )}
        </div>
      </PopoverAnchor>
      <PopoverContent
        className="p-0 w-[var(--radix-popover-trigger-width)]"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command>
          <CommandList>
            {suggestions.length === 0 && !loading && value.trim() && (
              <CommandEmpty>
                <div className="py-6 text-center">
                  <Database className="size-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    '{value}'에 대한 결과가 없습니다
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    입력한 값으로 검색합니다
                  </p>
                </div>
              </CommandEmpty>
            )}
            {suggestions.length > 0 && (
              <CommandGroup heading="검색 결과">
                {suggestions.map((tech) => (
                  <CommandItem
                    key={tech.name}
                    value={tech.name}
                    onSelect={() => handleSelect(tech)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <Database className="size-4 text-muted-foreground" />
                        <div>
                          <span className="font-medium">{tech.displayName}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {tech.name}
                          </span>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-xs ${categoryColors[tech.category] || 'bg-gray-50 text-gray-700'}`}
                      >
                        {tech.category}
                      </Badge>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
