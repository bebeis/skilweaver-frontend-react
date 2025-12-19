import { useState } from 'react';
import { searchHybrid } from '../../lib/api';
import { HybridSearchResponse } from '../../lib/api/types';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Search, BookOpen, ArrowRight, Clock, Layers } from 'lucide-react';
import { Badge } from '../ui/badge';
import { LiquidHighlight, useFluidHighlight } from '../ui/fluid-highlight';

export function HybridSearch() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HybridSearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { 
    containerRef, 
    highlightStyle, 
    handleMouseEnter, 
    handleMouseLeave 
  } = useFluidHighlight<HTMLDivElement>();

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await searchHybrid({ query, includeDocuments: true });
      if (res.success && res.data) {
        setResult(res.data);
      } else {
        setError(res.message || '검색에 실패했습니다.');
      }
    } catch (err) {
      setError('오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Input
          placeholder="예: React Native 배우려면?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? <span className="animate-spin mr-2">⏳</span> : <Search className="mr-2 size-4" />}
          검색
        </Button>
      </div>

      {error && <div className="text-red-500 text-sm">{error}</div>}

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Layers className="size-5 text-primary" />
                학습 경로: {result.summary}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {result.learningPath.map((step, idx) => (
                  <div key={step.step} className="flex items-center">
                    <Badge variant={step.relation === 'TARGET' ? 'default' : 'secondary'} className="text-sm py-1">
                      {step.technology.displayName}
                    </Badge>
                    {idx < result.learningPath.length - 1 && (
                      <ArrowRight className="size-4 mx-2 text-muted-foreground" />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="size-4" />
                <span>예상 학습 시간: {result.estimatedTotalHours}시간</span>
              </div>
            </CardContent>
          </Card>

          <div 
            className="space-y-4 relative"
            ref={containerRef}
            onMouseLeave={handleMouseLeave}
          >
            <LiquidHighlight style={highlightStyle} />
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <BookOpen className="size-5" />
              단계별 추천 자료
            </h3>
            {result.learningPath.map((step) => (
              <Card 
                key={step.step} 
                className="overflow-hidden border-l-4 border-l-primary/20 relative z-10 bg-card/50 hover:border-primary/50 transition-colors"
                onMouseEnter={handleMouseEnter}
              >
                <div className="bg-secondary/30 p-3 border-b flex justify-between items-center">
                  <h4 className="font-medium flex items-center gap-2">
                    <Badge variant="outline" className="bg-background">{step.step}</Badge>
                    {step.technology.displayName}
                  </h4>
                  <Badge variant="secondary" className="text-xs">{step.relation}</Badge>
                </div>
                <CardContent className="p-0">
                  {step.documents && step.documents.length > 0 ? (
                    <div className="divide-y">
                      {step.documents.map((doc, i) => (
                        <div key={i} className="p-4 hover:bg-secondary/5 transition-colors">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="text-[10px] h-5 px-2">
                                  {doc.type}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  관련도: {(doc.relevanceScore * 100).toFixed(0)}%
                                </span>
                              </div>
                              <p className="text-sm text-foreground/90 line-clamp-3 leading-relaxed">
                                {doc.content}
                              </p>
                              <p className="text-xs text-muted-foreground mt-2 font-mono bg-secondary/20 inline-block px-1 rounded">
                                {doc.source}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-sm text-muted-foreground text-center italic">
                      추천 자료가 없습니다.
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
