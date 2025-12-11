import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import {
  Sparkles,
  Search,
  Loader2,
  AlertTriangle,
  ArrowRight,
  Link as LinkIcon,
  Layers,
  GitMerge
} from 'lucide-react';
import { fetchRecommendations } from '../../src/lib/api/graph';
import { RecommendationsData, RecommendedTechnology, TechRelation } from '../../src/lib/api/types';
import { ApiError } from '../../src/lib/api/client';
import { TechAutocomplete } from './TechAutocomplete';

// V4: TechRelation 사용
const relationLabels: Record<TechRelation, string> = {
  DEPENDS_ON: '의존',
  RECOMMENDED_AFTER: '다음 단계',
  CONTAINS: '포함',
  EXTENDS: '확장',
  USED_WITH: '함께 사용',
  ALTERNATIVE_TO: '대체 기술',
};

const relationIcons: Record<TechRelation, typeof LinkIcon> = {
  DEPENDS_ON: GitMerge,
  RECOMMENDED_AFTER: ArrowRight,
  CONTAINS: Layers,
  EXTENDS: ArrowRight,
  USED_WITH: LinkIcon,
  ALTERNATIVE_TO: GitMerge,
};

import { LiquidHighlight, useFluidHighlight } from '../ui/fluid-highlight';

const relationColors: Record<TechRelation, string> = {
  DEPENDS_ON: 'text-orange-500',
  RECOMMENDED_AFTER: 'text-blue-500',
  CONTAINS: 'text-purple-500',
  EXTENDS: 'text-teal-500',
  USED_WITH: 'text-green-500',
  ALTERNATIVE_TO: 'text-gray-500',
};

const categoryColors: Record<string, string> = {
  LANGUAGE: 'bg-red-50 text-red-700 border-red-200',
  FRAMEWORK: 'bg-blue-50 text-blue-700 border-blue-200',
  LIBRARY: 'bg-purple-50 text-purple-700 border-purple-200',
  TOOL: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  DATABASE: 'bg-green-50 text-green-700 border-green-200',
  DB: 'bg-green-50 text-green-700 border-green-200',
  PLATFORM: 'bg-orange-50 text-orange-700 border-orange-200',
  DEVOPS: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  CONCEPT: 'bg-cyan-50 text-cyan-700 border-cyan-200',
};

