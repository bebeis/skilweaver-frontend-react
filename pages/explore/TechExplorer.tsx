import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Map, Route, Sparkles, GitCompare, Zap, Search } from 'lucide-react';
import { RoadmapExplorer } from '../../components/graph/RoadmapExplorer';
import { PathFinder } from '../../components/graph/PathFinder';
import { GapAnalysis } from '../../components/graph/GapAnalysis';
import { TechRecommendations } from '../../components/graph/TechRecommendations';
import { HybridSearch } from '../../components/graph/HybridSearch';

import { LiquidHighlight, useFluidHighlight } from '../../components/ui/fluid-highlight';

export function TechExplorer() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('hybrid');

  const { 
    containerRef: tabsRef, 
    highlightStyle: tabsStyle, 
    handleMouseEnter: handleTabsMouseEnter, 
    handleMouseLeave: handleTabsMouseLeave 
  } = useFluidHighlight<HTMLDivElement>();

  const initialTech = searchParams.get('tech') || '';
  const initialTab = searchParams.get('tab');
  const initialTarget = searchParams.get('target');

  useEffect(() => {
    if (initialTab && ['hybrid', 'roadmap', 'path', 'recommendations', 'gap'].includes(initialTab)) {
      setActiveTab(initialTab);
    } else if (initialTarget) {
      setActiveTab('gap');
    }
  }, [initialTab, initialTarget]);

  return (
    <div className="section-gap">
      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Map className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">기술 탐색기</h1>
            <p className="text-sm text-muted-foreground">
              GraphRAG 기반 실시간 로드맵 탐색
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-green-500/10 text-green-400 border-green-500/20">
            <Zap className="size-2.5 mr-0.5" />
            실시간
          </Badge>
          <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-blue-500/10 text-blue-400 border-blue-500/20">
            무료
          </Badge>
        </div>
      </div>

      {/* Info Card - Compact */}
      <Card className="glass-card">
        <CardContent className="p-3">
          <div className="flex items-center gap-3 text-sm">
            <Sparkles className="size-4 text-primary shrink-0" />
            <p className="text-muted-foreground">
              <strong className="text-foreground">Graph API</strong>는 LLM 없이 Neo4j 그래프 쿼리로 실시간 탐색 가능.
              상세한 AI 커리큘럼이 필요하면 <strong className="text-primary">학습 플랜 생성</strong>을 이용하세요.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div ref={tabsRef} onMouseLeave={handleTabsMouseLeave} className="relative inline-block">
          <TabsList className="h-9 p-1 bg-secondary/50 relative z-10">
            <LiquidHighlight style={tabsStyle} />
            <TabsTrigger
              value="hybrid"
              className="text-xs h-7 px-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground relative z-20"
              onMouseEnter={handleTabsMouseEnter}
            >
              <Search className="size-3.5 mr-1.5" />
              통합 검색
            </TabsTrigger>
            <TabsTrigger
              value="roadmap"
              className="text-xs h-7 px-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground relative z-20"
              onMouseEnter={handleTabsMouseEnter}
            >
              <Map className="size-3.5 mr-1.5" />
              로드맵
            </TabsTrigger>
            <TabsTrigger
              value="path"
              className="text-xs h-7 px-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground relative z-20"
              onMouseEnter={handleTabsMouseEnter}
            >
              <Route className="size-3.5 mr-1.5" />
              경로 탐색
            </TabsTrigger>
            <TabsTrigger
              value="recommendations"
              className="text-xs h-7 px-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground relative z-20"
              onMouseEnter={handleTabsMouseEnter}
            >
              <Sparkles className="size-3.5 mr-1.5" />
              추천
            </TabsTrigger>
            <TabsTrigger
              value="gap"
              className="text-xs h-7 px-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground relative z-20"
              onMouseEnter={handleTabsMouseEnter}
            >
              <GitCompare className="size-3.5 mr-1.5" />
              갭 분석
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="mt-4">
          <TabsContent value="hybrid" className="mt-0">
            <HybridSearch />
          </TabsContent>

          <TabsContent value="roadmap" className="mt-0">
            <RoadmapExplorer initialTechnology={initialTech} />
          </TabsContent>

          <TabsContent value="path" className="mt-0">
            <PathFinder />
          </TabsContent>

          <TabsContent value="recommendations" className="mt-0">
            <TechRecommendations />
          </TabsContent>

          <TabsContent value="gap" className="mt-0">
            <GapAnalysis />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
