import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { 
  Database, 
  ExternalLink, 
  BookOpen, 
  Lightbulb, 
  CheckCircle2,
  ArrowRight,
  GitBranch,
  ArrowLeft,
  GraduationCap,
  Edit
} from 'lucide-react';
import { toast } from 'sonner';

// Mock data
const mockTechnology = {
  id: '1',
  displayName: 'Kubernetes',
  category: 'DEVOPS',
  ecosystem: 'CLOUD_NATIVE',
  summary: 'Kubernetes는 컨테이너화된 애플리케이션의 배포, 확장 및 관리를 자동화하는 오픈소스 컨테이너 오케스트레이션 플랫폼입니다.',
  learningTips: '먼저 Docker를 충분히 이해한 후 Kubernetes를 학습하세요. 로컬 환경에서 Minikube로 시작하고, 점진적으로 클라우드 환경으로 확장하는 것을 추천합니다.',
  officialSite: 'https://kubernetes.io',
  prerequisites: ['Docker', 'Linux 기초', '네트워킹 기초'],
  useCases: [
    '마이크로서비스 배포 및 관리',
    '자동 확장 및 로드 밸런싱',
    '무중단 배포 (Rolling Updates)',
    '서비스 디스커버리 및 로드 밸런싱'
  ]
};

const mockRelationships = {
  PREREQUISITE: [
    { id: '5', name: 'Docker', category: 'DEVOPS' },
    { id: '6', name: 'Linux', category: 'OPERATING_SYSTEM' }
  ],
  NEXT_STEP: [
    { id: '7', name: 'Helm', category: 'DEVOPS' },
    { id: '8', name: 'Istio', category: 'DEVOPS' }
  ],
  ALTERNATIVE: [
    { id: '9', name: 'Docker Swarm', category: 'DEVOPS' },
    { id: '10', name: 'Nomad', category: 'DEVOPS' }
  ]
};

const categoryColors = {
  LANGUAGE: 'bg-red-50 text-red-700 border-red-200',
  FRAMEWORK: 'bg-blue-50 text-blue-700 border-blue-200',
  DATABASE: 'bg-green-50 text-green-700 border-green-200',
  DEVOPS: 'bg-purple-50 text-purple-700 border-purple-200',
  PLATFORM: 'bg-orange-50 text-orange-700 border-orange-200',
  OPERATING_SYSTEM: 'bg-gray-50 text-gray-700 border-gray-200'
};