function RecommendationCard({ tech, onSelect, onMouseEnter }: {
  tech: RecommendedTechnology;
  onSelect: (name: string) => void;
  onMouseEnter?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  const Icon = relationIcons[tech.relation];

  return (
    <button
      onClick={() => onSelect(tech.name)}
      onMouseEnter={onMouseEnter}
      className="p-4 rounded-lg border border-border bg-card/50 transition-all duration-200 text-left w-full group relative z-10 hover:border-border/50"
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg bg-secondary/50 ${relationColors[tech.relation] ? relationColors[tech.relation].replace('text-', 'text-opacity-90 text-') : ''}`}>
          <Icon className="size-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {tech.displayName}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={`text-xs ${categoryColors[tech.category] ? categoryColors[tech.category].replace('bg-', 'bg-opacity-10 bg-').replace('text-', 'text-opacity-90 text-').replace('border-', 'border-opacity-20 border-') : 'bg-gray-50/10 text-gray-400'}`}>
              {tech.category}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {relationLabels[tech.relation]}
            </Badge>
          </div>
        </div>
        <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors mt-1" />
      </div>
    </button>
  );
}

function RecommendationList({ techs, onSelect }: { techs: RecommendedTechnology[], onSelect: (name: string) => void }) {
  const { 
    containerRef, 
    highlightStyle, 
    handleMouseEnter, 
    handleMouseLeave 
  } = useFluidHighlight<HTMLDivElement>();

  return (
    <div 
      ref={containerRef}
      onMouseLeave={handleMouseLeave}
      className="grid grid-cols-1 md:grid-cols-2 gap-3 relative"
    >
      <LiquidHighlight style={highlightStyle} />
      {techs.map(tech => (
        <RecommendationCard
          key={tech.name}
          tech={tech}
          onSelect={onSelect}
          onMouseEnter={handleMouseEnter}
        />
      ))}
    </div>
  );
}

export function TechRecommendations() {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<RecommendationsData | null>(null);

  const loadRecommendations = useCallback(async (technology: string) => {
    if (!technology.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetchRecommendations(technology.trim().toLowerCase());
      setData(response.data);
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.errorCode === 'TECHNOLOGY_NOT_FOUND') {
        setError(`'${technology}' 기술을 찾을 수 없습니다.`);
      } else if (apiError.errorCode === 'GRAPH_SERVICE_UNAVAILABLE') {
        setError('Graph 서비스에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
      } else {
        setError('추천을 불러오는 데 실패했습니다.');
      }
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadRecommendations(searchQuery);
  };

  const handleTechSelect = (techName: string) => {
    setSearchQuery(techName);
    loadRecommendations(techName);
  };

  // Group recommendations by relation type
  const groupedRecommendations = data?.recommendations.reduce((acc, tech) => {
    if (!acc[tech.relation]) {
      acc[tech.relation] = [];
    }
    acc[tech.relation].push(tech);
    return acc;
  }, {} as Record<TechRelation, RecommendedTechnology[]>);

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card className="glass-card border-tech">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            연관 기술 추천
          </CardTitle>
          <CardDescription>
            특정 기술과 함께 자주 사용되거나 연관된 기술을 추천합니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-3">
            <TechAutocomplete
              value={searchQuery}
              onChange={setSearchQuery}
              onSelect={(tech) => {
                // V4: key → name
                setSearchQuery(tech.name);
                loadRecommendations(tech.name);
              }}
              placeholder="예: react, spring-boot, kubernetes..."
              className="flex-1"
            />
            <Button type="submit" disabled={loading || !searchQuery.trim()} className="btn-liquid-glass-primary shadow-glow-primary">
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4 fill-current" />}
              <span className="ml-2">검색</span>
            </Button>
          </form>

          {/* Quick Suggestions */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">추천:</span>
            {['react', 'spring-boot', 'kubernetes', 'python', 'typescript'].map(tech => (
              <Badge
                key={tech}
                variant="outline"
                className="cursor-pointer hover:bg-primary/10 hover:border-primary/50 transition-colors"
                onClick={() => {
                  setSearchQuery(tech);
                  loadRecommendations(tech);
                }}
              >
                {tech}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results */}
      {data && (
        <div className="space-y-6">
          {/* Header */}
          <Card className="glass-card border-primary/50 shadow-neon">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center">
                <div className="bg-gradient-tech-primary text-white px-6 py-3 rounded-lg shadow-lg">
                  <h2 className="text-xl font-bold">{data.technology}</h2>
                </div>
              </div>
              <p className="text-center text-muted-foreground mt-3">
                {data.recommendations.length}개의 연관 기술을 찾았습니다
              </p>
            </CardContent>
          </Card>

          {/* Grouped Recommendations */}
          {groupedRecommendations && Object.entries(groupedRecommendations).map(([relation, techs]) => (
            <Card key={relation} className="glass-card border-tech">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  {(() => {
                    const Icon = relationIcons[relation as TechRelation];
                    return Icon ? <Icon className={`size-5 ${relationColors[relation as TechRelation]}`} /> : null;
                  })()}
                  {relationLabels[relation as TechRelation] || relation}
                  <Badge variant="secondary" className="ml-auto">{techs.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RecommendationList techs={techs} onSelect={handleTechSelect} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!data && !loading && !error && (
        <Card className="glass-card border-tech">
          <CardContent className="py-12 text-center">
            <Sparkles className="size-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">기술을 검색해보세요</h3>
            <p className="text-muted-foreground">
              기술명을 입력하면 함께 사용하기 좋은 연관 기술을 추천해드립니다.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
