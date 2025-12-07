/**
 * 피드백 제출 모달 컴포넌트 (v2)
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Star, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { feedbackApi } from '../../src/lib/api/feedback';
import type { FeedbackType, LearningStep } from '../../src/lib/api/types';

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  learningPlanId: number;
  steps?: LearningStep[];
  onSuccess?: () => void;
}

const feedbackTypeLabels: Record<FeedbackType, string> = {
  HELPFUL: '도움이 됨',
  TOO_EASY: '너무 쉬움',
  TOO_HARD: '너무 어려움',
  IRRELEVANT: '관련 없는 내용',
  TIME_ISSUE: '시간 예측 부정확',
  RESOURCE_ISSUE: '리소스 품질 문제',
  GENERAL: '일반 피드백',
};

const feedbackTypeDescriptions: Record<FeedbackType, string> = {
  HELPFUL: '학습에 도움이 되었습니다',
  TOO_EASY: '난이도가 낮아 조정이 필요합니다',
  TOO_HARD: '난이도가 높아 선행 지식 보강이 필요합니다',
  IRRELEVANT: '학습 목표와 관련 없는 내용이 포함되어 있습니다',
  TIME_ISSUE: '예상 학습 시간이 실제와 맞지 않습니다',
  RESOURCE_ISSUE: '추천된 학습 자료에 문제가 있습니다',
  GENERAL: '기타 의견을 남깁니다',
};

export function FeedbackModal({
  open,
  onOpenChange,
  learningPlanId,
  steps = [],
  onSuccess,
}: FeedbackModalProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('GENERAL');
  const [selectedStepId, setSelectedStepId] = useState<string>('all');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setRating(0);
    setHoveredRating(0);
    setFeedbackType('GENERAL');
    setSelectedStepId('all');
    setComment('');
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('평점을 선택해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await feedbackApi.submitFeedback({
        learningPlanId,
        stepId: selectedStepId !== 'all' ? Number(selectedStepId) : undefined,
        rating,
        feedbackType,
        comment: comment.trim() || undefined,
      });

      if (response.success) {
        toast.success('피드백이 제출되었습니다. 감사합니다!');
        resetForm();
        onOpenChange(false);
        onSuccess?.();
      }
    } catch (error: any) {
      toast.error(error.message || '피드백 제출에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>피드백 남기기</DialogTitle>
          <DialogDescription>
            학습 플랜에 대한 의견을 남겨주세요. 더 나은 학습 경험을 만드는 데
            도움이 됩니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Step Selection */}
          {steps.length > 0 && (
            <div className="space-y-2">
              <Label>피드백 대상</Label>
              <Select value={selectedStepId} onValueChange={setSelectedStepId}>
                <SelectTrigger>
                  <SelectValue placeholder="피드백 대상 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 학습 플랜</SelectItem>
                  {steps.map((step) => (
                    <SelectItem key={step.stepId} value={String(step.stepId)}>
                      Step {step.order}: {step.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Star Rating */}
          <div className="space-y-2">
            <Label>평점 *</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`size-8 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-muted-foreground">
                {rating > 0 && `${rating}점`}
              </span>
            </div>
          </div>

          {/* Feedback Type */}
          <div className="space-y-3">
            <Label>피드백 유형 *</Label>
            <RadioGroup
              value={feedbackType}
              onValueChange={(value) => setFeedbackType(value as FeedbackType)}
              className="grid grid-cols-2 gap-2"
            >
              {(Object.keys(feedbackTypeLabels) as FeedbackType[]).map(
                (type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <RadioGroupItem value={type} id={type} />
                    <Label
                      htmlFor={type}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {feedbackTypeLabels[type]}
                    </Label>
                  </div>
                )
              )}
            </RadioGroup>
            <p className="text-xs text-muted-foreground">
              {feedbackTypeDescriptions[feedbackType]}
            </p>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">추가 의견 (선택)</Label>
            <Textarea
              id="comment"
              placeholder="구체적인 피드백을 남겨주세요..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground text-right">
              {comment.length}/1000
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || rating === 0}>
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                제출 중...
              </>
            ) : (
              '피드백 제출'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