export function TechnologyDetail() {
  const { technologyId } = useParams();
  const navigate = useNavigate();
  const [showEditForm, setShowEditForm] = useState(false);
  const [editForm, setEditForm] = useState({
    proposedSummary: '',
    proposedLearningTips: '',
    proposedPrerequisites: ''
  });

  const handleSubmitEdit = () => {
    if (!editForm.proposedSummary && !editForm.proposedLearningTips && !editForm.proposedPrerequisites) {
      toast.error('최소 하나 이상의 수정 사항을 입력해주세요.');
      return;
    }

    // Mock API call
    toast.success('수정 제안이 제출되었습니다. 검토 후 반영됩니다.');
    setShowEditForm(false);
    setEditForm({
      proposedSummary: '',
      proposedLearningTips: '',
      proposedPrerequisites: ''
    });
  };

  const handleCreateLearningPlan = () => {
    navigate(`/learning-plans/new?target=${mockTechnology.displayName}`);
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => navigate('/technologies')}>
        <ArrowLeft className="size-4 mr-2" />
        기술 카탈로그로 돌아가기
      </Button>

      {/* Header */}
      <Card className="glass-card border-tech">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="bg-primary/20 rounded-lg p-3 border border-primary/30">
                <Database className="size-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">{mockTechnology.displayName}</h1>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge 
                    variant="outline" 
                    className={categoryColors[mockTechnology.category as keyof typeof categoryColors]}
                  >
                    {mockTechnology.category}
                  </Badge>
                  <Badge variant="outline" className="bg-secondary/50 text-muted-foreground border-border">
                    {mockTechnology.ecosystem}
                  </Badge>
                </div>
                {mockTechnology.officialSite && (
                  <a 
                    href={mockTechnology.officialSite} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline font-medium"
                  >
                    <ExternalLink className="size-4" />
                    <span>공식 사이트 방문</span>
                  </a>
                )}
              </div>
            </div>
            <Button onClick={handleCreateLearningPlan} className="relative z-10">
              <GraduationCap className="size-4 mr-2" />
              학습 플랜 생성
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="glass-card border-tech">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <BookOpen className="size-5 text-primary" />
            개요
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground font-medium">{mockTechnology.summary}</p>
        </CardContent>
      </Card>

      {/* Learning Tips */}
      <Card className="glass-card border-tech">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Lightbulb className="size-5 text-accent" />
            학습 팁
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground font-medium">{mockTechnology.learningTips}</p>
        </CardContent>
      </Card>

      {/* Prerequisites & Use Cases */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card border-tech">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <CheckCircle2 className="size-5 text-success" />
              선행 학습
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {mockTechnology.prerequisites.map((prereq, index) => (
                <li key={index} className="flex items-center gap-2 text-muted-foreground font-medium">
                  <div className="size-2 bg-primary rounded-full" />
                  {prereq}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="glass-card border-tech">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <GitBranch className="size-5 text-success" />
              주요 활용 사례
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {mockTechnology.useCases.map((useCase, index) => (
                <li key={index} className="flex items-center gap-2 text-muted-foreground font-medium">
                  <div className="size-2 bg-success rounded-full" />
                  {useCase}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Relationships */}
      <Card className="glass-card border-tech">
        <CardHeader>
          <CardTitle className="text-foreground">관련 기술</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Prerequisites */}
          {mockRelationships.PREREQUISITE.length > 0 && (
            <div>
              <h3 className="text-foreground font-bold mb-3 flex items-center gap-2">
                <ArrowLeft className="size-4 text-primary" />
                먼저 학습하면 좋은 기술
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {mockRelationships.PREREQUISITE.map((tech) => (
                  <Link key={tech.id} to={`/technologies/${tech.id}`}>
                    <div className="p-3 bg-secondary/30 rounded-lg hover:bg-primary/10 transition-all border border-border hover:border-primary/50">
                      <div className="flex items-center justify-between">
                        <span className="text-foreground font-medium">{tech.name}</span>
                        <Badge 
                          variant="outline" 
                          className={categoryColors[tech.category as keyof typeof categoryColors]}
                        >
                          {tech.category}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Next Steps */}
          {mockRelationships.NEXT_STEP.length > 0 && (
            <div>
              <h3 className="text-foreground font-bold mb-3 flex items-center gap-2">
                <ArrowRight className="size-4 text-accent" />
                다음 단계로 학습할 기술
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {mockRelationships.NEXT_STEP.map((tech) => (
                  <Link key={tech.id} to={`/technologies/${tech.id}`}>
                    <div className="p-3 bg-secondary/30 rounded-lg hover:bg-primary/10 transition-all border border-border hover:border-primary/50">
                      <div className="flex items-center justify-between">
                        <span className="text-foreground font-medium">{tech.name}</span>
                        <Badge 
                          variant="outline" 
                          className={categoryColors[tech.category as keyof typeof categoryColors]}
                        >
                          {tech.category}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Alternatives */}
          {mockRelationships.ALTERNATIVE.length > 0 && (
            <div>
              <h3 className="text-foreground font-bold mb-3 flex items-center gap-2">
                <GitBranch className="size-4 text-success" />
                대안 기술
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {mockRelationships.ALTERNATIVE.map((tech) => (
                  <Link key={tech.id} to={`/technologies/${tech.id}`}>
                    <div className="p-3 bg-secondary/30 rounded-lg hover:bg-primary/10 transition-all border border-border hover:border-primary/50">
                      <div className="flex items-center justify-between">
                        <span className="text-foreground font-medium">{tech.name}</span>
                        <Badge 
                          variant="outline" 
                          className={categoryColors[tech.category as keyof typeof categoryColors]}
                        >
                          {tech.category}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Community Contribution */}
      <Card className="glass-card border-tech">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Edit className="size-5 text-primary" />
              커뮤니티 기여
            </CardTitle>
            {!showEditForm && (
              <Button variant="outline" onClick={() => setShowEditForm(true)} className="relative z-10">
                수정 제안하기
              </Button>
            )}
          </div>
        </CardHeader>
        {showEditForm ? (
          <CardContent className="space-y-4">
            <p className="text-muted-foreground font-medium">
              이 기술에 대한 정보를 개선하는데 도움을 주세요. 제안하신 내용은 검토 후 반영됩니다.
            </p>

            <div className="space-y-2">
              <Label htmlFor="proposedSummary" className="text-foreground font-semibold">개요 수정 제안</Label>
              <Textarea
                id="proposedSummary"
                placeholder="더 나은 개요를 제안해주세요..."
                value={editForm.proposedSummary}
                onChange={(e) => setEditForm({ ...editForm, proposedSummary: e.target.value })}
                rows={4}
                className="bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="proposedLearningTips" className="text-foreground font-semibold">학습 팁 수정 제안</Label>
              <Textarea
                id="proposedLearningTips"
                placeholder="더 나은 학습 팁을 제안해주세요..."
                value={editForm.proposedLearningTips}
                onChange={(e) => setEditForm({ ...editForm, proposedLearningTips: e.target.value })}
                rows={4}
                className="bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="proposedPrerequisites" className="text-foreground font-semibold">선행 학습 수정 제안</Label>
              <Input
                id="proposedPrerequisites"
                placeholder="쉼표로 구분하여 입력 (예: Docker, Linux, 네트워킹)"
                value={editForm.proposedPrerequisites}
                onChange={(e) => setEditForm({ ...editForm, proposedPrerequisites: e.target.value })}
                className="bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={handleSubmitEdit} className="relative z-10">
                제출하기
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowEditForm(false);
                  setEditForm({
                    proposedSummary: '',
                    proposedLearningTips: '',
                    proposedPrerequisites: ''
                  });
                }}
                className="relative z-10"
              >
                취소
              </Button>
            </div>
          </CardContent>
        ) : (
          <CardContent>
            <p className="text-muted-foreground font-medium">
              이 기술에 대한 정보가 부정확하거나 개선이 필요하다면 수정을 제안해주세요.
            </p>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
