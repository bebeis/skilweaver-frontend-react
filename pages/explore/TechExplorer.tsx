import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Map, Route, Sparkles, GitCompare, Zap } from 'lucide-react';
import { RoadmapExplorer } from '../../components/graph/RoadmapExplorer';
import { PathFinder } from '../../components/graph/PathFinder';
import { GapAnalysis } from '../../components/graph/GapAnalysis';
import { TechRecommendations } from '../../components/graph/TechRecommendations';

export function TechExplorer() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('roadmap');

  // URL에서 초기 기술 파라미터 가져오기
  const initialTech = searchParams.get('tech') || '';
  const initialTab = searchParams.get('tab');
  const initialTarget = searchParams.get('target'); // 갭 분석용

  useEffect(() => {
    if (initialTab && ['roadmap', 'path', 'recommendations', 'gap'].includes(initialTab)) {
      setActiveTab(initialTab);
    } else if (initialTarget) {
      // target 파라미터가 있으면 갭 분석 탭으로 이동
      setActiveTab('gap');
    }
  }, [initialTab, initialTarget]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-primary rounded-lg blur-md opacity-50 animate-glow-pulse"></div>
            <div className="relative bg-gradient-tech-primary rounded-lg p-3">
              <Map className="size-6 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-foreground">기술 탐색기</h1>
            <p className="text-muted-foreground text-lg font-medium mt-1">
              GraphRAG 기반 실시간 기술 로드맵 탐색
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Zap className="size-3 mr-1" />
            실시간 (~10ms)
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            무료
          </Badge>
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            Neo4j Graph
          </Badge>
        </div>
      </div>

      {/* Info Card */}
      <Card className="glass-card border-tech">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 rounded-lg p-2 border border-primary/20">
              <Sparkles className="size-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">Graph API vs Agent API</h3>
              <p className="text-muted-foreground text-sm">
                <strong>Graph API</strong>는 LLM 없이 Neo4j 그래프 쿼리로 실시간 탐색이 가능합니다.
                기술 로드맵 미리보기, 학습 경로 탐색에 활용하세요.
                상세한 AI 커리큘럼이 필요하면 <strong>학습 플랜 생성</strong>을 이용하세요.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-secondary/50">
          <TabsTrigger
            value="roadmap"
            className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Map className="size-4" />
            <span className="hidden sm:inline">로드맵</span>
          </TabsTrigger>
          <TabsTrigger
            value="path"
            className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Route className="size-4" />
            <span className="hidden sm:inline">경로 탐색</span>
          </TabsTrigger>
          <TabsTrigger
            value="recommendations"
            className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Sparkles className="size-4" />
            <span className="hidden sm:inline">추천</span>
          </TabsTrigger>
          <TabsTrigger
            value="gap"
            className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <GitCompare className="size-4" />
            <span className="hidden sm:inline">갭 분석</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roadmap" className="space-y-6">
          <RoadmapExplorer initialTechnology={initialTech} />
        </TabsContent>

        <TabsContent value="path" className="space-y-6">
          <PathFinder />
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <TechRecommendations />
        </TabsContent>

        <TabsContent value="gap" className="space-y-6">
          <GapAnalysis />
        </TabsContent>
      </Tabs>
    </div>
  );
}
