import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { MessageCircle, Star } from 'lucide-react';
import { feedbackApi } from '../../src/lib/api/feedback';
import { Feedback, FeedbackType } from '../../src/lib/api/types';
import { LiquidHighlight, useFluidHighlight } from '../ui/fluid-highlight';
import { cn } from '../ui/utils';

interface FeedbackListProps {
  planId: string;
  refreshTrigger: number;
}

const feedbackTypeColors: Record<FeedbackType, string> = {
  STRENGTH: 'bg-green-50 text-green-700 border-green-200',
  WEAKNESS: 'bg-red-50 text-red-700 border-red-200',
  IMPROVEMENT: 'bg-blue-50 text-blue-700 border-blue-200',
  GENERAL: 'bg-gray-50 text-gray-700 border-gray-200',
};

const feedbackTypeLabels: Record<FeedbackType, string> = {
  STRENGTH: '강점',
  WEAKNESS: '약점',
  IMPROVEMENT: '개선점',
  GENERAL: '일반',
};

export function FeedbackList({ planId, refreshTrigger }: FeedbackListProps) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

  useEffect(() => {
    const loadFeedbacks = async () => {
      try {
        const response = await feedbackApi.getPlanFeedbacks(planId);
        if (response.success && response.data) {
          setFeedbacks(response.data);
        }
      } catch (error) {
        console.error('Failed to load feedbacks:', error);
      }
    };

    loadFeedbacks();
  }, [planId, refreshTrigger]);

  const planFeedbacks = feedbacks.filter((f) => !f.stepId);
  const stepFeedbacks = feedbacks.filter((f) => f.stepId);

  return (
    <Card className="glass-card border-tech">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <MessageCircle className="size-5 text-primary" />
          피드백 목록 ({feedbacks.length}건)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Plan-level feedbacks */}
        {planFeedbacks.length > 0 && (
          <FeedbackGroup 
            title="전체 플랜 피드백" 
            feedbacks={planFeedbacks} 
          />
        )}

        {/* Step-level feedbacks */}
        {stepFeedbacks.length > 0 && (
          <FeedbackGroup 
            title="단계별 피드백" 
            feedbacks={stepFeedbacks} 
            showStep 
          />
        )}
      </CardContent>
    </Card>
  );
}

function FeedbackGroup({ 
  title, 
  feedbacks, 
  showStep = false 
}: { 
  title: string; 
  feedbacks: Feedback[]; 
  showStep?: boolean; 
}) {
  const { 
    containerRef, 
    highlightStyle, 
    handleMouseEnter, 
    handleMouseLeave 
  } = useFluidHighlight<HTMLDivElement>();

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground">
        {title}
      </h3>
      <div 
        ref={containerRef}
        onMouseLeave={handleMouseLeave}
        className="space-y-3 relative"
      >
        <LiquidHighlight style={highlightStyle} />
        
        {feedbacks.map((feedback) => (
          <div 
            key={feedback.id} 
            onMouseEnter={handleMouseEnter}
            className="relative z-10"
          >
            <FeedbackItem feedback={feedback} showStep={showStep} />
          </div>
        ))}
      </div>
    </div>
  );
}

function FeedbackItem({
  feedback,
  showStep = false,
}: {
  feedback: Feedback;
  showStep?: boolean;
}) {
  return (
    <div className="p-4 rounded-lg border border-border/50 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`size-4 ${
                  star <= feedback.rating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <Badge
            variant="outline"
            className={feedbackTypeColors[feedback.feedbackType]}
          >
            {feedbackTypeLabels[feedback.feedbackType]}
          </Badge>
        </div>
        {showStep && feedback.stepId && (
          <Badge variant="secondary">Step {feedback.stepId}</Badge>
        )}
      </div>
      {feedback.comment && (
        <p className="text-muted-foreground text-sm">{feedback.comment}</p>
      )}
    </div>
  );
}
