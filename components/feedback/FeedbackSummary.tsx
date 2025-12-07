/**
 * 피드백 요약 컴포넌트 (v2)
 */

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Star, MessageSquare, TrendingUp, Loader2 } from 'lucide-react';
import { feedbackApi } from '../../src/lib/api/feedback';
import type { FeedbackSummary as FeedbackSummaryType, FeedbackType } from '../../src/lib/api/types';

interface FeedbackSummaryProps {
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
  HELPFUL: 'bg-green-100 text-green-700',
  TOO_EASY: 'bg-blue-100 text-blue-700',
  TOO_HARD: 'bg-red-100 text-red-700',
  IRRELEVANT: 'bg-gray-100 text-gray-700',
  TIME_ISSUE: 'bg-yellow-100 text-yellow-700',
  RESOURCE_ISSUE: 'bg-orange-100 text-orange-700',
  GENERAL: 'bg-purple-100 text-purple-700',
};

export function FeedbackSummaryCard({ planId, refreshTrigger }: FeedbackSummaryProps) {
  const [summary, setSummary] = useState<FeedbackSummaryType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const response = await feedbackApi.getFeedbackSummary(planId);
        if (response.success) {
          setSummary(response.data);
          setError(null);
        }
      } catch (err: any) {
        setError('피드백 요약을 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [planId, refreshTrigger]);

  if (loading) {
    return (
      <Card className="glass-card border-tech">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="size-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error || !summary) {
    return null;
  }

  if (summary.totalFeedbackCount === 0) {
    return null;
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`size-5 ${
              star <= Math.round(rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const sortedTypes = Object.entries(summary.typeBreakdown)
    .filter(([_, count]) => count > 0)
    .sort(([, a], [, b]) => b - a);

  return (
    <Card className="glass-card border-tech">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <MessageSquare className="size-5 text-primary" />
          피드백 요약
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Average Rating */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">평균 평점</p>
            <div className="flex items-center gap-2">
              {renderStars(summary.averageRating)}
              <span className="text-2xl font-bold text-foreground">
                {summary.averageRating.toFixed(1)}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">총 피드백</p>
            <p className="text-2xl font-bold text-foreground">
              {summary.totalFeedbackCount}
            </p>
          </div>
        </div>

        {/* Type Breakdown */}
        {sortedTypes.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <TrendingUp className="size-4" />
              피드백 유형 분포
            </p>
            <div className="space-y-2">
              {sortedTypes.map(([type, count]) => {
                const percentage = Math.round(
                  (count / summary.totalFeedbackCount) * 100
                );
                return (
                  <div key={type} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <Badge
                        variant="secondary"
                        className={feedbackTypeColors[type as FeedbackType]}
                      >
                        {feedbackTypeLabels[type as FeedbackType]}
                      </Badge>
                      <span className="text-muted-foreground">
                        {count}건 ({percentage}%)
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
