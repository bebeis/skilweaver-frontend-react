import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Database, Search, ExternalLink, Loader2, AlertTriangle } from 'lucide-react';
import { technologiesApi } from '../../src/lib/api/technologies';
import { toast } from 'sonner';

// Default technologies (fallback if API fails)
const defaultTechnologies = [
  {
    id: '1',
    displayName: 'Kubernetes',
    category: 'DEVOPS',
    ecosystem: 'CLOUD_NATIVE',
    summary: '컨테이너 오케스트레이션 플랫폼',
    officialSite: 'https://kubernetes.io'
  },
  {
    id: '2',
    displayName: 'React',
    category: 'FRAMEWORK',
    ecosystem: 'FRONTEND',
    summary: '사용자 인터페이스 구축을 위한 JavaScript 라이브러리',
    officialSite: 'https://react.dev'
  },
  {
    id: '3',
    displayName: 'Spring Boot',
    category: 'FRAMEWORK',
    ecosystem: 'JAVA',
    summary: '스프링 기반 애플리케이션을 쉽게 만들 수 있는 프레임워크',
    officialSite: 'https://spring.io/projects/spring-boot'
  },
  {
    id: '4',
    displayName: 'PostgreSQL',
    category: 'DATABASE',
    ecosystem: 'SQL',
    summary: '강력한 오픈소스 관계형 데이터베이스',
    officialSite: 'https://www.postgresql.org'
  },
  {
    id: '5',
    displayName: 'Docker',
    category: 'DEVOPS',
    ecosystem: 'CONTAINER',
    summary: '컨테이너 기반 가상화 플랫폼',
    officialSite: 'https://www.docker.com'
  },
  {
    id: '6',
    displayName: 'Go',
    category: 'LANGUAGE',
    ecosystem: 'GENERAL',
    summary: '구글이 개발한 정적 타입 컴파일 언어',
    officialSite: 'https://go.dev'
  },
  {
    id: '7',
    displayName: 'Redis',
    category: 'DATABASE',
    ecosystem: 'NOSQL',
    summary: '인메모리 데이터 구조 저장소',
    officialSite: 'https://redis.io'
  },
  {
    id: '8',
    displayName: 'TypeScript',
    category: 'LANGUAGE',
    ecosystem: 'JAVASCRIPT',
    summary: 'JavaScript의 타입이 있는 슈퍼셋',
    officialSite: 'https://www.typescriptlang.org'
  },
  {
    id: '9',
    displayName: 'AWS',
    category: 'PLATFORM',
    ecosystem: 'CLOUD',
    summary: '아마존 웹 서비스 클라우드 플랫폼',
    officialSite: 'https://aws.amazon.com'
  },
  {
    id: '10',
    displayName: 'GraphQL',
    category: 'API',
    ecosystem: 'WEB',
    summary: 'API를 위한 쿼리 언어',
    officialSite: 'https://graphql.org'
  }
];

const categoryColors = {
  LANGUAGE: 'bg-red-50 text-red-700 border-red-200',
  FRAMEWORK: 'bg-blue-50 text-blue-700 border-blue-200',
  DATABASE: 'bg-green-50 text-green-700 border-green-200',
  DEVOPS: 'bg-purple-50 text-purple-700 border-purple-200',
  PLATFORM: 'bg-orange-50 text-orange-700 border-orange-200',
  API: 'bg-pink-50 text-pink-700 border-pink-200',
  TOOL: 'bg-yellow-50 text-yellow-700 border-yellow-200'
};

export function Technologies() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [ecosystemFilter, setEcosystemFilter] = useState('ALL');
  const [technologies, setTechnologies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load technologies from API
  useEffect(() => {
    const loadTechnologies = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await technologiesApi.getTechnologies({
          page: 0,
          size: 100
        });

        if (response.success && response.data?.technologies) {
          setTechnologies(response.data.technologies);
        } else {
          setError('기술 목록을 불러올 수 없습니다.');
          setTechnologies(defaultTechnologies as any);
        }
      } catch (err) {
        console.error('기술 목록 조회 실패:', err);
        setError('기술 목록을 불러오는 데 실패했습니다.');
        setTechnologies(defaultTechnologies as any);
        toast.error('기술 목록을 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadTechnologies();
  }, []);

  const filteredTechnologies = technologies.filter(tech => {
    const matchesSearch = tech.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tech.summary?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || tech.category === categoryFilter;
    const matchesEcosystem = ecosystemFilter === 'ALL' || tech.ecosystem === ecosystemFilter;

    return matchesSearch && matchesCategory && matchesEcosystem;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-muted-foreground">기술 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">기술 카탈로그</h1>
        <p className="text-muted-foreground text-lg font-medium mt-1">
          커뮤니티가 함께 만드는 기술 지식 베이스
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="size-5 text-destructive mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-destructive font-medium">{error}</p>
                <p className="text-sm text-destructive/70 mt-1">기본 데이터를 표시하고 있습니다.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="기술 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary/50"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-foreground font-semibold">카테고리</label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">전체</SelectItem>
                    <SelectItem value="LANGUAGE">언어</SelectItem>
                    <SelectItem value="FRAMEWORK">프레임워크</SelectItem>
                    <SelectItem value="DATABASE">데이터베이스</SelectItem>
                    <SelectItem value="DEVOPS">DevOps</SelectItem>
                    <SelectItem value="PLATFORM">플랫폼</SelectItem>
                    <SelectItem value="API">API</SelectItem>
                    <SelectItem value="TOOL">도구</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-foreground font-semibold">에코시스템</label>
                <Select value={ecosystemFilter} onValueChange={setEcosystemFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">전체</SelectItem>
                    <SelectItem value="JAVA">Java</SelectItem>
                    <SelectItem value="JAVASCRIPT">JavaScript</SelectItem>
                    <SelectItem value="FRONTEND">Frontend</SelectItem>
                    <SelectItem value="CLOUD_NATIVE">Cloud Native</SelectItem>
                    <SelectItem value="CLOUD">Cloud</SelectItem>
                    <SelectItem value="SQL">SQL</SelectItem>
                    <SelectItem value="NOSQL">NoSQL</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setCategoryFilter('ALL');
                    setEcosystemFilter('ALL');
                  }}
                  className="w-full"
                >
                  필터 초기화
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="text-muted-foreground font-medium">
        {filteredTechnologies.length}개의 기술
      </div>

      {/* Technologies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTechnologies.length === 0 ? (
          <div className="col-span-full">
            <Card className="glass-card border-tech">
              <CardContent className="py-12 text-center">
                <Database className="size-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground font-medium">검색 결과가 없습니다.</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredTechnologies.map((tech) => (
            <Link key={tech.technologyId} to={`/technologies/${tech.technologyId}`}>
              <Card className="h-full glass-card border-tech card-hover-float cursor-pointer">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/20 rounded-lg p-2 border border-primary/30">
                          <Database className="size-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-foreground font-bold">{tech.displayName}</h3>
                          <p className="text-muted-foreground mt-1 line-clamp-2">
                            {tech.summary}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge 
                        variant="outline" 
                        className={categoryColors[tech.category as keyof typeof categoryColors]}
                      >
                        {tech.category}
                      </Badge>
                      <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                        {tech.ecosystem}
                      </Badge>
                    </div>

                    {tech.officialSite && (
                      <div className="flex items-center gap-2 text-primary">
                        <ExternalLink className="size-4" />
                        <span className="font-medium">공식 사이트</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
