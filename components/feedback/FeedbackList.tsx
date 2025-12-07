/**
 * 피드백 목록 컴포넌트 (v2)
 */

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Star, MessageCircle, Loader2 } from 'lucide-react';
import { feedbackApi } from '../../src/lib/api/feedback';
import type { Feedback, FeedbackType } from '../../src/lib/api/types';

interface FeedbackListProps {
  planId: number;
  refreshTrigger?: number;
}

const feedbackTypeLabels: Record<FeedbackType, string> = {
  HELPFUL: '도움이 됨',
  TOO_EASY: '너무 쉬움',
  TOO_HARD: '너무 어려움',
  IRRELEVANT: '관련 없음',
  TIME_ISSUE: '시간 문제',
  RESOURCE_ISSUE: '리소스 문제',
  GENERAL: '일반',
};

const feedbackTypeColors: Record<FeedbackType, string> = {
  HELPFUL: 'bg-green-100 text-green-700 border-green-200',
  TOO_EASY: 'bg-blue-100 text-blue-700 border-blue-200',
  TOO_HARD: 'bg-red-100 text-red-700 border-red-200',
  IRRELEVANT: 'bg-gray-100 text-gray-700 border-gray-200',
  TIME_ISSUE: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  RESOURCE_ISSUE: 'bg-orange-100 text-orange-700 border-orange-200',
  GENERAL: 'bg-purple-100 text-purple-700 border-purple-200',
};

export function FeedbackList({ planId, refreshTrigger }: FeedbackListProps) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        setLoading(true);
        const response = await feedbackApi.getFeedbacksByPlan(planId);
        if (response.success) {
          setFeedbacks(response.data);
          setError(null);
        }
      } catch (err: any) {
        setError('피드백을 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, [planId, refreshTrigger]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`size-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <Card className="glass-card border-tech">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="size-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="glass-card border-tech">
        <CardContent className="py-6">
          <p className="text-muted-foreground text-center">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (feedbacks.length === 0) {
    return (
      <Card className="glass-card border-tech">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <MessageCircle className="size-5 text-primary" />
            피드백 목록
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center">
            아직 피드백이 없습니다. 첫 번째 피드백을 남겨보세요!
          </p>
        </CardContent>
      </Card>
    );
  }

  // Group feedbacks by step
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
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground">
              전체 플랜 피드백
            </h3>
            <div className="space-y-3">
              {planFeedbacks.map((feedback) => (
                <FeedbackItem key={feedback.id} feedback={feedback} />
              ))}
            </div>
          </div>
        )}

        {/* Step-level feedbacks */}
        {stepFeedbacks.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground">
              단계별 피드백
            </h3>
            <div className="space-y-3">
              {stepFeedbacks.map((feedback) => (
                <FeedbackItem key={feedback.id} feedback={feedback} showStep />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
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
    <div className="p-4 bg-secondary/30 rounded-lg border border-border">
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
